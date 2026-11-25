import { Pressable, StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { GlassPanel, Text } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';
import { ease, pressSpring } from './Motion';

type Props = {
  /** Bundled photo (require) or a remote URL. */
  photo: number | string;
  badge: string;
  title: string;
  description: string;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** .role-card — tall glass card: photo with badge, title + arrow, description. Presses to 0.97; the photo eases in slightly. */
export function RoleCard({ photo, badge, title, description, onPress }: Props) {
  const scale = useSharedValue(1);
  const zoom = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const photoStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${badge}: ${title}`}
      onPressIn={() => {
        scale.value = withSpring(0.97, pressSpring);
        zoom.value = withTiming(1.04, { duration: 400, easing: ease });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, pressSpring);
        zoom.value = withTiming(1, { duration: 400, easing: ease });
      }}
      onPress={onPress}
      style={[{ flex: 1 }, pressStyle]}
    >
      <GlassPanel radius={radius.panel - 4} style={{ flex: 1 }} contentStyle={styles.content}>
        <View style={styles.photo}>
          <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
            <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
          </Animated.View>
          <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']} style={StyleSheet.absoluteFill} />
          <View style={styles.badge}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <Text variant="mono" color="white">
              {badge}
            </Text>
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <ArrowRight size={20} color={colors.textTertiary} />
          </View>
          <Text variant="body" style={{ fontSize: 14, lineHeight: 21 }}>
            {description}
          </Text>
        </View>
      </GlassPanel>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 8 },
  photo: {
    flex: 1,
    minHeight: 110,
    maxHeight: 220,
    borderRadius: radius.panel - 12,
    overflow: 'hidden',
    backgroundColor: colors.black20,
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  body: { padding: 20, paddingBottom: 18, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontFamily: fonts.medium, fontSize: 20, letterSpacing: -0.5, color: colors.textPrimary },
});
