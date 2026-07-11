import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getPublicDriverById } from "@/src/data/mockPublicDrivers";
import { colors, radius, shadows, spacing, typography } from "@/src/theme";
import { NoxaScreen } from "@/src/components/ui";

type IconName = keyof typeof Ionicons.glyphMap;

type ProfileStat = {
  label: string;
  value: string | number;
  href?: Href;
};

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

function ProfileActionButton({
  title,
  variant = "primary",
  onPress,
}: {
  title: string;
  variant?: "primary" | "secondary" | "following";
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.profileActionButton,
        styles[`${variant}ActionButton`],
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.profileActionText}>{title}</Text>
    </Pressable>
  );
}

export default function PublicDriverProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const driver = getPublicDriverById(id);
  const [isFollowing, setIsFollowing] = useState(false);
  const stats: ProfileStat[] = [
    {
      label: "Followers",
      value: driver.stats.followers,
      href: "/social-list?tab=followers",
    },
    {
      label: "Following",
      value: driver.stats.following,
      href: "/social-list?tab=following",
    },
    { label: "Cars", value: driver.stats.cars },
    { label: "Events", value: driver.stats.events },
    { label: "Reputation", value: driver.stats.reputation },
  ];

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
          <HeaderAction icon="share-outline" label="Share profile" />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Image source={{ uri: driver.avatar }} style={styles.avatar} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{driver.name}</Text>
            {driver.online ? (
              <Text style={styles.onlineBadge}>ONLINE</Text>
            ) : null}
          </View>
          <Text style={styles.username}>{driver.username}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="navigate" size={14} color={colors.accent} />
              <Text style={styles.metaText}>{driver.distance}</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={colors.accent}
              />
              <Text style={styles.metaText}>{driver.crew}</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <ProfileActionButton
              title={isFollowing ? "Following" : "Follow"}
              variant={isFollowing ? "following" : "primary"}
              onPress={() => setIsFollowing((value) => !value)}
            />
            <ProfileActionButton title="Message" variant="secondary" />
          </View>
        </View>

        <View style={styles.statsCard}>
          {stats.map((stat) => {
            const statHref = stat.href;

            return (
              <Pressable
                key={stat.label}
                accessibilityRole={statHref ? "button" : undefined}
                onPress={statHref ? () => router.push(statHref) : undefined}
                style={({ pressed }) => [
                  styles.statItem,
                  statHref && styles.statLink,
                  pressed && statHref && styles.pressed,
                ]}
              >
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionTitle title="Garage Preview" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.garageList}
        >
          {driver.garage.map((car) => (
            <Pressable
              key={car.id}
              style={({ pressed }) => [
                styles.carCard,
                pressed && styles.pressed,
              ]}
            >
              <Image source={{ uri: car.image }} style={styles.carImage} />
              <View style={styles.carShade} />
              <View style={styles.carCopy}>
                <Text style={styles.carName}>{car.name}</Text>
                <View style={styles.carMetaRow}>
                  <Text style={styles.carPill}>{car.horsepower}</Text>
                  <Text style={styles.carPill}>{car.stage}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <SectionTitle title="Latest Photos" />
        <View style={styles.photoGrid}>
          {driver.photos.map((photo) => (
            <Image key={photo} source={{ uri: photo }} style={styles.photo} />
          ))}
        </View>

        <SectionTitle title="Recent Activity" />
        <View style={styles.listCard}>
          {driver.activity.map((item) => (
            <View key={item.id} style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Ionicons
                  name={item.icon as IconName}
                  size={17}
                  color={colors.accent}
                />
              </View>
              <View style={styles.activityCopy}>
                <Text style={styles.activityLabel}>{item.label}</Text>
                <Text style={styles.activityMeta}>{item.meta}</Text>
              </View>
            </View>
          ))}
        </View>

        <SectionTitle title="Achievements" />
        <View style={styles.achievementGrid}>
          {driver.achievements.map((badge) => (
            <View key={badge.id} style={styles.achievementBadge}>
              <Ionicons
                name={badge.icon as IconName}
                size={22}
                color={colors.text}
              />
              <Text style={styles.achievementTitle}>{badge.title}</Text>
              <Text style={styles.achievementSubtitle}>{badge.subtitle}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </NoxaScreen>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
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
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
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
  onlineBadge: {
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    color: colors.text,
    backgroundColor: "rgba(34,197,94,0.26)",
    fontSize: 10,
    fontWeight: "900",
  },
  username: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "700",
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
  actionRow: {
    width: "100%",
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
  profileActionButton: {
    flex: 1,
    minWidth: 0,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  primaryActionButton: { backgroundColor: colors.primary, ...shadows.redGlow },
  secondaryActionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  followingActionButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  profileActionText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    letterSpacing: 0.1,
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
  statLink: { borderRadius: radius.md },
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
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  photo: {
    flexBasis: "31.9%",
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  listCard: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  activityIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySubtle,
  },
  activityCopy: { flex: 1 },
  activityLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  activityMeta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  achievementGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  achievementBadge: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: "rgba(255,45,45,0.22)",
    backgroundColor: "rgba(255,45,45,0.11)",
  },
  achievementTitle: {
    marginTop: spacing.sm,
    color: colors.text,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
  },
  achievementSubtitle: {
    marginTop: 3,
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
  },
});
