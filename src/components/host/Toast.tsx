import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeOutDown } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Check, Info } from 'lucide-react-native';
import { Text, enterUp } from '@/components/ui';
import { colors, radius, shadows } from '@/theme';

type ToastState = { id: number; text: string; tone: 'success' | 'info' } | null;

/**
 * Small floating confirmation that sits just above the tab bar.
 * Usage: `const toast = useToast(); toast.show('Saved'); ... {toast.element}`
 * Render `element` as a sibling of the screen's ScrollView, not inside it.
 */
export function useToast(duration = 2600) {
  const [toast, setToast] = useState<ToastState>(null);

  const show = useCallback((text: string, tone: 'success' | 'info' = 'success') => {
    setToast({ id: Date.now(), text, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(t);
  }, [toast, duration]);

  return { show, element: <ToastHost toast={toast} /> };
}

function ToastHost({ toast }: { toast: ToastState }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="none" style={[styles.host, { bottom: Math.max(insets.bottom, 12) + 84 }]}>
      {toast && (
        <Animated.View
          key={toast.id}
          entering={enterUp()}
          exiting={FadeOutDown.duration(200)}
          style={styles.shadow}
        >
          <View style={styles.pill}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, styles.tint]} />
            <View style={[styles.icon, toast.tone === 'info' && styles.iconInfo]}>
              {toast.tone === 'success' ? (
                <Check size={13} color="#1a2a1a" strokeWidth={3} />
              ) : (
                <Info size={13} color={colors.textPrimary} />
              )}
            </View>
            <Text variant="label" style={{ flexShrink: 1, fontSize: 13 }} numberOfLines={2}>
              {toast.text}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 20, right: 20, alignItems: 'center' },
  shadow: { ...shadows.ambient, borderRadius: radius.pill },
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
  tint: { backgroundColor: 'rgba(30, 38, 30, 0.75)' },
  icon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentMatch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInfo: { backgroundColor: colors.white15 },
});
