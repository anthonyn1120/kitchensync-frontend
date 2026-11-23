import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Inbox } from 'lucide-react-native';
import { Avatar, Text } from '@/components/ui';
import type { RenterRequest } from '@/data/types';
import { colors, fonts, radius, shadows } from '@/theme';
import { easeOut, tightSpring } from './motion';
import { formatRange, parseRange } from './openSlots';

const HIDDEN = -220;
const OUT_MS = 220;

type Props = {
  request: RenterRequest;
  onApprove: () => void;
  onView: () => void;
  /** Called after the banner has slid away (any reason). */
  onDismissed: () => void;
  /** Auto-dismiss after this long; null keeps it up. */
  autoHideMs?: number | null;
};

/** iOS-style notification that slides down from the top: a new renter request with Approve / View. Swipe up to dismiss. */
export function RequestBanner({ request, onApprove, onView, onDismissed, autoHideMs = 8000 }: Props) {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(HIDDEN);
  const leaving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismiss = (then?: () => void) => {
    if (leaving.current) return;
    leaving.current = true;
    clearTimeout(timer.current);
    then?.();
    y.value = withTiming(HIDDEN, { duration: OUT_MS });
    timer.current = setTimeout(onDismissed, OUT_MS + 20);
  };

  useEffect(() => {
    y.value = withTiming(0, { ...easeOut, duration: 340 });
    if (autoHideMs != null) timer.current = setTimeout(() => dismiss(), autoHideMs);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY([-8, 8])
    .onUpdate((e) => {
      // Follows the finger upward; resists pulling down.
      y.value = e.translationY < 0 ? e.translationY : e.translationY * 0.15;
    })
    .onEnd((e) => {
      if (e.translationY < -36 || e.velocityY < -500) dismiss();
      else y.value = withSpring(0, tightSpring);
    });

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  const range = parseRange(request.time);
  const when = `${request.date.replace(',', '')}, ${range ? formatRange(range) : request.time}`;

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { paddingTop: insets.top + 4 }]}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.shadow, style]} accessibilityLiveRegion="polite">
          <View style={styles.card}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, styles.tint]} />

            <View style={styles.meta}>
              <View style={styles.appIcon}>
                <Inbox size={11} color="#1a2a1a" strokeWidth={2.5} />
              </View>
              <Text variant="monoSm" color={colors.textSecondary}>New request</Text>
              <Text variant="monoSm" style={{ marginLeft: 'auto' }}>now</Text>
            </View>

            <View style={styles.body}>
              <Avatar uri={request.brandPhoto} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="title" numberOfLines={1}>{request.brandName}</Text>
                <Text variant="bodySm" numberOfLines={1} style={{ marginTop: 2 }}>
                  {when} · <Text variant="bodySm" color={colors.accentMatch}>{request.matchScore}% fit</Text>
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() => dismiss(onView)}
                style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && { backgroundColor: colors.controlBgPressed }]}
                accessibilityRole="button"
                accessibilityLabel={`View request from ${request.brandName}`}
              >
                <Text style={styles.btnText}>View</Text>
              </Pressable>
              <Pressable
                onPress={() => dismiss(onApprove)}
                style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel={`Approve request from ${request.brandName}`}
              >
                <Text style={[styles.btnText, { color: colors.primaryButtonText }]}>Approve</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { ...shadows.ambient, marginHorizontal: 10, borderRadius: 26 },
  card: {
    borderRadius: 26,
    overflow: 'hidden',
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    borderTopColor: colors.glassBorderLight,
  },
  tint: { backgroundColor: 'rgba(30, 38, 30, 0.78)' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.accentMatch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  btn: { flex: 1, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  btnGhost: { backgroundColor: colors.controlBg, borderWidth: 1, borderColor: colors.controlBorder },
  btnPrimary: { backgroundColor: colors.primaryButtonBg },
  btnText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
});
