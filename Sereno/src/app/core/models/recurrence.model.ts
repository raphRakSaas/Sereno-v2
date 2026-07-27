import { TransactionType } from './transaction.model';

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'yearly';

export interface Recurrence {
  id: string;
  type: TransactionType;
  amountInCents: number;
  categoryId: string;
  note: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  lastGeneratedAt?: string;
  isPaused: boolean;
  createdAt: string;
  updatedAt: string;
}
