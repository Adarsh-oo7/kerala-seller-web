'use client';

import { XCircle, CheckCircle2, ArrowDown, Sparkles } from 'lucide-react';

/**
 * Visual "Before KeralaSellers" vs "With KeralaSellers" Problem-Solution comparison component.
 * Replaces emoji-heavy lists with structured, professional SaaS contrast cards.
 */
export default function ProblemSolutionSection({
  title = 'Sound Familiar? Here is How KeralaSellers Solves It',
  subtitle = 'These are the exact challenges small sellers in Kerala face every day. Here is how our platform eliminates them.',
  eyebrow = 'THE PROBLEM & SOLUTION',
  items = [],
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="seo-section">
      <div className="seo-section__header">
        <p className="seo-section__eyebrow">{eyebrow}</p>
        <h2 className="seo-section__h2">{title}</h2>
        {subtitle && <p className="seo-section__lead">{subtitle}</p>}
      </div>

      <div className="seo-ps-grid">
        {items.map((item, idx) => (
          <div key={idx} className="seo-ps-card">
            {/* BEFORE / PROBLEM */}
            <div className="seo-ps-card__box seo-ps-card__box--before">
              <div className="seo-ps-card__badge seo-ps-card__badge--before">
                <XCircle size={14} />
                <span>BEFORE KERALASELLERS</span>
              </div>
              <p className="seo-ps-card__text seo-ps-card__text--before">{item.problem}</p>
            </div>

            {/* DIVIDER ACCENT */}
            <div className="seo-ps-card__divider">
              <div className="seo-ps-card__divider-badge">
                <Sparkles size={13} color="#166534" />
                <span>SOLUTION</span>
              </div>
            </div>

            {/* AFTER / SOLUTION */}
            <div className="seo-ps-card__box seo-ps-card__box--after">
              <div className="seo-ps-card__badge seo-ps-card__badge--after">
                <CheckCircle2 size={14} />
                <span>WITH KERALASELLERS</span>
              </div>
              <p className="seo-ps-card__text seo-ps-card__text--after">{item.solution}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
