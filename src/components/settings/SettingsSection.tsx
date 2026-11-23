import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from '@/components/ui/Animated';
import { colors, fonts, radius } from '@/theme';
import { GlassPanel, Text } from '@/components/ui';
import { enterUp, STAGGER } from '@/components/ui/motion';

/** .settings-section — secondary glass card with an 18px heading row. */
export function SettingsSection({
  title,
  right,
  children,
  index = 0,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  /** stagger position for the fade-up entrance */
  index?: number;
}) {
  return (
    <Animated.View entering={enterUp(80 + index * STAGGER)}>
      <GlassPanel tone="secondary" radius={radius.card} contentStyle={styles.content}>
        <View style={styles.head}>
          <Text style={styles.title}>{title}</Text>
          {right}
        </View>
        {children}
      </GlassPanel>
    </Animated.View>
  );
}

/** .toggle-row — label + optional hint on the left, control on the right. */
export function SettingRow({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 20 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 },
  title: { flex: 1, fontFamily: fonts.medium, fontSize: 18, letterSpacing: -0.2, color: colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8, minHeight: 44 },
  rowLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textPrimary },
  hint: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 15, color: colors.textPrimary, opacity: 0.5 },
});
