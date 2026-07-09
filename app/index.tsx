import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { NoxaBrandLockup, NoxaWordmark } from '@/src/components/brand';
import { colors, radius, spacing } from '@/src/theme';

const SPLASH_COMPLETE_MS = 2100;

export default function SplashScreen() {
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.72);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.86);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkLift = useSharedValue(10);
  const sloganOpacity = useSharedValue(0);
  const sloganLift = useSharedValue(8);

  useEffect(() => {
    glowOpacity.value = withDelay(250, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
    glowScale.value = withDelay(250, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
    logoOpacity.value = withDelay(600, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(600, withTiming(1, { duration: 450, easing: Easing.out(Easing.exp) }));
    wordmarkOpacity.value = withDelay(1050, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    wordmarkLift.value = withDelay(1050, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
    sloganOpacity.value = withDelay(1450, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }));
    sloganLift.value = withDelay(1450, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }));

    const markers = [
      setTimeout(() => console.log('Splash: glow'), 250),
      setTimeout(() => console.log('Splash: logo'), 600),
      setTimeout(() => console.log('Splash: wordmark'), 1050),
      setTimeout(() => console.log('Splash: slogan'), 1450),
    ];

    const timer = setTimeout(() => {
      console.log('Splash: navigate');
      router.replace('/welcome');
    }, SPLASH_COMPLETE_MS);

    return () => {
      markers.forEach(clearTimeout);
      clearTimeout(timer);
    };
  }, [
    glowOpacity,
    glowScale,
    logoOpacity,
    logoScale,
    sloganLift,
    sloganOpacity,
    wordmarkLift,
    wordmarkOpacity,
  ]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scaleX: glowScale.value }, { scaleY: 1 }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkLift.value }],
  }));

  const sloganStyle = useAnimatedStyle(() => ({
    opacity: sloganOpacity.value,
    transform: [{ translateY: sloganLift.value }],
  }));

  return (
    <View style={styles.screen}>
      <View style={styles.centerStage}>
        <Animated.View style={[styles.redLightLine, glowStyle]} />
        <Animated.View style={[styles.brandLockup, logoStyle]}>
          <NoxaBrandLockup size={156} showWordmark={false} showSlogan={false} />
        </Animated.View>
        <Animated.View style={[styles.wordmarkLockup, wordmarkStyle]}>
          <NoxaWordmark size={42} showSlogan={false} />
        </Animated.View>
        <Animated.View style={sloganStyle}>
          <NoxaWordmark size={42} showWordmark={false} showSlogan compact />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  redLightLine: {
    position: 'absolute',
    top: 72,
    width: 360,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,36,36,0.3)',
    shadowColor: colors.accent,
    shadowOpacity: 0.7,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
  },
  brandLockup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkLockup: {
    marginTop: spacing.sm,
  },
});
