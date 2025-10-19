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
  className,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  isWishlistLoading = false,
  onlineStock = 1,
  storeName,
  modelName,
  sellerPhone,
  // ✅ NEW: Enhanced image props from enhanced serializers
  thumbnailUrl,
  largeImageUrl,
  cloudinaryUrl,
  imageMetadata,
  hasDiscount,
  discountPercentage,
  isInStock,
  canBePurchasedOnline
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
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

    // Use enhanced stock checking
    const stockCheck = canBePurchasedOnline !== undefined ? canBePurchasedOnline : (onlineStock > 0)

    if (!stockCheck) {
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
          // ✅ ENHANCED: Use best available image URL
          main_image_url: getBestImageUrl(),
          image_url: getBestImageUrl(),
          thumbnail_url: thumbnailUrl || getBestImageUrl('thumbnail'),
          online_stock: onlineStock,
          seller_phone: sellerPhone,
          store: storeName ? { name: storeName } : null,
          model_name: modelName,
          average_rating: rating,
          review_count: reviewCount,
          // ✅ NEW: Enhanced product data
          has_discount: hasDiscount,
          discount_percentage: discountPercentage,
          is_in_stock: isInStock,
          can_be_purchased_online: canBePurchasedOnline,
          image_metadata: imageMetadata
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

  // ✅ ENHANCED: Use API-provided discount or calculate fallback
  const getDiscountPercentage = () => {
    // Use API-provided discount percentage if available
    if (discountPercentage !== undefined && discountPercentage > 0) {
      return Math.round(discountPercentage)
    }

    // Fallback to manual calculation
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

  // ✅ SMART: Get best available image URL with multiple fallbacks
  const getBestImageUrl = (size = 'default') => {
    // Priority order: Cloudinary optimized > thumbnailUrl > primaryImage > placeholder

    if (size === 'thumbnail' && thumbnailUrl) {
      return thumbnailUrl
    }

    if (size === 'large' && largeImageUrl) {
      return largeImageUrl
    }

    // For default size, prefer optimized URLs
    if (thumbnailUrl && size === 'default') {
      return thumbnailUrl
    }

    if (primaryImage) {
      return getImageUrl(primaryImage)
    }

    return "/placeholder.svg"
  }

  // ✅ Enhanced image URL handling with Cloudinary support
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.svg"

    // ✅ CLOUDINARY: If it's already a Cloudinary URL, use it directly
    if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
      return imageUrl
    }

    // ✅ Handle local media URLs
    if (imageUrl.startsWith('/media/') || imageUrl.startsWith('/static/')) {
      return `${getApiBaseUrl()}${imageUrl}`
    }

    // ✅ Handle full URLs
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }

    // ✅ Handle relative URLs
    if (imageUrl.startsWith('/')) {
      return `${getApiBaseUrl()}${imageUrl}`
    }

    return imageUrl || "/placeholder.svg"
  }

  // ✅ ENHANCED: Smart image error handling with multiple fallbacks
  const handleImageError = (e) => {
    if (imageError) return // Prevent infinite loop

    setImageError(true)

    // Try fallback URLs in order
    const fallbacks = [
      primaryImage && getImageUrl(primaryImage),
      thumbnailUrl,
      cloudinaryUrl,
      "/placeholder.svg"
    ].filter(Boolean)

    let currentSrc = e.target.src
    let nextFallback = null

    for (let i = 0; i < fallbacks.length; i++) {
      if (fallbacks[i] === currentSrc && i < fallbacks.length - 1) {
        nextFallback = fallbacks[i + 1]
        break
      }
    }

    if (nextFallback && nextFallback !== currentSrc) {
      console.warn(`Failed to load image for product ${id}, trying fallback:`, nextFallback)
      e.target.src = nextFallback
    } else {
      console.warn(`All image fallbacks failed for product ${id}, using placeholder`)
      e.target.src = "/placeholder.svg"
    }
  }

  // ✅ ENHANCED: Determine stock status
  const getStockStatus = () => {
    if (canBePurchasedOnline === false) return 'unavailable'
    if (isInStock === false || onlineStock === 0) return 'out-of-stock'
    if (onlineStock <= 3) return 'low-stock'
    return 'in-stock'
  }

  const stockStatus = getStockStatus()
  const discount = getDiscountPercentage()
  const isWishlistCurrentlyLoading = isWishlistLoading || localWishlistLoading

  return (
    <>
      <div
        className={`product-card ${className || ""} ${stockStatus}`}
        data-product-id={id}
        onMouseEnter={() => !touchStarted && setIsHovered(true)}
        onMouseLeave={() => !touchStarted && setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="image-container">
          {/* ✅ ENHANCED: Stock badges */}
          {stockStatus === 'out-of-stock' && (
            <div className="stock-badge out-of-stock">
              Out of Stock
            </div>
          )}

          {stockStatus === 'unavailable' && (
            <div className="stock-badge unavailable">
              <Ban size={16} />
              Not Available
            </div>
          )}

          {/* ✅ ENHANCED: Use API-provided discount */}
          {discount && (
            <div className="discount-badge">
              {discount}% OFF
            </div>
          )}

          {stockStatus === 'low-stock' && (
            <div className="low-stock-badge">
              Only {onlineStock} left!
            </div>
          )}

          {/* ✅ ENHANCED: Optimized badge for Cloudinary images */}
          {imageMetadata?.optimized && (
            <div className="optimized-badge" title="Fast loading optimized image">
              ⚡
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
                src={getBestImageUrl()}
                alt={title || 'Product'}
                className={`primary-image ${imageLoaded ? 'loaded' : ''}`}
                onLoad={() => {
                  setImageLoaded(true)
                  setImageError(false)
                }}
                onError={handleImageError}
                loading="lazy"
                // ✅ ENHANCED: Add responsive image attributes
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />

              {!imageLoaded && !imageError && (
                <div className="image-skeleton">
                  <div className="skeleton-shimmer"></div>
                </div>
              )}

              {/* ✅ NEW: Hover effect with large image */}
              {isHovered && largeImageUrl && largeImageUrl !== getBestImageUrl() && (
                <img
                  src={largeImageUrl}
                  alt={`${title} - detailed view`}
                  className="hover-image"
                  loading="lazy"
                />
              )}
            </div>
          </Link>

          <div style={styles.ratingOverlay}>
            <div style={styles.ratingLeft}>
              {[1].map((star) => (
                <Star
                  key={star}
                  className="star"
                  fill={rating && star <= Math.floor(rating) ? "#FFC107" : "none"} // filled if rated
                  stroke="#FFC107" // always outline
                  size={12}
                />
              ))}

              {/* Show rating number only if rating exists */}
              {rating > 0 && (
                <span style={styles.ratingLeftText}>({rating.toFixed(1)})</span>
              )}
            </div>

            <span style={styles.ratingRight}>
              {reviewCount > 0 ? `${reviewCount} reviews` : 'No reviews'}
            </span>
          </div>





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
                  </>
                )}
              </div>
            </div>

            <div className="cart-section">
              <button
                className={`cart-btn ${stockStatus !== 'in-stock' && stockStatus !== 'low-stock' ? "disabled" : ""}`}
                onClick={handleAddToCart}
                disabled={stockStatus === 'out-of-stock' || stockStatus === 'unavailable'}
                type="button"
              >
                <ShoppingCart className="cart-icon" />
                <span className="cart-text">
                  {stockStatus === 'in-stock' || stockStatus === 'low-stock'
                    ? "ADD TO CART"
                    : stockStatus === 'unavailable'
                      ? "NOT AVAILABLE"
                      : "OUT OF STOCK"
                  }
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Debug info in development */}
        {/* {process.env.NODE_ENV === 'development' && imageMetadata && (
          <div className="debug-info" style={{ fontSize: '10px', opacity: 0.5, position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '2px' }}>
            {imageMetadata.optimized ? '⚡' : '📁'} 
            {imageMetadata.has_cloudinary ? 'C' : 'L'}
            {imageMetadata.sub_images_count > 0 && ` +${imageMetadata.sub_images_count}`}
          </div>
        )} */}
      </div>
    </>
  )
}


const styles = {


  // ✅ Rating overlay (existing) - on image
  ratingOverlay: {
    position: "absolute",
    bottom: "0px",
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
}
