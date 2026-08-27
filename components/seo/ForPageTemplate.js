'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';

/**
 * Shared template for all /for/[segment] seller persona pages.
 * Accepts a `data` object from for-pages-data.js.
 */
export default function ForPageTemplate({ data, breadcrumbLabel }) {
  const { hero, stats, problems, features, faqs, links } = data;
  const [firstWord, ...rest] = hero.h1;

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
          <div className="seo-hero__badge">{hero.badge}</div>
          <h1 className="seo-hero__h1" id="for-page-h1">
            {firstWord}<em>{rest.join('')}</em>
          </h1>
          <p className="seo-hero__sub">{hero.sub}</p>
          <div className="seo-hero__pills">
            {hero.pills.map((p) => (
              <span key={p} className="seo-hero__pill">{p}</span>
            ))}
          </div>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id={`for-${data.slug}-start-btn`}>
              🏪 Create Your Free Store →
            </Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="seo-stats" role="region" aria-label="Platform stats">
        {stats.map((s) => (
          <div key={s.l} className="seo-stat">
            <span className="seo-stat__number">{s.n}</span>
            <span className="seo-stat__label">{s.l}</span>
          </div>
        ))}
      </div>

      {/* PROBLEMS → SOLUTIONS */}
      <section className="seo-section">
        <p className="seo-section__eyebrow">The problem</p>
        <h2 className="seo-section__h2">Sound Familiar?</h2>
        <p className="seo-section__lead">
          These are the exact challenges sellers like you face every day. Here is how Kerala Sellers solves each one.
        </p>
        <div className="seo-problems">
          {problems.map((p) => (
            <div key={p.problem} className="seo-problem-card">
              <div className="seo-problem-card__emoji">{p.emoji}</div>
              <div className="seo-problem-card__problem">❌ {p.problem}</div>
              <div className="seo-problem-card__solution">✓ {p.solution}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="seo-section__eyebrow">How it helps</p>
          <h2 className="seo-section__h2">Everything You Need in One Place</h2>
          <div className="seo-features">
            {features.map((f) => (
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

      {/* BRAND CLOSER */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          "Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, or a way to grow — Kerala Sellers is the solution."
        </p>
        <Link href="/register/seller" className="seo-closer__cta" id={`for-${data.slug}-bottom-cta`}>
          Create Your Free Online Store →
        </Link>
      </section>

      {/* INTERNAL LINKS */}
      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Related Pages</p>
          <ul className="seo-links-box__list">
            {links.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
            <li><Link href="/products">Browse Products</Link></li>
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
