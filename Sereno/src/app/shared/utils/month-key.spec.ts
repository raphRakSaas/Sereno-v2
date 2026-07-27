import { getCurrentMonthKey, isDateInMonth } from './month-key';

describe('getCurrentMonthKey', () => {
  it('should format month key as YYYY-MM', () => {
    expect(getCurrentMonthKey(new Date(2026, 6, 15))).toBe('2026-07');
  });
});

describe('isDateInMonth', () => {
  it('should match dates in the same month', () => {
    expect(isDateInMonth('2026-07-12', '2026-07')).toBe(true);
    expect(isDateInMonth('2026-06-30', '2026-07')).toBe(false);
  });
});
