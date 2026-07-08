import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

const vehicleMarkers = [
  { id: 'r32', left: '18%', top: '26%', rotation: '-18deg' },
  { id: 'supra', left: '70%', top: '22%', rotation: '24deg' },
  { id: 'nsx', left: '58%', top: '55%', rotation: '-32deg' },
  { id: 'rx7', left: '28%', top: '68%', rotation: '18deg' },
] as const;

const gridLines = Array.from({ length: 7 }, (_, index) => index);
const roadLines = [
  { id: 'main', top: '39%', left: '-12%', width: '132%', rotation: '-18deg', emphasis: true },
  { id: 'north', top: '18%', left: '5%', width: '88%', rotation: '24deg', emphasis: false },
  { id: 'south', top: '70%', left: '10%', width: '95%', rotation: '15deg', emphasis: false },
  { id: 'cross', top: '48%', left: '20%', width: '74%', rotation: '61deg', emphasis: false },
  { id: 'harbor', top: '58%', left: '-6%', width: '66%', rotation: '-44deg', emphasis: false },
  { id: 'midtown', top: '29%', left: '42%', width: '68%', rotation: '72deg', emphasis: false },
] as const;

const districtBlocks = [
  { id: 'west', style: 'districtBlockOne' },
  { id: 'uptown', style: 'districtBlockTwo' },
  { id: 'east', style: 'districtBlockThree' },
  { id: 'harbor', style: 'districtBlockFour' },
] as const;

type ActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
};

function HeaderAction({ icon, accessibilityLabel }: ActionButtonProps) {
  return (
    <TouchableOpacity accessibilityLabel={accessibilityLabel} activeOpacity={0.78} style={styles.headerAction}>
      <Ionicons name={icon} size={20} color={colors.text} />
    </TouchableOpacity>
  );
}

function VehicleMarker({ left, top, rotation }: (typeof vehicleMarkers)[number]) {
  return (
    <View style={[styles.vehicleMarker, { left, top, transform: [{ rotate: rotation }] }]}>
      <View style={styles.vehicleGlow} />
      <Ionicons name="car-sport" size={18} color={colors.text} />
    </View>
  );
}

function CrewMarker() {
  return (
    <View style={styles.crewMarker}>
      <View style={styles.crewHalo} />
      <View style={styles.crewCore}>
        <Ionicons name="people" size={16} color={colors.text} />
      </View>
      <Text style={styles.markerCaption}>CREW</Text>
    </View>
  );
}

function EventMarker() {
  return (
    <View style={styles.eventMarker}>
      <View style={styles.eventPulse} />
      <View style={styles.eventCore}>
        <Ionicons name="flag" size={18} color={colors.text} />
      </View>
      <View style={styles.eventLabel}>
        <Text style={styles.eventLabelText}>EVENT</Text>
      </View>
    </View>
  );
}

function FakeLiveMap() {
  return (
    <View style={styles.mapPanel}>
      <View style={styles.mapVignetteTop} />
      <View style={styles.mapVignetteBottom} />

      {districtBlocks.map((block) => (
        <View key={block.id} style={styles[block.style]} />
      ))}

      {gridLines.map((line) => (
        <View key={`vertical-${line}`} style={[styles.gridLineVertical, { left: `${8 + line * 14}%` }]} />
      ))}
      {gridLines.map((line) => (
        <View key={`horizontal-${line}`} style={[styles.gridLineHorizontal, { top: `${9 + line * 13}%` }]} />
      ))}

      {roadLines.map((road) => (
        <View
          key={road.id}
          style={[
            styles.road,
            road.emphasis && styles.roadEmphasis,
            { left: road.left, top: road.top, width: road.width, transform: [{ rotate: road.rotation }] },
          ]}
        >
          <View style={[styles.roadDash, road.emphasis && styles.roadDashEmphasis]} />
        </View>
      ))}

      {vehicleMarkers.map((marker) => (
        <VehicleMarker key={marker.id} {...marker} />
      ))}
      <CrewMarker />
      <EventMarker />
    </View>
  );
}

export default function LiveMapScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>N</Text>
        </View>
        <View style={styles.logoWrap}>
          <View style={styles.logoSpeedLine} />
          <Text style={styles.logo}>NOXA</Text>
        </View>
        <View style={styles.headerActions}>
          <HeaderAction icon="search" accessibilityLabel="Search" />
          <HeaderAction icon="notifications" accessibilityLabel="Notifications" />
        </View>
      </View>

      <View style={styles.content}>
        <FakeLiveMap />

        <View style={styles.eventCard}>
          <View>
            <Text style={styles.cardKicker}>Featured live event</Text>
            <Text style={styles.cardTitle}>Night Run</Text>
            <Text style={styles.cardSubtitle}>22 participants • Starts in 18 min</Text>
          </View>
          <TouchableOpacity activeOpacity={0.82} style={styles.eventButton}>
            <Text style={styles.eventButtonText}>View Event</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(8,10,15,0.72)',
  },
  avatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: '#1A1D25',
  },
  avatarText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
  },
  logoWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  logoSpeedLine: {
    width: 42,
    height: 2,
    marginBottom: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,36,36,0.92)',
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  logo: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 6.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerAction: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: 104,
  },
  mapPanel: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
    backgroundColor: '#07090E',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 24 },
    elevation: 16,
  },
  mapVignetteTop: {
    position: 'absolute',
    top: -90,
    left: -50,
    right: -50,
    height: 230,
    borderRadius: 120,
    backgroundColor: 'rgba(255,36,36,0.075)',
  },
  mapVignetteBottom: {
    position: 'absolute',
    bottom: -110,
    left: 20,
    right: -80,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(70,82,105,0.09)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.018)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.016)',
  },
  road: {
    position: 'absolute',
    height: 24,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.035)',
    backgroundColor: 'rgba(255,255,255,0.030)',
  },
  roadEmphasis: {
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  roadDash: {
    height: 1,
    marginHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  roadDashEmphasis: {
    height: 2,
    backgroundColor: 'rgba(255,36,36,0.22)',
  },
  districtBlockOne: {
    position: 'absolute',
    left: '8%',
    top: '10%',
    width: 118,
    height: 94,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.035)',
    transform: [{ rotate: '-16deg' }],
  },
  districtBlockTwo: {
    position: 'absolute',
    right: '7%',
    top: '35%',
    width: 142,
    height: 106,
    borderRadius: 36,
    backgroundColor: 'rgba(255,36,36,0.045)',
    transform: [{ rotate: '18deg' }],
  },
  districtBlockThree: {
    position: 'absolute',
    left: '20%',
    bottom: '12%',
    width: 152,
    height: 110,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.028)',
    transform: [{ rotate: '11deg' }],
  },

  districtBlockFour: {
    position: 'absolute',
    right: '16%',
    bottom: '5%',
    width: 104,
    height: 138,
    borderRadius: 28,
    backgroundColor: 'rgba(70,82,105,0.075)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.035)',
    transform: [{ rotate: '-22deg' }],
  },
  vehicleMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,36,36,0.92)',
    shadowColor: colors.accent,
    shadowOpacity: 0.7,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  vehicleGlow: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,36,36,0.14)',
  },
  crewMarker: {
    position: 'absolute',
    top: '30%',
    left: '49%',
    alignItems: 'center',
  },
  crewHalo: {
    position: 'absolute',
    top: -10,
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  crewCore: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: '#2A303D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    transform: [{ rotate: '45deg' }],
  },
  markerCaption: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  eventMarker: {
    position: 'absolute',
    top: '42%',
    left: '43%',
    alignItems: 'center',
  },
  eventPulse: {
    position: 'absolute',
    top: -19,
    width: 86,
    height: 86,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,36,36,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,36,36,0.32)',
  },
  eventCore: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.72)',
    backgroundColor: colors.accentDark,
    shadowColor: colors.accent,
    shadowOpacity: 0.85,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  eventLabel: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(5,6,8,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  eventLabelText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  eventCard: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: 128,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(19,21,28,0.86)',
    shadowColor: '#000',
    shadowOpacity: 0.38,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 20,
  },
  cardKicker: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  cardTitle: {
    marginTop: 6,
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  cardSubtitle: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  eventButton: {
    marginTop: spacing.md,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,36,36,0.92)',
    shadowColor: colors.accent,
    shadowOpacity: 0.42,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  eventButtonText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '900',
  },
});
