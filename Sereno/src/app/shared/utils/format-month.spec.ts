import { formatMonthLabel, shiftMonth } from './format-month';

describe('formatMonthLabel', () => {
  it('should format a French month label', () => {
    expect(formatMonthLabel(2026, 6)).toBe('Juillet 2026');
  });
});

describe('shiftMonth', () => {
  it('should move to the next month', () => {
    expect(shiftMonth(2026, 6, 1)).toEqual({ year: 2026, monthIndex: 7 });
  });

  it('should move to the previous year when crossing January', () => {
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, monthIndex: 11 });
  });
});
