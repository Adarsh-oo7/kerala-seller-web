import { BRAND } from '../../lib/brand';

const PAGE_URL = `${BRAND.url}/features/order-management`;

const faqs = [
  { q: 'Order engane track cheyyam easily?', a: 'Kerala Sellers-il ondu dashboard und — athu undakkunna ella ordersm kanaan. Customer details, payment status, delivery status — ellam ondu screen-il.' },
  { q: 'Can I manage orders from my phone?', a: 'Yes. The order dashboard is fully mobile-optimised. Accept, update, and fulfil orders from your smartphone — no desktop needed.' },
  { q: 'What information do I get with each order?', a: 'You get the customer name, phone number, delivery address, items ordered, quantities, payment amount, and payment status.' },
  { q: 'Can customers track their order status?', a: 'Yes. You can update order status (confirmed, packed, shipped, delivered) and customers receive updates accordingly.' },
  { q: 'How do I get notified of new orders?', a: 'You receive an instant notification via the app or dashboard when a new order is placed. Configure WhatsApp alerts for immediate awareness.' },
];

export const metadata = {
  title: 'Order Management Software for Small Sellers | Kerala Sellers',
  description:
    'Track all your orders in one simple dashboard. See customer details, payment status, and delivery info. Order engane track cheyyam — Kerala Sellers makes it easy.',
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-IN': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    title: 'Order Management for Kerala Sellers',
    description: 'All your orders in one clean dashboard. Mobile-ready. 0% commission.',
    url: PAGE_URL, siteName: BRAND.name, locale: 'en_IN', type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Order Management | Kerala Sellers', description: 'Simple order tracking for Kerala sellers.' },
  robots: { index: true, follow: true },
};

function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${PAGE_URL}#webpage`, url: PAGE_URL,
        name: 'Order Management Software for Kerala Sellers', description: metadata.description,
        inLanguage: 'en-IN', isPartOf: { '@id': `${BRAND.url}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
            { '@type': 'ListItem', position: 2, name: 'Features', item: `${BRAND.url}/solutions` },
            { '@type': 'ListItem', position: 3, name: 'Order Management', item: PAGE_URL },
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

export default function OrderManagementLayout({ children }) {
  return <><JsonLd />{children}</>;
}

export { faqs as orderManagementFaqs };
