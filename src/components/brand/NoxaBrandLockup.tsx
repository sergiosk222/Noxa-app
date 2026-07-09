import { StyleSheet, View } from 'react-native';

import { spacing } from '@/src/theme';

import { NoxaLogoMark } from './NoxaLogoMark';
import { NoxaWordmark } from './NoxaWordmark';

type NoxaBrandLockupProps = {
  size?: number;
  showWordmark?: boolean;
  showSlogan?: boolean;
  compact?: boolean;
};

export function NoxaBrandLockup({
  size = 156,
  showWordmark = true,
  showSlogan = true,
  compact = false,
}: NoxaBrandLockupProps) {
  return (
    <View style={[styles.lockup, compact && styles.compactLockup]}>
      <NoxaLogoMark size={size} compact={compact} />
      {showWordmark ? (
        <View style={[styles.wordmarkBlock, compact && styles.compactWordmarkBlock]}>
          <NoxaWordmark size={compact ? size * 0.2 : size * 0.27} showSlogan={showSlogan} compact={compact} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: {
    alignItems: 'center',
  },
  compactLockup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  wordmarkBlock: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  compactWordmarkBlock: {
    marginTop: 0,
  },
});
