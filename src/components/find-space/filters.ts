import type { Listing, Weekday } from '@/data/types';
import type { RenterPreferences } from '@/store/AppState';

export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export type DeckFilters = Pick<RenterPreferences, 'maxDistanceMiles' | 'budgetPerHour' | 'equipment' | 'days'>;

// Preference names (equipmentOptions) are generic; listing equipment and chips
// are host-written ("Prep Tables (Stainless)", "Walk-in"). Match on keywords.
const EQUIPMENT_KEYWORDS: Record<string, string[]> = {
  'Commercial Mixer': ['mixer'],
  'Deck Oven': ['deck oven', 'deck'],
  'Convection Oven': ['convection'],
  'Rack Oven': ['rack oven'],
  Proofer: ['proofer'],
  Sheeter: ['sheeter'],
  'Walk-in Fridge': ['walk-in', 'cold storage'],
  'Blast Chiller': ['blast chiller'],
  Freezer: ['freezer', 'cold storage'],
  'Stainless Prep': ['stainless', 'prep station', 'prep table'],
  'Hood Line': ['hood'],
  'Steam Kettle': ['steam kettle'],
  'Tilt Skillet': ['tilt skillet'],
  Fryer: ['fryer'],
  'Bottling Line': ['bottling'],
  'Juice Press': ['press'],
  'Dry Storage': ['dry storage'],
  'Loading Dock': ['loading dock'],
};

export function hasEquipment(listing: Listing, option: string) {
  const keywords = EQUIPMENT_KEYWORDS[option] ?? [option.toLowerCase()];
  const offered = [
    ...listing.equipment.filter((e) => e.available).map((e) => e.name),
    ...listing.capabilities,
  ].map((s) => s.toLowerCase());
  return offered.some((name) => keywords.some((k) => name.includes(k)));
}

/**
 * Distance and rate are hard caps. Days must overlap at least one preferred
 * day, and the space must offer at least one of the selected equipment items
 * (an empty selection means "no preference").
 */
export function matchesFilters(listing: Listing, f: DeckFilters) {
  if (listing.distanceMiles > f.maxDistanceMiles) return false;
  if (listing.ratePerHour > f.budgetPerHour) return false;
  if (f.days.length && !listing.availableDays.some((d) => f.days.includes(d))) return false;
  if (f.equipment.length && !f.equipment.some((e) => hasEquipment(listing, e))) return false;
  return true;
}

export function buildDeck(all: Listing[], f: DeckFilters, exclude: string[]) {
  return all
    .filter((l) => !exclude.includes(l.id) && matchesFilters(l, f))
    .sort((a, b) => b.matchScore - a.matchScore);
}
