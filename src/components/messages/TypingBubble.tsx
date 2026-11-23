import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { colors } from '@/theme';

function Dot({ delay }: { delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 }), withTiming(0, { duration: 300 })), -1),
    );
  }, [v, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + v.value * 0.65,
    transform: [{ translateY: -v.value * 4 }],
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

/** Received-style bubble with three bouncing dots ("typing…"). */
export function TypingBubble() {
  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} style={styles.bubble} accessibilityLabel="Typing">
      <View style={styles.row}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.controlBg,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  row: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textSecondary },
});
