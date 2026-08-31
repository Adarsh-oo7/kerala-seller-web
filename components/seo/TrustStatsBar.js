'use client';

import { ShieldCheck, Smartphone, Zap, MapPin, Award } from 'lucide-react';

/**
 * Trust signals and stats bar component.
 */
export default function TrustStatsBar({
  stats = [
    { n: '1000+', l: 'Active Sellers' },
    { n: '0%', l: 'Commission Cut' },
    { n: '10 min', l: 'Store Setup' },
    { n: '14+', l: 'Kerala Districts' },
  ],
}) {
  return (
    <div className="seo-trust-bar" role="region" aria-label="Platform Statistics">
      <div className="seo-trust-bar__inner">
        {stats.map((s, idx) => (
          <div key={idx} className="seo-trust-item">
            <span className="seo-trust-item__num">{s.n}</span>
            <span className="seo-trust-item__label">{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
