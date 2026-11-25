import { Screen, Text } from '@/components/ui';
import { ReadyChecklist } from '@/components/demo/ReadyChecklist';
import { demoListings, getDemoListing } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';

/** "Get ready" tab: the permit checklist for the kitchen you last requested (the featured one until then). */
export default function ReadyTab() {
  const { demoRequests } = useAppState();
  const listing = getDemoListing(demoRequests[0]?.listingId) ?? demoListings[0];
  return (
    <Screen withTabBar scroll>
      <Text style={{ fontFamily: fonts.serif, fontWeight: '700', fontSize: 30, lineHeight: 36, letterSpacing: -0.4, color: colors.textPrimary, marginTop: 6 }}>Permits</Text>
      <Text style={{ fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 22, color: colors.textSecondary, marginTop: 6, marginBottom: 16 }}>
        What it takes to cook at {listing.name}.
      </Text>
      <ReadyChecklist listing={listing} />
    </Screen>
  );
}
