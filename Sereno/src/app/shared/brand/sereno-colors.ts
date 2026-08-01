/**
 * Palette Sereno — bleu ciel & vert gazon.
 * Garder aligné avec les tokens `@theme` dans `src/styles.css`.
 */
export const SERENO_COLORS = {
  accent: '#2B7FD4',
  accentLight: '#6BB8E8',
  accentSurface: '#E8F3FC',
  accentDeep: '#1E6BB8',
  income: '#3D9A5F',
  incomeLight: '#7BC48A',
  incomeDeep: '#2D7A4A',
  /** Dépenses / déficit — bleu profond, calme (pas alarmant). */
  expense: '#1E5A8A',
  error: '#C45C5C',
} as const;

/** Rampe monochrome bleu → vert pour donuts et graphiques. */
export const SERENO_CHART_RAMP = [
  SERENO_COLORS.accent,
  SERENO_COLORS.income,
  SERENO_COLORS.accentLight,
  SERENO_COLORS.incomeLight,
] as const;

/** Couleurs pour graphiques en camembert (plus de nuances). */
export const SERENO_PIE_COLORS = [
  SERENO_COLORS.accent,
  SERENO_COLORS.income,
  SERENO_COLORS.accentLight,
  SERENO_COLORS.incomeLight,
  SERENO_COLORS.accentDeep,
  SERENO_COLORS.incomeDeep,
] as const;
