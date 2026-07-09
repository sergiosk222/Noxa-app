import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, FadeInDown } from 'react-native-reanimated';

import { animations, colors, radius, shadows, spacing } from '@/src/theme';

type NoxaAnimatedCardProps = {
  children: ReactNode;
  compact?: boolean;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

export function NoxaAnimatedCard({ children, compact = false, delay = 0, style }: NoxaAnimatedCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(animations.entrance).delay(delay).easing(Easing.out(Easing.cubic)).withInitialValues({ opacity: 0, transform: [{ translateY: animations.entranceDistance }] })} style={[styles.card, compact && styles.compact, style]}>
      {children}
    </Animated.View>
  );
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
