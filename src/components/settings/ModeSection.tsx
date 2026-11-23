import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { router } from 'expo-router';
import { ArrowLeftRight, ChevronRight, LogOut } from 'lucide-react-native';
import type { Role } from '@/data/types';
import { colors, fonts, radius, springs } from '@/theme';
import { GlassPanel, Text } from '@/components/ui';
import { useAppState } from '@/store/AppState';
import { enterUp, STAGGER } from '@/components/ui/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Replaces the desktop sidebar's "Switch to Host" + adds Sign Out. */
export function ModeSection({ side, index }: { side: Role; index: number }) {
  const { switchMode, resetOnboarding } = useAppState();
  const toHost = side === 'renter';

  return (
    <Animated.View entering={enterUp(80 + index * STAGGER)} style={{ gap: 12 }}>
      <GlassRow
        prominent
        icon={<ArrowLeftRight size={18} color={colors.primaryButtonText} />}
        eyebrow={toHost ? 'Host Mode' : 'Renter Mode'}
        title={toHost ? 'Switch to Host' : 'Switch to Renter'}
        hint={toHost ? 'List your kitchen’s idle hours' : 'Find production time for your brand'}
        onPress={() => {
          switchMode();
          router.replace(toHost ? '/host/dashboard' : '/renter/find-space');
        }}
      />
      <GlassRow
        icon={<LogOut size={18} color={colors.textSecondary} />}
        title="Sign Out"
        onPress={() => {
          resetOnboarding();
          router.replace('/onboarding');
        }}
      />
    </Animated.View>
  );
}

function GlassRow({
  icon,
  eyebrow,
  title,
  hint,
  prominent,
  onPress,
}: {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  hint?: string;
  prominent?: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.97, springs.gentle))}
      onPressOut={() => (scale.value = withSpring(1, springs.gentle))}
      onPress={onPress}
      accessibilityRole="button"
      style={style}
    >
      <GlassPanel tone={prominent ? 'primary' : 'secondary'} radius={radius.card} contentStyle={[styles.row, !prominent && styles.rowSm]}>
        <View style={[styles.icon, prominent ? styles.iconProminent : styles.iconPlain]}>{icon}</View>
        <View style={{ flex: 1, gap: 2 }}>
          {eyebrow && <Text variant="monoSm">{eyebrow}</Text>}
          <Text style={[styles.title, !prominent && { fontSize: 15, color: colors.textSecondary }]}>{title}</Text>
          {hint && <Text variant="bodySm">{hint}</Text>}
        </View>
        <ChevronRight size={18} color={colors.textTertiary} />
      </GlassPanel>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 },
  rowSm: { paddingVertical: 14 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconProminent: { backgroundColor: colors.accentMatch },
  iconPlain: { backgroundColor: colors.controlBg, borderWidth: 1, borderColor: colors.controlBorder },
  title: { fontFamily: fonts.medium, fontSize: 18, letterSpacing: -0.2, color: colors.textPrimary },
});
