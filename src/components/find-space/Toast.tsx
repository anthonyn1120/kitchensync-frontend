import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { scheduleOnRN } from 'react-native-worklets';
import { BlurView } from 'expo-blur';
import { Check, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, fonts, radius, shadows } from '@/theme';

type Props = {
  /** Bump `id` to show a new toast even if the message repeats */
  toast: { id: number; message: string } | null;
  onHide: () => void;
  onPress?: () => void;
  top: number;
};

/** Light confirmation toast that drops in over the header and auto-hides. Tap to act. */
export function Toast({ toast, onHide, onPress, top }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (!toast) return;
    t.value = 0;
    t.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) }, () => {
      t.value = withDelay(2600, withTiming(0, { duration: 220 }, (done) => {
        if (done) scheduleOnRN(onHide);
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.id]);

  const style = useAnimatedStyle(() => ({
    opacity: Math.min(t.value * 1.5, 1),
    transform: [{ translateY: (1 - t.value) * -12 }],
  }));

  if (!toast) return null;

  return (
    <Animated.View style={[styles.wrap, { top }, style]}>
      <Pressable onPress={onPress} disabled={!onPress} style={styles.toast} accessibilityRole={onPress ? 'button' : 'text'}>
        <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.82)' }]} />
        <View style={styles.icon}>
          <Check size={14} color="#1a1a1a" strokeWidth={2.5} />
        </View>
        <Text style={styles.text} numberOfLines={2}>
          {toast.message}
        </Text>
        {onPress && <ChevronRight size={16} color="rgba(26,26,26,0.5)" />}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 20, right: 20, ...shadows.ambient },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: radius.pill,
    overflow: 'hidden',
    minHeight: 48,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentMatch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: '#1a1a1a' },
});
