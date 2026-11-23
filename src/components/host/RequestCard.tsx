import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  type SharedValue,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import * as Haptics from 'expo-haptics';
import { Check, X } from 'lucide-react-native';
import { Avatar, Chip, MatchRing, Text } from '@/components/ui';
import type { RenterRequest } from '@/data/types';
import { colors } from '@/theme';
import { tightSpring } from './motion';

type Props = {
  request: RenterRequest;
  onOpen: () => void;
  onDecline: () => void;
  /** Called once the success animation has played; parent updates the store. */
  onApproved: () => void;
  /** Set true to play the approve animation from elsewhere (notification banner, detail sheet). */
  approveSignal?: boolean;
};

/** .request-card — avatar, info, MatchRing and round decline/approve actions. Approve is one tap; decline opens a confirm. */
export function RequestCard({ request, onOpen, onDecline, onApproved, approveSignal }: Props) {
  const [approving, setApproving] = useState(false);
  const lift = useSharedValue(1);
  const green = useSharedValue(0); // approve button fill
  const success = useSharedValue(0); // card success wash
  const checkPop = useSharedValue(1);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const approve = () => {
    if (approving) return;
    setApproving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    green.value = withTiming(1, { duration: 150 });
    success.value = withTiming(1, { duration: 280 });
    checkPop.value = withSequence(withTiming(1.15, { duration: 120 }), withTiming(1, { duration: 180 }));
    timer.current = setTimeout(onApproved, 700);
  };

  useEffect(() => {
    if (approveSignal) approve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveSignal]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lift.value }],
    borderColor: interpolateColor(success.value, [0, 1], [colors.glassBorderDim, 'rgba(163,196,129,0.6)']),
    backgroundColor: interpolateColor(success.value, [0, 1], ['rgba(34,62,53,0.04)', 'rgba(61,122,95,0.12)']),
  }));
  const approveStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(green.value, [0, 1], [colors.controlBg, colors.accentMatch]),
    borderColor: interpolateColor(green.value, [0, 1], [colors.controlBorder, 'rgba(0,0,0,0)']),
    transform: [{ scale: checkPop.value }],
  }));

  return (
    <Pressable
      onPress={onOpen}
      disabled={approving}
      onPressIn={() => (lift.value = withSpring(0.98, tightSpring))}
      onPressOut={() => (lift.value = withSpring(1, tightSpring))}
      accessibilityRole="button"
      accessibilityLabel={`${request.brandName} request details`}
    >
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.top}>
          <Avatar uri={request.brandPhoto} size={48} />
          <View style={{ flex: 1 }}>
            <Text variant="title" numberOfLines={1}>{request.brandName}</Text>
            <Text variant="monoSm" style={{ marginTop: 4 }} numberOfLines={1}>
              {request.date} • {request.time}
            </Text>
            <View style={styles.tags}>
              {request.tags.map((t) => (
                <Chip key={t} label={t} size="sm" />
              ))}
            </View>
          </View>
          <MatchRing score={request.matchScore} size={48} strokeWidth={4} />
        </View>

        <View style={styles.bottom}>
          <Text variant="bodySm" numberOfLines={1} style={{ flex: 1, color: colors.textTertiary }}>
            {approving ? 'Approved — notifying renter…' : request.note}
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onDecline}
              disabled={approving}
              hitSlop={4}
              style={({ pressed }) => [styles.btn, pressed && { backgroundColor: colors.controlBgPressed }, approving && { opacity: 0.3 }]}
              accessibilityLabel="Decline request"
            >
              <X size={18} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              onPressIn={() => !approving && (green.value = withTiming(1, { duration: 120 }))}
              onPressOut={() => !approving && (green.value = withTiming(0, { duration: 200 }))}
              onPress={approve}
              hitSlop={4}
              accessibilityLabel="Approve request"
            >
              <Animated.View style={[styles.btn, approveStyle]}>
                <ApproveIcon green={green} />
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

/** Check icon that crossfades from white to the white used on the green button. */
function ApproveIcon({ green }: { green: SharedValue<number> }) {
  const light = useAnimatedStyle(() => ({ opacity: 1 - green.value }));
  const dark = useAnimatedStyle(() => ({ opacity: green.value }));
  return (
    <View>
      <Animated.View style={light}>
        <Check size={18} color={colors.textPrimary} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, dark]}>
        <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 24, padding: 16, gap: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    backgroundColor: colors.controlBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
