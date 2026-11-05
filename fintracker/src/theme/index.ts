import { Platform, type TextStyle } from 'react-native';

/** Colour tokens, taken from the fintracker design canvas. */
export const colors = {
  forest: '#0B3D2C',
  forestDeep: '#0E4A35',
  emerald: '#0E7A4D',
  emeraldSoft: '#5FAE86',
  teal: '#0F766E',
  lime: '#D4F06A',
  limeInk: '#4D6B0F',
  mint: '#E3F4EA',
  mintStrong: '#BFE3CF',
  mist: '#F4F7F5',
  track: '#E5ECE8',
  surface: '#FFFFFF',
  ink: '#0F1A14',
  body: '#3D4A43',
  muted: '#5C6B63',
  placeholder: '#66756D',
  border: '#E3EAE6',
  borderStrong: '#D5E0DA',
  divider: '#EDF1EF',
  onDark: '#FFFFFF',
  onDarkMuted: '#A7D7BF',
  warning: '#B45309',
  danger: '#C2410C',
  dangerSoft: '#FCE9DF',
  dangerBorder: '#F2C9B5',
  switchOff: '#B7C6BE',
  scrim: 'rgba(15, 26, 20, 0.45)',
} as const;

export type ToneKey = 'mint' | 'lime' | 'teal' | 'brand';

/** Background / icon colour pairs used for category and wallet tiles. */
export const tones: Record<ToneKey, { bg: string; fg: string }> = {
  mint: { bg: '#E3F4EA', fg: '#0E7A4D' },
  lime: { bg: '#F1F9D2', fg: '#4D6B0F' },
  teal: { bg: '#DDF3F0', fg: '#0F766E' },
  brand: { bg: '#D4F06A', fg: '#0B3D2C' },
};

export const radius = { sm: 12, md: 16, lg: 20, xl: 24, xxl: 28, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

/** Outfit faces, loaded in the root layout. */
export const fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;

export type Weight = keyof typeof fonts;

export const type = {
  display: { fontFamily: fonts.semibold, fontSize: 40, letterSpacing: -0.8, lineHeight: 44 },
  h1: { fontFamily: fonts.semibold, fontSize: 30, letterSpacing: -0.6, lineHeight: 36 },
  h2: { fontFamily: fonts.semibold, fontSize: 28, letterSpacing: -0.3, lineHeight: 34 },
  title: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24 },
  subtitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const shadow = {
  card: Platform.select({
    web: { boxShadow: '0 10px 24px rgba(11, 61, 44, 0.10)' },
    default: {
      shadowColor: '#0B3D2C',
      shadowOpacity: 0.1,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
  }),
  button: Platform.select({
    web: { boxShadow: '0 8px 20px rgba(14, 122, 77, 0.28)' },
    default: {
      shadowColor: '#0E7A4D',
      shadowOpacity: 0.28,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  }),
  soft: Platform.select({
    web: { boxShadow: '0 1px 3px rgba(11, 61, 44, 0.14)' },
    default: {
      shadowColor: '#0B3D2C',
      shadowOpacity: 0.14,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
  }),
};

/** Shared spring presets so motion feels the same everywhere. */
export const springs = {
  snappy: { damping: 18, stiffness: 260, mass: 0.8 },
  gentle: { damping: 20, stiffness: 140 },
  bouncy: { damping: 11, stiffness: 220 },
} as const;
