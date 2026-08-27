import { BRAND } from '../../lib/brand';

const PAGE_URL = `${BRAND.url}/features/online-store-builder`;

const faqs = [
  { q: 'Online kada undakkan enthu cheyyanam?', a: 'Kerala Sellers-il register cheyyuka — phone number, shop name, logo, products add cheyyuka, oru store link kittum. Setup time: 10 minutes.' },
  { q: 'Do I need a domain name or hosting to build my online store?', a: 'No. Your store is hosted on Kerala Sellers at keralasellers.in/shop/yourshopname — no separate domain, hosting, or server setup needed.' },
  { q: 'Can I customise my store with my brand colours and logo?', a: 'Yes. You can add your shop name, logo, banner image, and store description. More customisation options are available on higher-tier plans.' },
  { q: 'How many products can I add to my store?', a: 'Product limits depend on your subscription plan. Plans start from affordable monthly rates with increasing product counts.' },
  { q: 'Can my store be found on Google?', a: 'Yes. Each Kerala Sellers store page is indexed by Google. To improve discoverability, use descriptive product names and make sure your store name matches what customers search for.' },
];

const features = [
  { emoji: '🏪', title: 'Your Own Branded Store Link', desc: 'keralasellers.in/shop/yourname — a permanent, shareable URL you own. Put it everywhere.' },
  { emoji: '📸', title: 'Beautiful Product Catalogue', desc: 'Upload photos, set prices, add descriptions, create categories. Looks professional on every phone.' },
  { emoji: '🛒', title: 'Full Checkout & Cart', desc: 'Customers add to cart and checkout with UPI, card, or net banking. Smooth, familiar purchase flow.' },
  { emoji: '📦', title: 'Stock & Variant Management', desc: 'Set quantities, product variants (size, colour), and availability. No overselling, ever.' },
  { emoji: '📱', title: 'Mobile-First by Design', desc: 'Your store looks and works perfectly on every smartphone — no app download needed for customers.' },
  { emoji: '🔗', title: 'Share Anywhere', desc: 'Instagram bio, WhatsApp Status, Facebook, email, SMS — your store link works on every platform.' },
];

export const metadata = {
  title: 'Online Store Builder for Kerala Sellers | Kerala Sellers',
  description:
    'Build your free online store in 10 minutes. No coding, no hosting, no website costs. Get your own store link to share on Instagram and WhatsApp. Online kada undakkan — Kerala Sellers.',
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-IN': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    title: 'Online Store Builder — Build Your Kerala Store in 10 Minutes',
    description: 'No-code online store builder for Kerala sellers. Share a link, accept orders, get paid. 0% commission.',
    url: PAGE_URL, siteName: BRAND.name, locale: 'en_IN', type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Online Store Builder | Kerala Sellers', description: 'Build a free online store in 10 minutes. No code, no website cost.' },
  robots: { index: true, follow: true },
};

function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${PAGE_URL}#webpage`, url: PAGE_URL,
        name: 'Online Store Builder for Kerala Sellers', description: metadata.description,
        inLanguage: 'en-IN', isPartOf: { '@id': `${BRAND.url}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
            { '@type': 'ListItem', position: 2, name: 'Features', item: `${BRAND.url}/features` },
            { '@type': 'ListItem', position: 3, name: 'Online Store Builder', item: PAGE_URL },
          ],
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Kerala Sellers Online Store Builder',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Free to start' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function OnlineStoreBuilderLayout({ children }) {
  return <><JsonLd />{children}</>;
}


