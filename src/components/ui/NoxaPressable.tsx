import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { animations } from '@/src/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type NoxaPressableProps = PressableProps & {
  children: ReactNode;
  pressedOpacity?: number;
  pressedScale?: number;
  style?: PressableProps['style'];
};

export function NoxaPressable({
  children,
  disabled,
  onPressIn,
  onPressOut,
  pressedOpacity = 0.88,
  pressedScale = 0.97,
  style,
  ...props
}: NoxaPressableProps) {
  const progress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(disabled ? 0.45 : progress.value ? pressedOpacity : 1, { duration: animations.fast }),
    transform: [{ scale: withTiming(progress.value ? pressedScale : 1, { duration: animations.fast }) }],
  }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        progress.value = 1;
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        progress.value = 0;
        onPressOut?.(event);
      }}
      style={(state) => [typeof style === 'function' ? style(state) : style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}
