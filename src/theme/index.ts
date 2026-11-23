// Design tokens ported 1:1 from the HTML mockups' :root variables.

export const colors = {
  // Soft-matte look: cream page, deep forest green, terracotta accents. Panels are a light, barely-frosted
  // white instead of dark glass, so the old "glass" tokens keep their names but hold soft-light values.
  envBg: '#000000',
  envBlob1: '#000000', // sage mist
  envBlob2: '#000000', // pale sage
  envBlob3: '#000000', // warm clay tint

  glassBgPrimary: 'rgba(255, 255, 255, 0.82)',
  glassBgSecondary: 'rgba(232, 239, 233, 0.88)',
  sheetBg: 'rgba(251, 251, 248, 0.97)', // bottom sheets: nearly solid, nothing ghosting through
  glassBorderLight: 'rgba(34, 62, 53, 0.10)',
  glassBorderDim: 'rgba(34, 62, 53, 0.08)',

  controlBg: 'rgba(34, 62, 53, 0.06)',
  controlBgPressed: 'rgba(34, 62, 53, 0.12)',
  controlBorder: 'rgba(34, 62, 53, 0.14)',

  textPrimary: '#223E35',
  textSecondary: 'rgba(34, 62, 53, 0.74)',
  textTertiary: 'rgba(34, 62, 53, 0.58)',

  accentMatch: '#3D7A5F',
  accentMatchSoft: 'rgba(61, 122, 95, 0.12)',
  accentDanger: '#CF7153',

  // Formerly translucent whites over dark glass; now deep-green tints over light surfaces.
  white05: 'rgba(34,62,53,0.04)',
  white08: 'rgba(34,62,53,0.06)',
  white10: 'rgba(34,62,53,0.08)',
  white12: 'rgba(34,62,53,0.10)',
  white15: 'rgba(34,62,53,0.12)',
  black20: 'rgba(34,62,53,0.07)', // inset tracks/boxes: a gentle green tint on light surfaces (was a black tint on dark glass)
  black30: 'rgba(0,0,0,0.3)',

  // Text/icons drawn over photos stay white (the page text tokens are dark green now)
  onPhoto: '#FFFFFF',
  onPhotoDim: 'rgba(255,255,255,0.78)',

  primaryButtonBg: '#223E35',
  primaryButtonText: '#FFFFFF',
} as const;

export const radius = {
  panel: 28,
  card: 22,
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
  mono: 'Inter_500Medium',
  monoMedium: 'Inter_600SemiBold',
  // Headlines (web uses the system Georgia, same face as the pitch deck)
  serif: 'Georgia, "Times New Roman", serif',
} as const;

export const shadows = {
  // Soft, green-tinted drop shadows so cards lift off the cream page.
  contact: {
    shadowColor: '#223E35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },
  ambient: {
    shadowColor: '#223E35',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
  },
  // The main kitchen card: the deepest shadow.
  card: {
    shadowColor: '#223E35',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 34,
  },
} as const;

// Spring configs approximating the mockups' cubic-bezier "spring" curves (for reanimated withSpring).
export const springs = {
  gentle: { damping: 18, stiffness: 180, mass: 1 },
  bouncy: { damping: 12, stiffness: 200, mass: 0.9 },
} as const;
