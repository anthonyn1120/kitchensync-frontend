import { StyleSheet, View } from 'react-native';
import { Check, Lightbulb } from 'lucide-react-native';
import { GlassPanel, PillButton, Text } from '@/components/ui';
import { colors, radius } from '@/theme';

/** Accent "Insight" callout, styled like the swipe card's match-reason line. */
export function InsightCard({ text, applied, onToggle }: { text: string; applied: boolean; onToggle: () => void }) {
  return (
    <GlassPanel tone="secondary" radius={radius.card} contentStyle={styles.card}>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Lightbulb size={14} color={colors.accentMatch} />
        </View>
        <Text variant="mono" color={colors.accentMatch}>Insight</Text>
      </View>
      <Text variant="body" color={colors.textPrimary}>{text}</Text>
      <PillButton
        label={applied ? 'Wednesdays Open' : 'Open Wednesdays'}
        variant={applied ? 'default' : 'primary'}
        size="md"
        icon={applied ? <Check size={15} color={colors.accentMatch} /> : undefined}
        onPress={onToggle}
        style={{ alignSelf: 'flex-start' }}
      />
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 14,
    backgroundColor: colors.accentMatchSoft,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(163,196,129,0.3)',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(163,196,129,0.18)',
  },
});
