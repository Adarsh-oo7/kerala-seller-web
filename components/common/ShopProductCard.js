'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  ShoppingCart,
  Heart,
  Star,
  RefreshCw,
  X
} from 'lucide-react';

// ✅ Helper function to get API base URL
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

const API_BASE_URL = getApiBaseUrl();
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
  onWishlistUpdate = null // Callback to update parent state
}) {
  const [imageError, setImageError] = useState(false);
  const [localWishlistState, setLocalWishlistState] = useState(isWishlisted);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

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

  // ✅ Enhanced image URL function
  const getImageUrl = (product) => {
    if (!product) return 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image';

    const imageUrl = product.main_image_url || product.image_url;

    if (imageUrl && imageUrl.startsWith('/media/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }

    return imageUrl || 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image';
  };

  // ✅ FIXED: Proper wishlist toggle with better event handling
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🔍 Wishlist button clicked for product:', product.id);

    const headers = getAuthHeaders();
    if (!headers) {
      const shouldLogin = window.confirm('Please login to add items to your wishlist. Would you like to login now?');
      if (shouldLogin) {
        window.location.href = '/login/buyer';
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
        {product.average_rating > 0 && (
          <div style={styles.ratingOverlay}>
            <div style={styles.ratingLeft}>
              {[...Array(1)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.floor(product.average_rating) ? "#fbbf24" : "none"}
                  color="#fbbf24"
                />
              ))}
              <span style={styles.ratingLeftText}>{product.average_rating.toFixed(1)}</span>
            </div>

            {product.review_count > 0 && (
              <span style={styles.ratingRight}>
                ({product.review_count} reviews)
              </span>
            )}
          </div>
        )}

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
                <span style={styles.productModel}> ({product.model_name})</span>
              )}
            </h3>
          </div>

          {/* ✅ NEW: Rating in product info (always visible) */}
          {product.average_rating > 0 && (
            <div className="product-rating" style={styles.productRating}>
              <div style={styles.ratingStars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(product.average_rating) ? "#fbbf24" : "none"}
                    color="#fbbf24"
                  />
                ))}
              </div>
              <span style={styles.ratingNumber}>{product.average_rating.toFixed(1)}</span>
              {product.review_count > 0 && (
                <span style={styles.reviewCountText}>({product.review_count})</span>
              )}
            </div>
          )}

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

          {/* ✅ Wishlist indicator (optional) */}
          {localWishlistState && (
            <div className="wishlist-indicator" style={styles.wishlistIndicator}>
              <Heart size={12} fill="#ef4444" color="#ef4444" />
              <span>In Wishlist</span>
            </div>
          )}
        </div>
      </Link>

      {/* ✅ Add to cart button - separate from Link */}
      <div className="product-actions" style={styles.productActions}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onAddToCart) {
              onAddToCart(e, product);
            }
          }}
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

// ✅ Enhanced styles with rating in product info
const styles = {
  shopProductCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },

  productLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
  },

  productImageLink: {
    display: 'block',
    textDecoration: 'none'
  },

  productImageWrapper: {
    position: 'relative',
    overflow: 'hidden'
  },

  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
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
    backgroundColor: '#dc2626',
    color: 'white',
    fontSize: '0.75rem',
    borderRadius: '4px',
    fontWeight: '600'
  },

  badgeLowStock: {
    padding: '4px 8px',
    backgroundColor: '#f59e0b',
    color: 'white',
    fontSize: '0.75rem',
    borderRadius: '4px',
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

  quickActions: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: 10,
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
    color: '#6b7280',
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
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
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
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0',
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
  },

  // ✅ NEW: Rating styles in product info
  productRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },

  ratingStars: {
    display: 'flex',
    alignItems: 'center',
    gap: '1px'
  },

  ratingNumber: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1f2937'
  },

  reviewCountText: {
    fontSize: '0.8rem',
    color: '#6b7280'
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
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#059669'
  },

  originalPrice: {
    fontSize: '1rem',
    color: '#9ca3af',
    textDecoration: 'line-through'
  },

  wishlistIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
    color: '#ef4444',
    fontWeight: '500',
    marginBottom: '8px',
    padding: '4px 6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '12px',
    width: 'fit-content'
  },

  productActions: {
    padding: '16px',
    borderTop: '1px solid #f3f4f6'
  },

  addToCartBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // ✅ Rating overlay (existing) - on image
  ratingOverlay: {
    position: "absolute",
    bottom: "3px",
    left: "0",
    width: "100%",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    padding: "12px 12px",
    boxSizing: "border-box",
    zIndex: 2,
  },

  ratingLeft: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  ratingLeftText: {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "white",
  },

  ratingRight: {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "white",
    marginLeft: "auto",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
