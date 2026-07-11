import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, type ImageStyle } from 'react-native';

import { NoxaAvatar, NoxaBadge, NoxaButton, NoxaCard, NoxaScreen } from '@/src/components/ui';
import { supabase } from '@/src/lib/supabase';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

type VehicleInfoRow = {
  label: string;
  value?: string | number | null;
};

type VehicleDetails = {
  id: string;
  owner_id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  horsepower: number | null;
  color: string | null;
  transmission: string | null;
  drivetrain: string | null;
  tuning_stage: string | null;
  zero_to_hundred: number | null;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean | null;
};

type VehicleOwner = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  city: string | null;
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
  is_public
`;

const ownerSelect = `
  id,
  display_name,
  username,
  avatar_url,
  city
`;

function isPresent(value?: string | number | null) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getParamId(id: string | string[] | undefined) {
  return Array.isArray(id) ? id[0] : id;
}

function formatVehicleName(vehicle: VehicleDetails) {
  return [vehicle.brand, vehicle.model].filter(isPresent).join(' ');
}

function formatOwnerInitials(owner: VehicleOwner) {
  const displayName = owner.display_name || owner.username || 'NX';
  return displayName.slice(0, 2);
}

function HeaderAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <HeaderAction icon="chevron-back" label="Go back" onPress={() => router.back()} />
      <Text style={styles.headerTitle}>VEHICLE</Text>
      <HeaderAction icon="share-outline" label="Share vehicle" />
    </View>
  );
}

function VehicleHero({ vehicle }: { vehicle: VehicleDetails }) {
  const vehicleName = formatVehicleName(vehicle) || 'Vehicle';
  const specs = [isPresent(vehicle.horsepower) ? `${vehicle.horsepower} HP` : null, vehicle.drivetrain, vehicle.color].filter(isPresent);
  const content = (
    <>
      <View style={styles.heroTopFade} />
      <View style={styles.heroBottomFade} />
      <View style={styles.heroAccent} />
      <View style={styles.heroContent}>
        {typeof vehicle.is_public === 'boolean' ? <NoxaBadge label={vehicle.is_public ? 'PUBLIC' : 'PRIVATE'} variant="primary" /> : <View />}
        <View>
          <Text style={styles.heroTitle}>{vehicleName}</Text>
          {specs.length > 0 ? (
            <View style={styles.specRow}>
              {specs.map((spec, index) => (
                <View key={String(spec)} style={styles.specItem}>
                  {index > 0 ? <View style={styles.specDot} /> : null}
                  <Text style={styles.specText}>{spec}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.heroCard}>
      {vehicle.cover_image_url ? (
        <ImageBackground source={{ uri: vehicle.cover_image_url }} resizeMode="cover" style={styles.heroImage} imageStyle={styles.heroImageRadius as ImageStyle}>
          {content}
        </ImageBackground>
      ) : (
        <View style={[styles.heroImage, styles.vehiclePlaceholder]}>
          <Ionicons name="car-sport" size={96} color="rgba(255,45,45,0.42)" />
          {content}
        </View>
      )}
    </View>
  );
}

function OwnerCard({ owner }: { owner: VehicleOwner }) {
  const ownerName = owner.display_name || owner.username;
  const ownerMeta = [owner.username ? `@${owner.username}` : null, owner.city].filter(isPresent).join(' • ');

  if (!ownerName && !ownerMeta) {
    return null;
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="View owner profile" onPress={() => router.push({ pathname: '/driver-profile/[id]', params: { id: owner.id } })} style={({ pressed }) => [pressed && styles.pressed]}>
      <NoxaCard>
        <View style={styles.ownerRow}>
          <NoxaAvatar initials={formatOwnerInitials(owner)} size={52} />
          <View style={styles.ownerCopy}>
            <Text style={styles.eyebrow}>Owner</Text>
            {ownerName ? <Text style={styles.ownerName}>{ownerName}</Text> : null}
            {ownerMeta ? <Text style={styles.ownerMeta}>{ownerMeta}</Text> : null}
          </View>
        </View>
      </NoxaCard>
    </Pressable>
  );
}

function Information({ rows }: { rows: VehicleInfoRow[] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <NoxaCard>
      <Text style={styles.cardTitle}>Information</Text>
      <View style={styles.infoList}>
        {rows.map((row) => (
          <View key={row.label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    </NoxaCard>
  );
}

function About({ description }: { description: string | null }) {
  if (!isPresent(description)) {
    return null;
  }

  return (
    <NoxaCard>
      <Text style={styles.cardTitle}>About</Text>
      <Text style={styles.bodyText}>{description}</Text>
    </NoxaCard>
  );
}

function StateCard({ title, message, onRetry, loading }: { title: string; message?: string; onRetry?: () => void; loading?: boolean }) {
  return (
    <NoxaCard>
      <View style={styles.stateCard}>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        <Text style={styles.stateTitle}>{title}</Text>
        {message ? <Text style={styles.stateText}>{message}</Text> : null}
        {onRetry ? (
          <Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    </NoxaCard>
  );
}

export default function VehicleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const vehicleId = getParamId(id);
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [owner, setOwner] = useState<VehicleOwner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const informationRows = useMemo<VehicleInfoRow[]>(() => {
    if (!vehicle) {
      return [];
    }

    return [
      { label: 'Brand', value: vehicle.brand },
      { label: 'Model', value: vehicle.model },
      { label: 'Year', value: vehicle.year },
      { label: 'Horsepower', value: isPresent(vehicle.horsepower) ? `${vehicle.horsepower} HP` : null },
      { label: 'Color', value: vehicle.color },
      { label: 'Transmission', value: vehicle.transmission },
      { label: 'Drivetrain', value: vehicle.drivetrain },
      { label: 'Tuning Stage', value: vehicle.tuning_stage },
      { label: '0–100 km/h', value: isPresent(vehicle.zero_to_hundred) ? `${vehicle.zero_to_hundred}s` : null },
    ].filter((row) => isPresent(row.value));
  }, [vehicle]);

  const loadVehicle = useCallback(async () => {
    if (!isPresent(vehicleId)) {
      setVehicle(null);
      setOwner(null);
      setError('Missing vehicle id.');
      setIsLoading(false);
      return;
    }

    if (!isUuid(vehicleId)) {
      setVehicle(null);
      setOwner(null);
      setError('Invalid vehicle id.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    setCurrentUserId(userData.user?.id ?? null);

    const { data: vehicleData, error: vehicleError } = await supabase.from('vehicles').select(vehicleSelect).eq('id', vehicleId).maybeSingle();

    if (vehicleError || !vehicleData) {
      setVehicle(null);
      setOwner(null);
      setError('Unable to load vehicle.');
      setIsLoading(false);
      return;
    }

    const loadedVehicle = vehicleData as VehicleDetails;
    setVehicle(loadedVehicle);

    const { data: ownerData, error: ownerError } = await supabase.from('profiles').select(ownerSelect).eq('id', loadedVehicle.owner_id).maybeSingle();

    if (ownerError) {
      setOwner(null);
      setError('Vehicle loaded, but owner details are unavailable.');
    } else {
      setOwner((ownerData as VehicleOwner | null) ?? null);
    }

    setIsLoading(false);
  }, [vehicleId]);

  useEffect(() => {
    void loadVehicle();
  }, [loadVehicle]);

  const deleteVehicle = useCallback(async () => {
    if (isDeleting || !vehicle) {
      return;
    }

    setIsDeleting(true);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    const currentUser = authData.user;

    if (authError || !currentUser) {
      setIsDeleting(false);
      Alert.alert('Unable to delete vehicle', 'You must be signed in to delete this vehicle.');
      return;
    }

    if (currentUser.id !== vehicle.owner_id) {
      setIsDeleting(false);
      Alert.alert('Unable to delete vehicle', 'You can only delete vehicles you own.');
      return;
    }

    const { data, error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicle.id)
      .eq('owner_id', currentUser.id)
      .select('id');

    if (deleteError) {
      setIsDeleting(false);
      Alert.alert('Unable to delete vehicle', deleteError.message);
      return;
    }

    if (!data || data.length === 0) {
      setIsDeleting(false);
      Alert.alert('Unable to delete vehicle', 'No vehicle was deleted. Please try again.');
      return;
    }

    setIsDeleting(false);
    router.replace('/(tabs)/garage');
  }, [isDeleting, vehicle]);

  const confirmDeleteVehicle = useCallback(() => {
    if (isDeleting) {
      return;
    }

    Alert.alert('Delete vehicle?', 'This vehicle will be permanently removed from your garage.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void deleteVehicle() },
    ]);
  }, [deleteVehicle, isDeleting]);

  const ownsVehicle = Boolean(vehicle && currentUserId && currentUserId === vehicle.owner_id);
  const showCta = Boolean(vehicle?.owner_id);

  return (
    <NoxaScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Header />
        {isLoading ? <StateCard loading title="Loading vehicle..." /> : null}
        {!isLoading && error ? <StateCard title={error} onRetry={loadVehicle} /> : null}
        {!isLoading && !error && vehicle ? (
          <>
            <VehicleHero vehicle={vehicle} />
            {owner ? <OwnerCard owner={owner} /> : null}
            <Information rows={informationRows} />
            <About description={vehicle.description} />
          </>
        ) : null}
      </ScrollView>
      {showCta ? (
        <View style={styles.ctaWrap} pointerEvents="box-none">
          {ownsVehicle ? <NoxaButton title="Edit Vehicle" fullWidth onPress={() => router.push({ pathname: '/vehicle-editor', params: { id: vehicle?.id } })} /> : null}
          {ownsVehicle ? <NoxaButton title={isDeleting ? 'Deleting...' : 'Delete Vehicle'} fullWidth variant="danger" disabled={isDeleting} onPress={confirmDeleteVehicle} /> : null}
          <NoxaButton title="View Owner" fullWidth variant={ownsVehicle ? 'secondary' : 'primary'} onPress={() => router.push({ pathname: '/driver-profile/[id]', params: { id: vehicle?.owner_id } })} />
        </View>
      ) : null}
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 126, gap: spacing.lg },
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  headerTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900', letterSpacing: 2 },
  pressed: { opacity: 0.82, transform: [{ translateY: 1 }, { scale: 0.98 }] },
  heroCard: { height: 430, overflow: 'hidden', borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  heroImage: { flex: 1 },
  heroImageRadius: { borderRadius: radius.card },
  vehiclePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSoft },
  heroTopFade: { ...StyleSheet.absoluteFillObject, bottom: undefined, height: 150, backgroundColor: 'rgba(0,0,0,0.32)' },
  heroBottomFade: { ...StyleSheet.absoluteFillObject, top: undefined, height: 245, backgroundColor: 'rgba(0,0,0,0.66)' },
  heroAccent: { position: 'absolute', right: -70, bottom: -76, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,45,45,0.20)' },
  heroContent: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', padding: spacing.xl },
  heroTitle: { color: colors.text, fontSize: 38, fontWeight: '900', letterSpacing: -1.2 },
  specRow: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  specText: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  specDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ownerCopy: { flex: 1 },
  eyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 1.3, textTransform: 'uppercase' },
  ownerName: { marginTop: spacing.xxs, color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' },
  ownerMeta: { marginTop: spacing.xxs, color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  infoList: { marginTop: spacing.md, gap: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '800' },
  infoValue: { flex: 1, color: colors.text, fontSize: typography.body, fontWeight: '800', textAlign: 'right' },
  bodyText: { marginTop: spacing.md, color: colors.textMuted, fontSize: typography.body, fontWeight: '600', lineHeight: 24 },
  stateCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  stateTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900', textAlign: 'center' },
  stateText: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700', textAlign: 'center' },
  retryButton: { marginTop: spacing.xs, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.border },
  retryText: { color: colors.text, fontSize: typography.caption, fontWeight: '900' },
  ctaWrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg, gap: spacing.sm },
});
