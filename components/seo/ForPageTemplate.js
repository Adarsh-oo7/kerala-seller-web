'use client';

import Link from 'next/link';
import SeoPageLayout from './SeoPageLayout';
import FaqAccordion from './FaqAccordion';
import DemoVideoSection from './DemoVideoSection';
import ProblemSolutionSection from './ProblemSolutionSection';
import HowItWorksSteps from './HowItWorksSteps';
import TrustStatsBar from './TrustStatsBar';
import TestimonialsGrid from './TestimonialsGrid';
import { Store, ArrowRight, CheckCircle2, ShieldCheck, Zap, Package, Sparkles } from 'lucide-react';

const videoTitles = {
  'instagram-sellers': 'Turn Your Instagram Followers Into Customers',
  'whatsapp-sellers': 'Manage WhatsApp Orders Without the Chaos',
  'home-businesses': 'Start Selling From Home in Kerala',
  'small-businesses': 'Manage Your Shop & Orders From Your Phone',
  'social-media-sellers': 'Manage Orders From All Social Media Channels in One Place',
};

/**
 * Shared template for all /for/[segment] seller persona pages.
 * Accepts a `data` object from for-pages-data.js.
 */
export default function ForPageTemplate({ data, breadcrumbLabel }) {
  const { hero, stats, problems, features, faqs, links, slug } = data;
  const [firstWord, ...rest] = hero.h1;
  const videoTitle = videoTitles[slug] || `How KeralaSellers Helps ${breadcrumbLabel}`;

  return (
    <SeoPageLayout
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Solutions', href: '/solutions' },
        { label: breadcrumbLabel },
      ]}
    >
      {/* HERO */}
      <section className="seo-hero" aria-labelledby="for-page-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Sparkles size={14} color="#a3e635" />
            <span>{hero.badge.replace(/^[^\w]+/, '')}</span>
          </div>
          <h1 className="seo-hero__h1" id="for-page-h1">
            {firstWord} <em>{rest.join(' ')}</em>
          </h1>
          <p className="seo-hero__sub">{hero.sub}</p>
          <div className="seo-hero__pills">
            {hero.pills.map((p) => (
              <span key={p} className="seo-hero__pill">{p}</span>
            ))}
          </div>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id={`for-${slug}-start-btn`}>
              <Store size={18} />
              <span>Create Your Free Store →</span>
            </Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST / STATS BAR */}
      <TrustStatsBar stats={stats} />

      {/* DEMO VIDEO SECTION */}
      <DemoVideoSection
        title={`See How KeralaSellers Helps ${breadcrumbLabel}`}
        subtitle="Watch how easily you can list products, manage customer orders, and accept payments from your mobile phone."
        videoTitle={videoTitle}
      />

      {/* PROBLEMS → SOLUTIONS (No emojis, line icons contrast) */}
      <ProblemSolutionSection
        title="Sound Familiar? Here is How KeralaSellers Solves It"
        subtitle="These are the exact challenges small sellers in Kerala face every day. Here is how our platform eliminates them."
        items={problems}
      />

      {/* HOW IT WORKS STEPS */}
      <HowItWorksSteps
        title={`How ${breadcrumbLabel} Start & Grow with KeralaSellers`}
        subtitle="No developer needed. No complicated software. Easy to manage 100% from your phone."
      />

      {/* FEATURES / CAPABILITIES */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="seo-section__header">
            <p className="seo-section__eyebrow">BUILT FOR YOUR BUSINESS</p>
            <h2 className="seo-section__h2">Everything You Need in One Mobile App</h2>
            <p className="seo-section__lead">
              Designed specifically for Kerala sellers — simple, fast, and 0% commission.
            </p>
          </div>

          <div className="seo-features-grid">
            {features.map((f) => (
              <div key={f.title} className="seo-feature-card">
                <div className="seo-feature-card__icon-box">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="seo-feature-card__title">{f.title}</h3>
                  <p className="seo-feature-card__desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF TESTIMONIALS */}
      <TestimonialsGrid />

      {/* BRAND CLOSER */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          "Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, or a way to grow — KeralaSellers is the solution."
        </p>
        <Link href="/register/seller" className="seo-btn-primary" id={`for-${slug}-bottom-cta`} style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>Create Your Free Online Store →</span>
        </Link>
      </section>

      {/* INTERNAL LINKS */}
      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Related Solutions &amp; Guides</p>
          <ul className="seo-links-box__list">
            {links.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/features/pos-billing-software">POS Billing Software</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/features/inventory-management">Inventory Sync</Link></li>
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
