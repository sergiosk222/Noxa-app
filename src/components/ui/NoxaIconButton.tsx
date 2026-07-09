import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { animations, colors, radius, shadows, spacing } from '@/src/theme';

type NoxaIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
};

export function NoxaIconButton({ icon, accessibilityLabel, onPress, size = 44, iconSize = 22 }: NoxaIconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, { width: size, height: size }, pressed && styles.pressed]}>
      <Ionicons name={icon} size={iconSize} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    ...shadows.control,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: animations.pressedScale }],
    backgroundColor: colors.surfacePressed,
  },
});
