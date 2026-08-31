'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';
import DemoVideoSection from '../../../components/seo/DemoVideoSection';
import ProblemSolutionSection from '../../../components/seo/ProblemSolutionSection';
import HowItWorksSteps from '../../../components/seo/HowItWorksSteps';
import TrustStatsBar from '../../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../../components/seo/TestimonialsGrid';
import { ClipboardList, Bell, Smartphone, BarChart3, Search, CreditCard, Store, Sparkles } from 'lucide-react';

const faqs = [
  { q: 'Order engane track cheyyam easily?', a: 'Kerala Sellers-il ondu dashboard und — athu undakkunna ella ordersm kanaan. Customer details, payment status, delivery status — ellam ondu screen-il.' },
  { q: 'Can I manage orders from my phone?', a: 'Yes. The order dashboard is fully mobile-optimised. Accept, update, and fulfil orders from your smartphone — no desktop needed.' },
  { q: 'What information do I get with each order?', a: 'You get the customer name, phone number, delivery address, items ordered, quantities, payment amount, and payment status.' },
  { q: 'Can customers track their order status?', a: 'Yes. You can update order status (confirmed, packed, shipped, delivered) and customers receive updates accordingly.' },
  { q: 'How do I get notified of new orders?', a: 'You receive an instant notification via the dashboard when a new order is placed.' },
];

const problems = [
  { problem: 'Orders scattered across WhatsApp, Instagram DMs, and Facebook messages', solution: 'One dashboard collects every order regardless of where the customer came from.' },
  { problem: 'Confusing which customer ordered what and whether they paid', solution: 'Each order has a unique ID, customer details, item list, and clear payment status.' },
  { problem: 'Chasing UPI payment screenshots and manually confirming each order', solution: 'Razorpay payment confirmation is automatic. You see "paid" the moment money arrives.' },
  { problem: 'Forgetting to update the customer on delivery status', solution: 'Update order status in one tap. Customers are notified at each stage.' },
];

const features = [
  { icon: <ClipboardList size={24} color="#1a4845" />, title: 'Unified Order Dashboard', desc: 'Every order — from every channel — lands in one clean view with customer name, items, amount, and payment status.' },
  { icon: <Bell size={24} color="#1a4845" />, title: 'Instant Order Notifications', desc: 'Get alerted the moment a customer places an order. Never miss a sale again.' },
  { icon: <Smartphone size={24} color="#1a4845" />, title: 'Manage From Your Phone', desc: 'Fully mobile-ready. View, accept, pack, and mark orders delivered — right from your smartphone.' },
  { icon: <BarChart3 size={24} color="#1a4845" />, title: 'Order Status Tracking', desc: 'Mark orders as confirmed → packed → shipped → delivered. Customers get status updates automatically.' },
  { icon: <Search size={24} color="#1a4845" />, title: 'Search & Filter Orders', desc: 'Filter by date, payment status, or delivery status. Find any order in seconds.' },
  { icon: <CreditCard size={24} color="#1a4845" />, title: 'Payment Status at a Glance', desc: 'See instantly which orders are paid, pending, or refunded — no manual reconciliation.' },
];

export default function OrderManagementPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Features', href: '/features' }, { label: 'Order Management' }]}>
      {/* HERO */}
      <section className="seo-hero" aria-labelledby="om-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Sparkles size={14} color="#a3e635" />
            <span>Unified Order Management System</span>
          </div>
          <h1 className="seo-hero__h1" id="om-h1">Simple <em>Order Management</em> for Sellers</h1>
          <p className="seo-hero__sub">Stop losing orders in WhatsApp chats and Instagram DMs. Every order you receive lands in one clean dashboard with customer details, payment status, and delivery info.</p>
          <div className="seo-hero__pills">
            {['✓ One dashboard', '✓ All channels', '✓ Mobile-ready', '✓ Instant alerts'].map(p => <span key={p} className="seo-hero__pill">{p}</span>)}
          </div>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="om-start-btn">
              <Store size={18} />
              <span>Start Managing Orders Free →</span>
            </Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">See Full Platform</Link>
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <TrustStatsBar />

      {/* DEMO VIDEO SECTION */}
      <DemoVideoSection
        title="Manage All Orders in One Dashboard"
        subtitle="Watch how orders from your store, Instagram, and WhatsApp flow into one clean mobile dashboard."
        videoTitle="Manage All Orders in One Dashboard"
        youtubeId="ETjJ4BHp06o"
      />

      {/* MULTI-CHANNEL VISUAL & STATUS CHIPS */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1000, margin: '0 auto', textStyle: 'center', textAlign: 'center' }}>
          <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
            📋 UNIFIED ORDER PIPELINE
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, margin: '16px 0 12px', color: '#1a2b2a' }}>
            Multi-Channel Orders ➔ One Mobile Screen
          </h2>
          <p style={{ fontSize: '1rem', color: '#4b5563', maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Track every order through clear status badges on your smartphone.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '8px 18px', borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
              ✓ Paid
            </span>
            <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '8px 18px', borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
              ⏳ Pending
            </span>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '8px 18px', borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
              📦 Packed
            </span>
            <span style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '8px 18px', borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
              🚚 Shipped
            </span>
            <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', padding: '8px 18px', borderRadius: 20, fontWeight: 700, fontSize: 14 }}>
              🎉 Delivered
            </span>
          </div>
        </div>
      </section>

      {/* PROBLEMS -> SOLUTIONS */}
      <ProblemSolutionSection
        title="Order Chaos — Sound Familiar?"
        subtitle="Eliminate scattered WhatsApp orders, missing payments, and lost delivery notes."
        items={problems}
      />

      {/* HOW IT WORKS */}
      <HowItWorksSteps
        title="How Order Fulfillment Works"
        subtitle="4 easy steps to receive, pack, and mark orders delivered."
      />

      {/* FEATURES GRID */}
      <section className="seo-section">
        <div className="seo-section__header">
          <p className="seo-section__eyebrow">CAPABILITIES</p>
          <h2 className="seo-section__h2">Everything You Need to Run Orders Smoothly</h2>
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
        <Link href="/register/seller" className="seo-btn-primary" id="om-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
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
            <li><Link href="/features/inventory-management">Inventory Management</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
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
