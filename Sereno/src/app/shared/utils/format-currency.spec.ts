import { calculateProgressPercent, formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('should format positive amounts in French locale', () => {
    expect(formatCurrency(123456)).toBe('1\u202f234,56\u00a0€');
  });

  it('should format negative amounts with a minus sign', () => {
    expect(formatCurrency(-6420)).toBe('-64,20\u00a0€');
  });

  it('should prefix positive amounts with plus when showSign is true', () => {
    expect(formatCurrency(345000, { showSign: true })).toBe('+3\u202f450,00\u00a0€');
  });
});

describe('calculateProgressPercent', () => {
  it('should return 0 when total is zero', () => {
    expect(calculateProgressPercent(100, 0)).toBe(0);
  });

  it('should cap progress at 100 percent', () => {
    expect(calculateProgressPercent(60000, 50000)).toBe(100);
  });

  it('should calculate rounded progress', () => {
    expect(calculateProgressPercent(115000, 120000)).toBe(95.8);
  });
});
