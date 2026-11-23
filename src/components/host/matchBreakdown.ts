import type { RenterRequest } from '@/data/types';

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Placeholder per-factor breakdown derived from the overall score until the API returns real factors. */
export function matchBreakdown(r: RenterRequest) {
  const s = r.matchScore;
  return [
    { label: 'Equipment fit', value: clamp(s + 6) },
    { label: 'Schedule fit', value: clamp(s - 8) },
    { label: 'Certifications', value: clamp(s >= 75 ? s + 4 : s - 10) },
  ];
}
