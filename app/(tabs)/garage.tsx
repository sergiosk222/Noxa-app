import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, type ImageStyle } from 'react-native';

import { NoxaBadge, NoxaButton, NoxaCard, NoxaHeader, NoxaScreen } from '@/src/components/ui';
import { featuredCar } from '@/src/data';
import { supabase } from '@/src/lib/supabase';
import { animations, colors, radius, shadows, spacing, typography } from '@/src/theme';

type GarageVehicle = {
  id: string;
  owner_id: string;
  brand: string;
  model: string | null;
  year: number | null;
  horsepower: number;
  color: string;
  transmission: string | null;
  drivetrain: string | null;
  tuning_stage: string | null;
  zero_to_hundred: number | null;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

const vehicleSelect = `
  id,
  owner_id,
  brand,
  model,
  year,
  horsepower,
  color,
  transmission,
  drivetrain,
  tuning_stage,
  zero_to_hundred,
  description,
  cover_image_url,
  is_public,
  created_at,
  updated_at
`;

const car = {
  model: featuredCar.name,
  buildName: featuredCar.buildName,
  status: featuredCar.visibility.toUpperCase(),
  image: featuredCar.imageUrl,
  installedParts: featuredCar.installedParts,
  gallery: featuredCar.gallery,
  activity: {
    event: 'Night Run',
    date: 'Yesterday',
    crew: 'Midnight Society',
  },
};

function useEntryAnimation(delay = 0) {
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

function VehicleCard({ vehicle }: { vehicle: GarageVehicle }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.97)).current;
  const modelName = [vehicle.brand, vehicle.model].filter(Boolean).join(' ');
  const details = [vehicle.year, `${vehicle.horsepower} HP`, vehicle.color].filter(Boolean).join(' • ');

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

  const content = (
    <>
      <View style={styles.heroShade} />
      <View style={styles.heroContent}>
        <NoxaBadge label={vehicle.is_public ? 'PUBLIC' : 'PRIVATE'} variant="primary" />
        <View>
          <Text style={styles.model}>{modelName}</Text>
          <Text style={styles.buildName}>{details}</Text>
        </View>
      </View>
    </>
  );

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }]}>
      <Pressable
        accessibilityLabel={`Open ${modelName} details`}
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: '/vehicle-details',
            params: { id: vehicle.id },
          })
        }
        style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}
      >
        {vehicle.cover_image_url ? (
          <ImageBackground source={{ uri: vehicle.cover_image_url }} resizeMode="cover" style={styles.heroImage} imageStyle={styles.heroImageRadius as ImageStyle}>
            {content}
          </ImageBackground>
        ) : (
          <View style={[styles.heroImage, styles.vehiclePlaceholder]}>
            <Ionicons name="car-sport" size={84} color="rgba(255,45,45,0.42)" />
            {content}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function VehicleCollection({ error, isLoading, onRetry, vehicles }: { error: boolean; isLoading: boolean; onRetry: () => void; vehicles: GarageVehicle[] }) {
  if (isLoading) {
    return (
      <View style={styles.collectionState}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.stateText}>Loading your garage...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.collectionState}>
        <Text style={styles.stateTitle}>Unable to load your garage.</Text>
        <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (vehicles.length === 0) {
    return (
      <View style={styles.collectionState}>
        <Text style={styles.stateTitle}>Your garage is empty.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/vehicle-editor')} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
          <Text style={styles.retryText}>Add your first car</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.vehicleList}>
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </View>
  );
}

type VehicleStat = {
  label: string;
  value: string | null;
};

function hasStatValue(stat: VehicleStat): stat is { label: string; value: string } {
  return stat.value !== null && stat.value.trim() !== '';
}

function buildVehicleStats(vehicle: GarageVehicle) {
  const stats: VehicleStat[] = [
    { label: 'Horsepower', value: `${vehicle.horsepower} HP` },
    { label: 'Year', value: vehicle.year !== null ? String(vehicle.year) : null },
    { label: 'Transmission', value: vehicle.transmission },
    { label: 'Drivetrain', value: vehicle.drivetrain },
    { label: 'Stage', value: vehicle.tuning_stage },
    { label: '0-100', value: vehicle.zero_to_hundred !== null ? `${vehicle.zero_to_hundred} s` : null },
    { label: 'Visibility', value: vehicle.is_public ? 'PUBLIC' : 'PRIVATE' },
  ];

  return stats.filter(hasStatValue);
}

function StatsCard({ vehicle }: { vehicle: GarageVehicle | null }) {
  if (!vehicle) {
    return null;
  }

  const stats = buildVehicleStats(vehicle);

  return (
    <Animated.View style={useEntryAnimation(80)}>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <NoxaCard key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </NoxaCard>
        ))}
      </View>
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
  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [hasVehicleError, setHasVehicleError] = useState(false);
  const selectedVehicle = vehicles[0] ?? null;

  const loadVehicles = useCallback(async () => {
    setIsLoadingVehicles(true);
    setHasVehicleError(false);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData.user;

    if (authError || !user) {
      setVehicles([]);
      setHasVehicleError(true);
      setIsLoadingVehicles(false);
      return;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select(vehicleSelect)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setVehicles([]);
      setHasVehicleError(true);
    } else {
      setVehicles((data ?? []) as GarageVehicle[]);
    }

    setIsLoadingVehicles(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadVehicles();
    }, [loadVehicles]),
  );

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
        <VehicleCollection error={hasVehicleError} isLoading={isLoadingVehicles} onRetry={loadVehicles} vehicles={vehicles} />
        <StatsCard vehicle={selectedVehicle} />
        <InstalledPartsCard />
        <GalleryCard />
        <ActivityCard />
        <NoxaButton title="Add Vehicle" fullWidth onPress={() => router.push('/vehicle-editor')} />
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
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  heroCard: {
    height: 372,
    borderRadius: radius.card,
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
    borderRadius: radius.card,
  },
  vehiclePlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    justifyContent: 'center',
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.26)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
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
    fontSize: typography.cardTitle,
    fontWeight: '700',
  },
  vehicleList: {
    gap: spacing.md,
  },
  collectionState: {
    minHeight: 168,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  stateTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
    textAlign: 'center',
  },
  stateText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '800',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  retryText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 148,
  },
  statValue: {
    minWidth: 116,
    color: colors.text,
    fontSize: typography.sectionTitle,
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
    width: 108,
    height: 118,
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
    padding: spacing.lg,
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
    fontSize: typography.sectionTitle,
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
    backgroundColor: colors.glass,
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
