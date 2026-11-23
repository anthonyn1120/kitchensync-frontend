import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Text } from '@/components/ui';
import type { Weekday } from '@/data/types';
import { colors, fonts, radius } from '@/theme';

const TRACK_H = 96;
const PEAK = 80;

/** 7 columns, one per weekday: fill height = occupancy, fill opacity deepens with it (single-hue heat). */
export function OccupancyStrip({
  data,
  openDays,
}: {
  data: { day: string; percent: number }[];
  openDays: Weekday[];
}) {
  return (
    <View style={styles.row}>
      {data.map((d, i) => (
        <Column
          key={d.day}
          day={d.day}
          percent={d.percent}
          delay={i * 60}
          open={openDays.includes(d.day as Weekday)}
        />
      ))}
    </View>
  );
}

function Column({ day, percent, delay, open }: { day: string; percent: number; delay: number; open: boolean }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(percent / 100, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [percent, delay, p]);
  const fill = useAnimatedStyle(() => ({ height: p.value * TRACK_H }));
  const peak = percent >= PEAK;

  return (
    <View style={styles.col}>
      <View style={styles.tagSlot}>
        {peak && (
          <View style={styles.peak}>
            <Text style={styles.peakText}>Peak</Text>
          </View>
        )}
      </View>
      <View style={[styles.track, peak && styles.trackPeak]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: `rgba(163,196,129,${(0.25 + 0.75 * (percent / 100)).toFixed(2)})` }, fill]}
        />
      </View>
      <Text style={[styles.pct, peak && { color: colors.textPrimary }]}>{percent}%</Text>
      <Text style={[styles.day, peak && { color: colors.textSecondary }]}>{day}</Text>
      <View style={[styles.openDot, open && { backgroundColor: colors.accentMatch }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  tagSlot: { height: 18, justifyContent: 'flex-end' },
  peak: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMatchSoft,
    borderWidth: 1,
    borderColor: 'rgba(163,196,129,0.5)',
  },
  peakText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.3, textTransform: 'uppercase', color: colors.accentMatch },
  track: {
    width: '100%',
    height: TRACK_H,
    borderRadius: 10,
    backgroundColor: colors.black20,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trackPeak: {
    borderWidth: 1,
    borderColor: 'rgba(163,196,129,0.35)',
  },
  fill: { width: '100%', borderRadius: 4, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  pct: { fontFamily: fonts.mono, fontSize: 10, color: colors.textTertiary },
  day: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textTertiary },
  openDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
});
