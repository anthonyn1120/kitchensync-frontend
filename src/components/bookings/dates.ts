// "Today" in the mock data is Wed, Oct 7, 2026.
const TODAY = new Date(2026, 9, 7);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parses mock date labels like "Tuesday, Oct 13" or "Sep 29, 2026". */
export function parseBookingDate(label: string): Date | null {
  const m = label.match(/([A-Z][a-z]{2})[a-z]*\s+(\d{1,2})(?:,\s*(\d{4}))?/g);
  if (!m) return null;
  for (const part of m) {
    const [, mon, day, year] = part.match(/([A-Z][a-z]{2})[a-z]*\s+(\d{1,2})(?:,\s*(\d{4}))?/) ?? [];
    const month = MONTHS.indexOf(mon);
    if (month >= 0) return new Date(year ? Number(year) : 2026, month, Number(day));
  }
  return null;
}

/** "Today", "Tomorrow", "in 6 days" */
export function countdownLabel(label: string): string | null {
  const d = parseBookingDate(label);
  if (!d) return null;
  const days = Math.round((d.getTime() - TODAY.getTime()) / 86_400_000);
  if (days < 0) return null;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `in ${days} days`;
}

/** { md: "Sep 29", year: "2026" } for the past-session date column */
export function splitDate(label: string) {
  const d = parseBookingDate(label);
  if (!d) return { md: label, year: '' };
  return { md: `${MONTHS[d.getMonth()]} ${d.getDate()}`, year: String(d.getFullYear()) };
}

/** Today or later (undated labels count as upcoming). */
export function isUpcoming(label: string): boolean {
  const d = parseBookingDate(label);
  return !d || d.getTime() >= TODAY.getTime();
}

/** "6:00 AM — 12:00 PM" → minutes after midnight of the start time. */
function startMinutes(time: string): number {
  const m = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 0;
  const h = (Number(m[1]) % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0);
  return h * 60 + Number(m[2]);
}

/** Sort key for a booking's date + start time. */
export function sortTime(label: string, time = ''): number {
  const d = parseBookingDate(label);
  return (d ? d.getTime() : Number.MAX_SAFE_INTEGER / 2) + startMinutes(time) * 60_000;
}
