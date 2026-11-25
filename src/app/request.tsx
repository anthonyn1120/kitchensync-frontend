import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Minus, Plus, Snowflake } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { Card, Choice, clay, FlowScreen, Label, NoPhoto, Switch, Title } from '@/components/demo/ui';
import { WEEKDAYS } from '@/components/onboarding/Controls';
import { getDemoListing, minLabel, nextDate, sessionCost, slotLabel, timeWindows } from '@/data/demo';
import type { Weekday } from '@/data/types';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';

/** Request to book: day, start time, hours, optional cold storage, and the full price before you send. */
export default function RequestScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { needs } = useAppState();
  const listing = getDemoListing(params.id);

  const [day, setDay] = useState<Weekday>(listing?.days.includes(needs.day) ? needs.day : (listing?.days[0] ?? needs.day));
  const window = timeWindows.find((w) => w.value === needs.window && listing?.windows.includes(w.value)) ?? timeWindows.find((w) => listing?.windows.includes(w.value)) ?? timeWindows[0];
  const [start, setStart] = useState(window.starts[2]);
  const [hours, setHours] = useState(Math.max(needs.hours, listing?.minHours ?? 1));
  const [cold, setCold] = useState(!!listing?.coldStorage && needs.coldStorage);

  if (!listing) {
    return (
      <FlowScreen eyebrow="Request">
        <Text variant="body">That kitchen isn’t in the demo.</Text>
      </FlowScreen>
    );
  }

  const cost = sessionCost(listing, hours, cold);
  const date = nextDate(day);
  const time = slotLabel(start, hours);

  const next = () =>
    router.push({
      pathname: '/get-ready',
      params: { id: listing.id, date, time, hours: String(hours), cold: cold && listing.coldStorage ? '1' : '0', total: String(cost.total) },
    });

  return (
    <FlowScreen
      eyebrow={listing.name}
      footer={
        <PillButton
          label={`Continue · $${cost.total}`}
          variant="primary"
          size="lg"
          fullWidth
          onPress={next}
          iconRight={<ArrowRight size={18} color={colors.primaryButtonText} />}
        />
      }
    >
      <Title>Request to book</Title>

      <Card style={styles.kitchen}>
        {listing.photos[0] ? (
          <Image source={listing.photos[0].src} style={styles.thumb} contentFit="cover" contentPosition={{ top: '62%' }} />
        ) : (
          <View style={{ width: 56 }}>
            <NoPhoto height={56} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.kitchenName}>{listing.name}</Text>
          <Text style={styles.small}>
            ${listing.rate}/hr · {minLabel(listing.minHours)} · no lease
          </Text>
        </View>
      </Card>

      <Label style={styles.gap}>Day</Label>
      <View style={styles.row}>
        {WEEKDAYS.map((d) => {
          const open = listing.days.includes(d);
          return <Choice key={d} label={d} on={day === d} onPress={() => open && setDay(d)} style={[styles.day, !open && { opacity: 0.3 }]} />;
        })}
      </View>
      <Text style={[styles.small, { marginTop: 8 }]}>{date}</Text>

      <Label style={styles.gap}>Start time</Label>
      <View style={styles.row}>
        {window.starts.map((s) => (
          <Choice key={s} label={s.replace(':00', '')} on={start === s} onPress={() => setStart(s)} style={styles.day} />
        ))}
      </View>

          <Card style={[styles.line, styles.gap]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kitchenName}>Hours</Text>
              <Text style={styles.small}>{time}</Text>
            </View>
            <Round label="Fewer hours" disabled={hours <= listing.minHours} onPress={() => setHours((h) => Math.max(listing.minHours, h - 1))}>
              <Minus size={18} color={colors.textPrimary} />
            </Round>
            <Text style={styles.hours}>{hours}</Text>
            <Round label="More hours" disabled={hours >= 12} onPress={() => setHours((h) => Math.min(12, h + 1))}>
              <Plus size={18} color={colors.textPrimary} />
            </Round>
          </Card>

          {listing.coldStorage && (
            <Card style={[styles.line, { marginTop: 10 }]}>
              <View style={styles.coldIcon}>
                <Snowflake size={20} color={colors.accentMatch} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.kitchenName}>Add cold storage</Text>
                <Text style={styles.small}>
                  {listing.coldStorageNote} · +${listing.coldStoragePrice}
                </Text>
              </View>
              <Switch label="Add cold storage" value={cold} onChange={setCold} />
            </Card>
          )}

          <Card style={styles.gap}>
            <Label right={<Text style={styles.sample}>Sample prices</Text>}>Price up front</Label>
            <Cost label={`${hours} hr${hours > 1 ? 's' : ''} × $${listing.rate}`} value={`$${cost.kitchen}`} />
            <Cost label="Cleaning fee" value={`$${cost.cleaning}`} />
            {cost.cold > 0 && <Cost label="Cold storage" value={`$${cost.cold}`} />}
            <Cost label="Lease or deposit" value="None" />
            <View style={styles.totalRow}>
              <Text style={styles.total}>Total</Text>
              <Text style={styles.total}>${cost.total}</Text>
            </View>
          </Card>
    </FlowScreen>
  );
}

function Cost({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.costRow}>
      <Text style={styles.costLabel}>{label}</Text>
      <Text style={styles.costValue}>{value}</Text>
    </View>
  );
}

function Round({ children, onPress, disabled, label }: { children: React.ReactNode; onPress: () => void; disabled?: boolean; label: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={6} disabled={disabled} onPress={onPress} style={[styles.round, disabled && { opacity: 0.35 }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: 20 },
  kitchen: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  thumb: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.black20 },
  kitchenName: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, color: colors.textPrimary },
  small: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  row: { flexDirection: 'row', gap: 6 },
  day: { flex: 1, paddingHorizontal: 0, borderRadius: 14 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  hours: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28, color: colors.textPrimary, minWidth: 26, textAlign: 'center' },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.controlBg, borderWidth: 1, borderColor: colors.controlBorder, alignItems: 'center', justifyContent: 'center' },
  coldIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accentMatchSoft, alignItems: 'center', justifyContent: 'center' },
  sample: { fontFamily: fonts.medium, fontSize: 10.5, lineHeight: 14, letterSpacing: 0.4, textTransform: 'uppercase', color: clay },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  costLabel: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.textSecondary },
  costValue: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.glassBorderDim, marginTop: 8, paddingTop: 10 },
  total: { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 25, color: colors.textPrimary },
});
