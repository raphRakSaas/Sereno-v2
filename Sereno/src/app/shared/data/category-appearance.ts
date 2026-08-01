import { SERENO_COLORS } from '../brand/sereno-colors';

/** Icônes Material Symbols proposées à la création d'une catégorie. */
export const CATEGORY_ICON_OPTIONS = [
  'shopping_bag',
  'home',
  'directions_car',
  'restaurant',
  'medication',
  'celebration',
  'music_note',
  'payments',
  'fitness_center',
  'school',
  'pets',
  'flight_takeoff',
  'smartphone',
  'local_cafe',
  'checkroom',
  'child_care',
] as const;

/** Palette de couleurs pour les catégories personnalisées. */
export const CATEGORY_COLOR_OPTIONS = [
  SERENO_COLORS.accent,
  SERENO_COLORS.accentLight,
  SERENO_COLORS.income,
  SERENO_COLORS.incomeLight,
  SERENO_COLORS.accentDeep,
  SERENO_COLORS.incomeDeep,
  '#E8A838',
  '#6B7FD7',
  '#9B59B6',
  '#34495E',
] as const;

export const GOAL_ICON_OPTIONS = [
  'flag',
  'flight_takeoff',
  'home',
  'directions_car',
  'school',
  'savings',
  'celebration',
  'favorite',
] as const;
