import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/src/theme';

type NoxaCardProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  compact?: boolean;
};

export function NoxaCard({ children, style, compact = false }: NoxaCardProps) {
  return <View style={[styles.card, compact && styles.compact, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  compact: {
    padding: spacing.md,
  },
});
