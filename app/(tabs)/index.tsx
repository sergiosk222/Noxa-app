import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { animations } from '@/src/theme/animations';
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

const highways = [
  { id: 'harbor-loop', top: '34%', left: '-18%', width: '142%', rotation: '-22deg' },
  { id: 'elevated-east', top: '62%', left: '18%', width: '96%', rotation: '26deg' },
] as const;

const arterialRoads = [
  { id: 'midtown', top: '18%', left: '3%', width: '82%', rotation: '18deg' },
  { id: 'overpass', top: '47%', left: '13%', width: '92%', rotation: '60deg' },
  { id: 'south-bay', top: '76%', left: '-6%', width: '76%', rotation: '-12deg' },
  { id: 'canyon', top: '56%', left: '38%', width: '80%', rotation: '-42deg' },
] as const;

const streetRoads = [
  { id: 'west-cut', top: '28%', left: '5%', width: '42%', rotation: '-55deg' },
  { id: 'market', top: '40%', left: '50%', width: '44%', rotation: '8deg' },
  { id: 'garage-row', top: '66%', left: '11%', width: '50%', rotation: '52deg' },
  { id: 'district-spur', top: '23%', left: '57%', width: '38%', rotation: '-68deg' },
  { id: 'dock-road', top: '84%', left: '35%', width: '46%', rotation: '5deg' },
] as const;

const intersections = [
  { id: 'one', left: '31%', top: '38%', size: 9 },
  { id: 'two', left: '55%', top: '47%', size: 11 },
  { id: 'three', left: '68%', top: '60%', size: 8 },
  { id: 'four', left: '23%', top: '70%', size: 7 },
] as const;

const parkingAreas = [
  { id: 'garage-west', style: 'parkingOne' },
  { id: 'rooftop-east', style: 'parkingTwo' },
] as const;

const districtBlocks = [
  { id: 'west', style: 'districtBlockOne' },
  { id: 'uptown', style: 'districtBlockTwo' },
  { id: 'east', style: 'districtBlockThree' },
  { id: 'harbor', style: 'districtBlockFour' },
  { id: 'terminal', style: 'districtBlockFive' },
] as const;

const ambientParticles = [
  { id: 'p1', left: '12%', top: '19%', opacity: 0.26 },
  { id: 'p2', left: '82%', top: '15%', opacity: 0.18 },
  { id: 'p3', left: '74%', top: '72%', opacity: 0.22 },
  { id: 'p4', left: '35%', top: '83%', opacity: 0.16 },
  { id: 'p5', left: '47%', top: '30%', opacity: 0.2 },
  { id: 'p6', left: '9%', top: '62%', opacity: 0.18 },
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

function Road({ road, variant }: { road: (typeof highways)[number] | (typeof arterialRoads)[number] | (typeof streetRoads)[number]; variant: 'highway' | 'arterial' | 'street' }) {
  return (
    <View style={[styles.road, styles[variant], { left: road.left, top: road.top, width: road.width, transform: [{ rotate: road.rotation }] }]}>
      <View style={[styles.roadCenter, styles[`${variant}Center`]]} />
    </View>
  );
}

function VehicleMarker({ left, top, rotation }: (typeof vehicleMarkers)[number]) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 420, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <View style={[styles.vehicleMarker, { left, top, transform: [{ rotate: rotation }] }]}> 
      <Animated.View
        style={[
          styles.vehicleGlow,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.62] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.2] }) }],
          },
        ]}
      />
      <Ionicons name="navigate" size={13} color={colors.text} />
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
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ).start();
  }, [pulse]);

  return (
    <View style={styles.eventMarker}>
      <Animated.View
        style={[
          styles.eventPulse,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1.34] }) }],
          },
        ]}
      />
      <View style={styles.eventRing} />
      <View style={styles.eventCore}>
        <Ionicons name="flag" size={18} color={colors.text} />
      </View>
      <View style={styles.eventLabel}>
        <Text style={styles.eventLabelText}>EVENT</Text>
      </View>
    </View>
  );
}

function EventCard() {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: animations.entrance, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [entrance]);

  return (
    <Animated.View
      style={[
        styles.eventCard,
        {
          opacity: entrance,
          transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [animations.entranceDistance, 0] }) }],
        },
      ]}>
      <View>
        <Text style={styles.cardKicker}>Featured live event</Text>
        <Text style={styles.cardTitle}>Night Run</Text>
        <Text style={styles.cardSubtitle}>22 participants • Starts in 18 min</Text>
      </View>
      <TouchableOpacity activeOpacity={0.82} style={styles.eventButton}>
        <Text style={styles.eventButtonText}>View Event</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function FakeLiveMap() {
  return (
    <View style={styles.mapPanel}>
      <View style={styles.cityGlow} />
      <View style={styles.cornerShadeLeft} />
      <View style={styles.cornerShadeRight} />
      <View style={styles.mapFogOne} />
      <View style={styles.mapFogTwo} />

      {districtBlocks.map((block) => (
        <View key={block.id} style={styles[block.style]} />
      ))}
      {parkingAreas.map((area) => (
        <View key={area.id} style={styles[area.style]}>
          <View style={styles.parkingStripe} />
          <View style={[styles.parkingStripe, styles.parkingStripeOffset]} />
        </View>
      ))}

      {streetRoads.map((road) => <Road key={road.id} road={road} variant="street" />)}
      {arterialRoads.map((road) => <Road key={road.id} road={road} variant="arterial" />)}
      {highways.map((road) => <Road key={road.id} road={road} variant="highway" />)}
      {intersections.map((point) => <View key={point.id} style={[styles.intersection, { left: point.left, top: point.top, width: point.size, height: point.size }]} />)}

      {ambientParticles.map((particle) => <View key={particle.id} style={[styles.ambientParticle, { left: particle.left, top: particle.top, opacity: particle.opacity }]} />)}
      {vehicleMarkers.map((marker) => <VehicleMarker key={marker.id} {...marker} />)}
      <CrewMarker />
      <EventMarker />
      <View style={styles.mapVignetteTop} />
      <View style={styles.mapVignetteBottom} />
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
          <HeaderAction icon="search-outline" accessibilityLabel="Search" />
          <HeaderAction icon="notifications-outline" accessibilityLabel="Notifications" />
        </View>
      </View>

      <View style={styles.content}>
        <FakeLiveMap />
        <EventCard />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#080A0E',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  avatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: '#141821',
    shadowColor: '#000',
    shadowOpacity: 0.34,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
  },
  avatarText: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  logoWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  logoSpeedLine: {
    width: 44,
    height: 2,
    marginBottom: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
    backgroundColor: 'rgba(255,36,36,0.96)',
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  logo: { color: colors.text, fontSize: 17, fontWeight: '900', letterSpacing: 7.2 },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerAction: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    backgroundColor: '#131720',
    shadowColor: '#000',
    shadowOpacity: 0.38,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
  },
  content: { flex: 1, paddingHorizontal: spacing.md, paddingBottom: 104 },
  mapPanel: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#06080D',
    shadowColor: '#000',
    shadowOpacity: 0.52,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 24 },
    elevation: 16,
  },
  cityGlow: { position: 'absolute', top: '22%', left: '18%', width: 260, height: 260, borderRadius: 150, backgroundColor: 'rgba(115,126,145,0.06)' },
  cornerShadeLeft: { position: 'absolute', left: -70, bottom: -70, width: 190, height: 230, borderRadius: 90, backgroundColor: 'rgba(0,0,0,0.48)' },
  cornerShadeRight: { position: 'absolute', right: -80, top: -60, width: 210, height: 230, borderRadius: 105, backgroundColor: 'rgba(0,0,0,0.42)' },
  mapFogOne: { position: 'absolute', top: '8%', left: '-10%', width: '78%', height: 130, borderRadius: 80, backgroundColor: 'rgba(120,135,160,0.055)', transform: [{ rotate: '-10deg' }] },
  mapFogTwo: { position: 'absolute', bottom: '18%', right: '-8%', width: '82%', height: 150, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.035)', transform: [{ rotate: '16deg' }] },
  road: { position: 'absolute', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.34, shadowRadius: 10, shadowOffset: { width: 0, height: 7 } },
  highway: { height: 34, backgroundColor: 'rgba(47,52,63,0.94)', borderColor: 'rgba(255,255,255,0.075)' },
  arterial: { height: 22, backgroundColor: 'rgba(35,40,49,0.88)', borderColor: 'rgba(255,255,255,0.055)' },
  street: { height: 12, backgroundColor: 'rgba(27,32,40,0.72)', borderColor: 'rgba(255,255,255,0.035)' },
  roadCenter: { alignSelf: 'stretch', marginHorizontal: spacing.lg, borderRadius: radius.pill },
  highwayCenter: { height: 2, backgroundColor: 'rgba(220,226,235,0.15)' },
  arterialCenter: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  streetCenter: { height: 1, backgroundColor: 'rgba(255,255,255,0.055)' },
  intersection: { position: 'absolute', borderRadius: radius.pill, backgroundColor: 'rgba(235,239,245,0.18)', shadowColor: colors.accent, shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  districtBlockOne: { position: 'absolute', left: '7%', top: '10%', width: 120, height: 94, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.032)', transform: [{ rotate: '-16deg' }] },
  districtBlockTwo: { position: 'absolute', right: '7%', top: '34%', width: 142, height: 106, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.03)', transform: [{ rotate: '18deg' }] },
  districtBlockThree: { position: 'absolute', left: '19%', bottom: '12%', width: 152, height: 110, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.028)', transform: [{ rotate: '11deg' }] },
  districtBlockFour: { position: 'absolute', right: '16%', bottom: '5%', width: 104, height: 138, borderRadius: 28, backgroundColor: 'rgba(70,82,105,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.035)', transform: [{ rotate: '-22deg' }] },
  districtBlockFive: { position: 'absolute', left: '42%', top: '6%', width: 84, height: 150, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.022)', transform: [{ rotate: '29deg' }] },
  parkingOne: { position: 'absolute', left: '10%', top: '52%', width: 72, height: 48, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.028)', transform: [{ rotate: '-12deg' }] },
  parkingTwo: { position: 'absolute', right: '11%', top: '20%', width: 84, height: 52, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.025)', transform: [{ rotate: '18deg' }] },
  parkingStripe: { position: 'absolute', top: 14, left: 10, right: 10, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  parkingStripeOffset: { top: 30 },
  ambientParticle: { position: 'absolute', width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.85)' },
  mapVignetteTop: { position: 'absolute', top: -110, left: -70, right: -70, height: 240, borderRadius: 130, backgroundColor: 'rgba(70,82,105,0.08)' },
  mapVignetteBottom: { position: 'absolute', bottom: -130, left: -40, right: -90, height: 280, borderRadius: 150, backgroundColor: 'rgba(0,0,0,0.54)' },
  vehicleMarker: { position: 'absolute', width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.46)', backgroundColor: 'rgba(255,36,36,0.96)', shadowColor: colors.accent, shadowOpacity: 0.8, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  vehicleGlow: { position: 'absolute', width: 44, height: 44, borderRadius: radius.pill, backgroundColor: 'rgba(255,36,36,0.22)' },
  crewMarker: { position: 'absolute', top: '30%', left: '49%', alignItems: 'center' },
  crewHalo: { position: 'absolute', top: -10, width: 58, height: 58, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  crewCore: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: '#151923', borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)', shadowColor: '#FFFFFF', shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  markerCaption: { marginTop: spacing.xs, color: colors.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  eventMarker: { position: 'absolute', top: '42%', left: '43%', alignItems: 'center' },
  eventPulse: { position: 'absolute', top: -22, width: 92, height: 92, borderRadius: radius.pill, backgroundColor: 'rgba(255,36,36,0.18)', borderWidth: 1, borderColor: 'rgba(255,36,36,0.42)' },
  eventRing: { position: 'absolute', top: -8, width: 64, height: 64, borderRadius: radius.pill, borderWidth: 2, borderColor: 'rgba(255,36,36,0.60)', backgroundColor: 'rgba(255,36,36,0.08)' },
  eventCore: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 2, borderColor: 'rgba(255,255,255,0.72)', backgroundColor: colors.accentDark, shadowColor: colors.accent, shadowOpacity: 0.9, shadowRadius: 24, shadowOffset: { width: 0, height: 0 }, elevation: 14 },
  eventLabel: { marginTop: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: 'rgba(5,6,8,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  eventLabelText: { color: colors.text, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  eventCard: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: 128, padding: spacing.md, borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)', backgroundColor: '#11141B', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 24, shadowOffset: { width: 0, height: 18 }, elevation: 18 },
  cardKicker: { color: colors.accent, fontSize: typography.caption, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  cardTitle: { marginTop: 4, color: colors.text, fontSize: 25, fontWeight: '900', letterSpacing: -0.7 },
  cardSubtitle: { marginTop: 2, color: colors.textMuted, fontSize: typography.caption, fontWeight: '600' },
  eventButton: { marginTop: spacing.sm, height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,36,36,0.44)', backgroundColor: '#D71920', shadowColor: colors.accent, shadowOpacity: 0.34, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  eventButtonText: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
});
