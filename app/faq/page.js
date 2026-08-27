'use client';
import Link from 'next/link';
import SeoPageLayout from '../../components/seo/SeoPageLayout';
import FaqAccordion from '../../components/seo/FaqAccordion';

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

const categories = [
  { label: 'Getting Started', indices: [0, 1, 4, 5, 14] },
  { label: 'Pricing & Commission', indices: [2, 4] },
  { label: 'Selling on Social Media', indices: [8, 9, 6] },
  { label: 'Platform & Features', indices: [7, 10, 12, 13] },
];

export default function FaqPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}>
      <section className="seo-hero" aria-labelledby="faq-h1" style={{ paddingBottom: 40 }}>
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">❓ Frequently Asked Questions</div>
          <h1 className="seo-hero__h1" id="faq-h1">Everything You Want to <em>Know About Kerala Sellers</em></h1>
          <p className="seo-hero__sub">Common questions from sellers across Kerala — about starting, selling, managing, and growing with Kerala Sellers.</p>
        </div>
      </section>

      <section className="seo-faq" style={{ maxWidth: 820, padding: '40px 24px 64px' }}>
        <FaqAccordion faqs={allFaqs} />
      </section>

      <section className="seo-section" style={{ paddingTop: 0, paddingBottom: 48 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Explore More</p>
          <ul className="seo-links-box__list">
            <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
            <li><Link href="/solutions">All Solutions</Link></li>
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
            <li><Link href="/for/home-businesses">Home Businesses</Link></li>
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/register/seller">Start Free</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </section>

      <section className="seo-closer" style={{ padding: '48px 24px' }}>
        <p className="seo-closer__quote">Still have questions? We are happy to help.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/contact" className="seo-closer__cta" id="faq-contact-btn">Contact Us →</Link>
          <Link href="/register/seller" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: '2px solid rgba(255,255,255,0.45)', color: '#fff', fontWeight: 600, padding: '13px 26px', borderRadius: 10, textDecoration: 'none' }}>Start Free Store</Link>
        </div>
      </section>
    </SeoPageLayout>
  );
}
