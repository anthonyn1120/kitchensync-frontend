import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated from '@/components/ui/Animated';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Bookmark } from 'lucide-react-native';
import { Chip, enterUp, GlassPanel, STAGGER, Text } from '@/components/ui';
import type { Listing } from '@/data/types';
import { colors, fonts, radius } from '@/theme';
import type { ListingStatus } from './DetailSheet';

type Props = {
  listings: Listing[];
  costLabel: (l: Listing) => string;
  statusOf: (id: string) => ListingStatus;
  saved: string[];
  savedOnly: boolean;
  onSavedOnly: (v: boolean) => void;
  onToggleSaved: (id: string) => void;
  onOpen: (l: Listing) => void;
};

const STATUS_LABEL: Record<ListingStatus, string | null> = { booked: 'Booked', requested: 'Requested', none: null };

/** Every kitchen, best fit first, with a Saved filter. Rows open the same detail sheet as the deck. */
export function ListView({ listings, costLabel, statusOf, saved, savedOnly, onSavedOnly, onToggleSaved, onOpen }: Props) {
  const data = savedOnly ? listings.filter((l) => saved.includes(l.id)) : listings;
  return (
    <GlassPanel style={{ flex: 1 }} contentStyle={{ flex: 1 }}>
      <View style={styles.filters}>
        <Chip label={`All ${listings.length}`} size="sm" active={!savedOnly} onPress={() => onSavedOnly(false)} />
        <Chip label={`Saved ${saved.length}`} size="sm" active={savedOnly} onPress={() => onSavedOnly(true)} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="body" align="center">
              Nothing saved yet. Swipe right or tap the bookmark on a kitchen to keep it here.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Row
            listing={item}
            index={index}
            cost={costLabel(item)}
            status={statusOf(item.id)}
            saved={saved.includes(item.id)}
            onToggleSaved={() => onToggleSaved(item.id)}
            onPress={() => onOpen(item)}
          />
        )}
      />
    </GlassPanel>
  );
}

function Row({
  listing,
  index,
  cost,
  status,
  saved,
  onToggleSaved,
  onPress,
}: {
  listing: Listing;
  index: number;
  cost: string;
  status: ListingStatus;
  saved: boolean;
  onToggleSaved: () => void;
  onPress: () => void;
}) {
  const label = STATUS_LABEL[status];
  return (
    <Animated.View entering={enterUp(Math.min(index, 6) * STAGGER)}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
        <Image source={{ uri: listing.photos[0] }} style={styles.photo} contentFit="cover" cachePolicy="memory-disk" />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.nameRow}>
            <Text variant="label" numberOfLines={1} style={{ flexShrink: 1 }}>
              {listing.name}
            </Text>
            {label && (
              <Text variant="monoSm" color={status === 'booked' ? colors.accentMatch : colors.textTertiary}>
                {label}
              </Text>
            )}
          </View>
          <Text variant="monoSm" numberOfLines={1}>
            {`${listing.distanceMiles} mi · $${listing.ratePerHour}/hr`}
          </Text>
          <Text variant="monoSm" numberOfLines={1} color={colors.textSecondary}>
            {cost}
          </Text>
        </View>
        <View style={styles.right}>
          <View style={styles.match}>
            <Text style={styles.matchText}>{`${listing.matchScore}%`}</Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              onToggleSaved();
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={saved ? `Remove ${listing.name} from saved` : `Save ${listing.name}`}
          >
            <Bookmark
              size={18}
              color={saved ? colors.accentMatch : colors.textTertiary}
              fill={saved ? colors.accentMatch : 'transparent'}
            />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  sep: { height: 1, backgroundColor: colors.white08 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  photo: { width: 60, height: 60, borderRadius: radius.sm, backgroundColor: colors.black20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  right: { alignItems: 'flex-end', gap: 12 },
  match: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMatchSoft,
    borderWidth: 1,
    borderColor: 'rgba(163, 196, 129, 0.35)',
  },
  matchText: { fontFamily: fonts.monoMedium, fontSize: 11, color: colors.accentMatch },
  empty: { paddingVertical: 48, paddingHorizontal: 24 },
});
