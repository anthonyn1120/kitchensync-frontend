import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';

/** Small two-or-more option segmented control (e.g. Swipe | List). */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.seg, on && styles.segOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
          >
            <Text style={[styles.label, { color: on ? colors.primaryButtonText : colors.textSecondary }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  seg: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill },
  segOn: { backgroundColor: colors.primaryButtonBg },
  label: { fontFamily: fonts.medium, fontSize: 13 },
});
