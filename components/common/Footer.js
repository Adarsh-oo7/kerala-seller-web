'use client';

import React from "react";
import { Facebook, Instagram, Youtube } from "lucide-react";
import Link from "next/link";


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">© {new Date().getFullYear()} Kerala Sellers</div>
      <nav className="footer-links">
        <Link href="/privacy-policy">Privacy policy</Link>
        <Link href="/terms-and-conditions">Terms and Conditions</Link>
        <Link href="/cancellation-refund">Cancellation and Refund</Link>
        <Link href="/shipping-delivery">Shipping and Delivery</Link>
      </nav>
      <div className="footer-socials">
        <a href="https://www.facebook.com/profile.php?id=61579701681445" target="blank" aria-label="Facebook">
          <Facebook className="social-icon" />
        </a>
        <a href="https://www.instagram.com/kerala_sellers/#/" target="blank" aria-label="Instagram">
          <Instagram className="social-icon" />
        </a>
        <a href="https://www.youtube.com/@KeralaSellers" target="blank"  aria-label="YouTube">
          <Youtube className="social-icon" />
        </a>
      </div>
    </footer>
  );
}
