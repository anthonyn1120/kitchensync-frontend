import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Text } from '@/components/ui';
import { colors } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const HEIGHT = 150;

/**
 * Stylized stand-in for a real map (.map-placeholder): a tilted street grid,
 * a river edge, a park block and a glowing pin at the listing's coords.
 */
export function FakeMap({ coords, label, distance }: { coords: { x: number; y: number }; label: string; distance: number }) {
  const [w, setW] = useState(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
  }, [pulse]);

  const ringProps = useAnimatedProps(() => ({
    r: 6 + pulse.value * 20,
    opacity: 0.7 * (1 - pulse.value),
  }));

  const px = coords.x * w;
  const py = coords.y * HEIGHT;
  const minor = Array.from({ length: 24 }, (_, i) => i);

  return (
    <View style={styles.wrap} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Svg width={w} height={HEIGHT}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.accentMatch} stopOpacity={0.45} />
              <Stop offset="1" stopColor={colors.accentMatch} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="vignette" cx="50%" cy="50%" r="70%">
              <Stop offset="0" stopColor="#fff" stopOpacity={0.05} />
              <Stop offset="1" stopColor="#fff" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* River along the left edge */}
          <Path
            d={`M0 0 L${w * 0.12} 0 C${w * 0.16} ${HEIGHT * 0.3} ${w * 0.06} ${HEIGHT * 0.55} ${w * 0.1} ${HEIGHT} L0 ${HEIGHT} Z`}
            fill="rgba(140, 170, 190, 0.14)"
          />

          <G rotation={-14} originX={w / 2} originY={HEIGHT / 2}>
            {minor.map((i) => (
              <Line key={`v${i}`} x1={-60 + i * 22} y1={-80} x2={-60 + i * 22} y2={HEIGHT + 80} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            ))}
            {minor.map((i) => (
              <Line key={`h${i}`} x1={-60} y1={-80 + i * 18} x2={w + 60} y2={-80 + i * 18} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            ))}
            {/* Avenues */}
            <Line x1={w * 0.3} y1={-80} x2={w * 0.3} y2={HEIGHT + 80} stroke="rgba(255,255,255,0.13)" strokeWidth={3} />
            <Line x1={w * 0.72} y1={-80} x2={w * 0.72} y2={HEIGHT + 80} stroke="rgba(255,255,255,0.13)" strokeWidth={3} />
            <Line x1={-60} y1={HEIGHT * 0.62} x2={w + 60} y2={HEIGHT * 0.62} stroke="rgba(255,255,255,0.13)" strokeWidth={3} />
            {/* Park block */}
            <Rect x={w * 0.52} y={HEIGHT * 0.66} width={w * 0.16} height={HEIGHT * 0.32} rx={4} fill="rgba(163,196,129,0.12)" />
          </G>
          {/* Diagonal boulevard */}
          <Line x1={w * 0.1} y1={HEIGHT} x2={w} y2={HEIGHT * 0.05} stroke="rgba(255,255,255,0.1)" strokeWidth={4} />
          <Rect x={0} y={0} width={w} height={HEIGHT} fill="url(#vignette)" />

          {/* Pin */}
          <Circle cx={px} cy={py} r={30} fill="url(#glow)" />
          <AnimatedCircle cx={px} cy={py} fill="none" stroke={colors.accentMatch} strokeWidth={1.5} animatedProps={ringProps} />
          <Circle cx={px} cy={py} r={6} fill={colors.accentMatch} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
        </Svg>
      )}
      <View style={styles.labels} pointerEvents="none">
        <View style={styles.tag}>
          <Text variant="monoSm" color={colors.textSecondary}>
            {label}
          </Text>
        </View>
        <View style={styles.tag}>
          <Text variant="monoSm" color={colors.textSecondary}>
            {`${distance} mi`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: HEIGHT,
    borderRadius: 16,
    backgroundColor: colors.black20,
    borderWidth: 1,
    borderColor: colors.white08,
    overflow: 'hidden',
  },
  labels: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
