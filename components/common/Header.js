"use client"

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useCart } from '../../app/context/CartContext';
import { ShoppingCart, User, Heart, Search, X as CloseIcon, Menu, ChevronRight } from 'lucide-react';

// Main Header Component
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { cartItems } = useCart();

  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Check login status on the client-side
  useEffect(() => {
    const token = localStorage.getItem('buyerAccessToken');
    setIsLoggedIn(!!token);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="header">
      <div className="top-header">
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          <Menu />
        </button>

        <div className="logo-container">
          <Link href="/">
            <img src="https://tse2.mm.bing.net/th/id/OIP.NXILvymg8PHUgZW6_b7fegHaHa?pid=Api&P=0&h=220" alt="Logo" className="logo-image" />
          </Link>
        </div>

        <HeaderActions cartItemCount={cartItemCount} isLoggedIn={isLoggedIn} />
      </div>

      <DesktopNav />
      
      <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
    </header>
  );
}

// Sub-component for Desktop Navigation
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

// Sub-component for Header Action Icons
const HeaderActions = ({ cartItemCount, isLoggedIn }) => (
  <div className="right-section">
    <div className="icon-group">
      <Link href="/cart" className="icon-button" style={{position: 'relative'}}>
        <ShoppingCart size={22} />
        {cartItemCount > 0 && (
          <span className="cart-badge">{cartItemCount}</span>
        )}
      </Link>

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
);

// Sub-component for the Mobile Menu Sidebar
const MobileMenu = ({ isOpen, onClose }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpandItem = (item) => {
    setExpandedItem(expandedItem === item ? null : item);
  };
  
  return (
    <>
      <div className={`mobile-menu-overlay ${isOpen ? "open" : ""}`} onClick={onClose}></div>
      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <Link href="/">
              <img src="https://tse2.mm.bing.net/th/id/OIP.NXILvymg8PHUgZW6_b7fegHaHa?pid=Api&P=0&h=220" alt="Logo" className="logo-image" />
            </Link>
          </div>
          <button className="close-button" onClick={onClose}>
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="mobile-nav-items">
          <Link href="/" className="mobile-nav-item"><ChevronRight size={16}/> Home</Link>
          <Link href="/shop" className="mobile-nav-item"><ChevronRight size={16}/> Shop</Link>
          <div>
            <div className="mobile-nav-item" onClick={() => toggleExpandItem("products")}>
              <span><ChevronRight size={16}/> Products</span>
              <div className="plus-icon">{expandedItem === "products" ? "−" : "+"}</div>
            </div>
            <div className={`submenu ${expandedItem === "products" ? "expanded" : ""}`}>
              <Link href="/category/1" className="submenu-item">Category 1</Link>
              <Link href="/category/2" className="submenu-item">Category 2</Link>
            </div>
          </div>
          <Link href="/about" className="mobile-nav-item"><ChevronRight size={16}/> About Us</Link>
          <Link href="/contact" className="mobile-nav-item"><ChevronRight size={16}/> Contact Us</Link>
        </div>
      </div>
    </>
  );
};