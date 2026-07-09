import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, type ImageStyle } from 'react-native';

import { NoxaAvatar, NoxaBadge, NoxaButton, NoxaCard, NoxaScreen } from '@/src/components/ui';
import { currentUser, featuredCar } from '@/src/data';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

type VehicleInfoRow = {
  label: string;
  value?: string | number;
};

const vehicle = {
  ...featuredCar,
  displayName: 'BMW M3 G80',
  drivetrain: 'AWD',
  color: 'Midnight Blue',
  transmission: '8-speed M Steptronic',
  description: 'A focused midnight build with a clean street presence, sharpened handling, and a premium daily-driver setup ready for curated Noxa events.',
  owner: {
    id: currentUser.id,
    name: currentUser.name,
    initials: currentUser.name.slice(0, 2),
    crew: 'Midnight Society',
  },
  gallery: [
    featuredCar.imageUrl,
    ...featuredCar.gallery,
  ].filter(Boolean) as string[],
  recentEvents: ['Night Run', 'Cars & Coffee', 'Drift Practice'],
  engagement: {
    likes: 128,
    comments: 24,
    mods: featuredCar.installedParts,
    aiRecognition: 'Prepared for AI vehicle recognition',
    visibility: featuredCar.visibility,
  },
};

const informationRows: VehicleInfoRow[] = [
  { label: 'Brand', value: 'BMW' },
  { label: 'Model', value: 'M3 G80' },
  { label: 'Horsepower', value: `${vehicle.powerHp} HP` },
  { label: 'Color', value: vehicle.color },
  { label: 'Transmission', value: vehicle.transmission },
].filter((row) => row.value !== undefined && row.value !== null && row.value !== '');

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

function VehicleHero() {
  return (
    <View style={styles.heroCard}>
      <ImageBackground source={{ uri: vehicle.imageUrl }} resizeMode="cover" style={styles.heroImage} imageStyle={styles.heroImageRadius as ImageStyle}>
        <View style={styles.heroTopFade} />
        <View style={styles.heroBottomFade} />
        <View style={styles.heroAccent} />
        <View style={styles.heroContent}>
          <NoxaBadge label={vehicle.engagement.visibility.toUpperCase()} variant="primary" />
          <View>
            <Text style={styles.heroTitle}>{vehicle.displayName}</Text>
            <View style={styles.specRow}>
              <Text style={styles.specText}>{vehicle.powerHp} HP</Text>
              <View style={styles.specDot} />
              <Text style={styles.specText}>{vehicle.drivetrain}</Text>
              <View style={styles.specDot} />
              <Text style={styles.specText}>{vehicle.color}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

function OwnerCard() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="View owner profile" style={({ pressed }) => [pressed && styles.pressed]}>
      <NoxaCard>
        <View style={styles.ownerRow}>
          <NoxaAvatar initials={vehicle.owner.initials} size={52} />
          <View style={styles.ownerCopy}>
            <Text style={styles.eyebrow}>Owner</Text>
            <Text style={styles.ownerName}>{vehicle.owner.name}</Text>
          </View>
          <View style={styles.crewBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
            <Text style={styles.crewText}>{vehicle.owner.crew}</Text>
          </View>
        </View>
      </NoxaCard>
    </Pressable>
  );
}

function Gallery() {
  return (
    <View>
      <Text style={styles.sectionTitle}>Gallery</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
        {vehicle.gallery.slice(0, 6).map((image, index) => (
          <ImageBackground key={`${image}-${index}`} source={{ uri: image }} style={styles.galleryImage} imageStyle={styles.galleryRadius as ImageStyle}>
            <View style={styles.galleryFade} />
          </ImageBackground>
        ))}
      </ScrollView>
    </View>
  );
}

function Information() {
  return (
    <NoxaCard>
      <Text style={styles.cardTitle}>Information</Text>
      <View style={styles.infoList}>
        {informationRows.map((row) => (
          <View key={row.label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    </NoxaCard>
  );
}

function About() {
  return (
    <NoxaCard>
      <Text style={styles.cardTitle}>About</Text>
      <Text style={styles.bodyText}>{vehicle.description}</Text>
    </NoxaCard>
  );
}

function Events() {
  return (
    <NoxaCard>
      <Text style={styles.cardTitle}>Recent Events</Text>
      <View style={styles.eventList}>
        {vehicle.recentEvents.map((event) => (
          <View key={event} style={styles.eventRow}>
            <Ionicons name="calendar-clear-outline" size={18} color={colors.primary} />
            <Text style={styles.eventText}>{event}</Text>
          </View>
        ))}
      </View>
    </NoxaCard>
  );
}

export default function VehicleDetailsScreen() {
  return (
    <NoxaScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Header />
        <VehicleHero />
        <OwnerCard />
        <Gallery />
        <Information />
        <About />
        <Events />
      </ScrollView>
      <View style={styles.ctaWrap} pointerEvents="box-none">
        <NoxaButton title="View Owner" fullWidth onPress={() => router.push(`/driver-profile/${vehicle.owner.id}`)} />
      </View>
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
  heroTopFade: { ...StyleSheet.absoluteFillObject, bottom: undefined, height: 150, backgroundColor: 'rgba(0,0,0,0.32)' },
  heroBottomFade: { ...StyleSheet.absoluteFillObject, top: undefined, height: 245, backgroundColor: 'rgba(0,0,0,0.66)' },
  heroAccent: { position: 'absolute', right: -70, bottom: -76, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,45,45,0.20)' },
  heroContent: { flex: 1, justifyContent: 'space-between', padding: spacing.xl },
  heroTitle: { color: colors.text, fontSize: 38, fontWeight: '900', letterSpacing: -1.2 },
  specRow: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  specText: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  specDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ownerCopy: { flex: 1 },
  eyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 1.3, textTransform: 'uppercase' },
  ownerName: { marginTop: spacing.xxs, color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' },
  crewBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.border },
  crewText: { color: colors.text, fontSize: 11, fontWeight: '900' },
  sectionTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  galleryRow: { gap: spacing.sm, paddingTop: spacing.md, paddingRight: spacing.lg },
  galleryImage: { width: 150, height: 126, overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.surfaceSoft },
  galleryRadius: { borderRadius: radius.lg },
  galleryFade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.10)', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  infoList: { marginTop: spacing.md, gap: spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '800' },
  infoValue: { flex: 1, color: colors.text, fontSize: typography.body, fontWeight: '800', textAlign: 'right' },
  bodyText: { marginTop: spacing.md, color: colors.textMuted, fontSize: typography.body, fontWeight: '600', lineHeight: 24 },
  eventList: { marginTop: spacing.md, gap: spacing.sm },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.border },
  eventText: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  ctaWrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
});
