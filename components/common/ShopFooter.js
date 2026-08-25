'use client';

import React, { useState } from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './ShopFooter.module.css';
import { BRAND } from '../../app/lib/brand';

function shopSlugFromHost() {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname.toLowerCase();
  const base = 'keralasellers.in';
  if (host.endsWith(`.${base}`) && host !== `www.${base}` && host !== `api.${base}`) {
    return host.slice(0, -(base.length + 1));
  }
  return '';
}

export default function ShopFooter({ store }) {
  const pathname = usePathname() || '';
  const facebookUrl = store?.facebook_link || store?.facebook_url;
  const instagramUrl = store?.instagram_link || store?.instagram_url;
  const youtubeUrl = store?.youtube_link || store?.youtube_url;
  const storeName = store?.name || store?.seller_name || 'Kerala Sellers';
  const logoUrl = store?.logo_url || store?.cloudinary_logo || store?.logo || '';
  const [logoFailed, setLogoFailed] = useState(false);
  const shopMatch = pathname.match(/^\/shop\/([^/]+)/);
  const shopSlug = shopMatch?.[1] || store?.store_slug || shopSlugFromHost();
  const legalBase = shopSlug ? `/shop/${shopSlug}` : '';
  const initial = String(storeName).trim().charAt(0).toUpperCase() || 'S';
  const hasOwnSocials = Boolean(facebookUrl || instagramUrl || youtubeUrl);

  return (
    <footer className={styles.footer}>
      <div className={styles.logoWrap}>
        {logoUrl && !logoFailed ? (
          <img
            className={styles.logo}
            src={logoUrl}
            alt=""
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div className={styles.logoFallback} aria-hidden="true">{initial}</div>
        )}
      </div>

      <nav className={styles.links}>
        <Link href={legalBase ? `${legalBase}/privacy-policy` : '/privacy-policy'}>Privacy policy</Link>
        <Link href={legalBase ? `${legalBase}/terms-and-conditions` : '/terms-and-conditions'}>Terms and Conditions</Link>
        <Link href={legalBase ? `${legalBase}/cancellation-refund` : '/cancellation-refund'}>Cancellation and Refund</Link>
        <Link href={legalBase ? `${legalBase}/shipping-delivery` : '/shipping-delivery'}>Shipping and Delivery</Link>
      </nav>

      <div className={styles.bottom}>
        <div className={styles.copy}>© {new Date().getFullYear()} {storeName}</div>
        <div className={styles.socials}>
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook className={styles.icon} />
            </a>
          )}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className={styles.icon} />
            </a>
          )}
          {youtubeUrl && (
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <Youtube className={styles.icon} />
            </a>
          )}
          {!hasOwnSocials && (
            <>
              <a href={BRAND.profiles.facebook} target="_blank" rel="noopener noreferrer me" aria-label="Kerala Sellers Facebook">
                <Facebook className={styles.icon} />
              </a>
              <a href={BRAND.profiles.instagram} target="_blank" rel="noopener noreferrer me" aria-label="Kerala Sellers Instagram">
                <Instagram className={styles.icon} />
              </a>
              <a href={BRAND.profiles.youtube} target="_blank" rel="noopener noreferrer me" aria-label="Kerala Sellers YouTube">
                <Youtube className={styles.icon} />
              </a>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
