import { BRAND } from '../lib/brand';

const PAGE_URL = `${BRAND.url}/products`;

export const metadata = {
  title: 'Buy products from Kerala sellers | Kerala Sellers',
  description:
    'Shop clothes, jewellery, bakery, homemade food, and local products from Kerala sellers. Browse listings from Instagram and WhatsApp shops across Kerala.',
  keywords: [
    'buy products Kerala',
    'online shopping Kerala',
    'Kerala sellers products',
    'shop local Kerala',
    'Instagram sellers Kerala',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Buy products from Kerala sellers',
    description:
      'Browse products listed by Kerala shops and social media sellers. Order locally without marketplace commission on the seller.',
    url: PAGE_URL,
    siteName: BRAND.name,
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy products from Kerala sellers',
    description: 'Local products from Kerala shops and Instagram sellers, listed in one place.',
  },
  robots: { index: true, follow: true },
};

function CollectionJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Products from Kerala sellers',
    description:
      'Product listings from Kerala shops and Instagram / WhatsApp sellers on Kerala Sellers.',
    url: PAGE_URL,
    isPartOf: {
      '@type': 'WebSite',
      name: BRAND.name,
      url: BRAND.url,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
        { '@type': 'ListItem', position: 2, name: 'Products', item: PAGE_URL },
      ],
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function ProductsLayout({ children }) {
  return (
    <>
      <CollectionJsonLd />
      {children}
    </>
  );
}
