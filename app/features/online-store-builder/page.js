'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';
import DemoVideoSection from '../../../components/seo/DemoVideoSection';
import ProblemSolutionSection from '../../../components/seo/ProblemSolutionSection';
import HowItWorksSteps from '../../../components/seo/HowItWorksSteps';
import TrustStatsBar from '../../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../../components/seo/TestimonialsGrid';
import { Store, Smartphone, ShoppingCart, Package, Share2, Sparkles, CheckCircle2 } from 'lucide-react';

const faqs = [
  { q: 'Online kada undakkan enthu cheyyanam?', a: 'Kerala Sellers-il register cheyyuka — phone number, shop name, logo, products add cheyyuka, oru store link kittum. Setup time: 10 minutes.' },
  { q: 'Do I need a domain name or hosting to build my online store?', a: 'No. Your store is hosted on Kerala Sellers at keralasellers.in/shop/yourshopname — no separate domain, hosting, or server setup needed.' },
  { q: 'Can I customise my store with my brand colours and logo?', a: 'Yes. You can add your shop name, logo, banner image, and store description. More customisation options are available on higher-tier plans.' },
  { q: 'How many products can I add to my store?', a: 'Product limits depend on your subscription plan. Plans start from affordable monthly rates with increasing product counts.' },
  { q: 'Can my store be found on Google?', a: 'Yes. Each Kerala Sellers store page is indexed by Google. To improve discoverability, use descriptive product names and make sure your store name matches what customers search for.' },
];

const problems = [
  {
    problem: "Hiring a developer costs ₹20,000–₹1,00,000 and takes weeks",
    solution: "Build your own store in 10 minutes for free without writing a single line of code.",
  },
  {
    problem: "Customers ask 'price?' 50 times a day in Instagram & WhatsApp DMs",
    solution: "Share a professional store link where buyers see photos, prices, and stock instantly.",
  },
  {
    problem: "Paying high 15%–40% marketplace commissions to Amazon or Meesho",
    solution: "0% commission forever. Keep 100% of your hard-earned profits.",
  },
];

const features = [
  { icon: <Store size={24} color="#1a4845" />, title: 'Your Own Branded Store Link', desc: 'keralasellers.in/shop/yourname — a permanent, shareable URL you own. Put it everywhere.' },
  { icon: <Smartphone size={24} color="#1a4845" />, title: 'Beautiful Mobile Product Catalogue', desc: 'Upload photos, set prices, add descriptions, create categories. Looks professional on every phone.' },
  { icon: <ShoppingCart size={24} color="#1a4845" />, title: 'Full Checkout & Cart', desc: 'Customers add to cart and checkout with UPI, card, or net banking. Smooth, familiar purchase flow.' },
  { icon: <Package size={24} color="#1a4845" />, title: 'Stock & Variant Management', desc: 'Set quantities, product variants (size, colour), and availability. No overselling, ever.' },
  { icon: <Smartphone size={24} color="#1a4845" />, title: 'Mobile-First by Design', desc: 'Your store looks and works perfectly on every smartphone — no app download needed for customers.' },
  { icon: <Share2 size={24} color="#1a4845" />, title: 'Share Anywhere', desc: 'Instagram bio, WhatsApp Status, Facebook, email, SMS — your store link works on every platform.' },
];

export default function OnlineStoreBuilderPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Features', href: '/features' }, { label: 'Online Store Builder' }]}>
      {/* HERO */}
      <section className="seo-hero" aria-labelledby="osb-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Sparkles size={14} color="#a3e635" />
            <span>Online Store Builder for Small Businesses</span>
          </div>
          <h1 className="seo-hero__h1" id="osb-h1">Build Your <em>Online Store</em> in 10 Minutes</h1>
          <p className="seo-hero__sub">No coding. No website developers. No hosting costs. Get your own shareable store link ready for Instagram, WhatsApp, and Google.</p>
          <div className="seo-hero__pills">
            {['✓ Free to start', '✓ No coding needed', '✓ Mobile-first', '✓ 0% commission'].map(p => <span key={p} className="seo-hero__pill">{p}</span>)}
          </div>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="osb-start-btn">
              <Store size={18} />
              <span>Build Your Store Free →</span>
            </Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">See Full Platform</Link>
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <TrustStatsBar />

      {/* DEMO VIDEO SECTION */}
      <DemoVideoSection
        title="Build Your Online Store in 10 Minutes"
        subtitle="Watch how easily you can customize your store link, upload products, and start receiving orders."
        videoTitle="Build Your Online Store in 10 Minutes"
        youtubeId="GTeeLBSYkjw"
      />

      {/* PROBLEMS -> SOLUTIONS */}
      <ProblemSolutionSection
        title="Why Kerala Sellers Don't Need Expensive Website Developers"
        subtitle="Stop paying massive website setup fees. Build your own store from your smartphone in minutes."
        items={problems}
      />

      {/* HOW IT WORKS */}
      <HowItWorksSteps
        title="From Zero to Live Store in 4 Simple Steps"
        subtitle="Everything is designed for non-technical shop owners and home businesses."
      />

      {/* FEATURES GRID */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="seo-section__header">
            <p className="seo-section__eyebrow">STORE BUILDER FEATURES</p>
            <h2 className="seo-section__h2">Everything Included in Your Online Store</h2>
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
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* BRAND CLOSER */}
      <section className="seo-closer">
        <p className="seo-closer__quote">&ldquo;Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, or a way to grow — KeralaSellers is the solution.&rdquo;</p>
        <Link href="/register/seller" className="seo-btn-primary" id="osb-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>Create Your Free Online Store →</span>
        </Link>
      </section>

      {/* INTERNAL LINKS */}
      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Related Feature Pages</p>
          <ul className="seo-links-box__list">
            <li><Link href="/features/pos-billing-software">POS Billing Software</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/features/inventory-management">Inventory Sync</Link></li>
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
            <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
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
