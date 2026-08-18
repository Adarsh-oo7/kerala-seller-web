import { headers } from 'next/headers';
import { notFound, permanentRedirect } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

export default async function ShopLayout({ children, params }) {
  const { shopSlug } = await params;
  if (!shopSlug) return children;

  try {
    const response = await fetch(`${API_BASE_URL}/shop/${encodeURIComponent(shopSlug)}/`, {
      cache: 'no-store',
    });
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
