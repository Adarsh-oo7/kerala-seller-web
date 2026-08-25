'use client';

import { Facebook, Instagram, Youtube, Linkedin, Mail, Globe } from 'lucide-react';
import { BRAND } from '../../app/lib/brand';

const ITEMS = [
  { href: BRAND.profiles.facebook, label: 'Facebook', Icon: Facebook },
  { href: BRAND.profiles.instagram, label: 'Instagram', Icon: Instagram },
  { href: BRAND.profiles.instagramAlt, label: 'Instagram second page', Icon: Instagram },
  { href: BRAND.profiles.youtube, label: 'YouTube', Icon: Youtube },
  { href: BRAND.profiles.linkedin, label: 'LinkedIn', Icon: Linkedin },
  { href: BRAND.profiles.google, label: 'Google Business', Icon: Globe },
  { href: `mailto:${BRAND.email}`, label: 'Email', Icon: Mail },
  { href: BRAND.parent.url, label: BRAND.parent.name, Icon: Globe },
];

export default function BrandSocialIcons({ className = 'footer-socials', iconClassName = 'social-icon' }) {
  return (
    <div className={className} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
      {ITEMS.map((item) => (
        <a
          key={item.href + item.label}
          href={item.href}
          target={item.href.startsWith('mailto:') ? undefined : '_blank'}
          rel={item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer me'}
          aria-label={item.label}
        >
          <item.Icon className={iconClassName} />
        </a>
      ))}
    </div>
  );
}
