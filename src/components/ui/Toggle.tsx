import { useEffect } from 'react';
import { Pressable } from 'react-native';
import { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import * as Haptics from 'expo-haptics';
import { colors, springs } from '@/theme';

/** .toggle-switch — 36x20 track, green when on, white knob springs across. */
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const t = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    t.value = withSpring(value ? 1 : 0, springs.bouncy);
  }, [value, t]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], ['rgba(34,62,53,0.14)', colors.accentMatch]),
  }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: t.value * 16 }] }));

  return (
    <Pressable
      hitSlop={8}
      onPress={() => {
        Haptics.selectionAsync();
        onChange(!value);
      }}
    >
      <Animated.View style={[{ width: 36, height: 20, borderRadius: 10, padding: 3 }, track]}>
        <Animated.View style={[{ width: 14, height: 14, borderRadius: 7, backgroundColor: 'white' }, knob]} />
      </Animated.View>
    </Pressable>
  );
}
