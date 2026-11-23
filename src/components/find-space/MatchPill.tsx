import { Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronRight } from 'lucide-react-native';
import { MatchRing, Text } from '@/components/ui';
import { colors, radius } from '@/theme';

/** Compact fit score + one-line reason, floated over the bottom of the card photo. Tap for the breakdown. */
export function MatchPill({ score, reason, onPress }: { score: number; reason: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.pill, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
      accessibilityLabel={`${score}% fit. ${reason.replace(/\.$/, '')}. Show how it fits`}
    >
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.black30 }]} />
      <MatchRing score={score} size={40} strokeWidth={3} />
      <Text variant="bodySm" numberOfLines={1} style={styles.reason}>
        {reason}
      </Text>
      {onPress && <ChevronRight size={14} color={colors.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 4,
    paddingRight: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.white15,
    overflow: 'hidden',
  },
  reason: { flex: 1, color: colors.textPrimary, fontSize: 12 },
});
