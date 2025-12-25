'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import "../../styles/ShopProductcard.css";

import {
  ShoppingCart,
  Heart,
  Star,
  RefreshCw,
  X,
  Zap,
  Eye
} from 'lucide-react';

// ✅ Helper function to get API base URL
const getApiBaseUrl = () => {
  const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;

  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }

  return 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = 'https://api.keralasellers.in';
const WISHLIST_TOGGLE_API = `${API_BASE_URL}/api/wishlist/toggle_product/`;
const WISHLIST_CHECK_API = `${API_BASE_URL}/api/wishlist/check_product/`;

// ✅ Enhanced token handling function
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') ||
    localStorage.getItem('buyerAccessToken') ||
    localStorage.getItem('buyerToken') ||
    localStorage.getItem('accessToken');

  if (!token) {
    return null;
  }
  return { 'Authorization': `Bearer ${token}` };
};

/**
 * ShopProductCard - Product card with integrated wishlist functionality and ratings
 */
export default function ShopProductCard({
  product,
  store,
  shopSlug,
  sellerPhone,
  onAddToCart,
  isLoading = false,
  cartItems = [],
  showStoreName = false,
  // ✅ Wishlist props
  isWishlisted = false,
  onWishlistUpdate = null, // Callback to update parent state
  // ✅ NEW: Enhanced props
  showQuickView = false,
  compact = false // For mobile grid view
}) {
  const [imageError, setImageError] = useState(false);
  const [localWishlistState, setLocalWishlistState] = useState(isWishlisted);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ✅ Sync with parent wishlist state + debug logging
  useEffect(() => {
    console.log(`🔍 Product ${product?.id}: isWishlisted prop changed to:`, isWishlisted);
    setLocalWishlistState(isWishlisted);
  }, [isWishlisted, product?.id]);

  // ✅ Fallback: Check individual wishlist status if parent doesn't provide
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const headers = getAuthHeaders();
      if (!headers || !product?.id) return;

      try {
        console.log(`🔍 Checking wishlist status for product ${product.id}`);
        const response = await axios.get(`${WISHLIST_CHECK_API}?product_id=${product.id}`, {
          headers,
          timeout: 5000
        });
        const isInWishlist = response.data.is_wishlisted || false;
        console.log(`✅ Product ${product.id} wishlist status:`, isInWishlist);
        setLocalWishlistState(isInWishlist);
      } catch (error) {
        console.warn('❌ Failed to check wishlist status:', error);
      }
    };

    // Only check if no wishlist prop provided from parent AND we have a product ID
    if (isWishlisted === false && product?.id && !onWishlistUpdate) {
      checkWishlistStatus();
    }
  }, [product?.id, isWishlisted, onWishlistUpdate]);

  if (!product) return null;

  // ✅ Generate the correct shop-specific product URL
  const getProductUrl = () => {
    if (!product.id || !sellerPhone) return '#';

    if (store && store.name && shopSlug) {
      return `/shop/${shopSlug}/product/${product.id}?id=${sellerPhone}`;
    }

    return `/shop/${sellerPhone}/product/${product.id}`;
  };

  // ✅ Enhanced image URL function with Cloudinary support
  const getImageUrl = (product) => {
    if (!product) return 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image';

    // Priority order for different image types
    const imageUrl = product.main_image_url ||
      product.image_url ||
      product.cloudinary_url ||
      product.thumbnail_url;

    if (!imageUrl) return 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image';

    // If it's already a Cloudinary URL, return as is
    if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
      return imageUrl;
    }

    // Handle local URLs
    if (imageUrl.startsWith('/media/') || imageUrl.startsWith('/static/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    return imageUrl.startsWith('/') ? `${API_BASE_URL}${imageUrl}` : imageUrl;
  };

  // ✅ Helper function to get login redirect URL with query parameters
  const getLoginRedirectUrl = () => {
    // ✅ FIX: Include full path with query parameters
    const currentFullPath = window.location.pathname + window.location.search;
    return shopSlug 
      ? `/shop/${shopSlug}/login?redirect=${encodeURIComponent(currentFullPath)}`
      : `/shop/${sellerPhone}/login?redirect=${encodeURIComponent(currentFullPath)}`;
  };

  // ✅ FIXED: Proper wishlist toggle with correct redirect URL
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔍 Wishlist button clicked for product:', product.id);

    const headers = getAuthHeaders();
    if (!headers) {
      const shouldLogin = window.confirm('Please login to add items to your wishlist. Would you like to login now?');
      if (shouldLogin) {
        // ✅ FIX: Use helper function with full path
        const loginUrl = getLoginRedirectUrl();
        console.log('🔄 Redirecting to login:', loginUrl);
        window.location.href = loginUrl;
      }
      return;
    }

    if (isWishlistLoading) {
      console.log('⏳ Wishlist request already in progress for product:', product.id);
      return;
    }

    setIsWishlistLoading(true);
    const previousState = localWishlistState;

    // Optimistic update
    setLocalWishlistState(!localWishlistState);

    try {
      console.log('🔄 Toggling wishlist for product:', product.id);

      const response = await axios.post(WISHLIST_TOGGLE_API, {
        product_id: product.id
      }, {
        headers,
        timeout: 10000
      });

      console.log('✅ Wishlist toggle response:', response.data);

      const newWishlistState = response.data.is_wishlisted ?? response.data.wishlisted;
      setLocalWishlistState(newWishlistState);

      // ✅ Notify parent component about wishlist change
      if (onWishlistUpdate) {
        onWishlistUpdate(product.id, newWishlistState);
      }

      // Show user feedback
      const action = newWishlistState ? 'added to' : 'removed from';
      console.log(`✅ ${product.name} ${action} wishlist`);

      // Visual feedback
      showWishlistFeedback(newWishlistState);

    } catch (error) {
      console.error('❌ Wishlist toggle error:', error);

      // Revert optimistic update
      setLocalWishlistState(previousState);

      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('buyerAccessToken');
        alert('Session expired. Please login again.');
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to update wishlist. Please try again.';
        alert(errorMessage);
      }
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // ✅ Visual feedback for wishlist actions
  const showWishlistFeedback = (isAdded) => {
    // Find the heart button and add visual feedback
    const heartButton = document.querySelector(`[data-product-id="${product.id}"] .wishlist-heart`);
    if (heartButton) {
      heartButton.style.transform = 'scale(1.2)';
      setTimeout(() => {
        heartButton.style.transform = 'scale(1)';
      }, 200);
    }
  };

  // Cart functionality
  const isInCart = cartItems?.some(item =>
    item.product_id === product.id && item.seller_phone === sellerPhone
  ) || false;

  const getCartQuantity = () => {
    const cartItem = cartItems?.find(item =>
      item.product_id === product.id && item.seller_phone === sellerPhone
    );
    return cartItem?.quantity || 0;
  };

  // Pricing functions
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

  // ✅ NEW: Quick actions handler
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // You can implement a modal or redirect to product page
    window.open(getProductUrl(), '_blank');
  };

  // ✅ FIXED: Add to cart handler with correct redirect URL
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // ✅ FIX: Check if user is logged in before adding to cart
    const headers = getAuthHeaders();
    if (!headers) {
      const shouldLogin = window.confirm('Please login to add items to your cart. Would you like to login now?');
      if (shouldLogin) {
        // ✅ FIX: Use helper function with full path
        const loginUrl = getLoginRedirectUrl();
        console.log('🔄 Redirecting to login:', loginUrl);
        window.location.href = loginUrl;
      }
      return;
    }
    
    // User is logged in, proceed with adding to cart
    if (onAddToCart) {
      onAddToCart(e, product);
    }
  };

  return (
    <div
      className={`shop-product-card ${getStockStatus()}`}
      style={styles.shopProductCard}
      data-product-id={product.id}
    >
      {/* ✅ FIXED: Image section without Link wrapper for wishlist button */}
      <div className="product-image-wrapper" style={styles.productImageWrapper}>
        {/* ✅ Link only wraps the image itself */}
        <Link
          href={getProductUrl()}
          className="product-image-link"
          style={styles.productImageLink}
          aria-label={`View ${product.name || 'product'} in ${store?.name || 'store'}`}
        >
          <img
            src={imageError ? 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image' : getImageUrl(product)}
            alt={product.name || 'Product image'}
            className="product-image"
            style={styles.productImage}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </Link>

        {/* ✅ Rating overlay (existing) - shows on image hover */}
        <div className='shopproductcardoverlay' style={styles.ratingOverlay}>
          <div style={styles.ratingLeft}>
            <Star
              size={12}
              fill={product.average_rating > 0 ? "#fbbf24" : "none"}
              color="#fbbf24"
            />
            <span style={styles.ratingLeftText}>
              {product.average_rating > 0 ? `(${product.average_rating.toFixed(1)})` : ""}
            </span>
          </div>

          {product.review_count > 0 ? (
            <span style={styles.ratingRight}>
              {product.review_count} reviews
            </span>
          ) : (
            <span style={styles.ratingRight}>No reviews</span>
          )}
        </div>

        {/* Product badges */}
        <div className="product-badges" style={styles.productBadges}>
          {getDiscountPercentage() > 0 && (
            <span className="badge discount" style={styles.badgeDiscount}>
              {getDiscountPercentage()}% OFF
            </span>
          )}
          {(product.online_stock || 0) <= 5 && (product.online_stock || 0) > 0 && (
            <span className="badge low-stock" style={styles.badgeLowStock}>
              Only {product.online_stock} left
            </span>
          )}
          {(product.online_stock || 0) === 0 && (
            <span className="badge out-of-stock" style={styles.badgeOutOfStock}>
              Out of Stock
            </span>
          )}
        </div>

        {/* ✅ FIXED: Wishlist button outside Link - this is the key fix */}
        <div className="quick-actions" style={styles.quickActions}>
          <button
            className={`quick-action-btn wishlist-heart ${localWishlistState ? 'active' : ''} ${isWishlistLoading ? 'loading' : ''}`}
            style={{
              ...styles.quickActionBtn,
              ...(localWishlistState ? styles.quickActionBtnActive : {}),
              ...(isWishlistLoading ? styles.quickActionBtnLoading : {})
            }}
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            aria-label={localWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
            type="button"
          >
            {isWishlistLoading ? (
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Heart
                size={14}
                fill={localWishlistState ? '#ef4444' : 'none'}
                color={localWishlistState ? '#ef4444' : 'currentColor'}
              />
            )}
          </button>
        </div>
      </div>

      {/* ✅ Product info section wrapped in Link */}
      <Link
        href={getProductUrl()}
        className="shop-product-link"
        style={styles.productLink}
        aria-label={`View ${product.name || 'product'} details`}
      >
        <div className="product-info" style={styles.productInfo}>
          {/* Store name (optional) */}
          {showStoreName && store?.name && (
            <div className="store-name" style={styles.storeName}>
              <span>by {store.name}</span>
            </div>
          )}

          {/* Product details */}
          <div className="product-header" style={styles.productHeader}>
            <h3 className="product-name" style={styles.productName}>
              {product.name || 'Unnamed Product'}
              {product.model_name && (
                <span className='product-model' style={styles.productModel}> ({product.model_name})</span>
              )}
            </h3>
          </div>

          {/* Pricing */}
          <div className="product-pricing" style={styles.productPricing}>
            <div className="price-section" style={styles.priceSection}>
              <span className="current-price" style={styles.currentPrice}>
                {formatPrice(product.price)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="original-price" style={styles.originalPrice}>
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>
          </div>

          {/* ✅ FIXED: Add to cart button using handler function */}
          <button
            onClick={handleAddToCart}
            className={`add-to-cart-btn ${(product.online_stock || 0) === 0 ? 'disabled' : ''} ${isLoading ? 'loading' : ''} ${isInCart ? 'in-cart' : ''}`}
            style={styles.addToCartBtn}
            disabled={(product.online_stock || 0) === 0 || isLoading}
            aria-label={(product.online_stock || 0) > 0 ?
              (isInCart ? `Add more ${product.name || 'product'} to cart (${getCartQuantity()} in cart)` : `Add ${product.name || 'product'} to cart`) :
              'Out of stock'}
            type="button"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="spinning" />
                <span>Adding...</span>
              </>
            ) : (product.online_stock || 0) === 0 ? (
              <>
                <X size={16} />
                <span>Out of Stock</span>
              </>
            ) : isInCart ? (
              <>
                <ShoppingCart size={16} fill="currentColor" />
                <span>Add More ({getCartQuantity()})</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* ✅ CSS for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// ✅ Enhanced styles with better mobile support and loading states (UNCHANGED)
const styles = {
  shopProductCard: {
    width: "100%",
    maxWidth: "210px",
    border: "1px solid #eee",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    position: "relative"
  },

  compactCard: {
    maxWidth: "180px"
  },

  productLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
  },

  productImageLink: {
    display: 'block',
    textDecoration: 'none',
    position: 'relative'
  },

  productImageWrapper: {
    width: "100%",
    height: "185px",
    position: "relative",
    overflow: "hidden"
  },

  productImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    transition: 'all 0.3s ease'
  },

  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1
  },

  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #059669',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  productBadges: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 2
  },

  badgeDiscount: {
    padding: '4px 8px',
    background: 'rgba(40, 167, 69, 0.9)',
    color: 'white',
    fontSize: '10px',
    borderRadius: '6px',
    fontWeight: '600',
    backdropFilter: 'blur(4px)',
  },

  badgeLowStock: {
    padding: '4px 8px',
    backgroundColor: '#be1e237a',
    color: 'white',
    fontSize: '10px',
    borderRadius: '6px',
    fontWeight: '600'
  },

  badgeOutOfStock: {
    padding: '4px 8px',
    backgroundColor: '#6b7280',
    color: 'white',
    fontSize: '0.75rem',
    borderRadius: '4px',
    fontWeight: '600'
  },

  badgeFastLoading: {
    padding: '3px 6px',
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    color: 'white',
    fontSize: '9px',
    borderRadius: '4px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },

  quickActions: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  quickActionBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#059669',
    transition: 'all 0.2s',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'relative'
  },

  quickActionBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    boxShadow: '0 2px 12px rgba(239, 68, 68, 0.25)'
  },

  quickActionBtnLoading: {
    cursor: 'not-allowed',
    opacity: 0.7,
    pointerEvents: 'none'
  },

  productInfo: {
    padding: '10px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  compactInfo: {
    padding: '8px'
  },

  storeName: {
    fontSize: '0.8rem',
    color: '#059669',
    fontWeight: '500',
    marginBottom: '8px'
  },

  productHeader: {
    marginBottom: '8px',
    flex: 1
  },

  productName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a4845',
    margin: '0',
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  productModel: {
    fontSize: '0.85rem',
    fontWeight: '400',
    color: '#6b7280',
    marginLeft: '4px',
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "120px",
    display: "inline-block",
    verticalAlign: "middle"
  },

  productPricing: {
    marginBottom: '8px'
  },

  priceSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'nowrap',
  },

  currentPrice: {
    fontWeight: '600',
    color: '#059669'
  },

  originalPrice: {
    fontSize: '0.9rem',
    color: 'rgb(156, 163, 175)',
    textDecoration: 'line-through'
  },

  savingsText: {
    fontSize: '0.75rem',
    color: '#059669',
    fontWeight: '500',
    marginTop: '2px'
  },

  addToCartBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '7px 42px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  compactButton: {
    padding: '6px 8px',
    fontSize: '11px'
  },

  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },

  inCartButton: {
    backgroundColor: '#3b82f6'
  },

  // ✅ Rating overlay (existing) - on image
  ratingOverlay: {
    position: "absolute",
    bottom: "5px",
    left: "0",
    width: "100%",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    boxSizing: "border-box",
    zIndex: 2,
  },

  ratingLeft: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  ratingLeftText: {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "white",
  },

  ratingRight: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "white",
    marginLeft: "auto",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
