import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, CalendarCheck, Info, MessageSquare, Snowflake } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { Facts, Price, Score } from '@/components/demo/ListingCard';
import { WEEKDAYS } from '@/components/onboarding/Controls';
import { Card, CheckLine, clay, FlowScreen, Label, NoPhoto, SampleTag } from '@/components/demo/ui';
import { fitCheck, fitScore, getDemoListing, sessionCost } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';

/** Listing detail: real photos, license, fit check, minimum booking, cold-storage add-on, what the kitchen asks. */
export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { needs } = useAppState();
  const listing = getDemoListing(id);

  if (!listing) {
    return (
      <FlowScreen eyebrow="Kitchen">
        <Text variant="body">That kitchen isn’t in the demo.</Text>
      </FlowScreen>
    );
  }

  const lines = fitCheck(listing, needs);
  const fits = lines.every((l) => l.ok);
  const score = fitScore(listing, lines);
  const hours = Math.max(needs.hours, listing.minHours);
  const cost = sessionCost(listing, hours, false);
  const real = listing.photos.length > 0;

  return (
    <FlowScreen
      eyebrow={listing.kind}
      footer={
        <>
          <PillButton label="Book a free tour" variant="primary" size="lg" fullWidth onPress={() => router.push(`/tour?id=${listing.id}`)} />
          <View style={styles.cta}>
            <PillButton label="Message" size="md" style={styles.ctaBtn} icon={<MessageSquare size={16} color={colors.textPrimary} />} onPress={() => router.push(`/message?id=${listing.id}`)} />
            <PillButton label="Request to book" size="md" style={styles.ctaBtn} onPress={() => router.push(`/request?id=${listing.id}`)} />
          </View>
        </>
      }
    >
      {real ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={270} decelerationRate="fast" style={styles.galleryScroll} contentContainerStyle={styles.gallery}>
          {listing.photos.map((p, i) => (
            <View key={p.caption} style={styles.photo}>
              <Image source={p.src} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
              {i === 0 && (
                <View style={styles.photoTag}>
                  <SampleTag onPhoto />
                </View>
              )}
              <View style={styles.caption}>
                <Text style={styles.captionText}>{p.caption}</Text>
                <Text style={styles.captionCount}>
                  {i + 1}/{listing.photos.length}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={{ marginBottom: 16, gap: 10 }}>
          <NoPhoto height={120} />
          <SampleTag />
        </View>
      )}

      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{listing.name}</Text>
          <Text style={styles.meta}>
            {listing.address ?? listing.area} · ~{listing.miles} mi from you
          </Text>
        </View>
        <Price rate={listing.rate} size={24} />
      </View>
      <Facts listing={listing} />

      <View style={styles.note}>
        <Info size={16} color={clay} style={{ marginTop: 2 }} />
        <Text style={styles.noteText}>
          {real
            ? 'Real photos and permit. Equipment list, price, hours and availability are sample data. Not a confirmed partner.'
            : 'A made-up example to show how search works. Not a real kitchen.'}
        </Text>
      </View>

      {listing.license && (
        <Card style={styles.block}>
          <View style={styles.licenseRow}>
            <View style={styles.licenseIcon}>
              <BadgeCheck size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.licenseTitle}>{listing.license.title}</Text>
              <Text style={styles.small}>{listing.license.authority}</Text>
            </View>
          </View>
          <Text style={[styles.small, { marginTop: 10 }]}>{listing.license.detail}</Text>
          <Text style={[styles.small, { color: colors.textTertiary, marginTop: 2 }]}>{listing.license.seen}</Text>
        </Card>
      )}

      <Card style={styles.block}>
        <View style={styles.scoreRow}>
          <Score score={score} large />
          <View style={{ flex: 1 }}>
            <Text style={styles.licenseTitle}>{fits ? 'Fits Wanola' : 'Partial fit'}</Text>
            <Text style={styles.small}>{fits ? 'Everything you asked for. Further away than the closest kitchen.' : 'Honest fit: here’s what doesn’t match.'}</Text>
          </View>
        </View>
        <Label style={{ marginTop: 14, marginBottom: 2 }}>How it fits</Label>
        {lines.map((l) => (
          <CheckLine key={l.label} ok={l.ok} label={l.label} detail={l.detail} />
        ))}
      </Card>

      <Card style={styles.block}>
        <Label right={<Text style={styles.sampleRate}>{listing.openHours}</Text>}>Availability</Label>
        <View style={styles.days}>
          {WEEKDAYS.map((d) => {
            const open = listing.days.includes(d);
            const wanted = d === needs.day;
            return (
              <View key={d} style={[styles.day, open && styles.dayOpen, open && wanted && styles.dayWanted]}>
                <Text style={[styles.dayText, open && { color: colors.textPrimary }, open && wanted && { color: '#FFFFFF' }]}>{d}</Text>
              </View>
            );
          })}
        </View>
        <Text style={[styles.small, { marginTop: 8 }]}>
          {listing.days.includes(needs.day) ? `Open ${needs.day}, the day you asked for.` : `Not open ${needs.day}, the day you asked for.`} Sample hours.
        </Text>
      </Card>

      <Card style={styles.block}>
        <Label right={<Text style={styles.sampleRate}>Sample prices</Text>}>Cost per session</Label>
        <Row label={`${hours} hr${hours > 1 ? 's' : ''} × $${listing.rate}`} value={`$${cost.kitchen}`} />
        <Row label="Cleaning fee" value={`$${cost.cleaning}`} />
        <Row label="Lease or deposit" value={listing.contract ? 'Monthly contract' : 'None'} />
        <View style={styles.totalRow}>
          <Text style={styles.total}>Total</Text>
          <Text style={styles.total}>${cost.total}</Text>
        </View>
      </Card>

      {!listing.license && (
        <Card style={styles.block}>
          <Label>Certifications</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {listing.certifications.map((c) => (
              <View key={c} style={styles.cert}>
                <Text style={styles.certText}>{c}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {listing.coldStorage && (
        <Card style={[styles.block, styles.addon]}>
          <View style={styles.addonIcon}>
            <Snowflake size={20} color={colors.accentMatch} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.licenseTitle}>Cold storage add-on</Text>
            <Text style={styles.small}>{listing.coldStorageNote}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.addonPrice}>+${listing.coldStoragePrice}</Text>
            <Text style={styles.sampleRate}>sample</Text>
          </View>
        </Card>
      )}

      <Card style={styles.block}>
        <Label right={<SampleTag label="Sample" />}>Before your first booking</Label>
        {listing.requirements.map((r, i) => (
          <View key={r} style={styles.req}>
            <View style={styles.reqNum}>
              {i === 0 ? <CalendarCheck size={13} color={colors.textPrimary} /> : <Text style={styles.reqNumText}>{i + 1}</Text>}
            </View>
            <Text style={styles.reqText}>{r}</Text>
          </View>
        ))}
      </Card>

      <Text style={[styles.small, { marginTop: 16 }]}>{listing.about}</Text>
    </FlowScreen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.costRow}>
      <Text style={styles.costLabel}>{label}</Text>
      <Text style={styles.costValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  days: { flexDirection: 'row', gap: 5 },
  day: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorderDim, alignItems: 'center', justifyContent: 'center' },
  dayOpen: { backgroundColor: colors.accentMatchSoft, borderColor: 'transparent' },
  dayWanted: { backgroundColor: colors.accentMatch },
  dayText: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 16, color: colors.textTertiary },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  costLabel: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.textSecondary },
  costValue: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.glassBorderDim, marginTop: 8, paddingTop: 10 },
  total: { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 25, color: colors.textPrimary },
  cert: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.controlBg },
  certText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 17, color: colors.textSecondary },
  ctaBtn: { flex: 1, paddingHorizontal: 8 },
  galleryScroll: { marginHorizontal: -20, marginBottom: 16, flexGrow: 0 },
  gallery: { paddingHorizontal: 20, gap: 10 },
  photo: { width: 260, height: 330, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.black20 },
  photoTag: { position: 'absolute', top: 12, left: 12 },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(20,28,24,0.55)',
  },
  captionText: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 19, color: '#FFFFFF' },
  captionCount: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: 'rgba(255,255,255,0.8)' },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  name: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 26, lineHeight: 31, letterSpacing: -0.3, color: colors.textPrimary },
  meta: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 21, color: colors.textSecondary, marginTop: 2 },
  note: { flexDirection: 'row', gap: 8, marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: 'rgba(207,113,83,0.09)' },
  noteText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  block: { marginTop: 14 },
  licenseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  licenseIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accentMatch, alignItems: 'center', justifyContent: 'center' },
  licenseTitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, color: colors.textPrimary },
  small: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  addon: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addonIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accentMatchSoft, alignItems: 'center', justifyContent: 'center' },
  addonPrice: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 23, color: colors.textPrimary },
  sampleRate: { fontFamily: fonts.medium, fontSize: 10.5, lineHeight: 14, letterSpacing: 0.4, textTransform: 'uppercase', color: clay },
  req: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7 },
  reqNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.controlBg, borderWidth: 1, borderColor: colors.controlBorder, alignItems: 'center', justifyContent: 'center' },
  reqNumText: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, color: colors.textPrimary },
  reqText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
