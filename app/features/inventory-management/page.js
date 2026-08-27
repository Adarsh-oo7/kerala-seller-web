'use client';
import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';

const faqs = [
  { q: 'Stock engane manage cheyyam without overselling?', a: 'Kerala Sellers-il products add cheyyumbol quantity set cheyyam. Oru product sell aakumbol stock auto-reduce aakum. Zero aakumbol automatically "Out of Stock" kaanikkum.' },
  { q: 'Will customers see when a product is out of stock?', a: 'Yes. Products automatically display as out-of-stock on your store when quantity hits zero. Customers cannot add them to cart, preventing overselling.' },
  { q: 'Can I get alerts when stock is running low?', a: 'Yes. You can set low-stock thresholds and receive notifications when a product approaches that limit, giving you time to restock before selling out.' },
  { q: 'Can I manage different variants (size, colour) of the same product?', a: 'Yes. Create product variants with individual stock quantities for each option. Customers select their variant and you track each one separately.' },
  { q: 'Can I bulk update stock quantities?', a: 'Yes. You can update stock quantities for multiple products at once from your dashboard — useful after a restocking run.' },
];

const features = [
  { emoji: '📦', title: 'Real-Time Stock Tracking', desc: 'Set quantity per product. Every sale auto-deducts from stock. Always accurate, always live.' },
  { emoji: '🔔', title: 'Low-Stock Alerts', desc: 'Set thresholds. Get notified before you run out — not after disappointing a customer.' },
  { emoji: '🚫', title: 'Auto Out-of-Stock', desc: 'When stock hits zero, the product automatically shows as unavailable. Customers cannot order what you do not have.' },
  { emoji: '🎨', title: 'Variant Stock Management', desc: 'Track stock for each size, colour, or variant independently. Sell small/medium/large separately.' },
  { emoji: '📊', title: 'Stock Overview Dashboard', desc: 'See all products and their current stock levels at a glance. Spot what needs restocking immediately.' },
  { emoji: '📱', title: 'Update Stock from Your Phone', desc: 'Restock after a supply run? Update quantities directly from your mobile in seconds.' },
];

export default function InventoryManagementPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Features', href: '/solutions' }, { label: 'Inventory Management' }]}>
      <section className="seo-hero" aria-labelledby="inv-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">📦 Inventory Management</div>
          <h1 className="seo-hero__h1" id="inv-h1">Simple <em>Inventory Management</em> for Online Sellers</h1>
          <p className="seo-hero__sub">
            Overselling is embarrassing and damages customer trust. Kerala Sellers tracks your stock in real time — products go out-of-stock automatically when you run out, so you never disappoint a customer again.
            <br /><em style={{ opacity: 0.75, fontSize: '0.88em', fontStyle: 'normal' }}>Stock engane manage cheyyam — auto aakum.</em>
          </p>
          <div className="seo-hero__pills">
            {['✓ Real-time tracking', '✓ Auto out-of-stock', '✓ Variant support', '✓ Mobile updates'].map(p => <span key={p} className="seo-hero__pill">{p}</span>)}
          </div>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="inv-start-btn">🏪 Start Managing Stock Free →</Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">See Full Platform</Link>
          </div>
        </div>
      </section>

      <div className="seo-stats">
        {[{ n: '0', l: 'Oversells' }, { n: 'Auto', l: 'Stock Updates' }, { n: '∞', l: 'Products Trackable' }, { n: '📱', l: 'Phone-First' }].map(s => (
          <div key={s.l} className="seo-stat"><span className="seo-stat__number">{s.n}</span><span className="seo-stat__label">{s.l}</span></div>
        ))}
      </div>

      <section className="seo-section">
        <p className="seo-section__eyebrow">The problem</p>
        <h2 className="seo-section__h2">Why Sellers Lose Trust — and Sales</h2>
        <div className="seo-problems">
          {[
            { emoji: '😩', problem: 'Selling the same item to two customers and having to cancel one order', solution: 'Real-time stock deduction. Once someone orders, quantity reduces instantly for everyone else.' },
            { emoji: '😵', problem: 'Manually updating your WhatsApp status, Instagram story, and shop — impossible to keep in sync', solution: 'Update stock once on your dashboard. It reflects everywhere, instantly.' },
            { emoji: '📦', problem: 'Not knowing you ran out of a popular product until orders pile up', solution: 'Low-stock alerts tell you before you run out — giving time to restock.' },
            { emoji: '🎨', problem: 'Customers ordering a size you do not have because you forgot to update it', solution: 'Track each variant separately. Small, medium, large — each has its own count.' },
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
          <h2 className="seo-section__h2">Stock Management Built for Busy Sellers</h2>
          <div className="seo-features">
            {features.map(f => (
              <div key={f.title} className="seo-feature-card">
                <div className="seo-feature-card__icon">{f.emoji}</div>
                <div><div className="seo-feature-card__title">{f.title}</div><p className="seo-feature-card__desc">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-closer">
        <p className="seo-closer__quote">"Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, or a way to grow — Kerala Sellers is the solution."</p>
        <Link href="/register/seller" className="seo-closer__cta" id="inv-bottom-cta">Create Your Free Online Store →</Link>
      </section>

      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Related</p>
          <ul className="seo-links-box__list">
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/for/home-businesses">Home Businesses</Link></li>
            <li><Link href="/for/small-businesses">Small Businesses</Link></li>
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
