import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '@/theme';
import { Text } from './Text';

type Props = {
  label: string;
  /** active = green accent (.tag-pill.active) */
  active?: boolean;
  /** dashed border, for "+ Add" chips */
  dashed?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

/** .chip / .tag / .tag-pill */
export function Chip({ label, active, dashed, onPress, onRemove, size = 'md', style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        active && styles.active,
        dashed && { borderStyle: 'dashed' },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: fonts.regular,
          fontSize: size === 'sm' ? 11 : 13,
          color: active ? colors.accentMatch : colors.textSecondary,
        }}
      >
        {label}
      </Text>
      {onRemove && (
        <Text onPress={onRemove} style={{ fontSize: 16, opacity: 0.5, color: active ? colors.accentMatch : colors.textSecondary }}>
          ×
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34,62,53,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(34,62,53,0.10)',
    borderRadius: radius.pill,
  },
  md: { paddingVertical: 6, paddingHorizontal: 12 },
  sm: { paddingVertical: 3, paddingHorizontal: 8 },
  active: { backgroundColor: colors.accentMatchSoft, borderColor: colors.accentMatch },
});
