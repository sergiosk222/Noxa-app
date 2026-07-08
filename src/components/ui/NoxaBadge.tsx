import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/theme';

type NoxaBadgeVariant = 'default' | 'primary' | 'success' | 'warning';

type NoxaBadgeProps = {
  label: string;
  variant?: NoxaBadgeVariant;
};

export function NoxaBadge({ label, variant = 'default' }: NoxaBadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 26,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  default: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: 'rgba(255,45,45,0.14)',
    borderColor: 'rgba(255,45,45,0.32)',
  },
  success: {
    backgroundColor: 'rgba(34,197,94,0.14)',
    borderColor: 'rgba(34,197,94,0.32)',
  },
  warning: {
    backgroundColor: 'rgba(245,158,11,0.14)',
    borderColor: 'rgba(245,158,11,0.32)',
  },
  text: {
    fontSize: typography.badge,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  defaultText: {
    color: colors.textMuted,
  },
  primaryText: {
    color: colors.primary,
  },
  successText: {
    color: colors.success,
  },
  warningText: {
    color: colors.warning,
  },
});
