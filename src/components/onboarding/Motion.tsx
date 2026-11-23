import { useEffect } from 'react';
import { View } from 'react-native';
import {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/theme';

/**
 * Motion rules for onboarding:
 * - Layout content uses `ease` timings (no overshoot).
 * - Springs are only for direct touch feedback, and are near-critically damped (no wobble).
 * - Nothing loops except the voice waveform while recording.
 */
export const ease = Easing.out(Easing.cubic);
export const easeInOut = Easing.bezier(0.4, 0, 0.2, 1);
export const pressSpring = { damping: 30, stiffness: 420, mass: 0.6 } as const;
/** Duration for selection state changes (borders, fills, radio dots). */
export const SELECT_MS = 180;

/** Press-scale feedback for tappable surfaces. */
export function usePressScale(to = 0.97) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return {
    style,
    onPressIn: () => {
      scale.value = withSpring(to, pressSpring);
    },
    onPressOut: () => {
      scale.value = withSpring(1, pressSpring);
    },
  };
}

/** 0 → 1 timing that follows a boolean, for selection styling. */
export function useSelection(on: boolean) {
  const t = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    t.value = withTiming(on ? 1 : 0, { duration: SELECT_MS, easing: ease });
  }, [on, t]);
  return t;
}

/** Thin determinate progress line that fills to `progress` (0–1) over `duration`. */
export function ProgressLine({ progress, duration = 600 }: { progress: number; duration?: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(progress, { duration, easing: easeInOut });
  }, [progress, duration, p]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.min(1, p.value) * 100}%` }));
  return (
    <View style={{ height: 3, borderRadius: 2, backgroundColor: colors.white10, overflow: 'hidden' }}>
      <Animated.View style={[{ height: 3, borderRadius: 2, backgroundColor: colors.accentMatch }, fill]} />
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Large progress ring that eases to `progress` (0–1) over `duration`. */
export function FillRing({
  progress,
  duration = 800,
  size = 168,
  strokeWidth = 4,
  children,
}: {
  progress: number;
  duration?: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(progress, { duration, easing: easeInOut });
  }, [progress, duration, p]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.white10} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.accentMatch}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          animatedProps={animatedProps}
          fill="none"
        />
      </Svg>
      {children}
    </View>
  );
}

/** Live-audio waveform: bars move while active (the only looping motion in onboarding), flat when idle. */
export function Waveform({ active, bars = 36, height = 40, color = colors.accentMatch }: { active: boolean; bars?: number; height?: number; color?: string }) {
  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      {Array.from({ length: bars }, (_, i) => (
        <WaveBar key={i} index={i} bars={bars} active={active} maxHeight={height} color={color} />
      ))}
    </View>
  );
}

function WaveBar({ index, bars, active, maxHeight, color }: { index: number; bars: number; active: boolean; maxHeight: number; color: string }) {
  const h = useSharedValue(3);
  const o = useSharedValue(active ? 1 : 0.35);
  useEffect(() => {
    o.value = withTiming(active ? 1 : 0.35, { duration: 200 });
    if (!active) {
      cancelAnimation(h);
      h.value = withTiming(3, { duration: 240, easing: ease });
      return;
    }
    // Louder toward the middle, with a deterministic pseudo-random rhythm per bar.
    const center = 1 - Math.abs(index - bars / 2) / (bars / 2);
    const seed = Math.sin(index * 12.9898) * 43758.5453;
    const rand = seed - Math.floor(seed);
    const peak = 6 + (maxHeight - 6) * (0.3 + 0.7 * center) * (0.5 + 0.5 * rand);
    const dur = 260 + rand * 260;
    const curve = Easing.inOut(Easing.quad);
    h.value = withRepeat(
      withSequence(
        withTiming(peak, { duration: dur, easing: curve }),
        withTiming(peak * 0.35, { duration: dur * 0.9, easing: curve }),
        withTiming(peak * 0.75, { duration: dur * 0.7, easing: curve }),
        withTiming(4, { duration: dur, easing: curve }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(h);
  }, [active, h, o, index, bars, maxHeight]);
  const style = useAnimatedStyle(() => ({ height: h.value, opacity: o.value }));
  return <Animated.View style={[{ width: 3, borderRadius: 2, backgroundColor: color }, style]} />;
}
