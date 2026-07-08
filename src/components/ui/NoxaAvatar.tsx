import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/src/theme';

type NoxaAvatarProps = {
  initials?: string;
  size?: number;
};

export function NoxaAvatar({ initials = 'NX', size = 48 }: NoxaAvatarProps) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}> 
      <Text style={[styles.initials, { fontSize: Math.max(typography.caption, size * 0.32) }]}>{initials.slice(0, 2).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  initials: {
    color: colors.text,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
});
