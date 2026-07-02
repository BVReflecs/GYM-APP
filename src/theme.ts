/**
 * GymForge design system — dark, modern, high-contrast.
 * A single source of truth for colors, spacing, radii and typography
 * so every screen feels like part of the same product.
 */

export const colors = {
  // Backgrounds
  bg: '#0B0F14',
  surface: '#141A21',
  surfaceAlt: '#1C242E',
  border: '#27303B',

  // Brand / accent
  primary: '#FF5A3C', // energetic orange-red
  primaryDim: '#3A2019',
  accent: '#37D67A', // success / progress green
  accentDim: '#12301F',
  info: '#4EA8FF',

  // Text
  text: '#F5F7FA',
  textMuted: '#9AA7B4',
  textFaint: '#5C6B7A',

  // Feedback
  danger: '#FF4D4D',
  warning: '#FFB020',
  gold: '#FFC93C',
} as const;

/** Colors used to tag each muscle group consistently across the app. */
export const muscleColors: Record<string, string> = {
  Pecho: '#FF5A3C',
  Espalda: '#4EA8FF',
  Piernas: '#37D67A',
  Hombros: '#FFB020',
  Bíceps: '#B07CFF',
  Tríceps: '#FF7AC6',
  Core: '#FFC93C',
  Glúteos: '#2DD4BF',
  Cardio: '#FF4D4D',
  'Cuerpo completo': '#9AA7B4',
};

export const goalColors: Record<string, string> = {
  lose_weight: '#4EA8FF',
  endurance: '#37D67A',
  bulk: '#FF5A3C',
  strength: '#FFB020',
  general: '#B07CFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
} as const;

export const font = {
  h1: { fontSize: 30, fontWeight: '800' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '500' as const, color: colors.text },
  bodyMuted: { fontSize: 15, fontWeight: '500' as const, color: colors.textMuted },
  small: { fontSize: 13, fontWeight: '600' as const, color: colors.textMuted },
  tiny: { fontSize: 11, fontWeight: '700' as const, color: colors.textFaint },
};
