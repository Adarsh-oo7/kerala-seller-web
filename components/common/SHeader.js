"use client"

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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

// Bottom Navigation Component with Shop-Aware Navigation
function BottomNav({ store, shopSlug, actualStoreId }) {
  const [show, setShow] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const { carts } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  // ✅ FIXED: Use actualStoreId for cart and navigation
  const storePhone = actualStoreId || shopSlug || store?.seller_phone;

  // Store cart count for this specific store
  const storeCartCount = storePhone ? (carts[storePhone] || []).reduce((count, item) => count + item.quantity, 0) : 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // No need to call setShow here — it will update on scroll
    // setShow(window.scrollY > 100); <-- remove this line

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  // ✅ UPDATED: Active index tracking with query parameters
  useEffect(() => {
    if (storePhone) {
      const basePath = actualStoreId ? `/shop/new` : `/shop/${storePhone}`;

      if (pathname === basePath) setActiveIndex(0);
      else if (pathname.includes(`${basePath}/cart`)) setActiveIndex(1);
      else if (pathname.includes(`${basePath}/about`)) setActiveIndex(2);
      else if (pathname.includes(`${basePath}/profile`)) setActiveIndex(3);
      else setActiveIndex(0);
    }
  }, [pathname, storePhone, actualStoreId]);

  // ✅ FIXED: Navigation handler that preserves query parameters
  const handleNavigation = (targetPath, index, e) => {
    e.preventDefault();
    setActiveIndex(index);

    let finalUrl = targetPath;

    // Add query parameter for 'new' shopSlug pattern
    if (actualStoreId && shopSlug === 'new') {
      const separator = targetPath.includes('?') ? '&' : '?';
      finalUrl = `${targetPath}${separator}id=${actualStoreId}`;
    }

    console.log('🔄 Bottom nav navigating to:', finalUrl);
    router.push(finalUrl);
  };

  if (!storePhone) {
    return null;
  }

  // ✅ UPDATED: Navigation items with proper URL generation
  const getNavUrl = (path) => {
    if (actualStoreId && shopSlug === 'new') {
      return `/shop/new${path}`;
    }
    return `/shop/${storePhone}${path}`;
  };

  const navItems = [
    {
      href: getNavUrl(''),
      icon: Home,
      label: "Home",
      color: "#64ff45ff"
    },
    {
      href: getNavUrl('/cart'),
      icon: ShoppingCart,
      label: "Cart",
      color: "#64ff45ff",
      badge: storeCartCount
    },
    {
      href: getNavUrl('/about'),
      icon: Info,
      label: "About",
      color: "#64ff45ff"
    },
    {
      href: getNavUrl('/profile'),
      icon: User,
      label: "Profile",
      color: "#64ff45ff"
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
        // background: `linear-gradient(135deg, ${navItems[activeIndex]?.color || '#a5d691ff'}, ${navItems[activeIndex]?.color || '#a5d691ff'}90)`
      }}></div>

      {navItems.map((item, index) => {
        const IconComponent = item.icon;
        const isActive = activeIndex === index;

        return (
          <button
            key={item.href}
            className={`${styles.bottomNavItem} ${isActive ? styles.active : ""}`}
            onClick={(e) => handleNavigation(item.href, index, e)}
            aria-label={`${item.label}${item.badge ? ` with ${item.badge} items` : ""}`}
          >
            <div className={styles.navIcon} style={{
              color: isActive ? item.color : '#ffffffff'
            }}>
              <IconComponent
                className={`${styles.BottomNavIconSize} ${isActive ? styles.activeIcon : ''}`}
              />
              {item.badge && item.badge > 0 && (
                <span className={styles.cartBadge}>{item.badge}</span>
              )}
            </div>
            <span
              className={styles.navLabel}
              style={{
                color: isActive ? item.color : '#ffffffff',
                transform: isActive ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default function SHeader({ store, isLoggedIn = false, shopSlug }) {
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
  const searchParams = useSearchParams(); // ✅ ADDED: Get search parameters

  // ✅ CRITICAL FIX: Extract actual store ID from query parameters
  const actualStoreId = searchParams.get('id'); // Get the ?id= parameter
  const finalShopSlug = shopSlug || params?.shopSlug || store?.seller_phone;

  // ✅ ENHANCED: Better store identification
  const effectiveStoreId = actualStoreId || (finalShopSlug !== 'new' ? finalShopSlug : null);

  console.log('🔍 SHeader Debug:');
  console.log('- shopSlug prop:', shopSlug);
  console.log('- params?.shopSlug:', params?.shopSlug);
  console.log('- searchParams id:', actualStoreId);
  console.log('- effectiveStoreId:', effectiveStoreId);
  console.log('- store?.seller_phone:', store?.seller_phone);

  // Get cart count for this specific store
  const cartCount = effectiveStoreId ? (carts[effectiveStoreId] || []).reduce((count, item) => count + item.quantity, 0) : 0;

  // ✅ FIXED: URL generation helper that preserves query parameters
  const generateShopUrl = (path = '') => {
    if (actualStoreId && finalShopSlug === 'new') {
      // Use the /shop/new pattern with ?id= parameter
      const basePath = `/shop/new${path}`;
      return path ? `${basePath}?id=${actualStoreId}` : `${basePath}?id=${actualStoreId}`;
    } else if (effectiveStoreId) {
      // Use the direct /shop/[storeId] pattern
      return `/shop/${effectiveStoreId}${path}`;
    }
    return `/shop/${finalShopSlug}${path}`;
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setHeaderScrolled(currentScrollY > 20);

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
    if (!isMobileMenuOpen) {
      setShowMobileSearch(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchUrl = generateShopUrl(`?search=${encodeURIComponent(searchQuery.trim())}`);
      router.push(searchUrl);
      setShowMobileSearch(false);
    }
  };

  const closeMobileSearch = () => {
    setShowMobileSearch(false);
    setSearchQuery('');
  };

  // ✅ FIXED: Navigation handlers with query parameter preservation
  const handleProfileClick = (e) => {
    e.preventDefault();
    const profileUrl = generateShopUrl('/profile');
    console.log('🔄 Profile click navigating to:', profileUrl);
    router.push(profileUrl);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    const cartUrl = generateShopUrl('/cart');
    console.log('🔄 Cart click navigating to:', cartUrl);
    router.push(cartUrl);
  };

  const handlePhoneClick = (e) => {
    e.preventDefault();
    console.log('Phone number:', effectiveStoreId);
  };

  if (!effectiveStoreId) {
    console.warn('⚠️ SHeader: No effective store ID found');
    // Still render but with limited functionality
    return (
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fef2f2', color: '#dc2626' }}>
        <p>Store information not available. Please check the URL.</p>
        <p style={{ fontSize: '12px' }}>
          shopSlug: {finalShopSlug} | id param: {actualStoreId}
        </p>
      </div>
    );
  }

  const storeData = store || {
    name: `Store ${effectiveStoreId}`,
    seller_phone: effectiveStoreId,
    tagline: 'Quality Products'
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
                <span>{effectiveStoreId}</span>
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
              <div className={styles.storeStatus}>
                <div className={styles.statusIndicator}></div>
                <span>Online Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className={styles.mainHeader}>
          <div className={styles.container}>
            <button
              className={styles.mobileToggle}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={22} />
            </button>

            {/* ✅ UPDATED: Store Branding with proper URL generation */}
            <Link href={generateShopUrl('/about')} className={styles.brand}>
              <div className={styles.logo}>
                {storeData.logo_url ? (
                  <img src={storeData.logo_url} alt={`${storeData.name} logo`} />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    {storeData.name?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                )}
                {/* <div className={styles.onlineIndicator} aria-label="Store online"></div> */}
              </div>
              <div className={styles.brandText}>
                <h1>{storeData.name}</h1>
                <p>{storeData.tagline || "Premium Quality Store"}</p>
              </div>
            </Link>

            {/* ✅ UPDATED: Desktop Navigation with proper URL generation */}
            <nav className={styles.desktopNav} role="navigation" aria-label="Store navigation">
              <Link href={generateShopUrl()} className={styles.navLink}>
                <Home className={styles.iconsize} />
                <span>Home</span>
              </Link>
              <button onClick={handleCartClick} className={styles.navLink}>
                <ShoppingCart className={styles.iconsize} />
                <span className={styles.cartText}>
                  Cart
                  {cartCount > 0 && (
                    <span className={styles.navBadge}>{cartCount}</span>
                  )}
                </span>
              </button>

              {/* <Link href={generateShopUrl('/about')} className={styles.navLink}>
                <Info size={16} />
                <span>About</span>
              </Link> */}
              <button onClick={handleProfileClick} className={styles.navLink}>
                <User className={styles.iconsize} />
                <span>Profile</span>
              </button>
            </nav>

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

      {/* ✅ UPDATED: Mobile Menu with proper URL generation */}
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
            <Link href={generateShopUrl()} onClick={() => setIsMobileMenuOpen(false)}>
              <span>
                <Home size={20} />
                <span>Home</span>
              </span>
            </Link>

            <button onClick={() => {
              handleCartClick({ preventDefault: () => { } });
              setIsMobileMenuOpen(false);
            }} className={styles.menuButton}>
              <span>
                <ShoppingCart size={20} />
                <span>Cart</span>
              </span>
              {cartCount > 0 && (
                <span className={styles.menuBadge}>{cartCount}</span>
              )}
            </button>

            <Link href={generateShopUrl('/about')} onClick={() => setIsMobileMenuOpen(false)}>
              <span>
                <Info size={20} />
                <span>About</span>
              </span>
            </Link>

            <button onClick={() => {
              handleProfileClick({ preventDefault: () => { } });
              setIsMobileMenuOpen(false);
            }} className={styles.menuButton}>
              <span>
                <User size={20} />
                <span>Profile</span>
              </span>
            </button>

            {!isLoggedIn && (
              <Link href={generateShopUrl('/login')} className={styles.menuLogin} onClick={() => setIsMobileMenuOpen(false)}>
                <span>
                  <User size={20} />
                  <span>Sign In</span>
                </span>
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* ✅ UPDATED: Bottom Navigation with proper parameters */}
      <BottomNav
        store={storeData}
        shopSlug={finalShopSlug}
        actualStoreId={actualStoreId}
      />
    </>
  );
}
