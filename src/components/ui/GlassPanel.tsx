import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, shadows } from '@/theme';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Inner content style (padding, gap, etc.) */
  contentStyle?: StyleProp<ViewStyle>;
  /** primary = .glass-panel, secondary = .swipe-card / .upcoming-card / .settings-section, flat = no blur (cheap, for list rows) */
  tone?: 'primary' | 'secondary' | 'flat';
  radius?: number;
  intensity?: number;
  /**
   * Live backdrop blur. Off by default: over the already-blurred Background it is
   * visually identical to the tint alone but costs a native blur pass per panel.
   * Turn on only for panels that float over photos or scrolling content.
   */
  blur?: boolean;
};

/**
 * .glass-panel: frosted blur + green-grey tint, dim border with a brighter top
 * edge, and a soft drop shadow. Shadow lives on the outer view, clipping on
 * the inner one (iOS can't do both on the same view).
 */
export function GlassPanel({
  children,
  style,
  contentStyle,
  tone = 'primary',
  radius: r = radius.panel,
  intensity = 40,
  blur = false,
}: Props) {
  const tint = tone === 'primary' ? colors.glassBgPrimary : colors.glassBgSecondary;
  return (
    <View style={[{ borderRadius: r }, tone === 'primary' && styles.shadow, style]}>
      <View style={[styles.clip, { borderRadius: r }]}>
        {blur && tone !== 'flat' && <BlurView intensity={intensity} tint="default" style={StyleSheet.absoluteFill} />}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.border, { borderRadius: r }]} />
        <View style={contentStyle}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { ...shadows.ambient, elevation: 8 },
  clip: { overflow: 'hidden', flexGrow: 1 },
  border: {
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    borderTopColor: colors.glassBorderLight,
  },
});
