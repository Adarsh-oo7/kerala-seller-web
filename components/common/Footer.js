'use client';

import React from 'react';
import Link from 'next/link';
import BrandSocialIcons from './BrandSocialIcons';
import { BRAND } from '../../app/lib/brand';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Site footer">

      {/* ── Main footer grid ── */}
      <div className="site-footer__inner">

        {/* Column 1 – Brand + contact */}
        <div className="site-footer__brand">
          <Link href="/" className="site-footer__logo-link" aria-label="Kerala Sellers home">
            <img
              src="/assets/images/logo/KERALA SELLERS transp.png"
              alt="Kerala Sellers logo"
              className="site-footer__logo"
              width={140}
              height={40}
              loading="lazy"
            />
          </Link>
          <p className="site-footer__tagline">
            Own online store for Instagram &amp; WhatsApp sellers in Kerala. 0% commission.
          </p>
          <address className="site-footer__contact" style={{ fontStyle: 'normal' }}>
            <a href={`tel:${BRAND.phoneTel}`} className="site-footer__contact-link">
              📞 {BRAND.phoneDisplay}
            </a>
            <a href={`mailto:${BRAND.email}`} className="site-footer__contact-link">
              ✉️ {BRAND.email}
            </a>
          </address>
          <BrandSocialIcons className="site-footer__socials" iconClassName="site-footer__social-icon" />
        </div>

        {/* Column 2 – Key pages */}
        <nav className="site-footer__nav" aria-label="Main pages">
          <h3 className="site-footer__nav-heading">Explore</h3>
          <ul className="site-footer__nav-list">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/sell-online-kerala">Sell Online in Kerala</Link></li>
            <li><Link href="/products">Browse Products</Link></li>
            <li><Link href="/shop">Shops</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>

        {/* Column 3 – Solutions & Features */}
        <nav className="site-footer__nav" aria-label="Solutions and Features">
          <h3 className="site-footer__nav-heading">Solutions &amp; POS</h3>
          <ul className="site-footer__nav-list">
            <li><Link href="/solutions">All Solutions</Link></li>
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
            <li><Link href="/features/pos-billing-software">POS Billing Software</Link></li>
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/faq">FAQ &amp; Help Center</Link></li>
          </ul>
        </nav>

        {/* Column 4 – Malayalam Pages */}
        <nav className="site-footer__nav" aria-label="Malayalam pages">
          <h3 className="site-footer__nav-heading">മലയാളം</h3>
          <ul className="site-footer__nav-list">
            <li><Link href="/ml">മലയാളം പ്രധാനം</Link></li>
            <li><Link href="/ml/online-vilpana">ഓൺലൈൻ വിൽപന</Link></li>
            <li><Link href="/ml/instagram-vilpanakkar">ഇൻസ്റ്റാഗ്രാം കച്ചവടം</Link></li>
            <li><Link href="/ml/whatsapp-vilpanakkar">വാട്സ്ആപ്പ് ഓർഡർ</Link></li>
            <li><Link href="/ml/veetu-business">വീട്ടു ബിസിനസ്സ്</Link></li>
          </ul>
        </nav>

        {/* Column 4 – Seller actions */}
        <nav className="site-footer__nav" aria-label="Seller actions">
          <h3 className="site-footer__nav-heading">Sell with Us</h3>
          <ul className="site-footer__nav-list">
            <li><Link href="/register/seller">Register as Seller</Link></li>
            <li><Link href="/login/seller">Seller Login</Link></li>
            <li>
              <a href={BRAND.profiles.youtube} target="_blank" rel="noopener noreferrer me">
                Video Tutorials
              </a>
            </li>
            <li>
              <a href={BRAND.profiles.prebook} target="_blank" rel="noopener noreferrer me">
                Pre-book a Store
              </a>
            </li>
          </ul>
        </nav>

        {/* Column 4 – Legal */}
        <nav className="site-footer__nav" aria-label="Legal">
          <h3 className="site-footer__nav-heading">Legal</h3>
          <ul className="site-footer__nav-list">
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions">Terms &amp; Conditions</Link></li>
            <li><Link href="/cancellation-refund">Cancellation &amp; Refund</Link></li>
            <li><Link href="/shipping-delivery">Shipping &amp; Delivery</Link></li>
            <li><Link href="/delete-account">Delete Account</Link></li>
          </ul>
        </nav>

      </div>

      {/* ── Bottom bar ── */}
      <div className="site-footer__bottom">
        <small className="site-footer__copy">
          &copy; {year} {BRAND.name}. All rights reserved.
        </small>
        <span className="site-footer__parent">
          A product of{' '}
          <a href={BRAND.parent.url} target="_blank" rel="noopener noreferrer me">
            {BRAND.parent.name}
          </a>
        </span>
      </div>

    </footer>
  );
}
