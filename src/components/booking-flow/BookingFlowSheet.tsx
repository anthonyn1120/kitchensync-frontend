import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from '@/components/ui/Animated';
import { router } from 'expo-router';
import { Check, Minus, Plus } from 'lucide-react-native';
import { BottomSheet } from '@/components/bookings/BottomSheet';
import { IconButton, PillButton, Text } from '@/components/ui';
import { enterUp, STAGGER } from '@/components/ui/motion';
import { getListing } from '@/data/mock';
import { estimateCost } from '@/data/matching';
import type { Listing } from '@/data/types';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';
import {
  Day,
  defaultDayIndex,
  formatHour,
  maxHours,
  nextDays,
  parseHours,
  preselectedStations,
  rangeLabel,
  SlotState,
  slotStates,
  stationOptions,
} from './slots';

export type BookingFlowSheetProps = {
  listingId: string;
  visible: boolean;
  onClose: () => void;
  /** Called after the request is sent, with the new booking id. */
  onBooked?: (bookingId: string) => void;
  /** Preselect a day, e.g. when opened from a tapped day in the availability grid. */
  initialDay?: import('@/data/types').Weekday;
};

/** Pick a day, a start time and stations, see the cost, and send a booking request. */
export function BookingFlowSheet({ listingId, visible, onClose, onBooked, initialDay }: BookingFlowSheetProps) {
  const listing = getListing(listingId);
  if (!listing) return null;
  return <Flow listing={listing} visible={visible} onClose={onClose} onBooked={onBooked} initialDay={initialDay} />;
}

function Flow({ listing, visible, onClose, onBooked, initialDay }: Omit<BookingFlowSheetProps, 'listingId'> & { listing: Listing }) {
  const { renterPrefs, bookings, requestBooking } = useAppState();

  const days = useMemo(() => nextDays(listing), [listing]);
  const win = useMemo(() => parseHours(listing.hours), [listing.hours]);
  const options = useMemo(() => stationOptions(listing), [listing]);
  const longest = Math.max(listing.minHours, maxHours(win));

  const initial = () => {
    const hrs = Math.min(longest, estimateCost(listing, renterPrefs).hours);
    // Start on the preferred day, or the next open day that still has a free slot.
    const first = defaultDayIndex(days, initialDay);
    const hasRoom = (i: number) => days[i].open && slotStates(listing, days[i], hrs, bookings).some((x) => x.state === 'open');
    const free = [...days.keys()].slice(first).find(hasRoom);
    return {
      dayIndex: free ?? first,
      hours: hrs,
      stations: preselectedStations(listing, options, renterPrefs.equipment),
    };
  };
  const [dayIndex, setDayIndex] = useState(() => initial().dayIndex);
  const [hours, setHours] = useState(() => initial().hours);
  const [start, setStart] = useState<number | null>(null);
  const [stations, setStations] = useState<string[]>(() => initial().stations);
  const [sent, setSent] = useState<{ date: string; time: string; total: number; deposit: number } | null>(null);
  const stripRef = useRef<ScrollView>(null);

  // Fresh form every time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    const init = initial();
    setDayIndex(init.dayIndex);
    setHours(init.hours);
    setStations(init.stations);
    setSent(null);
    setTimeout(() => stripRef.current?.scrollTo({ x: Math.max(0, init.dayIndex - 2) * 62, animated: false }), 0);
  }, [visible, listing.id, initialDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const day = days[dayIndex];
  const slots = useMemo(() => slotStates(listing, day, hours, bookings), [listing, day, hours, bookings]);
  const cost = estimateCost(listing, renterPrefs, hours);

  // Keep a valid start selected: the first open slot when the day or duration changes.
  useEffect(() => {
    if (sent) return;
    const current = slots.find((s) => s.start === start);
    if (!current || current.state !== 'open') setStart(slots.find((s) => s.state === 'open')?.start ?? null);
  }, [slots]); // eslint-disable-line react-hooks/exhaustive-deps

  const canBook = day.open && start !== null;
  const firstName = listing.hostName.split(' ')[0];

  const submit = () => {
    if (!canBook || start === null) return;
    const time = rangeLabel(start, cost.hours);
    const id = requestBooking({
      listingId: listing.id,
      date: day.label,
      time,
      hours: cost.hours,
      stations: stations.length ? stations.join(', ') : 'Kitchen access',
    });
    setSent({ date: day.label, time, total: cost.total, deposit: cost.deposit });
    onBooked?.(id);
  };

  const viewBookings = () => {
    onClose();
    setTimeout(() => router.navigate('/renter/bookings'), 240);
  };

  const footer = sent ? (
    <View style={{ gap: 10 }}>
      <PillButton label="View in Bookings" variant="primary" size="lg" fullWidth onPress={viewBookings} />
      <PillButton label="Done" fullWidth onPress={onClose} />
    </View>
  ) : (
    <View style={{ gap: 8 }}>
      <PillButton
        label={start !== null && day.open ? `Request booking · $${cost.total}` : 'Request booking'}
        variant="primary"
        size="lg"
        fullWidth
        haptic="success"
        disabled={!canBook}
        onPress={submit}
      />
      <Text variant="monoSm" align="center">
        No charge until {firstName} confirms
      </Text>
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      eyebrow={sent ? undefined : 'Book a session'}
      title={sent ? undefined : listing.name}
      footer={footer}
    >
      {sent ? renderSuccess() : renderForm()}
    </BottomSheet>
  );

  function renderSuccess() {
    if (!sent) return null;
    return (
      <View style={styles.success}>
        <Animated.View entering={enterUp(0)} style={styles.successIcon}>
          <Check size={22} color={colors.primaryButtonText} strokeWidth={2.5} />
        </Animated.View>
        <Animated.View entering={enterUp(STAGGER)} style={{ gap: 6, alignItems: 'center' }}>
          <Text variant="h3" align="center">
            Request sent to {firstName}.
          </Text>
          <Text variant="body" align="center">
            {listing.responseTime}.
          </Text>
        </Animated.View>
        <Animated.View entering={enterUp(STAGGER * 2)} style={styles.successCard}>
          <Text style={styles.value}>{listing.name}</Text>
          <Text variant="monoSm">
            {sent.date} • {sent.time}
          </Text>
          <Text variant="monoSm">
            ${sent.total.toFixed(2)} total • ${sent.deposit} deposit held
          </Text>
        </Animated.View>
      </View>
    );
  }

  function renderForm() {
    return (
    <View style={{ gap: 24 }}>
      {/* Date strip */}
      <View style={{ gap: 12 }}>
        <View style={styles.sectionHead}>
          <Text variant="mono">Date</Text>
          <Text variant="monoSm">Open {listing.availableDays.join(' · ')}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -24 }}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          ref={stripRef}
        >
          {days.map((d, i) => (
            <DayCell key={d.key} day={d} selected={i === dayIndex} onPress={() => setDayIndex(i)} />
          ))}
        </ScrollView>
      </View>

      {/* Duration + start times */}
      <View style={{ gap: 12 }}>
        <View style={styles.sectionHead}>
          <Text variant="mono">Start time</Text>
          <Text variant="monoSm">{listing.hours}</Text>
        </View>
        <View style={styles.stepperRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.value}>
              {hours} hours
            </Text>
            <Text variant="monoSm">{listing.minHours} hr minimum</Text>
          </View>
          <IconButton
            size={40}
            onPress={() => setHours((h) => Math.max(listing.minHours, h - 1))}
            style={hours <= listing.minHours && styles.disabled}
          >
            <Minus size={16} color={colors.textPrimary} />
          </IconButton>
          <IconButton
            size={40}
            onPress={() => setHours((h) => Math.min(longest, h + 1))}
            style={hours >= longest && styles.disabled}
          >
            <Plus size={16} color={colors.textPrimary} />
          </IconButton>
        </View>
        {day.open ? (
          <View style={styles.slotGrid}>
            {slots.map((s) => (
              <SlotCell key={s.start} start={s.start} state={s.state} selected={s.start === start} onPress={() => setStart(s.start)} />
            ))}
          </View>
        ) : (
          <Text variant="bodySm">Closed this day.</Text>
        )}
        {day.open && slots.every((s) => s.state !== 'open') && (
          <Text variant="bodySm">
            {slots.some((s) => s.state === 'yours')
              ? 'You already have a session here this day.'
              : `Nothing open for ${hours} hours this day. Try a shorter session or another day.`}
          </Text>
        )}
      </View>

      {/* Stations */}
      {options.length > 0 && (
        <View style={{ gap: 12 }}>
          <View style={styles.sectionHead}>
            <Text variant="mono">Stations</Text>
            <Text variant="monoSm">{stations.length} selected</Text>
          </View>
          <View style={styles.chips}>
            {options.map((o) => {
              const on = stations.includes(o);
              return (
                <Pressable
                  key={o}
                  onPress={() => setStations((cur) => (on ? cur.filter((x) => x !== o) : [...cur, o]))}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  {on && <Check size={13} color={colors.accentMatch} strokeWidth={2.5} />}
                  <Text style={[styles.chipText, on && { color: colors.accentMatch }]}>{o}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summary}>
        <Line label="Date" value={day.open ? day.label : '—'} />
        <Line label="Time" value={start !== null ? rangeLabel(start, cost.hours) : '—'} />
        <View style={styles.rule} />
        <Line label={`${cost.hours} hrs × $${cost.ratePerHour}/hr`} value={`$${cost.subtotal.toFixed(2)}`} mono />
        <Line label="Cleaning fee" value={`$${cost.cleaningFee.toFixed(2)}`} mono />
        <View style={styles.rule} />
        <View style={styles.totalRow}>
          <Text variant="mono">Total</Text>
          <Text style={styles.total}>${cost.total.toFixed(2)}</Text>
        </View>
        <Text variant="bodySm">
          ${cost.deposit} refundable deposit, held and not charged.{'\n'}Free cancellation up to 48 hrs before.
        </Text>
      </View>

    </View>
    );
  }
}

function DayCell({ day, selected, onPress }: { day: Day; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!day.open}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !day.open }}
      accessibilityLabel={`${day.label}${day.open ? '' : ', closed'}`}
      style={[styles.day, selected && styles.daySelected, !day.open && { opacity: 0.35 }]}
    >
      <Text variant="monoSm" color={selected ? colors.primaryButtonText : colors.textTertiary}>
        {day.weekday}
      </Text>
      <Text style={[styles.dayNum, selected && { color: colors.primaryButtonText }]}>{day.dayOfMonth}</Text>
      <Text variant="monoSm" color={selected ? colors.primaryButtonText : colors.textTertiary} style={{ fontSize: 9 }}>
        {day.open ? day.month : 'Closed'}
      </Text>
    </Pressable>
  );
}

const SLOT_NOTE: Record<SlotState, string | null> = {
  open: null,
  booked: 'Booked',
  yours: 'Yours',
  closing: 'Too late',
};

function SlotCell({ start, state, selected, onPress }: { start: number; state: SlotState; selected: boolean; onPress: () => void }) {
  const unavailable = state !== 'open';
  const note = SLOT_NOTE[state];
  return (
    <Pressable
      onPress={onPress}
      disabled={unavailable}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: unavailable }}
      accessibilityLabel={`${formatHour(start)}${note ? `, ${note}` : ''}`}
      style={[styles.slot, selected && styles.slotSelected, unavailable && styles.slotOff]}
    >
      <Text
        style={[
          styles.slotText,
          selected && { color: colors.primaryButtonText },
          unavailable && { color: colors.textTertiary, textDecorationLine: state === 'closing' ? 'none' : 'line-through' },
        ]}
      >
        {formatHour(start)}
      </Text>
      {note && (
        <Text variant="monoSm" style={{ fontSize: 9 }} color={colors.textTertiary}>
          {note}
        </Text>
      )}
    </Pressable>
  );
}

function Line({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.line}>
      <Text variant={mono ? 'mono' : 'bodySm'} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text style={[styles.lineValue, mono && { fontFamily: fonts.mono }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  day: {
    width: 54,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
    borderRadius: radius.sm + 4,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  daySelected: { backgroundColor: colors.primaryButtonBg, borderColor: 'transparent' },
  dayNum: { fontFamily: fonts.medium, fontSize: 18, color: colors.textPrimary },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  disabled: { opacity: 0.35 },
  value: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '31.5%',
    minHeight: 48,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  slotSelected: { backgroundColor: colors.primaryButtonBg, borderColor: 'transparent' },
  slotOff: { backgroundColor: 'transparent', borderColor: colors.white05 },
  slotText: { fontFamily: fonts.mono, fontSize: 13, color: colors.textPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(34,62,53,0.06)',
    borderWidth: 1,
    borderColor: colors.white10,
  },
  chipOn: { backgroundColor: colors.accentMatchSoft, borderColor: colors.accentMatch },
  chipText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  summary: {
    gap: 12,
    padding: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.black20,
    borderWidth: 1,
    borderColor: colors.white05,
  },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  lineValue: { flex: 1, textAlign: 'right', fontFamily: fonts.regular, fontSize: 14, color: colors.textPrimary },
  rule: { height: 1, backgroundColor: colors.white08 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontFamily: fonts.mono, fontSize: 22, color: colors.accentMatch },
  success: { alignItems: 'center', gap: 20, paddingTop: 12 },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentMatch,
  },
  successCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 6,
    padding: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.black20,
    borderWidth: 1,
    borderColor: colors.white05,
  },
});
