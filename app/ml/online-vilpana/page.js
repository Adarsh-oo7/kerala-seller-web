'use client';
// ⚠️ DRAFT — NOINDEX. Malayalam content needs native speaker review before going live.
import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';

export default function MlPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'ML', href: '/ml' }, { label: 'ഓൺലൈൻ വിൽപന' }]}>
      <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '12px 24px', fontSize: 13, color: '#92400e', textAlign: 'center' }}>
        ⚠️ DRAFT — Pending native Malayalam review. This page is noindex until approved.
      </div>
      <section className=seo-hero aria-labelledby=ml-online-vilpana-h1>
        <div className=seo-hero__inner>
          <div className=seo-hero__badge>🌿 Malayalam | മലയാളം</div>
          <h1 className=seo-hero__h1 id=ml-online-vilpana-h1 lang=ml>ഓൺലൈനിൽ വിൽക്കാൻ വേണ്ടതെല്ലാം</h1>
          <p className=seo-hero__sub lang=ml>ഇൻസ്റ്റാഗ്രാമോ വാട്സ്ആപ്പോ ഉപയോഗിക്കുന്നവർക്ക് — 0% കമ്മീഷൻ, സ്വന്തം സ്റ്റോർ ലിങ്ക്, 10 മിനിറ്റ് സെറ്റ്അപ്പ്.</p>
          <div className=seo-hero__cta>
            <Link href=/register/seller className=seo-btn-primary id=ml-online-vilpana-start-btn>🏪 Start Your Free Store →</Link>
            <Link href=/sell-online-kerala className=seo-btn-secondary>Sell Online in Kerala (English)</Link>
          </div>
        </div>
      </section>
      <section className=seo-section style={{ textAlign: 'center' }}>
        <p className=seo-section__lead>Full Malayalam content is pending native speaker review. See the English page for complete information.</p>
        <div className=seo-links-box><p className=seo-links-box__title>Related English Pages</p>
          <ul className=seo-links-box__list style={{ justifyContent: 'center' }}>
            <li><Link href=/sell-online-kerala>Sell Online in Kerala</Link></li>
            <li><Link href=/solutions>All Solutions</Link></li>
            <li><Link href=/faq>FAQ</Link></li>
            <li><Link href=/register/seller>Start Free</Link></li>
          </ul>
        </div>
      </section>
    </SeoPageLayout>
  );
}
