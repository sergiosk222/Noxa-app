import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NoxaScreen } from '@/src/components/ui';
import { featuredEvent } from '@/src/data';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

const coverImage = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=88';
const hostAvatar = 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=240&q=80';
const participantAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
] as const;

const requirements = ['Respect others', 'No dangerous driving', 'Public roads only', 'Keep the area clean'] as const;
const futureSections = ['Chat', 'Photos', 'Comments', 'Announcements', 'Live location', 'Check-in'] as const;

function HeaderAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}>
      <Ionicons name={icon} size={21} color={colors.text} />
    </Pressable>
  );
}

function Hero() {
  return (
    <View style={styles.heroCard}>
      <Image source={{ uri: coverImage }} style={styles.heroImage} />
      <View style={styles.heroShade} />
      <View style={styles.heroBottomShade} />
      <View style={styles.heroContent}>
        <Text style={styles.heroKicker}>Featured event</Text>
        <Text style={styles.heroTitle}>{featuredEvent.title}</Text>
        <View style={styles.heroMetaRow}>
          <Ionicons name="location-outline" size={17} color={colors.text} />
          <Text style={styles.heroMeta}>{featuredEvent.location}</Text>
        </View>
        <View style={styles.heroMetaRow}>
          <Ionicons name="time-outline" size={17} color={colors.text} />
          <Text style={styles.heroMeta}>{featuredEvent.timeLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function HostCard() {
  return (
    <View style={styles.cardCompact}>
      <Image source={{ uri: hostAvatar }} style={styles.hostAvatar} />
      <View style={styles.hostCopy}>
        <Text style={styles.eyebrow}>Host</Text>
        <Text style={styles.hostName}>Nikos Varela</Text>
        <Text style={styles.mutedText}>Midnight Society Crew</Text>
      </View>
      <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
    </View>
  );
}

function Participants() {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Participants</Text>
        <Text style={styles.sectionMeta}>{featuredEvent.participantsCount} going</Text>
      </View>
      <View style={styles.avatarRow}>
        {participantAvatars.map((avatar, index) => (
          <Image key={avatar} source={{ uri: avatar }} style={[styles.participantAvatar, { marginLeft: index === 0 ? 0 : -10 }]} />
        ))}
        <View style={styles.moreAvatar}>
          <Text style={styles.moreText}>+18</Text>
        </View>
        <Text style={styles.moreLabel}>more</Text>
      </View>
    </View>
  );
}

function MeetingPoint() {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Meeting Point</Text>
      <Text style={styles.locationName}>Thessaloniki Waterfront — White Tower side</Text>
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapRoadOne} />
        <View style={styles.mapRoadTwo} />
        <View style={styles.mapPin}>
          <Ionicons name="location" size={19} color={colors.text} />
        </View>
        <Text style={styles.mapLabel}>Map preview</Text>
      </View>
      <Pressable accessibilityRole="button" style={({ pressed }) => [styles.mapsButton, pressed && styles.pressed]}>
        <Text style={styles.mapsButtonText}>Open in Maps</Text>
        <Ionicons name="open-outline" size={16} color={colors.text} />
      </Pressable>
    </View>
  );
}

export default function EventDetailsScreen() {
  const router = useRouter();
  const [joined, setJoined] = useState(false);

  return (
    <NoxaScreen padded={false}>
      <View style={styles.header}>
        <HeaderAction icon="chevron-back" label="Go back" onPress={() => router.back()} />
        <HeaderAction icon="share-outline" label="Share event" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Hero />
        <HostCard />
        <Participants />
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>A clean night meet for premium builds, photos, and a relaxed waterfront roll-in. Keep it respectful, low-key, and community-first.</Text>
        </View>
        <MeetingPoint />
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {requirements.map((item) => (
            <View key={item} style={styles.requirementRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.requirementText}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.futureGrid}>
          {futureSections.map((item) => (
            <View key={item} style={styles.futurePill}>
              <Text style={styles.futureText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable accessibilityRole="button" onPress={() => setJoined((value) => !value)} style={({ pressed }) => [styles.joinButton, joined && styles.joinedButton, pressed && styles.pressed]}>
          <Text style={styles.joinText}>{joined ? 'Joined' : 'Join Event'}</Text>
        </Pressable>
      </View>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  header: { position: 'absolute', top: spacing.lg, left: spacing.lg, right: spacing.lg, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between' },
  headerAction: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(8,10,14,0.72)' },
  pressed: { opacity: 0.86, transform: [{ translateY: 1 }, { scale: 0.98 }] },
  content: { paddingBottom: 132, gap: spacing.lg },
  heroCard: { height: 390, overflow: 'hidden', borderBottomLeftRadius: 36, borderBottomRightRadius: 36, backgroundColor: colors.surface, ...shadows.card },
  heroImage: { width: '100%', height: '100%' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },
  heroBottomShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 210, backgroundColor: 'rgba(0,0,0,0.64)' },
  heroContent: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xl, gap: spacing.xs },
  heroKicker: { color: colors.primary, fontSize: typography.caption, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' },
  heroTitle: { color: colors.text, fontSize: 43, fontWeight: '900', letterSpacing: -1.3 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  heroMeta: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  cardCompact: { marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.card },
  hostAvatar: { width: 58, height: 58, borderRadius: radius.pill, borderWidth: 2, borderColor: 'rgba(255,255,255,0.72)' },
  hostCopy: { flex: 1 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  hostName: { marginTop: 2, color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' },
  mutedText: { marginTop: 2, color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  sectionCard: { marginHorizontal: spacing.lg, gap: spacing.md, padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.card },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  sectionTitle: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: '900', letterSpacing: -0.3 },
  sectionMeta: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '800' },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  participantAvatar: { width: 42, height: 42, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.surface },
  moreAvatar: { width: 42, height: 42, marginLeft: -10, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderAccent, backgroundColor: colors.primaryMuted },
  moreText: { color: colors.text, fontSize: 12, fontWeight: '900' },
  moreLabel: { marginLeft: spacing.sm, color: colors.textMuted, fontSize: typography.caption, fontWeight: '800' },
  description: { color: colors.textMuted, fontSize: typography.body, fontWeight: '600', lineHeight: 24 },
  locationName: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  mapPlaceholder: { height: 132, overflow: 'hidden', borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: '#080A0F' },
  mapRoadOne: { position: 'absolute', left: -20, top: 44, width: '118%', height: 26, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.08)', transform: [{ rotate: '-12deg' }] },
  mapRoadTwo: { position: 'absolute', left: 70, top: -12, width: 28, height: 170, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.055)', transform: [{ rotate: '34deg' }] },
  mapPin: { position: 'absolute', left: '48%', top: 42, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.primary, ...shadows.redGlow },
  mapLabel: { position: 'absolute', left: spacing.md, bottom: spacing.md, color: colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 1.1, textTransform: 'uppercase' },
  mapsButton: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSoft },
  mapsButtonText: { color: colors.text, fontSize: typography.caption, fontWeight: '900' },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  requirementText: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  futureGrid: { marginHorizontal: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  futurePill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass },
  futureText: { color: colors.textMuted, fontSize: 12, fontWeight: '900' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: 'rgba(5,6,8,0.94)' },
  joinButton: { height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.primary, ...shadows.redGlow },
  joinedButton: { backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.borderStrong, shadowOpacity: 0 },
  joinText: { color: colors.text, fontSize: typography.body, fontWeight: '900', letterSpacing: 0.3 },
});
