import type { Listing, Weekday } from './types';
import type { RenterPreferences } from '@/store/AppState';

// Explains a listing's fit score against the renter's preferences, and
// estimates what a typical session would cost. The score itself still comes
// from the (future) pgvector ranking; this is the human-readable "why".

/** Preference names (equipmentOptions) → words to look for in a listing's equipment/capabilities. */
const EQUIPMENT_KEYWORDS: Record<string, string[]> = {
  'Commercial Mixer': ['mixer'],
  'Deck Oven': ['deck oven'],
  'Convection Oven': ['convection', 'combi'],
  'Rack Oven': ['rack oven'],
  Proofer: ['proof'],
  Sheeter: ['sheeter'],
  'Walk-in Fridge': ['walk-in'],
  'Blast Chiller': ['blast chiller'],
  Freezer: ['freezer', 'cold storage'],
  'Stainless Prep': ['prep'],
  'Hood Line': ['hood'],
  'Steam Kettle': ['steam kettle'],
  'Tilt Skillet': ['tilt skillet'],
  Fryer: ['fryer'],
  'Bottling Line': ['bottling', 'filling'],
  'Juice Press': ['press'],
  'Dry Storage': ['dry storage'],
  'Loading Dock': ['loading dock'],
};

/** Does the listing have this piece of equipment available? */
export function listingHasEquipment(listing: Listing, pref: string): boolean {
  const words = EQUIPMENT_KEYWORDS[pref] ?? [pref.toLowerCase()];
  const haystack = [
    ...listing.equipment.filter((e) => e.available).map((e) => e.name),
    ...listing.capabilities,
  ].map((s) => s.toLowerCase());
  return words.some((w) => haystack.some((h) => h.includes(w)));
}

export type MatchBreakdown = {
  equipment: { matched: string[]; missing: string[] };
  schedule: { overlap: Weekday[]; wanted: Weekday[] };
  allergens: { met: string[]; unmet: string[] };
  budget: { rate: number; max: number; ok: boolean };
  distance: { miles: number; max: number; ok: boolean };
  /** Short lines for the UI, strongest first, e.g. "Equipment 4/4", "No 60qt mixer" */
  highlights: { label: string; ok: boolean }[];
};

export function matchBreakdown(listing: Listing, prefs: RenterPreferences): MatchBreakdown {
  const matched = prefs.equipment.filter((e) => listingHasEquipment(listing, e));
  const missing = prefs.equipment.filter((e) => !listingHasEquipment(listing, e));
  const overlap = prefs.days.filter((d) => listing.availableDays.includes(d));
  const policies = listing.allergenPolicies.map((p) => p.toLowerCase());
  const met = prefs.allergens.filter((a) => policies.some((p) => p.includes(a.toLowerCase().replace('-free', ''))));
  const unmet = prefs.allergens.filter((a) => !met.includes(a));
  const budgetOk = listing.ratePerHour <= prefs.budgetPerHour;
  const distanceOk = listing.distanceMiles <= prefs.maxDistanceMiles;

  const highlights: MatchBreakdown['highlights'] = [];
  if (prefs.equipment.length) {
    highlights.push({ label: `Equipment ${matched.length}/${prefs.equipment.length}`, ok: missing.length === 0 });
  }
  if (prefs.days.length) {
    highlights.push({
      label: overlap.length ? `Open ${overlap.join('/')}` : `Not open ${prefs.days.join('/')}`,
      ok: overlap.length > 0,
    });
  }
  for (const a of met) highlights.push({ label: a, ok: true });
  for (const a of unmet) highlights.push({ label: `Not ${a.toLowerCase()}`, ok: false });
  highlights.push({
    label: budgetOk ? `$${listing.ratePerHour}/hr in budget` : `$${listing.ratePerHour}/hr over $${prefs.budgetPerHour}`,
    ok: budgetOk,
  });
  for (const m of missing) highlights.push({ label: `No ${m.toLowerCase()}`, ok: false });

  return {
    equipment: { matched, missing },
    schedule: { overlap, wanted: prefs.days },
    allergens: { met, unmet },
    budget: { rate: listing.ratePerHour, max: prefs.budgetPerHour, ok: budgetOk },
    distance: { miles: listing.distanceMiles, max: prefs.maxDistanceMiles, ok: distanceOk },
    highlights,
  };
}

export type CostEstimate = {
  hours: number;
  ratePerHour: number;
  subtotal: number;
  cleaningFee: number;
  total: number;
  /** Refundable; held, not charged */
  deposit: number;
};

/** Cost for a session of `hours` (defaults to the renter's typical session length). */
export function estimateCost(listing: Listing, prefs: RenterPreferences, hours?: number): CostEstimate {
  const typical = Math.round(prefs.hoursPerWeek / Math.max(prefs.days.length, 1));
  const h = Math.max(listing.minHours, hours ?? typical);
  const subtotal = h * listing.ratePerHour;
  return {
    hours: h,
    ratePerHour: listing.ratePerHour,
    subtotal,
    cleaningFee: listing.cleaningFee,
    total: subtotal + listing.cleaningFee,
    deposit: listing.deposit,
  };
}
