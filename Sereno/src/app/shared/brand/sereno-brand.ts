export const SERENO_BRAND = {
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
