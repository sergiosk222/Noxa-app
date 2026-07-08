import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

const SPLASH_COMPLETE_MS = 2000;

export default function SplashScreen() {
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.58);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.96);
  const logoLift = useSharedValue(8);
  const wordmarkOpacity = useSharedValue(0);
  const sloganOpacity = useSharedValue(0);

  useEffect(() => {
    glowOpacity.value = withDelay(120, withTiming(1, { duration: 760, easing: Easing.out(Easing.cubic) }));
    glowScale.value = withDelay(120, withTiming(1, { duration: 920, easing: Easing.out(Easing.cubic) }));
    logoOpacity.value = withDelay(280, withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(280, withTiming(1, { duration: 760, easing: Easing.out(Easing.exp) }));
    logoLift.value = withDelay(280, withTiming(0, { duration: 760, easing: Easing.out(Easing.exp) }));
    wordmarkOpacity.value = withDelay(880, withTiming(1, { duration: 440, easing: Easing.out(Easing.cubic) }));
    sloganOpacity.value = withDelay(1160, withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }));

    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, SPLASH_COMPLETE_MS);

    return () => clearTimeout(timer);
  }, [glowOpacity, glowScale, logoLift, logoOpacity, logoScale, sloganOpacity, wordmarkOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scaleX: glowScale.value }, { scaleY: 1 }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoLift.value }, { scale: logoScale.value }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({ opacity: wordmarkOpacity.value }));
  const sloganStyle = useAnimatedStyle(() => ({ opacity: sloganOpacity.value }));

  return (
    <View style={styles.screen}>
      <View style={styles.centerStage}>
        <Animated.View style={[styles.redLightLine, glowStyle]} />
        <Animated.View accessibilityLabel="Noxa logo mark" style={[styles.logoMark, logoStyle]}>
          <Text style={styles.logoAura}>N</Text>
          <Text style={styles.logoLetter}>N</Text>
          <View style={styles.logoRedBlade} />
          <View style={styles.logoEdgeLight} />
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
    backgroundColor: '#010102',
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
    backgroundColor: 'rgba(255,36,36,0.2)',
    shadowColor: colors.accent,
    shadowOpacity: 0.7,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
  },
  logoMark: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoAura: {
    position: 'absolute',
    color: 'rgba(255,36,36,0.16)',
    fontSize: 112,
    fontWeight: '900',
    letterSpacing: -10,
    lineHeight: 124,
    textShadowColor: 'rgba(255,36,36,0.42)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    transform: [{ scaleX: 1.03 }, { translateY: 1 }],
  },
  logoLetter: {
    color: '#F8F8FA',
    fontSize: 110,
    fontWeight: '900',
    letterSpacing: -10,
    lineHeight: 124,
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 16,
  },
  logoRedBlade: {
    position: 'absolute',
    right: 34,
    top: 23,
    width: 7,
    height: 86,
    borderRadius: radius.pill,
    backgroundColor: colors.accentDark,
    transform: [{ rotate: '22deg' }],
    shadowColor: colors.accent,
    shadowOpacity: 0.76,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  logoEdgeLight: {
    position: 'absolute',
    top: 33,
    width: 56,
    height: 1,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.34)',
    transform: [{ rotate: '-25deg' }, { translateX: -11 }],
  },
  wordmark: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: '800',
    letterSpacing: 13,
  },
  slogan: {
    marginTop: spacing.sm,
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 5,
    textShadowColor: 'rgba(255,36,36,0.28)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
});
