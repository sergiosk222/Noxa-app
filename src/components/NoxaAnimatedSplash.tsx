import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type NoxaAnimatedSplashProps = {
  onAnimationComplete: () => void;
};

export function NoxaAnimatedSplash({ onAnimationComplete }: NoxaAnimatedSplashProps) {
  const onCompleteRef = useRef(onAnimationComplete);
  const sceneOpacity = useRef(new Animated.Value(1)).current;
  const lightOpacity = useRef(new Animated.Value(0)).current;
  const lightScale = useRef(new Animated.Value(0.05)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.9)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslateX = useRef(new Animated.Value(-112)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(lightOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(lightScale, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(markOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(markScale, {
          toValue: 1,
          damping: 14,
          stiffness: 145,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(lightOpacity, {
          toValue: 0.18,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wordTranslateX, {
          toValue: 0,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(560),
      Animated.timing(sceneOpacity, {
        toValue: 0,
        duration: 340,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        onCompleteRef.current();
      }
    });

    return () => {
      animation.stop();
    };
  }, [
    lightOpacity,
    lightScale,
    markOpacity,
    markScale,
    sceneOpacity,
    taglineOpacity,
    taglineTranslateY,
    wordOpacity,
    wordTranslateX,
  ]);

  return (
    <View accessibilityLabel="NOXA is loading" accessibilityRole="progressbar" style={styles.screen}>
      <Animated.View style={[styles.scene, { opacity: sceneOpacity }]}>
        <Animated.View
          style={[
            styles.light,
            {
              opacity: lightOpacity,
              transform: [{ scaleX: lightScale }],
            },
          ]}
        />

        <View style={styles.logoRow}>
          <Animated.View
            style={{
              opacity: markOpacity,
              transform: [{ scale: markScale }],
            }}
          >
            <Svg accessibilityLabel="NOXA" height={78} viewBox="0 0 120 120" width={78}>
              <Path
                d="M8 101V80L42 15H61L86 72L103 37H116L84 103H64L43 54L23 93H8Z"
                fill="#F5F7FA"
              />
            </Svg>
          </Animated.View>

          <View style={styles.wordMask}>
            <Animated.View
              style={{
                opacity: wordOpacity,
                transform: [{ translateX: wordTranslateX }],
              }}
            >
              <Text style={styles.word}>OXA</Text>
            </Animated.View>
          </View>
        </View>

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          OWN THE NIGHT
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050608',
  },
  scene: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  light: {
    position: 'absolute',
    top: 34,
    width: 250,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#E11D2E',
    shadowColor: '#FF3B3B',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  logoRow: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordMask: {
    width: 188,
    marginLeft: -2,
    overflow: 'hidden',
  },
  word: {
    color: '#F5F7FA',
    fontSize: 60,
    fontWeight: '700',
    letterSpacing: 9,
    lineHeight: 72,
  },
  tagline: {
    marginTop: 12,
    color: 'rgba(245,247,250,0.68)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 5,
  },
});
