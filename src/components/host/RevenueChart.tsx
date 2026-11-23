import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Easing,
  FadeIn,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import Svg, { ClipPath, Defs, G, Line, Rect } from 'react-native-svg';
import { Text } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const H = 180; // plot height
const AXIS_W = 40; // y-axis label column
const X_LABEL_H = 22;
const TOP_PAD = 30; // room for the value tooltip above the tallest bar

type Week = { week: string; amount: number };

const short = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : `$${n}`);

/** Weekly revenue bars. Latest week is full accent; tap a bar to read its value. */
export function RevenueChart({ data, animKey }: { data: Week[]; animKey: string }) {
  const [w, setW] = useState(0);
  const latest = data.length - 1;
  const [selected, setSelected] = useState(latest);
  useEffect(() => setSelected(data.length - 1), [data.length, animKey]);

  const max = Math.max(...data.map((d) => d.amount));
  const step = 400;
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);

  const plotW = Math.max(0, w - AXIS_W);
  const slot = data.length ? plotW / data.length : 0;
  const barW = Math.min(30, slot * 0.5);
  const base = TOP_PAD + H;
  const yFor = (v: number) => base - (v / top) * H;

  const sel = data[selected];
  const selX = AXIS_W + slot * selected + slot / 2;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: base + X_LABEL_H }}>
      {w > 0 && (
        <>
          <Svg width={w} height={base} style={StyleSheet.absoluteFill}>
            <Defs>
              <ClipPath id="plot">
                <Rect x={0} y={0} width={w} height={base} />
              </ClipPath>
            </Defs>
            {ticks.map((t) => (
              <Line
                key={t}
                x1={AXIS_W}
                x2={w}
                y1={yFor(t)}
                y2={yFor(t)}
                stroke={t === 0 ? colors.white15 : colors.white08}
                strokeWidth={1}
                strokeDasharray={t === 0 ? undefined : '2 4'}
              />
            ))}
            <G clipPath="url(#plot)">
              {data.map((d, i) => (
                <Bar
                  key={`${animKey}-${i}`}
                  x={AXIS_W + slot * i + (slot - barW) / 2}
                  width={barW}
                  height={(d.amount / top) * H}
                  base={base}
                  delay={i * 70}
                  fill={colors.accentMatch}
                  opacity={i === latest ? 1 : i === selected ? 0.7 : 0.35}
                />
              ))}
            </G>
          </Svg>

          {ticks.map((t) => (
            <Text key={t} style={[styles.yLabel, { top: yFor(t) - 7 }]}>{short(t)}</Text>
          ))}

          {data.map((d, i) => (
            <Text
              key={d.week}
              numberOfLines={1}
              style={[
                styles.xLabel,
                { left: AXIS_W + slot * i, width: slot, top: base + 6 },
                i === selected && { color: colors.textPrimary },
              ]}
            >
              {d.week}
            </Text>
          ))}

          {/* Full-height hit targets, wider than the bars. */}
          {data.map((d, i) => (
            <Pressable
              key={`hit-${d.week}`}
              style={{ position: 'absolute', left: AXIS_W + slot * i, width: slot, top: 0, height: base + X_LABEL_H }}
              onPress={() => setSelected(i)}
              accessibilityLabel={`Week of ${d.week}: $${d.amount}`}
            />
          ))}

          {sel && (
            <Animated.View
              key={`tip-${animKey}-${selected}`}
              entering={FadeIn.duration(180)}
              pointerEvents="none"
              style={[
                styles.tip,
                {
                  top: Math.max(0, yFor(sel.amount) - 30),
                  left: Math.min(Math.max(AXIS_W, selX - 36), w - 72),
                },
              ]}
            >
              <Text style={styles.tipText}>${sel.amount.toLocaleString('en-US')}</Text>
            </Animated.View>
          )}
        </>
      )}
    </View>
  );
}

function Bar({
  x,
  width,
  height,
  base,
  delay,
  fill,
  opacity,
}: {
  x: number;
  width: number;
  height: number;
  base: number;
  delay: number;
  fill: string;
  opacity: number;
}) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(delay, withTiming(height, { duration: 750, easing: Easing.out(Easing.back(1.1)) }));
  }, [height, delay, h]);
  // Bar extends 4px below the baseline (clipped) so only the data end is rounded.
  const props = useAnimatedProps(() => ({ y: base - h.value, height: h.value + 4 }));
  return <AnimatedRect x={x} width={width} rx={4} fill={fill} fillOpacity={opacity} animatedProps={props} />;
}

const styles = StyleSheet.create({
  yLabel: {
    position: 'absolute',
    left: 0,
    width: AXIS_W - 6,
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textTertiary,
  },
  xLabel: {
    position: 'absolute',
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
  tip: {
    position: 'absolute',
    width: 72,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryButtonBg,
    alignItems: 'center',
  },
  tipText: { fontFamily: fonts.monoMedium, fontSize: 12, color: colors.primaryButtonText },
});
