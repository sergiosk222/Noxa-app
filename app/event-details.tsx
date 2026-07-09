import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NoxaBadge, NoxaButton, NoxaScreen } from '@/src/components/ui';
import { featuredEvent } from '@/src/data';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

const eventDetails = {
  ...featuredEvent,
  about: 'A premium night cruise through Thessaloniki’s waterfront with selected cars and crews.',
  attendanceOptions: ['Going', 'Maybe', 'Not going'] as const,
  rules: ['Respect traffic laws', 'No dangerous driving', 'Crew leaders only approval'],
  participantsPreview: ['AK', 'MR', 'SX', 'VN', 'GT'],
};

function Header() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.headerTitle}>EVENT</Text>
      <Pressable accessibilityLabel="Share event" accessibilityRole="button" style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
        <Ionicons name="share-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

function Hero() {
  return (
    <View style={styles.hero}>
      <View style={styles.heroGlow} />
      <View style={styles.heroTopRow}>
        <NoxaBadge label="FEATURED" variant="primary" />
        <View style={styles.goingPill}>
          <Ionicons name="people" size={15} color={colors.primary} />
          <Text style={styles.goingText}>{eventDetails.participantsCount} going</Text>
        </View>
      </View>
      <View style={styles.heroCopy}>
        <Text style={styles.heroTitle}>{eventDetails.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={18} color={colors.textMuted} />
          <Text style={styles.metaText}>{eventDetails.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={18} color={colors.textMuted} />
          <Text style={styles.metaText}>{eventDetails.timeLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function MatteCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Attendance() {
  return (
    <MatteCard>
      <Text style={styles.cardTitle}>Attendance</Text>
      <View style={styles.attendanceRow}>
        {eventDetails.attendanceOptions.map((option, index) => (
          <Pressable key={option} accessibilityRole="button" style={({ pressed }) => [styles.attendanceOption, index === 0 && styles.attendanceOptionActive, pressed && styles.pressed]}>
            <Text style={[styles.attendanceText, index === 0 && styles.attendanceTextActive]}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </MatteCard>
  );
}

function LocationPreview() {
  return (
    <MatteCard>
      <Text style={styles.cardTitle}>Location preview</Text>
      <View style={styles.mapPreview}>
        <View style={styles.mapLineHorizontal} />
        <View style={styles.mapLineVertical} />
        <View style={styles.mapPin}>
          <Ionicons name="location" size={19} color={colors.text} />
        </View>
      </View>
      <View style={styles.locationFooter}>
        <View>
          <Text style={styles.locationTitle}>{eventDetails.location}</Text>
          <Text style={styles.mutedText}>Meeting point preview</Text>
        </View>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]}>
          <Text style={styles.mapButtonText}>Open on Map</Text>
        </Pressable>
      </View>
    </MatteCard>
  );
}

function Participants() {
  return (
    <MatteCard>
      <Text style={styles.cardTitle}>Participants</Text>
      <View style={styles.participantsRow}>
        <View style={styles.avatarStack}>
          {eventDetails.participantsPreview.map((initials, index) => (
            <View key={initials} style={[styles.avatar, { marginLeft: index === 0 ? 0 : -10 }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.participantsText}>{eventDetails.participantsCount} drivers going</Text>
      </View>
    </MatteCard>
  );
}

function Rules() {
  return (
    <MatteCard>
      <Text style={styles.cardTitle}>Rules</Text>
      <View style={styles.rulesList}>
        {eventDetails.rules.map((rule) => (
          <View key={rule} style={styles.ruleRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        ))}
      </View>
    </MatteCard>
  );
}

export default function EventDetailsScreen() {
  return (
    <NoxaScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Header />
        <Hero />
        <MatteCard>
          <Text style={styles.cardTitle}>About this event</Text>
          <Text style={styles.bodyText}>{eventDetails.about}</Text>
        </MatteCard>
        <Attendance />
        <LocationPreview />
        <Participants />
        <Rules />
      </ScrollView>
      <View style={styles.ctaWrap} pointerEvents="box-none">
        <NoxaButton title="I’m Going" fullWidth />
      </View>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 122,
    gap: spacing.lg,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
    letterSpacing: 2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  hero: {
    minHeight: 286,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  heroGlow: {
    position: 'absolute',
    right: -70,
    top: -58,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,45,45,0.16)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  goingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goingText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  heroCopy: {
    gap: spacing.sm,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '700',
    lineHeight: 22,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  bodyText: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 24,
  },
  attendanceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  attendanceOption: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attendanceOptionActive: {
    backgroundColor: 'rgba(255,45,45,0.15)',
    borderColor: 'rgba(255,45,45,0.42)',
  },
  attendanceText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  attendanceTextActive: {
    color: colors.text,
  },
  mapPreview: {
    height: 156,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapLineHorizontal: {
    position: 'absolute',
    width: '120%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    transform: [{ rotate: '-14deg' }],
  },
  mapLineVertical: {
    position: 'absolute',
    width: 1,
    height: '120%',
    backgroundColor: colors.glass,
    transform: [{ rotate: '28deg' }],
  },
  mapPin: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    ...shadows.redGlow,
  },
  locationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  locationTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
  },
  mutedText: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  mapButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapButtonText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  participantsText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '800',
    textAlign: 'right',
  },
  rulesList: {
    gap: spacing.sm,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ruleText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '700',
  },
  ctaWrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
  },
});
