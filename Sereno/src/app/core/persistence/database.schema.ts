export const SERENO_DB_NAME = 'sereno';
/** v2 : stores goals + recurrences + delete API. */
export const SERENO_DB_VERSION = 2;

export const SERENO_STORES = {
  categories: 'categories',
  transactions: 'transactions',
  budgets: 'budgets',
  settings: 'settings',
  goals: 'goals',
  recurrences: 'recurrences',
} as const;

export type SerenoStoreName = (typeof SERENO_STORES)[keyof typeof SERENO_STORES];
