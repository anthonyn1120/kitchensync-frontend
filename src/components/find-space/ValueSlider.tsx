import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import { colors, springs } from '@/theme';

type Props = {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
};

const THUMB = 28;

/** Single-value slider: drag or tap the track; snaps to `step` with a selection tick. */
export function ValueSlider({ value, min, max, step, onChange }: Props) {
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);
  const pressed = useSharedValue(0);
  const travel = Math.max(width - THUMB, 1);

  const toX = (v: number) => ((v - min) / (max - min)) * travel;

  useEffect(() => {
    if (width) x.value = withSpring(toX(value), springs.gentle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, width]);

  const last = useSharedValue(value);
  useEffect(() => {
    last.value = value;
  }, [value, last]);

  const emit = (v: number) => {
    Haptics.selectionAsync();
    onChange(v);
  };

  const snap = (px: number) => {
    'worklet';
    const clamped = Math.min(Math.max(px, 0), travel);
    const raw = min + (clamped / travel) * (max - min);
    return Math.round(raw / step) * step;
  };

  const move = (px: number) => {
    'worklet';
    x.value = Math.min(Math.max(px, 0), travel);
    const v = snap(px);
    if (v !== last.value) {
      last.value = v;
      scheduleOnRN(emit, v);
    }
  };

  const pan = Gesture.Pan()
    .hitSlop({ vertical: 12 })
    .minDistance(0)
    .onBegin((e) => {
      pressed.value = withSpring(1, springs.gentle);
      move(e.x - THUMB / 2);
    })
    .onUpdate((e) => move(e.x - THUMB / 2))
    .onFinalize(() => {
      pressed.value = withSpring(0, springs.gentle);
      const v = snap(x.value);
      x.value = withSpring(((v - min) / (max - min)) * travel, springs.gentle);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { scale: 1 + pressed.value * 0.12 }],
  }));
  const fillStyle = useAnimatedStyle(() => ({ width: x.value }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.wrap} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 40, justifyContent: 'center' },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white10,
    marginHorizontal: THUMB / 2,
    overflow: 'hidden',
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.accentMatch },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.primaryButtonBg,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
});
