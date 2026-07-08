import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/src/theme';

type NoxaSectionTitleProps = {
  label?: string;
  title: string;
};

export function NoxaSectionTitle({ label, title }: NoxaSectionTitleProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xxs,
  },
  label: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
});
