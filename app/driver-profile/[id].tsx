import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getPublicDriverById } from '@/src/data/mockPublicDrivers';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { NoxaButton, NoxaScreen } from '@/src/components/ui';

type IconName = keyof typeof Ionicons.glyphMap;

function HeaderAction({ icon, onPress, label }: { icon: IconName; onPress?: () => void; label: string }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}>
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

export default function PublicDriverProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const driver = getPublicDriverById(id);
  const stats = [
    ['Followers', driver.stats.followers],
    ['Following', driver.stats.following],
    ['Cars', driver.stats.cars],
    ['Events', driver.stats.events],
    ['Reputation', driver.stats.reputation],
  ];

  return (
    <NoxaScreen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <HeaderAction icon="chevron-back" label="Go back" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Driver Profile</Text>
          <HeaderAction icon="share-outline" label="Share profile" />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Image source={{ uri: driver.avatar }} style={styles.avatar} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{driver.name}</Text>
            {driver.online ? <Text style={styles.onlineBadge}>ONLINE</Text> : null}
          </View>
          <Text style={styles.username}>{driver.username}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}><Ionicons name="navigate" size={14} color={colors.accent} /><Text style={styles.metaText}>{driver.distance}</Text></View>
            <View style={styles.metaPill}><Ionicons name="shield-checkmark" size={14} color={colors.accent} /><Text style={styles.metaText}>{driver.crew}</Text></View>
          </View>
          <View style={styles.actionRow}>
            <NoxaButton title="Follow" fullWidth />
            <NoxaButton title="Message" variant="secondary" fullWidth />
          </View>
        </View>

        <View style={styles.statsCard}>
          {stats.map(([label, value]) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Garage Preview" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.garageList}>
          {driver.garage.map((car) => (
            <Pressable key={car.id} style={({ pressed }) => [styles.carCard, pressed && styles.pressed]}>
              <Image source={{ uri: car.image }} style={styles.carImage} />
              <View style={styles.carShade} />
              <View style={styles.carCopy}>
                <Text style={styles.carName}>{car.name}</Text>
                <View style={styles.carMetaRow}>
                  <Text style={styles.carPill}>{car.horsepower}</Text>
                  <Text style={styles.carPill}>{car.stage}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <SectionTitle title="Latest Photos" />
        <View style={styles.photoGrid}>
          {driver.photos.map((photo) => <Image key={photo} source={{ uri: photo }} style={styles.photo} />)}
        </View>

        <SectionTitle title="Recent Activity" />
        <View style={styles.listCard}>
          {driver.activity.map((item) => (
            <View key={item.id} style={styles.activityRow}>
              <View style={styles.activityIcon}><Ionicons name={item.icon as IconName} size={17} color={colors.accent} /></View>
              <View style={styles.activityCopy}><Text style={styles.activityLabel}>{item.label}</Text><Text style={styles.activityMeta}>{item.meta}</Text></View>
            </View>
          ))}
        </View>

        <SectionTitle title="Achievements" />
        <View style={styles.achievementGrid}>
          {driver.achievements.map((badge) => (
            <View key={badge.id} style={styles.achievementBadge}>
              <Ionicons name={badge.icon as IconName} size={22} color={colors.text} />
              <Text style={styles.achievementTitle}>{badge.title}</Text>
              <Text style={styles.achievementSubtitle}>{badge.subtitle}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </NoxaScreen>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 132, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900', letterSpacing: 0.3 },
  headerAction: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: colors.surfaceSoft },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  heroCard: { overflow: 'hidden', alignItems: 'center', padding: spacing.xl, borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: '#0D1017', ...shadows.card },
  heroGlow: { position: 'absolute', top: -120, width: 260, height: 260, borderRadius: 160, backgroundColor: 'rgba(255,45,45,0.18)' },
  avatar: { width: 112, height: 112, borderRadius: 56, borderWidth: 3, borderColor: 'rgba(255,255,255,0.84)' },
  nameRow: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.7 },
  onlineBadge: { overflow: 'hidden', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill, color: colors.text, backgroundColor: 'rgba(34,197,94,0.26)', fontSize: 10, fontWeight: '900' },
  username: { marginTop: 4, color: colors.textMuted, fontSize: typography.body, fontWeight: '700' },
  metaRow: { marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.06)' },
  metaText: { color: colors.text, fontSize: typography.caption, fontWeight: '800' },
  actionRow: { marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  statsCard: { flexDirection: 'row', paddingVertical: spacing.md, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { color: colors.text, fontSize: 17, fontWeight: '900' },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800' },
  sectionTitle: { marginTop: spacing.sm, color: colors.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  garageList: { gap: spacing.md, paddingRight: spacing.lg },
  carCard: { width: 252, height: 178, overflow: 'hidden', borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', backgroundColor: colors.surface },
  carImage: { width: '100%', height: '100%' },
  carShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },
  carCopy: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
  carName: { color: colors.text, fontSize: 19, fontWeight: '900' },
  carMetaRow: { marginTop: spacing.sm, flexDirection: 'row', gap: spacing.sm },
  carPill: { overflow: 'hidden', paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill, color: colors.text, backgroundColor: 'rgba(255,255,255,0.14)', fontSize: 11, fontWeight: '900' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  photo: { width: '32.5%', aspectRatio: 1, borderRadius: 12, backgroundColor: colors.surfaceSoft },
  listCard: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  activityIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: 'rgba(255,45,45,0.12)' },
  activityCopy: { flex: 1 },
  activityLabel: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  activityMeta: { marginTop: 2, color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  achievementGrid: { flexDirection: 'row', gap: spacing.sm },
  achievementBadge: { flex: 1, alignItems: 'center', padding: spacing.md, borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(255,45,45,0.22)', backgroundColor: 'rgba(255,45,45,0.11)' },
  achievementTitle: { marginTop: spacing.sm, color: colors.text, textAlign: 'center', fontSize: 12, fontWeight: '900' },
  achievementSubtitle: { marginTop: 3, color: colors.textMuted, textAlign: 'center', fontSize: 10, fontWeight: '700' },
});
