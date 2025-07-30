

"use client"

import { useState, useEffect } from "react"


export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState(null)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleExpandItem = (item) => {
    setExpandedItem(expandedItem === item ? null : item)
  }

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen)
  }

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMobileMenuOpen])

  return (
    <div className="header">
      {/* Top Header Bar */}
      <div className="top-header">
        {/* Mobile Menu Button */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </button>

        {/* Mobile Search Button */}
        <div className="mobile-only">
          <button className="mobile-search-button" onClick={toggleMobileSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>

        {/* Desktop Search */}
        <div className="search-container desktop-only">
          <input type="text" placeholder="Discover beauty, one search at a time!" className="search-input" />
          <button className="search-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="logo-container">
          <a href="/">
            <img src="/assets/images/logoks.png" alt="Logo" className="logo-image" />
          </a>
        </div>

        {/* Right Side Icons */}
        <div className="right-section">
          <div className="icon-group">
            <button className="icon-button wishlist-icon-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button className="icon-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </button>
            <button className="icon-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
          <button className="enquire-button">ENQUIRE NOW</button>
        </div>
      </div>

      {/* Mobile Search Bar Centered */}
      {isMobileSearchOpen && (
        <div className="mobile-search-container">
          <div className="mobile-search-wrapper">
            <input
              type="text"
              placeholder="Discover beauty, one search at a time!"
              className="mobile-search-input"
            />
            <svg
              className="mobile-search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>
      )}


      {/* Navigation */}
      <div className="navigation">
        <div className="nav-container">
          <nav className="nav-menu">
            <a href="#" className="nav-item active">HOME</a>
            <a href="#" className="nav-item">ABOUT US</a>
            <div className="nav-item-with-dropdown">
              <a href="#" className="nav-item">PRODUCTS</a>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
            <a href="#" className="nav-item">SHOP</a>
            <a href="#" className="nav-item">SPECIAL OFFER</a>
            <a href="#" className="nav-item">BLOGS</a>
            <a href="#" className="nav-item">GALLERY</a>
            <a href="#" className="nav-item">CONTACT US</a>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`} onClick={toggleMobileMenu}></div>

      {/* Mobile Menu Sidebar */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <a href="/">
              <img src="https://tse2.mm.bing.net/th/id/OIP.NXILvymg8PHUgZW6_b7fegHaHa?pid=Api&P=0&h=220" alt="Logo" className="logo-image" />
            </a>
          </div>
          <button className="close-button" onClick={toggleMobileMenu}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="mobile-nav-items">
          <a href="#" className="mobile-nav-item active">
            <div className="flex items-center">
              <span className="chevron-icon">›</span>
              Home
            </div>
          </a>
          <a href="#" className="mobile-nav-item">
            <div className="flex items-center">
              <span className="chevron-icon">›</span>
              About Us
            </div>
          </a>
          <div>
            <div className="mobile-nav-item" onClick={() => toggleExpandItem("products")}>
              <div className="flex items-center">
                <span className="chevron-icon">›</span>
                Products
              </div>
              <div className="plus-icon">{expandedItem === "products" ? "−" : "+"}</div>
            </div>
            <div className={`submenu ${expandedItem === "products" ? "expanded" : ""}`}>
              <a href="#" className="submenu-item">
                Category 1
              </a>
              <a href="#" className="submenu-item">
                Category 2
              </a>
              <a href="#" className="submenu-item">
                Category 3
              </a>
            </div>
          </div>
          <a href="#" className="mobile-nav-item">
            <div className="flex items-center">
              <span className="chevron-icon">›</span>
              Shop
            </div>
          </a>
          <a href="#" className="mobile-nav-item">
            <div className="flex items-center">
              <span className="chevron-icon">›</span>
              Special Offer
            </div>
          </a>
          <a href="#" className="mobile-nav-item">
            <div className="flex items-center">
              <span className="chevron-icon">›</span>
              Blogs
            </div>
          </a>
          <a href="#" className="mobile-nav-item">
            <div className="flex items-center">
              <span className="chevron-icon">›</span>
              Gallery
            </div>
          </a>
          <a href="#" className="mobile-nav-item">
            <div className="flex items-center">
              <span className="chevron-icon">›</span>
              Contact Us
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
