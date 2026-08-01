import { Category } from '../models/category.model';
import { SERENO_COLORS } from '../../shared/brand/sereno-colors';

export const SYSTEM_CATEGORIES: Category[] = [
  {
    id: 'cat-housing',
    name: 'Logement',
    icon: 'home',
    color: SERENO_COLORS.accent,
    isSystem: true,
  },
  {
    id: 'cat-groceries',
    name: 'Courses',
    icon: 'shopping_bag',
    color: SERENO_COLORS.income,
    isSystem: true,
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    icon: 'directions_car',
    color: SERENO_COLORS.accentLight,
    isSystem: true,
  },
  {
    id: 'cat-restaurants',
    name: 'Restaurants',
    icon: 'restaurant',
    color: SERENO_COLORS.incomeLight,
    isSystem: true,
  },
  {
    id: 'cat-health',
    name: 'Santé',
    icon: 'medication',
    color: SERENO_COLORS.accentDeep,
    isSystem: true,
  },
  {
    id: 'cat-leisure',
    name: 'Loisirs',
    icon: 'celebration',
    color: SERENO_COLORS.income,
    isSystem: true,
  },
  {
    id: 'cat-subscriptions',
    name: 'Abonnements',
    icon: 'music_note',
    color: SERENO_COLORS.accentLight,
    isSystem: true,
  },
  {
    id: 'cat-income',
    name: 'Revenu',
    icon: 'payments',
    color: SERENO_COLORS.income,
    isSystem: true,
  },
];

export const ONBOARDING_BUDGET_CATEGORY_IDS = [
  'cat-housing',
  'cat-groceries',
  'cat-transport',
  'cat-restaurants',
  'cat-leisure',
] as const;
