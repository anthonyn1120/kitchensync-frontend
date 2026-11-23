import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Text } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';
import { tightSpring } from './motion';

/** Pill segmented control with a sliding glass indicator; labels in mono. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [w, setW] = useState(0);
  const segW = w ? (w - 8) / options.length : 0;
  const index = options.indexOf(value);
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withSpring(index * segW, tightSpring);
  }, [index, segW, x]);

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={styles.wrap} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="tablist">
      {segW > 0 && <Animated.View style={[styles.indicator, { width: segW }, indicator]} />}
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable
            key={o}
            style={styles.seg}
            onPress={() => {
              if (active) return;
              onChange(o);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && { color: colors.textPrimary }]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.white15,
    borderWidth: 1,
    borderColor: colors.glassBorderLight,
  },
  seg: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.2, color: colors.textTertiary },
});
