'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import "../../../styles/Shopslugpage.css";
import { useCart } from '../../context/CartContext';
import SHeader from '../../../components/common/SHeader';
import Whatsapp from '../../../components/common/Whatsapp'
import ShopFooter from '../../../components/common/ShopFooter';
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
import { toast } from "react-toastify";


// ✅ Helper function to get API base URL
// const getApiBaseUrl = () => {
//   const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
//   if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
//     return envUrl.trim();
//   }
//   if (process.env.NODE_ENV === 'development') {
//     return 'https://api.keralasellers.in';
//   }
//   return 'https://api.keralasellers.in';
// };

// const API_BASE_URL = 'https://api.keralasellers.in';
// const WISHLIST_API = `${API_BASE_URL}/api/wishlist/`;
// const WISHLIST_TOGGLE_API = `${API_BASE_URL}/api/wishlist/toggle_product/`;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in/api';

const WISHLIST_API = `${API_BASE_URL}/api/wishlist/`;
const WISHLIST_TOGGLE_API = `${API_BASE_URL}/api/wishlist/toggle_product/`;

console.log('❤️ Wishlist:', API_BASE_URL);




const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') ||
    localStorage.getItem('buyerAccessToken') ||
    localStorage.getItem('buyerToken') ||
    localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : null;
};

const getSellerPhoneFromSlug = (shopSlug, searchParams) => {
  if (!shopSlug || !searchParams) return null;

  const phoneFromParams = searchParams.get('id');
  if (phoneFromParams) {
    if (process.env.NODE_ENV === 'development') {
      if (/^\d{3,}$/.test(phoneFromParams)) return phoneFromParams;
    } else {
      if (/^[6-9]\d{9}$/.test(phoneFromParams)) return phoneFromParams;
    }
  }

  if (typeof shopSlug === 'string') {
    if (process.env.NODE_ENV === 'development' && /^\d{3,}$/.test(shopSlug)) {
      return shopSlug;
    }
    if (/^[6-9]\d{9}$/.test(shopSlug)) {
      return shopSlug;
    }
    const phoneMatch = shopSlug.match(/[6-9]\d{9}$/);
    if (phoneMatch) return phoneMatch[0];
  }
  return null;
};

// ✅ SEO Helper
const generateShopStructuredData = (store, products, shopSlug) => {
  if (!store) return null;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": store.name,
    "description": store.description || `Shop ${store.name} in Kerala`,
    "url": `https://keralasellers.in/shop/${shopSlug}`,
    "telephone": store.phone || store.seller_phone,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Kerala",
      "addressCountry": "IN",
      "streetAddress": store.address || store.seller_address
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

// ✅ SEO Head Component
function ShopSEOHead({ store, products, shopSlug, sellerPhone }) {
  useEffect(() => {
    if (!store) return;
    const pageTitle = `${store.name} - Shop in Kerala | Kerala Sellers`;
    document.title = pageTitle;
    const metaDescription = store.description ?
      `${store.description.substring(0, 150)}... Shop from ${store.name} in Kerala.` :
      `Shop from ${store.name} in Kerala. Browse ${products.length} quality products.`;

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
  }, [store, products, shopSlug]);
  return null;
}

// ✅ AUTO-SLIDER Banner Component
function EnhancedStoreBanner({ store, shopSlug }) {
  const [imageLoaded, setImageLoaded] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIntervalRef = useRef(null);

  if (!store) return null;

  const getBannerImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/media/')) {
     return `${API_BASE_URL}${url}`;  // Instead of hardcoded URL

    }
    return url;
  };

  const banners = [];

  if (store.banner_1_url) {
    banners.push({ id: 1, url: store.banner_1_url, label: 'Primary Banner' });
  }
  if (store.banner_2_url) {
    banners.push({ id: 2, url: store.banner_2_url, label: 'Secondary Banner' });
  }
  if (store.banner_3_url) {
    banners.push({ id: 3, url: store.banner_3_url, label: 'Tertiary Banner' });
  }

  if (banners.length === 0 && store.banner_image_url) {
    banners.push({ id: 'legacy', url: store.banner_image_url, label: 'Store Banner' });
  }

  useEffect(() => {
    if (banners.length <= 1) return;

    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 4000);
    }
  };

  if (banners.length === 0) {
    return (
      <div style={styles.mainWrapper}>
        <div className="enhanced-banner-container" style={styles.bannerContainer}>
          <div className="banner-background" style={styles.bannerBackground}>
            <div className="banner-fallback" style={styles.bannerFallback}>
              <div className="fallback-pattern" style={styles.fallbackPattern}></div>
            </div>
            <div className="banner-overlay" style={styles.bannerOverlay}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainWrapper}>
      <div className="banner-slider-container" style={styles.sliderContainer}>
        <div className="banner-slides-wrapper" style={styles.slidesWrapper}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="banner-slide"
              style={{
                ...styles.slide,
                transform: `translateX(${(index - currentSlide) * 100}%)`,
                opacity: index === currentSlide ? 1 : 0,
                transition: 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out'
              }}
            >
              <div className="enhanced-banner-container" style={styles.bannerContainer}>
                <div className="banner-background" style={styles.bannerBackground}>
                  <img
                    src={getBannerImageUrl(banner.url)}
                    alt={`${store.name || 'Store'} - ${banner.label}`}
                    className={`banner-image ${imageLoaded[banner.id] ? 'loaded' : ''}`}
                    style={styles.bannerImage}
                    onLoad={() => setImageLoaded(prev => ({ ...prev, [banner.id]: true }))}
                    loading="lazy"
                    onError={(e) => {
                      console.warn(`Banner ${banner.id} failed to load`);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ✅ Enhanced Filter Component with Search
function EnhancedFilterSection({ products, onFilterChange, activeFilters }) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempFilters, setTempFilters] = useState(activeFilters || {
    priceRange: null,
    stockStatus: [],
    sortBy: 'name-asc',
    searchQuery: ''
  });
  const filterRef = useRef(null);

  const priceRanges = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
    { label: 'Above ₹5000', min: 5000, max: 999999 }
  ];

  const sortOptions = [
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A to Z', value: 'name-asc' },
    { label: 'Name: Z to A', value: 'name-desc' }
  ];

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const updatedFilters = {
      ...tempFilters,
      searchQuery: query
    };
    setTempFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const clearFilters = {
      priceRange: null,
      stockStatus: [],
      sortBy: 'name-asc',
      searchQuery: ''
    };
    setTempFilters(clearFilters);
    setSearchQuery('');
    onFilterChange(clearFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters?.priceRange) count++;
    if (activeFilters?.stockStatus?.length > 0) count += activeFilters.stockStatus.length;
    if (activeFilters?.sortBy && activeFilters.sortBy !== 'name-asc') count++;
    if (activeFilters?.searchQuery && activeFilters.searchQuery.trim() !== '') count++;
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
      setSearchQuery(activeFilters.searchQuery || '');
    }
  }, [activeFilters]);

  return (
    <div className="enhanced-filter-section" style={styles.filterSection} ref={filterRef}>
      <div className="shopshopslugfiltercontainer" style={styles.Filtercontainer}>
        <div className="filter-header" style={styles.filterHeader}>
          <div className="filter-search-row" style={styles.filterSearchRow}>

            <div className="search-right" style={styles.searchRight}>
              <input
                className='search-input'
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={styles.searchInput}
              />
            </div>

            <div className="filter-left" style={styles.filterLeft}>
              <button
                className="filter-toggle-button"
                style={styles.filterToggleButton}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className='filtericonsize' />
                <span>Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="filter-count" style={styles.filterCount}>{getActiveFilterCount()}</span>
                )}
                <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
              </button>

            </div>

          </div>
        </div>

        {showFilters && (
          <div
            style={styles.sidebarOverlay}
            onClick={() => setShowFilters(false)}
          ></div>
        )}

        <div
          className='shopshopslugsibebar'
          style={{
            ...styles.filterSidebar,
            transform: showFilters ? "translateX(0)" : "translateX(100%)",
          }}
        >
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              style={styles.sidebarCloseButton}
            >
              <X size={20} />
            </button>
          </div>
          <div style={styles.sidebarInnerBox}>
            <div className="filter-group" style={styles.filterGroup}>
              <h4>Sort By</h4>
              <div className="filter-options" style={styles.filterOptions}>
                {sortOptions.map((option) => (
                  <label key={option.value} className="shopslugfilter-option" style={styles.filterOption}>
                    <input
                      className="custom-radio"
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={tempFilters.sortBy === option.value}
                      onChange={(e) => setTempFilters({ ...tempFilters, sortBy: e.target.value })}
                    />
                    <span
                      className="checkmark"
                      style={{
                        ...styles.checkmark,
                        ...(tempFilters.sortBy === option.value ? styles.checkmarkActive : {})
                      }}
                    >✓</span>
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="filter-group" style={styles.filterGroup}>
              <h4>Price Range</h4>
              <div className="filter-options" style={styles.filterOptions}>
                {priceRanges.map((range, index) => (
                  <label key={index} className="shopslugfilter-option" style={styles.filterOption}>
                    <input
                      className="custom-radio"
                      type="radio"
                      name="priceRange"
                      checked={
                        tempFilters.priceRange &&
                        tempFilters.priceRange.min === range.min &&
                        tempFilters.priceRange.max === range.max
                      }
                      onChange={() => setTempFilters({ ...tempFilters, priceRange: range })}
                    />
                    <span
                      className="checkmark"
                      style={{
                        ...styles.checkmark,
                        ...(tempFilters.priceRange &&
                          tempFilters.priceRange.min === range.min &&
                          tempFilters.priceRange.max === range.max
                          ? styles.checkmarkActive
                          : {})
                      }}
                    >
                      ✓
                    </span>
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
              >
                <Check size={16} />
                Apply Filters
              </button>
              {getActiveFilterCount() > 0 && (
                <button
                  className="clear-filters-button"
                  style={styles.clearFiltersButton}
                  onClick={handleClearFilters}
                >
                  <X size={14} />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ✅ MAIN COMPONENT
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
    sortBy: 'name-asc',
    searchQuery: ''
  });
  const [wishlistProducts, setWishlistProducts] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { shopSlug } = params;
  const sellerPhone = getSellerPhoneFromSlug(shopSlug, searchParams);
  const cartContext = useCart();
  const { addToCart, cartItems } = cartContext || { addToCart: null, cartItems: [] };
  const abortControllerRef = useRef(null);

  // ✅ Fixed fetchWishlist with 401 handling
  const fetchWishlist = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setWishlistLoading(true);
      const response = await axios.get(WISHLIST_API, { headers, timeout: 10000 });
      let wishlistItems = [];
      if (Array.isArray(response.data)) {
        wishlistItems = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        wishlistItems = response.data.results;
      } else if (response.data && Array.isArray(response.data.items)) {
        wishlistItems = response.data.items;
      }
      const wishlistedProductIds = new Set();
      wishlistItems.forEach((item) => {
        let productId = null;
        if (item.product_id) {
          productId = item.product_id;
        } else if (item.product && typeof item.product === 'object' && item.product.id) {
          productId = item.product.id;
        } else if (item.product && typeof item.product === 'number') {
          productId = item.product;
        } else if (item.id && !item.product && !item.product_id) {
          productId = item.id;
        }
        if (productId) {
          const normalizedProductId = Number(productId);
          if (!isNaN(normalizedProductId)) {
            wishlistedProductIds.add(normalizedProductId);
          }
        }
      });
      setWishlistProducts(wishlistedProductIds);
    } catch (error) {
      // ✅ Handle 401 (unauthorized) silently
      if (error.response?.status === 401) {
        console.log('User not authenticated - wishlist not loaded');
        setWishlistProducts(new Set());
        return;
      }
      console.error('❌ Failed to fetch wishlist:', error.message || error);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  const handleWishlistUpdate = useCallback((productId, isWishlisted) => {
    setWishlistProducts(prev => {
      const newSet = new Set(prev);
      const normalizedProductId = Number(productId);
      if (isWishlisted) {
        newSet.add(normalizedProductId);
      } else {
        newSet.delete(normalizedProductId);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      setIsLoggedIn(false);
    }
  }, []);

  // ✅ Fixed applyFilters with proper type checking
  const applyFilters = useCallback(() => {
    if (!Array.isArray(products)) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // ✅ Apply search filter with proper type checking
    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const name = String(product?.name || '').toLowerCase();
        const description = String(product?.description || '').toLowerCase();
        const category = String(product?.category || '').toLowerCase();

        return name.includes(query) ||
          description.includes(query) ||
          category.includes(query);
      });
    }

    // ✅ Apply price range filter
    if (filters?.priceRange) {
      filtered = filtered.filter((product) => {
        const price = Number(product?.price) || 0;
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    // ✅ Apply stock status filter
    if (filters?.stockStatus?.length > 0) {
      filtered = filtered.filter((product) => {
        const stock = Number(product?.online_stock) || 0;
        const stockStatus = stock === 0 ? 'out-of-stock' : stock <= 5 ? 'low-stock' : 'in-stock';
        return filters.stockStatus.includes(stockStatus);
      });
    }

    // ✅ Apply sorting with safe type conversion
    filtered.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'price-asc':
          return (Number(a?.price) || 0) - (Number(b?.price) || 0);
        case 'price-desc':
          return (Number(b?.price) || 0) - (Number(a?.price) || 0);
        case 'name-asc':
          return String(a?.name || '').localeCompare(String(b?.name || ''));
        case 'name-desc':
          return String(b?.name || '').localeCompare(String(a?.name || ''));
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, filters]);

  useEffect(() => {
    if (!sellerPhone) {
      setError('Invalid shop URL. Please check the link and try again.');
      setIsLoading(false);
      return;
    }

    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        abortControllerRef.current = new AbortController();
const response = await axios.get(`${API_BASE_URL}/shop/${sellerPhone}/`, {
          signal: abortControllerRef.current.signal,
          timeout: 15000,
        });
        if (response.data) {
          setStore(response.data.store || null);
          const productsData = response.data.products || [];
          const normalizedProducts = productsData.map(product => ({
            ...product,
            id: Number(product.id)
          }));
          setProducts(normalizedProducts);
        } else {
          throw new Error('No data received from server');
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        if (error.response?.status === 404) {
          setError('Shop not found.');
        } else if (error.response?.status >= 500) {
          setError('Server error. Please try again.');
        } else {
          setError('Failed to load shop. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();

    // ✅ Only fetch wishlist if user is logged in
    const timeoutId = setTimeout(() => {
      const token = localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken');

      if (token) {
        fetchWishlist();
      } else {
        console.log('User not logged in - skipping wishlist fetch');
      }
    }, 1500);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      clearTimeout(timeoutId);
    };
  }, [sellerPhone, fetchWishlist]);

  useEffect(() => {
    applyFilters();
  }, [products, filters, applyFilters]);

  const handleAddToCart = useCallback(async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.id || (product.online_stock || 0) <= 0) {
      toast.warning(product?.id ? 'Product is out of stock' : 'Invalid product', {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      return;
    }
    const token = localStorage.getItem('buyerAccessToken') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('accessToken');
    if (!token) {
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
      toast.success("Added to cart", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
    } catch (error) {
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
      sortBy: 'name-asc',
      searchQuery: ''
    });
  }, []);

  if (isLoading) {
    return (
      <div className="enhanced-loading-container" style={styles.loadingContainer}>
        <div className="loading-spinner-enhanced" style={styles.loadingSpinner}></div>
        <h3>Loading Kerala shop...</h3>
        <p>Please wait while we fetch the latest products</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="enhanced-error-container" style={styles.errorContainer}>
        <div className="error-icon">
          <Package size={48} />
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
        <ShopSEOHead
          store={store}
          products={products}
          shopSlug={shopSlug}
          sellerPhone={sellerPhone}
        />
        <SHeader store={store} isLoggedIn={isLoggedIn} />
        <EnhancedStoreBanner store={store} shopSlug={shopSlug} />
        <EnhancedFilterSection
          products={products || []}
          onFilterChange={handleFilterChange}
          activeFilters={filters}
        />
        <div  style={styles.container}>
          <div className="products-header-enhanced" style={styles.productsHeader}>
            <div className="products-title-enhanced" style={styles.productsTitle}>
              <span className="product-text" style={styles.producttext}>
                All Products
              </span>
            </div>
            <div className="products-controls-enhanced" style={styles.productsControls}>
              <span className="product-count-enhanced" style={styles.productCount}>
                {filteredProducts.length} of {products.length} products available
              </span>
            </div>
          </div>
          {filteredProducts.length > 0 ? (
            <div className={`shopslugproducts-container ${viewMode}`} style={styles.productsContainer}>
              {filteredProducts.map((product) => {
                if (!product?.id) return null;
                const isInWishlist = wishlistProducts.has(product.id);
                return (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    store={store}
                    shopSlug={shopSlug}
                    sellerPhone={sellerPhone}
                    onAddToCart={handleAddToCart}
                    isLoading={loadingProducts[product.id] || false}
                    cartItems={cartItems || []}
                    showStoreName={false}
                    isWishlisted={isInWishlist}
                    onWishlistUpdate={handleWishlistUpdate}
                  />
                );
              }).filter(Boolean)}
            </div>
          ) : (
            <div className="enhanced-empty-state" style={styles.emptyState}>
              <div className="empty-icon">
                <Filter size={40} className="keralasellersemptyicon" />
              </div>
              <h3 className="keralasellersemptytext">No products found</h3>
              <p className="keralasellersemptysubtext">
                {filters.searchQuery ? `No products match "${filters.searchQuery}"` : 'No products match the selected filters.'}
              </p>
              <button
                onClick={() => {
                  const defaultFilters = { priceRange: null, stockStatus: [], sortBy: 'name-asc', searchQuery: '' };
                  setFilters(defaultFilters);
                }}
                className="clear-filters-button-enhanced"
                style={styles.clearFiltersButtonEnhanced}
              >
                <X size={16} />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
        <Whatsapp sellerPhone={sellerPhone} shopSlug={shopSlug} />
       <ShopFooter store={store} />

      </div>
    </ErrorBoundary>
  );
}

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
      </div>
    }>
      <EnhancedSellerStorefrontPage />
    </Suspense>
  );
}

export default ShopPageWithSuspense;

// ✅ ALL STYLES
const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#FDFFF0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  Filtercontainer: {
    flex: 1,
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '10px 70px',
    boxSizing: 'border-box',
    overflowX: 'hidden',
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
  mainWrapper: {
    paddingTop: '10px',
  },
  sliderContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    marginTop: '105px',
  },
  slidesWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '3 / 1',
  },
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
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
    objectFit: 'contain',
    display: 'block'
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
  },
  filterSection: {
    backgroundColor: '#FDFFF0',
    paddingBottom: "30px",
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  filterSearchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
  },
  filterLeft: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  searchRight: {
    marginRight: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid #1a4845',
    minWidth: '200px',
    maxWidth: '400px',
    background: '#FDFFF0',
    color: "#1a4845",
  },
  filterToggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    color: "white",
    backgroundColor: '#1a4845',
    border: '1px solid #1a4845',
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
    padding: '8px 16px',
    backgroundColor: '#f94b4bff',
    border: '1px solid #f94b4bff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#ffffffff'
  },
  filterSidebar: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100vh",
    width: "320px",
    background: "#FDFFF0",
    padding: "20px",
    overflowY: "auto",
    zIndex: 2000,
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "10px",
  },
  sidebarTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a4845",
    margin: 0,
  },
  sidebarCloseButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  sidebarOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    zIndex: 1500,
  },
  sidebarInnerBox: {
    border: "1px solid #1a4845",
    borderRadius: "10px",
    padding: "16px",
    background: "#FDFFF0",
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
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
    width: "18px",
    height: "18px",
    border: "2px solid #d1d5db",
    borderRadius: "4px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
    color: "transparent",
    transition: "0.2s ease",
    pointerEvents: "none"
  },
  checkmarkActive: {
    borderColor: "#175e54",
    color: "#175e54",
    background: "transparent"
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
    padding: '8px 16px',
    backgroundColor: '#175e54',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  },
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
  productCount: {
    fontSize: '0.9rem',
    color: '#6b7280'
  },
  producttext: {
    fontSize: '1.2rem',
    color: '#1a4845'
  },
  productsControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  productsContainer: {
    display: 'grid',
    gap: '12px',
    justifyContent: 'center',
    justifyItems: 'center',
    flexWrap: "wrap",
    width: '100%',
    margin: '0 auto',
    padding: '10px 0',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
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
    backgroundColor: '#1a4845',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
};
