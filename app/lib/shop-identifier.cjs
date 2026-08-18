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

module.exports = {
  canonicalShopHref,
  isIndianMobile,
  publicShopApiIdentifier,
};
