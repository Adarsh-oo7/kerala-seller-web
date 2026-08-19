export function sanitizeBarcode(value) {
  return String(value || '').toUpperCase().replace(/[^0-9A-Z. $/+%*-]/g, '').trim();
}

export function storedBarcode(value) {
  return String(value || '').trim();
}

export function generateShopBarcode(taken = []) {
  const used = new Set(Array.from(taken, (item) => sanitizeBarcode(item)));
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const stamp = Date.now().toString(36).toUpperCase().replace(/[^0-9A-Z]/g, '');
    const rand = Math.floor(Math.random() * 900 + 100).toString();
    const code = sanitizeBarcode(`KS${stamp}${rand}`).slice(0, 12);
    if (code.length >= 8 && !used.has(code)) return code;
  }
  return sanitizeBarcode(`KS${Date.now()}`);
}

export function codesFromProduct(product) {
  return [
    product?.barcode,
    product?.sku,
    ...(product?.variants || []).flatMap((variant) => [variant.barcode, variant.sku]),
  ]
    .filter((value) => Boolean(value && String(value).trim()))
    .map((value) => String(value).trim().toLowerCase());
}

export function findProductByCode(products, raw) {
  const code = String(raw || '').trim().toLowerCase();
  if (!code) return null;
  for (const product of products || []) {
    for (const variant of product.variants || []) {
      if ((variant.barcode || '').toLowerCase() === code || (variant.sku || '').toLowerCase() === code) {
        return { product, variant };
      }
    }
    if ((product.barcode || '').toLowerCase() === code || (product.sku || '').toLowerCase() === code) {
      return { product };
    }
  }
  return null;
}
