import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { PillButton, Screen, Text } from '@/components/ui';
import { Card, NoPhoto } from '@/components/demo/ui';
import { getDemoListing } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';

/** Requests tab: the booking and tour requests sent in this session. */
export default function Requests() {
  const { demoRequests } = useAppState();

  return (
    <Screen withTabBar scroll>
      <Text style={styles.title}>Requests</Text>
      <Text style={styles.sub}>Bookings and tours you’ve asked for.</Text>

      {demoRequests.length === 0 ? (
        <Card style={{ gap: 14, alignItems: 'flex-start' }}>
          <Text style={styles.empty}>Nothing yet. Find a kitchen and book an hour or two, or ask for a tour.</Text>
          <PillButton label="Find kitchens" variant="primary" onPress={() => router.replace('/renter/find-space')} />
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {demoRequests.map((r) => {
            const l = getDemoListing(r.listingId);
            if (!l) return null;
            return (
              <Card key={r.id} onPress={() => router.push(`/listing/${l.id}`)} style={styles.card}>
                {l.photos[0] ? (
                  <Image source={l.photos[0].src} style={styles.thumb} contentFit="cover" contentPosition={{ top: '62%' }} />
                ) : (
                  <View style={{ width: 64 }}>
                    <NoPhoto height={64} />
                  </View>
                )}
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.status}>
                    <Text style={styles.statusText}>{r.mode === 'tour' ? 'Tour requested' : 'Booking requested'}</Text>
                  </View>
                  <Text style={styles.name}>{l.name}</Text>
                  <Text style={styles.small}>
                    {r.date} · {r.time}
                  </Text>
                  {r.mode === 'book' && (
                    <Text style={styles.small}>
                      {r.hours} hr{r.hours > 1 ? 's' : ''}
                      {r.coldStorage ? ' + cold storage' : ''} · ${r.total} (sample price)
                    </Text>
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 30, lineHeight: 36, letterSpacing: -0.4, color: colors.textPrimary, marginTop: 6 },
  sub: { fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 22, color: colors.textSecondary, marginTop: 6, marginBottom: 18 },
  empty: { fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 22, color: colors.textSecondary },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  thumb: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.black20 },
  status: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.accentMatchSoft, marginBottom: 2 },
  statusText: { fontFamily: fonts.semibold, fontSize: 11.5, lineHeight: 16, color: colors.accentMatch },
  name: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, color: colors.textPrimary },
  small: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
});
