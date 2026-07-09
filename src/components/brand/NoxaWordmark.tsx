import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/src/theme';

type NoxaWordmarkProps = {
  size?: number;
  showWordmark?: boolean;
  showSlogan?: boolean;
  compact?: boolean;
};

export function NoxaWordmark({
  size = 42,
  showWordmark = true,
  showSlogan = false,
  compact = false,
}: NoxaWordmarkProps) {
  const letterSpacing = compact ? size * 0.2 : size * 0.32;

  return (
    <View style={styles.wrapper}>
      {showWordmark ? <Text style={[styles.wordmark, { fontSize: size, letterSpacing, lineHeight: size + 8 }]}>NOXA</Text> : null}
      {showSlogan ? (
        <Text style={[styles.slogan, { fontSize: Math.max(9, size * 0.25), letterSpacing: size * 0.16 }]}>OWN THE NIGHT</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  wordmark: {
    color: colors.text,
    fontWeight: '800',
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  slogan: {
    marginTop: spacing.xs,
    color: colors.accent,
    fontWeight: '800',
    lineHeight: 16,
    textShadowColor: 'rgba(255,36,36,0.36)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
