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
  createdAt: string;
  updatedAt: string;
}
