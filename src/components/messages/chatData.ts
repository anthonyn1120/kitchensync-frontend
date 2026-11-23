import type { Booking, Conversation, Message } from '@/data/types';
import { bookings, getListing, hostListing, hostSchedule, renterRequests } from '@/data/mock';

export type Side = 'renter' | 'host';

// ───────────── Chat items (store messages + local-only extras) ─────────────

export type ChatItem =
  | { kind: 'msg'; id: string; from: 'me' | 'them'; text: string; time: string }
  | { kind: 'system'; id: string; text: string; tone: 'success' | 'info' }
  | {
      kind: 'attachment';
      id: string;
      from: 'me';
      attachment: 'photo' | 'document';
      name: string;
      size?: number;
      uri?: string;
      time: string;
    };

/** A local item, remembered with how many store messages existed when it was added (for ordering). */
type LocalItem = ChatItem & { afterCount: number };

// ───────────── Day separators ─────────────

// Mock "today" is Wed, Oct 7, 2026 — map the weekday-only timestamps in mock.ts to that week.
const WEEKDAY_LABELS: Record<string, string> = {
  Tue: 'Yesterday',
  Mon: 'Mon, Oct 5',
  Sun: 'Sun, Oct 4',
  Sat: 'Sat, Oct 3',
  Fri: 'Fri, Oct 2',
  Thu: 'Thu, Oct 1',
};

export function dayLabelFor(time: string) {
  if (time.includes(':')) return 'Today';
  return WEEKDAY_LABELS[time] ?? time;
}

export const nowTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export type ListRow =
  | { type: 'day'; key: string; label: string }
  | { type: 'item'; key: string; item: ChatItem; showTime: boolean; time?: string };

/** Store messages + local extras → flat list rows with day separators and per-group timestamps. */
export function buildRows(items: ChatItem[]): ListRow[] {
  const rows: ListRow[] = [];
  let lastDay = '';
  items.forEach((item, i) => {
    const time = 'time' in item ? item.time : undefined;
    const day = time ? dayLabelFor(time) : lastDay || 'Today';
    if (day !== lastDay) {
      rows.push({ type: 'day', key: `day-${day}-${i}`, label: day });
      lastDay = day;
    }
    const next = items[i + 1];
    const from = 'from' in item ? item.from : undefined;
    const nextFrom = next && 'from' in next ? next.from : undefined;
    // Timestamp under the last bubble of a same-sender run, for clock times only.
    const showTime = !!time && time.includes(':') && (from !== nextFrom || next?.kind === 'system');
    rows.push({ type: 'item', key: item.id, item, showTime, time });
  });
  return rows;
}

// ───────────── Session store for local chat extras ─────────────
// sendMessage in AppState only appends "me" messages, so simulated replies, system
// messages, attachments and booking confirmations live here (in memory, per session).

type Extras = { items: LocalItem[]; typing: boolean; confirmed: boolean };
const EMPTY: Extras = { items: [], typing: false, confirmed: false };

let extras: Record<string, Extras> = {};
const listeners = new Set<() => void>();

export const keyOf = (side: Side, id: string) => `${side}:${id}`;

export const chatStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  get(side: Side, id: string): Extras {
    return extras[keyOf(side, id)] ?? EMPTY;
  },
  getAll() {
    return extras;
  },
  patch(side: Side, id: string, fn: (e: Extras) => Partial<Extras>) {
    const k = keyOf(side, id);
    const cur = extras[k] ?? EMPTY;
    extras = { ...extras, [k]: { ...cur, ...fn(cur) } };
    listeners.forEach((l) => l());
  },
  add(side: Side, id: string, afterCount: number, item: ChatItem) {
    chatStore.patch(side, id, (e) => ({ items: [...e.items, { ...item, afterCount }] }));
  },
};

/** Interleave local extras with the store's messages (which are append-only). */
export function mergeItems(messages: Message[], local: LocalItem[]): ChatItem[] {
  const out: ChatItem[] = [];
  const at = (n: number) => local.filter((l) => l.afterCount === n).forEach((l) => out.push(l));
  at(0);
  messages.forEach((m, i) => {
    out.push({ kind: 'msg', ...m });
    at(i + 1);
  });
  // Anything recorded past the current count (shouldn't happen) still shows.
  local.filter((l) => l.afterCount > messages.length).forEach((l) => out.push(l));
  return out;
}

export function lastPreview(items: ChatItem[]) {
  const last = items[items.length - 1];
  if (!last) return { text: '', time: '' };
  if (last.kind === 'system') return { text: last.text, time: '' };
  if (last.kind === 'attachment')
    return { text: `You shared ${last.attachment === 'photo' ? 'a photo' : last.name}`, time: last.time };
  return { text: last.from === 'me' ? `You: ${last.text}` : last.text, time: last.time };
}

// ───────────── Simulated replies ─────────────

const REPLY_DELAY = 1500;

function cannedReply(side: Side, text: string): string {
  const t = text.toLowerCase();
  // On the renter side the other person is a host, and vice versa.
  if (side === 'renter') {
    if (t === 'confirmed') return "You're all set! The keypad code works from 5:30 AM. See you Tuesday.";
    if (/(price|rate|\$|cost|fee|deposit)/.test(t))
      return 'The $45/hr rate is all-in: equipment, cold storage and cleaning supplies. No extra fees.';
    if (/(time|when|hour|early|late|am\b|pm\b|morning|tuesday|thursday)/.test(t))
      return "Mornings are wide open. I'll be in from 5:30 so the space will be warm by the time you arrive.";
    if (/(oven|proofer|mixer|equipment|walk-in|fridge|sheeter|rack)/.test(t))
      return "All of that is available. I'll have the deck oven preheated and two walk-in shelves cleared for you.";
    if (/(park|load|dock|delivery|deliver)/.test(t))
      return 'Loading is through the side alley. There are 20-minute spots right by the door.';
    if (/(thank|thanks|great|perfect|awesome)/.test(t)) return 'Anytime! Looking forward to having you in.';
    if (/photo|shared|document|pdf/.test(t)) return 'Got it, thanks. I’ll take a look and get back to you today.';
    return "Sounds good. I'll make sure everything's set up for you.";
  }
  if (/(price|rate|\$|cost|fee)/.test(t)) return 'That works with our budget. Thanks for being upfront about it.';
  if (/(time|when|hour|early|late|am\b|pm\b|morning)/.test(t))
    return "That timing works. We'll be in and cleaned down before the end of the slot.";
  if (/(starter|banneton|bring|equipment|oven|rack)/.test(t))
    return "We'll bring our own tools and ingredients. Just need the oven and rack space.";
  if (/(confirm|approved|booked|code)/.test(t)) return 'Amazing, thank you! See you then.';
  if (/(thank|thanks|great|perfect)/.test(t)) return 'Thank you! Really appreciate the flexibility.';
  if (/photo|shared|document|pdf/.test(t)) return 'Thanks for sending that over!';
  return "Great, thanks! We'll plan around that.";
}

const timers: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Show the "typing…" bubble, then append a contextual reply ~1.5s later.
 * `getCount` reads the conversation's current store-message count at reply time.
 */
export function simulateReply(side: Side, id: string, prompt: string, getCount: () => number) {
  const k = keyOf(side, id);
  clearTimeout(timers[k]);
  // Small pause before "typing" appears, like a real person reading.
  timers[k] = setTimeout(() => {
    chatStore.patch(side, id, () => ({ typing: true }));
    timers[k] = setTimeout(() => {
      chatStore.patch(side, id, () => ({ typing: false }));
      chatStore.add(side, id, getCount(), {
        kind: 'msg',
        id: `r${Date.now()}`,
        from: 'them',
        text: cannedReply(side, prompt),
        time: nowTime(),
      });
    }, REPLY_DELAY);
  }, 500);
}

// ───────────── Booking terms + shared calendar ─────────────

export const HOUSE_RULES = [
  'Clean down by end time',
  'Label all items in walk-in',
  'Bring your own smallwares and ingredients',
  'No open flames outside the oven line',
];
export const CANCELLATION_POLICY = 'Free cancellation up to 48 hours before start. 50% charge after that; no-shows are charged in full.';

/** "6:00 AM — 12:00 PM" → 6 */
export function hoursBetween(range: string) {
  const parts = range.split(/[—–-]/).map((s) => s.trim());
  if (parts.length < 2) return 0;
  const toH = (s: string) => {
    const m = s.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return 0;
    let h = Number(m[1]) % 12;
    if (m[3].toUpperCase() === 'PM') h += 12;
    return h + Number(m[2]) / 60;
  };
  let diff = toH(parts[1]) - toH(parts[0]);
  if (diff <= 0) diff += 24;
  return diff;
}

export type BookingTerms = {
  facility: string;
  counterpartLabel: string;
  counterpart: string;
  date: string;
  time: string;
  stations: string[];
  rate: number;
  hours: number;
  total: number;
  accessCode: string;
};

export function getTerms(side: Side, conv: Conversation): BookingTerms | null {
  const d = conv.draftBooking;
  if (!d) return null;
  const listing = getListing(side === 'renter' ? conv.listingId ?? '' : hostListing.id);
  const rate = listing?.ratePerHour ?? 45;
  const hours = hoursBetween(d.time);
  const existing = bookings.find((b) => b.listingId === conv.listingId && b.date === d.date);
  const code = existing?.accessCode ?? `BK-${(8800 + conv.id.length * 7 + conv.withName.length).toString()}`;
  return {
    facility: side === 'renter' ? conv.withName : hostListing.name,
    counterpartLabel: side === 'renter' ? 'Host' : 'Renter',
    counterpart: side === 'renter' ? listing?.hostName ?? conv.withName : conv.withName,
    date: d.date,
    time: d.time,
    stations: d.equipment,
    rate,
    hours,
    total: rate * hours,
    accessCode: conv.id === 'c-bbc' ? 'BK-8821' : code,
  };
}

export type Session = { id: string; date: string; time: string; title: string; status: string };

/** Upcoming sessions with this partner, assembled from the mock bookings/requests/schedule. */
export function getSessions(side: Side, conv: Conversation, confirmed: boolean, allBookings: Booking[] = bookings): Session[] {
  const out: Session[] = [];
  if (conv.draftBooking) {
    out.push({
      id: 'draft',
      date: conv.draftBooking.date,
      time: conv.draftBooking.time,
      title: conv.draftBooking.equipment.join(', '),
      status: confirmed ? 'Confirmed' : conv.draftBooking.label,
    });
  }
  if (side === 'renter') {
    allBookings
      .filter((b) => b.listingId === conv.listingId && (b.status === 'confirmed' || b.status === 'pending'))
      .filter((b) => !(conv.draftBooking && b.date === conv.draftBooking.date))
      .forEach((b) => out.push({ id: b.id, date: b.date, time: b.time, title: b.stations, status: b.status }));
  } else {
    hostSchedule
      .filter((s) => s.title === conv.withName)
      .forEach((s) => out.push({ id: s.id, date: 'Wed, Oct 7', time: s.time, title: 'Scheduled session', status: s.status }));
    renterRequests
      .filter((r) => r.brandName === conv.withName && !(conv.draftBooking && r.date.startsWith(conv.draftBooking.date.slice(0, 3))))
      .forEach((r) => out.push({ id: r.id, date: r.date, time: r.time, title: r.tags.join(', '), status: 'Requested' }));
  }
  if (conv.id === 'c-commissary') out.push({ id: 'tour', date: 'Friday, Oct 9', time: '2:00 PM — 2:30 PM', title: 'Facility walkthrough', status: 'Tour' });
  return out;
}

export const PROPOSED_SLOTS = [
  { date: 'Thu, Oct 15', time: '6:00 AM — 12:00 PM' },
  { date: 'Tue, Oct 20', time: '6:00 AM — 12:00 PM' },
  { date: 'Sat, Oct 24', time: '2:00 PM — 8:00 PM' },
];
