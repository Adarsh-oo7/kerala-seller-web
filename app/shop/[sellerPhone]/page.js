// EnhancedSellerStorefrontPage.js - COMPLETE FIXED VERSION
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

// Assume styles are imported from an external CSS file
import './EnhancedSellerStorefrontPage.css';

// SIMPLIFIED Error Boundary - Only catches serious rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Only catch rendering errors, not operational errors
    if (error?.message?.includes('cart') || 
        error?.message?.includes('addToCart') ||
        error?.message?.includes('Cannot read properties') ||
        error?.message?.includes('fetch') ||
        error?.message?.includes('axios')) {
      return { hasError: false };
    }
    
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(
        'div',
        { 
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '2rem',
            textAlign: 'center'
          }
        },
        React.createElement('h2', null, 'Something went wrong'),
        React.createElement('p', null, 'Please try refreshing the page.'),
        React.createElement(
          'button',
          {
            onClick: () => window.location.reload(),
            style: {
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }
          },
          'Refresh Page'
        )
      );
    }
    return this.props.children;
  }
}

// Enhanced Store Banner Component
function EnhancedStoreBanner({ store }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!store) return null;

  return React.createElement(
    'div',
    { className: 'enhanced-banner-container' },
    React.createElement(
      'div',
      { className: 'banner-background' },
      store.banner_image_url
        ? React.createElement('img', {
            src: store.banner_image_url,
            alt: `${store.name || 'Store'} banner`,
            className: `banner-image ${imageLoaded ? 'loaded' : ''}`,
            onLoad: () => setImageLoaded(true),
            loading: 'lazy',
            onError: (e) => {
              console.warn('Banner image failed to load');
              e.target.style.display = 'none';
            }
          })
        : React.createElement(
            'div',
            { className: 'banner-fallback' },
            React.createElement('div', { className: 'fallback-pattern' })
          ),
      React.createElement('div', { className: 'banner-overlay' })
    ),
    React.createElement(
      'div',
      { className: 'store-status' },
      React.createElement('div', { className: 'status-indicator online' }),
      React.createElement('span', null, 'Online Now')
    )
  );
}

// Enhanced Store Info Section
function EnhancedStoreInfoSection({ store }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!store) return null;

  return React.createElement(
    'div',
    { className: 'enhanced-store-info-section' },
    React.createElement(
      'div',
      { className: 'container' },
      React.createElement(
        'div',
        { className: 'store-header' },
        React.createElement(
          'div',
          { className: 'store-identity' },
          React.createElement(
            'div',
            { className: 'store-logo-wrapper' },
            store.logo_url
              ? React.createElement('img', {
                  src: store.logo_url,
                  alt: `${store.name || 'Store'} logo`,
                  className: 'store-logo-enhanced',
                  loading: 'lazy',
                  onError: (e) => {
                    console.warn('Store logo failed to load');
                    e.target.style.display = 'none';
                  }
                })
              : React.createElement(
                  'div',
                  { className: 'store-logo-placeholder-enhanced' },
                  (store.name || 'Store').charAt(0).toUpperCase()
                ),
            React.createElement(
              'div',
              { className: 'verified-badge' },
              React.createElement(Shield, { size: 12, 'aria-hidden': true })
            )
          ),
          React.createElement(
            'div',
            { className: 'store-details-enhanced' },
            React.createElement(
              'div',
              { className: 'store-name-section' },
              React.createElement('h1', { className: 'store-name-enhanced' }, store.name || 'Store'),
              React.createElement(
                'div',
                { className: 'store-badges' },
                React.createElement(
                  'span',
                  { className: 'badge verified' },
                  React.createElement(Award, { size: 10, 'aria-hidden': true }),
                  'Verified'
                ),
                React.createElement(
                  'span',
                  { className: 'badge responsive' },
                  React.createElement(Clock, { size: 10, 'aria-hidden': true }),
                  'Fast Response'
                )
              )
            ),
            store.tagline &&
              React.createElement('p', { className: 'store-tagline-enhanced' }, store.tagline),
            React.createElement(
              'div',
              { className: 'store-meta' },
              React.createElement(
                'div',
                { className: 'meta-item' },
                React.createElement(MapPin, { size: 12, 'aria-hidden': true }),
                React.createElement('span', null, 'Kerala, India')
              ),
              React.createElement(
                'div',
                { className: 'meta-item' },
                React.createElement(Users, { size: 12, 'aria-hidden': true }),
                React.createElement('span', null, '2.3k followers')
              ),
              React.createElement(
                'div',
                { className: 'meta-item' },
                React.createElement(Package, { size: 12, 'aria-hidden': true }),
                React.createElement('span', null, `${store.products?.length || 0} products`)
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'store-actions' },
          React.createElement(
            'button',
            { className: 'action-button primary', 'aria-label': 'Chat with store' },
            React.createElement(MessageCircle, { size: 16, 'aria-hidden': true }),
            React.createElement('span', { className: 'action-text' }, 'Chat')
          ),
          React.createElement(
            'button',
            { className: 'action-button secondary', 'aria-label': 'Call store' },
            React.createElement(Phone, { size: 16, 'aria-hidden': true }),
            React.createElement('span', { className: 'action-text' }, 'Call')
          ),
          React.createElement(
            'button',
            { className: 'action-button icon-only', 'aria-label': 'Share store' },
            React.createElement(Share2, { size: 16, 'aria-hidden': true })
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'store-performance' },
        React.createElement(
          'div',
          { className: 'performance-card' },
          React.createElement(
            'div',
            { className: 'performance-icon' },
            React.createElement(Star, { size: 18, fill: 'currentColor', 'aria-hidden': true })
          ),
          React.createElement(
            'div',
            { className: 'performance-content' },
            React.createElement('span', { className: 'performance-number' }, '4.8'),
            React.createElement('span', { className: 'performance-label' }, 'Rating')
          )
        ),
        React.createElement(
          'div',
          { className: 'performance-card' },
          React.createElement(
            'div',
            { className: 'performance-icon' },
            React.createElement(TrendingUp, { size: 18, 'aria-hidden': true })
          ),
          React.createElement(
            'div',
            { className: 'performance-content' },
            React.createElement('span', { className: 'performance-number' }, '5.2k'),
            React.createElement('span', { className: 'performance-label' }, 'Orders')
          )
        ),
        React.createElement(
          'div',
          { className: 'performance-card' },
          React.createElement(
            'div',
            { className: 'performance-icon' },
            React.createElement(Truck, { size: 18, 'aria-hidden': true })
          ),
          React.createElement(
            'div',
            { className: 'performance-content' },
            React.createElement('span', { className: 'performance-number' }, '24hr'),
            React.createElement('span', { className: 'performance-label' }, 'Delivery')
          )
        ),
        React.createElement(
          'div',
          { className: 'performance-card' },
          React.createElement(
            'div',
            { className: 'performance-icon' },
            React.createElement(Users, { size: 18, 'aria-hidden': true })
          ),
          React.createElement(
            'div',
            { className: 'performance-content' },
            React.createElement('span', { className: 'performance-number' }, '98%'),
            React.createElement('span', { className: 'performance-label' }, 'Satisfied')
          )
        )
      ),
      store.description &&
        React.createElement(
          'div',
          { className: 'store-description-card' },
          React.createElement('h3', null, 'About Our Store'),
          React.createElement('p', { 
            className: showFullDescription ? 'expanded' : 'collapsed',
            id: 'store-description'
          }, store.description),
          store.description.length > 150 &&
            React.createElement(
              'button',
              {
                className: 'expand-button',
                onClick: () => setShowFullDescription(!showFullDescription),
                'aria-expanded': showFullDescription,
                'aria-controls': 'store-description'
              },
              showFullDescription ? 'Show less' : 'Read more',
              React.createElement(ChevronRight, { size: 12, className: showFullDescription ? 'rotated' : '' })
            )
        )
    )
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

  return React.createElement(
    'div',
    { className: 'enhanced-filter-section', ref: filterRef },
    React.createElement(
      'div',
      { className: 'container' },
      React.createElement(
        'div',
        { className: 'filter-header' },
        React.createElement(
          'button',
          {
            className: 'filter-toggle-button',
            onClick: () => setShowFilters(!showFilters),
            'aria-expanded': showFilters,
            'aria-controls': 'filter-panel'
          },
          React.createElement(Filter, { size: 18, 'aria-hidden': true }),
          React.createElement('span', null, 'Filters'),
          getActiveFilterCount() > 0 &&
            React.createElement('span', { className: 'filter-count' }, getActiveFilterCount()),
          React.createElement(ChevronDown, { size: 16, className: showFilters ? 'rotated' : '' })
        ),
        getActiveFilterCount() > 0 &&
          React.createElement(
            'button',
            {
              className: 'clear-filters-button',
              onClick: handleClearFilters,
              'aria-label': 'Clear all filters'
            },
            React.createElement(X, { size: 14, 'aria-hidden': true }),
            'Clear All'
          )
      ),
      showFilters &&
        React.createElement(
          'div',
          { className: 'filter-panel', id: 'filter-panel' },
          React.createElement(
            'div',
            { className: 'filter-group' },
            React.createElement('h4', null, 'Sort By'),
            React.createElement(
              'div',
              { className: 'filter-options' },
              sortOptions.map((option) =>
                React.createElement(
                  'label',
                  { key: option.value, className: 'filter-option' },
                  React.createElement('input', {
                    type: 'radio',
                    name: 'sortBy',
                    value: option.value,
                    checked: tempFilters.sortBy === option.value,
                    onChange: (e) => setTempFilters({ ...tempFilters, sortBy: e.target.value }),
                    'aria-label': option.label
                  }),
                  React.createElement('span', { className: 'checkmark' }),
                  option.label
                )
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'filter-group' },
            React.createElement('h4', null, 'Price Range'),
            React.createElement(
              'div',
              { className: 'filter-options' },
              priceRanges.map((range, index) =>
                React.createElement(
                  'label',
                  { key: index, className: 'filter-option' },
                  React.createElement('input', {
                    type: 'radio',
                    name: 'priceRange',
                    checked:
                      tempFilters.priceRange &&
                      tempFilters.priceRange.min === range.min &&
                      tempFilters.priceRange.max === range.max,
                    onChange: () => setTempFilters({ ...tempFilters, priceRange: range }),
                    'aria-label': range.label
                  }),
                  React.createElement('span', { className: 'checkmark' }),
                  range.label
                )
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'filter-group' },
            React.createElement('h4', null, 'Stock Status'),
            React.createElement(
              'div',
              { className: 'filter-options' },
              stockStatus.map((status) =>
                React.createElement(
                  'label',
                  { key: status.value, className: 'filter-option' },
                  React.createElement('input', {
                    type: 'checkbox',
                    checked: tempFilters.stockStatus?.includes(status.value) || false,
                    onChange: (e) => {
                      const currentStockStatus = tempFilters.stockStatus || [];
                      const newStockStatus = e.target.checked
                        ? [...currentStockStatus, status.value]
                        : currentStockStatus.filter((s) => s !== status.value);
                      setTempFilters({ ...tempFilters, stockStatus: newStockStatus });
                    },
                    'aria-label': status.label
                  }),
                  React.createElement('span', { className: 'checkmark' }),
                  status.label
                )
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'filter-actions' },
            React.createElement(
              'button',
              {
                className: 'apply-filters-button',
                onClick: handleApplyFilters,
                'aria-label': 'Apply filters'
              },
              React.createElement(Check, { size: 16, 'aria-hidden': true }),
              'Apply Filters'
            ),
            React.createElement(
              'button',
              {
                className: 'cancel-filters-button',
                onClick: () => setShowFilters(false),
                'aria-label': 'Cancel filter changes'
              },
              'Cancel'
            )
          )
        ),
      getActiveFilterCount() > 0 &&
        React.createElement(
          'div',
          { className: 'active-filters' },
          React.createElement('span', { className: 'active-filters-label' }, 'Active filters:'),
          React.createElement(
            'div',
            { className: 'active-filter-tags' },
            activeFilters?.priceRange &&
              React.createElement(
                'span',
                { className: 'active-filter-tag' },
                activeFilters.priceRange.label,
                React.createElement(
                  'button',
                  {
                    onClick: () => onFilterChange({ ...activeFilters, priceRange: null }),
                    'aria-label': `Remove ${activeFilters.priceRange.label} filter`
                  },
                  React.createElement(X, { size: 12, 'aria-hidden': true })
                )
              ),
            activeFilters?.stockStatus?.map((status) =>
              React.createElement(
                'span',
                { key: status, className: 'active-filter-tag' },
                stockStatus.find((s) => s.value === status)?.label || status,
                React.createElement(
                  'button',
                  {
                    onClick: () => onFilterChange({
                      ...activeFilters,
                      stockStatus: activeFilters.stockStatus.filter((s) => s !== status)
                    }),
                    'aria-label': `Remove ${status} filter`
                  },
                  React.createElement(X, { size: 12, 'aria-hidden': true })
                )
              )
            )
          )
        )
    )
  );
}

// SIMPLIFIED Product Card Component
function EnhancedProductCard({ product, onAddToCart, isLoading = false, sellerPhone, storeId, cartItems }) {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  // Check if product is already in cart
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

  return React.createElement(
    'div',
    { className: `enhanced-product-card ${getStockStatus()}` },
    React.createElement(
      Link,
      { 
        href: getProductUrl(), 
        className: 'product-link-enhanced', 
        'aria-label': `View ${product.name || 'product'}`
      },
      React.createElement(
        'div',
        { className: 'product-image-wrapper' },
        React.createElement('img', {
          src: imageError
            ? 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image'
            : product.main_image_url || product.image_url || 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image',
          alt: product.name || 'Product image',
          className: 'product-image-enhanced',
          loading: 'lazy',
          onError: () => setImageError(true)
        }),
        React.createElement(
          'div',
          { className: 'product-badges' },
          getDiscountPercentage() > 0 &&
            React.createElement('span', { className: 'badge discount' }, `${getDiscountPercentage()}% OFF`),
          (product.online_stock || 0) <= 5 &&
            (product.online_stock || 0) > 0 &&
            React.createElement('span', { className: 'badge low-stock' }, `Only ${product.online_stock} left`),
          (product.online_stock || 0) === 0 &&
            React.createElement('span', { className: 'badge out-of-stock' }, 'Out of Stock')
        ),
        React.createElement(
          'div',
          { className: 'quick-actions' },
          React.createElement(
            'button',
            {
              className: `quick-action-btn ${isWishlisted ? 'active' : ''}`,
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              },
              'aria-label': isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
            },
            React.createElement(Heart, { size: 14, fill: isWishlisted ? 'currentColor' : 'none', 'aria-hidden': true })
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'product-info-enhanced' },
        React.createElement(
          'div',
          { className: 'product-header' },
          React.createElement('h3', { className: 'product-name-enhanced' }, product.name || 'Unnamed Product'),
          product.model_name &&
            React.createElement('p', { className: 'product-model-enhanced' }, product.model_name)
        ),
        React.createElement(
          'div',
          { className: 'product-pricing-enhanced' },
          React.createElement(
            'div',
            { className: 'price-section' },
            React.createElement('span', { className: 'current-price-enhanced' }, formatPrice(product.price)),
            product.mrp &&
              product.mrp > product.price &&
              React.createElement('span', { className: 'original-price-enhanced' }, formatPrice(product.mrp))
          ),
          getDiscountPercentage() > 0 &&
            React.createElement(
              'div',
              { className: 'savings-info' },
              `Save ${formatPrice((product.mrp || 0) - (product.price || 0))}`
            )
        ),
        React.createElement(
          'div',
          { className: 'stock-info' },
          (product.online_stock || 0) > 0
            ? React.createElement('span', { className: 'stock-available' }, '✓ In Stock')
            : React.createElement('span', { className: 'stock-unavailable' }, '✗ Out of Stock')
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'product-actions' },
      React.createElement(
        'button',
        {
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onAddToCart) {
              onAddToCart(e, product);
            }
          },
          className: `add-to-cart-enhanced ${(product.online_stock || 0) === 0 ? 'disabled' : ''} ${isLoading ? 'loading' : ''} ${isInCart ? 'in-cart' : ''}`,
          disabled: (product.online_stock || 0) === 0 || isLoading,
          'aria-label': (product.online_stock || 0) > 0 ? 
            (isInCart ? `Add more ${product.name || 'product'} to cart (${getCartQuantity()} in cart)` : `Add ${product.name || 'product'} to cart`) : 
            'Out of stock'
        },
        isLoading
          ? [
              React.createElement(RefreshCw, { key: 'refresh', size: 16, className: 'spinning', 'aria-hidden': true }),
              React.createElement('span', { key: 'adding' }, 'Adding...')
            ]
          : (product.online_stock || 0) === 0
          ? [
              React.createElement(X, { key: 'x', size: 16, 'aria-hidden': true }),
              React.createElement('span', { key: 'text' }, 'Out of Stock')
            ]
          : isInCart
          ? [
              React.createElement(ShoppingCart, { key: 'cart', size: 16, fill: 'currentColor', 'aria-hidden': true }),
              React.createElement('span', { key: 'text' }, `Add More (${getCartQuantity()})`)
            ]
          : [
              React.createElement(ShoppingCart, { key: 'cart', size: 16, 'aria-hidden': true }),
              React.createElement('span', { key: 'text' }, 'Add to Cart')
            ]
      )
    )
  );
}

// MAIN COMPONENT with SIMPLIFIED Add to Cart Handler
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
  const { addToCart, cartItems } = useCart(); // Get cartItems from context
  const abortControllerRef = useRef(null);

  console.log('Current route params:', params);
  console.log('Seller phone from params:', sellerPhone);

  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.warn('localStorage access error:', error);
      setIsLoggedIn(false);
    }
  }, []);

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
        
        console.log('Fetching store data for phone:', sellerPhone);
        
        const response = await axios.get(`http://localhost:8000/shop/${sellerPhone}/`, {
          signal: abortControllerRef.current.signal,
          timeout: 10000,
        });

        console.log('Store data fetched:', response.data);

        if (response.data) {
          setStore(response.data.store || null);
          setProducts(response.data.products || []);
        } else {
          throw new Error('No data received from server');
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request was cancelled');
          return;
        }
        console.error('Store fetch error:', error);
        setError(error.response?.data?.error || error.message || 'Store not found');
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

  useEffect(() => {
    applyFilters();
  }, [products, filters, applyFilters]);

  // SIMPLIFIED Add to Cart Handler - NO DOM manipulation, NO complex error handling
  const handleAddToCart = useCallback(async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    // Basic validation
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
      
      // Call addToCart - wrap in Promise.resolve to handle both sync and async
      await Promise.resolve(addToCart(sellerPhone, product));
      
      // Success - no DOM manipulation, just console log
      console.log('Successfully added to cart:', product.name);
      
    } catch (error) {
      // Handle error silently - don't re-throw, don't manipulate DOM
      console.error('Add to cart failed:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      // Clean up loading state safely
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

  if (isLoading) {
    return React.createElement(
      'div',
      { className: 'enhanced-loading-container' },
      React.createElement('div', { className: 'loading-spinner-enhanced' }),
      React.createElement('h3', null, 'Loading store...'),
      React.createElement('p', null, 'Please wait while we fetch the latest products')
    );
  }

  if (error || !store) {
    return React.createElement(
      'div',
      { className: 'enhanced-error-container' },
      React.createElement('div', { className: 'error-icon' }, React.createElement(Package, { size: 48, 'aria-hidden': true })),
      React.createElement('h2', null, 'Store Not Found'),
      React.createElement('p', null, error || 'This store could not be found.'),
      React.createElement(
        Link,
        { href: '/', className: 'back-button-enhanced' },
        'Back to Home'
      )
    );
  }

  return React.createElement(
    ErrorBoundary,
    null,
    React.createElement(
      'div',
      { className: 'enhanced-page-container' },
      React.createElement(SHeader, { store, isLoggedIn }),
      React.createElement(EnhancedStoreBanner, { store }),
      React.createElement(EnhancedStoreInfoSection, { store }),
      React.createElement(EnhancedFilterSection, {
        products: products || [],
        onFilterChange: handleFilterChange,
        activeFilters: filters
      }),
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'div',
          { className: 'products-header-enhanced' },
          React.createElement(
            'div',
            { className: 'products-title-enhanced' },
            React.createElement('h2', { className: 'products-main-title-enhanced' }, 'Our Products'),
            React.createElement(
              'span',
              { className: 'product-count-enhanced' },
              `${filteredProducts.length} of ${products.length} products`
            )
          ),
          React.createElement(
            'div',
            { className: 'products-controls-enhanced' },
            React.createElement(
              'div',
              { className: 'view-toggle-group' },
              React.createElement(
                'button',
                {
                  onClick: () => setViewMode('grid'),
                  className: `view-toggle-enhanced ${viewMode === 'grid' ? 'active' : ''}`,
                  'aria-label': 'Grid view'
                },
                React.createElement(Grid, { size: 16, 'aria-hidden': true })
              ),
              React.createElement(
                'button',
                {
                  onClick: () => setViewMode('list'),
                  className: `view-toggle-enhanced ${viewMode === 'list' ? 'active' : ''}`,
                  'aria-label': 'List view'
                },
                React.createElement(List, { size: 16, 'aria-hidden': true })
              )
            )
          )
        ),
        filteredProducts.length > 0
          ? React.createElement(
              'div',
              { className: `products-container-enhanced ${viewMode}` },
              filteredProducts.map((product) => {
                if (!product?.id) return null;
                return React.createElement(EnhancedProductCard, {
                  key: product.id,
                  product,
                  onAddToCart: handleAddToCart,
                  isLoading: loadingProducts[product.id] || false,
                  sellerPhone: sellerPhone,
                  storeId: store?.id,
                  cartItems: cartItems || [] // Pass cart items to product card
                });
              }).filter(Boolean)
            )
          : React.createElement(
              'div',
              { className: 'enhanced-empty-state' },
              React.createElement('div', { className: 'empty-icon' }, React.createElement(Filter, { size: 64, 'aria-hidden': true })),
              React.createElement('h3', null, 'No products found'),
              React.createElement(
                'p',
                null,
                'No products match the selected filters. Try adjusting your filter criteria.'
              ),
              React.createElement(
                'button',
                {
                  onClick: () => {
                    const defaultFilters = { priceRange: null, stockStatus: [], sortBy: 'name-asc' };
                    setFilters(defaultFilters);
                  },
                  className: 'clear-filters-button-enhanced',
                  'aria-label': 'Clear all filters'
                },
                React.createElement(X, { size: 16, 'aria-hidden': true }),
                'Clear All Filters'
              )
            )
      ),
      React.createElement(Footer, null)
    )
  );
}