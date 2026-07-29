/** SEO & Open Graph — mettre à jour `siteUrl` si le domaine de production change. */
export const SERENO_SEO = {
  siteUrl: 'https://sereno-v2-xi.vercel.app',
  /** Incrémenter après régénération des PNG dans `public/og/` pour invalider le cache des réseaux sociaux. */
  ogImageVersion: 2,
  title: 'Sereno — Gère ton budget en toute sérénité',
  description:
    'Sereno t’aide à voir clairement où va ton argent, sans jugement. Simple, local, sans compte ni connexion bancaire.',
  locale: 'fr_FR',
  ogImage: '/og/og-image.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Sereno — Gère ton budget en toute sérénité',
  twitterImage: '/og/og-image-twitter.png',
  twitterCard: 'summary_large_image' as const,
} as const;

export function serenoAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SERENO_SEO.siteUrl}${normalizedPath}`;
}

export function serenoOgImageUrl(imagePath: string): string {
  const separator = imagePath.includes('?') ? '&' : '?';
  return `${serenoAbsoluteUrl(imagePath)}${separator}v=${SERENO_SEO.ogImageVersion}`;
}
