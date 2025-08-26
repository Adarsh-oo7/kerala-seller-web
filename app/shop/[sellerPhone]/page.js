// EnhancedSellerStorefrontPage.js
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
  ArrowUp,
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

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(
        'div',
        { className: 'error-boundary-container' },
        React.createElement(
          'div',
          { className: 'error-icon' },
          React.createElement(Package, { size: 48 })
        ),
        React.createElement('h2', null, 'Something went wrong'),
        React.createElement('p', null, 'Please try refreshing the page'),
        React.createElement(
          'button',
          {
            onClick: () => window.location.reload(),
            className: 'refresh-button'
          },
          'Refresh Page'
        )
      );
    }
    return this.props.children;
  }
}

// Enhanced WhatsApp Floating Button Component
function WhatsAppButton({ phoneNumber, storeName }) {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setIsVisible(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  };

  const createWhatsAppUrl = () => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const message = encodeURIComponent(`Hi! I'm interested in your products from ${storeName}. Can you help me?`);
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  if (!phoneNumber) return null;

  return React.createElement(
    'div',
    { className: `whatsapp-fab ${isVisible ? 'visible' : ''}`, role: 'complementary' },
    React.createElement(
      'a',
      {
        href: createWhatsAppUrl(),
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'whatsapp-button',
        'aria-label': `Contact ${storeName} on WhatsApp`
      },
      React.createElement(MessageCircle, { size: 20, fill: 'currentColor', 'aria-hidden': true }),
      React.createElement('span', { className: 'whatsapp-tooltip' }, 'Chat with us'),
      React.createElement('div', { className: 'whatsapp-pulse' })
    )
  );
}

// Enhanced Store Banner Component
function EnhancedStoreBanner({ store }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return React.createElement(
    'div',
    { className: 'enhanced-banner-container' },
    React.createElement(
      'div',
      { className: 'banner-background' },
      store.banner_image_url
        ? React.createElement('img', {
            src: store.banner_image_url,
            alt: `${store.name} banner`,
            className: `banner-image ${imageLoaded ? 'loaded' : ''}`,
            onLoad: () => setImageLoaded(true),
            loading: 'lazy'
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
                  alt: `${store.name} logo`,
                  className: 'store-logo-enhanced',
                  loading: 'lazy'
                })
              : React.createElement(
                  'div',
                  { className: 'store-logo-placeholder-enhanced' },
                  store.name?.charAt(0)?.toUpperCase() || 'S'
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
              React.createElement('h1', { className: 'store-name-enhanced' }, store.name),
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
          React.createElement('p', { className: showFullDescription ? 'expanded' : 'collapsed' }, store.description),
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
  const [tempFilters, setTempFilters] = useState(activeFilters);
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
    if (activeFilters.priceRange) count++;
    if (activeFilters.stockStatus.length > 0) count += activeFilters.stockStatus.length;
    if (activeFilters.sortBy !== 'name-asc') count++;
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
                    checked: tempFilters.stockStatus.includes(status.value),
                    onChange: (e) => {
                      const newStockStatus = e.target.checked
                        ? [...tempFilters.stockStatus, status.value]
                        : tempFilters.stockStatus.filter((s) => s !== status.value);
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
            activeFilters.priceRange &&
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
            activeFilters.stockStatus.map((status) =>
              React.createElement(
                'span',
                { key: status, className: 'active-filter-tag' },
                stockStatus.find((s) => s.value === status)?.label,
                React.createElement(
                  'button',
                  {
                    onClick: () =>
                      onFilterChange({
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

// Enhanced Product Card Component
function EnhancedProductCard({ product, onAddToCart, isLoading = false }) {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (product.mrp && product.mrp > product.price) {
      return Math.round(((product.mrp - product.price) / product.mrp) * 100);
    }
    return 0;
  };

  const getStockStatus = () => {
    if (product.online_stock === 0) return 'out-of-stock';
    if (product.online_stock <= 5) return 'low-stock';
    return 'in-stock';
  };

  return React.createElement(
    'div',
    { className: `enhanced-product-card ${getStockStatus()}` },
    React.createElement(
      Link,
      { href: `/product/${product.id}`, className: 'product-link-enhanced', 'aria-label': `View ${product.name}` },
      React.createElement(
        'div',
        { className: 'product-image-wrapper' },
        React.createElement('img', {
          src: imageError
            ? 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image'
            : product.main_image_url || product.image_url || 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image',
          alt: product.name,
          className: 'product-image-enhanced',
          loading: 'lazy',
          onError: () => setImageError(true)
        }),
        React.createElement(
          'div',
          { className: 'product-badges' },
          getDiscountPercentage() > 0 &&
            React.createElement('span', { className: 'badge discount' }, `${getDiscountPercentage()}% OFF`),
          product.online_stock <= 5 &&
            product.online_stock > 0 &&
            React.createElement('span', { className: 'badge low-stock' }, `Only ${product.online_stock} left`),
          product.online_stock === 0 &&
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
          React.createElement('h3', { className: 'product-name-enhanced' }, product.name),
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
              `Save ${formatPrice(product.mrp - product.price)}`
            )
        ),
        React.createElement(
          'div',
          { className: 'stock-info' },
          product.online_stock > 0
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
          onClick: (e) => onAddToCart(e, product),
          className: `add-to-cart-enhanced ${product.online_stock === 0 ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`,
          disabled: product.online_stock === 0 || isLoading,
          'aria-label': product.online_stock > 0 ? `Add ${product.name} to cart` : 'Out of stock'
        },
        isLoading
          ? [
              React.createElement(RefreshCw, { key: 'refresh', size: 16, className: 'spinning', 'aria-hidden': true }),
              React.createElement('span', { key: 'adding' }, 'Adding...')
            ]
          : [
              React.createElement(ShoppingCart, { key: 'cart', size: 16, 'aria-hidden': true }),
              React.createElement('span', { key: 'text' }, product.online_stock > 0 ? 'Add to Cart' : 'Out of Stock')
            ]
      )
    )
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: null,
    stockStatus: [],
    sortBy: 'name-asc'
  });

  const params = useParams();
  const { sellerPhone } = params;
  const { addToCart } = useCart();
  const abortControllerRef = useRef(null);

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 400);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const token = localStorage.getItem('buyerAccessToken');
    setIsLoggedIn(!!token);
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    if (filters.priceRange) {
      filtered = filtered.filter(
        (product) => product.price >= filters.priceRange.min && product.price <= filters.priceRange.max
      );
    }

    if (filters.stockStatus.length > 0) {
      filtered = filtered.filter((product) => {
        const stockStatus =
          product.online_stock === 0 ? 'out-of-stock' : product.online_stock <= 5 ? 'low-stock' : 'in-stock';
        return filters.stockStatus.includes(stockStatus);
      });
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, filters]);

  useEffect(() => {
    if (!sellerPhone) return;

    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();
        const response = await axios.get(`http://localhost:8000/shop/${sellerPhone}/`, {
          signal: abortControllerRef.current.signal
        });

        setStore(response.data.store);
        setProducts(response.data.products);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error('Store fetch error:', error);
        setError(error.response?.data?.error || 'Store not found');
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

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.online_stock <= 0) {
      return;
    }

    setLoadingProducts((prev) => ({ ...prev, [product.id]: true }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      addToCart(sellerPhone, product);

      const button = e.target.closest('button');
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        <span>Added!</span>
      `;
      button.classList.add('success');

      setTimeout(() => {
        if (button) {
          button.innerHTML = originalHTML;
          button.classList.remove('success');
        }
      }, 2000);
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setLoadingProducts((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        React.createElement(ArrowUp, { size: 16, 'aria-hidden': true }),
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
        products,
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
              filteredProducts.map((product) =>
                React.createElement(EnhancedProductCard, {
                  key: product.id,
                  product,
                  onAddToCart: handleAddToCart,
                  isLoading: loadingProducts[product.id]
                })
              )
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
                  onClick: () =>
                    setFilters({ priceRange: null, stockStatus: [], sortBy: 'name-asc' }),
                  className: 'clear-filters-button-enhanced',
                  'aria-label': 'Clear all filters'
                },
                React.createElement(X, { size: 16, 'aria-hidden': true }),
                'Clear All Filters'
              )
            )
      ),
      React.createElement(WhatsAppButton, {
        phoneNumber: store.whatsapp_number || store.seller_phone,
        storeName: store.name
      }),
      showScrollTop &&
        React.createElement(
          'button',
          {
            onClick: scrollToTop,
            className: 'scroll-to-top-enhanced',
            'aria-label': 'Scroll to top'
          },
          React.createElement(ArrowUp, { size: 18, 'aria-hidden': true })
        ),
      React.createElement(Footer, null)
    )
  );
}