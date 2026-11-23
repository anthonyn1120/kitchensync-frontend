import { StyleSheet, View } from 'react-native';
import { MatchRing, PillButton, Text } from '@/components/ui';
import type { Listing } from '@/data/types';
import type { RenterPreferences } from '@/store/AppState';
import { BottomSheet } from './BottomSheet';
import { MatchBreakdownList } from './MatchBreakdownList';

type Props = {
  listing: Listing | null;
  prefs: RenterPreferences;
  open: boolean;
  onClose: () => void;
  onOpenDetail: () => void;
};

/** Small sheet from the card's match pill: the fit score and exactly what lines up. */
export function MatchExplainSheet({ listing, prefs, open, onClose, onOpenDetail }: Props) {
  if (!listing) return null;
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      footer={<PillButton label="See full details" size="lg" onPress={onOpenDetail} style={{ flex: 1 }} />}
    >
      <View style={styles.body}>
        <View style={styles.head}>
          <MatchRing score={listing.matchScore} size={56} strokeWidth={3} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="title" numberOfLines={1}>
              {listing.name}
            </Text>
            <Text variant="monoSm">Against your preferences</Text>
          </View>
        </View>
        <MatchBreakdownList listing={listing} prefs={prefs} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20, gap: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});
