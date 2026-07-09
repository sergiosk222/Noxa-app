import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { NoxaAnimatedCard } from './NoxaAnimatedCard';

type NoxaCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  compact?: boolean;
};

export function NoxaCard({ children, style, compact = false, delay = 0 }: NoxaCardProps) {
  return (
    <NoxaAnimatedCard compact={compact} delay={delay} style={style}>
      {children}
    </NoxaAnimatedCard>
  );
}

