import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import type { Weekday } from '@/data/types';
import { colors } from '@/theme';
import { WEEKDAYS } from './filters';

/** .schedule-grid of .day-node squares; available days are lit. With onPressDay, available days are tappable. */
export function DayGrid({
  available,
  highlight = [],
  onPressDay,
}: {
  available: Weekday[];
  /** Days the renter wants; outlined in green when the kitchen is open then */
  highlight?: Weekday[];
  onPressDay?: (d: Weekday) => void;
}) {
  return (
    <View style={styles.grid}>
      {WEEKDAYS.map((d) => {
        const on = available.includes(d);
        const wanted = on && highlight.includes(d);
        return (
          <Pressable
            key={d}
            disabled={!on || !onPressDay}
            onPress={() => onPressDay?.(d)}
            style={({ pressed }) => [styles.node, on && styles.avail, wanted && styles.wanted, pressed && { opacity: 0.6 }]}
            accessibilityRole={on && onPressDay ? 'button' : undefined}
            accessibilityLabel={`${d} ${on ? 'available' : 'unavailable'}${on && onPressDay ? ', book this day' : ''}`}
          >
            <Text style={[styles.label, { color: on ? colors.textPrimary : colors.textTertiary }]}>{d[0]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 4 },
  node: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: colors.white05,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avail: { backgroundColor: colors.white15 },
  wanted: { borderColor: 'rgba(163, 196, 129, 0.6)' },
  label: { fontSize: 11 },
});
