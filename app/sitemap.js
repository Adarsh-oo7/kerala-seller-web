import { BRAND } from './lib/brand';

export default function sitemap() {
  const now = new Date();
  const weekly = 'weekly';
  const monthly = 'monthly';
  const daily = 'daily';

  return [
    // ── Core seller-facing pages ──
    { url: `${BRAND.url}/`,                    lastModified: now, changeFrequency: weekly,  priority: 1.0 },
    { url: `${BRAND.url}/sell-online-kerala`,  lastModified: now, changeFrequency: weekly,  priority: 0.95 },
    { url: `${BRAND.url}/register/seller`,     lastModified: now, changeFrequency: monthly, priority: 0.85 },

    // ── Buyer-facing product pages ──
    { url: `${BRAND.url}/products`,            lastModified: now, changeFrequency: daily,   priority: 0.9 },
    { url: `${BRAND.url}/shop`,                lastModified: now, changeFrequency: daily,   priority: 0.8 },

    // ── Brand / info pages ──
    { url: `${BRAND.url}/about`,               lastModified: now, changeFrequency: monthly, priority: 0.7 },
    { url: `${BRAND.url}/contact`,             lastModified: now, changeFrequency: monthly, priority: 0.65 },

    // ── Legal pages (low priority but indexed) ──
    { url: `${BRAND.url}/privacy-policy`,          lastModified: now, changeFrequency: monthly, priority: 0.3 },
    { url: `${BRAND.url}/terms-and-conditions`,    lastModified: now, changeFrequency: monthly, priority: 0.3 },
    { url: `${BRAND.url}/cancellation-refund`,     lastModified: now, changeFrequency: monthly, priority: 0.3 },
    { url: `${BRAND.url}/shipping-delivery`,       lastModified: now, changeFrequency: monthly, priority: 0.3 },
  ];
}
