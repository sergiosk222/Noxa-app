import { StyleSheet, Text } from 'react-native';

import { NoxaPressable } from './NoxaPressable';

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
    <NoxaPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={() => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.text, styles[`${variant}Text`], disabled && styles.disabledText]}>{title}</Text>
    </NoxaPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
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
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontSize: typography.body,
    fontWeight: '900',
    letterSpacing: 0.2,
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
