import { NextResponse } from 'next/server';

const RESERVED = new Set([
  'www', 'api', 'admin', 'app', 'dashboard', 'support', 'help', 'mail',
  'static', 'media', 'blog', 'shop', 'store', 'user', 'login', 'prebook',
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

export function middleware(request) {
  const slug = storeSlugFromHost(request.headers.get('host'));
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  if (!url.pathname.startsWith('/shop/')) {
    url.pathname = url.pathname === '/' ? `/shop/${slug}` : `/shop/${slug}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
