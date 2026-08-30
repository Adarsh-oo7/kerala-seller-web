    'use client';

import Link from 'next/link';
import SeoPageLayout from '../../components/seo/SeoPageLayout';
import FaqAccordion from '../../components/seo/FaqAccordion';
import {
  Smartphone, Store, ShoppingBag, Package, CreditCard, Share2,
  TrendingUp, Users, Receipt, Globe, ShieldCheck, Printer, Barcode,
  Sparkles, CheckCircle2, ArrowRight, DollarSign, Zap, Truck
} from 'lucide-react';

const faqs = [
  {
    q: 'Can I use Kerala Sellers completely from my mobile phone?',
    a: 'Yes! The seller dashboard is 100% mobile-friendly. You can upload products, manage stock, view orders, update delivery status, and track payments from any smartphone without needing a computer.',
  },
  {
    q: 'Do you provide a custom subdomain for my store?',
    a: 'Yes! Kerala Sellers provides custom subdomains (e.g. yourshop.keralasellers.in) so you get your own official, branded web address. It builds instant customer trust and looks highly professional on Instagram, WhatsApp, and business cards.',
  },
  {
    q: 'How does shipping and delivery work for sellers?',
    a: 'You can set custom local delivery rules (by district or panchayat). Automated easy shipping partner integrations are Coming Soon! Register today and stay in touch with us to get early access and unlock exclusive premium growth offers for your shop.',
  },
  {
    q: 'What add-ons are available for my shop?',
    a: 'We offer flexible add-ons so you only pay for what your shop needs. Add-ons include: Custom Subdomain (yourshop.keralasellers.in), POS & Billing for offline receipts, Multi-Staff Logins, Multi-Location management, Barcode scanner & Thermal printer support, and Extra Product Capacity.',
  },
  {
    q: 'Is there really 0% commission on sales?',
    a: 'Yes, 0% commission forever! Unlike Amazon, Flipkart, or Swiggy which take 15% to 40% per sale, Kerala Sellers charges only a flat monthly subscription. 100% of your earnings go straight to your bank account via Razorpay.',
  },
  {
    q: 'How affordable is Kerala Sellers compared to building a website?',
    a: 'Building a custom website costs ₹20,000 to ₹1,00,000+ with recurring hosting fees. Kerala Sellers gives you a live online store in 10 minutes with free setup and low flat monthly plans starting at budget-friendly rates for small businesses.',
  },
];

const coreFeatures = [
  {
    icon: <Smartphone size={28} color="#1a4845" />,
    title: 'Mobile-First App & Dashboard',
    desc: 'Run your shop anytime, anywhere from your smartphone. Designed specifically for Kerala sellers on mobile — responsive, fast, and easy to use.',
    tag: 'Mobile Ready',
  },
  {
    icon: <Globe size={28} color="#1a4845" />,
    title: 'Custom Subdomain (yourshop.keralasellers.in)',
    desc: 'Get your own branded subdomain address (yourshop.keralasellers.in). Give your business an official online identity that customers trust instantly.',
    tag: 'Branded Link',
  },
  {
    icon: <Truck size={28} color="#1a4845" />,
    title: 'Easy Shipping & Delivery Partners',
    desc: 'Set custom delivery rules today. Automated shipping partner integrations are Coming Soon — keep in touch for early access & premium growth offers.',
    tag: 'Coming Soon',
  },
  {
    icon: <Store size={28} color="#1a4845" />,
    title: 'Branded Online Store Builder',
    desc: 'Upload your shop logo, custom banner, store bio, and list products in 10 minutes. Share your store URL anywhere.',
    tag: 'No Coding',
  },
  {
    icon: <ShoppingBag size={28} color="#1a4845" />,
    title: 'Unified Order Management',
    desc: 'All customer orders land in one clean dashboard. Track order stages from Confirmed → Packed → Shipped → Delivered with instant alerts.',
    tag: 'All Channels',
  },
  {
    icon: <Package size={28} color="#1a4845" />,
    title: 'Real-Time Inventory Sync',
    desc: 'Auto-deduct stock on every purchase. Automatic "Out of Stock" badges prevent overselling, plus low-stock alerts and variant options.',
    tag: 'Zero Oversell',
  },
  {
    icon: <CreditCard size={28} color="#1a4845" />,
    title: '0% Commission UPI Payments',
    desc: 'Integrated Razorpay checkout supporting Google Pay, PhonePe, Paytm, cards, and net banking. Money goes straight to your bank account.',
    tag: '0% Cut',
  },
  {
    icon: <Share2 size={28} color="#1a4845" />,
    title: 'Instagram & WhatsApp Sharing',
    desc: 'One-click store links for Instagram Bio, WhatsApp Status, Facebook posts, and broadcast groups. Turn DMs into completed orders.',
    tag: 'Social Commerce',
  },
];

const addonFeatures = [
  {
    icon: <Globe size={28} color="#059669" />,
    title: 'Custom Subdomain Add-on (yourshop.keralasellers.in)',
    desc: 'Upgrade your store link to a custom subdomain (e.g. fashion.keralasellers.in) for higher brand authority, trust, and memorability.',
    price: 'Branding Extra',
  },
  {
    icon: <Receipt size={28} color="#059669" />,
    title: 'POS & Billing Add-on',
    desc: 'Generate digital and printable invoices for offline walk-in customers. Combine physical shop billing with online store sales in one system.',
    price: 'Affordable Add-on',
  },
  {
    icon: <Truck size={28} color="#059669" />,
    title: 'Delivery Partner Integrations',
    desc: 'Automated shipping partner integrations to generate dispatch labels, book pickups, and ship orders across Kerala and India with ease.',
    price: 'Seller Growth',
  },
  {
    icon: <Users size={28} color="#059669" />,
    title: 'Multi-Staff Logins',
    desc: 'Add staff or helpers with role permissions to manage orders, stock, and customer enquiries without sharing admin credentials.',
    price: 'Team Tool',
  },
  {
    icon: <Barcode size={28} color="#059669" />,
    title: 'Barcode & Thermal Printer Integration',
    desc: 'Scan barcodes directly with smartphone cameras and connect Bluetooth/USB thermal printers to print instant receipts.',
    price: 'Retail Ready',
  },
  {
    icon: <Package size={28} color="#059669" />,
    title: 'Extra Product Capacity',
    desc: 'Scale your product catalogue anytime. Buy extra listing capacity as your inventory grows without changing your core plan.',
    price: 'Scalable',
  },
];

export default function FeaturesPage() {
  return (
    <SeoPageLayout
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Features & Add-ons' },
      ]}
    >
      {/* HERO SECTION */}
      <section className="seo-hero" aria-labelledby="features-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Sparkles size={16} color="#a3e635" />
            <span>The All-in-One Digital Growth Platform for Kerala Sellers</span>
          </div>

          <h1 className="seo-hero__h1" id="features-h1">
            All Features &amp; Add-ons to <em>Sell, Manage &amp; Scale Anywhere</em>
          </h1>

          <p className="seo-hero__sub">
            Run your entire business from your mobile phone. Get your own custom subdomain (yourshop.keralasellers.in), store link, order tracking, stock sync, 0% commission payments, POS billing, and easy shipping partner integrations.
          </p>

          <div className="seo-hero__pills">
            <span className="seo-hero__pill">✓ Custom Subdomains</span>
            <span className="seo-hero__pill">✓ Easy Shipping Partners</span>
            <span className="seo-hero__pill">✓ 100% Mobile Ready</span>
            <span className="seo-hero__pill">✓ 0% Commission Forever</span>
            <span className="seo-hero__pill">✓ POS Billing Add-on</span>
          </div>

          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="features-hero-start-btn">
              <Store size={20} />
              <span>Start Your Free Store Now →</span>
            </Link>
            <Link href="/solutions" className="seo-btn-secondary">
              <span>View Business Solutions</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="seo-stats" role="region" aria-label="Key features summary">
        {[
          { n: '1000+', l: 'Active Sellers' },
          { n: '0%', l: 'Commission Cut' },
          { n: 'yourshop.', l: 'Custom Subdomains' },
          { n: 'Kerala', l: 'Shipping Partners' },
        ].map((s) => (
          <div key={s.l} className="seo-stat">
            <span className="seo-stat__number">{s.n}</span>
            <span className="seo-stat__label">{s.l}</span>
          </div>
        ))}
      </div>

      {/* CUSTOM SUBDOMAIN & SHIPPING HIGHLIGHT */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* CUSTOM SUBDOMAIN CARD */}
          <div style={{
            background: '#fff',
            border: '2px solid #1a4845',
            borderRadius: 20,
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                <Globe size={16} />
                <span>CUSTOM SUBDOMAIN SUPPORT</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a2b2a', marginBottom: 10 }}>
                Get Your Own Branded Address:<br />
                <span style={{ color: '#1a4845' }}>yourshop.keralasellers.in</span>
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.6, marginBottom: 16 }}>
                Stand out with a clean, official web link for your business. Custom subdomains build instant trust with Instagram buyers, WhatsApp contacts, and local customers.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Official yourshop.keralasellers.in link', 'Build brand authority & trust', 'Easy to share on Instagram bio & WhatsApp'].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: '#374151' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/register/seller" className="seo-btn-primary" style={{ justifyContent: 'center' }}>
              Claim Your Subdomain →
            </Link>
          </div>

          {/* SHIPPING & DELIVERY PARTNERS CARD */}
          <div style={{
            background: 'linear-gradient(135deg, #1a4845 0%, #2d6b5e 100%)',
            color: '#fff',
            borderRadius: 20,
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(163, 230, 53, 0.2)', color: '#a3e635', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                <Truck size={16} />
                <span>COMING SOON · EARLY ACCESS</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
                Easy Shipping &amp; Delivery Partners (Coming Soon)
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: 16 }}>
                Automated shipping partner integrations are coming soon! Set your custom delivery rules today, and stay in touch with us to get early access and unlock exclusive premium growth offers.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Custom district & local panchayat delivery rules',
                  'Integrated delivery partners coming soon for easy shipping',
                  'Stay in touch for early access & premium growth offers',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: '#f0fdf4' }}>
                    <CheckCircle2 size={16} color="#a3e635" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/register/seller" className="seo-btn-primary" style={{ background: '#a3e635', color: '#1a4845', justifyContent: 'center' }}>
              Register &amp; Get Early Access Offers →
            </Link>
          </div>
        </div>
      </section>

      {/* MOBILE EASY TO USE ANYWHERE HIGHLIGHT */}
      <section className="seo-section">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 20,
            padding: '40px 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28,
            alignItems: 'center',
          }}>
            <div>
              <span style={{
                background: '#f0fdf4',
                color: '#166534',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}>
                📱 MOBILE APP &amp; SMARTPHONE ACCESS
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, margin: '16px 0 12px', color: '#1a2b2a' }}>
                Easy to Use Anywhere from Your Phone
              </h2>
              <p style={{ fontSize: '1.02rem', lineHeight: 1.6, color: '#4b5563', marginBottom: 20 }}>
                No computer required! Managing orders, adding products, updating inventory, and sending bill receipts can all be done directly from your mobile smartphone in seconds. Perfect for busy sellers on the move.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Fast touch-friendly interface on mobile browser',
                  'Instant order notifications on your phone',
                  'Update stock immediately after restocking',
                  'Share store link straight to WhatsApp Status & Instagram Bio',
                ].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.95rem', color: '#374151' }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: 28,
              textAlign: 'center',
            }}>
              <Smartphone size={54} color="#1a4845" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a2b2a', marginBottom: 8 }}>
                100% Smartphone Optimised
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
                Works smoothly on Android and iPhone with zero app installation needed.
              </p>
              <Link href="/register/seller" className="seo-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Try Mobile Store Free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="seo-section__eyebrow">Core Platform Capabilities</p>
          <h2 className="seo-section__h2">Everything Included in Your Online Store</h2>
          <p className="seo-section__lead">
            Built specifically for Instagram resellers, WhatsApp sellers, home businesses, and small shops in Kerala.
          </p>

          <div className="seo-features">
            {coreFeatures.map((f) => (
              <div key={f.title} className="seo-feature-card">
                <div className="seo-feature-card__icon">{f.icon}</div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div className="seo-feature-card__title">{f.title}</div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#f0fdf4',
                      color: '#166534',
                      padding: '2px 8px',
                      borderRadius: 10,
                      border: '1px solid #bbf7d0',
                    }}>
                      {f.tag}
                    </span>
                  </div>
                  <p className="seo-feature-card__desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADD-ONS SECTION */}
      <section className="seo-section">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="seo-section__eyebrow">Flexible Add-ons</p>
          <h2 className="seo-section__h2">Add-ons Section — Buy Only What Your Shop Needs</h2>
          <p className="seo-section__lead">
            Keep your monthly plan low and add powerful extras (like Custom Subdomains &amp; POS Billing) only when your business expands. No forced expensive tiers.
          </p>

          <div className="seo-features">
            {addonFeatures.map((f) => (
              <div key={f.title} className="seo-feature-card" style={{ borderLeft: '4px solid #059669' }}>
                <div className="seo-feature-card__icon">{f.icon}</div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div className="seo-feature-card__title">{f.title}</div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#ecfdf5',
                      color: '#047857',
                      padding: '2px 8px',
                      borderRadius: 10,
                      border: '1px solid #a7f3d0',
                    }}>
                      {f.price}
                    </span>
                  </div>
                  <p className="seo-feature-card__desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AFFORDABILITY & PRICING GUARANTEE */}
      <section className="seo-section seo-section--alt">
        <div style={{
          background: '#FDFFF0',
          border: '2px dashed #1a4845',
          borderRadius: 20,
          padding: '36px 28px',
          textAlign: 'center',
          maxWidth: 900,
          margin: '0 auto',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', padding: '6px 16px', borderRadius: 20, marginBottom: 14 }}>
            <DollarSign size={18} color="#166534" />
            <span style={{ fontWeight: 700, color: '#166534', fontSize: 13 }}>UNBEATABLE AFFORDABILITY</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, color: '#1a2b2a', marginBottom: 12 }}>
            0% Commission &amp; Extremely Affordable Monthly Plans
          </h2>

          <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.6, maxWidth: 700, margin: '0 auto 24px' }}>
            Why pay 15% to 40% commission on Amazon or Swiggy? Or ₹30,000 for a website you cannot update yourself?
            With Kerala Sellers, you get your own store, keep 100% of your profits, and pay only a small budget-friendly flat monthly subscription.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 20px', textStyle: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a4845', display: 'block' }}>0%</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Commission Cut</span>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 20px', textStyle: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a4845', display: 'block' }}>₹0</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Setup Fee</span>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 20px', textStyle: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a4845', display: 'block' }}>100%</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Profit Kept</span>
            </div>
          </div>

          <Link href="/register/seller" className="seo-btn-primary" id="features-affordability-cta">
            Start Free Store Now — Free Setup →
          </Link>
        </div>
      </section>

      {/* BRAND CLOSER */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          "Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, a custom subdomain, or shipping partners — Kerala Sellers is the solution."
        </p>
        <Link href="/register/seller" className="seo-closer__cta" id="features-bottom-cta">
          Create Your Free Online Store →
        </Link>
      </section>

      {/* INTERNAL LINKS BOX */}
      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Deep-Dive Feature Pages &amp; Persona Guides</p>
          <ul className="seo-links-box__list">
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/features/inventory-management">Inventory Sync</Link></li>
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
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
