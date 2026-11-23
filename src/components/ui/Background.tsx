import { useEffect } from 'react';
import { Image, ImageSourcePropType, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { colors } from '@/theme';

/**
 * The ".environment" layer, reproduced from onboarding.html (the phone mockup):
 *
 *   .ambient-blob { filter: blur(90px); border-radius: 50%; opacity: 0.8;
 *                   animation: drift 25s infinite alternate ease-in-out; }
 *   .blob-1 { top: -10%; left: -20%;    width: 120vw; height: 60vh; olive }
 *   .blob-2 { bottom: -10%; right: -20%; width: 100vw; height: 70vh; slate; delay -5s }
 *   .blob-3 { top: 40%; left: 10%;      width: 80vw;  height: 50vh; clay; opacity 0.5; delay -10s }
 *   @keyframes drift { to { transform: translate(10%, 10%) scale(1.1) rotate(15deg) } }
 *
 * RN has no CSS blur, so each blurred ellipse is pre-rendered as a white alpha
 * mask (assets/background/blob*.png, Gaussian sigma 90px with 3-sigma padding at
 * the mockup's 402x874 viewport) and tinted here. Render once at the root.
 */

const REF_W = 402;
const REF_H = 874;
const PAD = 270; // 3 x blur sigma, baked into the mask images
const DURATION = 25000;
const cssEaseInOut = Easing.bezierFn(0.42, 0, 0.58, 1);

type BlobSpec = {
  source: ImageSourcePropType;
  color: string;
  opacity: number;
  /** box in viewport fractions, like the CSS (vw / vh) */
  left: number;
  top: number;
  width: number;
  height: number;
  /** negative CSS animation-delay, in ms */
  delay: number;
};

const BLOBS: BlobSpec[] = [
  { source: require('../../../assets/background/blob1.png'), color: colors.envBlob1, opacity: 0.8, left: -0.2, top: -0.1, width: 1.2, height: 0.6, delay: 0 },
  // bottom: -10%, right: -20% → left = 1 + 0.2 - 1.0, top = 1 + 0.1 - 0.7
  { source: require('../../../assets/background/blob2.png'), color: colors.envBlob2, opacity: 0.8, left: 0.2, top: 0.4, width: 1.0, height: 0.7, delay: 5000 },
  { source: require('../../../assets/background/blob3.png'), color: colors.envBlob3, opacity: 0.5, left: 0.1, top: 0.4, width: 0.8, height: 0.5, delay: 10000 },
];

export function Background() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.env]} pointerEvents="none">
      {BLOBS.map((b, i) => (
        <Blob key={i} spec={b} />
      ))}
    </View>
  );
}

function Blob({ spec }: { spec: BlobSpec }) {
  const { width: vw, height: vh } = useWindowDimensions();
  const t = useDrift(spec.delay);

  const w = spec.width * vw;
  const h = spec.height * vh;
  const padX = (PAD / REF_W) * vw;
  const padY = (PAD / REF_H) * vh;

  // translate(10%, 10%) is relative to the blob box itself, as in CSS.
  const drift = useAnimatedStyle(() => {
    const e = cssEaseInOut(t.value);
    return {
      transform: [
        { translateX: e * 0.1 * w },
        { translateY: e * 0.1 * h },
        { scale: 1 + e * 0.1 },
        { rotate: `${e * 15}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: spec.left * vw - padX,
          top: spec.top * vh - padY,
          width: w + padX * 2,
          height: h + padY * 2,
          opacity: spec.opacity,
        },
        drift,
      ]}
    >
      <Image source={spec.source} style={{ width: '100%', height: '100%', tintColor: spec.color }} resizeMode="stretch" />
    </Animated.View>
  );
}

/** Linear 0→1→0 timeline (25s each way) starting `delay` ms in, like a negative CSS animation-delay. */
function useDrift(delay: number): SharedValue<number> {
  const start = (delay % DURATION) / DURATION;
  const t = useSharedValue(start);
  useEffect(() => {
    // On web Reanimated drives this from the JS thread, so three full-screen blobs
    // repainting every frame starve gestures. The drift is too slow to miss there.
    if (Platform.OS === 'web') return;
    t.value = withSequence(
      withTiming(1, { duration: (1 - start) * DURATION, easing: Easing.linear }),
      withRepeat(
        withSequence(
          withTiming(0, { duration: DURATION, easing: Easing.linear }),
          withTiming(1, { duration: DURATION, easing: Easing.linear }),
        ),
        -1,
      ),
    );
  }, [t, start]);
  return t;
}

const styles = StyleSheet.create({
  env: { backgroundColor: colors.envBg, overflow: 'hidden' },
});
