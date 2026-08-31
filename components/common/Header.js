"use client"
import { useState, useEffect } from "react";
import Link from 'next/link';
import { useCart } from '../../app/context/CartContext';
import { ShoppingCart, User, Menu, X as CloseIcon, ChevronRight } from 'lucide-react';
import BottomNav from "./BottomNav";
import { isBuyerLoggedIn } from "../../app/lib/buyerAuth";

// ==============================================================================
// SUB-COMPONENTS (for better organization)  
// ==============================================================================

const DesktopNav = () => (
  <div className="navigation desktop-only" style={{ backgroundColor: '#1a4845' }}>
    <nav className="nav-menu">
      <Link href="/" className="nav-item">HOME</Link>
      {/* Solutions dropdown — additive, does not replace existing items */}
      <div className="nav-dropdown-wrapper">
        <Link href="/solutions" className="nav-item nav-item-with-arrow">SOLUTIONS ▾</Link>
        <div className="nav-dropdown-panel">
          <Link href="/solutions" className="nav-dropdown-item nav-dropdown-item--primary">
            All Solutions
            <small>Start → Sell → Manage → Grow</small>
          </Link>
          <div className="nav-dropdown-divider" />
          <Link href="/for/instagram-sellers" className="nav-dropdown-item">
            Instagram Sellers
          </Link>
          <Link href="/for/whatsapp-sellers" className="nav-dropdown-item">
            WhatsApp Sellers
          </Link>
          <Link href="/for/home-businesses" className="nav-dropdown-item">
            Home Businesses
          </Link>
          <Link href="/for/small-businesses" className="nav-dropdown-item">
            Small Businesses
          </Link>
          <div className="nav-dropdown-divider" />
          <Link href="/features" className="nav-dropdown-item nav-dropdown-item--featured">
            All Features &amp; Add-ons
          </Link>
          <Link href="/features/online-store-builder" className="nav-dropdown-item">
            Store Builder
          </Link>
          <Link href="/features/pos-billing-software" className="nav-dropdown-item">
            POS Billing Software
          </Link>
          <Link href="/features/order-management" className="nav-dropdown-item">
            Order Management
          </Link>
          <Link href="/features/inventory-management" className="nav-dropdown-item">
            Inventory Sync
          </Link>
          <div className="nav-dropdown-divider" />
          <Link href="/faq" className="nav-dropdown-item">
            FAQ &amp; Help Center
          </Link>
        </div>
      </div>
      <Link href="/sell-online-kerala" className="nav-item">SELL ONLINE</Link>
      <Link href="/products" className="nav-item">PRODUCTS</Link>
      <Link href="/shop" className="nav-item">SHOPS</Link>
      <Link href="/about" className="nav-item">ABOUT US</Link>
      <Link href="/contact" className="nav-item">CONTACT US</Link>
    </nav>
  </div>
);


const HeaderActions = ({ cartItemCount, isLoggedIn }) => {
  return (
    <div className="right-section">
      <div className="icon-group">
        {/* 🛒 Cart */}
        <Link href="/cart" className="icon-button" style={{ position: 'relative' }}>
          <ShoppingCart size={22} color="#1a4845" />
          {cartItemCount > 0 && (
            <span className="cart-badge">{cartItemCount}</span>
          )}
        </Link>

        {/* 👤 Login/Profile Button (Desktop & Mobile) */}
        <div className="auth-section">
          {isLoggedIn ? (
            <Link href="/profile" className="profile-button">
              <User size={20} color="#1a4845" />
              {/* <span className="profile-text">Profile</span> */}
            </Link>
          ) : (
            <Link href="/login/buyer" className="login-button-header">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const MobileMenu = ({ isOpen, onClose }) => {
  return (
    <>
      <div className={`mobile-menu-overlay ${isOpen ? "open" : ""}`} onClick={onClose}></div>
      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <Link href="/" onClick={onClose}>
              <img src="/assets/images/logo/KERALA SELLERS transp.png" alt="Logo" className="logo-image" />
            </Link>
          </div>
          <button className="close-button" onClick={onClose}>
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="mobile-nav-items">
          <Link href="/" className="mobile-nav-item" onClick={onClose}>
            <span className="nav-left">Home</span>
            <ChevronRight size={16} />
          </Link>
          <Link href="/sell-online-kerala" className="mobile-nav-item" onClick={onClose}>
            <span className="nav-left">Sell Online</span>
            <ChevronRight size={16} />
          </Link>
          {/* Solutions group — additive */}
          <Link href="/solutions" className="mobile-nav-item" onClick={onClose}>
            <span className="nav-left">Solutions</span>
            <ChevronRight size={16} />
          </Link>
          <Link href="/for/instagram-sellers" className="mobile-nav-item" onClick={onClose} style={{ paddingLeft: 32, fontSize: '0.9rem' }}>
            <span className="nav-left">📸 Instagram Sellers</span>
            <ChevronRight size={14} />
          </Link>
          <Link href="/for/whatsapp-sellers" className="mobile-nav-item" onClick={onClose} style={{ paddingLeft: 32, fontSize: '0.9rem' }}>
            <span className="nav-left">💬 WhatsApp Sellers</span>
            <ChevronRight size={14} />
          </Link>
          <Link href="/for/home-businesses" className="mobile-nav-item" onClick={onClose} style={{ paddingLeft: 32, fontSize: '0.9rem' }}>
            <span className="nav-left">🏠 Home Businesses</span>
            <ChevronRight size={14} />
          </Link>
          <Link href="/features" className="mobile-nav-item" onClick={onClose} style={{ paddingLeft: 32, fontSize: '0.9rem', fontWeight: 600, color: '#059669' }}>
            <span className="nav-left">✨ Features &amp; Add-ons</span>
            <ChevronRight size={14} />
          </Link>
          <Link href="/features/pos-billing-software" className="mobile-nav-item" onClick={onClose} style={{ paddingLeft: 32, fontSize: '0.9rem' }}>
            <span className="nav-left">🖨️ POS Billing Software</span>
            <ChevronRight size={14} />
          </Link>
          <Link href="/faq" className="mobile-nav-item" onClick={onClose} style={{ paddingLeft: 32, fontSize: '0.9rem' }}>
            <span className="nav-left">❓ FAQ</span>
            <ChevronRight size={14} />
          </Link>
          <Link href="/products" className="mobile-nav-item" onClick={onClose}>
            <span className="nav-left">Products</span>
            <ChevronRight size={16} />
          </Link>
          <Link href="/shop" className="mobile-nav-item" onClick={onClose}>
            <span className="nav-left">Shops</span>
            <ChevronRight size={16} />
          </Link>
          <Link href="/about" className="mobile-nav-item" onClick={onClose}>
            <span className="nav-left">About Us</span>
            <ChevronRight size={16} />
          </Link>
          <Link href="/contact" className="mobile-nav-item" onClick={onClose}>
            <span className="nav-left">Contact Us</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
};

// ==============================================================================
// MAIN HEADER COMPONENT
// ==============================================================================

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { carts } = useCart();

  // Calculate the total items from ALL individual carts
  const cartItemCount = Object.values(carts || {})
    .flat()
    .reduce((count, item) => count + item.quantity, 0);

  // ✅ FIXED: Enhanced authentication check to support both token types
  useEffect(() => {
    // Check both possible token locations
    setIsLoggedIn(isBuyerLoggedIn());

    const handleStorageChange = () => {
      setIsLoggedIn(isBuyerLoggedIn());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="header">
        <div className="top-header">
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            <Menu strokeWidth={1} color="#1a4845" />
          </button>

          <div className="logo-container">
            <Link href="/">
              <img src="/assets/images/logo/KERALA SELLERS transp.png" alt="Logo" className="logo-image" />
            </Link>
          </div>

          <HeaderActions cartItemCount={cartItemCount} isLoggedIn={isLoggedIn} />
        </div>

        <DesktopNav />

        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </header>

      <BottomNav cartItemCount={cartItemCount} isLoggedIn={isLoggedIn} />

      {/* Updated Styles with Old Color Theme */}
      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #FDFFF0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #FDFFF0;
        }

        .mobile-menu-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .mobile-menu-button:hover {
          background-color: #f1f5f9;
        }

        .logo-container {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .logo-image {
          height: 40px;
          width: auto;
          object-fit: contain;
        }

        .right-section {
          display: flex;
          align-items: center;
        }

        .icon-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
          text-decoration: none;
          color: inherit;
        }

        .icon-button:hover {
          background-color: #f1f5f9;
        }

        .cart-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        /* Fixed Profile Section - Single Implementation */
        .auth-section {
          display: flex;
          align-items: center;
        }

        .profile-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          text-decoration: none;
          color: #1a4845;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .profile-button:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .profile-text {
          display: none;
        }

        .login-button-header {
          padding: 8px 16px;
          background: #1a4845;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .login-button-header:hover {
          background: #0f3330;
        }

        /* Desktop Navigation with Old Theme Colors */
        .desktop-only {
          display: none;
        }

        .navigation {
          background: linear-gradient(135deg, #1a4845 0%, #0f3330 100%);
          padding: 0 20px;
          border-top: 2px solid #2d5a56;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .nav-item {
          color: #e8f5e8;
          text-decoration: none;
          padding: 16px 0;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: 0.5px;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-item:hover {
          color: white;
          border-bottom-color: #4ade80;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -8px;
          right: -8px;
          bottom: 0;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .nav-item:hover::before {
          opacity: 1;
        }

        /* Mobile Menu with Old Theme Colors */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(26, 72, 69, 0.7);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .mobile-menu-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 280px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          z-index: 1000;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          overflow-y: auto;
          box-shadow: 4px 0 20px rgba(26, 72, 69, 0.3);
        }

        .mobile-menu.open {
          transform: translateX(0);
        }

        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 2px solid #e2e8f0;
          background: #1a4845;
        }

        .mobile-logo .logo-image {
          height: 32px;
          filter: brightness(0) invert(1);
        }

        .close-button {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          color: white;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: rgba(255,255,255,0.2);
        }

        .mobile-nav-items {
          padding: 20px;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 12px;
          color: #1a4845;
          text-decoration: none;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 4px;
          font-weight: 500;
          border: 1px solid transparent;
          transition: all 0.2s;
        }

        .mobile-nav-item:hover {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #0f3330;
        }

        .plus-icon {
          font-weight: bold;
          color: #64748b;
          background: #f1f5f9;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .submenu {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
          background: #f8fafc;
          margin: 8px -12px 4px -12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .submenu.expanded {
          max-height: 200px;
          padding: 8px 0;
        }

        .submenu-item {
          display: block;
          padding: 10px 20px;
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          border-radius: 4px;
          margin: 2px 8px;
          transition: all 0.2s;
        }

        .submenu-item:hover {
          background: #e2e8f0;
          color: #1a4845;
        }

        /* Responsive Styles */
        @media (min-width: 768px) {
          .desktop-only {
            display: block;
          }

          .mobile-menu-button {
            display: none;
          }

          .logo-container {
            flex: 0;
            justify-content: flex-start;
          }

          .logo-image {
            height: 45px;
          }

          .profile-text {
            display: inline;
          }

          .profile-button {
            padding: 8px 16px;
          }
        }

        /* Mobile optimizations */
        @media (max-width: 767px) {
          .profile-button {
            padding: 8px;
            background: transparent;
            border: none;
          }

          .profile-button:hover {
            background: #f1f5f9;
          }
        }
      `}</style>
    </>
  );
}
