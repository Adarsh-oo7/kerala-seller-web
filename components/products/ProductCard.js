'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

export default function ProductCard({ product, sellerPhone, onAddToCart }) {
  const [imageError, setImageError] = useState(false);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div style={styles.card}>
      <Link href={`/product/${product.id}`} style={styles.cardLink}>
        <div style={styles.imageContainer}>
          <img 
            src={imageError ? 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image' : (product.main_image_url || 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image')} 
            alt={product.name} 
            style={styles.image}
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {product.online_stock <= 5 && product.online_stock > 0 && (
            <span style={styles.lowStockBadge}>Only {product.online_stock} left</span>
          )}
        </div>
        <div style={styles.cardContent}>
          <h3 style={styles.productName}>{product.name}</h3>
          {product.model_name && (
            <p style={styles.productModel}>{product.model_name}</p>
          )}
          <div style={styles.priceContainer}>
            <span style={styles.productPrice}>{formatPrice(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span style={styles.originalPrice}>{formatPrice(product.mrp)}</span>
                <span style={styles.discount}>
                  {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                </span>
              </>
            )}
          </div>
          {product.average_rating && (
            <div style={styles.ratingContainer}>
              <Star size={14} fill="#ffc107" color="#ffc107" />
              <span style={styles.rating}>
                {product.average_rating.toFixed(1)} ({product.review_count || 0})
              </span>
            </div>
          )}
        </div>
      </Link>
      <div style={styles.cardActions}>
        <button 
          onClick={(e) => onAddToCart(e, product)} 
          style={{
            ...styles.addToCartButton,
            ...(product.online_stock === 0 ? styles.outOfStockButton : {})
          }}
          disabled={product.online_stock === 0}
        >
          {product.online_stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: { 
    border: '1px solid #e9ecef', 
    borderRadius: '12px', 
    overflow: 'hidden', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
    display: 'flex', 
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardLink: { 
    textDecoration: 'none', 
    color: 'inherit',
    display: 'block'
  },
  imageContainer: {
    position: 'relative'
  },
  image: { 
    width: '100%', 
    height: '220px', 
    objectFit: 'cover', 
    backgroundColor: '#f8f9fa'
  },
  lowStockBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#dc3545',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  cardContent: { 
    padding: '16px', 
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  productName: { 
    margin: 0, 
    fontSize: '1.1rem', 
    fontWeight: '600',
    color: '#212529',
    lineHeight: '1.3'
  },
  productModel: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#6c757d'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  productPrice: { 
    fontSize: '1.25rem', 
    fontWeight: 'bold', 
    color: '#28a745'
  },
  originalPrice: {
    fontSize: '1rem',
    color: '#6c757d',
    textDecoration: 'line-through'
  },
  discount: {
    fontSize: '0.8rem',
    background: '#28a745',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600'
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  rating: {
    fontSize: '0.9rem',
    color: '#6c757d'
  },
  cardActions: { 
    padding: '0 16px 16px 16px' 
  },
  addToCartButton: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: '#0d6efd', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '1rem', 
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  outOfStockButton: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  }
};
