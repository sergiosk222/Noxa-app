import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NoxaBadge, NoxaButton, NoxaHeader, NoxaScreen } from '@/src/components/ui';
import { featuredEvent, mockEvents } from '@/src/data';
import { animations, colors, radius, shadows, spacing, typography } from '@/src/theme';

const categories = ['Tonight', 'Nearby', 'Crews', 'Weekend'] as const;

const events = mockEvents
  .filter((event) => !event.isFeatured)
  .map((event) => ({
    ...event,
    time: event.timeLabel,
    participants: `${event.participantsCount} going`,
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

function IconButton() {
  return (
    <Pressable accessibilityLabel="Filter events" accessibilityRole="button" style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <Ionicons name="options-outline" size={22} color={colors.text} />
    </Pressable>
  );
}

function FeaturedEventCard() {
  return (
    <Animated.View style={[styles.featuredCard, useSlideUp(80)]}>
      <View style={styles.featuredGlow} />
      <View style={styles.featuredTopRow}>
        <NoxaBadge label="FEATURED" variant="primary" />
        <View style={styles.goingPill}>
          <Ionicons name="people" size={15} color={colors.primary} />
          <Text style={styles.goingText}>{featuredEvent.participantsCount} going</Text>
        </View>
      </View>

      <View style={styles.featuredCopy}>
        <Text style={styles.featuredTitle}>{featuredEvent.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={17} color={colors.textMuted} />
          <Text style={styles.metaText}>{featuredEvent.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={17} color={colors.textMuted} />
          <Text style={styles.metaText}>{featuredEvent.timeLabel}</Text>
        </View>
      </View>

      <NoxaButton title="View Event" fullWidth />
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

function EventCard({ event, index }: { event: (typeof events)[number]; index: number }) {
  return (
    <Animated.View style={[styles.eventCard, useSlideUp(200 + index * 70)]}>
      <View style={styles.redAccent} />
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <NoxaBadge label={event.tag} />
      </View>
      <View style={styles.eventMetaGrid}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{event.time}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{event.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="people-outline" size={16} color={colors.textMuted} />
          <Text style={styles.metaText}>{event.participants}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function EventsScreen() {
  return (
    <NoxaScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <NoxaHeader title="EVENTS" subtitle="What’s happening tonight" right={<IconButton />} />
        <FeaturedEventCard />
        <CategoryTabs />
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Local heartbeat</Text>
          <Text style={styles.sectionMeta}>{events.length} events</Text>
        </View>
        {events.map((event, index) => (
          <EventCard key={event.title} event={event} index={index} />
        ))}
      </ScrollView>

      <View style={styles.bottomAction} pointerEvents="box-none">
        <Pressable accessibilityLabel="Create Event" accessibilityRole="button" style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
          <Ionicons name="add" size={22} color={colors.text} />
          <Text style={styles.createText}>Create Event</Text>
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
    opacity: 0.82,
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  featuredCard: {
    minHeight: 284,
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
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,45,45,0.14)',
  },
  featuredTopRow: {
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
  featuredCopy: {
    gap: spacing.sm,
  },
  featuredTitle: {
    color: colors.text,
    fontSize: typography.h1,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    flex: 1,
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
    backgroundColor: 'rgba(255,45,45,0.14)',
    borderColor: 'rgba(255,45,45,0.34)',
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
  eventCard: {
    overflow: 'hidden',
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
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
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eventTitle: {
    flex: 1,
    color: colors.text,
    fontSize: typography.cardTitle,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  eventMetaGrid: {
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
