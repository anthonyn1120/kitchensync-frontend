import { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Text } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';
import { usePressScale, useSelection } from './Motion';

type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export type Option<T extends string> = { value: T; title: string; meta: string; icon?: IconType };

type Props<T extends string> = {
  options: Option<T>[];
  /** Single-select value… */
  value?: T | null;
  /** …or multi-select values. */
  values?: T[];
  onChange: (value: T) => void;
  /** Shorter tiles: title + meta on the left, ring on the right, no icon. */
  compact?: boolean;
  /** Short tiles that keep the icon, inline on the left — for long lists. No ring: the icon tints when selected. */
  dense?: boolean;
};

/** .option-grid — 2-column grid of .option-card tiles. An odd last tile spans the full row. */
export function OptionGrid<T extends string>({ options, value, values, onChange, compact, dense }: Props<T>) {
  const multi = values !== undefined;
  return (
    <View style={styles.grid}>
      {options.map((o) => (
        <OptionCard
          key={o.value}
          option={o}
          multi={multi}
          compact={compact}
          dense={dense}
          selected={multi ? values.includes(o.value) : value === o.value}
          onPress={() => onChange(o.value)}
        />
      ))}
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function OptionCard<T extends string>({
  option,
  selected,
  multi,
  compact,
  dense,
  onPress,
}: {
  option: Option<T>;
  selected: boolean;
  multi: boolean;
  compact?: boolean;
  dense?: boolean;
  onPress: () => void;
}) {
  const Icon = option.icon;
  const s = useSelection(selected);
  const press = usePressScale();

  const card = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(s.value, [0, 1], [colors.glassBgSecondary, colors.glassBgPrimary]),
    borderColor: interpolateColor(s.value, [0, 1], [colors.glassBorderDim, colors.accentMatch]),
    shadowOpacity: s.value * 0.15,
  }));
  const ring = useAnimatedStyle(() => ({
    borderColor: interpolateColor(s.value, [0, 1], ['rgba(255,255,255,0.3)', colors.accentMatch]),
  }));
  const dot = useAnimatedStyle(() => ({ opacity: s.value, transform: [{ scale: 0.5 + s.value * 0.5 }] }));
  const inset = useAnimatedStyle(() => ({ opacity: s.value }));

  const radio = (
    <Animated.View style={[styles.radioRing, ring]}>
      <Animated.View style={[styles.radioDot, dot]} />
    </Animated.View>
  );

  return (
    <AnimatedPressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityLabel={option.title}
      accessibilityState={multi ? { checked: selected } : { selected }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={onPress}
      style={[styles.card, (compact || dense) && styles.cardCompact, dense && styles.cardDense, card, press.style]}
    >
      {/* selected: the mockup's inset 1px accent ring, on top of the accent border */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.inset, (compact || dense) && { borderRadius: 22 }, inset]} />
      {dense ? (
        <View style={styles.compactRow}>
          {Icon && (
            <View style={[styles.iconBox, styles.iconBoxDense, selected && styles.iconBoxDenseOn]}>
              <Icon size={18} color={selected ? colors.accentMatch : colors.textPrimary} strokeWidth={1.5} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, styles.titleDense]} numberOfLines={1}>
              {option.title}
            </Text>
            <Text variant="monoSm" numberOfLines={1}>
              {option.meta}
            </Text>
          </View>
        </View>
      ) : compact ? (
        <View style={styles.compactRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{option.title}</Text>
            <Text variant="monoSm">{option.meta}</Text>
          </View>
          {radio}
        </View>
      ) : (
        <>
          <View style={styles.topRow}>
            {Icon ? (
              <View style={[styles.iconBox, selected && styles.iconBoxOn]}>
                <Icon size={24} color={colors.textPrimary} strokeWidth={1.5} />
              </View>
            ) : (
              <View />
            )}
            {radio}
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={styles.title}>{option.title}</Text>
            <Text variant="monoSm">{option.meta}</Text>
          </View>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flexBasis: '45%',
    flexGrow: 1,
    borderRadius: radius.card,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
  },
  cardCompact: { paddingVertical: 16, borderRadius: 22 },
  cardDense: { paddingVertical: 12, paddingHorizontal: 12 },
  inset: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.accentMatch },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    padding: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.white05,
    borderWidth: 1,
    borderColor: colors.white05,
  },
  iconBoxDense: { padding: 6 },
  iconBoxDenseOn: { backgroundColor: colors.accentMatchSoft, borderColor: colors.accentMatch },
  iconBoxOn: { backgroundColor: colors.white10, borderColor: colors.white10 },
  radioRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accentMatch },
  title: { fontFamily: fonts.medium, fontSize: 16, color: colors.textPrimary, marginBottom: 4 },
  titleDense: { fontSize: 14, marginBottom: 2 },
});
