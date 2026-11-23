import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PageTitle, Screen, Text } from '@/components/ui';
import {
  BookingDetailSheet,
  GuidelinesSheet,
  PastItem,
  SegmentedControl,
  UpcomingHero,
  UpcomingRow,
  useToast,
} from '@/components/bookings';
import { isUpcoming, sortTime } from '@/components/bookings/dates';
import { BookingFlowSheet } from '@/components/booking-flow';
import { useAppState } from '@/store/AppState';
import type { Booking } from '@/data/types';
import { enterUp, STAGGER } from '@/components/ui/motion';

type Tab = 'upcoming' | 'past';

const fadeUp = (i: number) => enterUp(60 + i * STAGGER);
const layout = LinearTransition.duration(240);

export default function BookingsScreen() {
  const { bookings, conversations } = useAppState();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [guidelines, setGuidelines] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [again, setAgain] = useState<{ listingId: string; open: boolean } | null>(null);
  const toast = useToast();


  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => (b.status === 'confirmed' || b.status === 'pending') && isUpcoming(b.date))
        .sort((a, b) => sortTime(a.date, a.time) - sortTime(b.date, b.time)),
    [bookings],
  );
  const past = useMemo(
    () =>
      bookings
        .filter((b) => !upcoming.includes(b))
        .sort((a, b) => sortTime(b.date, b.time) - sortTime(a.date, a.time)),
    [bookings, upcoming],
  );
  // Soonest confirmed session leads; everything else upcoming is listed under it.
  const hero = upcoming.find((b) => b.status === 'confirmed');
  const others = upcoming.filter((b) => b !== hero);

  // A request the host just confirmed: one success tick and a short note.
  const prevStatus = useRef<Record<string, Booking['status']>>({});
  useEffect(() => {
    for (const b of bookings) {
      if (prevStatus.current[b.id] === 'pending' && b.status === 'confirmed') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.show(`${b.hostName.split(' ')[0]} confirmed your session`);
      }
    }
    prevStatus.current = Object.fromEntries(bookings.map((b) => [b.id, b.status]));
  }, [bookings]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the open detail sheet in sync when its booking changes (e.g. pending → confirmed).
  const shownSelected = selected ? bookings.find((b) => b.id === selected.id) ?? selected : null;

  const openConversation = (b: Booking) => {
    const c = conversations.renter.find((x) => x.listingId === b.listingId);
    router.push(c ? `/renter/messages/${c.id}` : '/renter/messages');
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen withTabBar scroll>
        <PageTitle eyebrow="Renter Mode" title="Bookings" />

        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'upcoming', label: 'Upcoming', count: upcoming.length },
            { value: 'past', label: 'Past', count: past.length },
          ]}
        />

        {tab === 'upcoming' ? (
          <View key="upcoming" style={{ marginTop: 28 }}>
            <Animated.View entering={fadeUp(0)} layout={layout}>
              <Text variant="mono" style={{ marginBottom: 16 }}>
                Upcoming Session
              </Text>
              {hero ? (
                <Animated.View key={hero.id} entering={enterUp(0)}>
                  <UpcomingHero
                    booking={hero}
                    onMessage={() => openConversation(hero)}
                    onCopyCode={() => toast.show('Copied')}
                    onGuidelines={() => setGuidelines(true)}
                    onDirections={() => toast.show('Opening directions in Maps')}
                    onCalendar={() => toast.show('Added to Calendar')}
                  />
                </Animated.View>
              ) : (
                <Text variant="body">No confirmed sessions yet.</Text>
              )}
            </Animated.View>

            {others.length > 0 && (
              <Animated.View entering={fadeUp(1)} layout={layout} style={{ marginTop: 32 }}>
                <Text variant="mono" style={{ marginBottom: 16 }}>
                  Also Coming Up
                </Text>
                <View style={{ gap: 12 }}>
                  {others.map((b) => (
                    <Animated.View key={b.id} entering={enterUp(0)} layout={layout}>
                      <UpcomingRow booking={b} onPress={() => setSelected(b)} />
                    </Animated.View>
                  ))}
                </View>
              </Animated.View>
            )}
          </View>
        ) : (
          <View key="past" style={{ marginTop: 28 }}>
            <Animated.View entering={fadeUp(0)}>
              <Text variant="mono" style={{ marginBottom: 16 }}>
                Past Sessions
              </Text>
            </Animated.View>
            <View style={{ gap: 12 }}>
              {past.map((b, i) => (
                <Animated.View key={b.id} entering={fadeUp(i + 1)}>
                  <PastItem booking={b} onPress={() => setSelected(b)} />
                </Animated.View>
              ))}
            </View>
          </View>
        )}
      </Screen>

      {hero && <GuidelinesSheet visible={guidelines} onClose={() => setGuidelines(false)} facilityName={hero.facilityName} />}

      <BookingDetailSheet
        booking={shownSelected}
        onClose={() => setSelected(null)}
        ratings={ratings}
        onRate={(id, n) => setRatings((r) => ({ ...r, [id]: n }))}
        onBookAgain={(b) => {
          setSelected(null);
          // Let the receipt finish closing before the booking sheet rises.
          setTimeout(() => setAgain({ listingId: b.listingId, open: true }), 260);
        }}
        onMessageHost={(b) => {
          setSelected(null);
          openConversation(b);
        }}
      />

      {again && (
        <BookingFlowSheet
          listingId={again.listingId}
          visible={again.open}
          onClose={() => setAgain((a) => (a ? { ...a, open: false } : a))}
          onBooked={() => setTab('upcoming')}
        />
      )}

      {toast.node}
    </View>
  );
}
