import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, shadows, typography } from '@/src/theme';

type NoxaFloatingActionButtonProps = {
  onPress?: () => void;
  icon?: ReactNode;
  accessibilityLabel: string;
};

export function NoxaFloatingActionButton({ onPress, icon, accessibilityLabel }: NoxaFloatingActionButtonProps) {
  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} style={styles.fab}>
      {icon ?? <Text style={styles.plus}>+</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    ...shadows.redGlow,
  },
  plus: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '800',
    lineHeight: 32,
  },
});
