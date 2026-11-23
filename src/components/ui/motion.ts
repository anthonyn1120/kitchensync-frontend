import { Easing, FadeInDown } from 'react-native-reanimated';

/**
 * The app's standard content entrance: a quick fade with a small 8px rise and no
 * overshoot. Use for layout content (sections, rows, cards). Springs are reserved
 * for direct touch feedback.
 */
export const enterUp = (delayMs = 0) =>
  FadeInDown.duration(260)
    .delay(delayMs)
    .easing(Easing.out(Easing.cubic))
    .withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] });

/** Stagger step between consecutive items, in ms. */
export const STAGGER = 50;
