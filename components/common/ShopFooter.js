import React from "react";
import { Facebook, Instagram, Youtube } from "lucide-react";


export default function ShopFooter() {
    return (
        <footer className="Shopfooter">


            <div className="Shopfooter-left">© 2025 Kerala Sellers</div>
            <div className="Shopfooter-logo">
                <img src="/logo.png" alt="Kerala Sellers" />
            </div>
            <nav className="Shopfooter-links">
                <a href="#">Privacy policy</a>
                <a href="#">Terms and Conditions</a>
                <a href="#">Cancellation and Refund</a>
                <a href="#">Shipping and Delivery</a>
            </nav>
            <div className="Shopfooter-socials">
                <a href="https://www.facebook.com/profile.php?id=61579701681445" target="blank" aria-label="Facebook">
                    <Facebook className="Shopsocial-icon" />
                </a>
                <a href="https://www.instagram.com/kerala_sellers/#/" target="blank" aria-label="Instagram">
                    <Instagram className="Shopsocial-icon" />
                </a>
                <a href="https://www.youtube.com/@KeralaSellers" target="blank" aria-label="YouTube">
                    <Youtube className="Shopsocial-icon" />
                </a>
            </div>
        </footer>

    );
}
