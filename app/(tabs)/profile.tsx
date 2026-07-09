import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NoxaAvatar, NoxaBadge, NoxaButton, NoxaCard, NoxaHeader, NoxaScreen } from '@/src/components/ui';
import { currentUser } from '@/src/data';
import { animations, colors, radius, spacing, typography } from '@/src/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const profile = {
  name: currentUser.name,
  username: currentUser.username,
  status: currentUser.status.toUpperCase(),
  location: currentUser.city,
  stats: [
    { label: 'Cars', value: String(currentUser.carsCount) },
    { label: 'Crews', value: String(currentUser.crewsCount) },
    { label: 'Events', value: String(currentUser.eventsCount) },
    { label: 'Followers', value: String(currentUser.followersCount) },
    { label: 'Following', value: String(currentUser.followingCount) },
  ],
  achievements: ['Night Driver', 'Crew Leader', 'Early Member'],
  activity: {
    label: 'Joined',
    title: 'Night Run',
    date: 'Yesterday',
  },
  actions: [
    { label: 'Manage Cars', icon: 'car-sport-outline' },
    { label: 'My Crews', icon: 'people-outline' },
    { label: 'Saved Events', icon: 'bookmark-outline' },
    { label: 'Notifications', icon: 'notifications-outline' },
    { label: 'Privacy', icon: 'shield-checkmark-outline' },
  ] satisfies { label: string; icon: IoniconName }[],
};

function useEntryAnimation(delay = 0, distance = animations.entranceDistance) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: animations.entrance,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: animations.entrance,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return { opacity, transform: [{ translateY }] };
}

function SettingsButton() {
  return (
    <Pressable
      accessibilityLabel="Profile settings"
      accessibilityRole="button"
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <Ionicons name="settings-outline" size={22} color={colors.text} />
    </Pressable>
  );
}

function ProfileHero() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 560,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 560,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View style={[styles.hero, { opacity, transform: [{ scale }] }]}>
      <View style={styles.avatarRing}>
        <NoxaAvatar initials="SN" size={108} />
      </View>
      <View style={styles.identityBlock}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.name}</Text>
          <NoxaBadge label={profile.status} variant="success" />
        </View>
        <Text style={styles.username}>{profile.username}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <Text style={styles.location}>{profile.location}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function StatsGrid() {
  return (
    <Animated.View style={[styles.statsGrid, useEntryAnimation(90)]}>
      {profile.stats.map((stat) => (
        <NoxaCard key={stat.label}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </NoxaCard>
      ))}
    </Animated.View>
  );
}

function AchievementsCard() {
  return (
    <Animated.View style={useEntryAnimation(160)}>
      <NoxaCard>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.badgeList}>
          {profile.achievements.map((achievement) => (
            <View key={achievement} style={styles.achievementBadge}>
              <Ionicons name="medal-outline" size={17} color={colors.primary} />
              <Text style={styles.achievementText}>{achievement}</Text>
            </View>
          ))}
        </View>
      </NoxaCard>
    </Animated.View>
  );
}

function RecentActivityCard() {
  return (
    <Animated.View style={useEntryAnimation(230)}>
      <NoxaCard>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityPanel}>
          <View style={styles.activityIcon}>
            <Ionicons name="flag-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.activityCopy}>
            <Text style={styles.activityLabel}>{profile.activity.label}</Text>
            <Text style={styles.activityTitle}>{profile.activity.title}</Text>
          </View>
          <Text style={styles.activityDate}>{profile.activity.date}</Text>
        </View>
      </NoxaCard>
    </Animated.View>
  );
}

function QuickActionsCard() {
  return (
    <Animated.View style={useEntryAnimation(300)}>
      <NoxaCard>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsList}>
          {profile.actions.map((action) => (
            <Pressable key={action.label} accessibilityRole="button" style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={20} color={colors.text} />
              </View>
              <Text style={styles.actionText}>{action.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </NoxaCard>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  return (
    <NoxaScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <NoxaHeader title="PROFILE" right={<SettingsButton />} />
        <ProfileHero />
        <StatsGrid />
        <AchievementsCard />
        <RecentActivityCard />
        <QuickActionsCard />
        <NoxaButton title="Edit Profile" fullWidth />
      </ScrollView>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 144,
    gap: spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  hero: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarRing: {
    padding: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: colors.background,
  },
  identityBlock: {
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: typography.h1,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  username: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  location: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statValue: {
    minWidth: 116,
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  badgeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  activityPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,45,45,0.12)',
  },
  activityCopy: {
    flex: 1,
    marginLeft: spacing.md,
  },
  activityLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  activityTitle: {
    marginTop: spacing.xxs,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
  },
  activityDate: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  actionsList: {
    marginTop: spacing.md,
  },
  actionRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
  },
  actionText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
});
