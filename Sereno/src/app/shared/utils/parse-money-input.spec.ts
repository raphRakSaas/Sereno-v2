import { formatMoneyInput, parseMoneyInput } from './parse-money-input';

describe('parseMoneyInput', () => {
  it('should parse French decimal input', () => {
    expect(parseMoneyInput('1234,56')).toBe(123456);
  });

  it('should parse input with thin spaces', () => {
    expect(parseMoneyInput('1 234,56')).toBe(123456);
  });

  it('should return null for empty input', () => {
    expect(parseMoneyInput('')).toBeNull();
  });

  it('should return null for invalid input', () => {
    expect(parseMoneyInput('abc')).toBeNull();
  });
});

describe('formatMoneyInput', () => {
  it('should format cents for input fields', () => {
    expect(formatMoneyInput(123456)).toBe('1234,56');
  });
});
