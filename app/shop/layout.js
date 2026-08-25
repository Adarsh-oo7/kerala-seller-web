import { BRAND } from '../lib/brand';

const PAGE_URL = `${BRAND.url}/shop`;

export const metadata = {
  title: 'Kerala shops directory | Kerala Sellers',
  description:
    'Find Kerala shops with their own store links. Browse local sellers from Kochi, Thiruvananthapuram, Kozhikode, and across Kerala.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Kerala shops directory',
    description: 'Open a Kerala seller store and shop their products.',
    url: PAGE_URL,
    siteName: BRAND.name,
    type: 'website',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

export default function ShopIndexLayout({ children }) {
  return children;
}
