import type { Booking, RenterRequest, Weekday } from '@/data/types';

/**
 * Small deterministic "open slots" model for the host hero.
 *
 * Window: the 7 days after today (demo "today" is Wed Oct 7, 2026).
 * For each day the host is open, take the open hours, subtract booked time
 * (confirmed/pending bookings on this listing and approved renter requests), then
 * cut what's left into blocks of up to 4 hours. Gaps shorter than 2 hours are
 * not worth listing, and a short tail is merged into the previous block.
 */

export type OpenSlot = { id: string; dayLabel: string; timeLabel: string; hours: number };

const TODAY = new Date(2026, 9, 7);
const WINDOW_DAYS = 7;
const BLOCK = 4;
const MIN_BLOCK = 2;

const WEEKDAYS: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Range = [number, number]; // hours from midnight, end may exceed 24

/** "5:30 AM – 2:00 PM" (any dash) -> [5.5, 14]. Overnight ranges roll past 24. */
export function parseRange(text: string): Range | null {
  const times = [...text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi)].map((m) => {
    const h = Number(m[1]) % 12;
    return h + (m[3].toUpperCase() === 'PM' ? 12 : 0) + Number(m[2] ?? 0) / 60;
  });
  if (times.length < 2) return null;
  const [start, end] = times;
  return [start, end <= start ? end + 24 : end];
}

/** "Tue, Oct 13" / "Tuesday, Oct 13" / "Sep 22, 2026" -> "9-13" style key (month index-day). */
function dateKey(text: string): string | null {
  const m = text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2})/);
  return m ? `${MONTHS.indexOf(m[1])}-${Number(m[2])}` : null;
}

function fmtTime(h: number) {
  const hh = Math.floor(h) % 24;
  const mm = Math.round((h - Math.floor(h)) * 60);
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return { text: mm ? `${h12}:${String(mm).padStart(2, '0')}` : `${h12}`, pm: hh >= 12 };
}

/** [9.5, 14] -> "9:30 AM–2 PM"; [5.5, 9.5] -> "5:30–9:30 AM". */
export function formatRange([s, e]: Range) {
  const a = fmtTime(s);
  const b = fmtTime(e);
  const suffix = (pm: boolean) => (pm ? 'PM' : 'AM');
  return a.pm === b.pm ? `${a.text}–${b.text} ${suffix(b.pm)}` : `${a.text} ${suffix(a.pm)}–${b.text} ${suffix(b.pm)}`;
}

function subtract(free: Range[], busy: Range): Range[] {
  return free.flatMap(([s, e]) => {
    if (busy[1] <= s || busy[0] >= e) return [[s, e] as Range];
    const out: Range[] = [];
    if (busy[0] > s) out.push([s, busy[0]]);
    if (busy[1] < e) out.push([busy[1], e]);
    return out;
  });
}

function chunk([s, e]: Range): Range[] {
  const out: Range[] = [];
  let at = s;
  while (e - at >= MIN_BLOCK) {
    const left = e - at;
    const len = left - BLOCK < MIN_BLOCK ? left : BLOCK;
    out.push([at, at + len]);
    at += len;
  }
  return out;
}

export function computeOpenSlots({
  days,
  hours,
  bookings,
  requests,
  listingId,
}: {
  days: Weekday[];
  hours: string;
  bookings: Booking[];
  requests: RenterRequest[];
  listingId: string;
}): OpenSlot[] {
  const open = parseRange(hours);
  if (!open) return [];

  const busy: { key: string | null; range: Range | null }[] = [
    ...bookings
      .filter((b) => b.listingId === listingId && (b.status === 'confirmed' || b.status === 'pending'))
      .map((b) => ({ key: dateKey(b.date), range: parseRange(b.time) })),
    ...requests
      .filter((r) => r.status === 'approved')
      .map((r) => ({ key: dateKey(r.date), range: parseRange(r.time) })),
  ];

  const slots: OpenSlot[] = [];
  for (let i = 1; i <= WINDOW_DAYS; i++) {
    const d = new Date(TODAY);
    d.setDate(TODAY.getDate() + i);
    const weekday = WEEKDAYS[d.getDay()];
    if (!days.includes(weekday)) continue;
    const key = `${d.getMonth()}-${d.getDate()}`;
    let free: Range[] = [open];
    for (const b of busy) if (b.key === key && b.range) free = subtract(free, b.range);
    const dayLabel = `${weekday} ${MONTHS[d.getMonth()]} ${d.getDate()}`;
    for (const r of free.flatMap(chunk)) {
      slots.push({ id: `${key}-${r[0]}`, dayLabel, timeLabel: formatRange(r), hours: r[1] - r[0] });
    }
  }
  return slots;
}
