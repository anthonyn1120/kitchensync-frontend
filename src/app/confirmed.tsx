import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { Card, FlowScreen, Label, NoPhoto } from '@/components/demo/ui';
import { getDemoListing } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';

/** Confirmation: what was sent and what happens next. */
export default function Confirmed() {
  const { rid } = useLocalSearchParams<{ rid?: string }>();
  const { demoRequests } = useAppState();
  const request = demoRequests.find((r) => r.id === rid) ?? demoRequests[0];
  const listing = getDemoListing(request?.listingId);

  if (!request || !listing) {
    return (
      <FlowScreen eyebrow="Requests" hideBack footer={<PillButton label="Find kitchens" variant="primary" size="lg" fullWidth onPress={() => router.replace('/renter/find-space')} />}>
        <Text variant="body">No request yet. Pick a kitchen to get started.</Text>
      </FlowScreen>
    );
  }

  const tour = request.mode === 'tour';
  const steps = tour
    ? ['The kitchen manager confirms your tour time', 'Walk the kitchen and check the fit together', 'Book your first hours when you’re both happy']
    : ['The kitchen manager approves your request', 'Quick walk-through before your first shift', 'Cook. You pay only for the hours you booked'];

  return (
    <FlowScreen
      hideBack
      footer={
        <>
          <PillButton label="See my requests" variant="primary" size="lg" fullWidth onPress={() => router.replace('/renter/bookings')} />
          <PillButton label="Back to search" variant="ghost" size="md" fullWidth onPress={() => router.replace('/renter/find-space')} />
        </>
      }
    >
      <View style={styles.check}>
        <Check size={34} color="#FFFFFF" strokeWidth={2.75} />
      </View>
      <Text style={styles.title}>{tour ? 'Tour requested' : 'Booking requested'}</Text>
      <Text style={styles.sub}>
        {tour ? 'No lease, no commitment. Just a look around.' : `${request.hours} hours of licensed kitchen time. No lease.`}
      </Text>

      <Card style={styles.summary}>
        <View style={styles.kitchen}>
          {listing.photos[0] ? (
            <Image source={listing.photos[0].src} style={styles.thumb} contentFit="cover" contentPosition={{ top: '62%' }} />
          ) : (
            <View style={{ width: 64 }}>
              <NoPhoto height={64} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{listing.name}</Text>
            <Text style={styles.small}>{listing.address ?? listing.area}</Text>
          </View>
        </View>
        <Row label={tour ? 'Tour' : 'When'} value={`${request.date} · ${request.time}`} />
        {!tour && <Row label="Cold storage" value={request.coldStorage ? 'Added' : 'Not added'} />}
        <Row label={tour ? 'Cost' : 'Total'} value={tour ? 'Free' : `$${request.total} (sample price)`} last />
      </Card>

      <Label style={{ marginTop: 22 }}>What happens next</Label>
      <Card>
        {steps.map((s, i) => (
          <View key={s} style={styles.step}>
            <View style={styles.num}>
              <Text style={styles.numText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{s}</Text>
          </View>
        ))}
      </Card>

      <Text style={styles.demo}>Demo only. Nothing was sent to a real kitchen.</Text>
    </FlowScreen>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.glassBorderDim }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  check: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.accentMatch, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 18 },
  title: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 32, lineHeight: 38, letterSpacing: -0.4, color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.textSecondary, marginTop: 6 },
  summary: { marginTop: 20, paddingBottom: 6 },
  kitchen: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  thumb: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.black20 },
  name: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.textPrimary },
  small: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 11 },
  rowLabel: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.textSecondary },
  rowValue: { flex: 1, textAlign: 'right', fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7 },
  num: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accentMatchSoft, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 16, color: colors.accentMatch },
  stepText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  demo: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.textTertiary, textAlign: 'center', marginTop: 18 },
});
