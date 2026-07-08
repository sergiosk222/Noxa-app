import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';

export function NoxaLogoMark() {
  return (
    <View accessibilityLabel="Noxa logo mark" style={styles.shell}>
      <View style={styles.innerGlow} />
      <Text style={styles.mark}>N</Text>
      <View style={styles.redCut} />
      <View style={styles.metalEdge} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 122,
    height: 122,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: '#08090C',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: colors.accent,
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
    overflow: 'hidden',
  },
  innerGlow: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,36,36,0.11)',
  },
  mark: {
    color: colors.text,
    fontSize: 82,
    fontWeight: '900',
    letterSpacing: -7,
    lineHeight: 96,
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  redCut: {
    position: 'absolute',
    right: 26,
    top: 25,
    width: 10,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.accentDark,
    transform: [{ rotate: '23deg' }],
    shadowColor: colors.accent,
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  metalEdge: {
    position: 'absolute',
    left: 1,
    right: 1,
    top: 1,
    height: 42,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.055)',
  },
});
