import { BRAND } from '../lib/brand';

const PAGE_URL = `${BRAND.url}/solutions`;

const faqs = [
  {
    q: 'What is Kerala Sellers?',
    a: 'Kerala Sellers is an all-in-one digital growth platform for sellers in Kerala. It lets you build an online store, manage orders, track inventory, accept payments, and grow your customer base — all from one simple dashboard, without paying any commission on your sales.',
  },
  {
    q: 'Who is Kerala Sellers built for?',
    a: 'Any seller in Kerala can use it — Instagram resellers, WhatsApp sellers, home bakers, boutique owners, small retail shops, and anyone who wants to sell online without building an expensive website. Online aayi business thudangan want cheyyunavark idhu perfect aanu.',
  },
  {
    q: 'Do I need technical skills to use Kerala Sellers?',
    a: 'None at all. If you can use Instagram or WhatsApp, you can use Kerala Sellers. Setup takes about 10 minutes.',
  },
  {
    q: 'Is there a commission on each sale?',
    a: '0% commission — forever. Kerala Sellers charges a small flat monthly subscription. Every rupee from your sales goes directly to you.',
  },
  {
    q: 'What makes Kerala Sellers different from Amazon, Meesho, or Flipkart?',
    a: 'On those platforms, you compete with thousands of sellers and pay 15–40% commission. On Kerala Sellers, you have your own branded store, your own audience, and 0% commission. It is your store — not a marketplace.',
  },
];

function SolutionsJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: 'Complete Business Solutions for Kerala Sellers',
        description:
          'Kerala Sellers offers an all-in-one platform — online store builder, order management, inventory, payments, and growth tools for sellers in Kerala.',
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${BRAND.url}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
            { '@type': 'ListItem', position: 2, name: 'Solutions', item: PAGE_URL },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${BRAND.url}/solutions#software`,
        name: 'Kerala Sellers All-in-One Business Software',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, Android, iOS',
        description:
          'Unified business software for small shops and sellers in Kerala: online store builder, POS billing software, live inventory sync, and WhatsApp order management starting at ₹99/month with 0% commission.',
        url: PAGE_URL,
        offers: {
          '@type': 'Offer',
          price: '99',
          priceCurrency: 'INR',
          billingDuration: 'P1M',
        },
        featureList: [
          'Online Store Builder for Small Businesses',
          'Mobile POS Bluetooth 58mm Thermal Billing',
          'Live Unified Multi-Channel Inventory Sync',
          'WhatsApp & Instagram Order Management Link',
          'Mobile Business Management App',
          '0% Platform Marketplace Commission',
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

export const metadata = {
  title: 'All-in-One Business Management Software for Shops in Kerala | Kerala Sellers',
  description:
    'Manage your online store, inventory, POS billing, and sales in one place. The all-in-one business software for small shops and sellers in Kerala from ₹99/mo. 0% commission.',
  keywords: [
    'all in one business management software',
    'small business management software',
    'shop management software',
    'business management software Kerala',
    'ecommerce and inventory software',
    'online and offline store management',
    'retail management software',
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-IN': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    title: 'Complete Business Solutions for Kerala Sellers',
    description:
      'Everything you need to sell online in Kerala — store builder, order management, payments, and growth tools. 0% commission.',
    url: PAGE_URL,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Solutions for Kerala Sellers',
    description: 'All-in-one platform: store, orders, inventory, payments. 0% commission.',
  },
  robots: { index: true, follow: true },
};

export default function SolutionsLayout({ children }) {
  return (
    <>
      <SolutionsJsonLd />
      {children}
    </>
  );
}


