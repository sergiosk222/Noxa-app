import { StyleSheet, Text } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { NoxaPressable } from './NoxaPressable';

type NoxaButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type NoxaButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: NoxaButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
};

export function NoxaButton({ title, onPress, variant = 'primary', disabled = false, fullWidth = false, loading = false }: NoxaButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <NoxaPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}>
      <Text style={[styles.text, styles[`${variant}Text`], isDisabled && styles.disabledText]}>{loading ? 'Loading…' : title}</Text>
    </NoxaPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { width: '100%' },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadows.redGlow },
  secondary: { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  danger: { backgroundColor: colors.accentDark, borderColor: colors.borderAccent },
  disabled: { opacity: 0.45 },
  text: {
    fontSize: typography.body,
    fontWeight: '800',
    letterSpacing: typography.letterSpacing.caption,
    lineHeight: typography.lineHeight.body,
  },
  primaryText: { color: colors.text },
  secondaryText: { color: colors.text },
  ghostText: { color: colors.textMuted },
  dangerText: { color: colors.text },
  disabledText: { color: colors.textMuted },
});
