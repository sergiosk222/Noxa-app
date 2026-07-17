import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
  Platform,
  Switch,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  type MapViewProps,
  type Region,
} from "react-native-maps";

import { supabase } from "@/src/lib/supabase";
import { colors, radius, shadows, spacing, typography } from "@/src/theme";

type ProfileMarkerRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};
type ActiveDriverRow = {
  user_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  profiles: ProfileMarkerRow | ProfileMarkerRow[] | null;
};
type ActiveDriver = {
  user_id: string;
  latitude: number;
  longitude: number;
  profile: ProfileMarkerRow | null;
};

type EventMarkerRow = {
  id: string;
  title: string;
  starts_at: string;
  location_name: string | null;
  latitude: number;
  longitude: number;
};
type LatLng = { latitude: number; longitude: number };
type PresenceLocationPayload = {
  latitude: number;
  longitude: number;
  visibility_mode: "Global";
  share_expires_at: string;
  heading: number | null;
  speed_mps: number | null;
  accuracy_meters: number | null;
};
type RouteResult = {
  coordinates: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
};
type RouteStatus = "idle" | "loading" | "ready" | "error";

type ActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress?: () => void;
};

const THESSALONIKI: LatLng = { latitude: 40.6401, longitude: 22.9444 };
const DEFAULT_DELTA = { latitudeDelta: 0.075, longitudeDelta: 0.075 };
const ACTIVE_DRIVER_WINDOW_MS = 2 * 60 * 1000;
const DRIVER_LOCATION_MIN_WRITE_MS = 7000;
const DRIVER_PRESENCE_HEARTBEAT_MS = 45 * 1000;
const DRIVER_PRESENCE_LEASE_MS = 90 * 1000;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let driverLocationsMapChannelSequence = 0;

const TAB_BAR_HEIGHT = 82;
const TAB_BAR_BOTTOM_GAP = spacing.md;
const FLOATING_GAP = spacing.sm;

const androidNoxaMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#07080A" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#737984" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#07080A" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1B2028" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#090A0D" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#090F0C" }],
  },
  {
    featureType: "poi",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#090F0C" }],
  },
  { featureType: "poi.school", stylers: [{ visibility: "off" }] },
  { featureType: "poi.shopping_mall", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] },
  { featureType: "poi.tourist_attraction", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#25272D" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#25272D" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#30323A" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#1B1D22" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#050A12" }],
  },
] satisfies MapViewProps["customMapStyle"];

function HeaderAction({
  icon,
  accessibilityLabel,
  onPress,
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.78}
      onPress={onPress}
      style={styles.headerAction}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
    </TouchableOpacity>
  );
}

function eventRegion(event: EventMarkerRow): Region {
  return {
    latitude: event.latitude,
    longitude: event.longitude,
    ...DEFAULT_DELTA,
  };
}
function pointRegion(point: LatLng): Region {
  return { ...point, ...DEFAULT_DELTA };
}

function formatEventTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time TBA";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function finiteOrNull(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function hasValidLatLng(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function normalizeActiveDriver(row: ActiveDriverRow): ActiveDriver | null {
  if (!hasValidLatLng(row.latitude, row.longitude)) return null;
  const profile = Array.isArray(row.profiles)
    ? (row.profiles[0] ?? null)
    : row.profiles;
  return {
    user_id: row.user_id,
    latitude: row.latitude,
    longitude: row.longitude,
    profile,
  };
}

function driverLabel(driver: ActiveDriver) {
  return (
    driver.profile?.display_name?.trim() ||
    driver.profile?.username?.trim() ||
    "NOXA driver"
  );
}

function hasValidCoordinates(
  event: EventMarkerRow | null,
): event is EventMarkerRow {
  return Boolean(
    event &&
    Number.isFinite(event.latitude) &&
    Number.isFinite(event.longitude) &&
    event.latitude >= -90 &&
    event.latitude <= 90 &&
    event.longitude >= -180 &&
    event.longitude <= 180,
  );
}

function createDriverLocationsMapTopic() {
  driverLocationsMapChannelSequence += 1;
  return `driver-locations-map:${Date.now()}:${driverLocationsMapChannelSequence}`;
}

function formatDistance(meters: number) {
  if (!Number.isFinite(meters)) return "—";
  if (meters < 1000) return `${Math.max(0, Math.round(meters))} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds)) return "—";
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hr ${String(minutes).padStart(2, "0")} min`;
}

function EventCard({
  event,
  bottomOffset,
}: {
  event: EventMarkerRow;
  bottomOffset: number;
}) {
  return (
    <View style={[styles.eventCard, { bottom: bottomOffset }]}>
      <Text style={styles.cardKicker}>Upcoming event</Text>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.cardSubtitle}>
        {formatEventTime(event.starts_at)}
      </Text>
      <Text style={styles.cardLocation} numberOfLines={1}>
        {event.location_name ?? "Exact location selected"}
      </Text>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() =>
          router.push({ pathname: "/event-details", params: { id: event.id } })
        }
        style={styles.eventButton}
      >
        <Text style={styles.eventButtonText}>View Event</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

function driverInitials(driver: ActiveDriver) {
  const label = driverLabel(driver);
  const initials = label
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || null;
}

function DriverMarker({ driver }: { driver: ActiveDriver }) {
  const label = driverLabel(driver);
  const [imageFailed, setImageFailed] = useState(false);
  const [tracksViewChanges, setTracksViewChanges] = useState(
    Boolean(driver.profile?.avatar_url),
  );
  const avatarUrl = imageFailed ? null : driver.profile?.avatar_url;
  const initials = driverInitials(driver);

  return (
    <Marker
      coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
      accessibilityLabel={`${label} is visible on the NOXA map`}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={tracksViewChanges}
      onPress={() =>
        router.push({
          pathname: "/driver-profile/[id]",
          params: { id: driver.user_id },
        })
      }
      title={label}
    >
      <View style={styles.driverMarkerWrap}>
        <View style={styles.driverMarker}>
          {avatarUrl ? (
            <Image
              accessibilityIgnoresInvertColors
              source={{ uri: avatarUrl }}
              onLoadEnd={() => setTracksViewChanges(false)}
              onError={() => {
                setImageFailed(true);
                setTracksViewChanges(false);
              }}
              style={styles.driverMarkerImage}
            />
          ) : initials ? (
            <Text style={styles.driverMarkerInitials}>{initials}</Text>
          ) : (
            <Ionicons name="person" size={19} color={colors.text} />
          )}
          <View style={styles.driverMarkerStatus} />
        </View>
        <View style={styles.driverMarkerTail} />
      </View>
    </Marker>
  );
}

function RouteCard({
  event,
  route,
  status,
  message,
  bottomOffset,
  onClose,
  onRetry,
}: {
  event: EventMarkerRow;
  route: RouteResult | null;
  status: RouteStatus;
  message: string | null;
  bottomOffset: number;
  onClose: () => void;
  onRetry: () => void;
}) {
  const loading = status === "loading";
  return (
    <View style={[styles.routeCard, { bottom: bottomOffset }]}>
      <View style={styles.routeHeader}>
        <View style={styles.routeTitleWrap}>
          <Text style={styles.cardKicker}>NOXA route</Text>
          <Text style={styles.routeTitle} numberOfLines={1}>
            {event.title}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityLabel="Exit route mode"
          activeOpacity={0.78}
          onPress={onClose}
          style={styles.routeCloseButton}
        >
          <Ionicons name="close" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.routeStatusRow}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.routeStatusText}>Building road route…</Text>
        </View>
      ) : route ? (
        <View style={styles.routeMetrics}>
          <Text style={styles.routeMetric}>
            {formatDistance(route.distanceMeters)}
          </Text>
          <Text style={styles.routeMetricMuted}>•</Text>
          <Text style={styles.routeMetric}>
            ~{formatDuration(route.durationSeconds)}
          </Text>
        </View>
      ) : (
        <Text style={styles.routeStatusText}>
          {message ?? "Route unavailable. Keep exploring the NOXA map."}
        </Text>
      )}
      {status === "error" ? (
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={onRetry}
          style={styles.routeRetryButton}
        >
          <Text style={styles.routeRetryText}>Retry route</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function LiveMapScreen() {
  const params = useLocalSearchParams<{
    focusEventId?: string | string[];
    mapMode?: string | string[];
  }>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [events, setEvents] = useState<EventMarkerRow[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventMarkerRow | null>(
    null,
  );
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>("idle");
  const [routeMessage, setRouteMessage] = useState<string | null>(null);
  const routeRequestKeyRef = useRef<string | null>(null);
  const routeRequestIdRef = useRef(0);
  const locationWatcherRef = useRef<Location.LocationSubscription | null>(null);
  const watcherSetupIdRef = useRef(0);
  const lastHeadingRef = useRef<number | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const isMountedRef = useRef(true);
  const isAppForegroundRef = useRef(AppState.currentState === "active");
  const sharingUserIdRef = useRef<string | null>(null);
  const latestPresencePayloadRef = useRef<PresenceLocationPayload | null>(null);
  const lastPresenceWriteRef = useRef(0);
  const presenceWriteQueueRef = useRef(Promise.resolve());
  const activeDriversRequestIdRef = useRef(0);
  const activeDriversRefreshInFlightRef = useRef(false);
  const activeDriversRefreshQueuedRef = useRef(false);
  const [isVisibleOnMap, setIsVisibleOnMap] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [driverRefreshError, setDriverRefreshError] = useState(false);
  const [isRouteFollowing, setIsRouteFollowing] = useState(false);
  const isRouteFollowingRef = useRef(false);
  const [sharingError, setSharingError] = useState<string | null>(null);
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([]);
  const normalizedFocusEventId = normalizeParam(params.focusEventId);
  const normalizedMapMode = normalizeParam(params.mapMode);
  const focusEventId =
    typeof normalizedFocusEventId === "string" &&
    uuidPattern.test(normalizedFocusEventId)
      ? normalizedFocusEventId
      : null;
  const isRouteMode = normalizedMapMode === "route" && Boolean(focusEventId);
  const onlineCount = activeDrivers.length;
  const markerDrivers = activeDrivers.filter(
    (driver) => driver.user_id !== currentUserId,
  );
  const shouldRenderRoute =
    isRouteMode &&
    routeStatus === "ready" &&
    route !== null &&
    route.coordinates.filter((point) =>
      hasValidLatLng(point.latitude, point.longitude),
    ).length >= 2;

  const initialRegion = useMemo(() => pointRegion(THESSALONIKI), []);

  const animateTo = useCallback(
    (region: Region) => mapRef.current?.animateToRegion(region, 550),
    [],
  );

  const setRouteFollowing = useCallback((enabled: boolean) => {
    isRouteFollowingRef.current = enabled;
    setIsRouteFollowing(enabled);
  }, []);

  const animateNavigationCamera = useCallback(
    (point: LatLng, heading?: number | null) => {
      mapRef.current?.animateCamera(
        {
          center: point,
          heading: heading ?? 0,
          pitch: 54,
          zoom: 17,
        },
        { duration: 650 },
      );
    },
    [],
  );

  const fitRouteToMap = useCallback(
    (coordinates: LatLng[], destination: LatLng) => {
      const points = driverLocation
        ? [driverLocation, ...coordinates, destination]
        : [...coordinates, destination];
      if (points.length < 2) return;
      mapRef.current?.fitToCoordinates(points, {
        animated: true,
        edgePadding: {
          top: insets.top + 96,
          right: spacing.xl,
          bottom: insets.bottom + TAB_BAR_HEIGHT + 190,
          left: spacing.xl,
        },
      });
    },
    [driverLocation, insets.bottom, insets.top],
  );

  const clearPresenceHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const deletePresence = useCallback(async (userId?: string | null) => {
    const id = userId ?? sharingUserIdRef.current;
    if (!id) return;
    await supabase.from("driver_locations").delete().eq("user_id", id);
  }, []);

  const stopSharing = useCallback(
    async (deleteRow = true) => {
      locationWatcherRef.current?.remove();
      locationWatcherRef.current = null;
      clearPresenceHeartbeat();
      lastPresenceWriteRef.current = 0;
      latestPresencePayloadRef.current = null;
      const userId = sharingUserIdRef.current;
      sharingUserIdRef.current = null;
      if (isMountedRef.current) {
        setIsVisibleOnMap(false);
        setSharingError(null);
      }
      if (deleteRow && userId) {
        await deletePresence(userId).catch(() => undefined);
      }
    },
    [clearPresenceHeartbeat, deletePresence],
  );

  const writePresencePayload = useCallback(
    (userId: string, payload: PresenceLocationPayload, force = false) => {
      const nowMs = Date.now();
      if (
        !force &&
        nowMs - lastPresenceWriteRef.current < DRIVER_LOCATION_MIN_WRITE_MS
      )
        return presenceWriteQueueRef.current;

      lastPresenceWriteRef.current = nowMs;
      const write = presenceWriteQueueRef.current.then(async () => {
        if (!isMountedRef.current || sharingUserIdRef.current !== userId)
          return;
        const { error } = await supabase.from("driver_locations").upsert(
          {
            user_id: userId,
            ...payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        if (error) {
          lastPresenceWriteRef.current = 0;
          if (isMountedRef.current)
            setSharingError("Could not update visibility. Retrying soon.");
          return;
        }
        if (isMountedRef.current) setSharingError(null);
      });
      presenceWriteQueueRef.current = write.catch(() => undefined);
      return presenceWriteQueueRef.current;
    },
    [],
  );

  const upsertPresence = useCallback(
    (userId: string, coords: Location.LocationObjectCoords) => {
      const latitude = finiteOrNull(coords.latitude);
      const longitude = finiteOrNull(coords.longitude);
      if (
        latitude === null ||
        longitude === null ||
        !hasValidLatLng(latitude, longitude)
      )
        return;
      const heading = finiteOrNull(coords.heading);
      const speed = finiteOrNull(coords.speed);
      const accuracy = finiteOrNull(coords.accuracy);
      const payload: PresenceLocationPayload = {
        latitude,
        longitude,
        heading:
          heading !== null && heading >= 0 && heading < 360 ? heading : null,
        speed_mps: speed !== null && speed >= 0 ? speed : null,
        accuracy_meters: accuracy !== null && accuracy >= 0 ? accuracy : null,
        visibility_mode: "Global",
        share_expires_at: new Date(
          Date.now() + DRIVER_PRESENCE_LEASE_MS,
        ).toISOString(),
      };
      latestPresencePayloadRef.current = payload;
      void writePresencePayload(userId, payload);
    },
    [writePresencePayload],
  );

  const startPresenceHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) return;
    if (
      !isAppForegroundRef.current ||
      !sharingUserIdRef.current ||
      !latestPresencePayloadRef.current
    )
      return;
    heartbeatIntervalRef.current = setInterval(() => {
      const userId = sharingUserIdRef.current;
      const payload = latestPresencePayloadRef.current;
      if (!isAppForegroundRef.current || !userId || !payload) return;
      void writePresencePayload(userId, payload, true);
    }, DRIVER_PRESENCE_HEARTBEAT_MS);
  }, [writePresencePayload]);

  const handlePosition = useCallback(
    (position: Location.LocationObject) => {
      const { coords } = position;
      if (!hasValidLatLng(coords.latitude, coords.longitude)) return;
      const heading = finiteOrNull(coords.heading);
      const validHeading = heading !== null && heading >= 0 && heading <= 360;
      if (validHeading) lastHeadingRef.current = heading;
      const point = { latitude: coords.latitude, longitude: coords.longitude };
      setDriverLocation(point);
      const userId = sharingUserIdRef.current;
      if (userId) upsertPresence(userId, coords);
      if (isRouteFollowingRef.current) {
        animateNavigationCamera(
          point,
          validHeading ? heading : lastHeadingRef.current,
        );
      }
    },
    [animateNavigationCamera, upsertPresence],
  );

  const ensureForegroundWatcher = useCallback(async () => {
    const setupId = watcherSetupIdRef.current + 1;
    watcherSetupIdRef.current = setupId;
    locationWatcherRef.current?.remove();
    locationWatcherRef.current = null;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (watcherSetupIdRef.current !== setupId || !isMountedRef.current)
        return null;
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setPermissionDenied(true);
        setSharingError(
          (current) =>
            current ??
            "Allow location access so your selected audience can see you on the NOXA map.",
        );
        return null;
      }
      setPermissionDenied(false);
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (watcherSetupIdRef.current !== setupId || !isMountedRef.current)
        return null;
      handlePosition(current);
      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2500,
          distanceInterval: 5,
        },
        handlePosition,
      );
      if (watcherSetupIdRef.current !== setupId || !isMountedRef.current) {
        watcher.remove();
        return null;
      }
      locationWatcherRef.current = watcher;
      return {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
    } catch (error) {
      console.warn("NOXA location watcher failed", error);
      if (isMountedRef.current) {
        setPermissionDenied(true);
        setSharingError("Could not start location sharing.");
      }
      return null;
    }
  }, [handlePosition]);

  const loadDriverLocation = useCallback(async () => {
    if (driverLocation) return driverLocation;
    return ensureForegroundWatcher();
  }, [driverLocation, ensureForegroundWatcher]);

  const loadEvents = useCallback(async () => {
    const { data } = await supabase
      .from("events")
      .select("id,title,starts_at,location_name,latitude,longitude")
      .eq("status", "scheduled")
      .gte("starts_at", new Date().toISOString())
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("starts_at", { ascending: true });
    const rows = (
      (data ?? []) as (
        | EventMarkerRow
        | (Omit<EventMarkerRow, "latitude" | "longitude"> & {
            latitude: number | null;
            longitude: number | null;
          })
      )[]
    ).filter(
      (event): event is EventMarkerRow =>
        typeof event.latitude === "number" &&
        typeof event.longitude === "number",
    );
    setEvents(rows);
    return rows;
  }, []);

  const refreshActiveDrivers = useCallback(async () => {
    if (activeDriversRefreshInFlightRef.current) {
      activeDriversRefreshQueuedRef.current = true;
      return;
    }
    activeDriversRefreshInFlightRef.current = true;
    const requestId = activeDriversRequestIdRef.current + 1;
    activeDriversRequestIdRef.current = requestId;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      setCurrentUserId(userId ?? null);
      if (!userId) {
        if (isMountedRef.current) setActiveDrivers([]);
        return;
      }
      const now = new Date();
      const since = new Date(
        now.getTime() - ACTIVE_DRIVER_WINDOW_MS,
      ).toISOString();
      const { data, error } = await supabase
        .from("driver_locations")
        .select(
          "user_id,latitude,longitude,updated_at,profiles(id,display_name,username,avatar_url)",
        )
        .gte("updated_at", since)
        .gt("share_expires_at", now.toISOString())
        .neq("visibility_mode", "Ghost")
        .order("updated_at", { ascending: false });
      if (error) {
        console.warn("NOXA active drivers refresh failed", error.message);
        if (isMountedRef.current) setDriverRefreshError(true);
        return;
      }
      if (
        !isMountedRef.current ||
        activeDriversRequestIdRef.current !== requestId
      )
        return;
      const drivers = ((data ?? []) as ActiveDriverRow[])
        .map(normalizeActiveDriver)
        .filter((driver): driver is ActiveDriver => driver !== null);
      setActiveDrivers(drivers);
      setDriverRefreshError(false);
    } finally {
      activeDriversRefreshInFlightRef.current = false;
      if (activeDriversRefreshQueuedRef.current) {
        activeDriversRefreshQueuedRef.current = false;
        void refreshActiveDrivers();
      }
    }
  }, []);

  const startSharing = useCallback(async () => {
    setSharingError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    setCurrentUserId(userId ?? null);
    if (!userId) {
      setSharingError("Sign in to become visible on the map.");
      setIsVisibleOnMap(false);
      return;
    }
    try {
      sharingUserIdRef.current = userId;
      const point = await ensureForegroundWatcher();
      if (!point || sharingUserIdRef.current !== userId) {
        sharingUserIdRef.current = null;
        setIsVisibleOnMap(false);
        return;
      }
      if (latestPresencePayloadRef.current) {
        await writePresencePayload(
          userId,
          latestPresencePayloadRef.current,
          true,
        );
      }
      startPresenceHeartbeat();
      if (isMountedRef.current) {
        setIsVisibleOnMap(true);
        void refreshActiveDrivers();
      }
    } catch (error) {
      console.warn("NOXA sharing start failed", error);
      sharingUserIdRef.current = null;
      if (isMountedRef.current) {
        setIsVisibleOnMap(false);
        setSharingError("Could not start location sharing.");
      }
    }
  }, [
    ensureForegroundWatcher,
    refreshActiveDrivers,
    startPresenceHeartbeat,
    writePresencePayload,
  ]);

  const toggleVisibility = useCallback(
    (enabled: boolean) => {
      if (enabled) void startSharing();
      else void stopSharing(true).then(() => refreshActiveDrivers());
    },
    [refreshActiveDrivers, startSharing, stopSharing],
  );

  useEffect(() => {
    let isActive = true;
    isMountedRef.current = true;
    void refreshActiveDrivers();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isActive && (event === "SIGNED_OUT" || !session))
          void stopSharing(true);
      },
    );
    const channel = supabase.channel(createDriverLocationsMapTopic());
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "driver_locations" },
      () => {
        if (isActive) void refreshActiveDrivers();
      },
    );
    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR" && isActive && isMountedRef.current) {
        setSharingError(
          (current) => current ?? "Live driver updates are reconnecting.",
        );
      }
    });

    return () => {
      isActive = false;
      isMountedRef.current = false;
      activeDriversRequestIdRef.current += 1;
      locationWatcherRef.current?.remove();
      locationWatcherRef.current = null;
      clearPresenceHeartbeat();
      latestPresencePayloadRef.current = null;
      const userId = sharingUserIdRef.current;
      sharingUserIdRef.current = null;
      void deletePresence(userId).catch(() => undefined);
      void supabase.removeChannel(channel);
      authListener.subscription.unsubscribe();
    };
  }, [
    clearPresenceHeartbeat,
    deletePresence,
    refreshActiveDrivers,
    stopSharing,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      isAppForegroundRef.current = nextState === "active";
      if (nextState === "active") {
        void ensureForegroundWatcher();
        startPresenceHeartbeat();
      } else {
        void stopSharing(true);
        clearPresenceHeartbeat();
        watcherSetupIdRef.current += 1;
        locationWatcherRef.current?.remove();
        locationWatcherRef.current = null;
      }
    });
    return () => subscription.remove();
  }, [
    clearPresenceHeartbeat,
    ensureForegroundWatcher,
    startPresenceHeartbeat,
    stopSharing,
  ]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      void (async () => {
        const [point, rows] = await Promise.all([
          ensureForegroundWatcher().catch(() => null),
          loadEvents(),
        ]);
        if (!isActive) return;
        const focused = focusEventId
          ? (rows.find((event) => event.id === focusEventId) ?? null)
          : null;
        if (focused) {
          setSelectedEvent(focused);
          if (!isRouteMode) animateTo(eventRegion(focused));
          return;
        }
        if (point) animateTo(pointRegion(point));
        else if (rows[0]) animateTo(eventRegion(rows[0]));
        else animateTo(pointRegion(THESSALONIKI));
      })();
      return () => {
        isActive = false;
        void stopSharing(true);
        watcherSetupIdRef.current += 1;
        locationWatcherRef.current?.remove();
        locationWatcherRef.current = null;
      };
    }, [
      animateTo,
      ensureForegroundWatcher,
      focusEventId,
      isRouteMode,
      loadEvents,
      stopSharing,
    ]),
  );

  const clearRouteState = useCallback(
    (replaceRoute = true) => {
      routeRequestIdRef.current += 1;
      routeRequestKeyRef.current = null;
      setRoute(null);
      setRouteStatus("idle");
      setRouteMessage(null);
      setRouteFollowing(false);
      setSelectedEvent(null);
      if (replaceRoute) router.replace("/(tabs)");
    },
    [setRouteFollowing],
  );

  useEffect(() => {
    if (!focusEventId || events.length === 0) return;
    const focused = events.find((event) => event.id === focusEventId);
    if (focused) {
      setSelectedEvent(focused);
      if (!isRouteMode) animateTo(eventRegion(focused));
    }
  }, [animateTo, events, focusEventId, isRouteMode]);

  useEffect(() => {
    if (!isRouteMode || !focusEventId) clearRouteState(false);
  }, [clearRouteState, focusEventId, isRouteMode]);

  const requestRoute = useCallback(async () => {
    if (!isRouteMode || !focusEventId || !hasValidCoordinates(selectedEvent))
      return;
    if (!driverLocation) {
      setRoute(null);
      setRouteStatus("error");
      setRouteMessage(
        permissionDenied
          ? "Location permission is off. Enable location to route on NOXA."
          : "Current location is needed to build this route.",
      );
      return;
    }

    const requestKey = `${focusEventId}:${driverLocation.latitude.toFixed(5)},${driverLocation.longitude.toFixed(5)}:${selectedEvent.latitude.toFixed(5)},${selectedEvent.longitude.toFixed(5)}`;
    if (routeStatus === "loading" || routeRequestKeyRef.current === requestKey)
      return;

    const requestId = routeRequestIdRef.current + 1;
    routeRequestIdRef.current = requestId;
    routeRequestKeyRef.current = requestKey;
    setRoute(null);
    setRouteStatus("loading");
    setRouteMessage(null);

    const { data, error } = await supabase.functions.invoke<RouteResult>(
      "event-route",
      {
        body: {
          origin: driverLocation,
          destination: {
            latitude: selectedEvent.latitude,
            longitude: selectedEvent.longitude,
          },
        },
      },
    );

    if (routeRequestIdRef.current !== requestId) return;

    if (error || !data || data.coordinates.length < 2) {
      routeRequestKeyRef.current = null;
      setRoute(null);
      setRouteStatus("error");
      setRouteMessage(error?.message ?? "Route could not be built right now.");
      return;
    }

    setRoute(data);
    setRouteStatus("ready");
    setRouteFollowing(true);
    fitRouteToMap(data.coordinates, {
      latitude: selectedEvent.latitude,
      longitude: selectedEvent.longitude,
    });
  }, [
    driverLocation,
    fitRouteToMap,
    focusEventId,
    isRouteMode,
    permissionDenied,
    routeStatus,
    selectedEvent,
    setRouteFollowing,
  ]);

  useEffect(() => {
    void requestRoute();
  }, [requestRoute]);

  useEffect(() => {
    return () => {
      routeRequestIdRef.current += 1;
    };
  }, []);

  const closeRouteMode = useCallback(
    () => clearRouteState(true),
    [clearRouteState],
  );

  const retryRoute = useCallback(() => {
    routeRequestKeyRef.current = null;
    void requestRoute();
  }, [requestRoute]);

  const selectEvent = useCallback(
    (event: EventMarkerRow) => {
      setSelectedEvent(event);
      animateTo(eventRegion(event));
    },
    [animateTo],
  );

  const recenterMap = useCallback(async () => {
    const point =
      driverLocation ?? (await loadDriverLocation().catch(() => null));
    if (isRouteMode && point) {
      setRouteFollowing(true);
      animateNavigationCamera(point, lastHeadingRef.current);
      return;
    }
    animateTo(point ? pointRegion(point) : pointRegion(THESSALONIKI));
  }, [
    animateNavigationCamera,
    animateTo,
    driverLocation,
    isRouteMode,
    loadDriverLocation,
    setRouteFollowing,
  ]);

  const headerTop = insets.top + spacing.sm;
  const headerBottom = headerTop + 52;
  const eventCardBottom =
    insets.bottom + TAB_BAR_BOTTOM_GAP + TAB_BAR_HEIGHT + FLOATING_GAP;
  const routeCardBottom = eventCardBottom;
  const controlBottom =
    eventCardBottom +
    (isRouteMode && selectedEvent ? 168 : selectedEvent ? 188 : spacing.md);

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        userInterfaceStyle="dark"
        mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
        customMapStyle={
          Platform.OS === "android" ? androidNoxaMapStyle : undefined
        }
        showsUserLocation={Boolean(driverLocation)}
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        showsScale={false}
        showsCompass={false}
        toolbarEnabled={false}
        onPanDrag={() => {
          if (isRouteFollowingRef.current) setRouteFollowing(false);
        }}
      >
        {shouldRenderRoute ? (
          <>
            <Polyline
              coordinates={route.coordinates}
              strokeColor="rgba(31,6,8,0.78)"
              strokeWidth={9}
              lineCap="round"
              lineJoin="round"
            />
            <Polyline
              coordinates={route.coordinates}
              strokeColor={colors.primary}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
          </>
        ) : null}
        {markerDrivers.map((driver) => (
          <DriverMarker key={driver.user_id} driver={driver} />
        ))}
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            onPress={() => selectEvent(event)}
            title={event.title}
          >
            <View
              style={[
                styles.markerDot,
                selectedEvent?.id === event.id && styles.markerDotSelected,
              ]}
            >
              <Ionicons name="flag" size={14} color={colors.text} />
            </View>
          </Marker>
        ))}
      </MapView>

      <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>
        <View style={[styles.header, { top: headerTop }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>N</Text>
          </View>
          <View pointerEvents="none" style={styles.logoWrap}>
            <View style={styles.logoSpeedLine} />
            <Text style={styles.logo}>NOXA</Text>
          </View>
          <View style={styles.headerActions}>
            <HeaderAction
              icon="search-outline"
              accessibilityLabel="Search"
              onPress={() => router.push("/search")}
            />
            <HeaderAction
              icon="notifications-outline"
              accessibilityLabel="Notifications"
              onPress={() => router.push("/notifications")}
            />
          </View>
        </View>

        <View
          style={[styles.visibilityControl, { top: headerBottom + spacing.sm }]}
        >
          <View style={styles.visibilityCopy}>
            <Text style={styles.visibilityTitle}>Visible on Map</Text>
            <Text style={styles.visibilityText}>
              {onlineCount} online visible{" "}
              {onlineCount === 1 ? "driver" : "drivers"}.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Toggle temporary visibility on the NOXA map"
            value={isVisibleOnMap}
            onValueChange={toggleVisibility}
            trackColor={{
              false: "rgba(255,255,255,0.16)",
              true: "rgba(215,25,32,0.44)",
            }}
            thumbColor={isVisibleOnMap ? colors.text : "#737984"}
          />
        </View>

        <View
          pointerEvents="none"
          style={[styles.onlinePill, { top: headerBottom + 74 }]}
        >
          <Text style={styles.locationNoticeText}>
            {onlineCount} online •{" "}
            {isRouteFollowing ? "Route follow on" : "Live Map"}
          </Text>
        </View>

        {driverRefreshError ? (
          <View
            pointerEvents="none"
            style={[styles.sharingNotice, { top: headerBottom + 112 }]}
          >
            <Text style={styles.locationNoticeText}>
              Live drivers are reconnecting.
            </Text>
          </View>
        ) : null}

        {sharingError ? (
          <View
            pointerEvents="none"
            style={[
              styles.sharingNotice,
              { top: headerBottom + (driverRefreshError ? 150 : 112) },
            ]}
          >
            <Text style={styles.locationNoticeText}>{sharingError}</Text>
          </View>
        ) : null}

        {permissionDenied ? (
          <View
            pointerEvents="none"
            style={[
              styles.locationNotice,
              { top: headerBottom + (sharingError ? 156 : 112) },
            ]}
          >
            <Text style={styles.locationNoticeText}>
              Location off — centered on NOXA map.
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          accessibilityLabel="Recenter map"
          activeOpacity={0.78}
          onPress={recenterMap}
          style={[styles.recenterButton, { bottom: controlBottom }]}
        >
          <Ionicons name="locate" size={22} color={colors.text} />
        </TouchableOpacity>

        {selectedEvent && isRouteMode ? (
          <RouteCard
            event={selectedEvent}
            route={route}
            status={routeStatus}
            message={routeMessage}
            bottomOffset={routeCardBottom}
            onClose={closeRouteMode}
            onRetry={retryRoute}
          />
        ) : selectedEvent ? (
          <EventCard event={selectedEvent} bottomOffset={eventCardBottom} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: "hidden", backgroundColor: "#050608" },
  header: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    backgroundColor: "rgba(8,10,14,0.56)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "#141821",
  },
  avatarText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  logoWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  logoSpeedLine: {
    width: 44,
    height: 2,
    marginBottom: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.34)",
    backgroundColor: "rgba(255,36,36,0.96)",
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  logo: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 7.2,
  },
  headerActions: { flexDirection: "row", gap: spacing.sm },
  headerAction: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    backgroundColor: "#131720",
  },
  driverMarkerWrap: {
    alignItems: "center",
  },
  driverMarker: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#11151D",
    backgroundColor: "rgba(20,24,33,0.96)",
  },
  driverMarkerImage: {
    width: "100%",
    height: "100%",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
  driverMarkerInitials: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  driverMarkerStatus: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "#11151D",
    backgroundColor: colors.accent,
  },
  driverMarkerTail: {
    width: 10,
    height: 10,
    marginTop: -3,
    transform: [{ rotate: "45deg" }],
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,36,36,0.82)",
    backgroundColor: colors.accent,
  },
  markerDot: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: colors.accentDark,
  },
  markerDotSelected: {
    backgroundColor: "#D71920",
    transform: [{ scale: 1.08 }],
  },
  visibilityControl: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    backgroundColor: "rgba(10,12,16,0.88)",
  },
  visibilityCopy: { flex: 1 },
  visibilityTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  visibilityText: {
    marginTop: 1,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  onlinePill: {
    position: "absolute",
    alignSelf: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    backgroundColor: "rgba(10,12,16,0.78)",
  },
  sharingNotice: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(10,12,16,0.86)",
  },
  locationNotice: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(10,12,16,0.86)",
  },
  locationNoticeText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  recenterButton: {
    position: "absolute",
    right: spacing.lg,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(10,12,16,0.88)",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  eventCard: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
    backgroundColor: "rgba(10,12,16,0.9)",
    ...shadows.card,
  },
  cardKicker: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  cardTitle: {
    marginTop: 4,
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  cardSubtitle: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  cardLocation: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "600",
  },
  eventButton: {
    marginTop: spacing.sm,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,36,36,0.44)",
    backgroundColor: "#D71920",
  },
  eventButtonText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  routeCard: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: "rgba(255,36,36,0.24)",
    backgroundColor: "rgba(10,12,16,0.94)",
    ...shadows.card,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  routeTitleWrap: { flex: 1 },
  routeTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  routeCloseButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  routeStatusRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  routeStatusText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  routeMetrics: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  routeMetric: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  routeMetricMuted: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "900",
  },
  routeRetryButton: {
    marginTop: spacing.md,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,36,36,0.44)",
    backgroundColor: "rgba(215,25,32,0.18)",
  },
  routeRetryText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "900",
  },
});
