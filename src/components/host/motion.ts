import { Easing } from 'react-native-reanimated';

/** Spring for direct touch feedback (press scale, drag snap-back): quick, no overshoot. */
export const tightSpring = { damping: 26, stiffness: 320, mass: 1, overshootClamping: true } as const;

/** Standard non-touch timing (sheets opening, disclosure chevrons, indicators). */
export const easeOut = { duration: 240, easing: Easing.out(Easing.cubic) } as const;
