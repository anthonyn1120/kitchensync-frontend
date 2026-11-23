import { ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { scheduleOnRN } from 'react-native-worklets';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '@/theme';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Sticky footer under the scrollable body (e.g. action buttons) */
  footer?: ReactNode;
  /** Optional header pinned under the grabber; it's also a drag handle */
  header?: ReactNode;
  maxHeightRatio?: number;
};

const SPRING = { damping: 22, stiffness: 220, mass: 0.9 };

/**
 * Glass bottom sheet in a transparent Modal so it covers the floating tab bar.
 * Springs up from the bottom; drag the grabber/header down (or tap the
 * backdrop) to dismiss.
 */
export function BottomSheet({ open, onClose, children, footer, header, maxHeightRatio = 0.88 }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(open);
  const offset = useSharedValue(height);

  useEffect(() => {
    if (open) {
      setMounted(true);
      offset.value = withSpring(0, SPRING);
    } else {
      offset.value = withTiming(height, { duration: 240, easing: Easing.in(Easing.quad) }, (done) => {
        if (done) scheduleOnRN(setMounted, false);
      });
    }
  }, [open, height, offset]);

  const drag = Gesture.Pan()
    .activeOffsetY(6)
    .onUpdate((e) => {
      offset.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) {
        scheduleOnRN(onClose);
      } else {
        offset.value = withSpring(0, SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(offset.value, [0, height * 0.6], [1, 0], 'clamp'),
  }));

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close sheet" />
        </Animated.View>
        <Animated.View style={[styles.sheet, { maxHeight: height * maxHeightRatio }, sheetStyle]}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassBgPrimary }]} />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.border]} />
          <GestureDetector gesture={drag}>
            <View>
              <View style={styles.grabberWrap}>
                <View style={styles.grabber} />
              </View>
              {header}
            </View>
          </GestureDetector>
          <View style={{ flexShrink: 1 }}>{children}</View>
          {footer && <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>{footer}</View>}
          {!footer && <View style={{ height: Math.max(insets.bottom, 16) }} />}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(10, 15, 10, 0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.panel,
    borderTopRightRadius: radius.panel,
    overflow: 'hidden',
  },
  border: {
    borderTopLeftRadius: radius.panel,
    borderTopRightRadius: radius.panel,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.glassBorderDim,
    borderTopColor: colors.glassBorderLight,
  },
  grabberWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.white08,
  },
});
