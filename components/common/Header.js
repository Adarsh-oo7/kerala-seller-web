"use client"

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useCart } from '../../app/context/CartContext';
import { ShoppingCart, User, Menu, X as CloseIcon, ChevronRight, Search } from 'lucide-react';
import BottomNav from "/components/common/BottomNav";

// ==============================================================================
// SUB-COMPONENTS (for better organization)
// ==============================================================================

const DesktopNav = () => (
  <div className="navigation desktop-only">
    <nav className="nav-menu">
      <Link href="/" className="nav-item">HOME</Link>
      <Link href="/shop" className="nav-item">SHOP</Link>
      <Link href="/about" className="nav-item">ABOUT US</Link>
      <Link href="/contact" className="nav-item">CONTACT US</Link>
    </nav>
  </div>
);

const HeaderActions = ({ cartItemCount, isLoggedIn }) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <div className="right-section">
      <div className="icon-group">

        {/* 🔍 Search Bar (desktop & tablet) */}
        <div className="search-container">
          <input type="text" placeholder="Search..." className="search-input" />
          <Search size={16} className="search-icon" />
        </div>

        {/* 🔍 Search Icon (mobile only) */}
        <button
          className="search-icon-button"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          <Search size={20} />
        </button>

        {/* 🛒 Cart */}
        <Link href="/cart" className="icon-button" style={{ position: 'relative' }}>
          <ShoppingCart size={22} />
          {cartItemCount > 0 && (
            <span className="cart-badge">{cartItemCount}</span>
          )}
        </Link>

        {/* 👤 Login / Profile (hidden on mobile) */}
        <div className="auth-buttons">
          {isLoggedIn ? (
            <Link href="/profile" className="icon-button">
              <User size={22} />
            </Link>
          ) : (
            <Link href="/login/buyer" className="login-button-header">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* 📱 Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="mobile-search-overlay">
          <div className="mobile-search-box">
            <Search size={18} className="mobile-search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="mobile-search-input"
              autoFocus
            />
            <button
              className="mobile-search-close"
              onClick={() => setShowMobileSearch(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const MobileMenu = ({ isOpen, onClose }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpandItem = (item) => {
    setExpandedItem(expandedItem === item ? null : item);
  };

  useEffect(() => {
    if (!isOpen) {
      setExpandedItem(null);
    }
  }, [isOpen]);

  return (
    <>
      <div className={`mobile-menu-overlay ${isOpen ? "open" : ""}`} onClick={onClose}></div>
      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <Link href="/" onClick={onClose}>
              <img src="https://tse2.mm.bing.net/th/id/OIP.NXILvymg8PHUgZW6_b7fegHaHa?pid=Api&P=0&h=220" alt="Logo" className="logo-image" />
            </Link>
          </div>
          <button className="close-button" onClick={onClose}>
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="mobile-nav-items">
          <Link href="/" className="mobile-nav-item" onClick={onClose}><ChevronRight size={16} /> Home</Link>
          <Link href="/shop" className="mobile-nav-item" onClick={onClose}><ChevronRight size={16} /> Shop</Link>
          <div>
            <div className="mobile-nav-item" onClick={() => toggleExpandItem("products")}>
              <span><ChevronRight size={16} /> Products</span>
              <div className="plus-icon">{expandedItem === "products" ? "−" : "+"}</div>
            </div>
            <div className={`submenu ${expandedItem === "products" ? "expanded" : ""}`}>
              <Link href="/category/1" className="submenu-item" onClick={onClose}>Category 1</Link>
              <Link href="/category/2" className="submenu-item" onClick={onClose}>Category 2</Link>
            </div>
          </div>
          <Link href="/about" className="mobile-nav-item" onClick={onClose}><ChevronRight size={16} /> About Us</Link>
          <Link href="/contact" className="mobile-nav-item" onClick={onClose}><ChevronRight size={16} /> Contact Us</Link>
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
  const { carts } = useCart(); // ✅ Use 'carts' (plural) from the context

  // ✅ Correctly calculate the total items from ALL individual carts
  const cartItemCount = Object.values(carts || {})
    .flat()
    .reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    const token = localStorage.getItem('buyerAccessToken');
    setIsLoggedIn(!!token);
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
          <Menu />
        </button>

        <div className="logo-container">
          <Link href="/">
            <img src="/assets/images/logo/KERALA SELLERS transp.png" alt="Logo" className="logo-image" />
          </Link>
        </div>

        <HeaderActions cartItemCount={cartItemCount} isLoggedIn={isLoggedIn} />
      </div>

      <DesktopNav />

      <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
    </header>
    <BottomNav cartItemCount={cartItemCount} isLoggedIn={isLoggedIn} />
    </>
  );
}