import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={color} />
      {focused ? <View style={styles.activeIndicator} /> : null}
    </View>
  );
}

function MapIcon({ color, focused }: { color: string; focused: boolean }) {
  return (
    <View style={[styles.mapIcon, focused && styles.mapIconActive]}>
      <Ionicons name="map" size={26} color={color} />
      {focused ? <View style={styles.mapActiveIndicator} /> : null}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}>
      <Tabs.Screen
        name="crews"
        options={{
          title: 'Crews',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarLabelStyle: [styles.label, styles.mapLabel],
          tabBarIcon: ({ focused }) => <MapIcon color={colors.text} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="garage"
        options={{
          title: 'Garage',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'car-sport' : 'car-sport-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    height: 78,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.accent,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  tabItem: {
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  mapLabel: {
    color: colors.accent,
  },
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,45,45,0.14)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 16,
    height: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  mapIcon: {
    width: 58,
    height: 58,
    marginTop: -spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    borderWidth: 4,
    borderColor: colors.background,
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  mapIconActive: {
    backgroundColor: colors.accentDark,
  },
  mapActiveIndicator: {
    position: 'absolute',
    bottom: 7,
    width: 20,
    height: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
});
