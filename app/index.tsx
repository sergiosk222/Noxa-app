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
  const glowScale = useSharedValue(0.72);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.92);
  const wordmarkOpacity = useSharedValue(0);
  const sloganOpacity = useSharedValue(0);

  useEffect(() => {
    glowOpacity.value = withDelay(160, withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) }));
    glowScale.value = withDelay(160, withTiming(1, { duration: 940, easing: Easing.out(Easing.cubic) }));
    logoOpacity.value = withDelay(420, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(420, withTiming(1, { duration: 680, easing: Easing.out(Easing.exp) }));
    wordmarkOpacity.value = withDelay(980, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    sloganOpacity.value = withDelay(1260, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));

    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, SPLASH_COMPLETE_MS);

    return () => clearTimeout(timer);
  }, [glowOpacity, glowScale, logoOpacity, logoScale, sloganOpacity, wordmarkOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scaleX: glowScale.value }, { scaleY: glowScale.value * 0.72 }],
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
        <Animated.View style={[styles.redLightLine, glowStyle]} />
        <Animated.View accessibilityLabel="Noxa logo mark" style={[styles.logoMark, logoStyle]}>
          <Text style={styles.logoShadow}>N</Text>
          <Text style={styles.logoLetter}>N</Text>
          <View style={styles.logoRedBlade} />
          <View style={styles.logoHighlight} />
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
    backgroundColor: '#020203',
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  redLightLine: {
    position: 'absolute',
    top: 62,
    width: 330,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,36,36,0.12)',
    shadowColor: colors.accent,
    shadowOpacity: 0.58,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 0 },
  },
  logoMark: {
    width: 122,
    height: 126,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShadow: {
    position: 'absolute',
    color: 'rgba(255,36,36,0.2)',
    fontSize: 102,
    fontWeight: '900',
    letterSpacing: -9,
    lineHeight: 116,
    transform: [{ translateX: 3 }, { translateY: 2 }],
  },
  logoLetter: {
    color: colors.text,
    fontSize: 100,
    fontWeight: '900',
    letterSpacing: -9,
    lineHeight: 116,
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  logoRedBlade: {
    position: 'absolute',
    right: 31,
    top: 21,
    width: 9,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: colors.accentDark,
    transform: [{ rotate: '23deg' }],
    shadowColor: colors.accent,
    shadowOpacity: 0.72,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  logoHighlight: {
    position: 'absolute',
    top: 24,
    width: 54,
    height: 1,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.36)',
    transform: [{ rotate: '-24deg' }, { translateX: -8 }],
  },
  wordmark: {
    marginTop: spacing.lg,
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: '800',
    letterSpacing: 12,
  },
  slogan: {
    marginTop: spacing.sm,
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 5,
    textShadowColor: 'rgba(255,36,36,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
