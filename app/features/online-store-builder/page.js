'use client';
import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';

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

const steps = [
  { n: '1', title: 'Register Free', desc: 'Sign up with your mobile number. No credit card. No commitment.' },
  { n: '2', title: 'Set Up Your Shop', desc: 'Add your shop name, logo, and description. Takes 2 minutes.' },
  { n: '3', title: 'Upload Products', desc: 'Add product photos, prices, and stock quantities.' },
  { n: '4', title: 'Share Your Link', desc: 'Put your store link in Instagram bio, WhatsApp Status, or anywhere. You are live.' },
];

export default function OnlineStoreBuilderPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Features', href: '/solutions' }, { label: 'Online Store Builder' }]}>
      <section className="seo-hero" aria-labelledby="osb-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">🏪 Online Store Builder</div>
          <h1 className="seo-hero__h1" id="osb-h1">Build Your <em>Online Store</em> in Minutes</h1>
          <p className="seo-hero__sub">No coding. No website. No hosting costs. Just your store link — ready to share on Instagram, WhatsApp, and anywhere else in 10 minutes.</p>
          <div className="seo-hero__pills">
            {['✓ Free to start', '✓ No coding needed', '✓ Mobile-first', '✓ 0% commission'].map(p => <span key={p} className="seo-hero__pill">{p}</span>)}
          </div>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="osb-start-btn">🏪 Build Your Store Free →</Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">See Full Platform</Link>
          </div>
        </div>
      </section>

      <section className="seo-section">
        <p className="seo-section__eyebrow">How it works</p>
        <h2 className="seo-section__h2">From Zero to Live Store in 10 Minutes</h2>
        <div className="seo-features">
          {steps.map(s => (
            <div key={s.n} className="seo-feature-card" style={{ borderTop: '3px solid #a3e635' }}>
              <div className="seo-feature-card__icon" style={{ background: '#1a4845', color: '#a3e635', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>{s.n}</div>
              <div>
                <div className="seo-feature-card__title">{s.title}</div>
                <p className="seo-feature-card__desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="seo-section__eyebrow">What you get</p>
          <h2 className="seo-section__h2">Everything Included in Your Store</h2>
          <div className="seo-features">
            {features.map(f => (
              <div key={f.title} className="seo-feature-card">
                <div className="seo-feature-card__icon">{f.emoji}</div>
                <div>
                  <div className="seo-feature-card__title">{f.title}</div>
                  <p className="seo-feature-card__desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-closer">
        <p className="seo-closer__quote">"Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, or a way to grow — Kerala Sellers is the solution."</p>
        <Link href="/register/seller" className="seo-closer__cta" id="osb-bottom-cta">Create Your Free Online Store →</Link>
      </section>

      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Related</p>
          <ul className="seo-links-box__list">
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/features/inventory-management">Inventory Management</Link></li>
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
            <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
            <li><Link href="/solutions">All Solutions</Link></li>
          </ul>
        </div>
      </section>

      <section className="seo-faq">
        <h2 className="seo-faq__h2">Frequently Asked Questions</h2>
        <FaqAccordion faqs={faqs} />
      </section>
    </SeoPageLayout>
  );
}
