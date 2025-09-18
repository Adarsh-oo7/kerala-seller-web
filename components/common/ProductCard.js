"use client"

import { useState, useEffect } from "react"
import { Heart, Star, ShoppingCart } from "lucide-react"
import Link from "next/link"

// ✅ Enhanced API base URL function
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

export default function ProductCard({
  id,
  title,
  price,
  mrp,
  rating,
  reviewCount = 0,
  primaryImage,
  hoverImage,
  className,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  isWishlistLoading = false,
  onlineStock = 1,
  storeName,
  modelName,
  sellerPhone
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [touchStarted, setTouchStarted] = useState(false)
  const [wishlistState, setWishlistState] = useState(isWishlisted)
  const [localWishlistLoading, setLocalWishlistLoading] = useState(false)

  // ✅ FIXED: Sync with parent state properly
  useEffect(() => {
    setWishlistState(isWishlisted)
  }, [isWishlisted])

  const handleTouchStart = () => {
    setTouchStarted(true)
    setIsHovered(true)
  }

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsHovered(false)
      setTouchStarted(false)
    }, 2000)
  }

  // ✅ SIMPLIFIED: Just call parent handler, don't duplicate logic
  const handleWishlistToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🔍 ProductCard wishlist button clicked for product:', id);
    
    // Prevent multiple clicks
    if (isWishlistLoading || localWishlistLoading) {
      console.log('⏳ Wishlist operation already in progress for product:', id)
      return
    }
    
    // ✅ SIMPLIFIED: Just call parent handler
    if (onToggleWishlist) {
      console.log('📞 Calling parent wishlist handler for product:', id);
      await onToggleWishlist(id);
    } else {
      console.warn('⚠️ No onToggleWishlist handler provided to ProductCard');
    }
  }

  // ✅ Enhanced add to cart handler
  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (onlineStock === 0) {
      console.warn('⚠️ Attempted to add out-of-stock item to cart')
      return
    }
    
    try {
      if (onAddToCart) {
        const productData = {
          id: parseInt(id),
          name: title,
          price: parseFloat(price) || 0,
          mrp: mrp ? parseFloat(mrp) : null,
          main_image_url: primaryImage,
          image_url: primaryImage,
          online_stock: onlineStock,
          seller_phone: sellerPhone,
          store: storeName ? { name: storeName } : null,
          model_name: modelName,
          average_rating: rating,
          review_count: reviewCount
        }
        
        console.log('🛒 Adding to cart:', productData)
        await onAddToCart(e, productData)
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error)
    }
  }

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice)
  }

  const getDiscountPercentage = () => {
    const numPrice = parseFloat(price) || 0
    const numMrp = parseFloat(mrp) || 0
    
    if (numMrp && numMrp > numPrice) {
      return Math.round(((numMrp - numPrice) / numMrp) * 100)
    }
    return null
  }

  // ✅ Enhanced product URL with store context awareness
  const getProductUrl = () => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const storeMatch = currentPath.match(/\/store\/([^\/]+)/)
      
      if (storeMatch) {
        return `/store/${storeMatch[1]}/product/${id}`
      }
    }
    
    if (sellerPhone) {
      return `/shop/${sellerPhone}/product/${id}`
    }
    return `/product/${id}`
  }

  // ✅ Enhanced image URL handling
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.svg"
    
    if (imageUrl.startsWith('/media/') || imageUrl.startsWith('/static/')) {
      return `${getApiBaseUrl()}${imageUrl}`
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    
    if (imageUrl.startsWith('/')) {
      return `${getApiBaseUrl()}${imageUrl}`
    }
    
    return imageUrl || "/placeholder.svg"
  }

  // Determine if wishlist is loading
  const isWishlistCurrentlyLoading = isWishlistLoading || localWishlistLoading

  return (
    <>
      <div
        className={`product-card ${className || ""} ${onlineStock === 0 ? "out-of-stock" : ""}`}
        data-product-id={id}
        onMouseEnter={() => !touchStarted && setIsHovered(true)}
        onMouseLeave={() => !touchStarted && setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="image-container">
          {onlineStock === 0 && (
            <div className="stock-badge">
              Out of Stock
            </div>
          )}

          {getDiscountPercentage() && (
            <div className="discount-badge">
              {getDiscountPercentage()}% OFF
            </div>
          )}

          <div className={`wishlist ${isHovered || wishlistState ? "show" : ""}`}>
            <button
              className={`wishlist-btn ${wishlistState ? "wish-active" : ""} ${isWishlistCurrentlyLoading ? "loading" : ""}`}
              onClick={handleWishlistToggle}
              aria-label={wishlistState ? "Remove from wishlist" : "Add to wishlist"}
              type="button"
              disabled={isWishlistCurrentlyLoading}
              data-product-id={id}
            >
              {isWishlistCurrentlyLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <Heart
                  className={`wishlist-icon ${wishlistState ? "wish-active" : ""}`}
                  fill={wishlistState ? "#dc3545" : "none"}
                  stroke={wishlistState ? "#dc3545" : "currentColor"}
                  size={16}
                />
              )}
            </button>
          </div>

          <Link href={getProductUrl()} className="image-link">
            <div className="image-wrapper">
              <img
                src={getImageUrl(primaryImage)}
                alt={title || 'Product'}
                className={`primary-image ${isHovered ? "hidden" : ""}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  console.warn(`Failed to load primary image for product ${id}:`, primaryImage)
                  e.target.src = "/placeholder.svg"
                }}
                loading="lazy"
              />
              {hoverImage && hoverImage !== primaryImage && (
                <img
                  src={getImageUrl(hoverImage)}
                  alt={`${title || 'Product'} - alternate view`}
                  className={`hover-image ${isHovered ? "visible" : ""}`}
                  onError={(e) => {
                    console.warn(`Failed to load hover image for product ${id}:`, hoverImage)
                    e.target.src = getImageUrl(primaryImage) || "/placeholder.svg"
                  }}
                  loading="lazy"
                />
              )}
              {!imageLoaded && (
                <div className="image-skeleton"></div>
              )}
            </div>
          </Link>

          <div className={`cart-overlay ${isHovered ? "show-cart" : ""}`}>
            <button
              className={`cart-btn ${onlineStock === 0 ? "disabled" : ""}`}
              onClick={handleAddToCart}
              disabled={onlineStock === 0}
              type="button"
            >
              <ShoppingCart className="cart-icon" />
              <span className="cart-text">
                {onlineStock > 0 ? "ADD TO CART" : "OUT OF STOCK"}
              </span>
            </button>
          </div>
        </div>

        <div className="product-info">
          <h3 className="product-title">
            <Link href={getProductUrl()}>{title || 'Product'}</Link>
          </h3>
          
          {modelName && (
            <p className="model-name">{modelName}</p>
          )}
          
          {storeName && (
            <p className="store-name">by {storeName}</p>
          )}
          
          <div className="price-row">
            <span className="product-price">{formatPrice(price)}</span>
            {mrp && parseFloat(mrp) > parseFloat(price) && (
              <>
                <span className="original-price">{formatPrice(mrp)}</span>
                <span className="savings">Save {formatPrice(parseFloat(mrp) - parseFloat(price))}</span>
              </>
            )}
          </div>

          {rating && rating > 0 && (
            <div className="rating-row">
              <div className="rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`star ${star <= Math.floor(rating) ? "star-filled" : ""}`}
                  />
                ))}
              </div>
              <span className="rating-text">
                ({rating.toFixed(1)}){reviewCount > 0 && ` • ${reviewCount} reviews`}
              </span>
            </div>
          )}

          {onlineStock > 0 && onlineStock <= 3 && (
            <span className="low-stock">Only {onlineStock} left!</span>
          )}
        </div>
      </div>

      <style jsx>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          position: relative;
          height: 100%;
          max-width: 100%;
          border: 1px solid #f0f0f0;
        }

        .product-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px);
          border-color: #e0e0e0;
        }

        .product-card.out-of-stock {
          opacity: 0.6;
        }

        .image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          background: #f8f9fa;
        }

        .stock-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(220, 53, 69, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          z-index: 3;
          text-transform: uppercase;
          backdrop-filter: blur(4px);
        }

        .discount-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(40, 167, 69, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          z-index: 3;
          text-transform: uppercase;
          backdrop-filter: blur(4px);
        }

        .wishlist {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 4;
          opacity: 0;
          transform: translateY(-8px);
          transition: all 0.3s ease;
        }

        .wishlist.show {
          opacity: 1;
          transform: translateY(0);
        }

        .wishlist-btn {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        }

        .wishlist-btn:hover:not(:disabled) {
          background: white;
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        }

        .wishlist-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .wishlist-btn.wish-active {
          background: rgba(220, 53, 69, 0.1);
          border-color: rgba(220, 53, 69, 0.3);
        }

        .wishlist-btn.wish-active:hover:not(:disabled) {
          background: rgba(220, 53, 69, 0.2);
          border-color: rgba(220, 53, 69, 0.5);
        }

        .wishlist-btn.loading {
          animation: pulse 1.5s infinite;
        }

        .wishlist-icon {
          transition: all 0.3s ease;
        }

        .wishlist-icon.wish-active {
          animation: heartPulse 0.4s ease-in-out;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #dc3545;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .image-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .primary-image,
        .hover-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.3s ease;
        }

        .primary-image.hidden {
          opacity: 0;
        }

        .hover-image {
          opacity: 0;
        }

        .hover-image.visible {
          opacity: 1;
        }

        .image-skeleton {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .cart-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 20px 12px 12px;
          transform: translateY(100%);
          transition: all 0.3s ease;
          z-index: 2;
        }

        .cart-overlay.show-cart {
          transform: translateY(0);
        }

        .cart-btn {
          width: 100%;
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cart-btn:hover:not(.disabled) {
          background: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .cart-btn.disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .cart-icon {
          width: 14px;
          height: 14px;
        }

        .product-info {
          padding: 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .product-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.3;
          color: #333;
        }

        .product-title a {
          text-decoration: none;
          color: inherit;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-title a:hover {
          color: #007bff;
        }

        .model-name,
        .store-name {
          margin: 0;
          font-size: 12px;
          color: #666;
          font-style: italic;
        }

        .store-name {
          color: #007bff;
          font-weight: 500;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .product-price {
          font-size: 16px;
          font-weight: 700;
          color: #28a745;
        }

        .original-price {
          font-size: 13px;
          color: #666;
          text-decoration: line-through;
        }

        .savings {
          font-size: 11px;
          color: #28a745;
          font-weight: 600;
          background: #d4edda;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .rating {
          display: flex;
          gap: 1px;
        }

        .star {
          width: 12px;
          height: 12px;
          color: #ddd;
          fill: #ddd;
        }

        .star.star-filled {
          color: #ffc107;
          fill: #ffc107;
        }

        .rating-text {
          font-size: 11px;
          color: #666;
          font-weight: 500;
        }

        .low-stock {
          font-size: 10px;
          color: #dc3545;
          font-weight: 600;
          background: #fff5f5;
          padding: 3px 8px;
          border-radius: 10px;
          text-align: center;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .product-card {
            border-radius: 10px;
          }

          .wishlist {
            opacity: 1;
            transform: translateY(0);
          }

          .wishlist-btn {
            width: 30px;
            height: 30px;
          }

          .wishlist-icon {
            width: 14px;
            height: 14px;
          }

          .loading-spinner {
            width: 14px;
            height: 14px;
          }

          .cart-overlay {
            background: rgba(0, 0, 0, 0.9);
            padding: 14px 10px 10px;
          }

          .cart-btn {
            padding: 8px 12px;
            font-size: 11px;
          }

          .cart-icon {
            width: 12px;
            height: 12px;
          }

          .product-info {
            padding: 12px;
          }

          .product-title {
            font-size: 14px;
          }

          .model-name,
          .store-name {
            font-size: 11px;
          }

          .product-price {
            font-size: 15px;
          }

          .original-price {
            font-size: 12px;
          }

          .savings {
            font-size: 10px;
          }

          .star {
            width: 10px;
            height: 10px;
          }

          .rating-text {
            font-size: 10px;
          }

          .low-stock {
            font-size: 9px;
          }

          .stock-badge,
          .discount-badge {
            font-size: 9px;
            padding: 3px 6px;
          }
        }

        @media (hover: none) and (pointer: coarse) {
          .cart-overlay {
            position: static;
            background: #f8f9fa;
            transform: none;
            padding: 10px;
            border-top: 1px solid #e9ecef;
          }

          .cart-btn {
            background: #007bff;
            color: white;
            font-size: 11px;
            padding: 10px 14px;
          }

          .wishlist {
            opacity: 1;
            transform: translateY(0);
          }

          .product-card:hover {
            transform: none;
          }

          .product-card:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </>
  )
}
