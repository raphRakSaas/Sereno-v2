export interface IncomeTypeOption {
  id: string;
  label: string;
}

/** Catégories de revenu proposées à l’onboarding. */
export const ONBOARDING_INCOME_TYPE_OPTIONS: IncomeTypeOption[] = [
  { id: 'salary', label: 'Salaire' },
  { id: 'entrepreneurial', label: 'Revenu entrepreneurial' },
  { id: 'freelance', label: 'Freelance' },
  { id: 'family-allowance', label: 'Allocation familiale (CAF)' },
  { id: 'pension', label: 'Pension / retraite' },
  { id: 'other', label: 'Autre' },
];

export const DEFAULT_INCOME_TYPE_ID = 'salary';

export function findIncomeTypeById(typeId: string): IncomeTypeOption | undefined {
  return ONBOARDING_INCOME_TYPE_OPTIONS.find((option) => option.id === typeId);
}

export function findIncomeTypeByLabel(label: string): IncomeTypeOption | undefined {
  return ONBOARDING_INCOME_TYPE_OPTIONS.find(
    (option) => option.id !== 'other' && option.label === label,
  );
}

export function resolveIncomeTypeId(label: string): string {
  return findIncomeTypeByLabel(label)?.id ?? 'other';
}
