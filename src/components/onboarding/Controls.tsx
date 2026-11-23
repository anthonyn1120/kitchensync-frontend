import { ReactNode, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Minus, Plus, X } from 'lucide-react-native';
import { Text } from '@/components/ui';
import type { Weekday } from '@/data/types';
import { colors, fonts, radius } from '@/theme';
import { usePressScale, useSelection } from './Motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
/** Selected chip/day fill: a stronger accent tint so white text stays readable over the light top of the background. */
const ACTIVE_FILL = 'rgba(163,196,129,0.3)';

/** .mono-meta section label with an optional right-side note. */
export function FieldLabel({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={styles.fieldLabel}>
      <Text variant="mono">{children}</Text>
      {hint && <Text variant="monoSm">{hint}</Text>}
    </View>
  );
}

/** A section that sits directly on the background: mono label, then content. Sections are spaced apart, not boxed. */
export function FormSection({ label, hint, children, style }: { label: string; hint?: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.section, style]}>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      {children}
    </View>
  );
}

/** Quiet underlined text link for secondary actions. */
export function TextLink({ label, onPress, style }: { label: string; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      hitSlop={10}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{ paddingVertical: 6, alignSelf: 'flex-start', opacity: pressed ? 0.5 : 1 }, style]}
    >
      <Text variant="bodySm" style={styles.link}>
        {label}
      </Text>
    </Pressable>
  );
}

/** .tag-pill — selection shows as accent border + accent text, nothing else. `removable` adds a ×. */
export function TagPill({ label, active, onPress, removable, dashed }: { label: string; active?: boolean; onPress: () => void; removable?: boolean; dashed?: boolean }) {
  const press = usePressScale(0.95);
  const s = useSelection(!!active);
  const look = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(s.value, [0, 1], ['rgba(255,255,255,0.06)', ACTIVE_FILL]),
    borderColor: interpolateColor(s.value, [0, 1], [dashed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)', colors.accentMatch]),
  }));
  const tint = active ? colors.textPrimary : colors.textSecondary;
  return (
    <AnimatedPressable
      hitSlop={4}
      accessibilityRole={removable ? 'button' : 'checkbox'}
      accessibilityLabel={removable ? `Remove ${label}` : label}
      accessibilityState={removable ? undefined : { checked: !!active }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={onPress}
      style={[styles.pill, dashed && styles.pillDashed, look, press.style]}
    >
      <Text style={[styles.pillText, { color: tint }]}>{label}</Text>
      {removable && <X size={13} color={colors.textTertiary} />}
    </AnimatedPressable>
  );
}

/** Multi-select wrap of tag-pills. */
export function TagPillGroup({ options, selected, onChange }: { options: readonly string[]; selected: string[]; onChange: (next: string[]) => void }) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const on = selected.includes(o);
        return <TagPill key={o} label={o} active={on} onPress={() => onChange(on ? selected.filter((s) => s !== o) : [...selected, o])} />;
      })}
    </View>
  );
}

/**
 * Editable chip set for reviewing extracted values: current values as plain
 * removable pills, plus a dashed "Add" pill that reveals the rest.
 */
export function EditableChips({ options, selected, onChange }: { options: readonly string[]; selected: string[]; onChange: (next: string[]) => void }) {
  const [adding, setAdding] = useState(false);
  const remaining = options.filter((o) => !selected.includes(o));
  return (
    <View>
      <View style={styles.wrap}>
        {selected.map((s) => (
          <TagPill key={s} label={s} removable onPress={() => onChange(selected.filter((x) => x !== s))} />
        ))}
        {remaining.length > 0 && <TagPill label={adding ? 'Done' : 'Add'} dashed={!adding} onPress={() => setAdding((a) => !a)} />}
      </View>
      {adding && remaining.length > 0 && (
        <View style={[styles.wrap, { marginTop: 10 }]}>
          {remaining.map((o) => (
            <TagPill key={o} label={o} onPress={() => onChange([...selected, o])} />
          ))}
        </View>
      )}
    </View>
  );
}

export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Seven day cells in a row; selected days take the accent border, like the tag-pills. */
export function DayGrid({ selected, onChange }: { selected: Weekday[]; onChange: (next: Weekday[]) => void }) {
  return (
    <View style={styles.dayGrid}>
      {WEEKDAYS.map((d) => (
        <DayNode
          key={d}
          day={d}
          on={selected.includes(d)}
          onPress={() => {
            const next = selected.includes(d) ? selected.filter((x) => x !== d) : [...selected, d];
            onChange(WEEKDAYS.filter((w) => next.includes(w)));
          }}
        />
      ))}
    </View>
  );
}

function DayNode({ day, on, onPress }: { day: Weekday; on: boolean; onPress: () => void }) {
  const press = usePressScale(0.94);
  const s = useSelection(on);
  const look = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(s.value, [0, 1], ['rgba(255,255,255,0.06)', ACTIVE_FILL]),
    borderColor: interpolateColor(s.value, [0, 1], ['rgba(255,255,255,0.1)', colors.accentMatch]),
  }));
  return (
    <AnimatedPressable
      accessibilityRole="checkbox"
      accessibilityLabel={day}
      accessibilityState={{ checked: on }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={onPress}
      style={[styles.dayNode, look, press.style]}
    >
      <Text style={[styles.dayText, { color: on ? colors.textPrimary : colors.textSecondary }]}>{day}</Text>
    </AnimatedPressable>
  );
}

/** One quiet row: label on the left, − value + on the right. No box. Clamps to [min, max]. */
export function StepperRow({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  format = (v) => String(v),
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  format?: (v: number) => string;
}) {
  const change = (dir: 1 | -1) => {
    const next = Math.min(max, Math.max(min, value + dir * step));
    if (next === value) return;
    onChange(next);
  };
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <RoundButton label={`Less ${label.toLowerCase()}`} disabled={value <= min} onPress={() => change(-1)}>
          <Minus size={15} color={colors.textPrimary} />
        </RoundButton>
        <Text style={styles.stepperValue}>{format(value)}</Text>
        <RoundButton label={`More ${label.toLowerCase()}`} disabled={value >= max} onPress={() => change(1)}>
          <Plus size={15} color={colors.textPrimary} />
        </RoundButton>
      </View>
    </View>
  );
}

function RoundButton({ children, onPress, disabled, label }: { children: ReactNode; onPress: () => void; disabled?: boolean; label: string }) {
  const press = usePressScale(0.9);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      disabled={disabled}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={onPress}
      style={[styles.round, disabled && { opacity: 0.35 }, press.style]}
    >
      {children}
    </AnimatedPressable>
  );
}

/** Equal-width single-select pills. */
export function SegmentedPills<T extends string | number>({
  options,
  value,
  onChange,
  format = (v) => String(v),
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={String(o)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o)}
            style={[styles.segment, on && styles.segmentOn]}
          >
            <Text style={[styles.segmentText, on && { color: colors.primaryButtonText, fontFamily: fonts.medium }]}>{format(o)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Glass pill text field: dark control fill, hairline border that brightens on focus. */
export function GlassInput({ label, style, multiline, ...rest }: TextInputProps & { label?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={style as StyleProp<ViewStyle>}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <View style={[styles.input, multiline && styles.inputMultiline, focused && styles.inputFocused]}>
        <TextInput
          {...rest}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.accentMatch}
          keyboardAppearance="dark"
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.inputText, multiline && { minHeight: 110, textAlignVertical: 'top', paddingVertical: 0, lineHeight: 23 }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  fieldLabel: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  link: { color: colors.textSecondary, textDecorationLine: 'underline' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  pillDashed: { borderStyle: 'dashed' },
  pillText: { fontFamily: fonts.regular, fontSize: 14 },
  dayGrid: { flexDirection: 'row', gap: 6 },
  dayNode: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontFamily: fonts.regular, fontSize: 13 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  rowLabel: { fontFamily: fonts.regular, fontSize: 15, color: colors.textPrimary },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepperValue: { fontFamily: fonts.monoMedium, fontSize: 14, color: colors.textPrimary, minWidth: 76, textAlign: 'center' },
  round: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, minHeight: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.primaryButtonBg },
  segmentText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  inputMultiline: { alignItems: 'flex-start', paddingVertical: 16, borderRadius: 22 },
  inputFocused: { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: colors.controlBgPressed },
  inputText: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.textPrimary, paddingVertical: 14 },
});
