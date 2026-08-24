export function isIndianMobile(value) {
  return /^[6-9]\d{9}$/.test(String(value || '').trim());
}

function queryValue(searchParams, key) {
  if (!searchParams) return '';
  if (typeof searchParams.get === 'function') return searchParams.get(key) || '';
  const value = searchParams[key];
  return Array.isArray(value) ? (value[0] || '') : (value || '');
}

export function publicShopApiIdentifier(shopSlug, searchParams) {
  const slug = String(shopSlug || '').trim();
  if (slug && !isIndianMobile(slug)) return slug;
  if (isIndianMobile(slug)) return slug;
  const fromQuery = String(queryValue(searchParams, 'id')).trim();
  if (isIndianMobile(fromQuery)) return fromQuery;
  return slug || null;
}

export function shopNameSlug(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function shopMatchesSlug(shop, slug) {
  const wanted = String(slug || '').trim();
  if (!wanted || !shop) return false;
  if (shop.store_slug && String(shop.store_slug) === wanted) return true;
  const base = shopNameSlug(shop.name);
  return Boolean(base) && (wanted === base || wanted.startsWith(`${base}-`));
}

export function shopListPhone(shop) {
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

export function shopCartKey(store, shopSlug, searchParams) {
  const phone = shopListPhone(store) || queryValue(searchParams, 'id');
  if (isIndianMobile(phone)) return phone;
  const slug = String(shopSlug || '').trim();
  if (isIndianMobile(slug)) return slug;
  return phone || slug || '';
}

export async function fetchPublicShop(axios, apiBase, shopSlug, searchParams, signal) {
  const tried = new Set();

  const getShop = async (id) => {
    const key = String(id || '').trim();
    if (!key || tried.has(key)) return null;
    tried.add(key);
    try {
      const response = await axios.get(`${apiBase}/shop/${encodeURIComponent(key)}/`, {
        signal,
        timeout: 15000,
      });
      return response.data ? response : null;
    } catch (error) {
      if (axios.isCancel?.(error) || error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
        throw error;
      }
      if (error.response?.status === 404) return null;
      throw error;
    }
  };

  let response = await getShop(publicShopApiIdentifier(shopSlug, searchParams));
  if (!response && shopSlug) {
    const queries = [
      { search: String(shopSlug).replace(/-/g, ' '), page_size: 50 },
      { page_size: 50 },
    ];
    for (const params of queries) {
      try {
        const listResponse = await axios.get(`${apiBase}/shops/`, {
          signal,
          timeout: 15000,
          params,
        });
        const shops = Array.isArray(listResponse.data)
          ? listResponse.data
          : listResponse.data?.results || [];
        const match = shops.find((shop) => shopMatchesSlug(shop, shopSlug));
        response = await getShop(shopListPhone(match));
        if (response) break;
      } catch (error) {
        if (axios.isCancel?.(error) || error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
          throw error;
        }
      }
    }
  }
  if (!response && searchParams) {
    const fromQuery = typeof searchParams.get === 'function'
      ? searchParams.get('id')
      : searchParams.id;
    response = await getShop(fromQuery);
  }
  return response;
}
