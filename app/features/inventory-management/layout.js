import { BRAND } from '../../lib/brand';

const PAGE_URL = `${BRAND.url}/features/inventory-management`;

const faqs = [
  { q: 'Stock engane manage cheyyam without overselling?', a: 'Kerala Sellers-il products add cheyyumbol quantity set cheyyam. Oru product sell aakumbol stock auto-reduce aakum. Zero aakumbol automatically "Out of Stock" kaanikkum.' },
  { q: 'Will customers see when a product is out of stock?', a: 'Yes. Products automatically display as out-of-stock on your store when quantity hits zero. Customers cannot add them to cart, preventing overselling.' },
  { q: 'Can I get alerts when stock is running low?', a: 'Yes. You can set low-stock thresholds and receive notifications when a product approaches that limit, giving you time to restock before selling out.' },
  { q: 'Can I manage different variants (size, colour) of the same product?', a: 'Yes. Create product variants with individual stock quantities for each option. Customers select their variant and you track each one separately.' },
  { q: 'Can I bulk update stock quantities?', a: 'Yes. You can update stock quantities for multiple products at once from your dashboard — useful after a restocking run.' },
];

export const metadata = {
  title: 'Inventory Management for Small Sellers | Kerala Sellers',
  description:
    'Track stock, set low-stock alerts, and never oversell again. Simple inventory management built for Kerala sellers. Stock engane manage cheyyam — Kerala Sellers.',
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-IN': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    title: 'Inventory Management for Kerala Sellers',
    description: 'Real-time stock tracking, low-stock alerts, variant management. Never oversell again.',
    url: PAGE_URL, siteName: BRAND.name, locale: 'en_IN', type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Inventory Management | Kerala Sellers', description: 'Simple stock tracking for Kerala sellers. Never oversell.' },
  robots: { index: true, follow: true },
};

function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${PAGE_URL}#webpage`, url: PAGE_URL,
        name: 'Inventory Management for Kerala Sellers', description: metadata.description,
        inLanguage: 'en-IN', isPartOf: { '@id': `${BRAND.url}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
            { '@type': 'ListItem', position: 2, name: 'Features', item: `${BRAND.url}/solutions` },
            { '@type': 'ListItem', position: 3, name: 'Inventory Management', item: PAGE_URL },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function InventoryManagementLayout({ children }) {
  return <><JsonLd />{children}</>;
}
