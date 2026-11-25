import { router } from 'expo-router';

/** Step counts for the "Step N of M" labels. */
export const RENTER_STEPS = 2;
export const HOST_STEPS = 2;

/** "Sharpen your results" (requirements → standards → schedule), entered from Find Space. */
export const REFINE_STEPS = 3;
export const REFINE_ENTRY = '/onboarding/renter/requirements?refine=1';
export const refineLabel = (n: number) => `Sharpen results · ${n} of ${REFINE_STEPS}`;

/** Leave the refine flow and land on Find Space, wherever it sits in history. */
export function exitRefine() {
  if (router.canGoBack()) router.dismissTo('/renter/find-space');
  else router.replace('/renter/find-space');
}
