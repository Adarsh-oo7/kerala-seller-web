import { BRAND } from './lib/brand';

const CONTENT_UPDATED = new Date('2026-10-20');
const LEGAL_UPDATED = new Date('2026-09-01');

export default function sitemap() {
  const now = new Date();

  return [
    // ── Core seller-facing pages ──
    { url: `${BRAND.url}/`,                              lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BRAND.url}/sell-online-kerala`,            lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BRAND.url}/register/seller`,               lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BRAND.url}/list-your-business-kerala`,     lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.85 },

    // ── Features hub ──
    { url: `${BRAND.url}/features`,                      lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BRAND.url}/mobile-app`,                    lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.9 },

    // ── Seller persona pages ──
    { url: `${BRAND.url}/for/instagram-sellers`,         lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BRAND.url}/for/whatsapp-sellers`,          lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BRAND.url}/for/social-media-sellers`,      lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BRAND.url}/for/small-businesses`,          lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BRAND.url}/for/home-businesses`,           lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BRAND.url}/for/resellers`,                 lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.8 },

    // ── Feature pages ──
    { url: `${BRAND.url}/features/online-store-builder`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BRAND.url}/features/pos-billing-software`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BRAND.url}/features/order-management`,     lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BRAND.url}/features/inventory-management`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.75 },

    // ── FAQ ──
    { url: `${BRAND.url}/faq`,                           lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.75 },

    // ── Buyer-facing pages (live catalogue data) ──
    { url: `${BRAND.url}/products`,                      lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BRAND.url}/shop`,                          lastModified: now, changeFrequency: 'daily',   priority: 0.8 },

    // ── Brand / info pages ──
    { url: `${BRAND.url}/about`,                         lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BRAND.url}/about/project-development`,     lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BRAND.url}/contact`,                       lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.65 },

    // ── Legal pages ──
    { url: `${BRAND.url}/privacy-policy`,                lastModified: LEGAL_UPDATED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BRAND.url}/terms-and-conditions`,          lastModified: LEGAL_UPDATED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BRAND.url}/cancellation-refund`,           lastModified: LEGAL_UPDATED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BRAND.url}/shipping-delivery`,             lastModified: LEGAL_UPDATED, changeFrequency: 'yearly', priority: 0.3 },

    // ── Malayalam pages (മലയാളം SEO) ──
    { url: `${BRAND.url}/ml`,                            lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BRAND.url}/ml/online-vilpana`,             lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BRAND.url}/ml/instagram-vilpanakkar`,      lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BRAND.url}/ml/whatsapp-vilpanakkar`,       lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BRAND.url}/ml/veetu-business`,             lastModified: CONTENT_UPDATED, changeFrequency: 'weekly',  priority: 0.85 },
  ];
}
