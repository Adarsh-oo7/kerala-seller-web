import { BRAND } from './lib/brand';

export default function sitemap() {
  const now = new Date();

  return [
    // ── Core seller-facing pages ──
    { url: `${BRAND.url}/`,                              lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BRAND.url}/sell-online-kerala`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BRAND.url}/sell-online`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },  // redirects to /sell-online-kerala
    { url: `${BRAND.url}/register/seller`,               lastModified: now, changeFrequency: 'monthly', priority: 0.85 },

    // ── Solutions & Features hub ──
    { url: `${BRAND.url}/solutions`,                     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BRAND.url}/features`,                      lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },

    // ── Seller persona pages ──
    { url: `${BRAND.url}/for/instagram-sellers`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BRAND.url}/for/whatsapp-sellers`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BRAND.url}/for/social-media-sellers`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BRAND.url}/for/small-businesses`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BRAND.url}/for/home-businesses`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },

    // ── Feature pages ──
    { url: `${BRAND.url}/features/online-store-builder`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BRAND.url}/features/pos-billing-software`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BRAND.url}/features/order-management`,     lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BRAND.url}/features/inventory-management`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },

    // ── FAQ ──
    { url: `${BRAND.url}/faq`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.75 },

    // ── Buyer-facing product pages ──
    { url: `${BRAND.url}/products`,                      lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BRAND.url}/shop`,                          lastModified: now, changeFrequency: 'daily',   priority: 0.8 },

    // ── Brand / info pages ──
    { url: `${BRAND.url}/about`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BRAND.url}/contact`,                       lastModified: now, changeFrequency: 'monthly', priority: 0.65 },

    // ── Legal pages ──
    { url: `${BRAND.url}/privacy-policy`,                lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BRAND.url}/terms-and-conditions`,          lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BRAND.url}/cancellation-refund`,           lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BRAND.url}/shipping-delivery`,             lastModified: now, changeFrequency: 'monthly', priority: 0.3 },

    // ── Malayalam pages (Phase 2 — noindex drafts, not in sitemap until approved) ──
    // Excluded until native review complete. Add back when noindex removed.
  ];
}
