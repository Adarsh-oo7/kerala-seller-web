"use client"

import { useState } from "react"

export default function ProductCard({
  title,
  image,
  rating = 5,
  currentPrice,
  originalPrice,
  inStock = true,
}) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted)
  }

  const handleAddToCart = () => {
    if (!inStock) return
    alert(`${title} added to cart!`)
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} style={{ color: index < rating ? "#fbbf24" : "#e5e7eb" }}>
        ★
      </span>
    ))
  }

  return (
    <div className={`product-card ${!inStock ? "out-of-stock" : ""}`}>
      <div className="image-container">
        <img
          src={image || "/assets/images/Untitled (822 x 660 px).png"}
          alt={title}
          className="product-image"
        />
        {!inStock && <div className="out-of-stock-overlay">Out of Stock</div>}

        <div className="overlay-content">
          <h3 className="product-title">{title}</h3>
          <div className="rating-container">
            <div className="stars">{renderStars(rating)}</div>
          </div>
          <div className="price-cart">
            <div className="price-info">
              <span className="current-price">₹{currentPrice}</span>
              <span className="original-price">₹{originalPrice}</span>
            </div>
            <div className="action-icons">
              <button className="icon-button" onClick={handleWishlistClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <button className="icon-button" onClick={handleAddToCart}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
