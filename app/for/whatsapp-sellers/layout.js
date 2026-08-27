import { BRAND } from '../../lib/brand';
import { FOR_PAGES } from '../for-pages-data';

const data = FOR_PAGES['whatsapp-sellers'];
const PAGE_URL = `${BRAND.url}/for/whatsapp-sellers`;

export const metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-IN': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    title: data.meta.title,
    description: data.meta.description,
    url: PAGE_URL,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: data.meta.title,
    description: data.meta.description,
  },
  robots: { index: true, follow: true },
};

function ForPageJsonLd() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: data.meta.title,
        description: data.meta.description,
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${BRAND.url}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
            { '@type': 'ListItem', position: 2, name: 'Solutions', item: `${BRAND.url}/solutions` },
            { '@type': 'ListItem', position: 3, name: 'WhatsApp Sellers', item: PAGE_URL },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

export default function ForPageLayout({ children }) {
  return (
    <>
      <ForPageJsonLd />
      {children}
    </>
  );
}
