// app/profile/wishlist/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft, Trash2, ShoppingCart, Star } from 'lucide-react';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load wishlist from localStorage (you can replace this with API call later)
    const loadWishlist = () => {
      try {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlistItems(JSON.parse(savedWishlist));
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <button onClick={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} />
            <span style={styles.backText}>Back</span>
          </button>
          <h1 style={styles.headerTitle}>My Wishlist</h1>
          <div style={styles.wishlistCount}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </header>

      <div style={styles.container}>
        {wishlistItems.length === 0 ? (
          <div style={styles.emptyState}>
            <Heart size={64} style={styles.emptyIcon} />
            <h2 style={styles.emptyTitle}>Your wishlist is empty</h2>
            <p style={styles.emptyDesc}>Add products to your wishlist to save them for later</p>
            <Link href="/" style={styles.browseButton}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={styles.wishlistGrid}>
            {wishlistItems.map((product) => (
              <div key={product.id} style={styles.wishlistItem}>
                <Link href={`/product/${product.id}`} style={styles.productLink}>
                  <div style={styles.imageContainer}>
                    <img 
                      src={product.main_image_url || product.image || '/placeholder.svg'} 
                      alt={product.name}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.src = '/placeholder.svg';
                      }}
                    />
                    {product.online_stock === 0 && (
                      <div style={styles.outOfStockBadge}>Out of Stock</div>
                    )}
                  </div>
                  
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    {product.model_name && (
                      <p style={styles.modelName}>{product.model_name}</p>
                    )}
                    
                    <div style={styles.priceRow}>
                      <span style={styles.currentPrice}>{formatPrice(product.price)}</span>
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
                      <div style={styles.ratingRow}>
                        <Star size={14} fill="#ffc107" color="#ffc107" />
                        <span style={styles.rating}>
                          {product.average_rating.toFixed(1)} ({product.review_count || 0})
                        </span>
                      </div>
                    )}
                    
                    {product.store?.name && (
                      <p style={styles.storeName}>by {product.store.name}</p>
                    )}
                  </div>
                </Link>

                <div style={styles.actions}>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    style={styles.removeButton}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  {product.online_stock > 0 && (
                    <button style={styles.addToCartButton}>
                      <ShoppingCart size={16} />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px'
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '8px',
    cursor: 'pointer'
  },
  
  backText: {
    display: 'none',
    '@media (min-width: 640px)': {
      display: 'inline'
    }
  },
  
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  
  wishlistCount: {
    fontSize: '14px',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: '500'
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },

  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    maxWidth: '400px',
    margin: '0 auto'
  },
  
  emptyIcon: {
    color: '#cbd5e1',
    marginBottom: '24px'
  },
  
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px'
  },
  
  emptyDesc: {
    color: '#64748b',
    marginBottom: '32px',
    lineHeight: '1.5'
  },
  
  browseButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },

  wishlistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px'
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px'
    }
  },

  wishlistItem: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative'
  },

  productLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
  },

  imageContainer: {
    position: 'relative',
    aspectRatio: '1',
    overflow: 'hidden'
  },

  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  outOfStockBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },

  productInfo: {
    padding: '12px'
  },

  productName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 6px 0',
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  modelName: {
    fontSize: '12px',
    color: '#64748b',
    margin: '0 0 8px 0'
  },

  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '8px'
  },

  currentPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#059669'
  },

  originalPrice: {
    fontSize: '12px',
    color: '#64748b',
    textDecoration: 'line-through'
  },

  discount: {
    fontSize: '10px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '2px 4px',
    borderRadius: '4px',
    fontWeight: '600'
  },

  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '6px'
  },

  rating: {
    fontSize: '12px',
    color: '#64748b'
  },

  storeName: {
    fontSize: '11px',
    color: '#059669',
    margin: 0,
    fontWeight: '500'
  },

  actions: {
    padding: '8px 12px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #f1f5f9'
  },

  removeButton: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#fee2e2'
    }
  },

  addToCartButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};
