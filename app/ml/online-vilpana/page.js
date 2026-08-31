'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';
import DemoVideoSection from '../../../components/seo/DemoVideoSection';
import ProblemSolutionSection from '../../../components/seo/ProblemSolutionSection';
import HowItWorksSteps from '../../../components/seo/HowItWorksSteps';
import TrustStatsBar from '../../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../../components/seo/TestimonialsGrid';
import { Store, ShoppingBag, Smartphone, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const mlFaqs = [
  {
    q: 'കേരളത്തിൽ ഓൺലൈൻ ബിസിനസ് തുടങ്ങാൻ ജിഎസ് ടി (GST) നിർബന്ധമാണോ?',
    a: 'ഇല്ല. തുടക്കക്കാർക്കും ചെറുകിട കച്ചവടക്കാർക്കും ജിഎസ് ടി ഇല്ലാതെ തന്നെ കേരള സെല്ലേഴ്സിൽ രജിസ്റ്റർ ചെയ്ത് പ്രോഡക്റ്റുകൾ വിൽക്കാൻ സാധിക്കും.',
  },
  {
    q: 'നിങ്ങളുടെ പ്ലാറ്റ്‌ഫോമിൽ വിൽക്കുമ്പോൾ ഡെലിവറി എങ്ങനെ ചെയ്യാം?',
    a: 'നിങ്ങൾക്ക് കേരളത്തിലെ പ്രാദേശിക ഡെലിവറി സർവീസുകളോ (Dunzo, Porter) അല്ലെങ്കിൽ ഇന്ത്യാ പോസ്റ്റ് / കൊറിയർ സർവീസുകളോ ഉപയോഗിച്ച് ഉപഭോക്താക്കളിലേക്ക് പ്രോഡക്റ്റുകൾ എത്തിക്കാം.',
  },
  {
    q: 'കമ്മീഷൻ ഇല്ലാതെ എങ്ങനെ കമ്പനിക്ക് ലാഭം ലഭിക്കുന്നു?',
    a: 'കേരള സെല്ലേഴ്സ് നിങ്ങളുടെ ഓരോ വിൽപ്പനയിൽ നിന്നും വിഹിതം ഈടാക്കുന്നില്ല. പകരം ചെറിയ പ്രതിമാസ പ്ലാൻ (₹99/മാസം മുതൽ) മാത്രമാണ് ചാർജ് ചെയ്യുന്നത്. അതിനാൽ നിങ്ങളുടെ ലാഭം 100% നിങ്ങൾക്ക് സ്വന്തം.',
  },
];

const mlStats = [
  { n: '0%', l: 'വിൽപ്പന കമ്മീഷൻ' },
  { n: '₹99/mo', l: 'ആരംഭ പ്ലാൻ' },
  { n: '10 min', l: 'ഡിജിറ്റൽ കട' },
  { n: '100%', l: 'മൊബൈൽ ഫ്രണ്ട്‌ലി' },
];

const mlProblems = [
  {
    problem: 'വലിയ ഇ-കോമേഴ്സ് പ്ലാറ്റ്‌ഫോമുകൾ 15% മുതൽ 30% വരെ കമ്മീഷൻ വെട്ടിക്കുറയ്ക്കുന്നു',
    solution: 'കേരള സെല്ലേഴ്സിൽ 0% കമ്മീഷൻ. നിങ്ങളുടെ അധ്വാനത്തിന്റെ മുഴുവൻ തുകയും നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക്.',
  },
  {
    problem: 'വെബ്സൈറ്റ് ഉണ്ടാക്കാൻ ₹20,000 നൽകി ഡെവലപ്പർമാരെ ആശ്രയിക്കേണ്ടി വരുന്നു',
    solution: 'ഒരു രൂപ പോലും അധികം ചെലവാക്കാതെ 10 മിനിറ്റിൽ സ്വന്തമായി മൊബൈൽ കട ഉണ്ടാക്കാം.',
  },
];

export default function MlOnlineVilpanaPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'ML', href: '/ml' }, { label: 'ഓൺലൈൻ വിൽപന' }]}>
      {/* HERO SECTION */}
      <section className="seo-hero" aria-labelledby="ml-online-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Store size={16} color="#a3e635" />
            <span>കേരളത്തിൽ ഓൺലൈൻ വിൽപന ഇനി വളരെ എളുപ്പം</span>
          </div>

          <h1 className="seo-hero__h1" id="ml-online-h1" lang="ml">
            കേരളത്തിൽ പ്രോഡക്റ്റുകൾ <em>ഓൺലൈനിൽ വിൽക്കാൻ വേണ്ടതെല്ലാം</em>
          </h1>

          <p className="seo-hero__sub" lang="ml">
            നിങ്ങളുടെ വസ്ത്രങ്ങൾ, ആഭരണങ്ങൾ, ഹോം മെയ്ഡ് ഫുഡ്, കരകൗശല വസ്തുക്കൾ എന്നിവ ഇൻസ്റ്റാഗ്രാം, വാട്സ്ആപ്പ് വഴി കേരളത്തിലുടനീളം വിൽക്കൂ. കമ്മീഷൻ 0%.
          </p>

          <div className="seo-hero__pills">
            <span className="seo-hero__pill" lang="ml">✓ സ്വന്തം സ്റ്റോർ ലിങ്ക്</span>
            <span className="seo-hero__pill" lang="ml">✓ യുപിഐ നേരിട്ട് അക്കൗണ്ടിലേക്ക്</span>
            <span className="seo-hero__pill" lang="ml">✓ കോഡിംഗ് ആവശ്യമില്ല</span>
          </div>

          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="ml-online-start-btn">
              <Store size={20} />
              <span>ഉടൻ വിൽപന തുടങ്ങൂ Free →</span>
            </Link>
            <Link href="/sell-online-kerala" className="seo-btn-secondary">
              <span>View English Details</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <TrustStatsBar stats={mlStats} />

      {/* DEMO VIDEO */}
      <DemoVideoSection
        title="ഓൺലൈനിൽ എങ്ങനെ കട തുടങ്ങാം?"
        subtitle="10 മിനിറ്റ് കൊണ്ട് നിങ്ങളുടെ മൊബൈൽ ഫോണിൽ പ്രോഡക്റ്റുകൾ ആഡ് ചെയ്ത് ലൈവ് ആക്കുന്നത് കാണൂ."
        videoTitle="How to Create Store in KeralaSellers"
        youtubeId="GTeeLBSYkjw"
      />

      {/* PROBLEMS & SOLUTIONS */}
      <ProblemSolutionSection
        title="പഴയ മാർഗ്ഗങ്ങൾ മാറ്റി ഡിജിറ്റലായി വളരൂ"
        subtitle="ചെറുകിട സംരംഭകർക്ക് പരമാവധി ലാഭം ഉറപ്പാക്കുന്ന സാങ്കേതികവിദ്യ."
        items={mlProblems}
      />

      {/* HOW IT WORKS */}
      <HowItWorksSteps
        title="ഓൺലൈൻ വിൽപന തുടങ്ങാൻ 4 ഘട്ടങ്ങൾ"
        subtitle="നിങ്ങളുടെ ഫോണിൽ നിന്ന് എളുപ്പത്തിൽ കട ആരംഭിച്ച് ഓർഡറുകൾ സ്വീകരിക്കാം."
      />

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* CLOSER / CTA */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          &ldquo;നിങ്ങളുടെ ബിസിനസ്സ് കേരളത്തിലുടനീളം വളർത്താൻ ഇന്ന് തന്നെ കേരള സെല്ലേഴ്സ് ആപ്പ് ഉപയോഗിച്ചു തുടങ്ങൂ.&rdquo;
        </p>
        <Link href="/register/seller" className="seo-btn-primary" id="ml-online-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>ഉടൻ കട തുടങ്ങൂ Free →</span>
        </Link>
      </section>

      {/* FAQ */}
      <section className="seo-faq">
        <h2 className="seo-faq__h2">പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ (FAQ)</h2>
        <FaqAccordion faqs={mlFaqs} />
      </section>
    </SeoPageLayout>
  );
}
