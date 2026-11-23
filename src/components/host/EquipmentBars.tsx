import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Text } from '@/components/ui';
import { colors, fonts } from '@/theme';

/** Horizontal bars ranked by bookings; the top item is full accent, the rest muted. */
export function EquipmentBars({ data }: { data: { name: string; bookings: number }[] }) {
  const max = Math.max(...data.map((d) => d.bookings));
  return (
    <View style={{ gap: 14 }}>
      {data.map((d, i) => (
        <Row key={d.name} name={d.name} value={d.bookings} ratio={d.bookings / max} top={i === 0} delay={i * 90} />
      ))}
    </View>
  );
}

function Row({ name, value, ratio, top, delay }: { name: string; value: number; ratio: number; top: boolean; delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(ratio, { duration: 850, easing: Easing.out(Easing.cubic) }));
  }, [ratio, delay, p]);
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <View style={styles.row}>
      <Text variant="bodySm" color={colors.textPrimary} style={styles.name} numberOfLines={1}>{name}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, !top && { opacity: 0.45 }, fill]} />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { width: 92 },
  track: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.black20, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.accentMatch },
  value: { width: 24, textAlign: 'right', fontFamily: fonts.mono, fontSize: 12, color: colors.textSecondary },
});
