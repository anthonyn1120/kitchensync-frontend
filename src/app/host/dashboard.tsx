import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Check, Clock } from 'lucide-react-native';
import { PillButton, Screen, Text } from '@/components/ui';
import { Card, Choice, clay, Label, SampleTag } from '@/components/demo/ui';
import { WEEKDAYS } from '@/components/onboarding/Controls';
import { hourPresets } from '@/components/onboarding/options';
import { persona, photos } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';

type Status = 'pending' | 'approved' | 'declined';

/** Kitchen-owner home: the listing, the idle hours it has opened up, and incoming requests to approve. */
export default function HostDashboard() {
  const { hostSetup, updateHostSetup, demoRequests } = useAppState();
  const [status, setStatus] = useState<Record<string, Status>>({});

  // Requests the food business sent in this session; a sample one until then.
  const incoming =
    demoRequests.length > 0
      ? demoRequests.map((r) => ({ id: r.id, what: r.mode === 'tour' ? 'Tour request' : `Booking request · ${r.hours} hrs`, when: `${r.date} · ${r.time}` }))
      : [{ id: 'sample', what: 'Tour request', when: 'Tue · 10:00 AM' }];

  const hoursPerDay = hourPresets.find((p) => p.label === hostSetup.hours)?.hours ?? 6;
  const idle = Math.round(hoursPerDay * hostSetup.days.length);

  return (
    <Screen withTabBar scroll>
      <Text style={styles.title}>My kitchen</Text>

      <Card style={{ padding: 8 }}>
        <View style={styles.photo}>
          <Image source={photos.nvcKitchen} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: '62%' }} />
          <View style={{ position: 'absolute', top: 10, left: 10 }}>
            <SampleTag onPhoto />
          </View>
        </View>
        <View style={{ padding: 8, paddingTop: 12 }}>
          <Text style={styles.name}>{hostSetup.facilityName}</Text>
          <Text style={styles.small}>
            {hostSetup.address} · ${hostSetup.ratePerHour}/hr · listed
          </Text>
        </View>
      </Card>

      <Label style={{ marginTop: 22 }} right={<Text style={styles.sample}>{idle} idle hrs a week listed</Text>}>
        Hours you’ve opened up
      </Label>
      <Card>
        <View style={styles.days}>
          {WEEKDAYS.map((d) => {
            const on = hostSetup.days.includes(d);
            return (
              <Choice
                key={d}
                label={d}
                on={on}
                style={styles.day}
                onPress={() => updateHostSetup({ days: on ? hostSetup.days.filter((x) => x !== d) : WEEKDAYS.filter((x) => x === d || hostSetup.days.includes(x)) })}
              />
            );
          })}
        </View>
        <View style={styles.hoursRow}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={styles.small}>{hostSetup.hours} · tap a day to open or close it</Text>
        </View>
      </Card>

      <Label style={{ marginTop: 22 }}>Requests</Label>
      <View style={{ gap: 10 }}>
        {incoming.map((r) => {
          const st = status[r.id] ?? 'pending';
          return (
            <Card key={r.id} style={{ gap: 12 }}>
              <View style={styles.reqHead}>
                <Image source={photos.wanolaBag} style={styles.avatar} contentFit="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reqName}>{persona.name}</Text>
                  <Text style={styles.small}>
                    {r.what} · {r.when}
                  </Text>
                </View>
              </View>
              {st === 'pending' ? (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <PillButton label="Decline" style={{ flex: 1 }} onPress={() => setStatus((s) => ({ ...s, [r.id]: 'declined' }))} />
                  <PillButton label="Approve" variant="primary" style={{ flex: 1 }} haptic="success" onPress={() => setStatus((s) => ({ ...s, [r.id]: 'approved' }))} />
                </View>
              ) : (
                <View style={[styles.result, st === 'declined' && { backgroundColor: 'rgba(207,113,83,0.12)' }]}>
                  {st === 'approved' && <Check size={15} color={colors.accentMatch} strokeWidth={3} />}
                  <Text style={[styles.resultText, st === 'declined' && { color: clay }]}>{st === 'approved' ? 'Approved. You stay in control of who cooks here.' : 'Declined'}</Text>
                </View>
              )}
            </Card>
          );
        })}
      </View>
      <Text style={styles.note}>Sample data. You approve every booking and tour.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 30, lineHeight: 36, letterSpacing: -0.4, color: colors.textPrimary, marginTop: 6, marginBottom: 16 },
  photo: { height: 170, borderRadius: radius.card - 6, overflow: 'hidden', backgroundColor: colors.black20 },
  name: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 21, lineHeight: 26, color: colors.textPrimary },
  small: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  sample: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, color: colors.accentMatch },
  days: { flexDirection: 'row', gap: 5 },
  day: { flex: 1, paddingHorizontal: 0, borderRadius: 14 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  reqHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#E9E9EC' },
  reqName: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, color: colors.textPrimary },
  result: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: colors.accentMatchSoft },
  resultText: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, lineHeight: 19, color: colors.accentMatch },
  note: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.textTertiary, textAlign: 'center', marginTop: 18 },
});
