import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, PanResponder, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { featuredEvent } from '@/src/data';
import { shadows } from '@/src/theme/shadows';

const driverPreviews = [
  {
    id: 'r32',
    left: '18%',
    top: '26%',
    rotation: '-18deg',
    name: 'Kai Nakamura',
    username: '@kai.r32',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    online: true,
    distance: '1.2 km away',
    vehicleImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=85',
    carName: 'Nissan Skyline R32',
    specs: ['420 HP', 'Manual', 'RWD'],
    crew: 'Midnight Society',
    stats: { reputation: '4.9', events: '28', cars: '3', followers: '12.4K' },
  },
  {
    id: 'supra',
    left: '70%',
    top: '22%',
    rotation: '24deg',
    name: 'Mia Torres',
    username: '@mialine',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
    online: true,
    distance: '2.8 km away',
    vehicleImage: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=900&q=85',
    carName: 'Toyota Supra A90',
    specs: ['510 HP', 'Auto', 'RWD'],
    crew: 'Redline Syndicate',
    stats: { reputation: '4.8', events: '19', cars: '2', followers: '8.7K' },
  },
  {
    id: 'nsx',
    left: '58%',
    top: '55%',
    rotation: '-32deg',
    name: 'Alex Voss',
    username: '@voss.nsx',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
    online: false,
    distance: '3.4 km away',
    vehicleImage: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=85',
    carName: 'Acura NSX',
    specs: ['573 HP', 'DCT', 'AWD'],
    crew: 'Carbon District',
    stats: { reputation: '4.7', events: '14', cars: '5', followers: '6.1K' },
  },
  {
    id: 'rx7',
    left: '28%',
    top: '68%',
    rotation: '18deg',
    name: 'Noah Cross',
    username: '@rotarynoah',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80',
    online: true,
    distance: '900 m away',
    vehicleImage: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=900&q=85',
    carName: 'Mazda RX-7 FD',
    specs: ['455 HP', 'Manual', 'RWD'],
    crew: 'Midnight Society',
    stats: { reputation: '5.0', events: '33', cars: '4', followers: '15.2K' },
  },
] as const;

type DriverPreview = (typeof driverPreviews)[number];

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

function VehicleMarker({ driver, onPress }: { driver: DriverPreview; onPress: (driver: DriverPreview) => void }) {
  const { left, top, rotation } = driver;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <TouchableOpacity accessibilityLabel={`Open ${driver.name} preview`} activeOpacity={0.82} onPress={() => onPress(driver)} style={[styles.vehicleMarker, { left, top, transform: [{ rotate: rotation }] }]}> 
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
    </TouchableOpacity>
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
      Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
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
    Animated.timing(entrance, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [entrance]);

  return (
    <Animated.View
      style={[
        styles.eventCard,
        {
          opacity: entrance,
          transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}>
      <View>
        <Text style={styles.cardKicker}>Featured live event</Text>
        <Text style={styles.cardTitle}>{featuredEvent.title}</Text>
        <Text style={styles.cardSubtitle}>{featuredEvent.participantsCount} participants • Starts in 18 min</Text>
      </View>
      <TouchableOpacity activeOpacity={0.82} style={styles.eventButton}>
        <Text style={styles.eventButtonText}>View Event</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function FakeLiveMap({ onDriverPress }: { onDriverPress: (driver: DriverPreview) => void }) {
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
      {driverPreviews.map((driver) => <VehicleMarker key={driver.id} driver={driver} onPress={onDriverPress} />)}
      <CrewMarker />
      <EventMarker />
      <View style={styles.mapVignetteTop} />
      <View style={styles.mapVignetteBottom} />
    </View>
  );
}


const quickStats = [
  { key: 'reputation', icon: '⭐', label: 'Reputation' },
  { key: 'events', icon: '🏁', label: 'Events' },
  { key: 'cars', icon: '🚘', label: 'Cars' },
  { key: 'followers', icon: '👥', label: 'Followers' },
] as const;

function DriverPreviewCard({ driver, onClose }: { driver: DriverPreview; onClose: () => void }) {
  const translateY = useRef(new Animated.Value(430)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, damping: 21, stiffness: 185, mass: 0.85, useNativeDriver: true }),
    ]).start();
  }, [overlayOpacity, translateY]);

  const closeWithAnimation = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 430, duration: 320, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
    ]).start(onClose);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => translateY.setValue(Math.max(0, gesture.dy)),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 86 || gesture.vy > 0.9) {
          closeWithAnimation();
          return;
        }

        Animated.spring(translateY, { toValue: 0, damping: 20, stiffness: 180, useNativeDriver: true }).start();
      },
    }),
  ).current;

  return (
    <View style={styles.previewLayer} pointerEvents="box-none">
      <Pressable accessibilityLabel="Close driver preview" onPress={closeWithAnimation} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.previewScrim, { opacity: overlayOpacity }]} />
      </Pressable>
      <Animated.View style={[styles.driverCard, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
        <View style={styles.dragHandle} />
        <View style={styles.driverHeader}>
          <Image source={{ uri: driver.avatar }} style={styles.driverAvatar} />
          <View style={styles.driverIdentity}>
            <View style={styles.nameRow}>
              <Text style={styles.driverName}>{driver.name}</Text>
              {driver.online ? <Text style={styles.onlineBadge}>ONLINE</Text> : null}
            </View>
            <Text style={styles.driverUsername}>{driver.username}</Text>
            <Text style={styles.driverDistance}>{driver.distance}</Text>
          </View>
        </View>

        <View style={styles.vehicleSection}>
          <Image source={{ uri: driver.vehicleImage }} style={styles.vehicleImage} />
          <View style={styles.vehicleGradient} />
          <View style={styles.vehicleCopy}>
            <Text style={styles.vehicleName}>{driver.carName}</Text>
            <View style={styles.specRow}>
              {driver.specs.map((spec) => (
                <Text key={spec} style={styles.specPill}>{spec}</Text>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.82} style={styles.crewBadge}>
          <Ionicons name="shield-checkmark" size={15} color={colors.accent} />
          <Text style={styles.crewText}>{driver.crew}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          {quickStats.map((stat) => (
            <View key={stat.key} style={styles.statTile}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{driver.stats[stat.key]}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity activeOpacity={0.86} style={styles.profileButton}>
            <Text style={styles.profileButtonText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.82} style={styles.messageButton}>
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

export default function LiveMapScreen() {
  const [selectedDriver, setSelectedDriver] = useState<DriverPreview | null>(null);

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
        <FakeLiveMap onDriverPress={setSelectedDriver} />
        <EventCard />
      </View>
      {selectedDriver ? <DriverPreviewCard driver={selectedDriver} onClose={() => setSelectedDriver(null)} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 62,
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
  content: { flex: 1, paddingHorizontal: spacing.md, paddingBottom: 112 },
  mapPanel: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.card,
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
  eventCard: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: 134, padding: spacing.lg, borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)', backgroundColor: '#11141B', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 24, shadowOffset: { width: 0, height: 18 }, elevation: 18 },
  cardKicker: { color: colors.accent, fontSize: typography.caption, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  cardTitle: { marginTop: 4, color: colors.text, fontSize: 25, fontWeight: '900', letterSpacing: -0.7 },
  cardSubtitle: { marginTop: 2, color: colors.textMuted, fontSize: typography.caption, fontWeight: '600' },
  eventButton: { marginTop: spacing.sm, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,36,36,0.44)', backgroundColor: '#D71920', shadowColor: colors.accent, shadowOpacity: 0.34, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  eventButtonText: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  previewLayer: { ...StyleSheet.absoluteFillObject, zIndex: 30, justifyContent: 'flex-end' },
  previewScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.46)' },
  driverCard: {
    marginHorizontal: spacing.md,
    marginBottom: 96,
    padding: spacing.lg,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(14,16,22,0.96)',
    ...shadows.card,
    shadowOpacity: 0.66,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 24 },
    elevation: 24,
  },
  dragHandle: { alignSelf: 'center', width: 48, height: 5, marginBottom: spacing.md, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.24)' },
  driverHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  driverAvatar: { width: 82, height: 82, borderRadius: radius.pill, borderWidth: 2, borderColor: 'rgba(255,255,255,0.84)', backgroundColor: colors.surfaceSoft },
  driverIdentity: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  driverName: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  onlineBadge: { overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, color: '#06120A', backgroundColor: colors.success, fontSize: 10, fontWeight: '900', letterSpacing: 0.9 },
  driverUsername: { marginTop: 2, color: colors.textMuted, fontSize: typography.body, fontWeight: '700' },
  driverDistance: { marginTop: 7, color: colors.text, fontSize: typography.caption, fontWeight: '800' },
  vehicleSection: { marginTop: spacing.lg, height: 152, overflow: 'hidden', borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', backgroundColor: '#080A0E' },
  vehicleImage: { width: '100%', height: '100%' },
  vehicleGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },
  vehicleCopy: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
  vehicleName: { color: colors.text, fontSize: 21, fontWeight: '900', letterSpacing: -0.4, textShadowColor: 'rgba(0,0,0,0.55)', textShadowRadius: 10, textShadowOffset: { width: 0, height: 3 } },
  specRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  specPill: { overflow: 'hidden', paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', color: colors.text, backgroundColor: 'rgba(8,10,14,0.72)', fontSize: 11, fontWeight: '900' },
  crewBadge: { marginTop: spacing.md, height: 42, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', backgroundColor: 'rgba(255,255,255,0.07)' },
  crewText: { color: colors.text, fontSize: typography.caption, fontWeight: '900' },
  statsGrid: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  statTile: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.055)' },
  statIcon: { fontSize: 16 },
  statValue: { marginTop: 3, color: colors.text, fontSize: typography.body, fontWeight: '900' },
  statLabel: { marginTop: 2, color: colors.textMuted, fontSize: 9, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  profileButton: { flex: 1.35, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.accentDark, borderWidth: 1, borderColor: 'rgba(255,80,80,0.62)', shadowColor: colors.accent, shadowOpacity: 0.46, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  profileButtonText: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  messageButton: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.08)' },
  messageButtonText: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
});
