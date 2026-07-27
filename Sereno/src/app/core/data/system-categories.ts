import { Category } from '../models/category.model';

export const SYSTEM_CATEGORIES: Category[] = [
  {
    id: 'cat-housing',
    name: 'Logement',
    icon: 'home',
    color: '#FF4D6D',
    isSystem: true,
  },
  {
    id: 'cat-groceries',
    name: 'Courses',
    icon: 'shopping_bag',
    color: '#FF8095',
    isSystem: true,
  },
  {
    id: 'cat-transport',
    name: 'Transport',
    icon: 'directions_car',
    color: '#FFB3BF',
    isSystem: true,
  },
  {
    id: 'cat-restaurants',
    name: 'Restaurants',
    icon: 'restaurant',
    color: '#FFD9DF',
    isSystem: true,
  },
  {
    id: 'cat-health',
    name: 'Santé',
    icon: 'medication',
    color: '#17836B',
    isSystem: true,
  },
  {
    id: 'cat-leisure',
    name: 'Loisirs',
    icon: 'celebration',
    color: '#FF4D6D',
    isSystem: true,
  },
  {
    id: 'cat-subscriptions',
    name: 'Abonnements',
    icon: 'music_note',
    color: '#FF8095',
    isSystem: true,
  },
  {
    id: 'cat-income',
    name: 'Revenu',
    icon: 'payments',
    color: '#17836B',
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
