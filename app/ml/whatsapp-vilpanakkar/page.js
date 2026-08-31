'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import FaqAccordion from '../../../components/seo/FaqAccordion';
import DemoVideoSection from '../../../components/seo/DemoVideoSection';
import ProblemSolutionSection from '../../../components/seo/ProblemSolutionSection';
import HowItWorksSteps from '../../../components/seo/HowItWorksSteps';
import TrustStatsBar from '../../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../../components/seo/TestimonialsGrid';
import { Store, Smartphone, ShoppingBag, CheckCircle2, ShieldCheck, Zap, MessageSquare } from 'lucide-react';

const mlFaqs = [
  {
    q: 'വാട്സ്ആപ്പ് സ്റ്റാറ്റസിൽ ലിങ്ക് കൊടുക്കുന്നത് എങ്ങനെ സഹായിക്കും?',
    a: 'നിങ്ങളുടെ വാട്സ്ആപ്പ് സ്റ്റാറ്റസ് കാണുന്ന ബന്ധുക്കളും സുഹൃത്തുക്കളും ലിങ്കിൽ ക്ലിക്ക് ചെയ്ത് പ്രോഡക്റ്റുകൾ കണ്ട് കാർട്ടിൽ ആഡ് ചെയ്ത് ഓർഡർ അയക്കും.',
  },
  {
    q: 'പേയ്‌മെന്റ് സ്വീകരിക്കാൻ യുപിഐ (GPay/PhonePe) കണക്റ്റ് ചെയ്യാമോ?',
    a: 'അതെ. റേസർപേ വഴി പേയ്‌മെന്റ് സ്വീകരിക്കാം. ഓർഡർ ചെയ്യുമ്പോൾ തന്നെ തുക നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ടിലേക്ക് വരും.',
  },
  {
    q: 'വാട്സ്ആപ്പ് ഗ്രൂപ്പുകളിൽ ഇത് ഷെയർ ചെയ്യാമോ?',
    a: 'തീർച്ചയായും! സുരക്ഷിതമായ വെബ് ലിങ്ക് ആയതിനാൽ ഗ്രൂപ്പുകളിലും ബ്രോഡ്കാസ്റ്റ് ലിസ്റ്റുകളിലും എളുപ്പത്തിൽ ഷെയർ ചെയ്യാം.',
  },
];

const mlStats = [
  { n: '500+', l: 'വാട്സ്ആപ്പ് സെല്ലേഴ്സ്' },
  { n: '0%', l: 'കമ്മീഷൻ Cut' },
  { n: '1 Status', l: 'ലിങ്ക് വഴി കച്ചവടം' },
  { n: '100%', l: 'ഓട്ടോമാറ്റിക് ബില്ലിംഗ്' },
];

const mlProblems = [
  {
    problem: 'വാട്സ്ആപ്പ് ചാറ്റുകളിൽ ഓർഡറുകളും പേര് വിവരങ്ങളും ടൈപ്പ് ചെയ്ത് സമയം കളയുന്നു',
    solution: 'കസ്റ്റമർ ലിങ്കിൽ ക്ലിക്ക് ചെയ്ത് പേരും വിലാസവും നൽകി ഓർഡർ ചെയ്യും. ഓർഡർ ആപ്പിൽ ലഭിക്കും.',
  },
  {
    problem: 'ആർക്കൊക്കെ സാധനം അയച്ചു, ആരെല്ലാം പണം നൽകി എന്ന് ഓർത്തെടുക്കാൻ പ്രയാസം',
    solution: 'ഓരോ ഓർഡറിനും Unique Order ID ഉണ്ടാകും. Paid / Pending / Delivered സ്റ്റാറ്റസുകൾ ട്രാക്ക് ചെയ്യാം.',
  },
];

export default function MlWhatsappVilpanakkarPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'ML', href: '/ml' }, { label: 'വാട്സ്ആപ്പ് വിൽപനക്കാർ' }]}>
      {/* HERO SECTION */}
      <section className="seo-hero" aria-labelledby="ml-wa-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <MessageSquare size={16} color="#a3e635" />
            <span>വാട്സ്ആപ്പ് വഴി ബിസിനസ്സ് ചെയ്യുന്നവർക്കായി</span>
          </div>

          <h1 className="seo-hero__h1" id="ml-wa-h1" lang="ml">
            വാട്സ്ആപ്പ് ഓർഡറുകൾ <em>ഓട്ടോമാറ്റിക്കായി സ്വീകരിക്കൂ</em>
          </h1>

          <p className="seo-hero__sub" lang="ml">
            നിങ്ങളുടെ സ്റ്റോർ ലിങ്ക് വാട്സ്ആപ്പ് സ്റ്റാറ്റസിലും ഗ്രൂപ്പുകളിലും നൽകൂ. ഉപഭോക്താക്കൾ നേരിട്ട് പ്രോഡക്റ്റുകൾ തിരഞ്ഞെടുത്ത് യുപിഐ വഴി പണമടച്ച് ഓർഡർ ചെയ്യും.
          </p>

          <div className="seo-hero__pills">
            <span className="seo-hero__pill" lang="ml">✓ വാട്സ്ആപ്പ് സ്റ്റാറ്റസ് ലിങ്ക്</span>
            <span className="seo-hero__pill" lang="ml">✓ ആപ്പ് ഇല്ലാതെ കസ്റ്റമർ വാങ്ങും</span>
            <span className="seo-hero__pill" lang="ml">✓ 0% കമ്മീഷൻ</span>
          </div>

          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="ml-wa-start-btn">
              <Store size={20} />
              <span>വാട്സ്ആപ്പ് കട തുടങ്ങൂ Free →</span>
            </Link>
            <Link href="/for/whatsapp-sellers" className="seo-btn-secondary">
              <span>View English Details</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <TrustStatsBar stats={mlStats} />

      {/* DEMO VIDEO */}
      <DemoVideoSection
        title="വാട്സ്ആപ്പ് സെല്ലേഴ്സ് ഓർഡറുകൾ എങ്ങനെ കൈകാര്യം ചെയ്യുന്നു?"
        subtitle="വാട്സ്ആപ്പിൽ ലിങ്ക് ഷെയർ ചെയ്ത് ഓർഡറുകൾ സ്വീകരിക്കുന്നത് കാണൂ."
        videoTitle="Setup Payment Gateway and Manage Orders in Malayalam"
        youtubeId="ETjJ4BHp06o"
      />

      {/* PROBLEMS & SOLUTIONS */}
      <ProblemSolutionSection
        title="വാട്സ്ആപ്പ് കച്ചവടം കൂടുതൽ എളുപ്പമാക്കൂ"
        subtitle="ചാറ്റിംഗ് കുറയ്ക്കൂ, വിൽപ്പന കൂട്ടൂ."
        items={mlProblems}
      />

      {/* HOW IT WORKS */}
      <HowItWorksSteps
        title="വാട്സ്ആപ്പിൽ വിൽപന തുടങ്ങാൻ 4 വഴികൾ"
        subtitle="ലളിതമായ സെറ്റ്അപ്പ്, വേഗത്തിലുള്ള വിൽപ്പന."
      />

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* CLOSER / CTA */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          &ldquo;നിങ്ങളുടെ വാട്സ്ആപ്പ് സ്റ്റാറ്റസ് കാണുന്നവരെ നിങ്ങളുടെ സ്ഥിരം ഉപഭോക്താക്കളാക്കി മാറ്റൂ.&rdquo;
        </p>
        <Link href="/register/seller" className="seo-btn-primary" id="ml-wa-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>വാട്സ്ആപ്പ് കട തുടങ്ങൂ Free →</span>
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
