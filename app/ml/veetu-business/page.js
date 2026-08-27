'use client';
// ⚠️ DRAFT — NOINDEX. Malayalam content needs native speaker review before going live.
import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';

export default function MlPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'ML', href: '/ml' }, { label: 'വീട്ടുബിസിനസ്' }]}>
      <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '12px 24px', fontSize: 13, color: '#92400e', textAlign: 'center' }}>
        ⚠️ DRAFT — Pending native Malayalam review. This page is noindex until approved.
      </div>
      <section className="seo-hero" aria-labelledby="ml-veetu-business-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">🌿 Malayalam | മലയാളം</div>
          <h1 className="seo-hero__h1" id="ml-veetu-business-h1" lang="ml">വീട്ടിൽ നിന്നുള്ള ബിസിനസിന് ഓൺലൈൻ വിൽപന പ്ലാറ്റ്ഫോം</h1>
          <p className="seo-hero__sub" lang="ml">ഹോം ബേക്കറിയോ, ഹോം മെയ്ഡ് ഉൽപ്പന്നങ്ങളോ, ആഭരണ ബിസിനസോ — Kerala Sellers ഉപയോഗിച്ച് ഓൺലൈനിൽ വിൽക്കൂ.</p>
          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="ml-veetu-business-start-btn">🏪 Start Your Free Store →</Link>
            <Link href="/for/home-businesses" className="seo-btn-secondary">Home Businesses (English)</Link>
          </div>
        </div>
      </section>
      <section className="seo-section" style={{ textAlign: 'center' }}>
        <p className="seo-section__lead">Full Malayalam content is pending native speaker review. See the English page for complete information.</p>
        <div className="seo-links-box"><p className="seo-links-box__title">Related English Pages</p>
          <ul className="seo-links-box__list" style={{ justifyContent: 'center' }}>
            <li><Link href="/for/home-businesses">Home Businesses</Link></li>
            <li><Link href="/solutions">All Solutions</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/register/seller">Start Free</Link></li>
          </ul>
        </div>
      </section>
    </SeoPageLayout>
  );
}
