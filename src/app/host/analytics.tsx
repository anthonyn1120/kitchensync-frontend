import { useMemo, useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TrendingUp } from 'lucide-react-native';
import { GlassPanel, PageTitle, Screen, SectionTitle, Text } from '@/components/ui';
import { formatInt, formatUSD } from '@/components/host/CountUp';
import { EquipmentBars } from '@/components/host/EquipmentBars';
import { FadeUp } from '@/components/host/FadeUp';
import { InsightCard } from '@/components/host/InsightCard';
import { Kpi, KpiTiles } from '@/components/host/KpiTiles';
import { OccupancyStrip } from '@/components/host/OccupancyStrip';
import { RevenueChart } from '@/components/host/RevenueChart';
import { SegmentedControl } from '@/components/host/SegmentedControl';
import { useToast } from '@/components/host/Toast';
import { thisWeek, weekDelta } from '@/components/host/WeekHero';
import { hostAnalytics, hostListing } from '@/data/mock';
import type { Weekday } from '@/data/types';
import { useAppState } from '@/store/AppState';
import { colors, radius } from '@/theme';

const PERIODS = ['4W', '6W', 'YTD'] as const;
type Period = (typeof PERIODS)[number];
const PERIOD_LABEL: Record<Period, string> = { '4W': 'Last 4 weeks', '6W': 'Last 6 weeks', YTD: 'Year to date' };
const WEEK_ORDER: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const allWeeks = hostAnalytics.weeklyRevenue;
const allRevenue = allWeeks.reduce((s, w) => s + w.amount, 0);
// Placeholder: average booking value implied by the listing's 28 bookings over the 6 tracked weeks.
const avgBookingValue = allRevenue / hostListing.bookings;

export default function HostAnalytics() {
  const { hostSetup, updateHostSetup } = useAppState();
  const toast = useToast();
  const [period, setPeriod] = useState<Period>('6W');

  // YTD reuses the 6-week series until the API returns longer history.
  const weeks = useMemo(() => (period === '4W' ? allWeeks.slice(-4) : allWeeks), [period]);
  const revenue = weeks.reduce((s, w) => s + w.amount, 0);

  const kpis: Kpi[] = [
    // Same figure as the dashboard hero: the latest week in the series.
    { label: 'This week', value: thisWeek, format: formatUSD, sub: `${weekDelta >= 0 ? '+' : ''}${weekDelta}% wk/wk`, accent: true },
    { label: 'Revenue', value: revenue, format: formatUSD, sub: PERIOD_LABEL[period] },
    { label: 'Bookings', value: Math.round(revenue / avgBookingValue), format: formatInt, sub: `~${formatUSD(avgBookingValue)} each` },
    { label: 'Repeat renters', value: hostAnalytics.repeatRenterRate, format: (n) => `${Math.round(n)}%`, sub: 'Book again' },
    { label: 'Avg session', value: hostAnalytics.avgSessionHours, format: (n) => `${n.toFixed(1)}h`, sub: 'Per booking' },
    { label: 'Response time', value: hostAnalytics.responseTimeMins, format: (n) => `${Math.round(n)}m`, sub: 'Median', accent: true },
  ];

  const wedOpen = hostSetup.days.includes('Wed');
  const toggleWednesday = () => {
    const days = wedOpen
      ? hostSetup.days.filter((d) => d !== 'Wed')
      : WEEK_ORDER.filter((d) => d === 'Wed' || hostSetup.days.includes(d));
    updateHostSetup({ days });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.show(wedOpen ? 'Wednesdays removed from your availability' : 'Wednesdays added — renters can now book Wed mornings', wedOpen ? 'info' : 'success');
  };

  const peakDays = hostAnalytics.occupancyByDay.filter((d) => d.percent >= 80).map((d) => d.day);

  return (
    <View style={{ flex: 1 }}>
      <Screen withTabBar scroll>
        <FadeUp index={0}>
          <PageTitle eyebrow="Host Mode" title="Analytics" />
        </FadeUp>

        <View style={{ gap: 20 }}>
          <FadeUp index={1}>
            <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} />
          </FadeUp>

          <FadeUp index={2}>
            <KpiTiles items={kpis} />
          </FadeUp>

          <FadeUp index={3}>
            <GlassPanel radius={radius.card} contentStyle={{ padding: 20 }}>
              <SectionTitle
                right={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={12} color={colors.accentMatch} />
                    <Text variant="monoSm" color={colors.accentMatch}>
                      {weekDelta >= 0 ? '+' : ''}
                      {weekDelta}% wk/wk
                    </Text>
                  </View>
                }
              >
                Weekly Revenue
              </SectionTitle>
              <Text variant="bodySm" style={{ marginBottom: 12 }}>
                {PERIOD_LABEL[period]} · tap a week to see its total
              </Text>
              <RevenueChart data={weeks} animKey={period} />
            </GlassPanel>
          </FadeUp>

          <FadeUp index={4}>
            <GlassPanel radius={radius.card} contentStyle={{ padding: 20 }}>
              <SectionTitle right={<Text variant="monoSm">Peak · {peakDays.join(' / ')}</Text>}>
                Occupancy by Day
              </SectionTitle>
              <OccupancyStrip data={hostAnalytics.occupancyByDay} openDays={hostSetup.days} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accentMatch }} />
                <Text variant="monoSm">Your open days</Text>
              </View>
            </GlassPanel>
          </FadeUp>

          <FadeUp index={5}>
            <InsightCard
              text="Tuesdays and Thursdays are 80%+ booked. Opening Wednesday mornings could add ~$400/week."
              applied={wedOpen}
              onToggle={toggleWednesday}
            />
          </FadeUp>

          <FadeUp index={6}>
            <GlassPanel radius={radius.card} contentStyle={{ padding: 20 }}>
              <SectionTitle right={<Text variant="monoSm">Bookings</Text>}>Top Equipment</SectionTitle>
              <EquipmentBars data={hostAnalytics.topEquipment} />
            </GlassPanel>
          </FadeUp>
        </View>
      </Screen>
      {toast.element}
    </View>
  );
}
