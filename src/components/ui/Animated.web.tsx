import type { ComponentProps } from 'react';
import Reanimated from 'react-native-reanimated';

/**
 * Reanimated's web layout animations (entering / exiting / layout) can leave views
 * stuck at position: absolute on mobile Safari and Chrome, so list rows and chat
 * bubbles pile on top of each other. On web we drop those props and render statically.
 */
function View({ entering, exiting, layout, ...rest }: ComponentProps<typeof Reanimated.View>) {
  return <Reanimated.View {...rest} />;
}

export default { ...Reanimated, View } as typeof Reanimated;
