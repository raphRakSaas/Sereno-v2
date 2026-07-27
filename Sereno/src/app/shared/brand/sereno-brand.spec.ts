import { describe, expect, it } from 'vitest';
import { SERENO_BRAND } from './sereno-brand';

describe('sereno-brand', () => {
  it('should expose stable brand asset paths', () => {
    expect(SERENO_BRAND.fullLogoSrc).toBe('/brand/sereno-logo.png');
    expect(SERENO_BRAND.iconSrc).toBe('/brand/sereno-icon.svg');
    expect(SERENO_BRAND.name).toBe('Sereno');
  });
});
