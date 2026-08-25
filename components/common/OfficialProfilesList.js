'use client';

import { BRAND } from '../../app/lib/brand';

const LINKS = [
  { label: '@kerala_sellers', href: BRAND.profiles.instagram },
  { label: '@kerala__sellers', href: BRAND.profiles.instagramAlt },
  { label: 'Facebook', href: BRAND.profiles.facebook },
  { label: 'YouTube @KeralaSellers', href: BRAND.profiles.youtube },
  { label: 'LinkedIn', href: BRAND.profiles.linkedin },
  { label: 'Google listing', href: BRAND.profiles.google },
  { label: 'Email', href: `mailto:${BRAND.email}` },
  { label: BRAND.parent.name, href: BRAND.parent.url },
];

export default function OfficialProfilesList() {
  return (
    <div className="steps-container">
      {LINKS.map((item) => (
        <div className="step-card" key={item.href}>
          <div>
            <h4>{item.label}</h4>
            <p>
              <a href={item.href} target="_blank" rel="noopener noreferrer me">
                {item.label === 'Email' ? BRAND.email : item.href.replace(/^https?:\/\//, '')}
              </a>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
