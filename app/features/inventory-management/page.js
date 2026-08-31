'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';
import DemoVideoSection from '../../../components/seo/DemoVideoSection';
import ProblemSolutionSection from '../../../components/seo/ProblemSolutionSection';
import HowItWorksSteps from '../../../components/seo/HowItWorksSteps';
import TrustStatsBar from '../../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../../components/seo/TestimonialsGrid';
import { Package, Bell, Slash, Layers, BarChart3, Smartphone, Store, Sparkles } from 'lucide-react';

const faqs = [
  { q: 'Stock engane manage cheyyam without overselling?', a: 'Kerala Sellers-il products add cheyyumbol quantity set cheyyam. Oru product sell aakumbol stock auto-reduce aakum. Zero aakumbol automatically "Out of Stock" kaanikkum.' },
  { q: 'Will customers see when a product is out of stock?', a: 'Yes. Products automatically display as out-of-stock on your store when quantity hits zero. Customers cannot add them to cart, preventing overselling.' },
  { q: 'Can I get alerts when stock is running low?', a: 'Yes. You can set low-stock thresholds and receive notifications when a product approaches that limit, giving you time to restock before selling out.' },
  { q: 'Can I manage different variants (size, colour) of the same product?', a: 'Yes. Create product variants with individual stock quantities for each option. Customers select their variant and you track each one separately.' },
  { q: 'Can I bulk update stock quantities?', a: 'Yes. You can update stock quantities for multiple products at once from your dashboard — useful after a restocking run.' },
];

const problems = [
  { problem: 'Selling the same item to two customers and having to cancel one order', solution: 'Real-time stock deduction. Once someone orders, quantity reduces instantly for everyone else.' },
  { problem: 'Manually updating your WhatsApp status, Instagram story, and shop — impossible to keep in sync', solution: 'Update stock once on your dashboard. It reflects everywhere, instantly.' },
  { problem: 'Not knowing you ran out of a popular product until orders pile up', solution: 'Low-stock alerts tell you before you run out — giving time to restock.' },
  { problem: 'Customers ordering a size you do not have because you forgot to update it', solution: 'Track each variant separately. Small, medium, large — each has its own count.' },
];

const features = [
  { icon: <Package size={24} color="#1a4845" />, title: 'Real-Time Stock Tracking', desc: 'Set quantity per product. Every sale auto-deducts from stock. Always accurate, always live.' },
  { icon: <Bell size={24} color="#1a4845" />, title: 'Low-Stock Alerts', desc: 'Set thresholds. Get notified before you run out — not after disappointing a customer.' },
  { icon: <Slash size={24} color="#1a4845" />, title: 'Auto Out-of-Stock Badges', desc: 'When stock hits zero, the product automatically shows as unavailable. Customers cannot order what you do not have.' },
  { icon: <Layers size={24} color="#1a4845" />, title: 'Variant Stock Management', desc: 'Track stock for each size, colour, or variant independently. Sell small/medium/large separately.' },
  { icon: <BarChart3 size={24} color="#1a4845" />, title: 'Stock Overview Dashboard', desc: 'See all products and their current stock levels at a glance. Spot what needs restocking immediately.' },
  { icon: <Smartphone size={24} color="#1a4845" />, title: 'Update Stock from Your Phone', desc: 'Restock after a supply run? Update quantities directly from your mobile in seconds.' },
];

export default function InventoryManagementPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Features', href: '/features' }, { label: 'Inventory Management' }]}>
      {/* HERO */}
      <section className="seo-hero" aria-labelledby="inv-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Sparkles size={14} color="#a3e635" />
            <span>Automatic Inventory &amp; Stock Sync</span>
          </div>
          <h1 className="seo-hero__h1" id="inv-h1">Simple <em>Inventory Management</em> for Online Sellers</h1>
          <p className="seo-hero__sub">
            Overselling damages customer trust. KeralaSellers tracks your stock in real time — products go out-of-stock automatically when quantity hits zero.
            <br /><em style={{ opacity: 0.9, fontSize: '0.9em', fontStyle: 'normal' }}>Stock engane manage cheyyam — auto aakum.</em>
          </p>
          <div className="seo-hero__pills">
            {['✓ Real-time tracking', '✓ Auto out-of-stock', '✓ Variant support', '✓ Mobile updates'].map(p => <span key={p} className="seo-hero__pill">{p}</span>)}
          </div>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="inv-start-btn">
              <Store size={18} />
              <span>Start Managing Stock Free →</span>
            </Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">See Full Platform</Link>
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <TrustStatsBar />

      {/* DEMO VIDEO SECTION */}
      <DemoVideoSection
        title="Track Your Stock Automatically"
        subtitle="Watch how real-time inventory deduction prevents double sales and keeps your online store accurate."
        videoTitle="Track Your Stock Automatically"
      />

      {/* INVENTORY VISUAL FLOW */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
            📦 AUTOMATIC STOCK SYNC
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, margin: '16px 0 12px', color: '#1a2b2a' }}>
            Never Oversell a Product Again
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 24 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1a4845' }}>1. Initial Stock</div>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>Product Quantity: <strong>12 units</strong></p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1a4845' }}>2. Customer Buys 2</div>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>Online/Counter sale auto-deducts</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1a4845' }}>3. Auto Stock Update</div>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>Updated Quantity: <strong>10 units</strong></p>
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#991b1b' }}>4. Out of Stock</div>
              <p style={{ margin: '6px 0 0', color: '#7f1d1d', fontSize: 14 }}>Auto-disabled at 0 stock</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS -> SOLUTIONS */}
      <ProblemSolutionSection
        title="Why Sellers Lose Trust — and Sales"
        subtitle="Eliminate manual stock spreadsheets and disappointed customers."
        items={problems}
      />

      {/* HOW IT WORKS */}
      <HowItWorksSteps
        title="4 Steps to Automatic Inventory Control"
        subtitle="Set quantities once, update on restocks, and let the system handle the rest."
      />

      {/* FEATURES GRID */}
      <section className="seo-section">
        <div className="seo-section__header">
          <p className="seo-section__eyebrow">FEATURES</p>
          <h2 className="seo-section__h2">Stock Management Built for Busy Sellers</h2>
        </div>
        <div className="seo-features-grid">
          {features.map(f => (
            <div key={f.title} className="seo-feature-card">
              <div className="seo-feature-card__icon-box">{f.icon}</div>
              <div>
                <h3 className="seo-feature-card__title">{f.title}</h3>
                <p className="seo-feature-card__desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* BRAND CLOSER */}
      <section className="seo-closer">
        <p className="seo-closer__quote">&ldquo;Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, or a way to grow — KeralaSellers is the solution.&rdquo;</p>
        <Link href="/register/seller" className="seo-btn-primary" id="inv-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>Create Your Free Online Store →</span>
        </Link>
      </section>

      {/* INTERNAL LINKS */}
      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Related Feature Pages</p>
          <ul className="seo-links-box__list">
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/features/pos-billing-software">POS Billing Software</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/for/home-businesses">Home Businesses</Link></li>
            <li><Link href="/for/small-businesses">Small Businesses</Link></li>
            <li><Link href="/solutions">All Solutions</Link></li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="seo-faq">
        <h2 className="seo-faq__h2">Frequently Asked Questions</h2>
        <FaqAccordion faqs={faqs} />
      </section>
    </SeoPageLayout>
  );
}
