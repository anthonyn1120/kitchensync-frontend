import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from '@/components/ui/Animated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Bookmark, Star } from 'lucide-react-native';
import { Avatar, Chip, enterUp, IconButton, MatchRing, PillButton, SectionTitle, STAGGER, Text } from '@/components/ui';
import { estimateCost } from '@/data/matching';
import type { Listing, Weekday } from '@/data/types';
import type { RenterPreferences } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';
import { BottomSheet } from './BottomSheet';
import { money } from './cost';
import { DayGrid } from './DayGrid';
import { FakeMap } from './FakeMap';
import { MatchBreakdownList } from './MatchBreakdownList';

/** Where the renter stands with a kitchen, from their bookings. */
export type ListingStatus = 'requested' | 'booked' | 'none';

type Props = {
  listing: Listing | null;
  prefs: RenterPreferences;
  status: ListingStatus;
  saved: boolean;
  open: boolean;
  onClose: () => void;
  onToggleSaved: () => void;
  /** Open the booking flow, optionally on a tapped day */
  onBook: (day?: Weekday) => void;
  onMessage: () => void;
};

const enter = (i: number) => enterUp(60 + i * STAGGER);

/** Mobile version of the mockup's right-hand .detail-panel. */
export function DetailSheet({ listing, prefs, status, saved, open, onClose, onToggleSaved, onBook, onMessage }: Props) {
  if (!listing) return null;
  const cost = estimateCost(listing, prefs);

  const footer = (
    <View style={styles.footerCol}>
      <View style={styles.footerRow}>
        <PillButton label="Message" size="lg" onPress={onMessage} style={{ flex: 1 }} />
        <PillButton label="Request to book" size="lg" variant="primary" onPress={() => onBook()} style={{ flex: 1.4 }} />
      </View>
      <Text variant="monoSm" align="center">
        {status === 'requested'
          ? `Request sent · waiting on ${listing.hostName.split(' ')[0]}`
          : `${listing.hostName.split(' ')[0]} approves requests · ${listing.responseTime}`}
      </Text>
    </View>
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      maxHeightRatio={0.9}
      header={
        <View style={styles.header}>
          <View style={styles.headerPhoto}>
            <Image source={{ uri: listing.photos[0] }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']} style={StyleSheet.absoluteFill} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="title" numberOfLines={1}>
              {listing.name}
            </Text>
            <Text variant="monoSm" style={{ marginTop: 4 }}>
              {`${listing.distanceMiles} miles  ·  $${listing.ratePerHour}/hr${saved ? '  ·  Saved' : ''}`}
            </Text>
          </View>
          <IconButton
            size={40}
            onPress={() => {
              Haptics.selectionAsync();
              onToggleSaved();
            }}
          >
            <Bookmark
              size={16}
              color={saved ? colors.accentMatch : colors.textPrimary}
              fill={saved ? colors.accentMatch : 'transparent'}
            />
          </IconButton>
        </View>
      }
      footer={footer}
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Fit score + exactly what lines up */}
        <Animated.View entering={enter(0)} style={styles.matchHeader}>
          <MatchRing score={listing.matchScore} size={64} strokeWidth={3} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="mono">Fit Score</Text>
            <Text variant="bodySm" style={{ fontSize: 13 }}>
              {listing.matchReason}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={enter(1)} style={styles.section}>
          <SectionTitle>How it fits</SectionTitle>
          <MatchBreakdownList listing={listing} prefs={prefs} />
          <View style={[styles.chips, { marginTop: 14 }]}>
            {listing.equipment.map((e) => (
              <Chip key={e.name} label={e.available ? e.name : `${e.name} · not on site`} size="sm" style={!e.available && { opacity: 0.55 }} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={enter(2)} style={styles.section}>
          <SectionTitle right={<Text variant="monoSm">{`Min ${listing.minHours} hrs`}</Text>}>Cost per session</SectionTitle>
          <View style={styles.costRows}>
            <CostRow label={`${cost.hours} hrs × ${money(cost.ratePerHour)}`} value={money(cost.subtotal)} />
            <CostRow label="Cleaning fee" value={money(cost.cleaningFee)} />
            <View style={styles.rule} />
            <CostRow label="Total" value={money(cost.total)} strong />
            <CostRow label="Deposit, refundable" value={money(cost.deposit)} note="Held, not charged" />
          </View>
          <View style={{ marginTop: 12, gap: 4 }}>
            <Text variant="monoSm">{`Based on your usual ${cost.hours}-hr session`}</Text>
            <Text variant="monoSm">{listing.responseTime}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={enter(3)} style={styles.section}>
          <SectionTitle right={<Text variant="monoSm">{listing.hours}</Text>}>Availability</SectionTitle>
          <DayGrid available={listing.availableDays} highlight={prefs.days} onPressDay={onBook} />
          <Text variant="monoSm" style={{ marginTop: 10 }}>
            Tap an open day to request it
          </Text>
        </Animated.View>

        <View style={styles.section}>
          <SectionTitle>Certifications & Allergens</SectionTitle>
          <View style={styles.chips}>
            {listing.certifications.map((c) => (
              <Chip key={c} label={c} size="sm" />
            ))}
            {listing.allergenPolicies.map((a) => (
              <Chip key={a} label={a} size="sm" active />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>Host</SectionTitle>
          <View style={styles.hostRow}>
            <Avatar emoji={listing.hostAvatar} size={44} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="label">{listing.hostName}</Text>
              <View style={styles.rating}>
                <Star size={12} color={colors.accentMatch} fill={colors.accentMatch} />
                <Text style={styles.ratingText}>{`${listing.rating.toFixed(1)} · ${listing.reviewCount} reviews`}</Text>
              </View>
            </View>
            <Text variant="monoSm">{`${listing.sqft.toLocaleString('en-US')} sq ft`}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>Location</SectionTitle>
          <FakeMap coords={listing.coords} label={listing.neighborhood} distance={listing.distanceMiles} />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

function CostRow({ label, value, strong, note }: { label: string; value: string; strong?: boolean; note?: string }) {
  return (
    <View style={styles.costRow}>
      <View style={{ flex: 1 }}>
        <Text variant="bodySm" color={strong ? colors.textPrimary : colors.textSecondary} style={strong && styles.strong}>
          {label}
        </Text>
        {note && <Text variant="monoSm" style={{ marginTop: 2 }}>{note}</Text>}
      </View>
      <Text style={[styles.costValue, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.white08,
  },
  headerPhoto: { width: 44, height: 44, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.black20 },
  body: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 24, gap: 28 },
  matchHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  section: { gap: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  costRows: { gap: 10 },
  costRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  costValue: { fontFamily: fonts.mono, fontSize: 13, color: colors.textSecondary },
  strong: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  rule: { height: 1, backgroundColor: colors.white08 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingText: { fontFamily: fonts.mono, fontSize: 11, color: colors.textSecondary },
  footerCol: { flex: 1, gap: 10 },
  footerRow: { flexDirection: 'row', gap: 12 },
});
