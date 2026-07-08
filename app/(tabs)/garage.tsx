import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, type ImageStyle } from 'react-native';

import { NoxaBadge, NoxaButton, NoxaCard, NoxaHeader, NoxaScreen } from '@/src/components/ui';
import { animations, colors, radius, shadows, spacing, typography } from '@/src/theme';

const car = {
  model: 'Nissan 370Z',
  buildName: 'Street Hunter',
  status: 'PUBLIC',
  image:
    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=85',
  stats: [
    { label: 'HP', value: '612' },
    { label: 'Torque', value: '620 Nm' },
    { label: '0-100', value: '3.6 s' },
    { label: 'Stage', value: 'Stage 2' },
  ],
  buildCompletion: 78,
  installedParts: ['Turbo Stage 2', 'Performance Exhaust', 'Coilovers', 'Cold Air Intake', 'Semi Slick Tires'],
  gallery: [
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=80',
  ],
  activity: {
    event: 'Night Run',
    date: 'Yesterday',
    crew: 'Midnight Society',
  },
};

function useEntryAnimation(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: animations.slow,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: animations.slow,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return { opacity, transform: [{ translateY }] };
}

function HeroCard() {
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
    <Animated.View style={[styles.heroCard, { opacity, transform: [{ scale }] }]}>
      <ImageBackground source={{ uri: car.image }} resizeMode="cover" style={styles.heroImage} imageStyle={styles.heroImageRadius as ImageStyle}>
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
          <NoxaBadge label={car.status} variant="primary" />
          <View>
            <Text style={styles.model}>{car.model}</Text>
            <Text style={styles.buildName}>{car.buildName}</Text>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

function StatsCard() {
  return (
    <Animated.View style={useEntryAnimation(80)}>
      <View style={styles.statsGrid}>
        {car.stats.map((stat) => (
          <NoxaCard key={stat.label}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </NoxaCard>
        ))}
      </View>
    </Animated.View>
  );
}

function BuildProgressCard() {
  return (
    <Animated.View style={useEntryAnimation(140)}>
      <NoxaCard>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Build Completion</Text>
          <Text style={styles.percent}>{car.buildCompletion}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${car.buildCompletion}%` }]} />
        </View>
      </NoxaCard>
    </Animated.View>
  );
}

function InstalledPartsCard() {
  return (
    <Animated.View style={useEntryAnimation(200)}>
      <NoxaCard>
        <Text style={styles.sectionTitle}>Installed Parts</Text>
        <View style={styles.partsList}>
          {car.installedParts.map((part) => (
            <View key={part} style={styles.partRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.partText}>{part}</Text>
            </View>
          ))}
        </View>
      </NoxaCard>
    </Animated.View>
  );
}

function GalleryCard() {
  return (
    <Animated.View style={useEntryAnimation(260)}>
      <NoxaCard>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          <Text style={styles.viewAll}>View All →</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
          {car.gallery.map((image, index) => (
            <ImageBackground key={image} source={{ uri: image }} style={styles.galleryImage} imageStyle={styles.galleryRadius as ImageStyle}>
              {index === 0 ? <View style={styles.galleryHighlight} /> : null}
            </ImageBackground>
          ))}
        </ScrollView>
      </NoxaCard>
    </Animated.View>
  );
}

function ActivityCard() {
  return (
    <Animated.View style={useEntryAnimation(320)}>
      <NoxaCard>
        <Text style={styles.sectionTitle}>Activity</Text>
        <View style={styles.activityPanel}>
          <View>
            <Text style={styles.activityLabel}>Recent Event</Text>
            <Text style={styles.activityTitle}>{car.activity.event}</Text>
            <Text style={styles.activityMeta}>{car.activity.date}</Text>
          </View>
          <View style={styles.crewPill}>
            <Text style={styles.crewLabel}>Crew</Text>
            <Text style={styles.crewName}>{car.activity.crew}</Text>
          </View>
        </View>
      </NoxaCard>
    </Animated.View>
  );
}

export default function GarageScreen() {
  return (
    <NoxaScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <NoxaHeader
          title="MY CARS"
          subtitle="Your automotive identity"
          right={
            <Pressable accessibilityLabel="Car settings" accessibilityRole="button" style={({ pressed }) => [styles.settings, pressed && styles.pressed]}>
              <Ionicons name="settings-outline" size={22} color={colors.text} />
            </Pressable>
          }
        />
        <HeroCard />
        <StatsCard />
        <BuildProgressCard />
        <InstalledPartsCard />
        <GalleryCard />
        <ActivityCard />
        <NoxaButton title="Edit Vehicle" fullWidth />
      </ScrollView>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 128,
    gap: spacing.lg,
  },
  settings: {
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
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  heroCard: {
    height: 390,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroImageRadius: {
    borderRadius: radius.xl,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.26)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  model: {
    color: colors.text,
    fontSize: typography.h1,
    fontWeight: '900',
    letterSpacing: -1,
  },
  buildName: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    fontSize: typography.subtitle,
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
    fontSize: typography.title,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
  },
  percent: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    marginTop: spacing.md,
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  partsList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  partText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },
  viewAll: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  galleryRow: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingRight: spacing.lg,
  },
  galleryImage: {
    width: 104,
    height: 122,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
  },
  galleryRadius: {
    borderRadius: radius.lg,
  },
  galleryHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,45,45,0.58)',
  },
  activityPanel: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  activityLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  activityTitle: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '900',
  },
  activityMeta: {
    marginTop: spacing.xxs,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  crewPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  crewLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  crewName: {
    marginTop: spacing.xxs,
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '900',
  },
});
