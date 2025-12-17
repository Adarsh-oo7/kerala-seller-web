import React from "react";
import { Facebook, Instagram, Youtube } from "lucide-react";


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">© 2025 DPS</div>
      <nav className="footer-links">
        <a href="#">Privacy policy</a>
        <a href="#">Terms and Conditions</a>
        <a href="#">Cancellation and Refund</a>
        <a href="#">Shipping and Delivery</a>
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
