import { canonicalShopHref } from '../../lib/shop-identifier.cjs';

export async function generateMetadata({ params }) {
  const { shopSlug } = await params;
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
