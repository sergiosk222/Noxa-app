import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NoxaBadge, NoxaHeader, NoxaScreen } from '@/src/components/ui';
import { featuredCrew, mockCrews } from '@/src/data';
import { animations, colors, radius, shadows, spacing, typography } from '@/src/theme';

const categories = ['Featured', 'Nearby', 'Invites', 'My Crews'] as const;

const crewDots = [
  ['#FF2D2D', '#FFFFFF', '#8E919A'],
  ['#FFFFFF', '#8E919A', '#FF2D2D'],
  ['#8E919A', '#FF2D2D', '#FFFFFF'],
] as const;

const crews = mockCrews.map((crew, index) => ({
  ...crew,
  area: crew.city,
  members: `${crew.membersCount} members`,
  dots: crewDots[index] ?? crewDots[0],
}));

function useSlideUp(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(animations.entranceDistance)).current;

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

function CreateIconButton() {
  return (
    <Pressable accessibilityLabel="Create crew" accessibilityRole="button" style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <Ionicons name="add" size={24} color={colors.text} />
    </Pressable>
  );
}

function FeaturedCrewCard() {
  return (
    <Animated.View style={[styles.featuredCard, useSlideUp(80)]}>
      <View style={styles.featuredGlow} />
      <View style={styles.featuredTopRow}>
        <NoxaBadge label="FEATURED" variant="primary" />
        <View style={styles.memberPill}>
          <Ionicons name="people" size={15} color={colors.primary} />
          <Text style={styles.memberPillText}>{featuredCrew.membersCount} members</Text>
        </View>
      </View>

      <View style={styles.featuredCopy}>
        <Text style={styles.featuredTitle}>{featuredCrew.name}</Text>
        <Text style={styles.featuredSubtitle}>{featuredCrew.subtitle}</Text>
        <View style={styles.featuredStats}>
          <View style={styles.metaRow}>
            <Ionicons name="car-sport-outline" size={17} color={colors.textMuted} />
            <Text style={styles.metaText}>{featuredCrew.carsCount} cars</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={17} color={colors.textMuted} />
            <Text style={styles.metaText}>{featuredCrew.nextEvent}</Text>
          </View>
        </View>
      </View>

      <Pressable accessibilityLabel="View Crew" accessibilityRole="button" style={({ pressed }) => [styles.featuredCta, pressed && styles.pressed]}>
        <Text style={styles.featuredCtaText}>View Crew</Text>
      </Pressable>
    </Animated.View>
  );
}

function CategoryTabs() {
  return (
    <Animated.View style={[styles.categoryRow, useSlideUp(140)]}>
      {categories.map((category, index) => (
        <Pressable key={category} accessibilityRole="button" style={({ pressed }) => [styles.categoryTab, index === 0 && styles.categoryTabActive, pressed && styles.pressed]}>
          <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>{category}</Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}

function CrewDots({ dots }: { dots: readonly string[] }) {
  return (
    <View style={styles.dotRow}>
      {dots.map((dot, index) => (
        <View key={`${dot}-${index}`} style={[styles.memberDot, { backgroundColor: dot }, index > 0 && styles.stackedDot]} />
      ))}
      <View style={[styles.memberDot, styles.moreDot, styles.stackedDot]}>
        <Text style={styles.moreDotText}>+</Text>
      </View>
    </View>
  );
}

function CrewCard({ crew, index }: { crew: (typeof crews)[number]; index: number }) {
  return (
    <Animated.View style={[styles.crewCard, useSlideUp(210 + index * 70)]}>
      <View style={styles.redAccent} />
      <View style={styles.crewHeader}>
        <View style={styles.crewTitleBlock}>
          <Text style={styles.crewName}>{crew.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>{crew.area}</Text>
          </View>
        </View>
        <NoxaBadge label={crew.tag} />
      </View>

      <View style={styles.crewFooter}>
        <CrewDots dots={crew.dots} />
        <View style={styles.memberCountRow}>
          <Ionicons name="people-outline" size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{crew.members}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function CrewsScreen() {
  return (
    <NoxaScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <NoxaHeader title="CREWS" subtitle="Find your people" right={<CreateIconButton />} />
        <FeaturedCrewCard />
        <CategoryTabs />
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Community core</Text>
          <Text style={styles.sectionMeta}>{crews.length} crews</Text>
        </View>
        {crews.map((crew, index) => (
          <CrewCard key={crew.name} crew={crew} index={index} />
        ))}
      </ScrollView>

      <View style={styles.bottomAction} pointerEvents="box-none">
        <Pressable accessibilityLabel="Create Crew" accessibilityRole="button" style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
          <Ionicons name="add" size={22} color={colors.text} />
          <Text style={styles.createText}>Create Crew</Text>
        </Pressable>
      </View>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 164,
    gap: spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  featuredCard: {
    minHeight: 300,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  featuredGlow: {
    position: 'absolute',
    right: -72,
    top: -64,
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: colors.primaryMuted,
  },
  featuredTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  memberPill: {
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
  memberPillText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  featuredCopy: {
    gap: spacing.sm,
  },
  featuredTitle: {
    color: colors.text,
    fontSize: typography.h1,
    fontWeight: '900',
    letterSpacing: -0.9,
  },
  featuredSubtitle: {
    color: colors.textMuted,
    fontSize: typography.cardTitle,
    fontWeight: '700',
  },
  featuredStats: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  featuredCta: {
    width: '100%',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    ...shadows.redGlow,
  },
  featuredCtaText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
    letterSpacing: typography.letterSpacing.caption,
    lineHeight: typography.lineHeight.body,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    lineHeight: 19,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryTab: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryTabActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.borderAccent,
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  categoryTextActive: {
    color: colors.text,
  },
  listHeader: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  crewCard: {
    overflow: 'hidden',
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  redAccent: {
    position: 'absolute',
    left: 0,
    top: spacing.lg,
    bottom: spacing.lg,
    width: 3,
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  crewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  crewTitleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  crewName: {
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  crewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 2,
  },
  memberDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  stackedDot: {
    marginLeft: -7,
  },
  moreDot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.surface,
  },
  moreDotText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bottomAction: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 106,
    alignItems: 'center',
  },
  createButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    ...shadows.redGlow,
  },
  createText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
