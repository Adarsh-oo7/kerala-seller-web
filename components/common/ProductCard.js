"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Heart, Star, ShoppingCart, Ban } from "lucide-react"
import Link from "next/link"
import "../../styles/ProductCard.css";
import {
  firstProductImage,
  isPlaceholderImage,
  nextProductImage,
  PRODUCT_PLACEHOLDER,
  productImageCandidates,
} from "../../app/lib/productImage";

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
  // ✅ Enhanced image props from enhanced serializers
  thumbnailUrl,
  largeImageUrl,
  cloudinaryUrl,
  imageMetadata,
  hasDiscount,
  discountPercentage,
  isInStock,
  canBePurchasedOnline,
  subImages,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [touchStarted, setTouchStarted] = useState(false)
  const [wishlistState, setWishlistState] = useState(isWishlisted)
  const [localWishlistLoading, setLocalWishlistLoading] = useState(false)
  const imageCandidates = useMemo(
    () => productImageCandidates({
      cloudinary_url: cloudinaryUrl,
      main_image_url: primaryImage,
      thumbnail_url: thumbnailUrl,
      large_image_url: largeImageUrl,
      sub_images: subImages,
    }),
    [cloudinaryUrl, primaryImage, thumbnailUrl, largeImageUrl, subImages],
  )
  const [displaySrc, setDisplaySrc] = useState(imageCandidates[0] || PRODUCT_PLACEHOLDER)
  const failedImages = useRef(new Set())
  const imageSettled = useRef(false)
  const candidatesRef = useRef(imageCandidates)
  const productIdRef = useRef(id)
  candidatesRef.current = imageCandidates

  useEffect(() => {
    if (productIdRef.current === id) return
    productIdRef.current = id
    imageSettled.current = false
    failedImages.current = new Set()
    setDisplaySrc(imageCandidates[0] || PRODUCT_PLACEHOLDER)
    setImageLoaded(false)
    setImageError(false)
  }, [id, imageCandidates])

  // ✅ Sync with parent state
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

  // ✅ Wishlist handler
  const handleWishlistToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isWishlistLoading || localWishlistLoading) {
      return
    }

    if (onToggleWishlist) {
      await onToggleWishlist(id);
    }
  }

  // ✅ FIXED: Enhanced add to cart with Cloudinary URL priority
  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const stockCheck = canBePurchasedOnline !== undefined ? canBePurchasedOnline : (onlineStock > 0)

    if (!stockCheck) {
      console.warn(' Attempted to add out-of-stock item to cart')
      return
    }

    try {
      if (onAddToCart) {
        const productData = {
          id: parseInt(id),
          name: title,
          price: parseFloat(price) || 0,
          mrp: mrp ? parseFloat(mrp) : null,
          // ✅ FIXED: Cloudinary URL gets HIGHEST priority
          main_image_url: cloudinaryUrl || firstProductImage({
            cloudinary_url: cloudinaryUrl,
            main_image_url: primaryImage,
            thumbnail_url: thumbnailUrl,
            large_image_url: largeImageUrl,
            sub_images: subImages,
          }),
          image_url: cloudinaryUrl || firstProductImage({
            cloudinary_url: cloudinaryUrl,
            main_image_url: primaryImage,
            thumbnail_url: thumbnailUrl,
            sub_images: subImages,
          }),
          thumbnail_url: thumbnailUrl || cloudinaryUrl || getBestImageUrl('thumbnail'),
          online_stock: onlineStock,
          seller_phone: sellerPhone,
          store: storeName ? { name: storeName } : null,
          model_name: modelName,
          average_rating: rating,
          review_count: reviewCount,
          has_discount: hasDiscount,
          discount_percentage: discountPercentage,
          is_in_stock: isInStock,
          can_be_purchased_online: canBePurchasedOnline,
          image_metadata: imageMetadata,
          cloudinary_url: cloudinaryUrl // ✅ Include for future use
        }

        console.log(' Adding to cart with Cloudinary URL:', productData)
        await onAddToCart(e, productData)
      }
    } catch (error) {
      console.error(' Add to cart error:', error)
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

  // ✅ Use API-provided discount
  const getDiscountPercentage = () => {
    if (discountPercentage !== undefined && discountPercentage > 0) {
      return Math.round(discountPercentage)
    }

    const numPrice = parseFloat(price) || 0
    const numMrp = parseFloat(mrp) || 0

    if (numMrp && numMrp > numPrice) {
      return Math.round(((numMrp - numPrice) / numMrp) * 100)
    }
    return null
  }

  // ✅ Enhanced product URL
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

  // ✅ FIXED: Cloudinary gets HIGHEST priority
  const getBestImageUrl = (size = 'default') => {
    if (size === 'thumbnail') {
      return thumbnailUrl || displaySrc || PRODUCT_PLACEHOLDER
    }
    return displaySrc || PRODUCT_PLACEHOLDER
  }

  const handleImageError = (e) => {
    const img = e.currentTarget
    if (imageSettled.current || isPlaceholderImage(img.src)) {
      imageSettled.current = true
      img.onerror = null
      if (!isPlaceholderImage(img.src)) img.src = PRODUCT_PLACEHOLDER
      setImageLoaded(true)
      setImageError(true)
      return
    }

    const next = nextProductImage(candidatesRef.current, failedImages.current, img.src)
    if (!next) {
      imageSettled.current = true
      img.onerror = null
      img.src = PRODUCT_PLACEHOLDER
      setDisplaySrc(PRODUCT_PLACEHOLDER)
      setImageLoaded(true)
      setImageError(true)
      return
    }

    img.src = next
    setDisplaySrc(next)
  }

  // ✅ Determine stock status
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
          {/* Stock badges */}
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

          {/* Discount badge */}
          {discount > 0 && (
            <div className="discount-badge">
              {discount}% OFF
            </div>
          )}


          {stockStatus === 'low-stock' && (
            <div className="low-stock-badge">
              Only {onlineStock} left!
            </div>
          )}

          {/* ✅ Optimized badge for Cloudinary images */}
          {cloudinaryUrl && !imageError && !isPlaceholderImage(displaySrc) && (
            <div className="optimized-badge" title="Fast loading Cloudinary image">
              ☁️
            </div>
          )}

          {/* Wishlist button */}
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

          {/* Product image */}
          <Link href={getProductUrl()} className="image-link">
            <div className="image-wrapper">
              <img
                src={displaySrc}
                alt={title || 'Product'}
                className={`primary-image ${imageLoaded || imageError ? 'loaded' : ''}`}
                onLoad={() => {
                  setImageLoaded(true)
                }}
                onError={handleImageError}
                loading="lazy"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />

              {!imageLoaded && !imageError && (
                <div className="image-skeleton">
                  <div className="skeleton-shimmer"></div>
                </div>
              )}

              {isHovered && !imageError && largeImageUrl && largeImageUrl !== displaySrc && (
                <img
                  src={largeImageUrl}
                  alt={`${title} - detailed view`}
                  className="hover-image"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
            </div>
          </Link>

          {/* Rating overlay */}
          <div style={styles.ratingOverlay}>
            <div style={styles.ratingLeft}>
              {[1].map((star) => (
                <Star
                  key={star}
                  className="star"
                  fill={rating && star <= Math.floor(rating) ? "#FFC107" : "none"}
                  stroke="#FFC107"
                  size={12}
                />
              ))}

              {rating > 0 && (
                <span style={styles.ratingLeftText}>({rating.toFixed(1)})</span>
              )}
            </div>

            <span style={styles.ratingRight}>
              {reviewCount > 0 ? `${reviewCount} reviews` : 'No reviews'}
            </span>
          </div>
        </div>

        {/* Product info */}
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
      </div>
    </>
  )
}

const styles = {
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
