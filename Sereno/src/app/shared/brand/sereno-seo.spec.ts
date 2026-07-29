import { describe, expect, it } from 'vitest';
import { SERENO_SEO, serenoAbsoluteUrl } from './sereno-seo';

describe('sereno-seo', () => {
  it('expose les métadonnées Open Graph principales', () => {
    expect(SERENO_SEO.ogImage).toBe('/og/og-image.png');
    expect(SERENO_SEO.ogImageWidth).toBe(1200);
    expect(SERENO_SEO.ogImageHeight).toBe(630);
    expect(SERENO_SEO.twitterCard).toBe('summary_large_image');
  });

  it('construit une URL absolue à partir du siteUrl', () => {
    expect(serenoAbsoluteUrl('/og/og-image.png')).toBe(
      'https://sereno-v2-xi.vercel.app/og/og-image.png',
    );
    expect(serenoAbsoluteUrl('og/og-image-twitter.png')).toBe(
      'https://sereno-v2-xi.vercel.app/og/og-image-twitter.png',
    );
  });
});
