import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { NoxaScreen } from "@/src/components/ui";
import { colors, radius, shadows, spacing, typography } from "@/src/theme";

type SocialTab = "followers" | "following";
type SocialStatus = "ONLINE" | "CRUISING" | "OFFLINE";

type SocialUser = {
  id: string;
  name: string;
  username: string;
  car: string;
  status: SocialStatus;
  initials: string;
  isFollowing: boolean;
};

const mockUsers: SocialUser[] = [
  {
    id: "alex-voss",
    name: "Alex Voss",
    username: "@voss.nsx",
    car: "BMW M3 G80",
    status: "ONLINE",
    initials: "AV",
    isFollowing: false,
  },
  {
    id: "kai-nakamura",
    name: "Kai Nakamura",
    username: "@kai.s15",
    car: "Nissan Silvia S15",
    status: "CRUISING",
    initials: "KN",
    isFollowing: true,
  },
  {
    id: "maria-leon",
    name: "Maria Leon",
    username: "@maria.gti",
    car: "Volkswagen Golf GTI",
    status: "OFFLINE",
    initials: "ML",
    isFollowing: true,
  },
];

function getInitialTab(tab?: string | string[]): SocialTab {
  return tab === "following" ? "following" : "followers";
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>SOCIAL</Text>
        <Text style={styles.headerSubtitle}>Followers &amp; Following</Text>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function SocialTabs({
  activeTab,
  onChange,
}: {
  activeTab: SocialTab;
  onChange: (tab: SocialTab) => void;
}) {
  return (
    <View style={styles.tabsCard}>
      {(["followers", "following"] as const).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab)}
            style={({ pressed }) => [
              styles.tabButton,
              isActive && styles.activeTabButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab === "followers" ? "Followers" : "Following"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function StatusBadge({ status }: { status: SocialStatus }) {
  return (
    <View
      style={[styles.statusBadge, status === "OFFLINE" && styles.offlineBadge]}
    >
      <View
        style={[styles.statusDot, status === "OFFLINE" && styles.offlineDot]}
      />
      <Text
        style={[styles.statusText, status === "OFFLINE" && styles.offlineText]}
      >
        {status}
      </Text>
    </View>
  );
}

function SocialRow({ user }: { user: SocialUser }) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${user.name} public driver profile`}
      onPress={() => undefined}
      style={({ pressed }) => [styles.userRow, pressed && styles.pressed]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.initials}</Text>
      </View>
      <View style={styles.userCopy}>
        <View style={styles.nameLine}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.name}
          </Text>
          <StatusBadge status={user.status} />
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.car}>{user.car}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isFollowing ? `Unfollow ${user.name}` : `Follow ${user.name}`
        }
        onPress={(event) => {
          event.stopPropagation();
          setIsFollowing((value) => !value);
        }}
        style={({ pressed }) => [
          styles.followButton,
          isFollowing && styles.followingButton,
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.followButtonText,
            isFollowing && styles.followingButtonText,
          ]}
        >
          {isFollowing ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

export default function SocialListScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<SocialTab>(() =>
    getInitialTab(tab),
  );
  const users = useMemo(
    () => (activeTab === "followers" ? mockUsers : [...mockUsers].reverse()),
    [activeTab],
  );

  return (
    <NoxaScreen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Header />
        <SocialTabs activeTab={activeTab} onChange={setActiveTab} />
        <View style={styles.futureCard}>
          <Ionicons name="search" size={17} color={colors.textMuted} />
          <Text style={styles.futureText}>
            Search, mutuals, and profile routing are ready for the real social
            graph.
          </Text>
        </View>
        <View style={styles.listCard}>
          {users.map((user) => (
            <SocialRow key={`${activeTab}-${user.id}`} user={user} />
          ))}
        </View>
      </ScrollView>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 132,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  headerCopy: { alignItems: "center", gap: spacing.xxs },
  headerTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900",
    letterSpacing: 2.4,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  headerSpacer: { width: 44 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  tabsCard: {
    flexDirection: "row",
    padding: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  activeTabButton: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "900",
  },
  activeTabText: { color: colors.text },
  futureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass,
  },
  futureText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
    lineHeight: 18,
  },
  listCard: { gap: spacing.sm },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "#1B1D24",
  },
  avatarText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  userCopy: { flex: 1, minWidth: 0, gap: 3 },
  nameLine: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  userName: {
    flexShrink: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
  },
  username: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
  },
  car: { color: colors.text, fontSize: typography.caption, fontWeight: "800" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(34,197,94,0.12)",
  },
  offlineBadge: { backgroundColor: colors.glass },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  offlineDot: { backgroundColor: colors.textMuted },
  statusText: { color: colors.success, fontSize: 9, fontWeight: "900" },
  offlineText: { color: colors.textMuted },
  followButton: {
    minWidth: 88,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    ...shadows.redGlow,
  },
  followingButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: colors.surfaceSoft,
    shadowOpacity: 0,
  },
  followButtonText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "900",
  },
  followingButtonText: { color: colors.textMuted },
});
