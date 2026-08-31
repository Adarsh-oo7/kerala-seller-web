'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';
import DemoVideoSection from '../../../components/seo/DemoVideoSection';
import ProblemSolutionSection from '../../../components/seo/ProblemSolutionSection';
import HowItWorksSteps from '../../../components/seo/HowItWorksSteps';
import TrustStatsBar from '../../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../../components/seo/TestimonialsGrid';
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

const posStats = [
  { n: '2 sec', l: 'Thermal Bill Print' },
  { n: '₹3,499', l: 'Complete Billing Kit' },
  { n: '1 Stock', l: 'Offline & Online Synced' },
  { n: '0%', l: 'Commission Cut' },
];

const posProblems = [
  {
    problem: 'Buying heavy POS billing hardware costs ₹25,000–₹60,000 and requires computers',
    solution: 'Turn your Android phone into a POS billing machine. Connect a ₹3,499 Bluetooth printer and start.',
  },
  {
    problem: 'Managing physical counter sales and online orders separately causes stock errors',
    solution: 'Counter billing automatically deducts from your online stock in real time. Zero double sales.',
  },
  {
    problem: 'Manual paper receipts are easy to lose and hard to account for tax compliance',
    solution: 'Generate instant GST tax invoices or Non-GST bills with digital WhatsApp PDF receipt sharing.',
  },
];

const posFeatures = [
  {
    icon: <Printer size={26} color="#1a4845" />,
    title: 'Instant Bluetooth Thermal Printing',
    desc: 'Connect any 58mm or 80mm wireless Bluetooth printer. Print receipts in 2 seconds directly from your phone over the counter.',
  },
  {
    icon: <Receipt size={26} color="#1a4845" />,
    title: 'GST & Non-GST Billing',
    desc: 'Generate professional tax invoices with CGST/SGST and HSN codes or instant simplified retail receipts for walk-in customers.',
  },
  {
    icon: <Barcode size={26} color="#1a4845" />,
    title: 'Mobile Camera Barcode Scanner',
    desc: 'Scan barcodes instantly using your smartphone camera or connect external USB/Bluetooth barcode scanners for fast checkout.',
  },
  {
    icon: <Zap size={26} color="#1a4845" />,
    title: 'WhatsApp Digital Bill Sharing',
    desc: 'Send digital PDF receipts directly to your customer’s WhatsApp number with one tap. Save paper and build customer contact list.',
  },
  {
    icon: <Package size={26} color="#1a4845" />,
    title: 'Unified Inventory Auto-Deduction',
    desc: 'Every item sold at your physical billing counter instantly updates inventory across your online store and WhatsApp store. No double entries.',
  },
  {
    icon: <Users size={26} color="#1a4845" />,
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
            <Link href="#how-it-works" className="seo-btn-secondary">
              <span>How It Works</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR (Styled Trust Bar) */}
      <TrustStatsBar stats={posStats} />

      {/* DEMO VIDEO SECTION */}
      <DemoVideoSection
        title="Create &amp; Print a Bill From Your Phone (POS)"
        subtitle="Watch how easily a retail shop owner in Kerala can select items, tap print, and share bills via WhatsApp."
        videoTitle="Create &amp; Print a Bill From Your Phone (POS)"
        youtubeId="ETjJ4BHp06o"
      />

      {/* VISUAL POS BILLING FLOW */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
            📱 MOBILE BILLING IN 3 SECONDS
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, margin: '16px 0 12px', color: '#1a4845' }}>
            Smartphone ➔ Select Items ➔ Print Thermal Receipt
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 28 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📱</div>
              <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1a4845' }}>1. Select Products</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Tap items or scan camera barcode</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🧾</div>
              <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1a4845' }}>2. Create Bill</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Select GST or Non-GST retail invoice</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔗</div>
              <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1a4845' }}>3. Connect Printer</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Wireless Bluetooth 58mm printer</p>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🖨️</div>
              <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#166534' }}>4. Print Receipt</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#14532d' }}>Thermal paper print in 2 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMS -> SOLUTIONS */}
      <ProblemSolutionSection
        title="Why Kerala Shops Are Switching to Mobile POS"
        subtitle="Stop paying ₹40,000 for bulky billing hardware. Operate your counter and online store from one smartphone."
        items={posProblems}
      />

      {/* PRINTER KIT PROMO BLOCK */}
      <section className="seo-section">
        <div style={{
          background: 'linear-gradient(135deg, #1a4845 0%, #2d6b5e 100%)',
          borderRadius: 20,
          padding: '40px 32px',
          color: '#ffffff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32,
          alignItems: 'center',
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
              🖨️ STARTER HARDWARE KIT
            </span>
            <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 800, margin: '14px 0 10px', color: '#ffffff' }}>
              ₹3,499 Bluetooth POS Billing Kit
            </h3>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Includes 58mm wireless Bluetooth thermal printer, starter thermal paper rolls, setup guide, and full mobile billing software access.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              <li>✓ 30% Pre-book reservation (₹1,049.70)</li>
              <li>✓ Works with all Android smartphones</li>
              <li>✓ Instant WhatsApp PDF bill sharing</li>
              <li>✓ Auto stock sync with online store</li>
            </ul>
            <Link href="/register/seller" className="seo-btn-primary" style={{ background: '#a3e635', color: '#1a4845' }}>
              <Printer size={18} />
              <span>Order Billing Kit Free Setup →</span>
            </Link>
          </div>
          <div style={{ textStyle: 'center', textAlign: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)' }}>
            <Printer size={80} color="#a3e635" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>₹3,499 One-Time</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>No monthly hardware rental</div>
          </div>
        </div>
      </section>

      {/* POS FEATURES GRID */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="seo-section__header">
            <p className="seo-section__eyebrow">COMPLETE POS SYSTEM</p>
            <h2 className="seo-section__h2">Everything Needed for Physical Counter Billing</h2>
          </div>
          <div className="seo-features-grid">
            {posFeatures.map((f, idx) => (
              <div key={idx} className="seo-feature-card">
                <div className="seo-feature-card__icon-box">{f.icon}</div>
                <div>
                  <h3 className="seo-feature-card__title">{f.title}</h3>
                  <p className="seo-feature-card__desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div id="how-it-works">
        <HowItWorksSteps
          title="Start Mobile POS Billing in 4 Steps"
          subtitle="Simple Bluetooth printer pairing and 2-second bill printing."
        />
      </div>

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* CLOSER / CTA */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          &ldquo;Turn your smartphone into a complete POS billing machine and accept counter sales with 0% commission.&rdquo;
        </p>
        <Link href="/register/seller" className="seo-btn-primary" id="pos-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>Start Mobile Billing Free →</span>
        </Link>
      </section>

      {/* INTERNAL LINKS */}
      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Related Solutions &amp; Guides</p>
          <ul className="seo-links-box__list">
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/features/inventory-management">Inventory Management</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/for/small-businesses">Small Businesses</Link></li>
            <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
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
