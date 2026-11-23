import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { springs } from '@/theme';

/** .dot-pagination — 4px dots; the active one brightens and stretches slightly. */
export function DotPagination({ count, index }: { count: number; index: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} active={i === index} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const t = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    t.value = withSpring(active ? 1 : 0, springs.gentle);
  }, [active, t]);
  const style = useAnimatedStyle(() => ({
    width: 4 + t.value * 8,
    backgroundColor: `rgba(34,62,53,${0.18 + t.value * 0.62})`,
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { height: 4, borderRadius: 2 },
});
