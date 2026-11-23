import { ReactNode, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import { IconButton, Text } from '@/components/ui';
import { colors } from '@/theme';
import { easeOut, tightSpring } from './motion';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: ReactNode;
};

const OFFSCREEN = 700;

/** Glass bottom sheet in a transparent Modal: slides up, drag the grabber down (or tap the backdrop) to dismiss. */
export function BottomSheet({ visible, onClose, title, eyebrow, children }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.value = 0;
      progress.value = withTiming(1, { ...easeOut, duration: 300 });
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
      if (e.translationY > 110 || e.velocityY > 900) onClose();
      else drag.value = withSpring(0, tightSpring);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * OFFSCREEN + drag.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close sheet" />
        </Animated.View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
          pointerEvents="box-none"
        >
          <Animated.View style={[styles.sheet, sheetStyle]}>
            <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, styles.tint]} />
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.border]} />
            <GestureDetector gesture={pan}>
              <View style={styles.header}>
                <View style={styles.grabber} />
                {(title || eyebrow) && (
                  <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                      {eyebrow && <Text variant="mono" style={{ marginBottom: 4 }}>{eyebrow}</Text>}
                      {title && <Text variant="h3">{title}</Text>}
                    </View>
                    <IconButton size={36} onPress={onClose}>
                      <X size={16} color={colors.textPrimary} />
                    </IconButton>
                  </View>
                )}
              </View>
            </GestureDetector>
            <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>{children}</View>
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(34,62,53,0.32)' },
  kav: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  tint: { backgroundColor: 'rgba(62, 72, 62, 0.82)' },
  border: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.glassBorderDim,
    borderTopColor: colors.glassBorderLight,
  },
  header: { paddingTop: 10, paddingHorizontal: 24, paddingBottom: 16 },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.white15,
    marginBottom: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});
