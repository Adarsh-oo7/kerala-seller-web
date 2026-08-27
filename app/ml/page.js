'use client';
// ⚠️ DRAFT — NOINDEX. Malayalam content needs native speaker review before going live.
// TODO: Have a native Malayalam speaker review and approve all content before removing noindex.

import Link from 'next/link';
import SeoPageLayout from '../../components/seo/SeoPageLayout';

export default function MlHomePage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'മലയാളം' }]}>
      {/* DRAFT NOTICE */}
      <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '12px 24px', fontSize: 13, color: '#92400e', textAlign: 'center' }}>
        ⚠️ DRAFT — Pending native Malayalam review. This page is noindex until approved.
      </div>

      <section className="seo-hero" aria-labelledby="ml-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">🌿 Kerala Sellers — മലയാളം</div>
          <h1 className="seo-hero__h1" id="ml-h1" lang="ml">
            ഓൺലൈനിൽ വിൽക്കാനും, മാനേജ് ചെയ്യാനും, <em>വളർത്താനും വേണ്ടതെല്ലാം</em>
          </h1>
          <p className="seo-hero__sub" lang="ml">
            {/* TODO: Native review required for all copy below */}
            ഇൻസ്റ്റാഗ്രാമിലോ വാട്സ്ആപ്പിലോ ബിസിനസ് ചെയ്യുന്നവർക്ക് സ്വന്തം ഓൺലൈൻ കട — കമ്മീഷൻ 0%. 10 മിനിറ്റ് കൊണ്ട് തുടങ്ങാം. കോഡിംഗ് ഒന്നും വേണ്ട.
          </p>
          <div className="seo-hero__pills">
            <span className="seo-hero__pill" lang="ml">✓ കമ്മീഷൻ 0%</span>
            <span className="seo-hero__pill" lang="ml">✓ സ്വന്തം സ്റ്റോർ ലിങ്ക്</span>
            <span className="seo-hero__pill" lang="ml">✓ 10 മിനിറ്റ് സെറ്റ്അപ്പ്</span>
          </div>
          <div className="seo-hero__cta">
            {/* CTA stays in English — product UI is English */}
            <Link href="/register/seller" className="seo-btn-primary" id="ml-home-start-btn">
              🏪 Start Your Free Store →
            </Link>
            <Link href="/" className="seo-btn-secondary">
              View in English
            </Link>
          </div>
        </div>
      </section>

      <section className="seo-section" style={{ textAlign: 'center' }}>
        <p className="seo-section__eyebrow">Malayalam pages — Under Review</p>
        <h2 className="seo-section__h2">More Malayalam Pages Coming Soon</h2>
        <p className="seo-section__lead">
          See our full platform in English for now. Malayalam content is being reviewed for accuracy by native speakers.
        </p>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Related English Pages</p>
          <ul className="seo-links-box__list" style={{ justifyContent: 'center' }}>
            <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
            <li><Link href="/for/home-businesses">Home Businesses</Link></li>
            <li><Link href="/solutions">All Solutions</Link></li>
          </ul>
        </div>
      </section>
    </SeoPageLayout>
  );
}
