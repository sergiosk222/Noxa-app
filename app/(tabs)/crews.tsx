import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export default function CrewsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.accentLine} />
        <Text style={styles.title}>Crews</Text>
        <Text style={styles.subtitle}>Build your circle without the noise.</Text>
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>Coming soon</Text>
          <Text style={styles.cardText}>Create a home base for trusted drivers, private crew identity, and upcoming meet plans.</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingBottom: 116,
  },
  accentLine: {
    width: 52,
    height: 4,
    marginBottom: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  title: {
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.subtitle,
    lineHeight: 26,
  },
  card: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  cardEyebrow: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  cardText: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 24,
  },
});
