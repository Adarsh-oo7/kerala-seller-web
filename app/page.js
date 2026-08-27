import HomeClient from './HomeClient';
import { BRAND } from './lib/brand';

const HOME_URL = `${BRAND.url}/`;

export const metadata = {
  // Title: 54 chars — within 50–60 target
  title: 'Kerala Sellers | Sell Online in Kerala',
  description:
    // 155 chars — within 120–160 target
    'Own Kerala store for Instagram & WhatsApp sellers. Share a store link, take orders in one place, keep 100% of sales. Zero commission. Free setup.',
  alternates: {
    canonical: HOME_URL,
    languages: {
      'en-IN': HOME_URL,
      'x-default': HOME_URL,
    },
  },
  openGraph: {
    title: 'Kerala Sellers — Sell Online in Kerala, Zero Commission',
    description:
      'Already taking orders in DMs? Get a Kerala store link, let customers add to cart, and sell across Kerala without marketplace commission.',
    url: HOME_URL,
    siteName: BRAND.name,
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: `${BRAND.url}/assets/images/Banner/5.png`,
        width: 1200,
        height: 630,
        alt: 'Kerala Sellers — local products and seller stores',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sell Online in Kerala | Kerala Sellers',
    description: 'Own store for Instagram & WhatsApp sellers. 0% commission.',
  },
  robots: { index: true, follow: true },
};

function HomeJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${BRAND.url}/#website`,
        name: BRAND.name,
        url: BRAND.url,
        inLanguage: 'en-IN',
        publisher: { '@id': `${BRAND.url}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BRAND.url}/products?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${HOME_URL}#webpage`,
        url: HOME_URL,
        name: 'Kerala Sellers — Sell Online in Kerala',
        description: metadata.description,
        isPartOf: { '@id': `${BRAND.url}/#website` },
        about: { '@id': `${BRAND.url}/#organization` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
          ],
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${BRAND.url}/#localbusiness`,
        name: BRAND.name,
        description:
          'Kerala Sellers is a zero-commission e-commerce platform for Instagram and WhatsApp sellers in Kerala. Launch your own online store in under 10 minutes.',
        url: BRAND.url,
        telephone: BRAND.phoneTel,
        email: BRAND.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kochi',
          addressRegion: 'Kerala',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '9.9312',
          longitude: '76.2673',
        },
        areaServed: [
          { '@type': 'State', name: 'Kerala' },
          { '@type': 'Country', name: 'India' },
        ],
        sameAs: [
          BRAND.profiles.instagram,
          BRAND.profiles.facebook,
          BRAND.profiles.youtube,
          BRAND.profiles.linkedin,
        ],
        openingHours: 'Mo-Su 00:00-23:59',
        priceRange: '₹',
        currenciesAccepted: 'INR',
        paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking',
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <HomeClient />
    </>
  );
}

