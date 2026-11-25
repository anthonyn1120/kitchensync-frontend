import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, ChevronLeft, ChefHat, X } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, fonts, radius, shadows } from '@/theme';

/** Warm clay used for "sample data" labels, so they read as a note rather than a status. */
export const clay = '#A9643F';
export const clayBg = 'rgba(207, 113, 83, 0.12)';

/** Small honest label: this listing is sample data, not a confirmed partner. */
export function SampleTag({ onPhoto, label = 'Sample listing' }: { onPhoto?: boolean; label?: string }) {
  return (
    <View style={[styles.sample, onPhoto && styles.sampleOnPhoto]}>
      <Text style={[styles.sampleText, onPhoto && { color: '#FFFFFF' }]}>{label}</Text>
    </View>
  );
}

/** Solid white card that lifts off the cream page. */
export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Uppercase section label. */
export function Label({ children, right, style }: { children: string; right?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.labelRow, style]}>
      <Text style={styles.label}>{children}</Text>
      {right}
    </View>
  );
}

/** One line of a fit check or checklist: green tick or clay cross, bold label, quiet detail. */
export function CheckLine({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <View style={styles.checkLine}>
      <View style={[styles.tick, ok ? styles.tickOk : styles.tickNo]}>
        {ok ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : <X size={14} color="#FFFFFF" strokeWidth={3} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.checkLabel}>{label}</Text>
        {!!detail && <Text style={styles.checkDetail}>{detail}</Text>}
      </View>
    </View>
  );
}

/** Toggle chip with a large tap target. */
export function Choice({ label, on, onPress, sub, style, icon }: { label: string; on: boolean; onPress: () => void; sub?: string; style?: StyleProp<ViewStyle>; icon?: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.choice, on && styles.choiceOn, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text style={[styles.choiceText, on && { color: '#FFFFFF' }]}>{label}</Text>
      </View>
      {!!sub && <Text style={[styles.choiceSub, on && { color: 'rgba(255,255,255,0.8)' }]}>{sub}</Text>}
    </Pressable>
  );
}

/** Equal-width single-select row. */
export function Segments<T extends string | number>({
  options,
  value,
  onChange,
  format = (v) => String(v),
  disabled,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
  disabled?: (v: T) => boolean;
}) {
  return (
    <View style={styles.segments}>
      {options.map((o) => {
        const on = o === value;
        const off = disabled?.(o) ?? false;
        return (
          <Pressable
            key={String(o)}
            accessibilityRole="button"
            accessibilityState={{ selected: on, disabled: off }}
            disabled={off}
            onPress={() => onChange(o)}
            style={[styles.segment, on && styles.segmentOn, off && { opacity: 0.35 }]}
          >
            <Text style={[styles.segmentText, on && { color: '#FFFFFF', fontFamily: fonts.semibold }]}>{format(o)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** On/off switch sized for a thumb (52×32). */
export function Switch({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => onChange(!value)}
      style={[styles.switch, value && { backgroundColor: colors.accentMatch }]}
    >
      <View style={[styles.knob, value && { transform: [{ translateX: 20 }] }]} />
    </Pressable>
  );
}

/** Stand-in for listings we have no real photo of. Deliberately not a photo. */
export function NoPhoto({ height = 84 }: { height?: number }) {
  return (
    <View style={[styles.noPhoto, { height }]}>
      <ChefHat size={22} color={colors.textTertiary} strokeWidth={1.5} />
      <Text style={styles.noPhotoText}>No photo yet</Text>
    </View>
  );
}

/** Stack-screen frame: back button + title row, scrolling body, optional pinned footer. */
export function FlowScreen({
  eyebrow,
  children,
  footer,
  onBack,
  hideBack,
  right,
}: {
  right?: ReactNode;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  hideBack?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top + 8 }}>
      <View style={styles.header}>
        {!hideBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/renter/find-space')))}
            style={styles.back}
          >
            <ChevronLeft size={22} color={colors.textPrimary} />
          </Pressable>
        )}
        {!!eyebrow && <Text style={[styles.eyebrow, { flex: 1 }]} numberOfLines={1}>{eyebrow}</Text>}
        {right}
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer && <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>{footer}</View>}
    </View>
  );
}

/** Quiet text link for the header's right side (e.g. "Skip"). */
export function HeaderLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" hitSlop={10} onPress={onPress} style={{ paddingVertical: 10, paddingLeft: 8 }}>
      <Text style={{ fontFamily: fonts.medium, fontSize: 14, lineHeight: 19, color: colors.textSecondary, textDecorationLine: 'underline' }}>{label}</Text>
    </Pressable>
  );
}

/** The standing disclaimer on every permit screen. */
export function GuidanceNote({ text }: { text?: string }) {
  return (
    <View style={styles.guidance}>
      <Text style={styles.guidanceText}>
        <Text style={{ fontFamily: fonts.semibold, color: colors.textPrimary }}>Guidance, not legal advice. </Text>
        {text ?? 'A preview of where Kitchen Sync is headed. Confirm your own case with WSDA.'}
      </Text>
    </View>
  );
}

/** Serif screen title. */
export function Title({ children, sub }: { children: string; sub?: string }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.title}>{children}</Text>
      {!!sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  sample: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: clayBg },
  sampleOnPhoto: { backgroundColor: 'rgba(20, 28, 24, 0.62)' },
  sampleText: { fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: clay, lineHeight: 14 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    padding: 16,
    ...shadows.contact,
  },

  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTertiary, lineHeight: 16 },

  checkLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 7 },
  tick: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  tickOk: { backgroundColor: colors.accentMatch },
  tickNo: { backgroundColor: colors.accentDanger },
  checkLabel: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  checkDetail: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },

  choice: {
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceOn: { backgroundColor: colors.primaryButtonBg, borderColor: colors.primaryButtonBg },
  choiceText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20, color: colors.textPrimary },
  choiceSub: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 15, color: colors.textTertiary },

  segments: {
    flexDirection: 'row',
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, minHeight: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.primaryButtonBg },
  segmentText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20, color: colors.textSecondary },

  switch: { width: 52, height: 32, borderRadius: 16, padding: 3, backgroundColor: 'rgba(34,62,53,0.18)' },
  knob: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', ...shadows.contact },

  noPhoto: {
    borderRadius: 14,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  noPhotoText: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14, color: colors.textTertiary },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, minHeight: 44, marginBottom: 12 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.textTertiary, lineHeight: 16 },
  body: { paddingHorizontal: 20, paddingBottom: 28 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    backgroundColor: 'rgba(247,247,243,0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.glassBorderDim,
  },
  guidance: { padding: 12, borderRadius: 14, backgroundColor: clayBg },
  guidanceText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  title: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 30, lineHeight: 36, letterSpacing: -0.4, color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.textSecondary, marginTop: 8 },
});
