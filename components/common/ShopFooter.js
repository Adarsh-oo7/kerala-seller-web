'use client';

import React from "react";
import { Facebook, Instagram, Youtube } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ShopFooter({ store }) {
    const pathname = usePathname() || '';
    const facebookUrl = store?.facebook_link || store?.facebook_url;
    const instagramUrl = store?.instagram_link || store?.instagram_url;
    const youtubeUrl = store?.youtube_link || store?.youtube_url;
    const storeName = store?.name || store?.seller_name || 'Kerala Sellers';
    const logoUrl = store?.logo_url || store?.logo || "https://via.placeholder.com/150x50/1a4845/ffffff?text=KS";
    const shopMatch = pathname.match(/^\/shop\/([^/]+)/);
    const shopSlug = shopMatch?.[1] || store?.store_slug || '';
    const legalBase = shopSlug ? `/shop/${shopSlug}` : '';

    return (
        <footer className="Shopfooter">
            <div className="Shopfooter-left">
                © {new Date().getFullYear()} {storeName}
            </div>
            
            <div className="Shopfooter-logo">
                <img 
                    src={logoUrl} 
                    alt={storeName}
                    onError={(e) => { 
                        e.target.src = 'https://via.placeholder.com/150x50/1a4845/ffffff?text=KS';
                        e.target.onerror = null;
                    }}
                />
            </div>
            
            <nav className="Shopfooter-links">
                <Link href={legalBase ? `${legalBase}/privacy-policy` : '/privacy-policy'}>Privacy policy</Link>
                <Link href={legalBase ? `${legalBase}/terms-and-conditions` : '/terms-and-conditions'}>Terms and Conditions</Link>
                <Link href={legalBase ? `${legalBase}/cancellation-refund` : '/cancellation-refund'}>Cancellation and Refund</Link>
                <Link href={legalBase ? `${legalBase}/shipping-delivery` : '/shipping-delivery'}>Shipping and Delivery</Link>
            </nav>
            
            <div className="Shopfooter-socials">
                {/* Show shop's social media if available */}
                {facebookUrl && (
                    <a 
                        href={facebookUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                    >
                        <Facebook className="Shopsocial-icon" />
                    </a>
                )}

                {instagramUrl && (
                    <a 
                        href={instagramUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                    >
                        <Instagram className="Shopsocial-icon" />
                    </a>
                )}

                {youtubeUrl && (
                    <a 
                        href={youtubeUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                    >
                        <Youtube className="Shopsocial-icon" />
                    </a>
                )}

                {/* Fallback: Show Kerala Sellers main social if shop has no links */}
                {!facebookUrl && !instagramUrl && !youtubeUrl && (
                    <>
                        <a 
                            href="https://www.facebook.com/profile.php?id=61579701681445" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Kerala Sellers Facebook"
                        >
                            <Facebook className="Shopsocial-icon" />
                        </a>
                        <a 
                            href="https://www.instagram.com/kerala_sellers/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Kerala Sellers Instagram"
                        >
                            <Instagram className="Shopsocial-icon" />
                        </a>
                        <a 
                            href="https://www.youtube.com/@KeralaSellers" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Kerala Sellers YouTube"
                        >
                            <Youtube className="Shopsocial-icon" />
                        </a>
                    </>
                )}
            </div>
        </footer>
    );
}
