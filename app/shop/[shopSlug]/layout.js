import { canonicalShopHref, publicShopApiIdentifier } from '../../lib/shop-identifier.cjs';

export async function generateMetadata({ params, searchParams }) {
  const { shopSlug } = await params;
  const query = await searchParams;
  const identifier = publicShopApiIdentifier(shopSlug, query);
  const canonical = canonicalShopHref(null, shopSlug);
  return {
    alternates: { canonical },
    openGraph: { url: canonical },
    robots: { index: true, follow: true },
  };
}

export default function ShopSlugLayout({ children }) {
  return children;
}
