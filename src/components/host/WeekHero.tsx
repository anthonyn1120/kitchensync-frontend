import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import Svg, { Circle, Path } from 'react-native-svg';
import { ChevronDown, TrendingDown, TrendingUp } from 'lucide-react-native';
import { GlassPanel, Text, enterUp, STAGGER } from '@/components/ui';
import { hostAnalytics } from '@/data/mock';
import { colors, fonts, radius } from '@/theme';
import { formatUSD } from './CountUp';
import { easeOut } from './motion';
import type { OpenSlot } from './openSlots';

const weeks = hostAnalytics.weeklyRevenue;
/** This week's earnings = the latest week in the analytics series (shared with the Analytics tab). */
export const thisWeek = weeks[weeks.length - 1].amount;
const lastWeek = weeks[weeks.length - 2].amount;
export const weekDelta = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

const layout = LinearTransition.duration(220);

type Props = {
  slots: OpenSlot[];
  onShare: (slot: OpenSlot) => void;
  onLowerPrice: (slot: OpenSlot) => void;
};

/** Dashboard hero: this week's earnings, change vs last week, and the open slots the host could still fill. */
export function WeekHero({ slots, onShare, onLowerPrice }: Props) {
  const [open, setOpen] = useState(false);
  const up = weekDelta >= 0;
  const n = slots.length;

  return (
    <GlassPanel radius={radius.card} contentStyle={styles.content}>
      <View style={styles.head}>
        <Text variant="mono">This week</Text>
        <Text variant="monoSm">Week of {weeks[weeks.length - 1].week}</Text>
      </View>

      <View style={styles.figureRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.amount} accessibilityLabel={`This week, ${formatUSD(thisWeek)}`}>
            {formatUSD(thisWeek)}
          </Text>
          <View style={styles.delta}>
            {up ? <TrendingUp size={13} color={colors.accentMatch} /> : <TrendingDown size={13} color={colors.accentDanger} />}
            <Text style={[styles.deltaText, { color: up ? colors.accentMatch : colors.accentDanger }]}>
              {up ? '+' : ''}
              {weekDelta}% vs last week
            </Text>
          </View>
        </View>
        <Sparkline data={weeks.map((w) => w.amount)} />
      </View>

      <View style={styles.divider} />

      <Pressable
        onPress={() => n > 0 && setOpen((v) => !v)}
        style={({ pressed }) => [styles.slotsLine, pressed && n > 0 && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityHint="Shows the open slots"
      >
        <View style={[styles.slotsDot, n === 0 && { backgroundColor: colors.textTertiary }]} />
        <View style={{ flex: 1 }}>
          <Text variant="label" style={{ fontSize: 15 }}>
            {n === 0 ? 'Fully booked for the next 7 days' : `${n} open slot${n === 1 ? '' : 's'} you could fill`}
          </Text>
          <Text variant="monoSm" style={{ marginTop: 3 }}>Next 7 days{n > 0 && !open ? ' · Tap to see them' : ''}</Text>
        </View>
        {n > 0 && <Chevron open={open} />}
      </Pressable>

      {open && n > 0 && (
        <Animated.View layout={layout} exiting={FadeOut.duration(150)} style={styles.rows}>
          {slots.map((s, i) => (
            <Animated.View key={s.id} entering={enterUp(i * STAGGER)} layout={layout} exiting={FadeOut.duration(150)} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text variant="monoSm">{s.dayLabel}</Text>
                <Text variant="label" style={{ marginTop: 3 }}>{s.timeLabel}</Text>
              </View>
              <SmallButton label="Share slot" onPress={() => onShare(s)} />
              <SmallButton label="Lower price" onPress={() => onLowerPrice(s)} />
            </Animated.View>
          ))}
        </Animated.View>
      )}
    </GlassPanel>
  );
}

function Chevron({ open }: { open: boolean }) {
  const rot = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    rot.value = withTiming(open ? 1 : 0, easeOut);
  }, [open, rot]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value * 180}deg` }] }));
  return (
    <Animated.View style={style}>
      <ChevronDown size={18} color={colors.textSecondary} />
    </Animated.View>
  );
}

function SmallButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.btn, pressed && { backgroundColor: colors.controlBgPressed }]}
      accessibilityRole="button"
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const SW = 96;
const SH = 40;
const PAD = 4;

/** Static 6-week line; the last point is this week. */
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => ({
    x: PAD + (i * (SW - PAD * 2)) / (data.length - 1),
    y: PAD + (1 - (v - min) / (max - min || 1)) * (SH - PAD * 2),
  }));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <Svg width={SW} height={SH} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path d={d} stroke={colors.accentMatch} strokeOpacity={0.85} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last.x} cy={last.y} r={3.5} fill={colors.accentMatch} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  figureRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, gap: 12 },
  amount: { fontFamily: fonts.monoMedium, fontSize: 44, lineHeight: 50, letterSpacing: -1.5, color: colors.textPrimary },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  deltaText: { fontFamily: fonts.mono, fontSize: 12 },
  divider: { height: 1, backgroundColor: colors.white10, marginVertical: 16 },
  slotsLine: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  slotsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentMatch },
  rows: { gap: 8, marginTop: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 16,
    backgroundColor: colors.black20,
  },
  btn: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    backgroundColor: colors.controlBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textPrimary },
});
