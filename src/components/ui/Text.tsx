import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors, fonts } from '@/theme';

type Variant = 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'bodySm' | 'label' | 'mono' | 'monoSm';

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  weight?: 'light' | 'regular' | 'medium' | 'semibold';
  align?: 'left' | 'center' | 'right';
};

/**
 * Typography from the mockups.
 * - h1/h2/h3/title: Inter 500, tight letter-spacing (-0.02em)
 * - body: 15px/1.5 secondary text (.text-body)
 * - mono: JetBrains Mono 11px uppercase, 0.1em tracking, tertiary (.mono-meta)
 * Mobile note: mono sizes are floored at 10px for legibility.
 */
export function Text({ variant = 'body', color, weight, align, style, maxFontSizeMultiplier = 1.3, ...rest }: Props) {
  // A fontSize override without its own lineHeight would inherit the variant's
  // (e.g. body's 22px) and clip large text, so derive a matching one.
  const override = StyleSheet.flatten(style);
  const fitLineHeight =
    override?.fontSize !== undefined && override.lineHeight === undefined
      ? { lineHeight: Math.round(override.fontSize * 1.3) }
      : null;
  return (
    <RNText
      style={[
        styles[variant],
        weight && { fontFamily: fonts[weight] },
        color !== undefined && { color },
        align && { textAlign: align },
        style,
        fitLineHeight,
      ]}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  h1: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 34, letterSpacing: -0.5, color: colors.textPrimary },
  h2: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: colors.textPrimary },
  h3: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 22, letterSpacing: -0.2, color: colors.textPrimary },
  title: { fontFamily: fonts.medium, fontSize: 16, letterSpacing: -0.2, color: colors.textPrimary },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  bodySm: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
  monoSm: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
});
