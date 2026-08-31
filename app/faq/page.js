'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import SeoPageLayout from '../../components/seo/SeoPageLayout';
import FaqAccordion from '../../components/seo/FaqAccordion';
import DemoVideoSection from '../../components/seo/DemoVideoSection';
import TrustStatsBar from '../../components/seo/TrustStatsBar';
import { HelpCircle, Search, Store, MessageSquare, PhoneCall, Sparkles } from 'lucide-react';

const allFaqs = [
  { category: 'Getting Started', q: 'What is Kerala Sellers?', a: 'Kerala Sellers is a zero-commission e-commerce platform built for sellers in Kerala. It gives you your own online store link, order management dashboard, inventory tracking, and payment collection — all in one place. No commission on sales. Flat monthly subscription.' },
  { category: 'Getting Started', q: 'Who can sell on Kerala Sellers?', a: 'Any individual or business in Kerala — Instagram sellers, WhatsApp resellers, home bakers, boutique owners, jewellery sellers, handicraft makers, small retail shops, and any local business that wants to sell online.' },
  { category: 'Pricing & Commission', q: 'Is there any commission on sales?', a: '0% commission forever. Kerala Sellers charges a small flat monthly subscription. Every rupee from your sales goes directly to you via Razorpay into your bank account.' },
  { category: 'Getting Started', q: 'Online aayi business thudangan enthu cheyyanam?', a: 'Kerala Sellers-il free register cheyyuka. Shop name, logo, products add cheyyuka. Oru store link kittum — Instagram bio-yl, WhatsApp status-il share cheyyuka. Customers browse cheytu order place cheyyum. Setup time: 10 minutes.' },
  { category: 'Pricing & Commission', q: 'How much does it cost to start an online store on Kerala Sellers?', a: 'Creating an account is free. Paid plans activate your live store. Plans start at very affordable monthly rates — far less than building a website or paying marketplace commissions.' },
  { category: 'Getting Started', q: 'Do I need coding skills or technical knowledge?', a: 'None. If you can use Instagram or WhatsApp, you can set up your Kerala Sellers store. It takes about 10 minutes.' },
  { category: 'Selling Online', q: 'Can I sell only within Kerala?', a: 'Yes. You control your delivery zones — local district, all-Kerala, or anywhere. Most sellers on the platform do Kerala-only delivery.' },
  { category: 'Payments', q: 'What payment methods can my customers use?', a: 'UPI, credit/debit cards, net banking, and wallets — all via Razorpay. Payments go directly into your Razorpay account and then to your bank.' },
  { category: 'Social Media', q: 'WhatsApp il varunna order engane manage cheyyam?', a: 'Kerala Sellers store link WhatsApp Status-il post cheyyuka. Customers click cheytu, browse cheytu, cart-il add cheytu, checkout cheyyum. Order dashboard-il automatically varum — no manual tracking needed.' },
  { category: 'Social Media', q: 'Instagram DM order track cheyyan app ethanu best?', a: 'Kerala Sellers gives you a link to put in your Instagram bio. Followers tap the link, browse your products, and place orders directly — no DMs needed for the order itself.' },
  { category: 'Features & Subdomains', q: 'Can I get a custom subdomain like myshop.keralasellers.in?', a: 'Yes. Custom subdomain (yourshop.keralasellers.in) is available as an add-on or included on Pro plans. It gives your store a more branded, professional URL.' },
  { category: 'Pricing & Commission', q: 'Is Kerala Sellers different from Amazon, Flipkart, or Meesho?', a: 'Very different. On those platforms you compete with thousands of sellers and pay 15–40% commission. On Kerala Sellers, you have your own branded store, your own customer list, and 0% commission.' },
  { category: 'Getting Started', q: 'Can I manage my store from a mobile phone?', a: 'Yes. The seller dashboard is fully mobile-optimised. Manage orders, update stock, add products, and view sales from your smartphone.' },
  { category: 'Getting Started', q: 'I run a home bakery. Can I use Kerala Sellers?', a: 'Absolutely. Many of our sellers run home bakeries, homemade pickle businesses, and handcraft shops. Set your products, prices, available quantities, and delivery zones. Customers order online and you deliver locally.' },
  { category: 'POS & Billing', q: 'Does Kerala Sellers support physical shop POS billing?', a: 'Yes. With our POS & Billing add-on and ₹3,499 Bluetooth printer kit, you can generate thermal receipt bills for walk-in counter customers. Offline billing auto-deducts from your online store stock.' },
  { category: 'Getting Started', q: 'How do I get started?', a: 'Go to keralasellers.in/register/seller, sign up with your mobile number, set up your shop details, add your products, and share your store link. You are live in 10 minutes.' },
];

const categories = ['All', 'Getting Started', 'Pricing & Commission', 'Selling Online', 'Social Media', 'Payments', 'POS & Billing'];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ & Help Center' }]}>
      {/* HERO */}
      <section className="seo-hero" aria-labelledby="faq-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <HelpCircle size={14} color="#a3e635" />
            <span>Seller Help Center &amp; Knowledge Base</span>
          </div>
          <h1 className="seo-hero__h1" id="faq-h1">
            Everything You Want to <em>Know About KeralaSellers</em>
          </h1>
          <p className="seo-hero__sub">
            Clear, simple answers for sellers across Kerala — about starting, selling, orders, payments, billing, and growing your business.
          </p>

          {/* SEARCH BAR */}
          <div style={{ maxWidth: 540, margin: '0 auto 20px', position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search questions (e.g. commission, WhatsApp, billing, delivery)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                borderRadius: 30,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.95)',
                fontSize: 15,
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <TrustStatsBar />

      {/* DEMO VIDEO SECTION */}
      <DemoVideoSection
        title="How KeralaSellers Works — Quick 60-Sec Demo"
        subtitle="Watch how sellers launch their online store and manage counter sales from their phone."
        videoTitle="How KeralaSellers Works — Quick Demo"
      />

      {/* CATEGORY TABS & ACCORDION */}
      <section className="seo-faq" style={{ maxWidth: 900, padding: '48px 24px 64px' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                border: activeCategory === cat ? 'none' : '1px solid #cbd5e1',
                background: activeCategory === cat ? '#1a4845' : '#ffffff',
                color: activeCategory === cat ? '#a3e635' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredFaqs.length > 0 ? (
          <FaqAccordion faqs={filteredFaqs} />
        ) : (
          <div style={{ textStyle: 'center', padding: '32px 0', textAlign: 'center', color: '#64748b' }}>
            No matching questions found for &ldquo;{searchQuery}&rdquo;. Try another term or contact our support team.
          </div>
        )}
      </section>

      {/* INTERNAL LINKS */}
      <section className="seo-section" style={{ paddingTop: 0, paddingBottom: 48 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Explore Feature Guides &amp; Solutions</p>
          <ul className="seo-links-box__list">
            <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
            <li><Link href="/solutions">All Solutions</Link></li>
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
            <li><Link href="/for/home-businesses">Home Businesses</Link></li>
            <li><Link href="/for/small-businesses">Small Businesses</Link></li>
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/features/pos-billing-software">POS Billing Software</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/features/inventory-management">Inventory Management</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </section>

      {/* CLOSER / CONTACT CTA */}
      <section className="seo-closer" style={{ padding: '56px 24px' }}>
        <p className="seo-closer__quote">Still have questions? We are happy to help you get started.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/contact" className="seo-btn-secondary" id="faq-contact-btn">
            <MessageSquare size={18} />
            <span>Contact Support →</span>
          </Link>
          <Link href="/register/seller" className="seo-btn-primary" style={{ background: '#a3e635', color: '#1a4845' }}>
            <Store size={18} />
            <span>Start Free Store</span>
          </Link>
        </div>
      </section>
    </SeoPageLayout>
  );
}
