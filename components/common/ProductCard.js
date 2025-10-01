"use client"

import { useState, useEffect } from "react"
import { Heart, Star, ShoppingCart, Ban } from "lucide-react"
import Link from "next/link"
import "../../styles/ProductCard.css";

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

          {onlineStock > 0 && onlineStock <= 3 && (
            <div className="low-stock-badge">
              Only {onlineStock} left!
            </div>
          )}

          <div className="wishlist show">
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
                className={`primary-image `}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  console.warn(`Failed to load primary image for product ${id}:`, primaryImage)
                  e.target.src = "/placeholder.svg"
                }}
                loading="lazy"
              />

              {!imageLoaded && (
                <div className="image-skeleton"></div>
              )}
            </div>
          </Link>

          {rating && rating > 0 && (
            <div className="rating-overlay">
              <div className="rating">
                {[1].map((star) => (
                  <Star
                    key={star}
                    className={`star ${star <= Math.floor(rating) ? "star-filled" : ""}`}
                  />
                ))}
              </div>
              <span className="rating-text">
                ({rating.toFixed(1)})
                {reviewCount > 0 && <span>{reviewCount} reviews</span>}
              </span>

            </div>
          )}

        </div>

        <div className="product-info">
          <div className="product-left">
            <h3 className="product-title">
              <Link href={getProductUrl()}>
                {title || 'Product'} {modelName && <span className="model-name">({modelName})</span>}
              </Link>
            </h3>

            <div className="product-meta">
              {storeName && (
                <p className="store-name">by {storeName}</p>
              )}

              <div className="price-row">
                <span className="product-price">{formatPrice(price)}</span>
                {mrp && parseFloat(mrp) > parseFloat(price) && (
                  <>
                    <span className="original-price">{formatPrice(mrp)}</span>
                    {/* <span className="savings">Save {formatPrice(parseFloat(mrp) - parseFloat(price))}</span> */}
                  </>)}
              </div>
            </div>

            <div className="cart-section">
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

          {/* <div className="product-right"> */}

          {/* </div> */}
        </div>
      </div>

    </>
  )
}


