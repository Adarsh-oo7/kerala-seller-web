'use strict';

function isOfflineListing(store, reason) {
  return reason === 'OFFLINE_ONLY_NO_CHECKOUT'
    || store?.store_mode === 'offline_only'
    || store?.fulfillment === 'in_store';
}

function shopRobotsContent({ indexable }) {
  return indexable === false ? 'noindex, nofollow' : 'index, follow';
}

function shopSeoCopy(store, products, reason) {
  const name = store?.name || 'Store';
  const count = Array.isArray(products) ? products.length : 0;
  if (isOfflineListing(store, reason)) {
    return {
      title: store.meta_title || `${name} | In-store shop in Kerala | Kerala Sellers`,
      description: store.meta_description || (
        `Visit ${name} in Kerala. Browse ${count} products in store. Online checkout is not available.`
      ),
    };
  }
  return {
    title: store.meta_title || `${name} | Shop in Kerala | Kerala Sellers`,
    description: store.meta_description || (
      store.description
        ? `${String(store.description).slice(0, 150)} Shop from ${name} in Kerala.`
        : `Shop ${count} products from ${name} on Kerala Sellers.`
    ),
  };
}

function generateShopStructuredData(store, products, shopSlug, { reason, canOrder } = {}) {
  if (!store) return null;
  const offline = isOfflineListing(store, reason);
  const url = `https://keralasellers.in/shop/${shopSlug}`;
  const availability = offline
    ? 'https://schema.org/InStoreOnly'
    : 'https://schema.org/InStock';
  const offers = (products || []).slice(0, 20).map((product) => ({
    '@type': 'Offer',
    name: product.name,
    url: `${url}/product/${product.id}`,
    price: product.price != null ? String(product.price) : undefined,
    priceCurrency: 'INR',
    availability,
  }));
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': offline ? 'LocalBusiness' : 'Store',
    additionalType: offline ? 'https://schema.org/Store' : undefined,
    name: store.name,
    description: shopSeoCopy(store, products, reason).description,
    url,
    telephone: store.whatsapp_number || undefined,
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Kerala',
      addressCountry: 'IN',
      streetAddress: store.address || store.seller_address || store.business_address || undefined,
    },
    hasOfferCatalog: offers.length ? {
      '@type': 'OfferCatalog',
      name: offline ? `${store.name} in-store catalogue` : `${store.name} products`,
      itemListElement: offers,
    } : undefined,
  };
  if (offline || canOrder === false) {
    structuredData.potentialAction = undefined;
  }
  return JSON.stringify(structuredData);
}

module.exports = {
  isOfflineListing,
  shopRobotsContent,
  shopSeoCopy,
  generateShopStructuredData,
};
