import { ScrollView, StyleSheet, View } from 'react-native';
import { GlassPanel, Text } from '@/components/ui';
import { colors, fonts } from '@/theme';
import { CountUp } from './CountUp';

export type Kpi = { label: string; value: number; format: (n: number) => string; sub: string; accent?: boolean };

/** Horizontally scrolling row of small glass KPI tiles; bleeds past the 20px gutters. */
export function KpiTiles({ items }: { items: Kpi[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -20 }}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
    >
      {items.map((k, i) => (
        <GlassPanel key={k.label} tone="secondary" radius={20} style={styles.tile} contentStyle={styles.content}>
          <Text variant="monoSm">{k.label}</Text>
          <CountUp value={k.value} format={k.format} delay={i * 70} duration={900} style={styles.value} />
          <View style={styles.subRow}>
            {k.accent && <View style={styles.dot} />}
            <Text variant="monoSm" color={k.accent ? colors.accentMatch : undefined} numberOfLines={1}>
              {k.sub}
            </Text>
          </View>
        </GlassPanel>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tile: { width: 128 },
  content: { padding: 14, gap: 6 },
  value: { fontFamily: fonts.mono, fontSize: 20, color: colors.textPrimary },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accentMatch },
});
