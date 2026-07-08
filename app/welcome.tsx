import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { NoxaButton, NoxaCard, NoxaScreen } from '@/src/components/ui';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function WelcomeScreen() {
  return (
    <NoxaScreen padded={false}>
      <View style={styles.backgroundGlow} />
      <View style={styles.topLight} />

      <View style={styles.content}>
        <View style={styles.brandBlock}>
          <Text style={styles.logo}>NOXA</Text>
          <View style={styles.logoUnderline} />
        </View>

        <NoxaCard>
          <View style={styles.heroCard}>
            <View style={styles.cardGlow} />
            <Text style={styles.eyebrow}>MIDNIGHT SOCIAL CLUB</Text>
            <Text style={styles.headline}>Drive the night.</Text>
            <Text style={styles.subtitle}>Find crews, events, and drivers around you.</Text>
          </View>
        </NoxaCard>

        <View style={styles.actions}>
          <NoxaButton fullWidth title="Continue as Guest" onPress={() => router.replace('/(tabs)')} />

          <View style={styles.secondaryActions}>
            <NoxaButton fullWidth title="Sign in with Email" variant="secondary" />
            <NoxaButton fullWidth title="Create Account" variant="secondary" />
          </View>
        </View>
      </View>
    </NoxaScreen>
  );
}

const styles = StyleSheet.create({
  backgroundGlow: {
    position: 'absolute',
    left: -120,
    right: -120,
    bottom: -180,
    height: 360,
    borderRadius: 360,
    backgroundColor: 'rgba(255,36,36,0.12)',
    shadowColor: colors.accent,
    shadowOpacity: 0.42,
    shadowRadius: 90,
    shadowOffset: { width: 0, height: 0 },
  },
  topLight: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 220,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.36)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  brandBlock: {
    alignItems: 'center',
  },
  logo: {
    color: colors.text,
    fontSize: typography.sectionTitle,
    fontWeight: '900',
    letterSpacing: 12,
    marginLeft: 12,
  },
  logoUnderline: {
    width: 52,
    height: 2,
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  heroCard: {
    minHeight: 320,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(255,36,36,0.14)',
  },
  eyebrow: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  headline: {
    color: colors.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  subtitle: {
    maxWidth: 280,
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: typography.cardTitle,
    fontWeight: '500',
    lineHeight: 25,
  },
  actions: {
    gap: spacing.md,
  },
  secondaryActions: {
    gap: spacing.sm,
  },
});
