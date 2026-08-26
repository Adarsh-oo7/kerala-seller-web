import HomeClient from './HomeClient';
import { BRAND } from './lib/brand';

const HOME_URL = `${BRAND.url}/`;

export const metadata = {
  title: 'Kerala Sellers | Sell products online in Kerala from Instagram and WhatsApp',
  description:
    'Turn your Instagram or WhatsApp business into your own Kerala store. Share a store link, take orders in one place, and keep 100% of sales. Zero commission. Setup in 10 minutes.',
  alternates: { canonical: HOME_URL },
  openGraph: {
    title: 'Kerala Sellers | Online store for Instagram and WhatsApp sellers in Kerala',
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
    title: 'Sell online in Kerala | Kerala Sellers',
    description: 'Own store for Instagram and WhatsApp sellers in Kerala. 0% commission.',
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
      },
      {
        '@type': 'WebPage',
        '@id': `${HOME_URL}#webpage`,
        url: HOME_URL,
        name: 'Kerala Sellers — sell products online in Kerala',
        description: metadata.description,
        isPartOf: { '@id': `${BRAND.url}/#website` },
        about: { '@id': `${BRAND.url}/#organization` },
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
