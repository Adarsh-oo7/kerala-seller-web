"use client"

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '../../app/context/CartContext';
import { usePathname } from "next/navigation";
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X as CloseIcon, 
  Search,
  Heart,
  Phone,
  MapPin,
  Star,
  Home,
  ShoppingBag,
  Bell,
  Share2,
  Zap,
  Grid3X3,
  Info
} from 'lucide-react';
import styles from './SHeader.module.css';

// Bottom Navigation Component with Fluid Tan Theme
function BottomNav({ store, sellerPhone }) {
  const [show, setShow] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const { carts } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  // Use sellerPhone parameter as fallback if store data is incomplete
  const storePhone = sellerPhone || store?.seller_phone;

  console.log('BottomNav - sellerPhone:', sellerPhone);
  console.log('BottomNav - store?.seller_phone:', store?.seller_phone);
  console.log('BottomNav - final storePhone:', storePhone);

  // Total cart items across all stores for main navigation
  const totalCartItemCount = Object.values(carts || {})
    .flat()
    .reduce((count, item) => count + item.quantity, 0);

  // Individual store cart count if store is provided
  const storeCartCount = storePhone ? (carts[storePhone] || []).reduce((count, item) => count + item.quantity, 0) : 0;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show bottom nav when scrolling down past 100px
      if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setShow(true);
      }
      // Hide when scrolling up or near top
      else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShow(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check for page position
    if (window.scrollY > 100) {
      setShow(true);
    }
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Update active index based on current path
  useEffect(() => {
    if (storePhone) {
      if (pathname === `/shop/${storePhone}`) setActiveIndex(0);
      else if (pathname.includes('/cart/')) setActiveIndex(1);
      else if (pathname.includes('/about')) setActiveIndex(2);
      else if (pathname.includes('/profile')) setActiveIndex(3);
      else setActiveIndex(0);
    } else {
      if (pathname === "/") setActiveIndex(0);
      else if (pathname === "/cart") setActiveIndex(1);
      else if (pathname === "/about") setActiveIndex(2);
      else if (pathname === "/profile") setActiveIndex(3);
    }
  }, [pathname, storePhone]);

  // Handle profile navigation with explicit routing
  const handleProfileNavigation = (e) => {
    e.preventDefault();
    console.log('Navigating to profile page');
    router.push('/profile');
  };

  // Don't render if we don't have a valid storePhone
  if (!storePhone) {
    console.warn('BottomNav: No valid storePhone available');
    return null;
  }

  const navItems = [
    { 
      href: `/shop/${storePhone}`, 
      icon: Home, 
      label: "Home", 
      color: "#D2691E" 
    },
    { 
      href: `/cart/${storePhone}`, 
      icon: ShoppingCart, 
      label: "Cart", 
      color: "#CD853F",
      badge: storeCartCount 
    },
    { 
      href: `/shop/${storePhone}/about`, 
      icon: Info, 
      label: "About", 
      color: "#DEB887" 
    },
    { 
      href: "/profile", 
      icon: User, 
      label: "Profile", 
      color: "#F4A460",
      onClick: handleProfileNavigation
    }
  ];

  return (
    <nav 
      className={`${styles.bottomNav} ${show ? styles.show : ""}`} 
      role="navigation" 
      aria-label="Mobile navigation"
    >
      <div className={styles.navBackground}></div>
      <div className={styles.activeIndicator} style={{
        transform: `translateX(${activeIndex * 100}%)`,
        background: `linear-gradient(135deg, ${navItems[activeIndex]?.color || '#D2691E'}, ${navItems[activeIndex]?.color || '#D2691E'}90)`
      }}></div>
      
      {navItems.map((item, index) => {
        const IconComponent = item.icon;
        const isActive = activeIndex === index;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.bottomNavItem} ${isActive ? styles.active : ""}`}
            onClick={(e) => {
              setActiveIndex(index);
              if (item.onClick) {
                item.onClick(e);
              }
            }}
            aria-label={`${item.label}${item.badge ? ` with ${item.badge} items` : ""}`}
          >
            <div className={styles.navIcon} style={{
              color: isActive ? item.color : '#8B4513'
            }}>
              <IconComponent size={isActive ? 24 : 20} />
              {item.badge && item.badge > 0 && (
                <span className={styles.cartBadge}>{item.badge}</span>
              )}
            </div>
            <span 
              className={styles.navLabel}
              style={{
                color: isActive ? item.color : '#8B4513',
                transform: isActive ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function SHeader({ store, isLoggedIn = false, sellerPhone }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [hideTopBar, setHideTopBar] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { carts } = useCart();
  const searchInputRef = useRef(null);
  const searchDesktopRef = useRef(null);
  const router = useRouter();
  const params = useParams();

  // Use multiple sources for sellerPhone with priority order
  const finalSellerPhone = sellerPhone || params?.sellerPhone || store?.seller_phone;
  
  console.log('SHeader - sellerPhone prop:', sellerPhone);
  console.log('SHeader - params?.sellerPhone:', params?.sellerPhone);
  console.log('SHeader - store?.seller_phone:', store?.seller_phone);
  console.log('SHeader - final sellerPhone:', finalSellerPhone);

  // Get cart count for this specific store
  const cartCount = finalSellerPhone ? (carts[finalSellerPhone] || []).reduce((count, item) => count + item.quantity, 0) : 0;

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setHeaderScrolled(currentScrollY > 20);
          
          // Improved scroll behavior
          if (currentScrollY > 150 && currentScrollY > lastScrollY + 5) {
            setHideTopBar(true);
          } else if (currentScrollY < lastScrollY - 5 || currentScrollY < 100) {
            setHideTopBar(false);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [showMobileSearch]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setShowMobileSearch(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close search if menu opens
    if (!isMobileMenuOpen) {
      setShowMobileSearch(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Add your search logic here
      setShowMobileSearch(false);
    }
  };

  const closeMobileSearch = () => {
    setShowMobileSearch(false);
    setSearchQuery('');
  };

  // Handle profile click with explicit navigation
  const handleProfileClick = (e) => {
    e.preventDefault();
    console.log('Profile clicked, navigating to /profile');
    router.push('/profile');
  };

  // Handle phone click to prevent unwanted WhatsApp redirect
  const handlePhoneClick = (e) => {
    e.preventDefault();
    // Just show the phone number, don't redirect to WhatsApp
    console.log('Phone number:', finalSellerPhone);
    // Optionally show a modal or copy to clipboard instead
  };

  // Don't render header if no seller phone is available
  if (!finalSellerPhone) {
    console.warn('SHeader: No valid sellerPhone available');
    return null;
  }

  // Use store data if available, otherwise create minimal store object
  const storeData = store || { 
    name: 'Store', 
    seller_phone: finalSellerPhone,
    tagline: 'Loading...'
  };

  return (
    <>
      <header className={`${styles.sheader} ${headerScrolled ? styles.scrolled : ''} ${hideTopBar ? styles.hideHeader : ''}`}>
        {/* Essential Top Bar */}
        <div className={`${styles.topBar} ${!showPromo || hideTopBar ? styles.hidden : ''}`}>
          <div className={styles.container}>
            <div className={styles.topLeft}>
              <div className={styles.contactInfo} onClick={handlePhoneClick}>
                <Phone size={12} />
                <span>{finalSellerPhone}</span>
              </div>
              <div className={styles.locationInfo}>
                <MapPin size={12} />
                <span>Kerala, India</span>
              </div>
            </div>
            <div className={styles.topRight}>
              <div className={styles.ratingInfo}>
                <Star size={12} fill="currentColor" />
                <span>4.8 (2.3k reviews)</span>
              </div>
              <div className={styles.trustBadge}>
                <Zap size={10} />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className={styles.mainHeader}>
          <div className={styles.container}>
            {/* Mobile Back/Menu Toggle */}
            <button 
              className={styles.mobileToggle} 
              onClick={toggleMobileMenu} 
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={22} />
            </button>

            {/* Store Branding */}
            <div className={styles.brand}>
              <div className={styles.logo}>
                {storeData.logo_url ? (
                  <img src={storeData.logo_url} alt={`${storeData.name} logo`} />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    {storeData.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                )}
                <div className={styles.onlineIndicator} aria-label="Store online"></div>
              </div>
              <div className={styles.brandText}>
                <h1>{storeData.name}</h1>
                <p>{storeData.tagline || "Premium Quality Store"}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className={styles.desktopNav} role="navigation" aria-label="Store navigation">
              <Link href={`/shop/${finalSellerPhone}`} className={styles.navLink}>
                <Home size={16} />
                <span>Home</span>
              </Link>
              <Link href={`/cart/${finalSellerPhone}`} className={styles.navLink}>
                <ShoppingCart size={16} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className={styles.navBadge}>{cartCount}</span>
                )}
              </Link>
              <Link href={`/shop/${finalSellerPhone}/about`} className={styles.navLink}>
                <Info size={16} />
                <span>About</span>
              </Link>
              <Link 
                href="/profile" 
                className={styles.navLink}
                onClick={handleProfileClick}
              >
                <User size={16} />
                <span>Profile</span>
              </Link>
            </nav>

            {/* Header Actions */}
            <div className={styles.actions}>
              {/* Desktop Search */}
              <form 
                className={`${styles.searchDesktop} ${isSearchFocused ? styles.focused : ''}`} 
                onSubmit={handleSearchSubmit}
                ref={searchDesktopRef}
              >
                <div className={styles.searchInput}>
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    aria-label="Search products"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      className={styles.clearSearch} 
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <CloseIcon size={14} />
                    </button>
                  )}
                </div>
              </form>

              {/* Mobile Search Toggle */}
              <button 
                className={`${styles.searchMobile} ${showMobileSearch ? styles.active : ''}`}
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                aria-label="Search"
                aria-expanded={showMobileSearch}
              >
                <Search size={20} />
              </button>

              {/* Cart Button for Desktop */}
              <Link 
                href={`/cart/${finalSellerPhone}`} 
                className={`${styles.cartBtn} ${styles.desktop}`}
                aria-label={`Cart with ${cartCount} items`}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className={styles.badge}>{cartCount}</span>
                )}
              </Link>

              {isLoggedIn ? (
                <Link 
                  href="/profile" 
                  className={`${styles.actionBtn} ${styles.profileBtn}`} 
                  aria-label="Profile"
                  onClick={handleProfileClick}
                >
                  <User size={18} />
                </Link>
              ) : (
                <Link href="/login/buyer" className={styles.loginBtn}>
                  <User size={16} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className={`${styles.mobileSearch} ${showMobileSearch ? styles.active : ''}`}>
          <div className={styles.container}>
            <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
              <button type="button" onClick={closeMobileSearch} aria-label="Close search">
                <CloseIcon size={20} />
              </button>
              <div className={styles.searchInput}>
                <Search size={16} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className={styles.clearSearch} 
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <CloseIcon size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Promotional Banner */}
        {storeData.announcement && showPromo && (
          <div className={styles.promoBanner}>
            <div className={styles.promoContent}>
              <Zap size={14} />
              <span>{storeData.announcement}</span>
            </div>
            <button 
              onClick={() => setShowPromo(false)} 
              aria-label="Close announcement"
              className={styles.promoClose}
            >
              <CloseIcon size={16} />
            </button>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.active : ''}`}>
        <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)} />
        <nav className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ''}`} role="navigation" aria-label="Mobile menu">
          <div className={styles.menuHeader}>
            <div className={styles.menuBrand}>
              {storeData.logo_url ? (
                <img src={storeData.logo_url} alt={`${storeData.name} logo`} />
              ) : (
                <div className={styles.menuLogoPlaceholder}>
                  {storeData.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
              )}
              <div>
                <span className={styles.menuBrandName}>{storeData.name}</span>
                <span className={styles.menuBrandTagline}>Premium Store</span>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
              <CloseIcon size={22} />
            </button>
          </div>
          
          <div className={styles.menuItems}>
            <Link href={`/shop/${finalSellerPhone}`} onClick={() => setIsMobileMenuOpen(false)}>
              <span>
                <Home size={20} />
                <span>Home</span>
              </span>
            </Link>
            
            <Link href={`/cart/${finalSellerPhone}`} onClick={() => setIsMobileMenuOpen(false)}>
              <span>
                <ShoppingCart size={20} />
                <span>Cart</span>
              </span>
              {cartCount > 0 && (
                <span className={styles.menuBadge}>{cartCount}</span>
              )}
            </Link>
            
            <Link href={`/shop/${finalSellerPhone}/about`} onClick={() => setIsMobileMenuOpen(false)}>
              <span>
                <Info size={20} />
                <span>About</span>
              </span>
            </Link>
            
            <Link 
              href="/profile" 
              onClick={(e) => {
                handleProfileClick(e);
                setIsMobileMenuOpen(false);
              }}
            >
              <span>
                <User size={20} />
                <span>Profile</span>
              </span>
            </Link>
            
            {!isLoggedIn && (
              <Link href="/login/buyer" className={styles.menuLogin} onClick={() => setIsMobileMenuOpen(false)}>
                <span>
                  <User size={20} />
                  <span>Sign In</span>
                </span>
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Enhanced Bottom Navigation */}
      <BottomNav store={storeData} sellerPhone={finalSellerPhone} />
    </>
  );
}