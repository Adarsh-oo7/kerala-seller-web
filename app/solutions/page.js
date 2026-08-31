'use client';

import Link from 'next/link';
import SeoPageLayout from '../../components/seo/SeoPageLayout';
import FaqAccordion from '../../components/seo/FaqAccordion';
import TrustStatsBar from '../../components/seo/TrustStatsBar';
import DemoVideoSection from '../../components/seo/DemoVideoSection';
import TestimonialsGrid from '../../components/seo/TestimonialsGrid';
import { Store, Camera, MessageSquare, Home, ShoppingBag, Printer, Package, CheckCircle2 } from 'lucide-react';

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

const solutionsStats = [
  { n: '1000+', l: 'Active Sellers' },
  { n: '0%', l: 'Commission Cut' },
  { n: '10 min', l: 'Live Setup Time' },
  { n: '14+', l: 'Districts Covered' },
];

const sellerTypes = [
  { href: '/for/instagram-sellers', icon: <Camera size={24} color="#1a4845" />, label: 'Instagram Sellers', desc: 'Turn DMs into tracked orders with a single bio link' },
  { href: '/for/whatsapp-sellers', icon: <MessageSquare size={24} color="#1a4845" />, label: 'WhatsApp Sellers', desc: 'Manage every order from WhatsApp status & groups' },
  { href: '/for/home-businesses', icon: <Home size={24} color="#1a4845" />, label: 'Home Businesses', desc: 'Sell from home, deliver locally with 0% commission' },
  { href: '/for/small-businesses', icon: <ShoppingBag size={24} color="#1a4845" />, label: 'Small Businesses', desc: 'Storefront, POS counter billing, and stock in one app' },
];

const tools = [
  { href: '/features/online-store-builder', icon: <Store size={24} color="#1a4845" />, label: 'Online Store Builder', desc: 'Your own store link in 10 minutes (keralasellers.in/shop/name)' },
  { href: '/features/pos-billing-software', icon: <Printer size={24} color="#1a4845" />, label: 'POS Billing Software', desc: 'Turn your phone into a Bluetooth thermal billing machine' },
  { href: '/features/order-management', icon: <CheckCircle2 size={24} color="#1a4845" />, label: 'Order Management', desc: 'All Instagram, WhatsApp & counter orders in one dashboard' },
  { href: '/features/inventory-management', icon: <Package size={24} color="#1a4845" />, label: 'Inventory Sync', desc: 'Counter sales automatically update online stock in real time' },
];

const journey = [
  { step: 'START', desc: 'Create your free online store in 10 minutes. No coding. No website cost.' },
  { step: 'SELL', desc: 'Share your store link on Instagram, WhatsApp, and Facebook. Customers order themselves.' },
  { step: 'MANAGE', desc: 'View orders, update stock, and track payments — all from one mobile-friendly dashboard.' },
  { step: 'GROW', desc: 'See your top products, revenue trends, and customer data. Make smarter decisions.' },
];

export default function SolutionsPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Solutions' }]}>
      {/* HERO */}
      <section className="seo-hero" aria-labelledby="solutions-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Store size={16} color="#a3e635" />
            <span>All-in-One Digital Growth Solution</span>
          </div>
          <h1 className="seo-hero__h1" id="solutions-h1">
            One Complete Solution <em>for Your Business</em>
          </h1>
          <p className="seo-hero__sub">
            From creating your online store to managing orders, inventory, payments and customers —
            Kerala Sellers brings your essential business and digital growth tools together in one simple solution.
            <br /><em style={{ fontStyle: 'normal', opacity: 0.8, fontSize: '0.9em' }}>Ella business needum onnu chernu — one platform.</em>
          </p>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="solutions-start-btn">
              <Store size={20} />
              <span>Start Your Free Store →</span>
            </Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">
              <span>See How It Works</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <TrustStatsBar stats={solutionsStats} />

      {/* DEMO VIDEO */}
      <DemoVideoSection
        title="Everything Your Business Needs in One Platform"
        subtitle="Watch how a small seller in Kerala can launch a store, manage WhatsApp orders, and print POS bills from one phone."
        videoTitle="What is KeralaSellers — Platform Overview"
        youtubeId="ggkqC6ALK_c"
      />

      {/* START -> SELL -> MANAGE -> GROW */}
      <section className="seo-section">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="seo-section__eyebrow">YOUR DIGITAL GROWTH JOURNEY</p>
          <h2 className="seo-section__h2">Start ➔ Sell ➔ Manage ➔ Grow</h2>
          <p className="seo-section__lead">
            Kerala Sellers is designed around one simple idea: every seller, wherever they are in their business journey, should have exactly what they need in one place.
          </p>
          <div className="seo-features-grid">
            {journey.map((j) => (
              <div key={j.step} className="seo-feature-card" style={{ borderLeft: '4px solid #1a4845' }}>
                <div>
                  <h3 className="seo-feature-card__title">{j.step}</h3>
                  <p className="seo-feature-card__desc">{j.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR YOUR SELLER TYPE */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="seo-section__eyebrow">SOLUTIONS BY SELLER TYPE</p>
          <h2 className="seo-section__h2">Built for How You Actually Sell</h2>
          <p className="seo-section__lead">
            Whether you take orders on Instagram, run a home bakery on WhatsApp, or own a small retail shop — we have a specific solution for your exact situation.
          </p>
          <div className="seo-features-grid">
            {sellerTypes.map((t) => (
              <Link key={t.href} href={t.href} className="seo-feature-card" style={{ textDecoration: 'none' }}>
                <div className="seo-feature-card__icon-box">{t.icon}</div>
                <div>
                  <h3 className="seo-feature-card__title">{t.label}</h3>
                  <p className="seo-feature-card__desc">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM TOOLS */}
      <section className="seo-section">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="seo-section__eyebrow">MODULAR PLATFORM TOOLS</p>
          <h2 className="seo-section__h2">Everything You Need in One Place</h2>
          <div className="seo-features-grid">
            {tools.map((t) => (
              <Link key={t.href} href={t.href} className="seo-feature-card" style={{ textDecoration: 'none' }}>
                <div className="seo-feature-card__icon-box">{t.icon}</div>
                <div>
                  <h3 className="seo-feature-card__title">{t.label}</h3>
                  <p className="seo-feature-card__desc">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="seo-links-box" style={{ marginTop: 40 }}>
            <p className="seo-links-box__title">Explore More Guides &amp; Solutions</p>
            <ul className="seo-links-box__list">
              <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
              <li><Link href="/features/pos-billing-software">POS Billing Software</Link></li>
              <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
              <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
              <li><Link href="/products">Browse Products</Link></li>
              <li><Link href="/shop">See Kerala Shops</Link></li>
              <li><Link href="/register/seller">Register as Seller</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* BRAND CLOSING */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          &ldquo;Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, or a way to grow — Kerala Sellers is the solution.&rdquo;
        </p>
        <Link href="/register/seller" className="seo-btn-primary" id="solutions-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>Create Your Free Online Store →</span>
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
