'use client';

import { XCircle, CheckCircle, ArrowRight } from 'lucide-react';

/**
 * Visual "Before KeralaSellers" vs "With KeralaSellers" Problem-Solution comparison component.
 * Replaces emoji-heavy lists with structured, professional SaaS contrast cards.
 */
export default function ProblemSolutionSection({
  title = 'Sound Familiar? Here is How KeralaSellers Helps',
  subtitle = 'Stop managing your business through scattered chats, lost DMs, and manual notebooks.',
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
            <div className="seo-ps-card__before">
              <div className="seo-ps-card__badge seo-ps-card__badge--before">
                <XCircle size={14} />
                <span>BEFORE KERALASELLERS</span>
              </div>
              <p className="seo-ps-card__text">{item.problem}</p>
            </div>

            <div className="seo-ps-card__arrow" aria-hidden="true">
              <ArrowRight size={20} color="#64748b" />
            </div>

            {/* AFTER / SOLUTION */}
            <div className="seo-ps-card__after">
              <div className="seo-ps-card__badge seo-ps-card__badge--after">
                <CheckCircle size={14} />
                <span>WITH KERALASELLERS</span>
              </div>
              <p className="seo-ps-card__text">{item.solution}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
