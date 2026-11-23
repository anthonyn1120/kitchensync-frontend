import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Text } from '@/components/ui';
import { colors } from '@/theme';

/** Labelled thin bars (0–100) that grow in, staggered. */
export function MatchBars({ items }: { items: { label: string; value: number }[] }) {
  return (
    <View style={{ gap: 12 }}>
      {items.map((it, i) => (
        <Bar key={it.label} {...it} delay={150 + i * 100} />
      ))}
    </View>
  );
}

function Bar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = 0;
    p.value = withDelay(delay, withTiming(value / 100, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [value, delay, p]);
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.row}>
        <Text variant="bodySm" color={colors.textSecondary}>{label}</Text>
        <Text variant="monoSm" color={colors.textPrimary}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fill]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.black20, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.accentMatch },
});
