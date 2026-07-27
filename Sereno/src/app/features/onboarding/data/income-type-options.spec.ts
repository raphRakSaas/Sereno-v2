import {
  DEFAULT_INCOME_TYPE_ID,
  findIncomeTypeById,
  findIncomeTypeByLabel,
  ONBOARDING_INCOME_TYPE_OPTIONS,
  resolveIncomeTypeId,
} from './income-type-options';

describe('income-type-options', () => {
  it('should expose corrected income categories for onboarding', () => {
    const labels = ONBOARDING_INCOME_TYPE_OPTIONS.map((option) => option.label);
    expect(labels).toEqual([
      'Salaire',
      'Revenu entrepreneurial',
      'Freelance',
      'Allocation familiale (CAF)',
      'Pension / retraite',
      'Autre',
    ]);
  });

  it('should resolve income type id from a preset label', () => {
    expect(resolveIncomeTypeId('Salaire')).toBe('salary');
    expect(resolveIncomeTypeId('Revenu entrepreneurial')).toBe('entrepreneurial');
    expect(resolveIncomeTypeId('Mon revenu custom')).toBe('other');
  });

  it('should find preset income type by id and label', () => {
    expect(findIncomeTypeById('family-allowance')?.label).toBe('Allocation familiale (CAF)');
    expect(findIncomeTypeByLabel('Allocation familiale (CAF)')?.id).toBe('family-allowance');
    expect(findIncomeTypeByLabel('Revenu custom')).toBeUndefined();
  });

  it('should default to salary type', () => {
    expect(DEFAULT_INCOME_TYPE_ID).toBe('salary');
  });
});
