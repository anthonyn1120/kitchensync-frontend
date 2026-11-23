import { estimateCost } from '@/data/matching';
import type { Listing } from '@/data/types';
import type { RenterPreferences } from '@/store/AppState';

/** "~$295 for 6 hrs": the renter's typical session at this kitchen, cleaning included. */
export function costLine(listing: Listing, prefs: RenterPreferences) {
  const c = estimateCost(listing, prefs);
  return `~$${c.total.toLocaleString('en-US')} for ${c.hours} hrs`;
}

export const money = (n: number) => `$${n.toLocaleString('en-US')}`;
