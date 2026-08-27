import { BRAND } from '../lib/brand';

const PAGE_URL = `${BRAND.url}/features`;

const faqs = [
  {
    q: 'Can I use Kerala Sellers completely from my mobile phone?',
    a: 'Yes! The seller dashboard is 100% mobile-friendly. You can upload products, manage stock, view orders, update delivery status, and track payments from any smartphone without needing a computer.',
  },
  {
    q: 'What add-ons are available for my shop?',
    a: 'We offer flexible add-ons so you only pay for what your shop needs. Add-ons include: POS & Billing for offline receipts, Custom Subdomain (yourshop.keralasellers.in), Multi-Staff Logins, Multi-Location management, Barcode scanner & Thermal printer support, and Extra Product Capacity.',
  },
  {
    q: 'Is there really 0% commission on sales?',
    a: 'Yes, 0% commission forever! Unlike Amazon, Flipkart, or Swiggy which take 15% to 40% per sale, Kerala Sellers charges only a flat monthly subscription. 100% of your earnings go straight to your bank account via Razorpay.',
  },
  {
    q: 'How affordable is Kerala Sellers compared to building a website?',
    a: 'Building a custom website costs ₹20,000 to ₹1,00,000+ with recurring hosting fees. Kerala Sellers gives you a live online store in 10 minutes with free setup and low flat monthly plans starting at budget-friendly rates for small businesses.',
  },
  {
    q: 'How does WhatsApp and Instagram selling work with Kerala Sellers?',
    a: 'You get a branded store link (keralasellers.in/shop/yourname). Place this link in your Instagram Bio or WhatsApp Status. Customers browse your products, add to cart, and checkout online. All orders land directly in your mobile dashboard automatically.',
  },
];

function FeaturesJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: 'All Features & Add-ons | Kerala Sellers',
        description:
          'Explore all features of Kerala Sellers — mobile store builder, order tracking, inventory sync, 0% commission payment, POS billing add-on, custom subdomain, and barcode support. Affordable plans for Kerala sellers.',
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${BRAND.url}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
            { '@type': 'ListItem', position: 2, name: 'Features', item: PAGE_URL },
          ],
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Kerala Sellers Digital Store Platform',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          description: 'Free setup, zero commission',
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
  title: 'All Features & Add-ons | Kerala Sellers — Mobile Store & Business Tools',
  description:
    'Complete list of features & add-ons: mobile store builder, order management, inventory sync, 0% commission payments, POS billing, custom subdomains, and staff logins. Affordable for all Kerala sellers.',
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-IN': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    title: 'All Features & Add-ons | Kerala Sellers',
    description:
      'Mobile-first online store, order tracking, stock management, 0% commission payments, POS billing add-on & custom subdomains. Designed for Kerala small businesses.',
    url: PAGE_URL,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Features & Add-ons | Kerala Sellers',
    description:
      'Mobile store builder, order tracking, POS billing add-on & 0% commission. Easy to use anywhere.',
  },
  robots: { index: true, follow: true },
};

export default function FeaturesLayout({ children }) {
  return (
    <>
      <FeaturesJsonLd />
      {children}
    </>
  );
}
