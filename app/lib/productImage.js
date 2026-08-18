export const PRODUCT_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#F3F6F5"/>
  <rect x="118" y="108" width="164" height="184" rx="18" fill="#175E54" opacity="0.12"/>
  <circle cx="212" cy="168" r="16" fill="#175E54" opacity="0.28"/>
  <path d="M152 268h96l-28-84-22 48-14-26z" fill="#175E54" opacity="0.4"/>
</svg>`);

function pushUrl(list, value) {
  if (!value || typeof value !== 'string') return;
  const url = value.trim();
  if (!url) return;
  if (url.includes('placeholder.svg') || url.includes('placehold.co')) return;
  if (!list.includes(url)) list.push(url);
}

function fromProduct(product) {
  const urls = [];
  if (!product) return urls;
  if (typeof product === 'string') {
    pushUrl(urls, product);
    return urls;
  }
  pushUrl(urls, product.cloudinary_url);
  pushUrl(urls, product.main_image_url);
  pushUrl(urls, product.thumbnail_url);
  pushUrl(urls, product.large_image_url);
  pushUrl(urls, product.image_url);
  pushUrl(urls, product.primaryImage);
  const extras = product.sub_images || product.subImages || [];
  extras.forEach((image) => {
    pushUrl(urls, image?.cloudinary_url);
    pushUrl(urls, image?.image_url);
    pushUrl(urls, image?.thumbnail_url);
    pushUrl(urls, image?.large_url);
  });
  return urls;
}

export function productImageCandidates(...sources) {
  const urls = [];
  sources.forEach((source) => {
    fromProduct(source).forEach((url) => pushUrl(urls, url));
  });
  return urls;
}

export function firstProductImage(...sources) {
  return productImageCandidates(...sources)[0] || PRODUCT_PLACEHOLDER;
}

export function normalizeImageUrl(url) {
  try {
    const parsed = new URL(String(url || ''), 'https://www.keralasellers.in');
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return String(url || '');
  }
}
