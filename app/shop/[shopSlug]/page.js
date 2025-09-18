'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import SHeader from '../../../components/common/SHeader';
import Footer from '../../../components/common/Footer';
// ✅ Import the new ShopProductCard component
import ShopProductCard from '../../../components/common/ShopProductCard';
import { 
  ShoppingCart, 
  User, 
  Phone,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Share2,
  Filter,
  Grid,
  List,
  Star,
  Menu,
  X,
  MessageCircle,
  Bell,
  Heart,
  Clock,
  Truck,
  Shield,
  Award,
  Users,
  Package,
  TrendingUp,
  ChevronRight,
  Eye,
  Bookmark,
  RefreshCw,
  ChevronDown,
  Check,
  AlertCircle
} from 'lucide-react';

// ✅ Helper function to get API base URL with environment variable handling
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  return 'https://keralaseller-backend.onrender.com';
};

// ✅ FIXED: Helper function to extract phone from slug or query params with null safety
const getSellerPhoneFromSlug = (shopSlug, searchParams) => {
  console.log('🔍 Extracting phone from:', { shopSlug, searchParams: searchParams?.toString() });
  
  // ✅ Add null/undefined checks
  if (!shopSlug || !searchParams) {
    console.log('❌ Missing shopSlug or searchParams');
    return null;
  }
  
  // Try to get phone from query params first (for SEO URLs)
  const phoneFromParams = searchParams.get('id');
  console.log('📱 Phone from params:', phoneFromParams);
  
  if (phoneFromParams) {
    // ✅ More flexible validation for development
    if (process.env.NODE_ENV === 'development') {
      // Allow any numeric string with 3+ digits for testing
      if (/^\d{3,}$/.test(phoneFromParams)) {
        console.log('✅ Valid phone found (dev mode):', phoneFromParams);
        return phoneFromParams;
      }
    } else {
      // ✅ Production: strict Indian mobile validation
      if (/^[6-9]\d{9}$/.test(phoneFromParams)) {
        console.log('✅ Valid Indian mobile number:', phoneFromParams);
        return phoneFromParams;
      }
    }
  }
  
  // Fallback: try to extract phone from slug if it's a direct phone URL
  if (typeof shopSlug === 'string') {
    if (process.env.NODE_ENV === 'development' && /^\d{3,}$/.test(shopSlug)) {
      console.log('✅ Phone extracted from slug (dev):', shopSlug);
      return shopSlug;
    }
    if (/^[6-9]\d{9}$/.test(shopSlug)) {
      console.log('✅ Phone extracted from slug:', shopSlug);
      return shopSlug;
    }
  }
  
  // Extract phone from compound slug (e.g., "raj-electronics-kochi-9544344339")
  if (typeof shopSlug === 'string') {
    const phoneMatch = shopSlug.match(/[6-9]\d{9}$/);
    if (phoneMatch) {
      console.log('✅ Phone extracted from compound slug:', phoneMatch[0]);
      return phoneMatch[0];
    }
  }
  
  console.log('❌ No valid phone number found');
  return null;
};

// ✅ SEO Helper: Generate structured data for the shop
const generateShopStructuredData = (store, products, shopSlug) => {
  if (!store) return null;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": store.name,
    "description": store.description || `Shop ${store.name} in Kerala - Browse quality products from a trusted local seller`,
    "url": `https://keralasellers.in/shop/${shopSlug}`,
    "telephone": store.phone || store.seller_phone,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Kerala",
      "addressCountry": "IN",
      "streetAddress": store.address || store.seller_address
    },
    "aggregateRating": store.average_rating ? {
      "@type": "AggregateRating",
      "ratingValue": store.average_rating,
      "ratingCount": store.review_count || 1
    } : null,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Products",
      "itemListElement": products.slice(0, 10).map(product => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": product.name,
          "price": product.price,
          "priceCurrency": "INR",
          "availability": product.online_stock > 0 ? "InStock" : "OutOfStock"
        }
      }))
    }
  };
  
  return JSON.stringify(structuredData);
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ✅ Enhanced SEO Head Component
function ShopSEOHead({ store, products, shopSlug, sellerPhone }) {
  useEffect(() => {
    if (!store) return;
    
    // Update page title
    const pageTitle = `${store.name} - Shop in Kerala | Kerala Sellers`;
    document.title = pageTitle;
    
    // Update meta description
    const metaDescription = store.description ? 
      `${store.description.substring(0, 150)}... Shop from ${store.name} in Kerala. ${products.length} products available.` :
      `Shop from ${store.name} in Kerala. Browse ${products.length} quality products from a trusted local seller on Kerala Sellers.`;
    
    // Update or create meta tags
    const updateOrCreateMeta = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateOrCreateMeta('description', metaDescription);
    updateOrCreateMeta('og:title', pageTitle);
    updateOrCreateMeta('og:description', metaDescription);
    updateOrCreateMeta('og:url', `https://keralasellers.in/shop/${shopSlug}`);
    updateOrCreateMeta('og:type', 'website');
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', pageTitle);
    updateOrCreateMeta('twitter:description', metaDescription);
    
    // Add structured data
    const structuredData = generateShopStructuredData(store, products, shopSlug);
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = structuredData;
    }
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://keralasellers.in/shop/${shopSlug}`);
    
  }, [store, products, shopSlug]);
  
  return null; // This component only updates head tags
}

// Enhanced Store Banner Component
function EnhancedStoreBanner({ store, shopSlug }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!store) return null;

  const getBannerImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/media/')) {
      return `${getApiBaseUrl()}${url}`;
    }
    return url;
  };

  return (
    <div className="enhanced-banner-container" style={styles.bannerContainer}>
      <div className="banner-background" style={styles.bannerBackground}>
        {store.banner_image_url ? (
          <img
            src={getBannerImageUrl(store.banner_image_url)}
            alt={`${store.name || 'Store'} - Kerala local business banner`}
            className={`banner-image ${imageLoaded ? 'loaded' : ''}`}
            style={styles.bannerImage}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            onError={(e) => {
              console.warn('Banner image failed to load');
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="banner-fallback" style={styles.bannerFallback}>
            <div className="fallback-pattern" style={styles.fallbackPattern}></div>
          </div>
        )}
        <div className="banner-overlay" style={styles.bannerOverlay}></div>
      </div>
      <div className="store-status" style={styles.storeStatus}>
        <div className="status-indicator online" style={styles.statusIndicator}></div>
        <span>Online Now</span>
      </div>
      
      {/* ✅ Enhanced breadcrumbs for SEO */}
      <div className="breadcrumbs" style={styles.breadcrumbs}>
        <Link href="/" style={styles.breadcrumbLink}>Kerala Sellers</Link>
        <span className="breadcrumb-separator" style={styles.breadcrumbSeparator}>›</span>
        <Link href="/shop" style={styles.breadcrumbLink}>Shops</Link>
        <span className="breadcrumb-separator" style={styles.breadcrumbSeparator}>›</span>
        <span className="current-page" style={styles.currentPage}>{store.name}</span>
      </div>
    </div>
  );
}

// Enhanced Store Info Section
function EnhancedStoreInfoSection({ store, shopSlug, products }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!store) return null;

  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/media/')) {
      return `${getApiBaseUrl()}${url}`;
    }
    return url;
  };

  // ✅ Enhanced location extraction
  const getLocationInfo = () => {
    const address = store.address || store.seller_address || '';
    if (!address) return 'Kerala, India';
    
    // Extract city/district from address
    const locationParts = address.split(',');
    const city = locationParts[locationParts.length - 2]?.trim() || 
                 locationParts[locationParts.length - 1]?.trim() ||
                 'Kerala';
    
    return city.includes('Kerala') ? city : `${city}, Kerala`;
  };

  return (
    <div className="enhanced-store-info-section" style={styles.storeInfoSection}>
      <div className="container" style={styles.container}>
        <div className="store-header" style={styles.storeHeader}>
          <div className="store-identity" style={styles.storeIdentity}>
            <div className="store-logo-wrapper" style={styles.storeLogoWrapper}>
              {store.logo_url ? (
                <img
                  src={getLogoUrl(store.logo_url)}
                  alt={`${store.name || 'Store'} logo - Kerala local business`}
                  className="store-logo-enhanced"
                  style={styles.storeLogo}
                  loading="lazy"
                  onError={(e) => {
                    console.warn('Store logo failed to load');
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="store-logo-placeholder-enhanced" style={styles.storeLogoPlaceholder}>
                  {(store.name || 'Store').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="verified-badge" style={styles.verifiedBadge}>
                <Shield size={12} aria-hidden="true" />
              </div>
            </div>
            <div className="store-details-enhanced" style={styles.storeDetails}>
              <div className="store-name-section" style={styles.storeNameSection}>
                <h1 className="store-name-enhanced" style={styles.storeName}>{store.name || 'Store'}</h1>
                <div className="store-badges" style={styles.storeBadges}>
                  <span className="badge verified" style={styles.badgeVerified}>
                    <Award size={10} aria-hidden="true" />
                    Verified Kerala Seller
                  </span>
                  <span className="badge responsive" style={styles.badgeResponsive}>
                    <Clock size={10} aria-hidden="true" />
                    Fast Response
                  </span>
                </div>
              </div>
              {store.tagline && (
                <p className="store-tagline-enhanced" style={styles.storeTagline}>{store.tagline}</p>
              )}
              <div className="store-meta" style={styles.storeMeta}>
                <div className="meta-item location-priority" style={styles.metaItemLocation}>
                  <MapPin size={12} aria-hidden="true" />
                  <span>{getLocationInfo()}</span>
                </div>
                <div className="meta-item" style={styles.metaItem}>
                  <Users size={12} aria-hidden="true" />
                  <span>Trusted by customers</span>
                </div>
                <div className="meta-item" style={styles.metaItem}>
                  <Package size={12} aria-hidden="true" />
                  {/* ✅ Fixed: Use actual products count */}
                  <span>{products?.length || 0} products available</span>
                </div>
              </div>
            </div>
          </div>
          <div className="store-actions" style={styles.storeActions}>
            <button className="action-button primary" style={styles.actionButtonPrimary} aria-label="Chat with store">
              <MessageCircle size={16} aria-hidden="true" />
              <span className="action-text">Chat</span>
            </button>
            <button className="action-button secondary" style={styles.actionButtonSecondary} aria-label="Call store">
              <Phone size={16} aria-hidden="true" />
              <span className="action-text">Call</span>
            </button>
            <button className="action-button icon-only" style={styles.actionButtonIcon} aria-label="Share store">
              <Share2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <div className="store-performance" style={styles.storePerformance}>
          <div className="performance-card" style={styles.performanceCard}>
            <div className="performance-icon" style={styles.performanceIcon}>
              <Star size={18} fill="currentColor" aria-hidden="true" />
            </div>
            <div className="performance-content" style={styles.performanceContent}>
              <span className="performance-number" style={styles.performanceNumber}>
                {store.average_rating?.toFixed(1) || '4.8'}
              </span>
              <span className="performance-label" style={styles.performanceLabel}>Rating</span>
            </div>
          </div>
          <div className="performance-card" style={styles.performanceCard}>
            <div className="performance-icon" style={styles.performanceIcon}>
              <TrendingUp size={18} aria-hidden="true" />
            </div>
            <div className="performance-content" style={styles.performanceContent}>
              <span className="performance-number" style={styles.performanceNumber}>5.2k</span>
              <span className="performance-label" style={styles.performanceLabel}>Orders</span>
            </div>
          </div>
          <div className="performance-card" style={styles.performanceCard}>
            <div className="performance-icon" style={styles.performanceIcon}>
              <Truck size={18} aria-hidden="true" />
            </div>
            <div className="performance-content" style={styles.performanceContent}>
              <span className="performance-number" style={styles.performanceNumber}>24hr</span>
              <span className="performance-label" style={styles.performanceLabel}>Kerala Delivery</span>
            </div>
          </div>
          <div className="performance-card" style={styles.performanceCard}>
            <div className="performance-icon" style={styles.performanceIcon}>
              <Users size={18} aria-hidden="true" />
            </div>
            <div className="performance-content" style={styles.performanceContent}>
              <span className="performance-number" style={styles.performanceNumber}>98%</span>
              <span className="performance-label" style={styles.performanceLabel}>Satisfied</span>
            </div>
          </div>
        </div>
        
        {store.description && (
          <div className="store-description-card" style={styles.storeDescriptionCard}>
            <h3>About {store.name} - Local Kerala Business</h3>
            <p 
              className={showFullDescription ? 'expanded' : 'collapsed'}
              id="store-description"
              style={showFullDescription ? styles.descriptionExpanded : styles.descriptionCollapsed}
            >
              {store.description}
            </p>
            {store.description.length > 150 && (
              <button
                className="expand-button"
                style={styles.expandButton}
                onClick={() => setShowFullDescription(!showFullDescription)}
                aria-expanded={showFullDescription}
                aria-controls="store-description"
              >
                {showFullDescription ? 'Show less' : 'Read more'}
                <ChevronRight size={12} className={showFullDescription ? 'rotated' : ''} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced Filter Component
function EnhancedFilterSection({ products, onFilterChange, activeFilters }) {
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState(activeFilters || {
    priceRange: null,
    stockStatus: [],
    sortBy: 'name-asc'
  });
  const filterRef = useRef(null);

  const priceRanges = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
    { label: 'Above ₹5000', min: 5000, max: 999999 }
  ];

  const stockStatus = [
    { label: 'In Stock', value: 'in-stock' },
    { label: 'Low Stock', value: 'low-stock' },
    { label: 'Out of Stock', value: 'out-of-stock' }
  ];

  const sortOptions = [
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A to Z', value: 'name-asc' },
    { label: 'Name: Z to A', value: 'name-desc' }
  ];

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const clearFilters = {
      priceRange: null,
      stockStatus: [],
      sortBy: 'name-asc'
    };
    setTempFilters(clearFilters);
    onFilterChange(clearFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters?.priceRange) count++;
    if (activeFilters?.stockStatus?.length > 0) count += activeFilters.stockStatus.length;
    if (activeFilters?.sortBy && activeFilters.sortBy !== 'name-asc') count++;
    return count;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeFilters) {
      setTempFilters(activeFilters);
    }
  }, [activeFilters]);

  return (
    <div className="enhanced-filter-section" style={styles.filterSection} ref={filterRef}>
      <div className="container" style={styles.container}>
        <div className="filter-header" style={styles.filterHeader}>
          <button
            className="filter-toggle-button"
            style={styles.filterToggleButton}
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <Filter size={18} aria-hidden="true" />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="filter-count" style={styles.filterCount}>{getActiveFilterCount()}</span>
            )}
            <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
          </button>
          {getActiveFilterCount() > 0 && (
            <button
              className="clear-filters-button"
              style={styles.clearFiltersButton}
              onClick={handleClearFilters}
              aria-label="Clear all filters"
            >
              <X size={14} aria-hidden="true" />
              Clear All
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filter-panel" style={styles.filterPanel} id="filter-panel">
            <div className="filter-group" style={styles.filterGroup}>
              <h4>Sort By</h4>
              <div className="filter-options" style={styles.filterOptions}>
                {sortOptions.map((option) => (
                  <label key={option.value} className="filter-option" style={styles.filterOption}>
                    <input
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={tempFilters.sortBy === option.value}
                      onChange={(e) => setTempFilters({ ...tempFilters, sortBy: e.target.value })}
                      aria-label={option.label}
                    />
                    <span className="checkmark" style={styles.checkmark}></span>
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group" style={styles.filterGroup}>
              <h4>Price Range</h4>
              <div className="filter-options" style={styles.filterOptions}>
                {priceRanges.map((range, index) => (
                  <label key={index} className="filter-option" style={styles.filterOption}>
                    <input
                      type="radio"
                      name="priceRange"
                      checked={
                        tempFilters.priceRange &&
                        tempFilters.priceRange.min === range.min &&
                        tempFilters.priceRange.max === range.max
                      }
                      onChange={() => setTempFilters({ ...tempFilters, priceRange: range })}
                      aria-label={range.label}
                    />
                    <span className="checkmark" style={styles.checkmark}></span>
                    {range.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-actions" style={styles.filterActions}>
              <button
                className="apply-filters-button"
                style={styles.applyFiltersButton}
                onClick={handleApplyFilters}
                aria-label="Apply filters"
              >
                <Check size={16} aria-hidden="true" />
                Apply Filters
              </button>
              <button
                className="cancel-filters-button"
                style={styles.cancelFiltersButton}
                onClick={() => setShowFilters(false)}
                aria-label="Cancel filter changes"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ MAIN COMPONENT - Updated for SEO URLs with new ShopProductCard
function EnhancedSellerStorefrontPage() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loadingProducts, setLoadingProducts] = useState({});
  const [filters, setFilters] = useState({
    priceRange: null,
    stockStatus: [],
    sortBy: 'name-asc'
  });

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { shopSlug } = params;
  
  // ✅ Extract seller phone from slug or query params with null safety
  const sellerPhone = getSellerPhoneFromSlug(shopSlug, searchParams);
  
  const cartContext = useCart();
  const { addToCart, cartItems } = cartContext || { addToCart: null, cartItems: [] };
  const abortControllerRef = useRef(null);

  // Check login status
  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken') || 
                   localStorage.getItem('access_token') ||
                   localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.warn('localStorage access error:', error);
      setIsLoggedIn(false);
    }
  }, []);

  // Apply filters to products
  const applyFilters = useCallback(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    if (filters?.priceRange) {
      filtered = filtered.filter((product) => {
        const price = product?.price || 0;
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    if (filters?.stockStatus?.length > 0) {
      filtered = filtered.filter((product) => {
        const stock = product?.online_stock || 0;
        const stockStatus = stock === 0 ? 'out-of-stock' : stock <= 5 ? 'low-stock' : 'in-stock';
        return filters.stockStatus.includes(stockStatus);
      });
    }

    filtered.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'price-asc':
          return (a?.price || 0) - (b?.price || 0);
        case 'price-desc':
          return (b?.price || 0) - (a?.price || 0);
        case 'name-asc':
          return (a?.name || '').localeCompare(b?.name || '');
        case 'name-desc':
          return (b?.name || '').localeCompare(a?.name || '');
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, filters]);

  // ✅ Enhanced fetch store data with better error handling
  useEffect(() => {
    if (!sellerPhone) {
      console.log('❌ No seller phone - showing error');
      setError('Invalid shop URL. Please check the link and try again.');
      setIsLoading(false);
      return;
    }

    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();
        
        console.log('🔍 Fetching shop data for phone:', sellerPhone);
        
        // ✅ Use /shop/ endpoint (matches your Django main URLs)
        const response = await axios.get(`${getApiBaseUrl()}/shop/${sellerPhone}/`, {
          signal: abortControllerRef.current.signal,
          timeout: 15000,
        });

        console.log('✅ Shop API response:', response.data);

        if (response.data) {
          setStore(response.data.store || null);
          setProducts(response.data.products || []);
          console.log('✅ Shop data loaded successfully');
        } else {
          throw new Error('No data received from server');
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        
        console.error('❌ Shop data fetch failed:', error);
        
        if (error.response?.status === 404) {
          setError('Shop not found. This shop may have been moved or is temporarily unavailable.');
        } else if (error.response?.status >= 500) {
          setError('Server error. Please try again in a few moments.');
        } else if (error.code === 'ECONNABORTED') {
          setError('Request timed out. Please check your connection and try again.');
        } else {
          setError(error.response?.data?.error || error.message || 'Failed to load shop. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [sellerPhone]);

  // Apply filters when products or filters change
  useEffect(() => {
    applyFilters();
  }, [products, filters, applyFilters]);

  // ✅ Enhanced add to cart handler
  const handleAddToCart = useCallback(async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product?.id || (product.online_stock || 0) <= 0) {
      alert(product?.id ? 'Product is out of stock' : 'Invalid product');
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('buyerAccessToken') || 
                 localStorage.getItem('access_token') ||
                 localStorage.getItem('accessToken');
    
    if (!token) {
      // Redirect to login with return URL
      router.push(`/login/buyer?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!addToCart) {
      alert('Cart service unavailable. Please refresh the page.');
      return;
    }

    const productId = product.id;
    
    try {
      setLoadingProducts(prev => ({ ...prev, [productId]: true }));
      await Promise.resolve(addToCart(sellerPhone, product));
      console.log('✅ Successfully added to cart:', product.name);
    } catch (error) {
      console.error('❌ Add to cart failed:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setLoadingProducts(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  }, [addToCart, sellerPhone, router]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters || {
      priceRange: null,
      stockStatus: [],
      sortBy: 'name-asc'
    });
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="enhanced-loading-container" style={styles.loadingContainer}>
        <div className="loading-spinner-enhanced" style={styles.loadingSpinner}></div>
        <h3>Loading Kerala shop...</h3>
        <p>Please wait while we fetch the latest products from this local seller</p>
      </div>
    );
  }

  // Error state
  if (error || !store) {
    return (
      <div className="enhanced-error-container" style={styles.errorContainer}>
        <div className="error-icon">
          <Package size={48} aria-hidden="true" />
        </div>
        <h2>Shop Not Found</h2>
        <p>{error || 'This Kerala shop could not be found.'}</p>
        <div className="error-actions" style={styles.errorActions}>
          <Link href="/shop" className="back-button-enhanced" style={styles.backButton}>
            Browse All Shops
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button-enhanced"
            style={styles.retryButton}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="enhanced-page-container" style={styles.pageContainer}>
        {/* ✅ SEO Head component */}
        <ShopSEOHead 
          store={store} 
          products={products} 
          shopSlug={shopSlug} 
          sellerPhone={sellerPhone} 
        />
        
        <SHeader store={store} isLoggedIn={isLoggedIn} />
        <EnhancedStoreBanner store={store} shopSlug={shopSlug} />
        <EnhancedStoreInfoSection store={store} shopSlug={shopSlug} products={products} />
        <EnhancedFilterSection
          products={products || []}
          onFilterChange={handleFilterChange}
          activeFilters={filters}
        />
        
        <div className="container" style={styles.container}>
          <div className="products-header-enhanced" style={styles.productsHeader}>
            <div className="products-title-enhanced" style={styles.productsTitle}>
              <h2 className="products-main-title-enhanced" style={styles.productsMainTitle}>
                Products from {store.name}
              </h2>
              <span className="product-count-enhanced" style={styles.productCount}>
                {filteredProducts.length} of {products.length} products available
              </span>
            </div>
            <div className="products-controls-enhanced" style={styles.productsControls}>
              <div className="view-toggle-group" style={styles.viewToggleGroup}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-toggle-enhanced ${viewMode === 'grid' ? 'active' : ''}`}
                  style={viewMode === 'grid' ? styles.viewToggleActive : styles.viewToggle}
                  aria-label="Grid view"
                >
                  <Grid size={16} aria-hidden="true" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-toggle-enhanced ${viewMode === 'list' ? 'active' : ''}`}
                  style={viewMode === 'list' ? styles.viewToggleActive : styles.viewToggle}
                  aria-label="List view"
                >
                  <List size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className={`products-container-enhanced ${viewMode}`} style={styles.productsContainer}>
              {filteredProducts.map((product) => {
                if (!product?.id) return null;
                return (
                  // ✅ Use the new ShopProductCard component
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    store={store}
                    shopSlug={shopSlug}
                    sellerPhone={sellerPhone}
                    onAddToCart={handleAddToCart}
                    isLoading={loadingProducts[product.id] || false}
                    cartItems={cartItems || []}
                    showStoreName={false} // Don't show store name since we're in the store
                  />
                );
              }).filter(Boolean)}
            </div>
          ) : (
            <div className="enhanced-empty-state" style={styles.emptyState}>
              <div className="empty-icon">
                <Filter size={64} aria-hidden="true" />
              </div>
              <h3>No products found</h3>
              <p>No products match the selected filters. Try adjusting your filter criteria or browse all products from this Kerala seller.</p>
              <button
                onClick={() => {
                  const defaultFilters = { priceRange: null, stockStatus: [], sortBy: 'name-asc' };
                  setFilters(defaultFilters);
                }}
                className="clear-filters-button-enhanced"
                style={styles.clearFiltersButtonEnhanced}
                aria-label="Clear all filters"
              >
                <X size={16} aria-hidden="true" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
        
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

// ✅ Main Export with Suspense Boundary
function ShopPageWithSuspense() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3>Loading Kerala shop...</h3>
        <p>Please wait while we fetch the latest products from this local seller</p>
      </div>
    }>
      <EnhancedSellerStorefrontPage />
    </Suspense>
  );
}

export default ShopPageWithSuspense;

// ✅ Enhanced styles object
const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px'
  },

  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px',
    textAlign: 'center',
    padding: '40px 20px'
  },

  errorActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },

  backButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500'
  },

  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500'
  },
  
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  
  // Banner Styles
  bannerContainer: {
    position: 'relative',
    height: '300px',
    overflow: 'hidden'
  },

  bannerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  bannerFallback: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
  },

  fallbackPattern: {
    width: '100%',
    height: '100%',
    opacity: 0.1,
    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
    backgroundSize: '20px 20px'
  },

  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)'
  },

  storeStatus: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },

  statusIndicator: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%'
  },

  breadcrumbs: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  },

  breadcrumbLink: {
    color: 'white',
    textDecoration: 'none',
    opacity: 0.8
  },

  breadcrumbSeparator: {
    color: 'white',
    opacity: 0.6
  },

  currentPage: {
    color: 'white',
    fontWeight: '500'
  },
  
  // Store Info Styles
  storeInfoSection: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '32px 0',
    marginBottom: '32px'
  },
  
  storeHeader: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  
  storeIdentity: {
    display: 'flex',
    gap: '20px',
    flex: 1,
    minWidth: '300px'
  },
  
  storeLogoWrapper: {
    position: 'relative',
    flexShrink: 0
  },
  
  storeLogo: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #f1f5f9',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },

  storeLogoPlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '700',
    border: '4px solid #f1f5f9',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  
  verifiedBadge: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    width: '24px',
    height: '24px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white'
  },
  
  storeDetails: {
    flex: 1,
    minWidth: '250px'
  },
  
  storeNameSection: {
    marginBottom: '12px'
  },
  
  storeName: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
    lineHeight: '1.2'
  },
  
  storeBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  
  badgeVerified: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #10b981',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#065f46',
    fontWeight: '500'
  },

  badgeResponsive: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#eff6ff',
    border: '1px solid #3b82f6',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#1e40af',
    fontWeight: '500'
  },
  
  storeTagline: {
    fontSize: '1.1rem',
    color: '#3b82f6',
    fontWeight: '500',
    margin: '0 0 16px 0'
  },
  
  storeMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#4b5563'
  },

  metaItemLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#059669',
    fontWeight: '600'
  },
  
  storeActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  actionButtonPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },

  actionButtonSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },

  actionButtonIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: 'white',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  
  // Store Performance
  storePerformance: {
    display: 'flex',
    gap: '32px',
    padding: '20px 0',
    borderTop: '1px solid #f3f4f6',
    flexWrap: 'wrap'
  },
  
  performanceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  performanceIcon: {
    color: '#3b82f6'
  },
  
  performanceContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  performanceNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  
  performanceLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  storeDescriptionCard: {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },

  descriptionExpanded: {
    margin: '12px 0'
  },

  descriptionCollapsed: {
    margin: '12px 0',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  expandButton: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  
  // Filter Section
  filterSection: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 0'
  },

  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  filterToggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },

  filterCount: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '12px',
    fontWeight: '500'
  },

  clearFiltersButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#374151'
  },

  filterPanel: {
    marginTop: '16px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },

  filterGroup: {
    marginBottom: '20px'
  },

  filterOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px'
  },

  filterOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },

  checkmark: {
    width: '16px',
    height: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '3px'
  },

  filterActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },

  applyFiltersButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },

  cancelFiltersButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  
  // Products Section
  productsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  
  productsTitle: {
    flex: 1
  },
  
  productsMainTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },
  
  productCount: {
    fontSize: '0.9rem',
    color: '#6b7280'
  },
  
  productsControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  viewToggleGroup: {
    display: 'flex',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  
  viewToggle: {
    padding: '8px',
    backgroundColor: 'white',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280'
  },

  viewToggleActive: {
    padding: '8px',
    backgroundColor: '#3b82f6',
    border: 'none',
    cursor: 'pointer',
    color: 'white'
  },
  
  productsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    color: '#6b7280'
  },
  
  clearFiltersButtonEnhanced: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  }
};
