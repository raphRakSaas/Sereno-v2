export const SERENO_DB_NAME = 'sereno';
export const SERENO_DB_VERSION = 1;

export const SERENO_STORES = {
  categories: 'categories',
  transactions: 'transactions',
  budgets: 'budgets',
  settings: 'settings',
} as const;

export type SerenoStoreName = (typeof SERENO_STORES)[keyof typeof SERENO_STORES];
