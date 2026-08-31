'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';
import DemoVideoSection from '../../../components/seo/DemoVideoSection';
import ProblemSolutionSection from '../../../components/seo/ProblemSolutionSection';
import HowItWorksSteps from '../../../components/seo/HowItWorksSteps';
import TrustStatsBar from '../../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../../components/seo/TestimonialsGrid';
import { Store, Camera, ShoppingBag, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const mlFaqs = [
  {
    q: 'ഇൻസ്റ്റാഗ്രാം ബയോയിൽ (Link in Bio) സ്റ്റോർ ലിങ്ക് നൽകുന്നത് എങ്ങനെ?',
    a: 'നിങ്ങളുടെ കേരള സെല്ലേഴ്സ് അക്കൗണ്ട് തുടങ്ങി ലഭിക്കുന്ന സ്റ്റോർ ലിങ്ക് (keralasellers.in/shop/yourname) കോപ്പി ചെയ്ത് ഇൻസ്റ്റാഗ്രാം Edit Profile ➔ Add Link ൽ പേസ്റ്റ് ചെയ്യുക.',
  },
  {
    q: 'ഡിഎം (DM) വഴി ഓർഡർ എടുക്കുന്നത് അവസാനിപ്പിക്കാൻ ഇത് സഹായിക്കുമോ?',
    a: 'അതെ! ഫോളോവേഴ്സ് നിങ്ങളുടെ ലിങ്കിൽ ക്ലിക്ക് ചെയ്ത് എല്ലാ പ്രോഡക്റ്റുകളുടെയും ഫോട്ടോയും വിലയും കണ്ട് നേരിട്ട് ഓർഡർ ചെയ്യും. "Price?" എന്ന് അയക്കുന്ന ചലഞ്ചുകൾ ഇല്ലാതാകും.',
  },
  {
    q: 'കസ്റ്റമേഴ്സ് ആപ്പ് ഡൗൺലോഡ് ചെയ്യേണ്ടതുണ്ടോ?',
    a: 'ഇല്ല. കസ്റ്റമേഴ്സിന് നിങ്ങളുടെ വെബ് ലിങ്ക് ഏത് ബ്രൗസറിലും തുറന്ന് ആപ്പ് ഡൗൺലോഡ് ചെയ്യാതെ തന്നെ വാങ്ങാം.',
  },
];

const mlStats = [
  { n: '1000+', l: 'ഇൻസ്റ്റാഗ്രാം സെല്ലേഴ്സ്' },
  { n: '0%', l: 'കമ്മീഷൻ Cut' },
  { n: '1 Link', l: 'ബയോയിൽ കൊടുക്കാം' },
  { n: '24/7', l: 'ഓട്ടോമാറ്റിക് ഓർഡറുകൾ' },
];

const mlProblems = [
  {
    problem: 'ഓരോ പോസ്റ്റിന് താഴെയും "Price please", "DM for price" എന്ന് നൂറു കണക്കിന് ആൾക്കാർ ചോദിക്കുന്നു',
    solution: 'നിങ്ങളുടെ ബയോ ലിങ്കിൽ പ്രോഡക്റ്റിന്റെ വിലയും ചിത്രങ്ങളും സ്റ്റോക്കും കാണാം. ഉപഭോക്താക്കൾ സ്വയം ഓർഡർ ചെയ്യും.',
  },
  {
    problem: 'ഇൻബോക്സിൽ ഡിഎം സന്ദേശങ്ങൾ നിറഞ്ഞ് പ്രധാനപ്പെട്ട ഓർഡറുകൾ വിട്ടുപോകുന്നു',
    solution: 'എല്ലാ ഓർഡറുകളും ഒറ്റ ഡാഷ്‌ബോർഡിൽ പേര്, വിലാസം, ഫോൺ നമ്പർ സഹിതം വ്യക്തമായി കാണാം.',
  },
];

export default function MlInstagramVilpanakkarPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'ML', href: '/ml' }, { label: 'ഇൻസ്റ്റാഗ്രാം വിൽപനക്കാർ' }]}>
      {/* HERO SECTION */}
      <section className="seo-hero" aria-labelledby="ml-insta-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Camera size={16} color="#a3e635" />
            <span>ഇൻസ്റ്റാഗ്രാം സെല്ലേഴ്സിനായി പ്രത്യേക ഓൺലൈൻ കട</span>
          </div>

          <h1 className="seo-hero__h1" id="ml-insta-h1" lang="ml">
            ഇൻസ്റ്റാഗ്രാം ഡിഎം തിരക്കുകളിൽ നിന്നും മോചനം — <em>സ്വന്തം സ്റ്റോർ ലിങ്ക് നേടൂ</em>
          </h1>

          <p className="seo-hero__sub" lang="ml">
            നിങ്ങൾക്ക് ഇൻസ്റ്റാഗ്രാമിൽ ഫോളോവേഴ്‌സ് ഉണ്ടോ? പ്രോഡക്റ്റുകൾ ബയോ ലിങ്കിൽ ഷെയർ ചെയ്യൂ. ഉപഭോക്താക്കൾ ആഡ് ടു കാർട്ട് ചെയ്ത് യുപിഐ വഴി ഓർഡർ ചെയ്യും.
          </p>

          <div className="seo-hero__pills">
            <span className="seo-hero__pill" lang="ml">✓ Link in Bio വിൽപന</span>
            <span className="seo-hero__pill" lang="ml">✓ DM ഓർഡർ കൺഫ്യൂഷൻ ഇല്ല</span>
            <span className="seo-hero__pill" lang="ml">✓ കമ്മീഷൻ 0%</span>
          </div>

          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="ml-insta-start-btn">
              <Store size={20} />
              <span>ബയോ ലിങ്ക് ഉണ്ടാക്കൂ Free →</span>
            </Link>
            <Link href="/for/instagram-sellers" className="seo-btn-secondary">
              <span>View English Details</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <TrustStatsBar stats={mlStats} />

      {/* DEMO VIDEO */}
      <DemoVideoSection
        title="ഇൻസ്റ്റാഗ്രാം സെല്ലേഴ്സ് എങ്ങനെ കേരള സെല്ലേഴ്സ് ഉപയോഗിക്കുന്നു?"
        subtitle="ബയോ ലിങ്ക് വഴി എങ്ങനെ ഓർഡറുകൾ സ്വീകരിക്കാമെന്ന് 60 സെക്കന്റിൽ മനസ്സിലാക്കൂ."
        videoTitle="Online Store for Instagram Sellers in Kerala"
        youtubeId="GTeeLBSYkjw"
      />

      {/* PROBLEMS & SOLUTIONS */}
      <ProblemSolutionSection
        title="ഇൻസ്റ്റാഗ്രാമിൽ കച്ചവടം എളുപ്പമാക്കൂ"
        subtitle="ഡിഎം സന്ദേശങ്ങൾക്ക് പിന്നാലെ പോകാതെ പ്രൊഫഷണൽ സ്റ്റോർ ലിങ്ക് ഉപയോഗിക്കൂ."
        items={mlProblems}
      />

      {/* HOW IT WORKS */}
      <HowItWorksSteps
        title="ഇൻസ്റ്റാഗ്രാമിൽ ലിങ്ക് നൽകി തുടങ്ങാൻ 4 വഴികൾ"
        subtitle="10 മിനിറ്റ് കൊണ്ട് നിങ്ങളുടെ സ്റ്റോർ തയ്യാറാക്കാം."
      />

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* CLOSER / CTA */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          &ldquo;നിങ്ങളുടെ ഇൻസ്റ്റാഗ്രാം പേജിന് അനുയോജ്യമായ പ്രൊഫഷണൽ ഓൺലൈൻ കട ഇന്ന് തന്നെ ഉണ്ടാക്കൂ.&rdquo;
        </p>
        <Link href="/register/seller" className="seo-btn-primary" id="ml-insta-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>ബയോ ലിങ്ക് ഉണ്ടാക്കൂ Free →</span>
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
