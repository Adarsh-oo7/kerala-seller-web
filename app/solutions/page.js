'use client';

import Link from 'next/link';
import SeoPageLayout from '../../components/seo/SeoPageLayout';
import FaqAccordion from '../../components/seo/FaqAccordion';

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

const sellerTypes = [
  { href: '/for/instagram-sellers', emoji: '📸', label: 'Instagram Sellers', desc: 'Turn DMs into tracked orders' },
  { href: '/for/whatsapp-sellers', emoji: '💬', label: 'WhatsApp Sellers', desc: 'Manage every order from WhatsApp' },
  { href: '/for/social-media-sellers', emoji: '📱', label: 'Social Media Sellers', desc: 'One platform for all your channels' },
  { href: '/for/home-businesses', emoji: '🏠', label: 'Home Businesses', desc: 'Sell from home, deliver locally' },
  { href: '/for/small-businesses', emoji: '🏪', label: 'Small Businesses', desc: 'Store, billing, inventory in one' },
];

const tools = [
  { href: '/features/online-store-builder', emoji: '🏪', label: 'Online Store Builder', desc: 'Your own store link in 10 minutes' },
  { href: '/features/order-management', emoji: '📋', label: 'Order Management', desc: 'All orders in one dashboard' },
  { href: '/features/inventory-management', emoji: '📦', label: 'Inventory Management', desc: 'Never oversell again' },
  { href: '/sell-online-kerala', emoji: '🚀', label: 'Sell Online in Kerala', desc: 'Full platform overview' },
];

const journey = [
  { step: 'START', icon: '🚀', desc: 'Create your free online store in 10 minutes. No coding. No website cost.' },
  { step: 'SELL', icon: '💰', desc: 'Share your store link on Instagram, WhatsApp, and Facebook. Customers order themselves.' },
  { step: 'MANAGE', icon: '📊', desc: 'View orders, update stock, and track payments — all from one mobile-friendly dashboard.' },
  { step: 'GROW', icon: '📈', desc: 'See your top products, revenue trends, and customer data. Make smarter decisions.' },
];

export default function SolutionsPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Solutions' }]}>

      {/* HERO */}
      <section className="seo-hero" aria-labelledby="solutions-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">🌿 All-in-One Digital Growth Solution</div>
          <h1 className="seo-hero__h1" id="solutions-h1">
            One Complete Solution <em>for Your Business</em>
          </h1>
          <p className="seo-hero__sub">
            From creating your online store to managing orders, inventory, payments and customers —
            Kerala Sellers brings your essential business and digital growth tools together in one simple solution.
            <br /><em style={{ fontStyle: 'normal', opacity: 0.75, fontSize: '0.9em' }}>Ella business needum onnu chernu — one platform.</em>
          </p>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="solutions-start-btn">
              🏪 Start Your Free Store →
            </Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="seo-stats" role="region" aria-label="Key stats">
        {[
          { n: '1000+', l: 'Active Sellers' },
          { n: '0%', l: 'Commission Forever' },
          { n: '10 min', l: 'Setup Time' },
          { n: '14+', l: 'Districts Covered' },
        ].map((s) => (
          <div key={s.l} className="seo-stat">
            <span className="seo-stat__number">{s.n}</span>
            <span className="seo-stat__label">{s.l}</span>
          </div>
        ))}
      </div>

      {/* START → SELL → MANAGE → GROW */}
      <section className="seo-section">
        <p className="seo-section__eyebrow">Your journey</p>
        <h2 className="seo-section__h2">Start → Sell → Manage → Grow</h2>
        <p className="seo-section__lead">
          Kerala Sellers is designed around one simple idea: every seller, wherever they are in their business journey, should have exactly what they need in one place.
        </p>
        <div className="seo-features">
          {journey.map((j) => (
            <div key={j.step} className="seo-feature-card" style={{ borderLeft: '4px solid #1a4845' }}>
              <div className="seo-feature-card__icon">{j.icon}</div>
              <div>
                <div className="seo-feature-card__title">{j.step}</div>
                <p className="seo-feature-card__desc">{j.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOR YOUR SELLER TYPE */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="seo-section__eyebrow">Solutions by seller type</p>
          <h2 className="seo-section__h2">Built for How You Actually Sell</h2>
          <p className="seo-section__lead">
            Whether you take orders on Instagram, run a home bakery on WhatsApp, or own a small retail shop — we have a specific solution for your exact situation.
          </p>
          <div className="seo-features">
            {sellerTypes.map((t) => (
              <Link key={t.href} href={t.href} className="seo-feature-card" style={{ textDecoration: 'none' }}>
                <div className="seo-feature-card__icon">{t.emoji}</div>
                <div>
                  <div className="seo-feature-card__title">{t.label}</div>
                  <p className="seo-feature-card__desc">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="seo-section">
        <p className="seo-section__eyebrow">Platform tools</p>
        <h2 className="seo-section__h2">Everything You Need in One Place</h2>
        <div className="seo-features">
          {tools.map((t) => (
            <Link key={t.href} href={t.href} className="seo-feature-card" style={{ textDecoration: 'none' }}>
              <div className="seo-feature-card__icon">{t.emoji}</div>
              <div>
                <div className="seo-feature-card__title">{t.label}</div>
                <p className="seo-feature-card__desc">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="seo-links-box">
          <p className="seo-links-box__title">Explore More</p>
          <ul className="seo-links-box__list">
            <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
            <li><Link href="/products">Browse Products</Link></li>
            <li><Link href="/shop">See Kerala Shops</Link></li>
            <li><Link href="/register/seller">Register as Seller</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
      </section>

      {/* BRAND CLOSING */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          "Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, or a way to grow — Kerala Sellers is the solution."
        </p>
        <Link href="/register/seller" className="seo-closer__cta" id="solutions-bottom-cta">
          Create Your Free Online Store →
        </Link>
      </section>

      {/* FAQ */}
      <section className="seo-faq">
        <h2 className="seo-faq__h2">Frequently Asked Questions</h2>
        <FaqAccordion faqs={faqs} />
      </section>

    </SeoPageLayout>
  );
}
