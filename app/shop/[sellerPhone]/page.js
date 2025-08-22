'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, User, Star, Heart } from 'lucide-react';
import WhatsAppButton from '../../../components/common/WhatsAppButton';

// --- Store-Specific Header Component ---
function StoreHeader({ store }) {
  const { getCartBySeller } = useCart();
  const cartItems = getCartBySeller(store.seller_phone);
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('buyerAccessToken'));
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.headerContainer}>
        <Link href={`/shop/${store.seller_phone}`} style={styles.storeBrand}>
          <img 
            src={store.logo_url || 'https://placehold.co/60x60/ffffff/6c757d?text=Logo'} 
            alt={`${store.name} logo`} 
            style={styles.headerLogo}
            onError={(e) => {
              e.target.src = 'https://placehold.co/60x60/ffffff/6c757d?text=Logo';
            }}
          />
          <span style={styles.headerStoreName}>{store.name}</span>
        </Link>
        <div style={styles.headerActions}>
          <Link href={`/cart/${store.seller_phone}`} style={styles.actionButton}>
            <ShoppingCart size={20} />
            {cartItemCount > 0 && <span style={styles.cartBadge}>{cartItemCount}</span>}
          </Link>
          {isLoggedIn ? (
            <Link href="/profile" style={styles.actionButton}>
              <User size={20} />
            </Link>
          ) : (
            <Link href="/login/buyer" style={styles.loginButton}>Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}

// --- Product Card Component ---
function ProductCard({ product, sellerPhone, onAddToCart }) {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

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
            onError={handleImageError}
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

// --- Main Storefront Page Component ---
export default function SellerStorefrontPage() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const { sellerPhone } = params;
  const { addToCart } = useCart();

  useEffect(() => {
    if (!sellerPhone) return;
    
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`http://localhost:8000/shop/${sellerPhone}/`);
        
        console.log('🔍 API Response:', response.data); // Debug log
        
        setStore(response.data.store);
        setProducts(response.data.products);
      } catch (error) {
        console.error("Store fetch error:", error);
        setError(error.response?.data?.error || 'Store not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [sellerPhone]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.online_stock > 0) {
      addToCart(sellerPhone, product);
      // Optional: Show success toast/notification here
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading store...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Store Not Found</h2>
        <p>{error}</p>
        <Link href="/shops" style={styles.backButton}>
          Browse All Stores
        </Link>
      </div>
    );
  }

  // No store found
  if (!store) {
    return (
      <div style={styles.errorContainer}>
        <h2>Store Not Available</h2>
        <p>This store could not be found or is currently unavailable.</p>
        <Link href="/shops" style={styles.backButton}>
          Browse All Stores
        </Link>
      </div>
    );
  }

  return (
    <div>
      <StoreHeader store={store} />
      
      {/* Store Banner */}
      <div style={styles.bannerContainer}>
        <img 
          src={store.banner_image_url || 'https://placehold.co/1200x200/e9ecef/6c757d?text=Store+Banner'} 
          alt={`${store.name} banner`} 
          style={styles.banner}
          onError={(e) => {
            e.target.src = 'https://placehold.co/1200x200/e9ecef/6c757d?text=Store+Banner';
          }}
        />
        <div style={styles.storeInfo}>
          <h1 style={styles.storeName}>{store.name}</h1>
          {store.description && (
            <p style={styles.storeDescription}>{store.description}</p>
          )}
          {store.tagline && (
            <p style={styles.storeTagline}>{store.tagline}</p>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Our Products</h2>
          <p style={styles.productCount}>
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {products.length > 0 ? (
          <div style={styles.grid}>
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                sellerPhone={sellerPhone}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <h3>No Products Available</h3>
            <p>This seller has no products available online yet.</p>
          </div>
        )}
      </div>

      {/* Floating WhatsApp Button */}
      {store.whatsapp_number && (
        <WhatsAppButton phoneNumber={store.whatsapp_number} />
      )}
    </div>
  );
}

// Enhanced Styles
const styles = {
  // Header Styles
  header: { 
    backgroundColor: '#fff', 
    borderBottom: '1px solid #e9ecef', 
    padding: '15px 20px', 
    position: 'sticky', 
    top: 0, 
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  headerContainer: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  storeBrand: { 
    display: 'flex', 
    alignItems: 'center', 
    textDecoration: 'none', 
    color: 'inherit' 
  },
  headerLogo: { 
    width: '50px', 
    height: '50px', 
    borderRadius: '50%', 
    objectFit: 'cover', 
    marginRight: '15px',
    border: '2px solid #e9ecef'
  },
  headerStoreName: { 
    fontSize: '1.5rem', 
    fontWeight: 'bold',
    color: '#212529'
  },
  headerActions: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px' 
  },
  actionButton: { 
    position: 'relative', 
    color: '#212529',
    padding: '8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  cartBadge: { 
    position: 'absolute', 
    top: '-8px', 
    right: '-8px', 
    backgroundColor: '#dc3545', 
    color: 'white', 
    borderRadius: '50%', 
    width: '18px', 
    height: '18px', 
    fontSize: '0.75rem', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  loginButton: { 
    padding: '8px 15px', 
    backgroundColor: '#0d6efd', 
    color: 'white', 
    textDecoration: 'none', 
    borderRadius: '5px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },

  // Banner Styles
  bannerContainer: {
    position: 'relative',
    marginBottom: '40px'
  },
  banner: { 
    width: '100%', 
    height: '250px', 
    objectFit: 'cover', 
    backgroundColor: '#e9ecef'
  },
  storeInfo: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    maxWidth: '600px'
  },
  storeName: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0'
  },
  storeDescription: {
    fontSize: '1.1rem',
    margin: '0 0 5px 0',
    opacity: 0.9
  },
  storeTagline: {
    fontSize: '1rem',
    margin: 0,
    fontStyle: 'italic',
    opacity: 0.8
  },

  // Page Styles
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '0 20px 40px 20px' 
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  sectionTitle: { 
    fontSize: '2rem', 
    fontWeight: 'bold',
    color: '#212529',
    margin: 0
  },
  productCount: {
    color: '#6c757d',
    margin: 0,
    fontSize: '0.9rem'
  },

  // Product Grid
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: '24px' 
  },

  // Product Card
  card: { 
    border: '1px solid #e9ecef', 
    borderRadius: '12px', 
    overflow: 'hidden', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
    display: 'flex', 
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
    }
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

  // Actions
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
  },

  // Loading and Error States
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0d6efd',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backButton: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#0d6efd',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    marginTop: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px'
  }
};
