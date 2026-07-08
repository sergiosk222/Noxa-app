import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

const vehicleMarkers = [
  { top: '24%', left: '18%', rotate: '-24deg' },
  { top: '38%', left: '70%', rotate: '18deg' },
  { top: '58%', left: '28%', rotate: '32deg' },
  { top: '68%', left: '78%', rotate: '-12deg' },
] as const;

const gridLines = [16, 32, 48, 64, 80] as const;

export default function LiveMapScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>N</Text>
        </View>
        <Text style={styles.logo}>NOXA</Text>
        <View style={styles.headerActions}>
          <View style={styles.iconButton}>
            <Ionicons name="search" size={19} color={colors.text} />
          </View>
          <View style={styles.iconButton}>
            <View style={styles.notificationDot} />
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </View>
        </View>
      </View>

      <View style={styles.mapFrame}>
        <View style={styles.mapGlowTop} />
        <View style={styles.mapGlowBottom} />

        {gridLines.map((position) => (
          <View key={`horizontal-${position}`} style={[styles.gridLineHorizontal, { top: `${position}%` }]} />
        ))}
        {gridLines.map((position) => (
          <View key={`vertical-${position}`} style={[styles.gridLineVertical, { left: `${position}%` }]} />
        ))}

        <View style={[styles.road, styles.roadOne]} />
        <View style={[styles.road, styles.roadTwo]} />
        <View style={[styles.road, styles.roadThree]} />
        <View style={[styles.road, styles.roadFour]} />
        <View style={[styles.roadThin, styles.roadFive]} />
        <View style={[styles.roadThin, styles.roadSix]} />

        <View style={styles.districtBlockA} />
        <View style={styles.districtBlockB} />
        <View style={styles.districtBlockC} />

        {vehicleMarkers.map((marker) => (
          <View key={`${marker.top}-${marker.left}`} style={[styles.vehicleMarker, marker]}>
            <View style={styles.vehicleHalo} />
            <Ionicons name="navigate" size={15} color={colors.text} style={{ transform: [{ rotate: marker.rotate }] }} />
          </View>
        ))}

        <View style={styles.eventMarker}>
          <View style={styles.eventPulse} />
          <View style={styles.eventPin}>
            <Ionicons name="flag" size={18} color={colors.text} />
          </View>
          <View style={styles.eventLabel}>
            <Text style={styles.eventLabelText}>EVENT</Text>
          </View>
        </View>

        <View style={styles.mapStatusPill}>
          <View style={styles.liveDot} />
          <Text style={styles.mapStatusText}>Live crews nearby</Text>
        </View>
      </View>

      <View style={styles.eventCard}>
        <View style={styles.eventCardGlow} />
        <View style={styles.eventMetaRow}>
          <View>
            <Text style={styles.eventTitle}>Night Run</Text>
            <Text style={styles.eventSubtitle}>22 participants • Starts in 18 min</Text>
          </View>
          <View style={styles.eventBadge}>
            <Ionicons name="flash" size={15} color={colors.accent} />
          </View>
        </View>
        <View style={styles.eventButton}>
          <Text style={styles.eventButtonText}>View Event</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.text} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  avatarText: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '900',
  },
  logo: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '900',
    letterSpacing: 5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(23,26,34,0.86)',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  mapFrame: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#080A0F',
    shadowColor: colors.accent,
    shadowOpacity: 0.16,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14,
  },
  mapGlowTop: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,36,36,0.16)',
  },
  mapGlowBottom: {
    position: 'absolute',
    bottom: -130,
    left: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  road: {
    position: 'absolute',
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(244,244,245,0.11)',
  },
  roadThin: {
    position: 'absolute',
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(244,244,245,0.08)',
  },
  roadOne: {
    top: '29%',
    left: '-12%',
    width: '130%',
    transform: [{ rotate: '-18deg' }],
  },
  roadTwo: {
    top: '54%',
    left: '-16%',
    width: '132%',
    transform: [{ rotate: '14deg' }],
  },
  roadThree: {
    top: '47%',
    left: '8%',
    width: '96%',
    transform: [{ rotate: '-48deg' }],
  },
  roadFour: {
    top: '72%',
    left: '-4%',
    width: '74%',
    transform: [{ rotate: '-8deg' }],
  },
  roadFive: {
    top: '18%',
    left: '40%',
    width: '76%',
    transform: [{ rotate: '38deg' }],
  },
  roadSix: {
    top: '82%',
    right: '-18%',
    width: '96%',
    transform: [{ rotate: '-34deg' }],
  },
  districtBlockA: {
    position: 'absolute',
    top: '14%',
    left: '9%',
    width: 82,
    height: 118,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.035)',
    backgroundColor: 'rgba(255,255,255,0.025)',
    transform: [{ rotate: '-10deg' }],
  },
  districtBlockB: {
    position: 'absolute',
    top: '52%',
    right: '9%',
    width: 96,
    height: 136,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ rotate: '12deg' }],
  },
  districtBlockC: {
    position: 'absolute',
    bottom: '9%',
    left: '16%',
    width: 118,
    height: 82,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,36,36,0.08)',
    backgroundColor: 'rgba(255,36,36,0.035)',
    transform: [{ rotate: '8deg' }],
  },
  vehicleMarker: {
    position: 'absolute',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.62,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  vehicleHalo: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,36,36,0.13)',
  },
  eventMarker: {
    position: 'absolute',
    top: '41%',
    left: '44%',
    alignItems: 'center',
  },
  eventPulse: {
    position: 'absolute',
    top: -14,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,36,36,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,36,36,0.22)',
  },
  eventPin: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.78,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  eventLabel: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(5,6,8,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  eventLabelText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  mapStatusPill: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(5,6,8,0.66)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  mapStatusText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  eventCard: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 100,
    overflow: 'hidden',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(16,18,23,0.86)',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 20,
  },
  eventCardGlow: {
    position: 'absolute',
    top: -70,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,36,36,0.14)',
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eventTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  eventSubtitle: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.body,
  },
  eventBadge: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,36,36,0.12)',
  },
  eventButton: {
    height: 50,
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  eventButtonText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
  },
});
