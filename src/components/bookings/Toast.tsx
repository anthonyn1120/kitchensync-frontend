import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Check } from 'lucide-react-native';
import { colors, radius, springs } from '@/theme';
import { Text } from '@/components/ui';

type ToastState = { id: number; message: string } | null;

/**
 * Small confirmation pill that drops in from the top.
 * Usage: const toast = useToast(); … toast.show('Copied'); … render {toast.node} last in the screen.
 */
export function useToast(duration = 1800) {
  const [state, setState] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const show = useCallback(
    (message: string) => {
      if (timer.current) clearTimeout(timer.current);
      setState({ id: Date.now(), message });
      timer.current = setTimeout(() => setState(null), duration);
    },
    [duration],
  );

  const node = <ToastView state={state} />;
  return { show, node };
}

function ToastView({ state }: { state: ToastState }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 8 }]}>
      {state && (
      <Animated.View
        key={state.id}
        entering={FadeInUp.springify().damping(springs.bouncy.damping).stiffness(springs.bouncy.stiffness)}
        exiting={FadeOutUp.duration(180)}
        style={styles.pill}
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassBgPrimary }]} />
        <View style={styles.dot}>
          <Check size={12} color={colors.primaryButtonText} strokeWidth={3} />
        </View>
        <Text variant="label">{state.message}</Text>
      </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 100 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 18,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    borderTopColor: colors.glassBorderLight,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentMatch,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
