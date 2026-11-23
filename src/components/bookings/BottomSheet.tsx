import { ReactNode, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { colors, radius, springs } from '@/theme';
import { Text } from '@/components/ui';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  /** Pinned below the scrolling content (e.g. a primary action). */
  footer?: ReactNode;
};

const OFFSCREEN = 800;
const CLOSE_MS = 220;

/**
 * Glass bottom sheet in a transparent Modal so it covers the floating tab bar.
 * Springs up on open, drag the handle down (or tap the scrim) to dismiss.
 */
export function BottomSheet({ visible, onClose, title, eyebrow, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const y = useSharedValue(OFFSCREEN);
  const scrim = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (visible) {
      setMounted(true);
      y.value = OFFSCREEN;
      y.value = withSpring(0, springs.gentle);
      scrim.value = withTiming(1, { duration: 200 });
    } else if (mounted) {
      y.value = withTiming(OFFSCREEN, { duration: CLOSE_MS });
      scrim.value = withTiming(0, { duration: CLOSE_MS });
      timer.current = setTimeout(() => setMounted(false), CLOSE_MS);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [visible]);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      y.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 800) onClose();
      else y.value = withSpring(0, springs.gentle);
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
            <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close sheet" />
          </Animated.View>
          <Animated.View style={[styles.sheet, sheetStyle]}>
            <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.sheetBg }]} />
            <GestureDetector gesture={pan}>
              <View style={styles.handleArea}>
                <View style={styles.handle} />
                {eyebrow && <Text variant="mono" style={{ marginTop: 14 }}>{eyebrow}</Text>}
                {title && (
                  <Text variant="h3" style={{ marginTop: eyebrow ? 6 : 14 }}>
                    {title}
                  </Text>
                )}
              </View>
            </GestureDetector>
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: footer ? 16 : insets.bottom + 24 }}
            >
              {children}
            </ScrollView>
            {footer && <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View>}
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: 'rgba(34,62,53,0.32)' },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    borderTopColor: colors.glassBorderLight,
  },
  footer: { paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.white08 },
  handleArea: { paddingTop: 10, paddingHorizontal: 24 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.white15 },
});
