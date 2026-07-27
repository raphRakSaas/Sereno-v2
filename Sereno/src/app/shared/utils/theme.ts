import { ThemePreference } from '../../core/models/settings.model';

/** Résout system → light | dark selon le navigateur. */
export function resolveThemePreference(
  theme: ThemePreference,
  prefersDark = false,
): 'light' | 'dark' {
  if (theme === 'system') {
    return prefersDark ? 'dark' : 'light';
  }
  return theme;
}

/** Applique la classe `dark` sur <html> (no-op hors navigateur). */
export function applyThemeClass(
  theme: ThemePreference,
  documentRef: Document | null,
  matchMediaFn?: (query: string) => MediaQueryList,
): 'light' | 'dark' {
  const prefersDark = Boolean(matchMediaFn?.('(prefers-color-scheme: dark)').matches);
  const resolved = resolveThemePreference(theme, prefersDark);

  if (documentRef?.documentElement) {
    documentRef.documentElement.classList.toggle('dark', resolved === 'dark');
    documentRef.documentElement.dataset['theme'] = resolved;
  }

  return resolved;
}
