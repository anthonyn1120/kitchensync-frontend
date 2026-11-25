import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Check } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { Card, FlowScreen, Title } from '@/components/demo/ui';
import { getDemoListing, nextDate, tourChecklist } from '@/data/demo';
import type { Weekday } from '@/data/types';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';

const TIMES = ['9:00', '10:00', '11:00'];

/** "Visit before you commit": pick a tour time and the questions to settle while you're there. */
export default function Tour() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { needs, sendDemoRequest } = useAppState();
  const listing = getDemoListing(id);
  const [pickedDay, setPickedDay] = useState<Weekday | null>(null);
  const [asks, setAsks] = useState<string[]>(tourChecklist.slice(0, 3));

  if (!listing) {
    return (
      <FlowScreen eyebrow="Tour">
        <Text variant="body">That kitchen isn’t in the demo.</Text>
      </FlowScreen>
    );
  }

  // The next three open days in date order; the day they searched for is picked by default.
  const today = new Date().getDay();
  const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as Weekday[];
  const upcoming = [...order.slice(today + 1), ...order.slice(0, today + 1)].filter((d) => listing.days.includes(d)).slice(0, 3);
  const slots = upcoming.map((d, i) => ({ day: d, date: nextDate(d), time: `${TIMES[i]} AM` }));
  const picked = Math.max(0, slots.findIndex((x) => x.day === (pickedDay ?? needs.day)));
  const slot = slots[picked];

  const book = () => {
    sendDemoRequest({ listingId: listing.id, mode: 'tour', date: slot.date, time: slot.time, hours: 0, coldStorage: false, total: 0 });
    router.dismissAll();
    router.replace('/path');
  };

  return (
    <FlowScreen
      eyebrow={listing.name}
      footer={<PillButton label="Book free tour" variant="primary" size="lg" fullWidth haptic="success" onPress={book} iconRight={<ArrowRight size={18} color={colors.primaryButtonText} />} />}
    >
      <Title sub="Owners and renters still need to meet, check the fit and agree on the rules. See it in person first. Tours are free.">Visit before you commit</Title>

      <Card>
        <Text style={styles.q}>Pick a tour time</Text>
        <Text style={styles.hint}>20 minutes with the kitchen manager</Text>
        <View style={styles.slots}>
          {slots.map((s, i) => {
            const on = i === picked;
            return (
              <Pressable key={s.date} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setPickedDay(s.day)} style={[styles.slot, on && styles.slotOn]}>
                <Text style={[styles.slotTime, on && { color: '#FFFFFF' }]}>
                  {s.day} {s.time.replace(' AM', '')}
                </Text>
                <Text style={[styles.slotDate, on && { color: 'rgba(255,255,255,0.8)' }]}>{s.date.split(', ')[1]}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ marginTop: 12, paddingBottom: 8 }}>
        <Text style={styles.q}>Your tour checklist</Text>
        <Text style={styles.hint}>We save your answers so you can compare kitchens</Text>
        {tourChecklist.map((t) => {
          const on = asks.includes(t);
          return (
            <Pressable
              key={t}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => setAsks((a) => (a.includes(t) ? a.filter((x) => x !== t) : [...a, t]))}
              style={styles.ask}
            >
              <View style={[styles.box, on && styles.boxOn]}>{on && <Check size={14} color="#FFFFFF" strokeWidth={3} />}</View>
              <Text style={styles.askText}>{t}</Text>
            </Pressable>
          );
        })}
      </Card>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  q: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 19, lineHeight: 24, color: colors.textPrimary },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textTertiary, marginTop: 2, marginBottom: 12 },
  slots: { flexDirection: 'row', gap: 8 },
  slot: { flex: 1, minHeight: 60, borderRadius: 16, borderWidth: 1, borderColor: colors.controlBorder, backgroundColor: colors.controlBg, alignItems: 'center', justifyContent: 'center' },
  slotOn: { backgroundColor: colors.primaryButtonBg, borderColor: colors.primaryButtonBg },
  slotTime: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, color: colors.textPrimary },
  slotDate: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.textTertiary },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingVertical: 6 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: colors.controlBorder, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.accentMatch, borderColor: colors.accentMatch },
  askText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
});
