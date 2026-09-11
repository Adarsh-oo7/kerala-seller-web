import { BRAND } from '../lib/brand';

const PAGE_URL = `${BRAND.url}/mobile-app`;

const faqs = [
  {
    q: 'Can I manage my entire Kerala Sellers store from my phone?',
    a: 'Yes. The Kerala Sellers mobile app allows you to create and edit products, update pricing, view and manage orders, monitor stock in real time, track customer details, and print receipts directly from your smartphone.',
  },
  {
    q: 'Is the Kerala Sellers mobile app available for Android and iOS?',
    a: 'Yes, the mobile app is built for Android (supporting Android 8.0 and above) with direct APK and Google Play Store support, as well as iOS compatibility for iPhones and iPads.',
  },
  {
    q: 'Can I connect a Bluetooth thermal printer to print bills from the app?',
    a: 'Yes. The app features integrated Mobile POS billing with wireless Bluetooth connectivity for standard 58mm and 80mm thermal receipt printers. You can generate and print bills in 2 seconds over the counter.',
  },
  {
    q: 'Do customers need to download the mobile app to buy from my shop?',
    a: 'No. Your customers do not need to download any app. They can simply open your custom store link on any mobile browser (from Instagram, WhatsApp, or Google), browse your catalogue, and checkout seamlessly.',
  },
  {
    q: 'Does the mobile app sync stock between offline counter sales and my online store?',
    a: 'Yes. When you bill a product at your physical counter using the mobile POS in the app, your online catalogue stock decreases instantly in real time, preventing overselling.',
  },
];

function MobileAppJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: 'Kerala Sellers Mobile App | Manage Your Online Store from Your Phone',
        description:
          'Download the Kerala Sellers mobile app. Manage products, orders, inventory, payments, and Bluetooth POS billing from your smartphone.',
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${BRAND.url}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
            { '@type': 'ListItem', position: 2, name: 'Mobile App', item: PAGE_URL },
          ],
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Kerala Sellers Mobile App',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Android 8.0+, iOS',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          description: 'Free to download for registered Kerala Sellers',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '124',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${PAGE_URL}#faq`,
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
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

export const metadata = {
  title: 'Kerala Sellers Mobile App | Manage Your Online Store from Your Phone',
  description:
    'Manage your products, orders, inventory, payments, and Bluetooth POS billing from anywhere with the Kerala Sellers mobile app. Complete store management in your hand.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Kerala Sellers Mobile App — Store Management in Your Hand',
    description:
      'Manage products, track orders, sync real-time stock, and run mobile POS billing directly from your smartphone with the Kerala Sellers app.',
    url: PAGE_URL,
    siteName: BRAND.name,
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: `${BRAND.url}/assets/images/Banner/5.png`,
        width: 1200,
        height: 630,
        alt: 'Kerala Sellers Mobile App — Store in Your Hand',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kerala Sellers Mobile App | Manage Your Online Store from Your Phone',
    description:
      'Full store management in your phone: add products, process orders, sync inventory, and print thermal receipts.',
    images: [`${BRAND.url}/assets/images/Banner/5.png`],
  },
};

export default function MobileAppLayout({ children }) {
  return (
    <>
      <MobileAppJsonLd />
      {children}
    </>
  );
}
