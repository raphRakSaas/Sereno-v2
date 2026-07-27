import { describe, expect, it } from 'vitest';
import { applyThemeClass, resolveThemePreference } from './theme';

describe('resolveThemePreference', () => {
  it('should resolve system to dark when OS prefers dark', () => {
    expect(resolveThemePreference('system', true)).toBe('dark');
  });

  it('should resolve system to light when OS prefers light', () => {
    expect(resolveThemePreference('system', false)).toBe('light');
  });

  it('should keep explicit light/dark', () => {
    expect(resolveThemePreference('light', true)).toBe('light');
    expect(resolveThemePreference('dark', false)).toBe('dark');
  });
});

describe('applyThemeClass', () => {
  it('should toggle dark class on documentElement', () => {
    const documentElement = document.createElement('html');
    const fakeDocument = { documentElement } as unknown as Document;

    applyThemeClass('dark', fakeDocument, () => ({ matches: false }) as MediaQueryList);
    expect(documentElement.classList.contains('dark')).toBe(true);

    applyThemeClass('light', fakeDocument, () => ({ matches: true }) as MediaQueryList);
    expect(documentElement.classList.contains('dark')).toBe(false);
  });
});
