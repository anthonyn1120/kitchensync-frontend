import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SlidersHorizontal } from 'lucide-react-native';
import { BookingFlowSheet } from '@/components/booking-flow';
import { IconButton, PageTitle, Screen } from '@/components/ui';
import { costLine } from '@/components/find-space/cost';
import { DetailSheet, ListingStatus } from '@/components/find-space/DetailSheet';
import { EmptyState } from '@/components/find-space/EmptyState';
import { FilterSheet } from '@/components/find-space/FilterSheet';
import { buildDeck, DeckFilters } from '@/components/find-space/filters';
import { ListView } from '@/components/find-space/ListView';
import { MatchExplainSheet } from '@/components/find-space/MatchExplainSheet';
import { RefineCard } from '@/components/find-space/RefineCard';
import { SegmentedToggle } from '@/components/find-space/SegmentedToggle';
import type { SwipeDir } from '@/components/find-space/SwipeCard';
import { SwipeDeck, SwipeDeckHandle } from '@/components/find-space/SwipeDeck';
import { Toast } from '@/components/find-space/Toast';
import { UndoPill } from '@/components/find-space/UndoPill';
import { getListing, listings } from '@/data/mock';
import type { Listing, Weekday } from '@/data/types';
import { useAppState } from '@/store/AppState';
import { colors } from '@/theme';

type Mode = 'swipe' | 'list';

const UNDO_MS = 5000;
const SHEET_CLOSE_MS = 260;

const byMatch = [...listings].sort((a, b) => b.matchScore - a.matchScore);

export default function FindSpace() {
  const insets = useSafeAreaInsets();
  const {
    renterPrefs,
    prefsRefined,
    passed,
    saved,
    bookings,
    updateRenterPrefs,
    save,
    startConversation,
    markPassed,
    undoPass,
    resetPassed,
    toggleSaved,
  } = useAppState();

  const [view, setView] = useState<Mode>('swipe');
  const [savedOnly, setSavedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detail, setDetail] = useState<Listing | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [explain, setExplain] = useState<Listing | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);
  const [booking, setBooking] = useState<{ id: string; day?: Weekday } | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [undo, setUndo] = useState<{ id: string; n: number } | null>(null);
  const [returning, setReturning] = useState<{ id: string; n: number } | null>(null);
  const [refineDismissed, setRefineDismissed] = useState(false);
  const deckRef = useRef<SwipeDeckHandle>(null);

  const filters: DeckFilters = useMemo(
    () => ({
      maxDistanceMiles: renterPrefs.maxDistanceMiles,
      budgetPerHour: renterPrefs.budgetPerHour,
      equipment: renterPrefs.equipment,
      days: renterPrefs.days,
    }),
    [renterPrefs.maxDistanceMiles, renterPrefs.budgetPerHour, renterPrefs.equipment, renterPrefs.days],
  );
  // Anything already decided leaves the deck: passed or saved.
  const excluded = useMemo(() => [...new Set([...passed, ...saved])], [passed, saved]);
  const deck = useMemo(() => buildDeck(listings, filters, excluded), [filters, excluded]);

  const statusOf = useCallback(
    (id: string): ListingStatus => {
      const mine = bookings.filter((b) => b.listingId === id);
      if (mine.some((b) => b.status === 'pending')) return 'requested';
      if (mine.some((b) => b.status === 'confirmed')) return 'booked';
      return 'none';
    },
    [bookings],
  );
  const cost = useCallback((l: Listing) => costLine(l, renterPrefs), [renterPrefs]);

  // Let the last card finish flying off before swapping in the empty state.
  const [showEmpty, setShowEmpty] = useState(deck.length === 0);
  useEffect(() => {
    if (deck.length > 0) {
      setShowEmpty(false);
      return;
    }
    const t = setTimeout(() => setShowEmpty(true), 380);
    return () => clearTimeout(t);
  }, [deck.length]);

  // The undo pill lives for a few seconds after each pass.
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), UNDO_MS);
    return () => clearTimeout(t);
  }, [undo]);

  const decide = useCallback(
    (id: string, dir: SwipeDir) => {
      if (dir === 'right') {
        save(id);
        setToast({ id: Date.now(), message: `Saved · ${getListing(id)?.name ?? 'kitchen'}` });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        markPassed(id);
        setUndo({ id, n: Date.now() });
      }
    },
    [save, markPassed],
  );

  const handleUndo = () => {
    const id = undoPass();
    setUndo(null);
    if (id) setReturning({ id, n: Date.now() });
  };

  const openDetail = useCallback((l: Listing) => {
    setDetail(l);
    setDetailOpen(true);
  }, []);

  const openExplain = useCallback((l: Listing) => {
    setExplain(l);
    setExplainOpen(true);
  }, []);

  // Saving the top card from its sheet closes the sheet first, then flies the
  // card off so the user sees it go. Anywhere else the bookmark just toggles.
  const toggleSavedFromDetail = () => {
    if (!detail) return;
    const id = detail.id;
    if (view === 'swipe' && !showEmpty && deck[0]?.id === id) {
      setDetailOpen(false);
      setTimeout(() => deckRef.current?.swipe('right'), SHEET_CLOSE_MS);
    } else {
      toggleSaved(id);
    }
  };

  const openBooking = (day?: Weekday) => {
    if (!detail) return;
    setBooking({ id: detail.id, day });
    setDetailOpen(false);
    setTimeout(() => setBookingOpen(true), SHEET_CLOSE_MS);
  };

  const messageFromDetail = () => {
    if (!detail) return;
    const convo = startConversation(detail.id);
    setDetailOpen(false);
    setTimeout(() => router.push(`/renter/messages/${convo}`), SHEET_CLOSE_MS);
  };

  const applyFilters = (f: DeckFilters) => {
    updateRenterPrefs(f);
    setFiltersOpen(false);
  };

  const expandRadius = () => {
    updateRenterPrefs({ maxDistanceMiles: Math.min(renterPrefs.maxDistanceMiles + 5, 25) });
    resetPassed();
  };

  const undoListing = undo ? getListing(undo.id) : undefined;

  return (
    <Screen withTabBar>
      <PageTitle
        eyebrow="Renter Mode"
        title="Find Space"
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <SegmentedToggle
              options={[
                { value: 'swipe', label: 'Swipe' },
                { value: 'list', label: 'List' },
              ]}
              value={view}
              onChange={setView}
            />
            <IconButton size={40} onPress={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={17} color={colors.textPrimary} />
            </IconButton>
          </View>
        }
      />

      {!prefsRefined && !refineDismissed && (
        <RefineCard
          onPress={() => router.push('/onboarding/renter/requirements?refine=1')}
          onDismiss={() => setRefineDismissed(true)}
        />
      )}

      <View style={{ flex: 1 }}>
        {view === 'list' ? (
          <Animated.View key="list" entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ flex: 1 }}>
            <ListView
              listings={byMatch}
              costLabel={cost}
              statusOf={statusOf}
              saved={saved}
              savedOnly={savedOnly}
              onSavedOnly={setSavedOnly}
              onToggleSaved={toggleSaved}
              onOpen={openDetail}
            />
          </Animated.View>
        ) : !showEmpty ? (
          <Animated.View key="deck" entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={{ flex: 1 }}>
            <SwipeDeck
              ref={deckRef}
              deck={deck}
              onSwipe={decide}
              onOpenDetail={openDetail}
              onExplainMatch={openExplain}
              costLabel={cost}
              returning={returning}
            />
          </Animated.View>
        ) : (
          <Animated.View key="empty" entering={FadeIn.delay(200).duration(300)} style={{ flex: 1 }}>
            <EmptyState
              onExpandRadius={expandRadius}
              onAdjustFilters={() => setFiltersOpen(true)}
              onResetPassed={resetPassed}
            />
          </Animated.View>
        )}

        {undo && undoListing && <UndoPill key={undo.n} name={undoListing.name} onUndo={handleUndo} />}
      </View>

      <Toast toast={toast} top={insets.top + 8} onHide={() => setToast(null)} />

      <FilterSheet
        open={filtersOpen}
        initial={filters}
        exclude={excluded}
        onClose={() => setFiltersOpen(false)}
        onApply={applyFilters}
      />
      <MatchExplainSheet
        listing={explain}
        prefs={renterPrefs}
        open={explainOpen}
        onClose={() => setExplainOpen(false)}
        onOpenDetail={() => {
          setExplainOpen(false);
          if (explain) setTimeout(() => openDetail(explain), SHEET_CLOSE_MS);
        }}
      />
      <DetailSheet
        listing={detail}
        prefs={renterPrefs}
        status={detail ? statusOf(detail.id) : 'none'}
        saved={!!detail && saved.includes(detail.id)}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onToggleSaved={toggleSavedFromDetail}
        onBook={openBooking}
        onMessage={messageFromDetail}
      />
      {booking && (
        <BookingFlowSheet
          listingId={booking.id}
          visible={bookingOpen}
          initialDay={booking.day}
          onClose={() => setBookingOpen(false)}
          onBooked={() => setToast({ id: Date.now(), message: 'Booking request sent · see Bookings' })}
        />
      )}
    </Screen>
  );
}
