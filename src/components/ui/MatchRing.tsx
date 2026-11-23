import { useEffect } from 'react';
import { View } from 'react-native';
import { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '@/theme';
import { Text } from './Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** 0–100 */
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
};

/** .match-ring / .match-score-mini — animated progress ring with the % in mono. */
export function MatchRing({ score, size = 64, strokeWidth = 3, showLabel = true }: Props) {
  const r = (size - strokeWidth * 2) / 2;
  const c = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(score / 100, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [score, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
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
      {showLabel && (
        <Text style={{ fontFamily: fonts.monoMedium, fontSize: size >= 60 ? 16 : 12, color: colors.textPrimary }}>
          {score}%
        </Text>
      )}
    </View>
  );
}
