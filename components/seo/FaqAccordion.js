'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Reusable accordion FAQ component.
 * @param {Array<{q:string, a:string}>} faqs
 */
export default function FaqAccordion({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="faq-list" role="list">
      {faqs.map((item, i) => (
        <div
          key={i}
          className={`faq-item ${openIndex === i ? 'faq-item--open' : ''}`}
          role="listitem"
        >
          <button
            className="faq-question"
            onClick={() => toggle(i)}
            aria-expanded={openIndex === i}
            aria-controls={`faq-answer-${i}`}
            id={`faq-question-${i}`}
          >
            <span>{item.q}</span>
            <span className="faq-icon" aria-hidden="true">
              {openIndex === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>
          <div
            id={`faq-answer-${i}`}
            role="region"
            aria-labelledby={`faq-question-${i}`}
            className="faq-answer"
            hidden={openIndex !== i}
          >
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
