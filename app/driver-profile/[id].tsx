import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { NoxaButton, NoxaScreen } from "@/src/components/ui";
import { supabase } from "@/src/lib/supabase";
import { colors, radius, shadows, spacing, typography } from "@/src/theme";

type IconName = keyof typeof Ionicons.glyphMap;

type DriverProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
};

type PublicVehicle = {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  horsepower: number | null;
  color: string | null;
  cover_image_url: string | null;
  is_public: boolean | null;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function HeaderAction({
  icon,
  onPress,
  label,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function normalizeRouteId(id: string | string[] | undefined) {
  const routeId = Array.isArray(id) ? id[0] : id;
  return routeId?.trim() ?? "";
}

function getInitials(displayName: string) {
  return (
    displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2) || "NX"
  );
}

function vehicleName(vehicle: PublicVehicle) {
  return [vehicle.year, vehicle.brand, vehicle.model].filter(Boolean).join(" ");
}

function StateCard({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateMessage}>{message}</Text>
      {onRetry ? <NoxaButton title="Retry" onPress={onRetry} /> : null}
    </View>
  );
}

export default function PublicDriverProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const driverId = useMemo(() => normalizeRouteId(id), [id]);
  const isValidDriverId = uuidPattern.test(driverId);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [vehicles, setVehicles] = useState<PublicVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDriverProfile = useCallback(async () => {
    if (!isValidDriverId) {
      setProfile(null);
      setVehicles([]);
      setErrorMessage("This driver profile link is invalid.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url, bio, city")
      .eq("id", driverId)
      .maybeSingle();

    if (profileError) {
      setProfile(null);
      setVehicles([]);
      setErrorMessage("Unable to load this driver profile.");
      setIsLoading(false);
      return;
    }

    if (!profileData) {
      setProfile(null);
      setVehicles([]);
      setIsLoading(false);
      return;
    }

    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id, brand, model, year, horsepower, color, cover_image_url, is_public")
      .eq("owner_id", driverId)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (vehicleError) {
      setProfile(profileData);
      setVehicles([]);
      setErrorMessage("Driver loaded, but public vehicles could not be loaded.");
      setIsLoading(false);
      return;
    }

    setProfile(profileData);
    setVehicles(vehicleData ?? []);
    setIsLoading(false);
  }, [driverId, isValidDriverId]);

  useEffect(() => {
    void loadDriverProfile();
  }, [loadDriverProfile]);

  const displayName = profile?.display_name?.trim() || "NOXA Driver";
  const username = profile?.username ? `@${profile.username}` : null;
  const stats = [{ label: "Cars", value: vehicles.length }];

  return (
    <NoxaScreen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <HeaderAction
            icon="chevron-back"
            label="Go back"
            onPress={() => router.back()}
          />
          <Text style={styles.headerTitle}>Driver Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateMessage}>Loading driver profile…</Text>
          </View>
        ) : errorMessage && !profile ? (
          <StateCard
            title="Profile unavailable"
            message={errorMessage}
            onRetry={isValidDriverId ? loadDriverProfile : undefined}
          />
        ) : !profile ? (
          <StateCard
            title="Driver not found"
            message="No public NOXA profile exists for this driver."
            onRetry={loadDriverProfile}
          />
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroGlow} />
              {profile.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
                </View>
              )}
              <View style={styles.nameRow}>
                <Text style={styles.name}>{displayName}</Text>
              </View>
              {username ? <Text style={styles.username}>{username}</Text> : null}
              {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
              {profile.city ? (
                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Ionicons name="location-outline" size={14} color={colors.accent} />
                    <Text style={styles.metaText}>{profile.city}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.statsCard}>
              {stats.map((stat) => (
                <View key={stat.label} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {errorMessage ? (
              <StateCard title="Garage warning" message={errorMessage} onRetry={loadDriverProfile} />
            ) : null}

            {vehicles.length > 0 ? (
              <>
                <SectionTitle title="Public Garage" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.garageList}
                >
                  {vehicles.map((vehicle) => (
                    <Pressable
                      key={vehicle.id}
                      accessibilityRole="button"
                      onPress={() =>
                        router.push({
                          pathname: "/vehicle-details",
                          params: { id: vehicle.id },
                        })
                      }
                      style={({ pressed }) => [
                        styles.carCard,
                        pressed && styles.pressed,
                      ]}
                    >
                      {vehicle.cover_image_url ? (
                        <Image source={{ uri: vehicle.cover_image_url }} style={styles.carImage} />
                      ) : (
                        <View style={styles.carImageFallback}>
                          <Ionicons name="car-sport-outline" size={42} color={colors.textMuted} />
                        </View>
                      )}
                      <View style={styles.carShade} />
                      <View style={styles.carCopy}>
                        <Text style={styles.carName}>{vehicleName(vehicle)}</Text>
                        <View style={styles.carMetaRow}>
                          {vehicle.horsepower ? (
                            <Text style={styles.carPill}>{vehicle.horsepower} HP</Text>
                          ) : null}
                          {vehicle.color ? <Text style={styles.carPill}>{vehicle.color}</Text> : null}
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            ) : (
              <StateCard
                title="No public vehicles"
                message="This driver has not shared any public vehicles yet."
              />
            )}
          </>
        )}
      </ScrollView>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 132,
  },
  header: {
    marginBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  headerAction: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSoft,
  },
  headerSpacer: { width: 42, height: 42 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  loadingCard: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stateCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stateTitle: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: "900",
  },
  stateMessage: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 22,
  },
  heroCard: {
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  heroGlow: {
    position: "absolute",
    top: -120,
    width: 260,
    height: 260,
    borderRadius: 160,
    backgroundColor: "rgba(255,45,45,0.18)",
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.84)",
  },
  avatarFallback: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 56,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.84)",
    backgroundColor: colors.surfaceSoft,
  },
  avatarInitials: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
  },
  nameRow: {
    width: "100%",
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  name: {
    maxWidth: "78%",
    color: colors.text,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  username: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "700",
  },
  bio: {
    marginTop: spacing.md,
    color: colors.text,
    textAlign: "center",
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 22,
  },
  metaRow: {
    width: "100%",
    marginTop: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  metaPill: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  metaText: {
    flexShrink: 1,
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  statsCard: {
    marginTop: spacing.lg,
    flexDirection: "row",
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: spacing.xs,
  },
  statValue: { color: colors.text, fontSize: 17, fontWeight: "900" },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  garageList: { gap: spacing.sm, paddingRight: spacing.lg },
  carCard: {
    width: 224,
    height: 164,
    overflow: "hidden",
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    backgroundColor: colors.surface,
  },
  carImage: { width: "100%", height: "100%" },
  carImageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
  },
  carShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  carCopy: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  carName: { color: colors.text, fontSize: 17, fontWeight: "900" },
  carMetaRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  carPill: {
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    color: colors.text,
    backgroundColor: "rgba(255,255,255,0.14)",
    fontSize: 11,
    fontWeight: "900",
  },
});
