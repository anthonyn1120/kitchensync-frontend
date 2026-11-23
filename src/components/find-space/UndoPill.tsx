import { Pressable, StyleSheet, View } from 'react-native';
import { FadeOut } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { BlurView } from 'expo-blur';
import { Undo2 } from 'lucide-react-native';
import { enterUp, Text } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';

/** "Passed X · Undo" pill that floats over the deck for a few seconds after a pass. */
export function UndoPill({ name, onUndo }: { name: string; onUndo: () => void }) {
  return (
    <Animated.View entering={enterUp(0)} exiting={FadeOut.duration(160)} style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={onUndo}
        style={({ pressed }) => [styles.pill, pressed && { opacity: 0.8 }]}
        accessibilityRole="button"
        accessibilityLabel={`Undo pass on ${name}`}
        hitSlop={8}
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20,25,20,0.55)' }]} />
        <Text variant="bodySm" numberOfLines={1} style={styles.name}>
          {`Passed ${name}`}
        </Text>
        <View style={styles.sep} />
        <Undo2 size={14} color={colors.textPrimary} />
        <Text style={styles.undo}>Undo</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 84, alignItems: 'center', zIndex: 20 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.white15,
    maxWidth: 300,
  },
  name: { color: colors.textSecondary, flexShrink: 1 },
  sep: { width: 1, height: 14, backgroundColor: colors.white15 },
  undo: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
});
