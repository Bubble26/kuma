export const COLORS = {
  // Onboarding (dark mode)
  navy: '#1B2A4A',
  navyDark: '#162340',
  navyExtraDark: '#0f1528',
  cream: '#FFF8F0',
  amber: '#D4890E',

  // Semantic
  safe: '#4CAF50',
  safeLight: '#E8F5E9',
  caution: '#F5B041',
  cautionLight: '#FFF3E0',
  danger: '#E57373',
  dangerLight: '#FFF0F0',

  // In-app (light mode — post-paywall)
  appBackground: '#FFF8F0',
  cardBackground: '#FFFFFF',
  textPrimary: '#1B2A4A',
  textSecondary: '#666666',
  textMuted: '#999999',

  // Tab bar
  tabBarBackground: '#D4890E',
  tabBarActive: '#FFF8F0',
  tabBarInactive: 'rgba(27, 42, 74, 0.45)',

  // Accents
  coral: '#E57373',
  coralLight: '#FFF0F0',
  golden: '#F5B041',
  softGold: '#FFD98E',
  blueAccent: '#64B5F6',

  // Overlays & borders
  overlay: 'rgba(0, 0, 0, 0.5)',
  border: 'rgba(255, 248, 240, 0.12)',
  borderLight: 'rgba(27, 42, 74, 0.08)',

  // Glow effects
  amberGlow: 'rgba(212, 137, 14, 0.3)',
  safeGlow: 'rgba(76, 175, 80, 0.3)',

  // Transparent helpers
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof COLORS;
