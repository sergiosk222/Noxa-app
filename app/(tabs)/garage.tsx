import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, type ImageStyle } from 'react-native';

import { NoxaBadge, NoxaButton, NoxaCard, NoxaHeader, NoxaScreen } from '@/src/components/ui';
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
  const entryAnimationStyle = useEntryAnimation(80);

  if (!vehicle) {
    return null;
  }

  const stats = buildVehicleStats(vehicle);

  return (
    <Animated.View style={entryAnimationStyle}>
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

export default function GarageScreen() {
  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [hasVehicleError, setHasVehicleError] = useState(false);
  const hasLoadedVehiclesRef = useRef(false);
  const selectedVehicle = vehicles[0] ?? null;

  const loadVehicles = useCallback(async () => {
    setIsLoadingVehicles(!hasLoadedVehiclesRef.current);
    setHasVehicleError(false);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData.user;

    if (authError || !user) {
      setVehicles([]);
      setHasVehicleError(true);
      hasLoadedVehiclesRef.current = true;
      setIsLoadingVehicles(false);
      return;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select(vehicleSelect)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setHasVehicleError(true);
    } else {
      setVehicles((data ?? []) as GarageVehicle[]);
    }

    hasLoadedVehiclesRef.current = true;
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
});
