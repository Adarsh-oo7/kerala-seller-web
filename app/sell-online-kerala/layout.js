import { BRAND } from '../lib/brand';

const PAGE_URL = `${BRAND.url}/sell-online-kerala`;

const faqs = [
  {
    q: 'How do I sell my products online in Kerala?',
    a: 'Register on Kerala Sellers for free, add your shop name and logo, upload your products with photos and prices, then share your unique store link on Instagram, WhatsApp, or Facebook. Customers browse and order without DMs.',
  },
  {
    q: 'Can I sell only in Kerala?',
    a: 'Yes. Kerala Sellers is built for Kerala-focused sellers. You control delivery zones — district-level or all-Kerala.',
  },
  {
    q: 'I already sell on Instagram and WhatsApp. Why do I need this?',
    a: 'Customers visit your store link, add to cart, and place orders. You get one order list instead of scattered DMs. Zero commission.',
  },
  {
    q: 'Is there any commission on sales?',
    a: '0% commission forever. You pay a small fixed monthly store plan. Sales go to you via Razorpay.',
  },
  {
    q: 'How much does it cost to start an online store in Kerala?',
    a: 'Creating an account is free. Then you choose a monthly plan based on how many products you sell.',
  },
  {
    q: 'I run a home bakery or sell homemade food. Can I use this?',
    a: 'Yes. Home bakeries, pickles, handicrafts, and jewellery sellers use Kerala Sellers to take local orders online.',
  },
  {
    q: 'Do I need technical knowledge to set up my online store?',
    a: 'No. Register with your phone, add shop details and products. Setup takes about 10 minutes.',
  },
  {
    q: 'What payment methods can my customers use?',
    a: 'UPI, cards, net banking, and wallets through Razorpay. Money goes to your Razorpay account, then your bank.',
  },
  {
    q: 'Can I manage orders and stock from my phone?',
    a: 'Yes. The seller dashboard works on mobile for orders, stock, and product listings.',
  },
  {
    q: 'Is Kerala Sellers different from Amazon or Flipkart?',
    a: 'You get your own branded store with 0% commission and sell to your Kerala audience. It is your store, not a marketplace that takes a cut.',
  },
];

export const metadata = {
  title: 'Sell products online in Kerala | Free store, 0% commission | Kerala Sellers',
  description:
    'Start selling online in Kerala with your own store link. Built for Instagram and WhatsApp sellers. 0% commission. Sell clothes, food, jewellery, and homemade products across Kerala. Setup in 10 minutes.',
  keywords: [
    'sell products online Kerala',
    'online store Kerala',
    'sell online Kerala',
    'how to sell online in Kerala',
    'Instagram seller Kerala',
    'WhatsApp seller Kerala',
    'sell clothes online Kerala',
    'sell food online Kerala',
    'online shop Kerala',
    'zero commission online store Kerala',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Sell products online in Kerala | 0% commission',
    description:
      'Get your own Kerala store link. Sell clothes, food, jewellery, and crafts without marketplace commission. Launch in 10 minutes.',
    url: PAGE_URL,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${BRAND.url}/assets/images/logo/KERALA%20SELLERS%20transp.png`,
        width: 1200,
        height: 630,
        alt: 'Kerala Sellers — sell online in Kerala',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sell products online in Kerala | 0% commission',
    description: 'Own store link for Instagram and WhatsApp sellers in Kerala. Launch in 10 minutes.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: 'Sell products online in Kerala',
        description: metadata.description,
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${BRAND.url}/#website` },
        about: { '@id': `${BRAND.url}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BRAND.url}/` },
          { '@type': 'ListItem', position: 2, name: 'Sell online in Kerala', item: PAGE_URL },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
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

export default function SellOnlineKeralaLayout({ children }) {
  return (
    <>
      <JsonLd />
      {children}
    </>
  );
}
