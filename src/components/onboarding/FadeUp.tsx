import { ReactNode, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { ease } from './Motion';

/** Gap between staggered entrances. */
export const STAGGER_MS = 50;
export const ENTER_MS = 260;

type Props = {
  children?: ReactNode;
  /** 0, 1, 2… — each step delays the entrance by STAGGER_MS */
  stagger?: number;
  /** extra delay in ms on top of the stagger */
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
};

/** Content entrance: one quick fade plus a small rise, ease-out, no overshoot. */
export function FadeUp({ children, stagger = 1, delay = 0, distance = 8, style }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(stagger * STAGGER_MS + delay, withTiming(1, { duration: ENTER_MS, easing: ease }));
  }, [t, stagger, delay]);

  const animated = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * distance }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
