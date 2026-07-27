export const SERENO_BRAND = {
  /** Raster export (marketing) — UI uses the SVG icon + theme-aware wordmark. */
  fullLogoSrc: '/brand/sereno-logo.png',
  iconSrc: '/brand/sereno-icon.svg',
  name: 'Sereno',
} as const;

export type SerenoLogoVariant = 'full' | 'icon';
export type SerenoLogoSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const SERENO_LOGO_SIZE_CLASSES: Record<SerenoLogoSize, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14',
  xl: 'h-16',
  '2xl': 'h-20',
};

/** Wordmark next to the icon — scales with `SerenoLogoSize`. */
export const SERENO_WORDMARK_SIZE_CLASSES: Record<SerenoLogoSize, string> = {
  sm: 'text-lg leading-none',
  md: 'text-xl leading-none',
  lg: 'text-2xl leading-none',
  xl: 'text-3xl leading-none',
  '2xl': 'text-4xl leading-none',
};
