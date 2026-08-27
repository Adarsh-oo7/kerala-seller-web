'use client';
import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';

const faqs = [
  { q: 'Order engane track cheyyam easily?', a: 'Kerala Sellers-il ondu dashboard und — athu undakkunna ella ordersm kanaan. Customer details, payment status, delivery status — ellam ondu screen-il.' },
  { q: 'Can I manage orders from my phone?', a: 'Yes. The order dashboard is fully mobile-optimised. Accept, update, and fulfil orders from your smartphone — no desktop needed.' },
  { q: 'What information do I get with each order?', a: 'You get the customer name, phone number, delivery address, items ordered, quantities, payment amount, and payment status.' },
  { q: 'Can customers track their order status?', a: 'Yes. You can update order status (confirmed, packed, shipped, delivered) and customers receive updates accordingly.' },
  { q: 'How do I get notified of new orders?', a: 'You receive an instant notification via the dashboard when a new order is placed.' },
];

const features = [
  { emoji: '📋', title: 'Unified Order Dashboard', desc: 'Every order — from every channel — lands in one clean view with customer name, items, amount, and payment status.' },
  { emoji: '🔔', title: 'Instant Order Notifications', desc: 'Get alerted the moment a customer places an order. Never miss a sale again.' },
  { emoji: '📱', title: 'Manage From Your Phone', desc: 'Fully mobile-ready. View, accept, pack, and mark orders delivered — right from your smartphone.' },
  { emoji: '📊', title: 'Order Status Tracking', desc: 'Mark orders as confirmed → packed → shipped → delivered. Customers get status updates automatically.' },
  { emoji: '🔍', title: 'Search & Filter Orders', desc: 'Filter by date, payment status, or delivery status. Find any order in seconds.' },
  { emoji: '💳', title: 'Payment Status at a Glance', desc: 'See instantly which orders are paid, pending, or refunded — no manual reconciliation.' },
];

export default function OrderManagementPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Features', href: '/solutions' }, { label: 'Order Management' }]}>
      <section className="seo-hero" aria-labelledby="om-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">📋 Order Management</div>
          <h1 className="seo-hero__h1" id="om-h1">Simple <em>Order Management</em> for Sellers</h1>
          <p className="seo-hero__sub">Stop losing orders in WhatsApp chats and Instagram DMs. Every order you receive lands in one clean dashboard — with customer details, payment status, and delivery info — all in one place.</p>
          <div className="seo-hero__pills">
            {['✓ One dashboard', '✓ All channels', '✓ Mobile-ready', '✓ Instant alerts'].map(p => <span key={p} className="seo-hero__pill">{p}</span>)}
          </div>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="om-start-btn">🏪 Start Managing Orders Free →</Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">See Full Platform</Link>
          </div>
        </div>
      </section>

      <div className="seo-stats">
        {[{ n: '1000+', l: 'Sellers Using It' }, { n: '0%', l: 'Commission' }, { n: '1', l: 'Dashboard for All' }, { n: '24/7', l: 'Order Tracking' }].map(s => (
          <div key={s.l} className="seo-stat"><span className="seo-stat__number">{s.n}</span><span className="seo-stat__label">{s.l}</span></div>
        ))}
      </div>

      <section className="seo-section">
        <p className="seo-section__eyebrow">The problem</p>
        <h2 className="seo-section__h2">Order Chaos — Sound Familiar?</h2>
        <div className="seo-problems">
          {[
            { emoji: '😩', problem: 'Orders scattered across WhatsApp, Instagram DMs, and Facebook messages', solution: 'One dashboard collects every order regardless of where the customer came from.' },
            { emoji: '😵', problem: 'Confusing which customer ordered what and whether they paid', solution: 'Each order has a unique ID, customer details, item list, and clear payment status.' },
            { emoji: '💸', problem: 'Chasing UPI payment screenshots and manually confirming each order', solution: 'Razorpay payment confirmation is automatic. You see "paid" the moment money arrives.' },
            { emoji: '📦', problem: 'Forgetting to update the customer on delivery status', solution: 'Update order status in one tap. Customers are notified at each stage.' },
          ].map(p => (
            <div key={p.problem} className="seo-problem-card">
              <div className="seo-problem-card__emoji">{p.emoji}</div>
              <div className="seo-problem-card__problem">❌ {p.problem}</div>
              <div className="seo-problem-card__solution">✓ {p.solution}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="seo-section__eyebrow">Features</p>
          <h2 className="seo-section__h2">Everything You Need to Run Orders Smoothly</h2>
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
        <Link href="/register/seller" className="seo-closer__cta" id="om-bottom-cta">Create Your Free Online Store →</Link>
      </section>

      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Related</p>
          <ul className="seo-links-box__list">
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/features/inventory-management">Inventory Management</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
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
