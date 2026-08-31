'use client';

import Link from 'next/link';
import SeoPageLayout from '../../components/seo/SeoPageLayout';
import FaqAccordion from '../../components/seo/FaqAccordion';
import DemoVideoSection from '../../components/seo/DemoVideoSection';
import ProblemSolutionSection from '../../components/seo/ProblemSolutionSection';
import HowItWorksSteps from '../../components/seo/HowItWorksSteps';
import TrustStatsBar from '../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../components/seo/TestimonialsGrid';
import { Store, ShoppingBag, Smartphone, Printer, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

const mlFaqs = [
  {
    q: 'കേരള സെല്ലേഴ്സ് വഴി വിൽക്കുമ്പോൾ വിൽപ്പനയുടെ കമ്മീഷൻ നൽകണമെന്നുണ്ടോ?',
    a: 'ഇല്ല. കേരള സെല്ലേഴ്സ് 100% കമ്മീഷൻ ഫ്രീ പ്ലാറ്റ്ഫോമാണ്. ആമസോൺ അല്ലെങ്കിൽ മീഷോ പോലെ നിങ്ങളുടെ ഓരോ വിൽപ്പനയിൽ നിന്നും വലിയ ശതമാനം കമ്മീഷൻ ഈടാക്കില്ല. ചെറിയ ഫ്ലാറ്റ് മന്ത്‌ലി സബ്‌സ്‌ക്രിപ്‌ഷൻ മാത്രം.',
  },
  {
    q: 'ഇൻസ്റ്റാഗ്രാം, വാട്സ്ആപ്പ് ഓർഡറുകൾ എങ്ങനെ ഒരുമിച്ച് മാനേജ് ചെയ്യാം?',
    a: 'കേരള സെല്ലേഴ്സ് നിങ്ങൾക്ക് ഒരു യൂണിഫൈഡ് ഡാഷ്‌ബോർഡ് നൽകുന്നു. നിങ്ങളുടെ സ്റ്റോർ ലിങ്ക് (keralasellers.in/shop/yourname) ബയോയിലും സ്റ്റാറ്റസിലും നൽകാം. വരുന്ന എല്ലാ ഓർഡറുകളും ഒറ്റ ആപ്പിൽ കാണാം.',
  },
  {
    q: 'മൊബൈൽ ഫോണിൽ നിന്ന് കൗണ്ടർ ബില്ലും തെർമൽ പ്രിന്റും ചെയ്യാമോ?',
    a: 'തീർച്ചയായും! വലിയ കമ്പ്യൂട്ടറുകളോ ബില്ലിംഗ് മെഷീനുകളോ ആവശ്യമില്ല. ഫോണിൽ നിന്ന് ഏതൊരു ബ്ലൂടൂത്ത് തെർമൽ പ്രിന്ററും കണക്റ്റ് ചെയ്ത് 2 സെക്കന്റിൽ ജിഎസ് ടി / നോൺ-ജിഎസ് ടി ബില്ലുകൾ പ്രിന്റ് ചെയ്യാം.',
  },
  {
    q: 'ഉപഭോക്താക്കൾക്ക് യുപിഐ (Google Pay, PhonePe) വഴി പേയ്‌മെന്റ് നടത്താമോ?',
    a: 'അതെ. നിങ്ങളുടെ ഉപഭോക്താക്കൾക്ക് ഗൂഗിൾ പേ, ഫോൺപേ, പേടിഎം, ഡെബിറ്റ്/ക്രെഡിറ്റ് കാർഡുകൾ വഴി നേരിട്ട് പേയ്‌മെന്റ് നടത്തി ഓർഡർ സബ്മിറ്റ് ചെയ്യാം.',
  },
  {
    q: 'കട തുറക്കാൻ എത്ര സമയം വേണം?',
    a: 'വെറും 10 മിനിറ്റ് കൊണ്ട് അക്കൗണ്ട് തുടങ്ങി, പ്രോഡക്റ്റുകൾ ആഡ് ചെയ്ത് നിങ്ങളുടെ സ്വന്തം ഓൺലൈൻ കട ലൈവ് ആക്കാം.',
  },
];

const mlStats = [
  { n: '1000+', l: 'സെല്ലേഴ്സ് കേരളത്തിൽ' },
  { n: '0%', l: 'കമ്മീഷൻ Cut' },
  { n: '10 min', l: 'ലൈവ് സെറ്റ്അപ്പ്' },
  { n: '14', l: 'ജില്ലകളിൽ ലഭ്യം' },
];

const mlProblems = [
  {
    problem: 'ഡിഎം സന്ദേശങ്ങളിൽ "Price?", "Available?" എന്ന ചോദ്യങ്ങൾക്ക് ആവർത്തിച്ച് മറുപടി അയച്ച് സമയം നഷ്ടപ്പെടുന്നു',
    solution: 'നിങ്ങളുടെ സ്വന്തം സ്റ്റോർ ലിങ്ക് ഷെയർ ചെയ്യുക. കസ്റ്റമേഴ്സ് പ്രോഡക്റ്റ് ഫോട്ടോയും വിലയും കണ്ട് നേരിട്ട് ഓർഡർ ചെയ്യും.',
  },
  {
    problem: 'വാട്സ്ആപ്പിലും ഇൻസ്റ്റാഗ്രാമിലും വരുന്ന ഓർഡറുകൾ മാറിപ്പോകുന്നു, പേയ്‌മെന്റ് സ്‌ക്രീൻഷോട്ട് ചോദിക്കേണ്ടി വരുന്നു',
    solution: 'ഓർഡറുകളും പേയ്‌മെന്റുകളും ഒറ്റ ഡാഷ്‌ബോർഡിൽ തത്സമയം കാണാം. മാവില മുതൽ തിരുവനന്തപുരം വരെ തടസ്സമില്ലാതെ വിൽക്കാം.',
  },
  {
    problem: 'കൗണ്ടർ ബില്ലിംഗിനായി ₹40,000 നൽകി കമ്പ്യൂട്ടറും വലിയ മെഷീനും വാങ്ങേണ്ടി വരുന്നു',
    solution: 'നിങ്ങളുടെ മൊബൈൽ ഫോൺ തന്നെ ബില്ലിംഗ് മെഷീനാക്കൂ. ₹3,499 ബ്ലൂടൂത്ത് പ്രിന്റർ കിറ്റ് ഉപയോഗിച്ച് ബില്ലുകൾ പ്രിന്റ് ചെയ്യാം.',
  },
];

export default function MlHomePage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'മലയാളം' }]}>
      {/* HERO SECTION */}
      <section className="seo-hero" aria-labelledby="ml-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Store size={16} color="#a3e635" />
            <span>കേരളത്തിലെ ചെറുകിട കച്ചവടക്കാർക്കായി 0% കമ്മീഷൻ പ്ലാറ്റ്‌ഫോം</span>
          </div>

          <h1 className="seo-hero__h1" id="ml-h1" lang="ml">
            ഓൺലൈനിൽ വിൽക്കാനും, മാനേജ് ചെയ്യാനും, <em>വളർത്താനും വേണ്ടതെല്ലാം</em>
          </h1>

          <p className="seo-hero__sub" lang="ml">
            ഇൻസ്റ്റാഗ്രാം, വാട്സ്ആപ്പ്, ഹോം ബേക്കറി, ബോട്ടീക്, റീട്ടെയ്ൽ ഷോപ്പുകൾ നടത്തുന്നവർക്ക് സ്വന്തം ഓൺലൈൻ കടയും മൊബൈൽ പോസ് ബില്ലിംഗ് സിസ്റ്റവും. 0% കമ്മീഷൻ, 10 മിനിറ്റിൽ ലൈവ്.
          </p>

          <div className="seo-hero__pills">
            <span className="seo-hero__pill" lang="ml">✓ 0% വിൽപ്പന കമ്മീഷൻ</span>
            <span className="seo-hero__pill" lang="ml">✓ സ്വന്തം സ്റ്റോർ ലിങ്ക്</span>
            <span className="seo-hero__pill" lang="ml">✓ ഫോൺ വഴി തെർമൽ ബില്ലിംഗ്</span>
            <span className="seo-hero__pill" lang="ml">✓ യുപിഐ പേയ്‌മെന്റ് ചെക്ക്ഔട്ട്</span>
          </div>

          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="ml-home-start-btn">
              <Store size={20} />
              <span>ഉടൻ കട തുടങ്ങൂ Free →</span>
            </Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">
              <span>View English Details</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <TrustStatsBar stats={mlStats} />

      {/* DEMO VIDEO SECTION */}
      <DemoVideoSection
        title="കേരള സെല്ലേഴ്സ് ആപ്പ് എങ്ങനെ പ്രവർത്തിക്കുന്നു?"
        subtitle="നിങ്ങളുടെ സ്മാർട്ട്ഫോണിൽ നിന്ന് എങ്ങനെ സ്റ്റോർ മാനേജ് ചെയ്യാം, ഓർഡറുകൾ സ്വീകരിക്കാം, ബില്ലുകൾ പ്രിന്റ് ചെയ്യാം എന്ന് കാണൂ."
        videoTitle="What is KeralaSellers — Platform Overview in Malayalam"
        youtubeId="ggkqC6ALK_c"
      />

      {/* PROBLEM -> SOLUTION SECTION */}
      <ProblemSolutionSection
        title="എന്തുകൊണ്ട് കേരളത്തിലെ സെല്ലേഴ്സ് കേരള സെല്ലേഴ്സ് തിരഞ്ഞെടുക്കുന്നു?"
        subtitle="ഡിഎം സന്ദേശങ്ങളുടെ തിരക്കുകളിൽ നിന്നും വലിയ കമ്മീഷനുകളിൽ നിന്നും മോചനം നേടൂ."
        items={mlProblems}
      />

      {/* CATEGORY & FEATURE CARDS */}
      <section className="seo-section seo-section--alt">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="seo-section__header">
            <p className="seo-section__eyebrow">ALL-IN-ONE SOLUTION</p>
            <h2 className="seo-section__h2">നിങ്ങളുടെ ബിസിനസ്സിനായുള്ള പ്രധാന ഫീച്ചറുകൾ</h2>
          </div>
          <div className="seo-features-grid">
            <div className="seo-feature-card">
              <div className="seo-feature-card__icon-box"><Store size={26} color="#1a4845" /></div>
              <div>
                <h3 className="seo-feature-card__title">സ്വന്തം സ്റ്റോർ ലിങ്ക് (Link in Bio)</h3>
                <p className="seo-feature-card__desc">keralasellers.in/shop/yourname എന്ന സ്വന്തം വെബ് സ്റ്റോർ ലിങ്ക് ബയോയിലും സ്റ്റാറ്റസിലും നൽകാം.</p>
              </div>
            </div>
            <div className="seo-feature-card">
              <div className="seo-feature-card__icon-box"><Printer size={26} color="#1a4845" /></div>
              <div>
                <h3 className="seo-feature-card__title">മൊബൈൽ പോസ് &amp; തെർമൽ ബില്ലിംഗ്</h3>
                <p className="seo-feature-card__desc">മൊബൈൽ ഫോണിൽ നിന്ന് ₹3,499 ബ്ലൂടൂത്ത് പ്രിന്ററിലേക്ക് 2 സെക്കന്റിൽ ജിഎസ് ടി ബില്ലുകൾ പ്രിന്റ് ചെയ്യാം.</p>
              </div>
            </div>
            <div className="seo-feature-card">
              <div className="seo-feature-card__icon-box"><Smartphone size={26} color="#1a4845" /></div>
              <div>
                <h3 className="seo-feature-card__title">വാട്സ്ആപ്പ് ഓർഡർ സിസ്റ്റം</h3>
                <p className="seo-feature-card__desc">ഓർഡറുകൾ ലഭിക്കുമ്പോൾ വാട്സ്ആപ്പ് സന്ദേശങ്ങളും പിഡിഎഫ് ഡിജിറ്റൽ ബില്ലുകളും അയക്കാം.</p>
              </div>
            </div>
            <div className="seo-feature-card">
              <div className="seo-feature-card__icon-box"><Zap size={26} color="#1a4845" /></div>
              <div>
                <h3 className="seo-feature-card__title">തത്സമയ സ്റ്റോക്ക് അപ്‌ഡേറ്റ്</h3>
                <p className="seo-feature-card__desc">കൗണ്ടറിൽ ഒരു സാധനം വിറ്റാൽ ഓൺലൈൻ സ്റ്റോറിലും സ്റ്റോക്ക് ഓട്ടോമാറ്റിക്കായി കുറയും.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <HowItWorksSteps
        title="4 ലളിതമായ ഘട്ടങ്ങളിൽ കട ലൈവ് ആക്കാം"
        subtitle="കോഡിംഗോ സാങ്കേതിക പരിജ്ഞാനമോ ആവശ്യമില്ലാതെ നിങ്ങളുടെ ഫോണിൽ നിന്ന് തുടങ്ങാം."
      />

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* MALAYALAM SOLUTION ROUTES GRID */}
      <section className="seo-section" style={{ background: '#f0fdf4', borderRadius: 20, padding: '40px 32px', margin: '40px auto', maxWidth: 1100, border: '1px solid #bbf7d0' }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#166534' }}>
          മലയാളം ഗൈഡുകൾ &amp; സൊല്യൂഷനുകൾ
        </span>
        <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 800, color: '#1a4845', margin: '10px 0 20px' }}>
          നിങ്ങളുടെ ബിസിനസ്സ് ടൈപ്പ് തിരഞ്ഞെടുക്കൂ
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          <Link href="/ml/online-vilpana" style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', textDecoration: 'none', color: '#1a4845', fontWeight: 700, fontSize: 14 }}>
            🌿 ഓൺലൈൻ വിൽപന കേരള
          </Link>
          <Link href="/ml/instagram-vilpanakkar" style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', textDecoration: 'none', color: '#1a4845', fontWeight: 700, fontSize: 14 }}>
            📸 ഇൻസ്റ്റാഗ്രാം വിൽപനക്കാർ
          </Link>
          <Link href="/ml/whatsapp-vilpanakkar" style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', textDecoration: 'none', color: '#1a4845', fontWeight: 700, fontSize: 14 }}>
            💬 വാട്സ്ആപ്പ് വിൽപനക്കാർ
          </Link>
          <Link href="/ml/veetu-business" style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', textDecoration: 'none', color: '#1a4845', fontWeight: 700, fontSize: 14 }}>
            🏠 വീട്ടു ബിസിനസ്സ് (Home Business)
          </Link>
          <Link href="/features/pos-billing-software" style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', textDecoration: 'none', color: '#1a4845', fontWeight: 700, fontSize: 14 }}>
            🖨️ പോസ് ബില്ലിംഗ് മെഷീൻ
          </Link>
        </div>
      </section>

      {/* CLOSER / CTA */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          &ldquo;നിങ്ങളുടെ സ്വന്തം ഓൺലൈൻ കട ഇന്നുതന്നെ സൗജന്യമായി ആരംഭിക്കൂ. 0% കമ്മീഷൻ, വളർച്ച മാത്രം.&rdquo;
        </p>
        <Link href="/register/seller" className="seo-btn-primary" id="ml-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>ഉടൻ കട തുടങ്ങൂ Free →</span>
        </Link>
      </section>

      {/* FAQ SECTION */}
      <section className="seo-faq">
        <h2 className="seo-faq__h2">പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ (FAQ)</h2>
        <FaqAccordion faqs={mlFaqs} />
      </section>
    </SeoPageLayout>
  );
}
