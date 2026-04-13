export const FONT_FAMILY = {
  // Body + UI — Nunito throughout
  heading: 'Nunito_800ExtraBold',
  buttonLabel: 'Nunito_700Bold',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_500Medium',
  bodySemiBold: 'Nunito_600SemiBold',

  // Wordmark only
  wordmark: 'Comfortaa_700Bold',
} as const;

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const LINE_HEIGHT = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 26,
  xl: 28,
  '2xl': 32,
  '3xl': 38,
  '4xl': 44,
} as const;

export const TEXT_STYLES = {
  h1: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE['4xl'],
    lineHeight: LINE_HEIGHT['4xl'],
  },
  h2: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE['3xl'],
    lineHeight: LINE_HEIGHT['3xl'],
  },
  h3: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE['2xl'],
    lineHeight: LINE_HEIGHT['2xl'],
  },
  body: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.base,
    lineHeight: LINE_HEIGHT.base,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY.bodyMedium,
    fontSize: FONT_SIZE.base,
    lineHeight: LINE_HEIGHT.base,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.sm,
  },
  label: {
    fontFamily: FONT_FAMILY.bodyMedium,
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.sm,
  },
  button: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: FONT_SIZE.base,
    lineHeight: LINE_HEIGHT.base,
  },
  caption: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.xs,
    lineHeight: LINE_HEIGHT.xs,
  },
} as const;
