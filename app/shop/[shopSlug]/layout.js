import { headers } from 'next/headers';
import { notFound, permanentRedirect } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

async function loadShop(shopSlug) {
  const response = await fetch(`${API_BASE_URL}/shop/${encodeURIComponent(shopSlug)}/`, {
    cache: 'no-store',
  });
  return response;
}

export async function generateMetadata({ params }) {
  const { shopSlug } = await params;
  try {
    const response = await loadShop(shopSlug);
    if (!response.ok) {
      return { title: 'Shop', robots: { index: false, follow: false } };
    }
    const data = await response.json();
    const store = data.store || data.store_profile || {};
    const official = data.official_url || store.official_url;
    const title = store.meta_title || store.name || 'Kerala Sellers shop';
    const description = store.meta_description || store.description || `Shop ${store.name || ''} on Kerala Sellers.`;
    const canonical = official || `https://keralasellers.in/shop/${shopSlug}/`;
    const indexable = data.is_live !== false && store.verification_status !== 'rejected';
    return {
      title,
      description,
      alternates: { canonical },
      robots: { index: indexable, follow: indexable },
    };
  } catch {
    return { title: 'Shop' };
  }
}

export default async function ShopLayout({ children, params }) {
  const { shopSlug } = await params;
  if (!shopSlug) return children;

  try {
    const response = await loadShop(shopSlug);
    if (response.status === 404) {
      notFound();
    }
    if (response.ok) {
      const data = await response.json();
      const official = data.official_url || data.store?.official_url;
      if (official && official.startsWith('https://')) {
        const officialHost = new URL(official).hostname;
        const currentHost = (await headers()).get('host')?.split(':')[0] || '';
        const onPathHost = currentHost === 'keralasellers.in' || currentHost === 'www.keralasellers.in' || currentHost.endsWith('vercel.app');
        const officialIsSubdomain = officialHost.endsWith('.keralasellers.in') && !officialHost.startsWith('www.') && officialHost !== 'api.keralasellers.in';
        if (onPathHost && officialIsSubdomain && currentHost !== officialHost) {
          permanentRedirect(official);
        }
      }
    }
  } catch {
    // Keep the client shop page as fallback if the API is unreachable.
  }

  return children;
}
