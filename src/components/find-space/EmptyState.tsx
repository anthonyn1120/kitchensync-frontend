import { StyleSheet } from 'react-native';
import Animated from '@/components/ui/Animated';
import Svg, { Circle, Line } from 'react-native-svg';
import { RefreshCcw } from 'lucide-react-native';
import { GlassPanel, PillButton, Text } from '@/components/ui';
import { colors, fonts } from '@/theme';
import { enterUp, STAGGER } from '@/components/ui/motion';

type Props = {
  onExpandRadius: () => void;
  onAdjustFilters: () => void;
  onResetPassed: () => void;
};

const enter = (i: number) => enterUp(80 + i * STAGGER);

/** find-space-empty.html — "All Caught Up" glass panel. */
export function EmptyState({ onExpandRadius, onAdjustFilters, onResetPassed }: Props) {
  return (
    <GlassPanel style={{ flex: 1 }} contentStyle={styles.card}>
      <Animated.View entering={enter(0)} style={styles.iconCircle}>
        {/* Feather search + plus, exactly as in the mockup */}
        <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={11} cy={11} r={8} />
          <Line x1={21} y1={21} x2={16.65} y2={16.65} />
          <Line x1={11} y1={8} x2={11} y2={14} />
          <Line x1={8} y1={11} x2={14} y2={11} />
        </Svg>
      </Animated.View>

      <Animated.View entering={enter(1)} style={styles.textWrap}>
        <Text variant="h2" align="center">
          All Caught Up
        </Text>
        <Text variant="body" align="center">
          You've seen every kitchen in your current radius. Try adjusting your filters or expanding your search area.
        </Text>
      </Animated.View>

      <Animated.View entering={enter(2)} style={styles.actions}>
        <PillButton label="Expand Radius" variant="primary" onPress={onExpandRadius} style={styles.btn} />
        <PillButton label="Adjust Filters" onPress={onAdjustFilters} style={styles.btn} />
        <Text variant="monoSm" align="center" style={styles.divider}>
          or
        </Text>
        <PillButton
          label="Reset & Review Passed"
          onPress={onResetPassed}
          icon={<RefreshCcw size={14} color={colors.textPrimary} />}
          style={[styles.btn, { backgroundColor: 'transparent' }]}
        />
      </Animated.View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
    gap: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white05,
    borderWidth: 1,
    borderColor: colors.glassBorderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  textWrap: { gap: 12, maxWidth: 280, alignItems: 'center' },
  actions: { gap: 12, width: '100%', maxWidth: 240 },
  btn: { alignSelf: 'stretch', paddingVertical: 14, paddingHorizontal: 14 },
  divider: { marginVertical: 8, fontFamily: fonts.mono },
});
