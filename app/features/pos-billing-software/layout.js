import { BRAND } from '../../lib/brand';

const PAGE_URL = `${BRAND.url}/features/pos-billing-software`;

const faqs = [
  {
    q: 'Mobile-il ninnu bill print cheyyan engane?',
    a: 'Kerala Sellers app നിങ്ങളും നിങ്ങളുടെ ഫോണിൽ ഇൻസ്റ്റാൾ ചെയ്യുക. Bluetooth വഴിയോ USB വഴിയോ 58mm/80mm Thermal Printer കണക്റ്റ് ചെയ്യുക. 2 സെക്കന്റിൽ ജിഎസ് ടി അല്ലെങ്കിൽ നോൺ-ജിഎസ് ടി ബില്ലുകൾ പ്രിന്റ് ചെയ്യാം.',
  },
  {
    q: 'Small shop-inu billing machine venamo or phone mathiyo?',
    a: 'കമ്പ്യൂട്ടറോ വലിയ ബില്ലിംഗ് മെഷീനോ ആവശ്യമില്ല! കേരളാ സെല്ലേഴ്സ് ആപ്പ് ഉപയോഗിച്ച് നിങ്ങളുടെ സ്മാർട്ട്ഫോൺ ഒരു സമ്പൂർണ്ണ പോസ് ബില്ലിംഗ് മെഷീനാക്കി മാറ്റാം. ₹3,499 പ്രിന്റർ കിറ്റ് ഉപയോഗിച്ച് എളുപ്പത്തിൽ ബില്ലിംഗ് തുടങ്ങാം.',
  },
  {
    q: 'How does stock sync between physical shop billing and online store?',
    a: 'Kerala Sellers uses a Unified Inventory system. When a product is sold over the counter via POS billing, stock automatically decreases on your online store and WhatsApp store instantly. Zero overselling.',
  },
  {
    q: 'What is included in the ₹3,499 POS Billing Kit?',
    a: 'The ₹3,499 kit includes a 58mm Wireless Bluetooth Thermal Printer, starter thermal paper rolls, printer setup guide, full Kerala Sellers mobile billing access, and instant digital bill sharing via WhatsApp.',
  },
  {
    q: 'Can I generate both GST and Non-GST bills?',
    a: 'Yes. You can switch between GST compliant tax invoices (with HSN/SAC codes, CGST/SGST tax breakdown) and simple Non-GST retail receipts with one tap.',
  },
];

function PosBillingJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: 'POS Billing Software & Mobile Machine in Kerala | Kerala Sellers',
        description:
          'Turn your Android smartphone into a POS billing machine. GST & non-GST billing, Bluetooth thermal printer support, inventory sync & online store in one app.',
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${BRAND.url}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
            { '@type': 'ListItem', position: 2, name: 'Features', item: `${BRAND.url}/features` },
            { '@type': 'ListItem', position: 3, name: 'POS Billing Software', item: PAGE_URL },
          ],
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Kerala Sellers Mobile POS & Billing Software',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Android, iOS, Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          description: 'Free to start, POS billing & Bluetooth printer support',
        },
      },
      {
        '@type': 'Product',
        name: 'Kerala Sellers ₹3,499 Mobile POS Billing Kit',
        description: 'Complete mobile billing kit — 58mm Bluetooth thermal printer, paper rolls, POS billing software & WhatsApp bill sharing.',
        offers: {
          '@type': 'Offer',
          price: '3499',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
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
  title: 'POS Billing Software & Mobile Machine Kerala | Kerala Sellers',
  description:
    'Turn your phone into a POS billing machine. GST & non-GST billing, Bluetooth thermal printing, stock sync & online store in one app. ₹3,499 billing kit.',
  keywords: [
    'billing software Kerala',
    'billing app Kerala',
    'billing machine for shop',
    'GST billing software Kerala',
    'mobile billing app',
    'POS billing software',
    'thermal printer for billing',
    'turn phone into POS machine',
    'retail shop billing Kerala',
    'grocery billing app Kerala',
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-IN': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    title: 'POS Billing Software & Mobile POS Machine | Kerala Sellers',
    description:
      'Turn your smartphone into a complete POS billing machine. Print thermal receipts, track shop stock, share bills on WhatsApp & manage online store.',
    url: PAGE_URL,
    siteName: BRAND.name,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POS Billing Software & Mobile POS Machine | Kerala Sellers',
    description: 'Turn your phone into a POS machine with Kerala Sellers — ₹3,499 complete kit.',
  },
  robots: { index: true, follow: true },
};

export default function PosBillingLayout({ children }) {
  return (
    <>
      <PosBillingJsonLd />
      {children}
    </>
  );
}
