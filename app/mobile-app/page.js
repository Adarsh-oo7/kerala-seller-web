'use client';

import Link from 'next/link';
import SeoPageLayout from '../../components/seo/SeoPageLayout';
import FaqAccordion from '../../components/seo/FaqAccordion';
import TrustStatsBar from '../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../components/seo/TestimonialsGrid';
import {
  Smartphone, Package, CheckCircle2, TrendingUp, CreditCard,
  Printer, Bell, Store, ArrowRight, ShieldCheck, Zap, Globe,
  Download, QrCode, Sparkles, CheckCircle, Barcode, Users, ShoppingBag
} from 'lucide-react';

const mobileFaqs = [
  {
    q: 'Can I manage my entire Kerala Sellers store from my phone?',
    a: 'Yes. The Kerala Sellers mobile app allows you to create and edit products, update pricing, view and manage orders, monitor stock in real time, track customer details, and print receipts directly from your smartphone.',
  },
  {
    q: 'Is the Kerala Sellers mobile app available for Android and iOS?',
    a: 'Yes, the mobile app is built for Android (supporting Android 8.0 and above) with direct APK and Google Play Store support, as well as iOS compatibility for iPhones and iPads.',
  },
  {
    q: 'Can I connect a Bluetooth thermal printer to print bills from the app?',
    a: 'Yes. The app features integrated Mobile POS billing with wireless Bluetooth connectivity for standard 58mm and 80mm thermal receipt printers. You can generate and print bills in 2 seconds over the counter.',
  },
  {
    q: 'Do customers need to download the mobile app to buy from my shop?',
    a: 'No. Your customers do not need to download any app. They can simply open your custom store link on any mobile browser (from Instagram, WhatsApp, or Google), browse your catalogue, and checkout seamlessly.',
  },
  {
    q: 'Does the mobile app sync stock between offline counter sales and my online store?',
    a: 'Yes. When you bill a product at your physical counter using the mobile POS in the app, your online catalogue stock decreases instantly in real time, preventing overselling.',
  },
];

const mobileStats = [
  { n: '100%', l: 'Store in Your Hand' },
  { n: '2 sec', l: 'Bluetooth Print' },
  { n: 'Android', l: '8.0+ & iOS Ready' },
  { n: '0%', l: 'Commission Cut' },
];

const appFeatures = [
  {
    icon: <Package size={26} color="#1a4845" />,
    title: 'Snap & Add Products in 30 Seconds',
    desc: 'Take product photos with your smartphone camera, type title and price, and publish to your online shop immediately.',
  },
  {
    icon: <Bell size={26} color="#1a4845" />,
    title: 'Instant Order Push Notifications',
    desc: 'Never miss a sale. Receive live notifications on your phone lock screen whenever an Instagram, WhatsApp, or web order is placed.',
  },
  {
    icon: <Printer size={26} color="#1a4845" />,
    title: 'Mobile POS & 2-Second Thermal Printing',
    desc: 'Connect any 58mm wireless Bluetooth thermal printer to your phone and issue physical receipts over the counter in 2 seconds.',
  },
  {
    icon: <TrendingUp size={26} color="#1a4845" />,
    title: 'Unified Real-Time Inventory Sync',
    desc: 'When an item sells in your retail shop, online stock drops automatically. Update stock quantities and variants anytime from your pocket.',
  },
  {
    icon: <CreditCard size={26} color="#1a4845" />,
    title: 'Live Payment & Settlement Tracking',
    desc: 'Track UPI payments, card transactions, and COD collections. View daily revenue, orders count, and sales trends at a glance.',
  },
  {
    icon: <Barcode size={26} color="#1a4845" />,
    title: 'Phone Camera Barcode Scanner',
    desc: 'Use your phone camera as a high-speed barcode reader to scan items for counter billing or fast stock lookups without extra hardware.',
  },
  {
    icon: <Users size={26} color="#1a4845" />,
    title: 'Customer Directory & 1-Tap WhatsApp',
    desc: 'Access customer delivery addresses, phone numbers, and past orders. Send digital WhatsApp PDF bills with one single tap.',
  },
  {
    icon: <Globe size={26} color="#1a4845" />,
    title: 'Instant Social & Store Link Sharing',
    desc: 'Copy and share your shop link directly to your Instagram bio, WhatsApp status, broadcast lists, and Facebook pages in seconds.',
  },
];

export default function MobileAppPage() {
  return (
    <SeoPageLayout
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'Mobile App' },
      ]}
    >
      {/* HERO SECTION */}
      <section className="seo-hero" aria-labelledby="app-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Smartphone size={16} color="#a3e635" />
            <span>Complete Store Management in Your Hand</span>
          </div>

          <h1 className="seo-hero__h1" id="app-h1">
            Manage Your Online Store <em>from Your Phone</em>
          </h1>

          <p className="seo-hero__sub">
            Add products, receive instant order alerts, update stock, track payments, and run counter POS billing using the Kerala Sellers mobile app. Everything you need to grow your retail or social selling business — right from your smartphone.
          </p>

          <div className="seo-hero__pills">
            <span className="seo-hero__pill">✓ Real-Time Order Alerts</span>
            <span className="seo-hero__pill">✓ 58mm Bluetooth Printing</span>
            <span className="seo-hero__pill">✓ Camera Barcode Scanner</span>
            <span className="seo-hero__pill">✓ Unified Stock Sync</span>
            <span className="seo-hero__pill">✓ Android 8.0+ &amp; iOS</span>
          </div>

          <div className="seo-hero__cta">
            <Link
              href="/register/seller"
              className="seo-btn-primary"
              id="mobile-app-hero-start-btn"
              onClick={() => typeof window !== 'undefined' && typeof window.ksTrack === 'function' && window.ksTrack('start_99_store_click', { source: 'mobile_app_hero' })}
            >
              <Store size={20} />
              <span>Start Your ₹99 Store Now →</span>
            </Link>
            <Link href="#app-features" className="seo-btn-secondary">
              <span>See App Features</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <TrustStatsBar stats={mobileStats} />

      {/* APP OVERVIEW / VISUAL HIGHLIGHT */}
      <section className="seo-section seo-section--alt" id="app-features">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="seo-section__header">
            <p className="seo-section__eyebrow">YOUR SHOP ON THE GO</p>
            <h2 className="seo-section__h2">Everything You Need to Run Your Business on Mobile</h2>
            <p className="seo-section__lead">
              Whether you are at your counter, packing orders at home, or on the move — manage your products, sales, and customers effortlessly.
            </p>
          </div>

          <div className="seo-features-grid">
            {appFeatures.map((f, idx) => (
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

      {/* HOW SELLERS USE THE APP */}
      <section className="seo-section">
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
            ⚡ 4 WAYS THE APP SAVES TIME EVERY DAY
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, margin: '16px 0 28px', color: '#1a4845' }}>
            Built for Real Shop Owners &amp; Social Sellers in Kerala
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, textAlign: 'left' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📸</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1a4845' }}>1. Add New Stock Instantly</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                New items arrived? Open the app, click photos, set prices and quantity. Your online store is updated in seconds.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔔</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1a4845' }}>2. Process Incoming Orders</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                Get an instant notification when a customer orders. Mark as accepted, packed, or shipped with one tap.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🖨️</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1a4845' }}>3. Counter POS Billing</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                Walk-in customer at your counter? Tap items or scan barcode, connect Bluetooth printer, and print receipts in 2 seconds.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1a4845' }}>4. 1-Tap WhatsApp Sharing</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                Share digital PDF receipts and order tracking links directly to customer WhatsApp chats without typing phone numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL COMPATIBILITY & APP DOWNLOAD CARD */}
      <section className="seo-section seo-section--alt" id="download">
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          background: 'linear-gradient(135deg, #1a4845 0%, #2d6b5e 100%)',
          borderRadius: 24,
          padding: '40px 32px',
          color: '#fff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32,
          alignItems: 'center',
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
              📱 ANDROID &amp; IOS COMPATIBILITY
            </span>
            <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, margin: '16px 0 12px', color: '#fff' }}>
              Run Your Store on Any Smartphone
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Tested with Android devices running Android 8.0 and later. Supports Samsung, Xiaomi, Vivo, Oppo, Realme, OnePlus, and iOS devices.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              <li>✓ <strong>Quick Installation:</strong> Direct app APK &amp; Google Play Store package</li>
              <li>✓ <strong>Bluetooth 4.0/5.0:</strong> Connects to all standard 58mm/80mm thermal receipt printers</li>
              <li>✓ <strong>Secure &amp; Private:</strong> Safe OTP authentication and encrypted data transmission</li>
              <li>✓ <strong>Buyer Independence:</strong> Your customers shop via web browser — zero app download required for buyers</li>
            </ul>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link
                href="/register/seller"
                className="seo-btn-primary"
                style={{ background: '#a3e635', color: '#1a4845', fontWeight: 800 }}
                onClick={() => typeof window !== 'undefined' && typeof window.ksTrack === 'function' && window.ksTrack('seller_registration_start', { source: 'mobile_app_download_cta' })}
              >
                <Store size={18} />
                <span>Register &amp; Get Mobile App Access →</span>
              </Link>
            </div>
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.15)' }}>
            <Smartphone size={80} color="#a3e635" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Kerala Sellers App</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Complete Seller Dashboard in Your Pocket</div>
            <div style={{ marginTop: 20, padding: '10px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, fontSize: 12, color: '#a3e635' }}>
              ⚡ Works alongside the ₹99/month Online Store plan
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* CLOSER / CTA */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          &ldquo;Your complete store management system in your hand — manage orders, stock, and counter sales from anywhere in Kerala.&rdquo;
        </p>
        <Link
          href="/register/seller"
          className="seo-btn-primary"
          id="mobile-app-bottom-cta"
          style={{ background: '#a3e635', color: '#1a4845' }}
          onClick={() => typeof window !== 'undefined' && typeof window.ksTrack === 'function' && window.ksTrack('start_99_store_click', { source: 'mobile_app_bottom_cta' })}
        >
          <Store size={18} />
          <span>Start Your ₹99 Mobile Store →</span>
        </Link>
      </section>

      {/* INTERNAL LINKS */}
      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Related Solutions &amp; Tools</p>
          <ul className="seo-links-box__list">
            <li><Link href="/features/pos-billing-software">Mobile POS Billing</Link></li>
            <li><Link href="/features/online-store-builder">Online Store Builder</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/features/inventory-management">Inventory Sync</Link></li>
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
            <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
          </ul>
        </div>
      </section>

      {/* FAQS */}
      <section className="seo-faq">
        <h2 className="seo-faq__h2">Frequently Asked Questions</h2>
        <FaqAccordion faqs={mobileFaqs} />
      </section>
    </SeoPageLayout>
  );
}
