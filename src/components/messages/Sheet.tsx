import { ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import { IconButton, Text } from '@/components/ui';
import { colors, radius, springs } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
};

const OFFSCREEN = 800;

/** Glass bottom sheet: springs up, dismiss by tapping the backdrop or dragging the grabber down. */
export function Sheet({ visible, onClose, eyebrow, title, children }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.value = 0;
      progress.value = withSpring(1, springs.gentle);
      return;
    }
    progress.value = withTiming(0, { duration: 220 });
    const t = setTimeout(() => setMounted(false), 230);
    return () => clearTimeout(t);
  }, [visible, progress, drag]);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      drag.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 900) onClose();
      else drag.value = withSpring(0, springs.gentle);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * OFFSCREEN + drag.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <View style={styles.anchor} pointerEvents="box-none">
          <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }, sheetStyle]}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, styles.tint]} />
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.border]} />
            <GestureDetector gesture={pan}>
              <View style={styles.header}>
                <View style={styles.grabber} />
                {(title || eyebrow) && (
                  <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                      {eyebrow && (
                        <Text variant="mono" style={{ marginBottom: 4 }}>
                          {eyebrow}
                        </Text>
                      )}
                      {title && <Text variant="h3">{title}</Text>}
                    </View>
                    <IconButton size={40} onPress={onClose}>
                      <X size={16} color={colors.textPrimary} />
                    </IconButton>
                  </View>
                )}
              </View>
            </GestureDetector>
            <View style={styles.body}>{children}</View>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.45)' },
  anchor: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.card + 4,
    borderTopRightRadius: radius.card + 4,
    overflow: 'hidden',
    maxHeight: '88%',
  },
  tint: { backgroundColor: colors.glassBgPrimary },
  border: {
    borderTopLeftRadius: radius.card + 4,
    borderTopRightRadius: radius.card + 4,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    borderTopColor: colors.glassBorderLight,
  },
  header: { paddingTop: 10, paddingHorizontal: 20 },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.white15,
    marginBottom: 14,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  body: { paddingHorizontal: 20 },
});
