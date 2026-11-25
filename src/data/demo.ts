// Data for the class-pitch demo.
//
// What is real: the photos (NVC Memorial Hall's commissary kitchen in Seattle, and Wanola Granola's logo and product)
// and the permit classification read off the permit posted in that kitchen.
// What is sample data: every price, minimum booking, opening hour, add-on and "requirement". No kitchen
// here is a confirmed partner, which is why every listing carries a "Sample listing" label.

import type { Weekday } from './types';

export const photos = {
  nvcKitchen: require('../../assets/photos/nvc-kitchen.jpg'),
  nvcFridges: require('../../assets/photos/nvc-fridges.jpg'),
  nvcStorage: require('../../assets/photos/nvc-storage.jpg'),
  nvcPermit: require('../../assets/photos/nvc-permit.jpg'),
  wanolaLogo: require('../../assets/photos/wanola-logo.jpg'),
  wanolaBag: require('../../assets/photos/wanola-bag.jpg'),
} as const;

export type Photo = (typeof photos)[keyof typeof photos];

/** The demo renter: Minako Aoki's Wanola Granola (YOKA Foods), Sammamish, WA. */
export const persona = {
  name: 'Wanola Granola',
  short: 'Wanola',
  blurb: 'Japanese-inspired granola · Sammamish, WA',
  story: 'Minako bakes in her home oven and sells about 500 bags at $16 each. She wants to ship and sell to stores and cafés.',
  zip: '98074',
  city: 'Sammamish, WA',
};

export type TimeWindow = 'Morning' | 'Afternoon' | 'Evening';

export const timeWindows: { value: TimeWindow; label: string; range: string; starts: string[] }[] = [
  { value: 'Morning', label: 'Morning', range: '6 AM – 12 PM', starts: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM'] },
  { value: 'Afternoon', label: 'Afternoon', range: '12 – 5 PM', starts: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'] },
  { value: 'Evening', label: 'Evening', range: '5 – 10 PM', starts: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'] },
];

export const hourChoices = [2, 4, 8] as const;

/** Equipment a renter can ask for (kept short on purpose). */
export const equipmentChoices = ['Convection oven', 'Dry storage', 'Packaging / sealing', 'Commercial mixer', 'Prep tables'] as const;
export type Equipment = (typeof equipmentChoices)[number];

/** What the renter is searching for. */
export type Needs = {
  hours: number; // hours needed per visit
  coldStorage: boolean;
  equipment: Equipment[];
  day: Weekday;
  window: TimeWindow;
  /** Most they'll pay per hour. */
  budget: number;
  /** Booking rules: only kitchens that rent by the hour / without a monthly contract. */
  byHour: boolean;
  noContract: boolean;
};

export const defaultNeeds: Needs = {
  hours: 4,
  coldStorage: false,
  equipment: ['Convection oven', 'Dry storage'],
  day: 'Tue',
  window: 'Morning',
  budget: 50,
  byHour: true,
  noContract: true,
};

export type DemoListing = {
  id: string;
  name: string;
  kind: string;
  area: string;
  address?: string;
  /** Rough driving distance from Sammamish (98074). */
  miles: number;
  /** Example rate (sample data). */
  rate: number;
  minHours: number;
  /** Flat example cleaning fee per session (sample data). */
  cleaningFee: number;
  /** True when the kitchen only rents on a monthly contract. */
  contract: boolean;
  /** Opening window shown on the availability strip (sample data). */
  openHours: string;
  certifications: string[];
  coldStorage: boolean;
  /** Example add-on price per booking (sample data); only when coldStorage. */
  coldStoragePrice: number;
  coldStorageNote: string;
  equipment: Equipment[];
  days: Weekday[];
  windows: TimeWindow[];
  photos: { src: Photo; caption: string }[];
  about: string;
  /** Shown on the license badge. Only set where we have actually seen the permit. */
  license?: { title: string; authority: string; detail: string; seen: string };
  /** What the kitchen asks of renters (sample data). */
  requirements: string[];
};

export const demoListings: DemoListing[] = [
  {
    id: 'nvc',
    name: 'NVC Memorial Hall Kitchen',
    kind: 'Commissary kitchen',
    area: 'Seattle',
    address: '1212 S King St, Seattle',
    miles: 20,
    rate: 40,
    minHours: 1,
    cleaningFee: 15,
    contract: false,
    openHours: '6:00 AM – 10:00 PM',
    certifications: ['King County commissary kitchen permit'],
    coldStorage: true,
    coldStoragePrice: 10,
    coldStorageNote: 'One reach-in fridge shelf, held overnight',
    equipment: ['Convection oven', 'Dry storage', 'Prep tables'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    windows: ['Morning', 'Afternoon', 'Evening'],
    photos: [
      { src: photos.nvcKitchen, caption: 'Prep line and hood' },
      { src: photos.nvcFridges, caption: 'Reach-in fridges' },
      { src: photos.nvcStorage, caption: 'Dry and cold storage' },
      { src: photos.nvcPermit, caption: 'Posted permit' },
    ],
    about:
      'A community hall’s licensed commissary kitchen with a long stainless prep line, a hood line, reach-in fridges and a storage aisle.',
    license: {
      title: 'King County commissary kitchen permit',
      authority: 'Public Health – Seattle & King County',
      detail: 'Classification: Commissary Kitchen – Risk 1 · valid through Mar 31, 2027',
      seen: 'We photographed the permit posted in the kitchen.',
    },
    requirements: [
      'Walk-through tour before your first booking',
      'Food worker card for everyone on your crew',
      'Proof of liability insurance',
      'Label and date everything left in the fridge',
      'Clean down and sign out at the end of each slot',
    ],
  },
  {
    id: 'eastside',
    name: 'Eastside shared kitchen',
    kind: 'Shared commercial kitchen',
    area: 'Issaquah',
    miles: 5,
    rate: 55,
    minHours: 2,
    cleaningFee: 20,
    contract: false,
    openHours: '5:00 AM – 11:00 AM',
    certifications: ['Health permit (sample)'],
    coldStorage: true,
    coldStoragePrice: 12,
    coldStorageNote: 'Half a walk-in rack',
    equipment: ['Convection oven', 'Dry storage', 'Commercial mixer', 'Prep tables'],
    days: ['Mon', 'Tue', 'Thu', 'Fri'],
    windows: ['Morning'],
    photos: [],
    about: 'A made-up example of a shared kitchen with short slots and cold storage.',
    requirements: ['Tour before your first booking', 'Food worker cards', 'Proof of liability insurance'],
  },
  {
    id: 'bakery',
    name: 'Bakery, idle afternoons',
    kind: 'Bakery',
    area: 'Redmond',
    miles: 7,
    rate: 35,
    minHours: 4,
    cleaningFee: 15,
    contract: false,
    openHours: '1:00 – 6:00 PM',
    certifications: ['Health permit (sample)'],
    coldStorage: false,
    coldStoragePrice: 0,
    coldStorageNote: '',
    equipment: ['Commercial mixer', 'Prep tables'],
    days: ['Wed', 'Thu', 'Fri'],
    windows: ['Afternoon'],
    photos: [],
    about: 'A made-up example of a bakery that rents its afternoons in half-day blocks.',
    requirements: ['Tour before your first booking', 'Food worker cards'],
  },
  {
    id: 'fullday',
    name: 'Production kitchen, full days',
    kind: 'Production kitchen',
    area: 'Kent',
    miles: 24,
    rate: 30,
    minHours: 8,
    cleaningFee: 40,
    contract: true,
    openHours: '6:00 AM – 6:00 PM',
    certifications: ['Health permit (sample)', 'HACCP plan (sample)'],
    coldStorage: true,
    coldStoragePrice: 15,
    coldStorageNote: 'Walk-in pallet space',
    equipment: ['Convection oven', 'Dry storage', 'Packaging / sealing', 'Commercial mixer', 'Prep tables'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    windows: ['Morning', 'Afternoon'],
    photos: [],
    about: 'A made-up example of the kind of kitchen that only rents by the full day.',
    requirements: ['Tour before your first booking', 'Food worker cards', 'Proof of liability insurance'],
  },
];

export const getDemoListing = (id: string | undefined) => demoListings.find((l) => l.id === id);

export const minLabel = (h: number) => `${h}-hr minimum`;

export type FitLine = { ok: boolean; label: string; detail: string; /** short chip text when it doesn't fit */ warn?: string; weight: number };

/** The compatibility check: one line per thing the renter asked for. */
export function fitCheck(l: DemoListing, n: Needs): FitLine[] {
  const lines: FitLine[] = [];
  const missing = n.equipment.filter((e) => !l.equipment.includes(e));
  if (n.equipment.length > 0) {
    lines.push(
      missing.length === 0
        ? { ok: true, label: 'Equipment', detail: n.equipment.join(', '), weight: 0 }
        : { ok: false, label: 'Equipment', detail: `No ${missing.join(', ').toLowerCase()}`, warn: `No ${missing[0].toLowerCase()}`, weight: 12 * missing.length },
    );
  }
  if (n.coldStorage) {
    lines.push(
      l.coldStorage
        ? { ok: true, label: 'Cold storage', detail: l.coldStorageNote, weight: 0 }
        : { ok: false, label: 'Cold storage', detail: 'No fridge space for renters', warn: 'No cold storage', weight: 20 },
    );
  }
  lines.push(
    l.minHours <= n.hours
      ? { ok: true, label: `${n.hours}-hr slots`, detail: `${minLabel(l.minHours)}, booked by the hour`, weight: 0 }
      : { ok: false, label: `${n.hours}-hr slots`, detail: `${minLabel(l.minHours)}. You need ${n.hours}`, warn: minLabel(l.minHours), weight: 25 },
  );
  if (n.byHour && l.minHours >= 8) {
    lines.push({ ok: false, label: 'Book by the hour', detail: 'Full days only', warn: 'Full days only', weight: 6 });
  }
  if (n.noContract) {
    lines.push(
      l.contract
        ? { ok: false, label: 'No monthly contract', detail: 'Rents on a monthly contract only', warn: 'Monthly contract', weight: 12 }
        : { ok: true, label: 'No monthly contract', detail: 'No lease, no deposit', weight: 0 },
    );
  }
  const dayOk = l.days.includes(n.day);
  const windowOk = l.windows.includes(n.window);
  const when = `${n.day} ${n.window.toLowerCase()}`;
  lines.push(
    dayOk && windowOk
      ? { ok: true, label: `Open ${when}`, detail: l.openHours, weight: 0 }
      : { ok: false, label: `Open ${when}`, detail: dayOk ? `Not open ${n.window.toLowerCase()}s` : `Closed to renters on ${n.day}`, warn: dayOk ? `Not open ${n.window.toLowerCase()}s` : `Not open ${n.day}`, weight: 15 },
  );
  lines.push(
    l.rate <= n.budget
      ? { ok: true, label: `$${l.rate}/hr in budget`, detail: `Your max is $${n.budget}/hr`, weight: 0 }
      : { ok: false, label: `$${l.rate}/hr`, detail: `Over your $${n.budget}/hr budget`, warn: 'Over your budget', weight: 12 },
  );
  return lines;
}

/** Honest fit score: 100, minus a penalty for each thing that doesn't fit, minus a little for distance. */
export function fitScore(l: DemoListing, lines: FitLine[]): number {
  const penalty = lines.reduce((sum, x) => sum + (x.ok ? 0 : x.weight), 0);
  return Math.max(5, Math.round(100 - penalty - Math.max(0, l.miles - 2) * 0.3));
}

export type Result = { listing: DemoListing; lines: FitLine[]; score: number; fits: boolean; warnings: string[] };

/** Search: every kitchen with its fit score and warnings, best fit first. */
export function search(n: Needs): Result[] {
  return demoListings
    .map((l) => {
      const lines = fitCheck(l, n);
      return { listing: l, lines, score: fitScore(l, lines), fits: lines.every((x) => x.ok), warnings: lines.filter((x) => !x.ok).map((x) => x.warn ?? x.detail) };
    })
    .sort((a, b) => b.score - a.score);
}

/** What one session costs: hours × rate + cleaning fee (+ cold storage). */
export function sessionCost(l: DemoListing, hours: number, cold: boolean) {
  const kitchen = hours * l.rate;
  const coldCost = cold && l.coldStorage ? l.coldStoragePrice : 0;
  return { kitchen, cleaning: l.cleaningFee, cold: coldCost, total: kitchen + l.cleaningFee + coldCost };
}

const WEEKDAY_INDEX: Record<Weekday, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Next calendar date that falls on this weekday (never today), e.g. "Tue, Dec 1". */
export function nextDate(day: Weekday, from = new Date()): string {
  const d = new Date(from);
  const ahead = (WEEKDAY_INDEX[day] - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + ahead);
  return `${day}, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

/** "8:00 AM" + 2 → "8:00 – 10:00 AM" */
export function slotLabel(start: string, hours: number): string {
  const m = start.match(/^(\d+):(\d+) (AM|PM)$/);
  if (!m) return start;
  let h = (Number(m[1]) % 12) + (m[3] === 'PM' ? 12 : 0);
  const fmt = (x: number) => `${((x + 11) % 12) + 1}:${m[2]}`;
  const ap = (x: number) => (x % 24 >= 12 ? 'PM' : 'AM');
  const end = h + hours;
  return ap(h) === ap(end) ? `${fmt(h)} – ${fmt(end)} ${ap(end)}` : `${fmt(h)} ${ap(h)} – ${fmt(end)} ${ap(end)}`;
}

export type DemoRequest = {
  id: string;
  listingId: string;
  mode: 'book' | 'tour';
  date: string;
  time: string;
  hours: number;
  coldStorage: boolean;
  total: number;
};

// ───────────────────────── "Get ready" permit guidance ─────────────────────────

export type ReadyItem = { id: string; title: string; detail: string; who: string };

/**
 * What a renter typically needs before cooking in someone else's licensed kitchen in King County.
 * Guidance only: written from our conversations with Public Health – Seattle & King County and WSDA,
 * and worded as "typically" because the exact answer depends on the food and how it is sold.
 */
export const readyItems: ReadyItem[] = [
  {
    id: 'cards',
    title: 'Food worker cards',
    detail: 'Everyone who handles food needs a Washington food worker card.',
    who: 'WA Dept. of Health',
  },
  {
    id: 'permit',
    title: 'Your own food business permit',
    detail: 'The kitchen’s permit covers the kitchen. Your business usually needs its own permit that names the kitchen you work from.',
    who: 'Public Health – Seattle & King County',
  },
  {
    id: 'agreement',
    title: 'Signed kitchen-use agreement',
    detail: 'A commissary agreement signed by you and the kitchen, sent in with your permit application.',
    who: 'You + the kitchen',
  },
  {
    id: 'insurance',
    title: 'Liability insurance',
    detail: 'Most kitchens ask to be listed on your policy before the first booking.',
    who: 'Kitchen’s house rule',
  },
  {
    id: 'wsda',
    title: 'Selling wholesale? WSDA license',
    detail: 'Packaged food sold to stores or distributors typically needs a WSDA Food Processor License instead.',
    who: 'WA State Dept. of Agriculture',
  },
];

/** What Tres already has (an operating, permitted shop). */
export const defaultReady = ['cards', 'insurance'];

// ───────────────────────── Permit path (WSDA guidance) ─────────────────────────
// Guidance, not legal advice. Figures as checked against WSDA's Cottage Food and Food Processing Plant
// License pages in Nov 2026.

export const productChoices = ['Granola', 'Baked goods', 'Snacks', 'Catering', 'Beverages', 'Meal prep', 'Sauces', 'Frozen & dairy', 'Something else'] as const;

export type MakeNow = 'nowhere' | 'home' | 'licensed';
export const makeNowChoices: { value: MakeNow; title: string; sub: string }[] = [
  { value: 'nowhere', title: 'Nowhere yet', sub: 'I don’t have a permit' },
  { value: 'home', title: 'My home kitchen', sub: 'I have a cottage food permit' },
  { value: 'licensed', title: 'A licensed commercial kitchen', sub: 'I rent or own one' },
];
export const sellNowChoices = ['Markets & pop-ups', 'Pre-orders, handed off in person', 'Events & catering'] as const;
export const wantSellChoices = ['In person', 'Ship to customers (online)', 'Wholesale: stores, cafés, online'] as const;

export type PermitAnswers = { products: string[]; makeNow: MakeNow; sellNow: string[]; wantSell: string[] };

/** Wanola today: home kitchen on a cottage food permit, wanting to ship and sell wholesale. */
export const defaultPermit: PermitAnswers = {
  products: ['Granola', 'Baked goods'],
  makeNow: 'home',
  sellNow: ['Markets & pop-ups', 'Pre-orders, handed off in person'],
  wantSell: ['In person', 'Ship to customers (online)', 'Wholesale: stores, cafés, online'],
};

export const needsProcessorLicense = (a: PermitAnswers) => a.wantSell.some((w) => w !== 'In person');

export const permitOptions = {
  cottage: {
    title: 'Cottage Food Permit',
    sub: 'WSDA · made in your home kitchen',
    lines: [
      { ok: true, text: 'Sell directly to customers: markets, events, pre-orders' },
      { ok: true, text: 'Take orders online, but hand off in person in WA' },
      { ok: false, text: 'No shipping or mail order' },
      { ok: false, text: 'No wholesale or consignment (stores, cafés, resellers)' },
    ],
    money: 'Up to $35,000 in sales a year',
  },
  processor: {
    title: 'Food Processor License',
    sub: 'WSDA · made in a licensed kitchen',
    lines: [
      { ok: true, text: 'Still sell in person: markets, events, pre-orders' },
      { ok: true, text: 'Ship directly to customers' },
      { ok: true, text: 'Sell wholesale: grocery stores, cafés, online wholesale' },
      { ok: true, text: 'No yearly sales cap' },
    ],
    money: 'Yearly fee of $92 to $862, based on your sales',
  },
  source: 'Checked against WSDA Cottage Food and Food Processing Plant License pages · Nov 2026',
};

export const applicationSteps = [
  { title: 'Kitchen address and floor plan', detail: 'We fill this part in from the kitchen’s listing', prefilled: true },
  { title: 'Ingredients and how you make it', detail: 'Your recipe steps and sanitation schedule', prefilled: false },
  { title: 'Label information', detail: 'WSDA reviews your packaging and labels', prefilled: false },
  { title: 'Water test results', detail: 'Required before your inspection. We tell you if the kitchen already has them', prefilled: false },
  { title: 'Inspection', detail: 'A WSDA specialist checks the kitchen and your labels. Your passing report works as your license until it arrives', prefilled: false },
];

export const tourChecklist = [
  'Convection oven size and how many pans fit',
  'Dry storage space for your oats and packaging',
  'Which hours are really open each week',
  'Parking, loading and cleanup rules',
  'Do they already have water test results?',
];

export const pathSteps = [
  { title: 'Tour the kitchen', detail: 'See it in person first. Tours are free.' },
  { title: 'Commit to a kitchen', detail: 'Book your regular hours. No contract.' },
  { title: 'Send your license application', detail: 'Kitchen section already filled in for you' },
  { title: 'Water test, inspection and label review', detail: 'We give you WSDA’s checklist ahead of time' },
  { title: 'Start selling everywhere', detail: 'In person, shipped to customers, and wholesale to stores and cafés' },
];
