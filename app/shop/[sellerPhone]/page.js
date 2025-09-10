'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import SHeader from '../../../components/common/SHeader';
import Footer from '../../../components/common/Footer';
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
  Check
} from 'lucide-react';

import './EnhancedSellerStorefrontPage.css';

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

// Enhanced Store Banner Component
function EnhancedStoreBanner({ store }) {
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
    <div className="enhanced-banner-container">
      <div className="banner-background">
        {store.banner_image_url ? (
          <img
            src={getBannerImageUrl(store.banner_image_url)}
            alt={`${store.name || 'Store'} banner`}
            className={`banner-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            onError={(e) => {
              console.warn('Banner image failed to load');
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="banner-fallback">
            <div className="fallback-pattern"></div>
          </div>
        )}
        <div className="banner-overlay"></div>
      </div>
      <div className="store-status">
        <div className="status-indicator online"></div>
        <span>Online Now</span>
      </div>
    </div>
  );
}

// Enhanced Store Info Section
function EnhancedStoreInfoSection({ store }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!store) return null;

  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/media/')) {
      return `${getApiBaseUrl()}${url}`;
    }
    return url;
  };

  return (
    <div className="enhanced-store-info-section">
      <div className="container">
        <div className="store-header">
          <div className="store-identity">
            <div className="store-logo-wrapper">
              {store.logo_url ? (
                <img
                  src={getLogoUrl(store.logo_url)}
                  alt={`${store.name || 'Store'} logo`}
                  className="store-logo-enhanced"
                  loading="lazy"
                  onError={(e) => {
                    console.warn('Store logo failed to load');
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="store-logo-placeholder-enhanced">
                  {(store.name || 'Store').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="verified-badge">
                <Shield size={12} aria-hidden="true" />
              </div>
            </div>
            <div className="store-details-enhanced">
              <div className="store-name-section">
                <h1 className="store-name-enhanced">{store.name || 'Store'}</h1>
                <div className="store-badges">
                  <span className="badge verified">
                    <Award size={10} aria-hidden="true" />
                    Verified
                  </span>
                  <span className="badge responsive">
                    <Clock size={10} aria-hidden="true" />
                    Fast Response
                  </span>
                </div>
              </div>
              {store.tagline && (
                <p className="store-tagline-enhanced">{store.tagline}</p>
              )}
              <div className="store-meta">
                <div className="meta-item">
                  <MapPin size={12} aria-hidden="true" />
                  <span>Kerala, India</span>
                </div>
                <div className="meta-item">
                  <Users size={12} aria-hidden="true" />
                  <span>2.3k followers</span>
                </div>
                <div className="meta-item">
                  <Package size={12} aria-hidden="true" />
                  <span>{store.products?.length || 0} products</span>
                </div>
              </div>
            </div>
          </div>
          <div className="store-actions">
            <button className="action-button primary" aria-label="Chat with store">
              <MessageCircle size={16} aria-hidden="true" />
              <span className="action-text">Chat</span>
            </button>
            <button className="action-button secondary" aria-label="Call store">
              <Phone size={16} aria-hidden="true" />
              <span className="action-text">Call</span>
            </button>
            <button className="action-button icon-only" aria-label="Share store">
              <Share2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <div className="store-performance">
          <div className="performance-card">
            <div className="performance-icon">
              <Star size={18} fill="currentColor" aria-hidden="true" />
            </div>
            <div className="performance-content">
              <span className="performance-number">4.8</span>
              <span className="performance-label">Rating</span>
            </div>
          </div>
          <div className="performance-card">
            <div className="performance-icon">
              <TrendingUp size={18} aria-hidden="true" />
            </div>
            <div className="performance-content">
              <span className="performance-number">5.2k</span>
              <span className="performance-label">Orders</span>
            </div>
          </div>
          <div className="performance-card">
            <div className="performance-icon">
              <Truck size={18} aria-hidden="true" />
            </div>
            <div className="performance-content">
              <span className="performance-number">24hr</span>
              <span className="performance-label">Delivery</span>
            </div>
          </div>
          <div className="performance-card">
            <div className="performance-icon">
              <Users size={18} aria-hidden="true" />
            </div>
            <div className="performance-content">
              <span className="performance-number">98%</span>
              <span className="performance-label">Satisfied</span>
            </div>
          </div>
        </div>
        
        {store.description && (
          <div className="store-description-card">
            <h3>About Our Store</h3>
            <p 
              className={showFullDescription ? 'expanded' : 'collapsed'}
              id="store-description"
            >
              {store.description}
            </p>
            {store.description.length > 150 && (
              <button
                className="expand-button"
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
    <div className="enhanced-filter-section" ref={filterRef}>
      <div className="container">
        <div className="filter-header">
          <button
            className="filter-toggle-button"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <Filter size={18} aria-hidden="true" />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="filter-count">{getActiveFilterCount()}</span>
            )}
            <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
          </button>
          {getActiveFilterCount() > 0 && (
            <button
              className="clear-filters-button"
              onClick={handleClearFilters}
              aria-label="Clear all filters"
            >
              <X size={14} aria-hidden="true" />
              Clear All
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filter-panel" id="filter-panel">
            <div className="filter-group">
              <h4>Sort By</h4>
              <div className="filter-options">
                {sortOptions.map((option) => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={tempFilters.sortBy === option.value}
                      onChange={(e) => setTempFilters({ ...tempFilters, sortBy: e.target.value })}
                      aria-label={option.label}
                    />
                    <span className="checkmark"></span>
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="filter-options">
                {priceRanges.map((range, index) => (
                  <label key={index} className="filter-option">
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
                    <span className="checkmark"></span>
                    {range.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Stock Status</h4>
              <div className="filter-options">
                {stockStatus.map((status) => (
                  <label key={status.value} className="filter-option">
                    <input
                      type="checkbox"
                      checked={tempFilters.stockStatus?.includes(status.value) || false}
                      onChange={(e) => {
                        const currentStockStatus = tempFilters.stockStatus || [];
                        const newStockStatus = e.target.checked
                          ? [...currentStockStatus, status.value]
                          : currentStockStatus.filter((s) => s !== status.value);
                        setTempFilters({ ...tempFilters, stockStatus: newStockStatus });
                      }}
                      aria-label={status.label}
                    />
                    <span className="checkmark"></span>
                    {status.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button
                className="apply-filters-button"
                onClick={handleApplyFilters}
                aria-label="Apply filters"
              >
                <Check size={16} aria-hidden="true" />
                Apply Filters
              </button>
              <button
                className="cancel-filters-button"
                onClick={() => setShowFilters(false)}
                aria-label="Cancel filter changes"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {getActiveFilterCount() > 0 && (
          <div className="active-filters">
            <span className="active-filters-label">Active filters:</span>
            <div className="active-filter-tags">
              {activeFilters?.priceRange && (
                <span className="active-filter-tag">
                  {activeFilters.priceRange.label}
                  <button
                    onClick={() => onFilterChange({ ...activeFilters, priceRange: null })}
                    aria-label={`Remove ${activeFilters.priceRange.label} filter`}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}
              {activeFilters?.stockStatus?.map((status) => (
                <span key={status} className="active-filter-tag">
                  {stockStatus.find((s) => s.value === status)?.label || status}
                  <button
                    onClick={() => onFilterChange({
                      ...activeFilters,
                      stockStatus: activeFilters.stockStatus.filter((s) => s !== status)
                    })}
                    aria-label={`Remove ${status} filter`}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card Component
function EnhancedProductCard({ product, onAddToCart, isLoading = false, sellerPhone, storeId, cartItems }) {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  const isInCart = cartItems?.some(item => 
    item.product_id === product.id && item.seller_phone === sellerPhone
  ) || false;

  const getCartQuantity = () => {
    const cartItem = cartItems?.find(item => 
      item.product_id === product.id && item.seller_phone === sellerPhone
    );
    return cartItem?.quantity || 0;
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (product.mrp && product.mrp > product.price && product.price) {
      return Math.round(((product.mrp - product.price) / product.mrp) * 100);
    }
    return 0;
  };

  const getStockStatus = () => {
    const stock = product.online_stock || 0;
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
  };

  const getProductUrl = () => {
    if (!sellerPhone || !product.id) return '#';
    return `/shop/${sellerPhone}/product/${product.id}`;
  };

  const getImageUrl = (product) => {
    if (!product) return 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image';
    
    const imageUrl = product.main_image_url || product.image_url;
    
    if (imageUrl && imageUrl.startsWith('/media/')) {
      return `${getApiBaseUrl()}${imageUrl}`;
    }
    
    return imageUrl || 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image';
  };

  return (
    <div className={`enhanced-product-card ${getStockStatus()}`}>
      <Link 
        href={getProductUrl()} 
        className="product-link-enhanced" 
        aria-label={`View ${product.name || 'product'}`}
      >
        <div className="product-image-wrapper">
          <img
            src={imageError ? 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image' : getImageUrl(product)}
            alt={product.name || 'Product image'}
            className="product-image-enhanced"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <div className="product-badges">
            {getDiscountPercentage() > 0 && (
              <span className="badge discount">{getDiscountPercentage()}% OFF</span>
            )}
            {(product.online_stock || 0) <= 5 && (product.online_stock || 0) > 0 && (
              <span className="badge low-stock">Only {product.online_stock} left</span>
            )}
            {(product.online_stock || 0) === 0 && (
              <span className="badge out-of-stock">Out of Stock</span>
            )}
          </div>
          <div className="quick-actions">
            <button
              className={`quick-action-btn ${isWishlisted ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <div className="product-info-enhanced">
          <div className="product-header">
            <h3 className="product-name-enhanced">{product.name || 'Unnamed Product'}</h3>
            {product.model_name && (
              <p className="product-model-enhanced">{product.model_name}</p>
            )}
          </div>
          <div className="product-pricing-enhanced">
            <div className="price-section">
              <span className="current-price-enhanced">{formatPrice(product.price)}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="original-price-enhanced">{formatPrice(product.mrp)}</span>
              )}
            </div>
            {getDiscountPercentage() > 0 && (
              <div className="savings-info">
                Save {formatPrice((product.mrp || 0) - (product.price || 0))}
              </div>
            )}
          </div>
          <div className="stock-info">
            {(product.online_stock || 0) > 0 ? (
              <span className="stock-available">✓ In Stock</span>
            ) : (
              <span className="stock-unavailable">✗ Out of Stock</span>
            )}
          </div>
        </div>
      </Link>
      
      <div className="product-actions">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onAddToCart) {
              onAddToCart(e, product);
            }
          }}
          className={`add-to-cart-enhanced ${(product.online_stock || 0) === 0 ? 'disabled' : ''} ${isLoading ? 'loading' : ''} ${isInCart ? 'in-cart' : ''}`}
          disabled={(product.online_stock || 0) === 0 || isLoading}
          aria-label={(product.online_stock || 0) > 0 ? 
            (isInCart ? `Add more ${product.name || 'product'} to cart (${getCartQuantity()} in cart)` : `Add ${product.name || 'product'} to cart`) : 
            'Out of stock'}
        >
          {isLoading ? (
            <>
              <RefreshCw size={16} className="spinning" aria-hidden="true" />
              <span>Adding...</span>
            </>
          ) : (product.online_stock || 0) === 0 ? (
            <>
              <X size={16} aria-hidden="true" />
              <span>Out of Stock</span>
            </>
          ) : isInCart ? (
            <>
              <ShoppingCart size={16} fill="currentColor" aria-hidden="true" />
              <span>Add More ({getCartQuantity()})</span>
            </>
          ) : (
            <>
              <ShoppingCart size={16} aria-hidden="true" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Main Component
export default function EnhancedSellerStorefrontPage() {
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
  const { sellerPhone } = params;
  const cartContext = useCart();
  const { addToCart, cartItems } = cartContext || { addToCart: null, cartItems: [] };
  const abortControllerRef = useRef(null);

  // Check login status
  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken');
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

  // Fetch store data
  useEffect(() => {
    if (!sellerPhone) {
      setError('Invalid seller phone number');
      setIsLoading(false);
      return;
    }

    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();
        
        const response = await axios.get(`${getApiBaseUrl()}/shop/${sellerPhone}/`, {
          signal: abortControllerRef.current.signal,
          timeout: 10000,
        });

        if (response.data) {
          setStore(response.data.store || null);
          setProducts(response.data.products || []);
        } else {
          throw new Error('No data received from server');
        }
      } catch (error) {
        if (axios.isCancel(error)) return;
        
        if (error.response?.status === 404) {
          setError('Store not found. Please check the URL and try again.');
        } else if (error.response?.status >= 500) {
          setError('Server error. Please try again in a few moments.');
        } else {
          setError(error.response?.data?.error || error.message || 'Store not found');
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

  // Add to cart handler
  const handleAddToCart = useCallback(async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product?.id || (product.online_stock || 0) <= 0) {
      alert(product?.id ? 'Product is out of stock' : 'Invalid product');
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
      console.log('Successfully added to cart:', product.name);
    } catch (error) {
      console.error('Add to cart failed:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setLoadingProducts(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  }, [addToCart, sellerPhone]);

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
      <div className="enhanced-loading-container">
        <div className="loading-spinner-enhanced"></div>
        <h3>Loading store...</h3>
        <p>Please wait while we fetch the latest products</p>
      </div>
    );
  }

  // Error state
  if (error || !store) {
    return (
      <div className="enhanced-error-container">
        <div className="error-icon">
          <Package size={48} aria-hidden="true" />
        </div>
        <h2>Store Not Found</h2>
        <p>{error || 'This store could not be found.'}</p>
        <Link href="/" className="back-button-enhanced">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="enhanced-page-container">
        <SHeader store={store} isLoggedIn={isLoggedIn} />
        <EnhancedStoreBanner store={store} />
        <EnhancedStoreInfoSection store={store} />
        <EnhancedFilterSection
          products={products || []}
          onFilterChange={handleFilterChange}
          activeFilters={filters}
        />
        
        <div className="container">
          <div className="products-header-enhanced">
            <div className="products-title-enhanced">
              <h2 className="products-main-title-enhanced">Our Products</h2>
              <span className="product-count-enhanced">
                {filteredProducts.length} of {products.length} products
              </span>
            </div>
            <div className="products-controls-enhanced">
              <div className="view-toggle-group">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-toggle-enhanced ${viewMode === 'grid' ? 'active' : ''}`}
                  aria-label="Grid view"
                >
                  <Grid size={16} aria-hidden="true" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-toggle-enhanced ${viewMode === 'list' ? 'active' : ''}`}
                  aria-label="List view"
                >
                  <List size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className={`products-container-enhanced ${viewMode}`}>
              {filteredProducts.map((product) => {
                if (!product?.id) return null;
                return (
                  <EnhancedProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    isLoading={loadingProducts[product.id] || false}
                    sellerPhone={sellerPhone}
                    storeId={store?.id}
                    cartItems={cartItems || []}
                  />
                );
              }).filter(Boolean)}
            </div>
          ) : (
            <div className="enhanced-empty-state">
              <div className="empty-icon">
                <Filter size={64} aria-hidden="true" />
              </div>
              <h3>No products found</h3>
              <p>No products match the selected filters. Try adjusting your filter criteria.</p>
              <button
                onClick={() => {
                  const defaultFilters = { priceRange: null, stockStatus: [], sortBy: 'name-asc' };
                  setFilters(defaultFilters);
                }}
                className="clear-filters-button-enhanced"
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
