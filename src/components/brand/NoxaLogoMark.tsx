import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/src/theme';

type NoxaLogoMarkProps = {
  size?: number;
  compact?: boolean;
};

export function NoxaLogoMark({ size = 156, compact = false }: NoxaLogoMarkProps) {
  const scale = size / 156;
  const strokeWidth = (compact ? 15 : 18) * scale;

  return (
    <View accessibilityLabel="Noxa logo mark" style={[styles.stage, { width: size, height: size }]}>
      <View style={[styles.redHalo, { width: size * 1.36, height: size * 0.52, top: size * 0.58 }]} />
      <View style={[styles.baseLightLine, { width: size * 1.58, top: size * 0.82 }]} />
      <View style={[styles.baseLightCore, { width: size * 0.42, top: size * 0.815 }]} />

      <View
        style={[
          styles.leftPillar,
          {
            left: size * 0.18,
            top: size * 0.12,
            width: strokeWidth,
            height: size * 0.72,
            borderBottomRightRadius: radius.sm * scale,
          },
        ]}
      />
      <View
        style={[
          styles.leftPillarShade,
          {
            left: size * 0.18 + strokeWidth * 0.34,
            top: size * 0.15,
            width: strokeWidth * 0.66,
            height: size * 0.66,
          },
        ]}
      />
      <View
        style={[
          styles.rightPillar,
          {
            right: size * 0.18,
            top: size * 0.12,
            width: strokeWidth,
            height: size * 0.72,
            borderBottomLeftRadius: radius.sm * scale,
          },
        ]}
      />
      <View
        style={[
          styles.diagonalMetal,
          {
            left: size * 0.33,
            top: size * 0.15,
            width: strokeWidth * 0.92,
            height: size * 0.78,
          },
        ]}
      />
      <View
        style={[
          styles.innerRedBlade,
          {
            left: size * 0.49,
            top: size * 0.37,
            width: Math.max(2, size * 0.026),
            height: size * 0.55,
          },
        ]}
      />
      <View style={[styles.topEdge, { left: size * 0.18, top: size * 0.11, width: size * 0.28 }]} />
      <View style={[styles.rightEdge, { right: size * 0.18, top: size * 0.11, width: size * 0.25 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  redHalo: {
    position: 'absolute',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,24,24,0.08)',
    shadowColor: colors.accent,
    shadowOpacity: 0.34,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
  },
  baseLightLine: {
    position: 'absolute',
    height: 1,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,36,36,0.22)',
    shadowColor: colors.accent,
    shadowOpacity: 0.78,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  baseLightCore: {
    position: 'absolute',
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,38,38,0.8)',
    shadowColor: colors.accent,
    shadowOpacity: 0.95,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  leftPillar: {
    position: 'absolute',
    backgroundColor: '#E7E8EA',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.26,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  leftPillarShade: {
    position: 'absolute',
    backgroundColor: 'rgba(16,17,20,0.78)',
  },
  rightPillar: {
    position: 'absolute',
    backgroundColor: '#D7D9DC',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  diagonalMetal: {
    position: 'absolute',
    backgroundColor: '#CBCDCE',
    transform: [{ rotate: '-43deg' }],
  },
  innerRedBlade: {
    position: 'absolute',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    transform: [{ rotate: '-43deg' }],
    shadowColor: colors.accent,
    shadowOpacity: 0.92,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  topEdge: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.82)',
    transform: [{ rotate: '43deg' }],
  },
  rightEdge: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.72)',
    transform: [{ rotate: '-43deg' }],
  },
});
