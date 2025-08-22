"use client"

import { useState } from "react"
import { Heart, Star } from "lucide-react"
import Link from "next/link"

export default function ProductCard({
  id,
  title,
  price,
  rating = 4.5,
  primaryImage,
  hoverImage,
  className,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  onlineStock = 1, // 👈 add stock check
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`product-card ${className || ""} ${onlineStock === 0 ? "out-of-stock" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="image-container">
        {/* Wishlist Button */}
        <div className={`wishlist ${isHovered ? "show" : ""}`}>
          <button
            className={`wishlist-btn ${isWishlisted ? "wish-active" : ""}`}
            onClick={() => onToggleWishlist?.(id)}
          >
            <Heart
              className={`wishlist-icon ${isWishlisted ? "wish-active" : ""}`}
            />
          </button>
        </div>

        {/* Product Images wrapped in Link */}
        <Link href={`/product/${id}`}>
          <img
            src={primaryImage || "/placeholder.svg"}
            alt={title}
            className={`primary-image ${isHovered ? "hidden" : ""}`}
          />
          <img
            src={hoverImage || "/placeholder.svg"}
            alt={`${title} - alternate view`}
            className={`hover-image ${isHovered ? "visible" : ""}`}
          />
        </Link>

        {/* Add to Cart */}
        {/* Add to Cart */}
        <div className={`cart-overlay ${isHovered ? "show-cart" : ""}`}>
          <button
            className="cart-btn"
            onClick={onAddToCart}
            disabled={onlineStock === 0}
          >
            {onlineStock > 0 ? "ADD TO CART" : "OUT OF STOCK"}
          </button>

        </div>

      </div>

      {/* Info */}
      <div className="product-info">
        <h3 className="Product-title">
          <Link href={`/product/${id}`}>{title}</Link>
        </h3>
        <div className="rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`star ${star <= Math.floor(rating) ? "star-filled" : ""}`}
            />
          ))}
          <span className="rating-text">({rating})</span>
        </div>
        <div className="product-price">₹{price.toLocaleString()}</div>
      </div>
    </div>
  )
}
