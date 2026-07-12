import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type MapViewProps,
  type Region,
} from "react-native-maps";

import { supabase } from "@/src/lib/supabase";
import { colors, radius, shadows, spacing, typography } from "@/src/theme";

type EventMarkerRow = {
  id: string;
  title: string;
  starts_at: string;
  location_name: string | null;
  latitude: number;
  longitude: number;
};
type LatLng = { latitude: number; longitude: number };

type ActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress?: () => void;
};

const THESSALONIKI: LatLng = { latitude: 40.6401, longitude: 22.9444 };
const DEFAULT_DELTA = { latitudeDelta: 0.075, longitudeDelta: 0.075 };
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TAB_BAR_HEIGHT = 82;
const TAB_BAR_BOTTOM_GAP = spacing.md;
const FLOATING_GAP = spacing.sm;

const androidNoxaMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0A0C0F" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#737984" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#090B0E" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1B2028" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#0A0C0F" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#111419" }],
  },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#111419" }],
  },
  { featureType: "poi.school", stylers: [{ visibility: "off" }] },
  { featureType: "poi.shopping_mall", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] },
  { featureType: "poi.tourist_attraction", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#242830" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#2C313A" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#343943" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#1D222A" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#070A0E" }],
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

export default function LiveMapScreen() {
  const params = useLocalSearchParams<{
    focusEventId?: string;
    mapMode?: string;
  }>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [events, setEvents] = useState<EventMarkerRow[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventMarkerRow | null>(
    null,
  );
  const focusEventId =
    typeof params.focusEventId === "string" &&
    uuidPattern.test(params.focusEventId)
      ? params.focusEventId
      : null;

  const initialRegion = useMemo(() => pointRegion(THESSALONIKI), []);

  const animateTo = useCallback(
    (region: Region) => mapRef.current?.animateToRegion(region, 550),
    [],
  );

  const loadDriverLocation = useCallback(async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      setPermissionDenied(true);
      return null;
    }
    setPermissionDenied(false);
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const point = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    setDriverLocation(point);
    return point;
  }, []);

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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      void (async () => {
        const [point, rows] = await Promise.all([
          loadDriverLocation().catch(() => null),
          loadEvents(),
        ]);
        if (!isActive) return;
        const focused = focusEventId
          ? (rows.find((event) => event.id === focusEventId) ?? null)
          : null;
        if (focused) {
          setSelectedEvent(focused);
          animateTo(eventRegion(focused));
          return;
        }
        if (point) animateTo(pointRegion(point));
        else if (rows[0]) animateTo(eventRegion(rows[0]));
        else animateTo(pointRegion(THESSALONIKI));
      })();
      return () => {
        isActive = false;
      };
    }, [animateTo, focusEventId, loadDriverLocation, loadEvents]),
  );

  useEffect(() => {
    if (!focusEventId || events.length === 0) return;
    const focused = events.find((event) => event.id === focusEventId);
    if (focused) {
      setSelectedEvent(focused);
      animateTo(eventRegion(focused));
    }
  }, [animateTo, events, focusEventId]);

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
    animateTo(point ? pointRegion(point) : pointRegion(THESSALONIKI));
  }, [animateTo, driverLocation, loadDriverLocation]);

  const headerTop = insets.top + spacing.sm;
  const headerBottom = headerTop + 52;
  const eventCardBottom =
    insets.bottom + TAB_BAR_BOTTOM_GAP + TAB_BAR_HEIGHT + FLOATING_GAP;
  const controlBottom = eventCardBottom + (selectedEvent ? 188 : spacing.md);

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
      >
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

        {permissionDenied ? (
          <View
            pointerEvents="none"
            style={[styles.locationNotice, { top: headerBottom + spacing.sm }]}
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

        {selectedEvent ? (
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
});
