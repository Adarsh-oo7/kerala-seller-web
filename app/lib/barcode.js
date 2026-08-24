export function sanitizeBarcode(value) {
  return String(value || '').toUpperCase().replace(/[^0-9A-Z. $/+%*-]/g, '').trim();
}

export function storedBarcode(value) {
  return String(value || '').trim().replace(/^\*+|\*+$/g, '').replace(/\s+/g, '');
}

export function normalizeBarcode(value) {
  return storedBarcode(value).toLowerCase();
}

export function barcodeKeys(raw) {
  const code = normalizeBarcode(raw);
  if (!code) return [];
  const keys = [code];
  if (/^\d{12}$/.test(code)) keys.push(`0${code}`);
  if (/^\d{13}$/.test(code) && code.startsWith('0')) keys.push(code.slice(1));
  return keys;
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
    .map((value) => normalizeBarcode(value));
}

export function findProductByCode(products, raw) {
  const keys = new Set(barcodeKeys(raw));
  if (!keys.size) return null;
  for (const product of products || []) {
    for (const variant of product.variants || []) {
      if (keys.has(normalizeBarcode(variant.barcode || '')) || keys.has(normalizeBarcode(variant.sku || ''))) {
        return { product, variant };
      }
    }
    if (keys.has(normalizeBarcode(product.barcode || '')) || keys.has(normalizeBarcode(product.sku || ''))) {
      return { product };
    }
  }
  return null;
}
