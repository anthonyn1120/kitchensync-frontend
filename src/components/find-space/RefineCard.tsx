import { Pressable, StyleSheet, View } from 'react-native';
import { FadeOut } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { ChevronRight, X } from 'lucide-react-native';
import { enterUp, Text } from '@/components/ui';
import { colors, radius } from '@/theme';

/** Small dismissible nudge shown until the renter has filled in equipment needs. */
export function RefineCard({ onPress, onDismiss }: { onPress: () => void; onDismiss: () => void }) {
  return (
    <Animated.View entering={enterUp(0)} exiting={FadeOut.duration(160)} style={styles.card}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.main, pressed && { opacity: 0.7 }]}
        accessibilityRole="link"
      >
        <Text variant="bodySm" color={colors.textPrimary} style={{ flex: 1 }}>
          Add your equipment needs to sharpen these results
        </Text>
        <ChevronRight size={16} color={colors.textSecondary} />
      </Pressable>
      <View style={styles.sep} />
      <Pressable onPress={onDismiss} hitSlop={8} style={styles.close} accessibilityLabel="Dismiss">
        <X size={14} color={colors.textTertiary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: radius.sm + 4,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 11, paddingLeft: 14, paddingRight: 10 },
  sep: { width: 1, alignSelf: 'stretch', marginVertical: 10, backgroundColor: colors.white10 },
  close: { paddingHorizontal: 12, paddingVertical: 11 },
});
