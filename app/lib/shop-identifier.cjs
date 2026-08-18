'use strict';

function isIndianMobile(value) {
  return /^[6-9]\d{9}$/.test(String(value || '').trim());
}

function queryValue(searchParams, key) {
  if (!searchParams) return '';
  if (typeof searchParams.get === 'function') return searchParams.get(key) || '';
  const value = searchParams[key];
  return Array.isArray(value) ? (value[0] || '') : (value || '');
}

function publicShopApiIdentifier(shopSlug, searchParams) {
  const slug = String(shopSlug || '').trim();
  if (slug && !isIndianMobile(slug)) return slug;
  if (isIndianMobile(slug)) return slug;
  const fromQuery = String(queryValue(searchParams, 'id')).trim();
  if (isIndianMobile(fromQuery)) return fromQuery;
  return slug || null;
}

function canonicalShopHref(storeSlug, shopSlug) {
  const slug = String(storeSlug || shopSlug || '').trim().replace(/^\/+|\/+$/g, '');
  if (!slug) return 'https://keralasellers.in/shop';
  return `https://keralasellers.in/shop/${slug}`;
}

function shopNameSlug(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function shopMatchesSlug(shop, slug) {
  const wanted = String(slug || '').trim();
  if (!wanted || !shop) return false;
  if (shop.store_slug && String(shop.store_slug) === wanted) return true;
  const base = shopNameSlug(shop.name);
  return Boolean(base) && (wanted === base || wanted.startsWith(`${base}-`));
}

function shopListPhone(shop) {
  if (!shop) return '';
  return String(
    shop.seller_phone
    || shop.seller?.phone
    || shop.phone
    || shop.whatsapp_number
    || shop.whatsappnumber
    || '',
  ).trim();
}

module.exports = {
  canonicalShopHref,
  isIndianMobile,
  publicShopApiIdentifier,
  shopListPhone,
  shopMatchesSlug,
  shopNameSlug,
};
