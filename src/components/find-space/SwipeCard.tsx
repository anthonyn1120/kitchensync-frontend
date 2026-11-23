import { Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CirclePlus } from 'lucide-react-native';
import { Chip, IconButton, PillButton, Text } from '@/components/ui';
import type { FacilityType, Listing } from '@/data/types';
import { colors, fonts, radius, shadows } from '@/theme';
import { DotPagination } from './DotPagination';
import { MatchPill } from './MatchPill';

export type SwipeDir = 'left' | 'right';
export type SwipeCardHandle = { swipe: (dir: SwipeDir) => void };

type Props = {
  listing: Listing;
  /** Position in the stack: 0 = top, 1–3 behind. -1 = flying off. */
  index: number;
  width: number;
  height: number;
  /** Deck-wide 0..1 "anticipation" — behind cards lean forward while the top card is dragged */
  lift: SharedValue<number>;
  compact: boolean;
  onSwipe: (listingId: string, dir: SwipeDir) => void;
  onExited: (id: string) => void;
  onOpenDetail: () => void;
  onExplainMatch: () => void;
  /** e.g. "~$295 for 6 hrs" */
  costLabel: string;
  /** Slide in from the left on mount (an undone pass coming back) */
  returning?: boolean;
  ref?: Ref<SwipeCardHandle>;
};

const FACILITY_LABEL: Record<FacilityType, string> = {
  'commercial-kitchen': 'Kitchen',
  bakery: 'Bakery',
  factory: 'Factory',
  commissary: 'Commissary',
  restaurant: 'Restaurant',
};

const BACK_SPRING = { damping: 16, stiffness: 180, mass: 0.8 };
const STACK_SPRING = { damping: 15, stiffness: 160, mass: 0.9 };

export function SwipeCard({
  listing,
  index,
  width,
  height,
  lift,
  compact,
  onSwipe,
  onExited,
  onOpenDetail,
  onExplainMatch,
  costLabel,
  returning,
  ref,
}: Props) {
  const tx = useSharedValue(returning ? -width * 1.2 : 0);
  const ty = useSharedValue(0);
  const depth = useSharedValue(Math.max(index, 0));
  const armed = useSharedValue(0); // -1 / 0 / 1: which stamp threshold we've crossed (for haptics)
  const gone = useSharedValue(false);
  const [photo, setPhoto] = useState(0);
  const prevIndex = useRef(index);

  const id = listing.id;
  const threshold = width * 0.32;
  const isTop = index === 0;

  // Spring to the new stack slot. Start from the *visual* depth (depth - lift)
  // so the hand-off from the drag anticipation is seamless.
  useEffect(() => {
    if (index >= 0 && index !== prevIndex.current) {
      depth.value = Math.max(depth.value - lift.value, 0);
      depth.value = withSpring(index, STACK_SPRING);
    }
    prevIndex.current = index;
  }, [index, depth, lift]);

  // An undone pass glides back in from the side it left by.
  useEffect(() => {
    if (returning) tx.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Image.prefetch(listing.photos);
  }, [listing.photos]);

  // Haptics only when the drag crosses the commit threshold.
  const tick = () => Haptics.selectionAsync();

  const flyOff = (dir: number, vx: number, vy: number) => {
    'worklet';
    if (gone.value) return;
    gone.value = true;
    const toX = dir * width * 1.6;
    const speed = Math.max(Math.abs(vx), 1200);
    const duration = Math.min(Math.max((Math.abs(toX - tx.value) / speed) * 1000, 200), 340);
    tx.value = withTiming(toX, { duration, easing: Easing.out(Easing.quad) }, (done) => {
      if (done) scheduleOnRN(onExited, id);
    });
    ty.value = withTiming(ty.value + vy * 0.08 - 30, { duration, easing: Easing.out(Easing.quad) });
    scheduleOnRN(onSwipe, id, dir > 0 ? 'right' : 'left');
  };

  const swipeTo = (dir: SwipeDir) => {
    if (!isTop) return;
    const sign = dir === 'right' ? 1 : -1;
    scheduleOnUI(() => {
      'worklet';
      if (gone.value) return;
      // Small wind-up so a button press reads as the same physical motion as a swipe.
      lift.value = withTiming(0.15, { duration: 90 });
      tx.value = withTiming(sign * 14, { duration: 90 }, () => {
        flyOff(sign, 0, 0);
      });
    });
  };

  useImperativeHandle(ref, () => ({ swipe: swipeTo }));

  const pan = Gesture.Pan()
    .enabled(isTop)
    .activeOffsetX([-8, 8])
    .activeOffsetY([-12, 12])
    .onUpdate((e) => {
      if (gone.value) return;
      tx.value = e.translationX;
      ty.value = e.translationY * 0.6;
      lift.value = Math.min(Math.abs(e.translationX) / threshold, 1) * 0.3;
      const zone = e.translationX > threshold ? 1 : e.translationX < -threshold ? -1 : 0;
      if (zone !== armed.value) {
        armed.value = zone;
        if (zone !== 0) scheduleOnRN(tick);
      }
    })
    .onEnd((e) => {
      if (gone.value) return;
      const flingX = Math.abs(e.velocityX) > 900 && Math.abs(e.translationX) > 40;
      if (e.translationX > threshold || (flingX && e.velocityX > 0)) {
        flyOff(1, e.velocityX, e.velocityY);
      } else if (e.translationX < -threshold || (flingX && e.velocityX < 0)) {
        flyOff(-1, e.velocityX, e.velocityY);
      } else {
        if ((e.translationY < -90 || e.velocityY < -900) && Math.abs(e.translationX) < 80) {
          scheduleOnRN(onOpenDetail);
        }
        tx.value = withSpring(0, { ...BACK_SPRING, velocity: e.velocityX });
        ty.value = withSpring(0, { ...BACK_SPRING, velocity: e.velocityY });
        lift.value = withSpring(0, BACK_SPRING);
        armed.value = 0;
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const d = Math.max(depth.value - lift.value, 0);
    const rotate = interpolate(tx.value, [-width, 0, width], [-14, 0, 14]);
    return {
      opacity: interpolate(d, [0, 1, 2, 3], [1, 0.6, 0.3, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: tx.value },
        { translateY: ty.value + d * 20 },
        { rotate: `${rotate}deg` },
        { scale: 1 - d * 0.06 },
      ],
    };
  });

  // Behind cards read as empty glass (as in the mockup); content fades in as they come forward.
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(depth.value - lift.value, [0, 0.8], [1, 0], Extrapolation.CLAMP),
  }));

  const likeStamp = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [20, threshold], [0, 1], Extrapolation.CLAMP),
    transform: [{ rotate: '-14deg' }, { scale: interpolate(tx.value, [20, threshold], [1.25, 1], Extrapolation.CLAMP) }],
  }));
  const passStamp = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-20, -threshold], [0, 1], Extrapolation.CLAMP),
    transform: [{ rotate: '14deg' }, { scale: interpolate(tx.value, [-20, -threshold], [1.25, 1], Extrapolation.CLAMP) }],
  }));

  const step = (delta: number) => {
    const next = photo + delta;
    if (next < 0 || next >= listing.photos.length) return;
    setPhoto(next);
  };

  const zIndex = index < 0 ? 10 : 5 - index;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        pointerEvents={isTop ? 'auto' : 'none'}
        style={[styles.card, { width, height, zIndex }, cardStyle]}
      >
        <Animated.View style={[styles.inner, contentStyle]}>
          {/* Photo area */}
          <View style={styles.photoArea}>
            <Image
              source={{ uri: listing.photos[photo] }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={220}
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.28)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.55)']}
              locations={[0, 0.3, 0.55, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.2)']}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* Tap zones step through photos */}
            <View style={StyleSheet.absoluteFill}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Pressable style={{ flex: 1 }} onPress={() => step(-1)} accessibilityLabel="Previous photo" />
                <Pressable style={{ flex: 1 }} onPress={() => step(1)} accessibilityLabel="Next photo" />
              </View>
            </View>

            <View style={styles.metaOverlay} pointerEvents="box-none">
              <View style={styles.badge}>
                <Text variant="mono" color={listing.isNew ? colors.accentMatch : colors.textSecondary}>
                  {listing.isNew ? 'New' : FACILITY_LABEL[listing.facilityType]}
                </Text>
              </View>
              <View style={styles.topButtons}>
                <IconButton onPress={onOpenDetail} size={40} style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'transparent' }}>
                  <CirclePlus size={16} color={colors.textPrimary} strokeWidth={2} />
                </IconButton>
              </View>
            </View>

            <View style={styles.matchWrap} pointerEvents="box-none">
              <MatchPill score={listing.matchScore} reason={listing.matchReason} onPress={onExplainMatch} />
            </View>

            <Animated.View style={[styles.stamp, styles.stampLike, likeStamp]} pointerEvents="none">
              <Text style={[styles.stampText, { color: colors.accentMatch }]}>SAVE</Text>
            </Animated.View>
            <Animated.View style={[styles.stamp, styles.stampPass, passStamp]} pointerEvents="none">
              <Text style={[styles.stampText, { color: colors.accentDanger }]}>PASS</Text>
            </Animated.View>
          </View>

          {/* Info */}
          <View style={[styles.info, compact && styles.infoCompact]}>
            <View>
              <Text style={styles.name} numberOfLines={1}>
                {listing.name}
              </Text>
              <Text variant="mono">{`${listing.distanceMiles} miles  ·  $${listing.ratePerHour}/hr`}</Text>
              <Text variant="mono" color={colors.textSecondary} style={{ marginTop: 4 }}>
                {`${costLabel}  ·  incl. cleaning`}
              </Text>
            </View>

            <Text variant="bodySm" numberOfLines={compact ? 2 : 3} style={styles.quote}>
              {`"${listing.quote}"`}
            </Text>

            <View style={[styles.chips, compact && styles.chipsCompact]}>
              {listing.capabilities.map((c) => (
                <Chip key={c} label={c} />
              ))}
            </View>

            <DotPagination count={listing.photos.length} index={photo} />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <PillButton
              label="Pass"
              onPress={() => swipeTo('left')}
              style={styles.actionBtn}
            />
            <PillButton
              label="Save"
              variant="primary"
              onPress={() => swipeTo('right')}
              style={styles.actionBtn}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: radius.panel,
    backgroundColor: colors.glassBgSecondary,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    borderTopColor: colors.glassBorderLight,
    ...shadows.card,
  },
  inner: { flex: 1, padding: 8 },
  photoArea: {
    flex: 1,
    minHeight: 150,
    borderRadius: radius.panel - 8,
    overflow: 'hidden',
    backgroundColor: colors.black20,
  },
  metaOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  topButtons: { flexDirection: 'row', gap: 8 },
  matchWrap: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  stamp: {
    position: 'absolute',
    top: 64,
    borderWidth: 3,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  stampLike: { left: 20, borderColor: colors.accentMatch },
  stampPass: { right: 20, borderColor: colors.accentDanger },
  stampText: { fontFamily: fonts.monoMedium, fontSize: 22, letterSpacing: 3 },
  info: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, gap: 14 },
  infoCompact: { paddingTop: 14, paddingBottom: 12, gap: 10 },
  name: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 24, letterSpacing: -0.3, color: colors.textPrimary, marginBottom: 4 },
  quote: { fontSize: 14, lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, maxHeight: 70, overflow: 'hidden' },
  chipsCompact: { maxHeight: 31 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 8, paddingBottom: 8 },
  actionBtn: { flex: 1, paddingVertical: 16 },
});
