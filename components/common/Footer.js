'use client';

import React from 'react';
import Link from 'next/link';
import BrandSocialIcons from './BrandSocialIcons';
import { BRAND } from '../../app/lib/brand';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        © {new Date().getFullYear()} {BRAND.name}
        <div style={{ marginTop: 6, fontSize: 12 }}>
          A product of{' '}
          <a href={BRAND.parent.url} target="_blank" rel="noopener noreferrer me">
            {BRAND.parent.name}
          </a>
        </div>
      </div>
      <nav className="footer-links">
        <Link href="/privacy-policy">Privacy policy</Link>
        <Link href="/delete-account">Delete account</Link>
        <Link href="/terms-and-conditions">Terms and Conditions</Link>
        <Link href="/cancellation-refund">Cancellation and Refund</Link>
        <Link href="/shipping-delivery">Shipping and Delivery</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href={BRAND.sellerStart}>Register</Link>
      </nav>
      <BrandSocialIcons />
    </footer>
  );
}
