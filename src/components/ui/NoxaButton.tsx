import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/src/theme';

type NoxaButtonVariant = 'primary' | 'secondary' | 'ghost';

type NoxaButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: NoxaButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function NoxaButton({ title, onPress, variant = 'primary', disabled = false, fullWidth = false }: NoxaButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.text, styles[`${variant}Text`], disabled && styles.disabledText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.primary,
    ...shadows.redGlow,
  },
  secondary: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 1 }, { scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontSize: typography.body,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  primaryText: {
    color: colors.text,
  },
  secondaryText: {
    color: colors.text,
  },
  ghostText: {
    color: colors.textMuted,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
