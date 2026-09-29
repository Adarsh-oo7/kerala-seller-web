import { BRAND } from './lib/brand';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/profile/', '/checkout', '/cart', '/api/'],
    },
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}
