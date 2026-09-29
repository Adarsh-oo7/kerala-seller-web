import HomeClient from './HomeClient';
import { BRAND } from './lib/brand';

const HOME_URL = `${BRAND.url}/`;

export const metadata = {
  title: 'Kerala Sellers – Online Store & Billing Software from ₹99/Month',
  description:
    'Create your own online store from ₹99/month. Manage products, inventory, billing, POS, and orders with Kerala Sellers. An affordable business solution for Kerala\'s small businesses.',
  alternates: {
    canonical: HOME_URL,
    languages: {
      'en-IN': HOME_URL,
      'ml-IN': `${BRAND.url}/ml`,
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
        image: `${BRAND.url}/assets/images/logo/KERALA%20SELLERS%20transp.png`,
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
      {
        '@type': 'SoftwareApplication',
        '@id': `${BRAND.url}/#software`,
        name: 'Kerala Sellers',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, Android, iOS',
        description:
          'All-in-one business software, ecommerce store builder, and mobile POS billing platform for small businesses in Kerala. Plans start from ₹99/month with 0% marketplace commission.',
        url: BRAND.url,
        offers: {
          '@type': 'Offer',
          price: '99',
          priceCurrency: 'INR',
          billingDuration: 'P1M',
          description: 'Starter plan: ₹99/month, up to 50 products, 0% platform commission',
        },
        featureList: [
          'Online Storefront (keralasellers.in/shop/yourname)',
          'Mobile POS Bluetooth 58mm Thermal Billing',
          'Live Unified Multi-Channel Inventory Sync',
          'WhatsApp and Instagram Order Management Link',
          'Android and iOS Mobile Store Management App',
          'Direct Razorpay UPI, Card & Net Banking Settlements',
          '0% Marketplace Commission on Orders',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${BRAND.url}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is Kerala Sellers?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Kerala Sellers (keralasellers.in) is an all-in-one business platform for small businesses, retailers, and social media sellers in Kerala. It combines online store creation, mobile POS billing, inventory management, and WhatsApp order management starting at ₹99/month with 0% commission.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much does an online store cost on Kerala Sellers?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Registration is free. The Starter Plan is ₹99/month for up to 50 products with 0% marketplace commission. No coding or web developer is required, and setup takes under 10 minutes.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Kerala Sellers charge a commission on sales?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Kerala Sellers charges 0% marketplace commission on all sales. 100% of customer payments go directly into your bank account via integrated Razorpay UPI, cards, and net banking.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I use Kerala Sellers for shop billing and POS?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Kerala Sellers includes a built-in mobile POS billing system that connects via Bluetooth to 58mm/80mm thermal receipt printers, generating paper receipts in 2 seconds and automatically syncing offline stock with your online store.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do WhatsApp and Instagram sellers use Kerala Sellers?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sellers place their store link (keralasellers.in/shop/yourbrand) in their Instagram bio and WhatsApp status. Customers self-browse the catalogue and pay online, eliminating the chaos of repetitive DM price inquiries and manual payment chasing.',
            },
          },
        ],
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

