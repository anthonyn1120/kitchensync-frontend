import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { colors, fonts, radius, springs } from '@/theme';
import { Text } from '@/components/ui';

type Props<T extends string> = {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
};

/** Dark glass track with a sliding white-ish thumb (matches .nav-item.active). */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useSharedValue(0);
  const segW = width > 0 ? (width - 8) / options.length : 0;

  useEffect(() => {
    x.value = withSpring(index * segW, springs.gentle);
  }, [index, segW, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {segW > 0 && <Animated.View style={[styles.thumb, { width: segW }, thumb]} />}
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            style={styles.seg}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
          >
            <Text style={[styles.label, { color: active ? colors.textPrimary : colors.textSecondary }]}>{o.label}</Text>
            {o.count !== undefined && (
              <Text variant="monoSm" color={active ? colors.accentMatch : colors.textTertiary}>
                {o.count}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  thumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.white12,
    borderWidth: 1,
    borderColor: colors.white10,
  },
  seg: { flex: 1, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontFamily: fonts.medium, fontSize: 14 },
});
