'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';
import DemoVideoSection from '../../../components/seo/DemoVideoSection';
import ProblemSolutionSection from '../../../components/seo/ProblemSolutionSection';
import HowItWorksSteps from '../../../components/seo/HowItWorksSteps';
import TrustStatsBar from '../../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../../components/seo/TestimonialsGrid';
import { Store, Home, ShoppingBag, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const mlFaqs = [
  {
    q: 'വീട്ടിലിരുന്ന് കേക്ക്, ഭക്ഷണം, തയ്യൽ ബിസിനസ്സ് ചെയ്യുന്നവർക്ക് ഇത് അനുയോജ്യമാണോ?',
    a: 'തീർച്ചയായും! ഹോം ബേക്കറികൾ, ബുട്ടീക്കുകൾ, ഹാൻഡ് മെയ്ഡ് ക്രാഫ്റ്റ് ബിസിനസ്സ് നടത്തുന്നവർക്ക് ഏറ്റവും അനുയോജ്യമാണ് കേരള സെല്ലേഴ്സ്.',
  },
  {
    q: 'കട ആരംഭിക്കാൻ വലിയ തുക ചെലവാകുമോ?',
    a: 'ഇല്ല. തികച്ചും സൗജന്യമായി അക്കൗണ്ട് തുടങ്ങി നിങ്ങളുടെ പ്രോഡക്റ്റുകൾ ലിസ്റ്റ് ചെയ്യാം. വിൽപ്പനയ്ക്ക് 0% കമ്മീഷൻ.',
  },
  {
    q: 'കേരളത്തിലെ മറ്റ് ജില്ലകളിലേക്ക് സാധനങ്ങൾ അയക്കാൻ സാധിക്കുമോ?',
    a: 'അതെ. കൊറിയർ വഴിയോ ഇന്ത്യാ പോസ്റ്റ് വഴിയോ കേരളത്തിലുടനീളം ഓർഡറുകൾ ഡെലിവറി ചെയ്യാം.',
  },
];

const mlStats = [
  { n: '100%', l: 'വീട്ടിലിരുന്ന് ചെയ്യാം' },
  { n: '0%', l: 'കമ്മീഷൻ Cut' },
  { n: '10 min', l: 'ലൈവ് സെറ്റ്അപ്പ്' },
  { n: '₹0', l: 'സൗജന്യ തുടക്കം' },
];

const mlProblems = [
  {
    problem: 'വീട്ടിലിരുന്ന് ചെയ്യുന്ന ബിസിനസ്സിന് സ്വന്തമായി ഒരു പ്രൊഫഷണൽ ഐഡന്റിറ്റി ഇല്ല',
    solution: 'keralasellers.in/shop/yourname എന്ന ബ്രാൻഡഡ് കട ലിങ്ക് വഴി ബിസിനസ്സിന് വലിയ മൂല്യം നൽകാം.',
  },
  {
    problem: 'വലിയ കടകളുടെ വാടകയോ മെഷീൻ ചെലവോ താങ്ങാൻ കഴിയില്ല',
    solution: 'സ്വന്തം സ്മാർട്ട്ഫോൺ മാത്രം ഉപയോഗിച്ച് വീട്ടിലിരുന്ന് വലിയ സ്റ്റോർ മാനേജ് ചെയ്യാം.',
  },
];

export default function MlVeetuBusinessPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'ML', href: '/ml' }, { label: 'വീട്ടു ബിസിനസ്സ്' }]}>
      {/* HERO SECTION */}
      <section className="seo-hero" aria-labelledby="ml-homebiz-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Home size={16} color="#a3e635" />
            <span>വീട്ടിലിരുന്ന് ചെയ്യുന്ന ബിസിനസ്സുകൾക്കായി</span>
          </div>

          <h1 className="seo-hero__h1" id="ml-homebiz-h1" lang="ml">
            വീട്ടു ബിസിനസ്സ് കൂടുതൽ <em>ഉയരങ്ങളിലേക്ക് വളർത്തൂ</em>
          </h1>

          <p className="seo-hero__sub" lang="ml">
            ഹോം ബേക്കറി, തയ്യൽ കടകൾ, ഹാൻഡ് മെയ്ഡ് ഗിഫ്റ്റുകൾ, അച്ചാർ, കരകൗശല ഉൽപ്പന്നങ്ങൾ വീട്ടിലിരുന്ന് ഉണ്ടാക്കി കേരളത്തിലുടനീളം വിൽക്കൂ.
          </p>

          <div className="seo-hero__pills">
            <span className="seo-hero__pill" lang="ml">✓ 100% വീട്ടിലിരുന്ന് വിൽക്കാം</span>
            <span className="seo-hero__pill" lang="ml">✓ കമ്മീഷൻ 0%</span>
            <span className="seo-hero__pill" lang="ml">✓ സ്വന്തം സ്റ്റോർ ലിങ്ക്</span>
          </div>

          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="ml-homebiz-start-btn">
              <Store size={20} />
              <span>വീട്ടു കട തുടങ്ങൂ Free →</span>
            </Link>
            <Link href="/for/home-businesses" className="seo-btn-secondary">
              <span>View English Details</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <TrustStatsBar stats={mlStats} />

      {/* DEMO VIDEO */}
      <DemoVideoSection
        title="വീട്ടു ബിസിനസ്സ് ചെയ്യുന്നവർക്ക് എങ്ങനെ സ്റ്റോർ ഉപയോഗിക്കാം?"
        subtitle="നിങ്ങളുടെ പ്രോഡക്റ്റുകൾ ഫോണിൽ ചേർത്ത് വിൽപന തുടങ്ങുന്നത് കാണൂ."
        videoTitle="What is KeralaSellers — Platform Overview in Malayalam"
        youtubeId="ggkqC6ALK_c"
      />

      {/* PROBLEMS & SOLUTIONS */}
      <ProblemSolutionSection
        title="നിങ്ങളുടെ അധ്വാനത്തിന് അർഹമായ വിജയം"
        subtitle="വീട്ടിലിരുന്ന് ചെയ്യുന്ന സംരംഭങ്ങൾക്ക് കൂടുതൽ ഓർഡറുകൾ നേടൂ."
        items={mlProblems}
      />

      {/* HOW IT WORKS */}
      <HowItWorksSteps
        title="വീട്ടു കട ആരംഭിക്കാൻ 4 ഘട്ടങ്ങൾ"
        subtitle="ഏറ്റവും ലളിതമായ വഴിയിലൂടെ നിങ്ങളുടെ ബിസിനസ്സ് തുടങ്ങാം."
      />

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* CLOSER / CTA */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          &ldquo;നിങ്ങളുടെ വീട്ടിലെ കഴിവുകളെ ഒരു വലിയ ഡിജിറ്റൽ സംരംഭമാക്കി മാറ്റൂ.&rdquo;
        </p>
        <Link href="/register/seller" className="seo-btn-primary" id="ml-homebiz-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>വീട്ടു കട തുടങ്ങൂ Free →</span>
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
