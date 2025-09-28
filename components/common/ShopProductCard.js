'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import "../../styles/ShopProductCard.css";
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

// ✅ SEO-friendly URL generator
const generateShopSlug = (store) => {
  if (!store || !store.name) return 'shop';

  const shopName = store.name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');

  const location = (store.seller_address || store.address || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .split('-')[0];

  const slug = location ? `${shopName}-${location}` : shopName;
  return slug.length >= 3 ? slug : `shop-${store.seller_phone || 'store'}`;
};

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
 * ShopProductCard - Product card with integrated wishlist functionality
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
  // ✅ NEW: Wishlist props
  isWishlisted = false,
  onWishlistUpdate = null // Callback to update parent state
}) {
  const [imageError, setImageError] = useState(false);
  const [localWishlistState, setLocalWishlistState] = useState(isWishlisted);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // ✅ Sync with parent wishlist state
  useEffect(() => {
    setLocalWishlistState(isWishlisted);
  }, [isWishlisted]);

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

  // ✅ FIXED: Proper wishlist toggle integration
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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
      className={`shop-product-card shopProductCard ${getStockStatus()}`}
      data-product-id={product.id}
    >
      <Link
        href={getProductUrl()}
        className="shop-product-link productLink"
        aria-label={`View ${product.name || 'product'} in ${store?.name || 'store'}`}
      >
        <div className="product-image-wrapper productImageWrapper" >
          <img
            src={imageError ? 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image' : getImageUrl(product)}
            alt={product.name || 'Product image'}
            className="product-image productImage"
            loading="lazy"
            onError={() => setImageError(true)}
          />

          {/* Product badges */}
          <div className="product-badges productBadges" >
            {getDiscountPercentage() > 0 && (
              <span className="badge discount badgeDiscount" >
                {getDiscountPercentage()}% OFF
              </span>
            )}
            {(product.online_stock || 0) <= 5 && (product.online_stock || 0) > 0 && (
              <span className="badge low-stock badgeLowStock" >
                Only {product.online_stock} left
              </span>
            )}
            {(product.online_stock || 0) === 0 && (
              <span className="badge out-of-stock badgeOutOfStock" >
                Out of Stock
              </span>
            )}
          </div>

          {/* ✅ FIXED: Wishlist button with real functionality */}
          <div className="quick-actions quickActions" >
            <button
              className=
              {`quick-action-btn quickActionBtn wishlist-heart 
                ${localWishlistState ? 'active' : ''} 
                ${isWishlistLoading ? 'loading' : ''} 
                ${localWishlistState ? 'quick-action-btn-active' : ''} 
                ${isWishlistLoading ? 'quick-action-btn-loading' : ''}`}

              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              aria-label={localWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlistLoading ? (
                <RefreshCw size={14} className={{ animation: 'spin 1s linear infinite' }} />
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

        <div className="product-info productInfo" >
          {/* Store name (optional) */}
          {showStoreName && store?.name && (
            <div className="store-name storeName" >
              <span>by {store.name}</span>
            </div>
          )}

          {/* Product details */}
          <div className="product-header productHeader" >
            <h3 className="product-name productName" >
              {product.name || 'Unnamed Product'}
            </h3>
            {product.model_name && (
              <p className="product-model productModel" >
                {product.model_name}
              </p>
            )}
          </div>

          {/* Rating (if available) */}
          {product.average_rating && (
            <div className="product-rating productRating" >
              <div className="stars stars" >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < Math.floor(product.average_rating) ? '#fbbf24' : 'none'}
                    color="#fbbf24"
                  />
                ))}
              </div>
              <span className="rating-text ratingText" >
                ({product.review_count || 0})
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="product-pricing productPricing" >
            <div className="price-section priceSection">
              <span className="current-price currentPrice" >
                {formatPrice(product.price)}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="original-price originalPrice" >
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>
            {getDiscountPercentage() > 0 && (
              <div className="savings-info savingsInfo" >
                Save {formatPrice((product.mrp || 0) - (product.price || 0))}
              </div>
            )}
          </div>

          {/* Stock status */}
          <div className="stock-info stockInfo" >
            {(product.online_stock || 0) > 0 ? (
              <span className="stock-available stockAvailable">
                ✓ In Stock
              </span>
            ) : (
              <span className="stock-unavailable stockUnavailable" >
                ✗ Out of Stock
              </span>
            )}
          </div>

          {/* ✅ Wishlist indicator (optional) */}
          {localWishlistState && (
            <div className="wishlist-indicator wishlistIndicator" >
              <Heart size={12} fill="#ef4444" color="#ef4444" />
              <span>In Wishlist</span>
            </div>
          )}
        </div>
      </Link >

      {/* Add to cart button */}
      < div className="product-actions productActions" >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onAddToCart) {
              onAddToCart(e, product);
            }
          }}
          className={`add-to-cart-btn addToCartBtn ${(product.online_stock || 0) === 0 ? 'disabled' : ''} ${isLoading ? 'loading' : ''} ${isInCart ? 'in-cart' : ''}`}

          disabled={(product.online_stock || 0) === 0 || isLoading}
          aria-label={(product.online_stock || 0) > 0 ?
            (isInCart ? `Add more ${product.name || 'product'} to cart (${getCartQuantity()} in cart)` : `Add ${product.name || 'product'} to cart`) :
            'Out of stock'}
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
      </div >
    </div >
  );
}


