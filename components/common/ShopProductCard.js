'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

// ✅ SEO-friendly URL generator (same as other components)
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

/**
 * ShopProductCard - Product card specifically designed for shop pages
 * This component creates shop-specific product URLs and maintains shop context
 */
export default function ShopProductCard({ 
  product, 
  store, 
  shopSlug, 
  sellerPhone, 
  onAddToCart, 
  isLoading = false, 
  cartItems = [],
  showStoreName = false // Option to show store name on card
}) {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  // ✅ Generate the correct shop-specific product URL
  const getProductUrl = () => {
    if (!product.id || !sellerPhone) return '#';
    
    // If we have store data, use SEO-friendly URL
    if (store && store.name && shopSlug) {
      return `/shop/${shopSlug}/product/${product.id}?id=${sellerPhone}`;
    }
    
    // Fallback: use phone-based URL
    return `/shop/${sellerPhone}/product/${product.id}`;
  };

  // ✅ Enhanced image URL function
  const getImageUrl = (product) => {
    if (!product) return 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image';
    
    const imageUrl = product.main_image_url || product.image_url;
    
    if (imageUrl && imageUrl.startsWith('/media/')) {
      return `${getApiBaseUrl()}${imageUrl}`;
    }
    
    return imageUrl || 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image';
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
    <div className={`shop-product-card ${getStockStatus()}`} style={styles.shopProductCard}>
      {/* ✅ Fixed: Product link now goes to shop-specific product page */}
      <Link 
        href={getProductUrl()} 
        className="shop-product-link" 
        style={styles.productLink}
        aria-label={`View ${product.name || 'product'} in ${store?.name || 'store'}`}
      >
        <div className="product-image-wrapper" style={styles.productImageWrapper}>
          <img
            src={imageError ? 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image' : getImageUrl(product)}
            alt={product.name || 'Product image'}
            className="product-image"
            style={styles.productImage}
            loading="lazy"
            onError={() => setImageError(true)}
          />
          
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
          
          {/* Quick actions */}
          <div className="quick-actions" style={styles.quickActions}>
            <button
              className={`quick-action-btn ${isWishlisted ? 'active' : ''}`}
              style={styles.quickActionBtn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        
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
            </h3>
            {product.model_name && (
              <p className="product-model" style={styles.productModel}>
                {product.model_name}
              </p>
            )}
          </div>
          
          {/* Rating (if available) */}
          {product.average_rating && (
            <div className="product-rating" style={styles.productRating}>
              <div className="stars" style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    fill={i < Math.floor(product.average_rating) ? '#fbbf24' : 'none'}
                    color="#fbbf24"
                  />
                ))}
              </div>
              <span className="rating-text" style={styles.ratingText}>
                ({product.review_count || 0})
              </span>
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
            {getDiscountPercentage() > 0 && (
              <div className="savings-info" style={styles.savingsInfo}>
                Save {formatPrice((product.mrp || 0) - (product.price || 0))}
              </div>
            )}
          </div>
          
          {/* Stock status */}
          <div className="stock-info" style={styles.stockInfo}>
            {(product.online_stock || 0) > 0 ? (
              <span className="stock-available" style={styles.stockAvailable}>
                ✓ In Stock
              </span>
            ) : (
              <span className="stock-unavailable" style={styles.stockUnavailable}>
                ✗ Out of Stock
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Add to cart button */}
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
    </div>
  );
}

// ✅ Styles for ShopProductCard
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
    display: 'block',
    flex: 1
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
    zIndex: 2
  },
  
  quickActionBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    transition: 'all 0.2s',
    backdropFilter: 'blur(4px)'
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
    fontSize: '0.9rem',
    color: '#6b7280',
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  productRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },

  stars: {
    display: 'flex',
    gap: '2px'
  },

  ratingText: {
    fontSize: '0.8rem',
    color: '#6b7280'
  },
  
  productPricing: {
    marginBottom: '8px'
  },
  
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
    flexWrap: 'wrap'
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
  
  savingsInfo: {
    fontSize: '0.8rem',
    color: '#059669',
    fontWeight: '500'
  },
  
  stockInfo: {
    marginBottom: 'auto'
  },
  
  stockAvailable: {
    color: '#059669',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  
  stockUnavailable: {
    color: '#ef4444',
    fontSize: '0.85rem',
    fontWeight: '500'
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
  }
};
