export interface GoalContribution {
  id: string;
  amountInCents: number;
  date: string;
  /** Si la contribution vient d'une transaction, on peut la synchroniser à la suppression. */
  transactionId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmountInCents: number;
  targetDate?: string;
  icon: string;
  createdAt: string;
  contributions: GoalContribution[];
  completedAt?: string;
}
