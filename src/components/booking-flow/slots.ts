import type { Booking, Listing, Weekday } from '@/data/types';
import { listingHasEquipment } from '@/data/matching';

// Slot math for the booking sheet. "Today" in the mock data is Wed, Oct 7, 2026;
// the strip offers the 14 days after it.

const TODAY = new Date(2026, 9, 7);
const WEEKDAYS: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LONG_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type Day = {
  key: string;
  date: Date;
  weekday: Weekday;
  dayOfMonth: number;
  month: string;
  open: boolean;
  /** Same style as the mock bookings, e.g. "Tuesday, Oct 13" (parsed by bookings/dates.ts) */
  label: string;
};

export function nextDays(listing: Listing, count = 14): Day[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + i + 1);
    const weekday = WEEKDAYS[date.getDay()];
    return {
      key: date.toDateString(),
      date,
      weekday,
      dayOfMonth: date.getDate(),
      month: MONTHS[date.getMonth()],
      open: listing.availableDays.includes(weekday),
      label: `${LONG_DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`,
    };
  });
}

/** Index of `initialDay`'s next open occurrence, else the first open day (or 0). */
export function defaultDayIndex(days: Day[], initialDay?: Weekday) {
  const preferred = initialDay ? days.findIndex((d) => d.open && d.weekday === initialDay) : -1;
  if (preferred >= 0) return preferred;
  return Math.max(0, days.findIndex((d) => d.open));
}

export type Window = {
  /** Opening hour (may be fractional, e.g. 5.5) */
  open: number;
  /** Closing hour; > 24 when the kitchen runs overnight */
  close: number;
  /** "All day" / "24 hours": sessions may run past midnight */
  roundTheClock: boolean;
};

function toHour(s: string): number | null {
  const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h + (m[2] ? Number(m[2]) / 60 : 0);
}

/** "5:30 AM – 2:00 PM", "11:00 PM – 9:00 AM", "All day", "24 hours" */
export function parseHours(hours: string): Window {
  const t = hours.toLowerCase();
  if (t.includes('all day') || t.includes('24 h')) return { open: 0, close: 24, roundTheClock: true };
  const [a, b] = hours.split(/[–—-]/).map((s) => toHour(s.trim()));
  if (a == null || b == null) return { open: 6, close: 22, roundTheClock: false };
  return { open: a, close: b <= a ? b + 24 : b, roundTheClock: false };
}

/** Start hours on the hour within the window (values ≥ 24 mean after midnight). */
export function startHours(w: Window): number[] {
  const out: number[] = [];
  for (let h = Math.ceil(w.open); h < w.close; h++) out.push(h);
  return out;
}

/** Longest session that fits in the window. */
export function maxHours(w: Window) {
  if (w.roundTheClock) return 12;
  return Math.floor(w.close - Math.ceil(w.open));
}

export function formatHour(h: number) {
  const hh = ((Math.round(h * 60) / 60) % 24 + 24) % 24;
  const whole = Math.floor(hh);
  const min = Math.round((hh - whole) * 60);
  const suffix = whole >= 12 ? 'PM' : 'AM';
  const h12 = whole % 12 === 0 ? 12 : whole % 12;
  return `${h12}:${String(min).padStart(2, '0')} ${suffix}`;
}

/** "6:00 AM — 12:00 PM", matching the mock bookings. */
export function rangeLabel(start: number, hours: number) {
  return `${formatHour(start)} — ${formatHour(start + hours)}`;
}

export type SlotState = 'open' | 'booked' | 'yours' | 'closing';

function seedFor(listingId: string, day: Day) {
  let n = day.dayOfMonth * 31 + day.date.getMonth() * 7;
  for (const ch of listingId) n = (n * 33 + ch.charCodeAt(0)) % 9973;
  return n;
}

/** One or two start times taken by other renters on some days; stable per listing + date. */
export function bookedStarts(listingId: string, day: Day, starts: number[]): number[] {
  if (!day.open || starts.length === 0) return [];
  const seed = seedFor(listingId, day);
  if (seed % 3 === 0) return [];
  const pool = starts.slice(0, Math.min(starts.length, 4));
  const first = pool[seed % pool.length];
  const out = [first];
  if (seed % 2 === 0 && pool.length > 1) out.push(pool[(seed + 1 + (seed >> 3)) % pool.length]);
  return [...new Set(out)];
}

function bookingRange(b: Booking): [number, number] | null {
  const [a, z] = b.time.split(/[–—]/).map((s) => toHour(s.trim()));
  if (a == null || z == null) return null;
  return [a, z <= a ? z + 24 : z];
}

/** Availability of each start hour for a day and duration. */
export function slotStates(
  listing: Listing,
  day: Day,
  hours: number,
  mine: Booking[],
): { start: number; state: SlotState }[] {
  const w = parseHours(listing.hours);
  const starts = startHours(w);
  const taken = new Set(bookedStarts(listing.id, day, starts));
  const own = mine
    .filter((b) => b.listingId === listing.id && b.date === day.label && (b.status === 'pending' || b.status === 'confirmed'))
    .map(bookingRange)
    .filter((r): r is [number, number] => !!r);
  return starts.map((start) => {
    const end = start + hours;
    if (own.some(([a, z]) => start < z && end > a)) return { start, state: 'yours' };
    if (taken.has(start)) return { start, state: 'booked' };
    if (!w.roundTheClock && end > w.close) return { start, state: 'closing' };
    return { start, state: 'open' };
  });
}

/** Equipment + capabilities the renter can reserve (allergen policies aren't stations). */
export function stationOptions(listing: Listing): string[] {
  const policies = listing.allergenPolicies.map((p) => p.toLowerCase());
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of [...listing.equipment.filter((e) => e.available).map((e) => e.name), ...listing.capabilities]) {
    const k = name.toLowerCase();
    if (seen.has(k) || policies.includes(k)) continue;
    // Skip a capability that duplicates a longer equipment name ("Deck Oven" vs "Deck Oven (3-deck)").
    if (out.some((o) => o.toLowerCase().startsWith(k))) continue;
    seen.add(k);
    out.push(name);
  }
  return out;
}

/** Options that match the renter's equipment preferences. */
export function preselectedStations(listing: Listing, options: string[], prefs: string[]): string[] {
  return options.filter((opt) =>
    prefs.some((p) => listingHasEquipment({ ...listing, equipment: [{ name: opt, available: true }], capabilities: [] }, p)),
  );
}
