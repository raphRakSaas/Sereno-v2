export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amountInCents: number;
  date: string;
  categoryId: string;
  note: string;
  receiptId?: string;
  recurrenceId?: string;
  /** Objectif d'épargne alimenté par cette transaction (contribution manuelle liée). */
  goalId?: string;
  createdAt: string;
  updatedAt: string;
}
