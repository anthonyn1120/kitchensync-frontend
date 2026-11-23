import { Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import type { Listing } from '@/data/types';
import { SwipeCard, SwipeCardHandle, SwipeDir } from './SwipeCard';

export type SwipeDeckHandle = { swipe: (dir: SwipeDir) => void };

type Props = {
  deck: Listing[];
  onSwipe: (listingId: string, dir: SwipeDir) => void;
  onOpenDetail: (listing: Listing) => void;
  onExplainMatch: (listing: Listing) => void;
  costLabel: (listing: Listing) => string;
  /** Bump `n` when an undone pass puts `id` back on top, so it slides back in as a fresh card */
  returning?: { id: string; n: number } | null;
  ref?: Ref<SwipeDeckHandle>;
};

const VISIBLE = 4; // top + 2 visible behind + 1 invisible "next" so it can fade in
const STACK_ROOM = 14; // the scaled back cards peek out below the top card

/**
 * Stack of swipe cards. A card that's been swiped is committed to the store
 * immediately (so the next card is live at once) but stays mounted in the
 * `leaving` list until its fly-off animation finishes.
 */
export function SwipeDeck({
  deck,
  onSwipe,
  onOpenDetail,
  onExplainMatch,
  costLabel,
  returning,
  ref,
}: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [leaving, setLeaving] = useState<{ listing: Listing; key: string }[]>([]);
  // Each undo gives that card a new generation, so it mounts fresh instead of
  // reusing the instance that flew off (which may still be animating).
  const gens = useRef<Record<string, number>>({});
  if (returning && gens.current[returning.id] !== returning.n) gens.current[returning.id] = returning.n;
  const keyFor = (id: string) => (gens.current[id] ? `${id}-r${gens.current[id]}` : id);
  const lift = useSharedValue(0);
  const topRef = useRef<SwipeCardHandle>(null);

  useImperativeHandle(ref, () => ({ swipe: (dir) => topRef.current?.swipe(dir) }));

  const topId = deck[0]?.id;
  // Cards have already re-based their springs on `lift` (child effects run first).
  useEffect(() => {
    lift.value = 0;
  }, [topId, lift]);

  const handleSwipe = useCallback(
    (id: string, dir: SwipeDir) => {
      const listing = deck.find((l) => l.id === id);
      if (!listing) return;
      setLeaving((prev) => [...prev, { listing, key: keyFor(id) }]);
      onSwipe(id, dir);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deck, onSwipe],
  );

  const handleExited = useCallback((id: string) => {
    setLeaving((prev) => {
      const i = prev.findIndex((l) => l.listing.id === id);
      return i < 0 ? prev : [...prev.slice(0, i), ...prev.slice(i + 1)];
    });
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  const cardH = Math.max(size.h - STACK_ROOM, 0);
  const compact = cardH < 520;
  const visible = deck.slice(0, VISIBLE);
  const visibleKeys = visible.map((l) => keyFor(l.id));
  const leavingOnly = leaving.filter((l) => !visibleKeys.includes(l.key));

  // One flat, id-keyed list so a card keeps its instance (and animation state)
  // when it moves from the deck into `leaving`. Render back-to-front.
  const cards: { listing: Listing; index: number; key: string }[] = [
    ...visible.map((listing, index) => ({ listing, index, key: visibleKeys[index] })).reverse(),
    ...leavingOnly.map(({ listing, key }) => ({ listing, index: -1, key })),
  ];

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {size.w > 0 &&
        cards.map(({ listing, index, key }) => (
          <SwipeCard
            key={key}
            ref={index === 0 ? topRef : undefined}
            listing={listing}
            index={index}
            width={size.w}
            height={cardH}
            lift={lift}
            compact={compact}
            onSwipe={handleSwipe}
            onExited={handleExited}
            onOpenDetail={() => onOpenDetail(listing)}
            onExplainMatch={() => onExplainMatch(listing)}
            costLabel={costLabel(listing)}
            returning={returning?.id === listing.id && key.endsWith(`-r${returning.n}`) && index === 0}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
});
