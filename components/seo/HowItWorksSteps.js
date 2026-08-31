'use client';

import { CheckCircle2 } from 'lucide-react';

/**
 * Visual step-by-step "How It Works" workflow timeline.
 * Desktop: Connecting timeline steps. Mobile: Vertical clean sequence.
 */
export default function HowItWorksSteps({
  title = 'From Zero to Live Store in 10 Minutes',
  subtitle = 'Simple step-by-step setup built for busy Kerala sellers.',
  eyebrow = 'HOW IT WORKS',
  steps = [
    { n: '01', title: 'Register Free Account', desc: 'Sign up with your mobile phone number. No credit card or developer needed.' },
    { n: '02', title: 'Add Shop Name & Products', desc: 'Upload product photos, set prices, stock quantities, and custom options.' },
    { n: '03', title: 'Share Your Store Link', desc: 'Put your link in Instagram bio, WhatsApp status, or share directly with buyers.' },
    { n: '04', title: 'Receive Orders & Grow', desc: 'Orders land directly in your dashboard with customer details and UPI payment status.' },
  ],
}) {
  return (
    <section className="seo-section seo-section--alt">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="seo-section__header">
          <p className="seo-section__eyebrow">{eyebrow}</p>
          <h2 className="seo-section__h2">{title}</h2>
          {subtitle && <p className="seo-section__lead">{subtitle}</p>}
        </div>

        <div className="seo-hiw-grid">
          {steps.map((s, idx) => (
            <div key={idx} className="seo-hiw-step">
              <div className="seo-hiw-step__header">
                <span className="seo-hiw-step__num">{s.n}</span>
                {idx < steps.length - 1 && <div className="seo-hiw-step__connector" aria-hidden="true" />}
              </div>
              <h3 className="seo-hiw-step__title">{s.title}</h3>
              <p className="seo-hiw-step__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
