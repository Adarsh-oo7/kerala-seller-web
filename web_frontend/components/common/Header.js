"use client"

import { useState } from "react"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <style jsx>{`
        .header {
          width: 100%;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .search-container {
          flex: 1;
          max-width: 320px;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 8px 40px 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 25px;
          font-size: 14px;
          outline: none;
        }

        .search-input:focus {
          border-color: #10b981;
        }

        .search-button {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 6px;
          cursor: pointer;
          border-radius: 50%;
        }

        .search-button:hover {
          background-color: #f3f4f6;
        }

        .logo-container {
          flex: 1;
          display: flex;
          justify-content: center;
          text-align: center;
        }

        .logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #f59e0b;
        }

        .brand-name {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin-top: -4px;
        }

        .tagline {
          font-size: 12px;
          color: #6b7280;
          margin-top: -4px;
        }

        .right-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
        }

        .icon-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-button {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
          color: #6b7280;
        }

        .icon-button:hover {
          background-color: #f3f4f6;
        }

        .enquire-button {
          background-color: #10b981;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          font-size: 14px;
        }

        .enquire-button:hover {
          background-color: #059669;
        }

        .navigation {
          border-top: 1px solid #e5e7eb;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          padding: 16px;
        }

        .nav-item {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          transition: color 0.2s;
        }

        .nav-item:hover {
          color: #10b981;
        }

        .nav-item.active {
          color: #10b981;
        }

        .nav-item-with-dropdown {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          flex-direction: column;
          gap: 3px;
        }

        .hamburger-line {
          width: 20px;
          height: 2px;
          background-color: #374151;
          transition: all 0.3s;
        }

        .mobile-menu {
          display: none;
          flex-direction: column;
          background-color: white;
          border-top: 1px solid #e5e7eb;
          padding: 16px;
        }

        .mobile-menu.open {
          display: flex;
        }

        .mobile-nav-item {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          font-size: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .mobile-nav-item:hover {
          color: #10b981;
        }

        .mobile-nav-item.active {
          color: #10b981;
        }

        @media (max-width: 768px) {
          .top-header {
            flex-wrap: wrap;
            gap: 12px;
          }

          .search-container {
            order: 3;
            flex: 1 1 100%;
            max-width: none;
            margin-top: 12px;
          }

          .logo-container {
            flex: 1;
            order: 1;
          }

          .right-section {
            flex: none;
            order: 2;
            gap: 8px;
          }

          .icon-group {
            gap: 8px;
          }

          .enquire-button {
            padding: 8px 16px;
            font-size: 12px;
          }

          .nav-menu {
            display: none;
          }

          .mobile-menu-button {
            display: flex;
          }

          .logo-text {
            font-size: 20px;
          }

          .brand-name {
            font-size: 16px;
          }

          .tagline {
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .top-header {
            padding: 8px 12px;
          }

          .icon-group {
            gap: 4px;
          }

          .enquire-button {
            padding: 6px 12px;
            font-size: 11px;
          }

          .logo-text {
            font-size: 18px;
          }

          .brand-name {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="header">
        {/* Top Header Bar */}
        <div className="top-header">
          {/* Search Bar */}
          <div className="search-container">
            <input type="text" placeholder="Discover beauty, one search at a time!" className="search-input" />
            <button className="search-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>

          {/* Logo */}
          <div className="logo-container">
            <div>
              <div className="logo-text">EIQ</div>
              <div className="brand-name">EINSTEIN Q</div>
              <div className="tagline">Beauty Meets Innovation</div>
            </div>
          </div>

          {/* Right Side Icons and Button */}
          <div className="right-section">
            <div className="icon-group">
              <button className="icon-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <button className="icon-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
              <button className="icon-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
            </div>
            <button className="enquire-button">ENQUIRE NOW</button>
            <button className="mobile-menu-button" onClick={toggleMobileMenu}>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="navigation">
          <div className="nav-container">
            <nav className="nav-menu">
              <a href="#" className="nav-item active">
                HOME
              </a>
              <a href="#" className="nav-item">
                ABOUT US
              </a>
              <div className="nav-item-with-dropdown">
                <a href="#" className="nav-item">
                  PRODUCTS
                </a>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </div>
              <a href="#" className="nav-item">
                SHOP
              </a>
              <a href="#" className="nav-item">
                SPECIAL OFFER
              </a>
              <a href="#" className="nav-item">
                BLOGS
              </a>
              <a href="#" className="nav-item">
                GALLERY
              </a>
              <a href="#" className="nav-item">
                CONTACT US
              </a>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
              <a href="#" className="mobile-nav-item active">
                HOME
              </a>
              <a href="#" className="mobile-nav-item">
                ABOUT US
              </a>
              <a href="#" className="mobile-nav-item">
                PRODUCTS
              </a>
              <a href="#" className="mobile-nav-item">
                SHOP
              </a>
              <a href="#" className="mobile-nav-item">
                SPECIAL OFFER
              </a>
              <a href="#" className="mobile-nav-item">
                BLOGS
              </a>
              <a href="#" className="mobile-nav-item">
                GALLERY
              </a>
              <a href="#" className="mobile-nav-item">
                CONTACT US
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
