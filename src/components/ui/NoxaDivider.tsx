import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/src/theme';

type NoxaDividerProps = {
  inset?: boolean;
};

export function NoxaDivider({ inset = false }: NoxaDividerProps) {
  return <View style={[styles.divider, inset && styles.inset]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  inset: {
    marginLeft: spacing.md,
  },
});
