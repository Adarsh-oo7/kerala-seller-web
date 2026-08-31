'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';
import {
  Printer, Smartphone, Receipt, Barcode, ShieldCheck, Zap,
  CheckCircle2, Store, ShoppingBag, Truck, DollarSign, Sparkles, Package, Users
} from 'lucide-react';

const faqs = [
  {
    q: 'Mobile-il ninnu bill print cheyyan engane?',
    a: 'Kerala Sellers app നിങ്ങളുടെ ഫോണിൽ ഇൻസ്റ്റാൾ ചെയ്യുക. Bluetooth വഴിയോ USB വഴിയോ 58mm/80mm Thermal Printer കണക്റ്റ് ചെയ്യുക. 2 സെക്കന്റിൽ ജിഎസ് ടി അല്ലെങ്കിൽ നോൺ-ജിഎസ് ടി ബില്ലുകൾ പ്രിന്റ് ചെയ്യാം.',
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

const posFeatures = [
  {
    icon: <Printer size={28} color="#1a4845" />,
    title: 'Instant Bluetooth Thermal Printing',
    desc: 'Connect any 58mm or 80mm wireless Bluetooth printer. Print receipts in 2 seconds directly from your phone over the counter.',
  },
  {
    icon: <Receipt size={28} color="#1a4845" />,
    title: 'GST & Non-GST Billing',
    desc: 'Generate professional tax invoices with CGST/SGST and HSN codes or instant simplified retail receipts for walk-in customers.',
  },
  {
    icon: <Barcode size={28} color="#1a4845" />,
    title: 'Mobile Camera Barcode Scanner',
    desc: 'Scan barcodes instantly using your smartphone camera or connect external USB/Bluetooth barcode scanners for fast checkout.',
  },
  {
    icon: <Zap size={28} color="#1a4845" />,
    title: 'WhatsApp Digital Bill Sharing',
    desc: 'Send digital PDF receipts directly to your customer’s WhatsApp number with one tap. Save paper and build customer contact list.',
  },
  {
    icon: <Package size={28} color="#1a4845" />,
    title: 'Unified Inventory Auto-Deduction',
    desc: 'Every item sold at your physical billing counter instantly updates inventory across your online store and WhatsApp store. No double entries.',
  },
  {
    icon: <Users size={28} color="#1a4845" />,
    title: 'Customer History & Loyalty',
    desc: 'Track repeat customer purchases, total spend, phone numbers, and credit balances across offline counter sales and online orders.',
  },
];

export default function PosBillingSoftwarePage() {
  return (
    <SeoPageLayout
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'POS Billing Software' },
      ]}
    >
      {/* HERO SECTION */}
      <section className="seo-hero" aria-labelledby="pos-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Printer size={16} color="#a3e635" />
            <span>Turn Your Smartphone into a POS Billing Machine</span>
          </div>

          <h1 className="seo-hero__h1" id="pos-h1">
            POS Billing Software &amp; <em>Mobile Machine in Kerala</em>
          </h1>

          <p className="seo-hero__sub">
            No expensive computer or bulky billing machine needed! Print Bluetooth thermal bills, manage GST &amp; non-GST invoices, track inventory, and operate your physical shop and online store from one phone.
          </p>

          <div className="seo-hero__pills">
            <span className="seo-hero__pill">✓ Bluetooth Thermal Printing</span>
            <span className="seo-hero__pill">✓ GST &amp; Non-GST Invoices</span>
            <span className="seo-hero__pill">✓ Unified Inventory Sync</span>
            <span className="seo-hero__pill">✓ ₹3,499 Billing Kit</span>
            <span className="seo-hero__pill">✓ WhatsApp Bill Sharing</span>
          </div>

          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="pos-hero-start-btn">
              <Store size={20} />
              <span>Start Mobile Billing Free →</span>
            </Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">
              <span>How It Works</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="seo-stats" role="region" aria-label="POS stats">
        {[
          { n: '2 sec', l: 'Thermal Bill Printing' },
          { n: '₹3,499', l: 'Complete Billing Kit' },
          { n: '1 Stock', l: 'Offline & Online Synced' },
          { n: '0%', l: 'Commission' },
        ].map((s) => (
          <div key={s.l} className="seo-stat">
            <span className="seo-stat__number">{s.n}</span>
            <span className="seo-stat__label">{s.l}</span>
          </div>
        ))}
      </div>

      {/* THE UNIFIED MOAT SECTION */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textStyle: 'center', marginBottom: 36, textAlign: 'center' }}>
            <span style={{
              background: '#f0fdf4',
              color: '#166534',
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}>
              🔗 THE UNIFIED BUSINESS MOAT
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, margin: '14px 0 10px', color: '#1a2b2a' }}>
              One Seller Account → One Stock → All Selling Channels
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#4b5563', maxWidth: 720, margin: '0 auto', lineHeight: 1.6 }}>
              Most systems force you to manage offline billing and online orders separately. Kerala Sellers connects physical counter billing with your online store, Instagram DMs, and WhatsApp sales seamlessly.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>📦</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a2b2a', marginBottom: 8 }}>One Master Inventory</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.55 }}>
                1 item sold at your physical counter? Online stock decreases instantly. 1 item ordered on WhatsApp? Counter stock updates automatically.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>🏪</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a2b2a', marginBottom: 8 }}>One Product Catalogue</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.55 }}>
                Add a product once with photo, price, and barcode. Use it immediately for physical POS billing, online store, and WhatsApp catalogue.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>👥</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a2b2a', marginBottom: 8 }}>One Customer Database</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.55 }}>
                Walk-in counter buyers and online customers are merged into one customer directory. Build loyalty and send marketing updates easily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POS FEATURES GRID */}
      <section className="seo-section">
        <p className="seo-section__eyebrow">Mobile Billing Features</p>
        <h2 className="seo-section__h2">Everything You Need to Run Counter Billing from Your Phone</h2>
        <p className="seo-section__lead">
          Designed for grocery stores, bakeries, clothing boutiques, mobile shops, stationery, hardware, and retail shops across Kerala.
        </p>

        <div className="seo-features">
          {posFeatures.map((f) => (
            <div key={f.title} className="seo-feature-card">
              <div className="seo-feature-card__icon">{f.icon}</div>
              <div>
                <div className="seo-feature-card__title">{f.title}</div>
                <p className="seo-feature-card__desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ₹3,499 BILLING KIT SECTION */}
      <section className="seo-section seo-section--alt">
        <div style={{
          background: 'linear-gradient(135deg, #1a4845 0%, #2d6b5e 100%)',
          color: '#fff',
          borderRadius: 20,
          padding: '40px 32px',
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 32,
            alignItems: 'center',
          }}>
            <div>
              <span style={{
                background: 'rgba(163, 230, 53, 0.2)',
                color: '#a3e635',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
              }}>
                🖨️ COMPLETE HARDWARE + SOFTWARE KIT
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, margin: '16px 0 12px', color: '#fff' }}>
                ₹3,499 Complete Mobile POS Billing Kit
              </h2>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.9)', marginBottom: 20 }}>
                Turn your Android smartphone into a high-speed POS billing machine! Everything you need to bill walk-in customers professionally.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Wireless 58mm Bluetooth Thermal Receipt Printer',
                  'Kerala Sellers Mobile POS Billing Software access',
                  'Starter thermal paper rolls + printer charger',
                  'GST & Non-GST bill creation with WhatsApp sharing',
                  'Reserve today with 30% pre-book offer (₹1,049.70 now)',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.95rem', color: '#f0fdf4' }}>
                    <CheckCircle2 size={18} color="#a3e635" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 16,
              padding: 28,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.9rem', color: '#a3e635', fontWeight: 700, textTransform: 'uppercase' }}>Special Pre-Order Offer</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: '8px 0 4px' }}>₹3,499</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>Complete Kit (Printer + App + Paper)</div>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 12, marginBottom: 20 }}>
                <span style={{ fontSize: '0.85rem', display: 'block', color: 'rgba(255,255,255,0.9)' }}>Reserve Today with 30% Pre-Book:</span>
                <strong style={{ fontSize: '1.2rem', color: '#a3e635' }}>₹1,049.70</strong>
                <span style={{ fontSize: '0.78rem', display: 'block', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Balance ₹2,449.30 on delivery</span>
              </div>
              <Link href="/register/seller" className="seo-btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#a3e635', color: '#1a4845' }}>
                Pre-Book Billing Kit Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND CLOSER */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          "Turn your phone into a POS machine with Kerala Sellers — ₹3,499 complete billing kit, 0% commission, and connected online store."
        </p>
        <Link href="/register/seller" className="seo-closer__cta" id="pos-bottom-cta">
          Start Your Free Store &amp; Billing →
        </Link>
      </section>

      {/* INTERNAL LINKS BOX */}
      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Explore Platform Features &amp; Solutions</p>
          <ul className="seo-links-box__list">
            <li><Link href="/features">All Features &amp; Add-ons</Link></li>
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/features/inventory-management">Inventory Management</Link></li>
            <li><Link href="/for/small-businesses">Small Businesses</Link></li>
            <li><Link href="/for/home-businesses">Home Businesses</Link></li>
            <li><Link href="/solutions">All Solutions</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
          </ul>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="seo-faq">
        <h2 className="seo-faq__h2">Frequently Asked Questions</h2>
        <FaqAccordion faqs={faqs} />
      </section>
    </SeoPageLayout>
  );
}
