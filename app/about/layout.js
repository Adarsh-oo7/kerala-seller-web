import { BRAND } from '../lib/brand';

const PAGE_URL = `${BRAND.url}/about`;

export const metadata = {
  title: 'About Kerala Sellers | Zero Commission Store for Kerala',
  description:
    'Kerala Sellers is built to help Instagram and WhatsApp sellers in Kerala launch their own stores. Zero commission. Founded by Adarsh B S and Aromal V G.',
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-IN': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    title: 'About Kerala Sellers',
    description: 'Kerala Sellers gives small businesses in Kerala a zero-commission online store. Learn about our mission and team.',
    url: PAGE_URL,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About Kerala Sellers',
    description: 'Zero-commission online store platform for Kerala businesses.',
  },
  robots: { index: true, follow: true },
};

function AboutJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: PAGE_URL,
    name: 'About Kerala Sellers',
    description: metadata.description,
    isPartOf: { '@id': `${BRAND.url}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
        { '@type': 'ListItem', position: 2, name: 'About', item: PAGE_URL },
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

export default function AboutLayout({ children }) {
  return (
    <>
      <AboutJsonLd />
      {children}
    </>
  );
}

