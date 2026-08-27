import { NextResponse } from 'next/server';

const RESERVED = new Set([
  'www', 'api', 'admin', 'app', 'dashboard', 'support', 'help', 'mail',
  'static', 'media', 'blog', 'shop', 'store', 'user', 'login', 'prebook',
  'products', 'sell-online-kerala', 'contact', 'about', 'cancellation-refund',
  'shipping-delivery', 'privacy-policy', 'terms-and-conditions', 'delete-account',
]);
const BASE = 'keralasellers.in';

function storeSlugFromHost(host) {
  const hostname = String(host || '').split(':')[0].toLowerCase();
  if (hostname.endsWith(`.${BASE}`) && hostname !== BASE && hostname !== `www.${BASE}` && hostname !== `api.${BASE}`) {
    const slug = hostname.slice(0, -(BASE.length + 1));
    if (slug && !slug.includes('.') && !RESERVED.has(slug)) return slug;
  }
  if (hostname.endsWith('.localhost') && hostname !== 'localhost') {
    const slug = hostname.slice(0, -'.localhost'.length);
    if (slug && !slug.includes('.') && !RESERVED.has(slug)) return slug;
  }
  return null;
}

function isShopHostPassthrough(pathname) {
  if (!pathname || pathname === '/') return false;
  if (pathname.startsWith('/shop/')) return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/api/')) return true;
  if (pathname.startsWith('/assets/')) return true;
  if (
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json' ||
    pathname === '/placeholder.svg'
  ) {
    return true;
  }
  // Public files (images, fonts, css) must not be rewritten to /shop/{slug}/...
  if (/\.[a-zA-Z0-9]{1,8}$/.test(pathname)) return true;
  return false;
}

export function middleware(request) {
  const slug = storeSlugFromHost(request.headers.get('host'));
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  if (isShopHostPassthrough(url.pathname)) {
    return NextResponse.next();
  }
  url.pathname = url.pathname === '/' ? `/shop/${slug}` : `/shop/${slug}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\..*).*)'],
};
