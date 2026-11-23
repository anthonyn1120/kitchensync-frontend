// Design tokens ported 1:1 from the HTML mockups' :root variables.

export const colors = {
  envBg: '#f5f6f4',
  envBlob1: '#6b7a57', // olive
  envBlob2: '#4a5c6a', // slate
  envBlob3: '#8c7a6b', // clay

  glassBgPrimary: 'rgba(75, 85, 75, 0.55)',
  glassBgSecondary: 'rgba(60, 70, 60, 0.4)',
  glassBorderLight: 'rgba(255, 255, 255, 0.25)',
  glassBorderDim: 'rgba(255, 255, 255, 0.05)',

  controlBg: 'rgba(20, 25, 20, 0.45)',
  controlBgPressed: 'rgba(10, 15, 10, 0.6)',
  controlBorder: 'rgba(255, 255, 255, 0.12)',

  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.6)', // mockup uses 0.45; raised for legibility on the light background

  accentMatch: '#a3c481',
  accentMatchSoft: 'rgba(163, 196, 129, 0.15)',
  accentDanger: '#e27d60',

  white05: 'rgba(255,255,255,0.05)',
  white08: 'rgba(255,255,255,0.08)',
  white10: 'rgba(255,255,255,0.1)',
  white12: 'rgba(255,255,255,0.12)',
  white15: 'rgba(255,255,255,0.15)',
  black20: 'rgba(0,0,0,0.2)',
  black30: 'rgba(0,0,0,0.3)',

  primaryButtonBg: 'rgba(255,255,255,0.95)',
  primaryButtonText: '#1a1a1a',
} as const;

export const radius = {
  panel: 40,
  card: 28,
  pill: 999,
  sm: 12,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Font family names registered in src/app/_layout.tsx via useFonts.
export const fonts = {
  light: 'Inter_300Light',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export const shadows = {
  contact: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  ambient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
} as const;

// Spring configs approximating the mockups' cubic-bezier "spring" curves (for reanimated withSpring).
export const springs = {
  gentle: { damping: 18, stiffness: 180, mass: 1 },
  bouncy: { damping: 12, stiffness: 200, mass: 0.9 },
} as const;
