'use client';
// ⚠️ DRAFT — NOINDEX. Malayalam content needs native speaker review before going live.
import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';

export default function MlPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'ML', href: '/ml' }, { label: 'ഇൻസ്റ്റാഗ്രാം വിൽപനക്കാർ' }]}>
      <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '12px 24px', fontSize: 13, color: '#92400e', textAlign: 'center' }}>
        ⚠️ DRAFT — Pending native Malayalam review. This page is noindex until approved.
      </div>
      <section className=seo-hero aria-labelledby=ml-instagram-vilpanakkar-h1>
        <div className=seo-hero__inner>
          <div className=seo-hero__badge>🌿 Malayalam | മലയാളം</div>
          <h1 className=seo-hero__h1 id=ml-instagram-vilpanakkar-h1 lang=ml>ഇൻസ്റ്റാഗ്രാം വിൽപനക്കാർക്കുള്ള ഓൺലൈൻ കട</h1>
          <p className=seo-hero__sub lang=ml>Instagram followers-ുണ്ട്? ഇനി ഒരു സ്റ്റോർ ലിങ്ക് കൂടി. ഉപഭോക്താക്കൾ ക്ലിക്ക് ചെയ്ത് ഓർഡർ ചെയ്യും — DM ചാറ്റ് ആവശ്യമില്ല.</p>
          <div className=seo-hero__cta>
            <Link href=/register/seller className=seo-btn-primary id=ml-instagram-vilpanakkar-start-btn>🏪 Start Your Free Store →</Link>
            <Link href=/for/instagram-sellers className=seo-btn-secondary>Instagram Sellers (English)</Link>
          </div>
        </div>
      </section>
      <section className=seo-section style={{ textAlign: 'center' }}>
        <p className=seo-section__lead>Full Malayalam content is pending native speaker review. See the English page for complete information.</p>
        <div className=seo-links-box><p className=seo-links-box__title>Related English Pages</p>
          <ul className=seo-links-box__list style={{ justifyContent: 'center' }}>
            <li><Link href=/for/instagram-sellers>Instagram Sellers</Link></li>
            <li><Link href=/solutions>All Solutions</Link></li>
            <li><Link href=/faq>FAQ</Link></li>
            <li><Link href=/register/seller>Start Free</Link></li>
          </ul>
        </div>
      </section>
    </SeoPageLayout>
  );
}
