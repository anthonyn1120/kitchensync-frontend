import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated from '@/components/ui/Animated';
import { enterUp, STAGGER } from '@/components/ui/motion';

/** Staggered fade-up entrance (the mockups' .stagger-* classes). */
export function FadeUp({ index = 0, children, style }: { index?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={enterUp(60 + index * STAGGER)} style={style}>
      {children}
    </Animated.View>
  );
}
