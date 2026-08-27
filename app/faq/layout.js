import { BRAND } from '../lib/brand';

const PAGE_URL = `${BRAND.url}/faq`;

const allFaqs = [
  { q: 'What is Kerala Sellers?', a: 'Kerala Sellers is a zero-commission e-commerce platform built for sellers in Kerala. It gives you your own online store link, order management dashboard, inventory tracking, and payment collection — all in one place. No commission on sales. Flat monthly subscription.' },
  { q: 'Who can sell on Kerala Sellers?', a: 'Any individual or business in Kerala — Instagram sellers, WhatsApp resellers, home bakers, boutique owners, jewellery sellers, handicraft makers, small retail shops, and any local business that wants to sell online.' },
  { q: 'Is there any commission on sales?', a: '0% commission forever. Kerala Sellers charges a small flat monthly subscription. Every rupee from your sales goes directly to you via Razorpay into your bank account.' },
  { q: 'Online aayi business thudangan enthu cheyyanam?', a: 'Kerala Sellers-il free register cheyyuka. Shop name, logo, products add cheyyuka. Oru store link kittum — Instagram bio-yl, WhatsApp status-il share cheyyuka. Customers browse cheytu order place cheyyum. Setup time: 10 minutes.' },
  { q: 'How much does it cost to start an online store on Kerala Sellers?', a: 'Creating an account is free. Paid plans activate your live store. Plans start at very affordable monthly rates — far less than building a website or paying marketplace commissions.' },
  { q: 'Do I need coding skills or technical knowledge?', a: 'None. If you can use Instagram or WhatsApp, you can set up your Kerala Sellers store. It takes about 10 minutes.' },
  { q: 'Can I sell only within Kerala?', a: 'Yes. You control your delivery zones — local district, all-Kerala, or anywhere. Most sellers on the platform do Kerala-only delivery.' },
  { q: 'What payment methods can my customers use?', a: 'UPI, credit/debit cards, net banking, and wallets — all via Razorpay. Payments go directly into your Razorpay account and then to your bank.' },
  { q: 'WhatsApp il varunna order engane manage cheyyam?', a: 'Kerala Sellers store link WhatsApp Status-il post cheyyuka. Customers click cheytu, browse cheytu, cart-il add cheytu, checkout cheyyum. Order dashboard-il automatically varum — no manual tracking needed.' },
  { q: 'Instagram DM order track cheyyan app ethanu best?', a: 'Kerala Sellers gives you a link to put in your Instagram bio. Followers tap the link, browse your products, and place orders directly — no DMs needed for the order itself.' },
  { q: 'Can I get a custom subdomain like myshop.keralasellers.in?', a: 'Yes. Custom subdomain (yourshop.keralasellers.in) is available as an add-on on Premium plan. It gives your store a more branded, professional URL.' },
  { q: 'Is Kerala Sellers different from Amazon, Flipkart, or Meesho?', a: 'Very different. On those platforms you compete with thousands of sellers and pay 15–40% commission. On Kerala Sellers, you have your own branded store, your own customer list, and 0% commission.' },
  { q: 'Can I manage my store from a mobile phone?', a: 'Yes. The seller dashboard is fully mobile-optimised. Manage orders, update stock, add products, and view sales from your smartphone.' },
  { q: 'I run a home bakery. Can I use Kerala Sellers?', a: 'Absolutely. Many of our sellers run home bakeries, homemade pickle businesses, and handcraft shops. Set your products, prices, available quantities, and delivery zones. Customers order online and you deliver locally.' },
  { q: 'How do I get started?', a: 'Go to keralasellers.in/register/seller, sign up with your mobile number, set up your shop details, add your products, and share your store link. You are live in 10 minutes.' },
];

function FaqJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: 'Frequently Asked Questions — Kerala Sellers',
        description: 'Answers to the most common questions about selling online with Kerala Sellers.',
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${BRAND.url}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
            { '@type': 'ListItem', position: 2, name: 'FAQ', item: PAGE_URL },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: allFaqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export const metadata = {
  title: 'FAQ — Frequently Asked Questions | Kerala Sellers',
  description:
    'Answers to the most common questions about Kerala Sellers — pricing, commission, setup, WhatsApp selling, Instagram orders, inventory, and more.',
  alternates: {
    canonical: PAGE_URL,
    languages: { 'en-IN': PAGE_URL, 'x-default': PAGE_URL },
  },
  openGraph: {
    title: 'FAQ | Kerala Sellers',
    description: 'Common questions about selling online with Kerala Sellers answered.',
    url: PAGE_URL, siteName: BRAND.name, locale: 'en_IN', type: 'website',
  },
  twitter: { card: 'summary', title: 'FAQ | Kerala Sellers', description: 'Your Kerala Sellers questions, answered.' },
  robots: { index: true, follow: true },
};

export default function FaqLayout({ children }) {
  return <><FaqJsonLd />{children}</>;
}

export { allFaqs };
