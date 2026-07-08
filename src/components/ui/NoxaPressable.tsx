import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { animations } from '@/src/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type NoxaPressableProps = PressableProps & {
  children: ReactNode;
  disabled?: boolean;
  pressedScale?: number;
  pressedOpacity?: number;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
};

export function NoxaPressable({
  children,
  disabled = false,
  onPressIn,
  onPressOut,
  pressedScale = animations.pressedScale,
  pressedOpacity = 0.92,
  style,
  ...props
}: NoxaPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withTiming(pressedScale, { duration: animations.fast, easing: Easing.out(Easing.cubic) });
          opacity.value = withTiming(pressedOpacity, { duration: animations.fast, easing: Easing.out(Easing.cubic) });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: animations.base, easing: Easing.out(Easing.cubic) });
        opacity.value = withTiming(1, { duration: animations.base, easing: Easing.out(Easing.cubic) });
        onPressOut?.(event);
      }}
      style={(state) => [typeof style === 'function' ? style(state) : style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}
