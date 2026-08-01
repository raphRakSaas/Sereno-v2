import { describe, expect, it } from 'vitest';
import { SERENO_CHART_RAMP, SERENO_COLORS, SERENO_PIE_COLORS } from './sereno-colors';

describe('sereno-colors', () => {
  it('should expose sky-blue accent and grass-green income tokens', () => {
    expect(SERENO_COLORS.accent).toBe('#2B7FD4');
    expect(SERENO_COLORS.income).toBe('#3D9A5F');
  });

  it('should build chart ramps from brand colors only', () => {
    expect(SERENO_CHART_RAMP).toEqual([
      SERENO_COLORS.accent,
      SERENO_COLORS.income,
      SERENO_COLORS.accentLight,
      SERENO_COLORS.incomeLight,
    ]);
    expect(SERENO_PIE_COLORS.length).toBeGreaterThanOrEqual(4);
  });
});
