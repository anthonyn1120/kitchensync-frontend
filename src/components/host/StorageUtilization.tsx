import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { GlassPanel, SectionTitle, Text } from '@/components/ui';
import { storageUtilization } from '@/data/mock';
import { colors, radius } from '@/theme';

/** "Storage Utilization" — 12px track with a glowing accent fill that grows in on mount. */
export function StorageUtilization() {
  const [width, setWidth] = useState(0);
  const fill = useSharedValue(0);

  useEffect(() => {
    if (!width) return;
    fill.value = withDelay(
      300,
      withTiming((width * storageUtilization.percent) / 100, { duration: 1100, easing: Easing.out(Easing.cubic) }),
    );
  }, [width, fill]);

  const fillStyle = useAnimatedStyle(() => ({ width: fill.value }));

  return (
    <GlassPanel radius={radius.card} contentStyle={{ padding: 20 }}>
      <SectionTitle>Storage Utilization</SectionTitle>
      <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <View style={styles.labels}>
        <Text variant="mono">{storageUtilization.label}</Text>
        <Text variant="mono" color={colors.textSecondary}>{storageUtilization.percent}% Full</Text>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  // The glow lives on the fill (iOS shadow), so the track can't clip it.
  track: { height: 12, backgroundColor: colors.black20, borderRadius: 6, marginVertical: 12 },
  fill: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentMatch,
    shadowColor: colors.accentMatch,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
});
