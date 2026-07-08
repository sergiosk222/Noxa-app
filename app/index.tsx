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

import { NoxaLogoMark } from '@/src/components/NoxaLogoMark';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

const SPLASH_COMPLETE_MS = 2000;

export default function SplashScreen() {
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.82);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const wordmarkOpacity = useSharedValue(0);
  const sloganOpacity = useSharedValue(0);

  useEffect(() => {
    glowOpacity.value = withDelay(300, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    glowScale.value = withDelay(300, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    logoOpacity.value = withDelay(600, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(600, withTiming(1, { duration: 620, easing: Easing.out(Easing.exp) }));
    wordmarkOpacity.value = withDelay(1100, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    sloganOpacity.value = withDelay(1400, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));

    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, SPLASH_COMPLETE_MS);

    return () => clearTimeout(timer);
  }, [glowOpacity, glowScale, logoOpacity, logoScale, sloganOpacity, wordmarkOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({ opacity: wordmarkOpacity.value }));
  const sloganStyle = useAnimatedStyle(() => ({ opacity: sloganOpacity.value }));

  return (
    <View style={styles.screen}>
      <View style={styles.centerStage}>
        <Animated.View style={[styles.redGlow, glowStyle]} />
        <Animated.View style={logoStyle}>
          <NoxaLogoMark />
        </Animated.View>
        <Animated.Text style={[styles.wordmark, wordmarkStyle]}>NOXA</Animated.Text>
        <Animated.Text style={[styles.slogan, sloganStyle]}>OWN THE NIGHT</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  redGlow: {
    position: 'absolute',
    top: -26,
    width: 230,
    height: 230,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,36,36,0.2)',
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 72,
    shadowOffset: { width: 0, height: 0 },
  },
  wordmark: {
    marginTop: spacing.xl,
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: '800',
    letterSpacing: 11,
  },
  slogan: {
    marginTop: spacing.sm,
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 5,
  },
});
