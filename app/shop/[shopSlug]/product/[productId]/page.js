'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../../context/CartContext';
import SHeader from '../../../../../components/common/SHeader';
import Footer from '../../../../../components/common/Footer';
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  Share2, 
  ArrowLeft, 
  Store, 
  Package, 
  Truck, 
  Shield, 
  Plus, 
  Minus, 
  RefreshCw, 
  AlertCircle,
  Check,
  MapPin,
  Phone,
  Tag,
  Camera,
  Zap
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

// ✅ Helper function to extract phone from slug or query params
const getSellerPhoneFromSlug = (shopSlug, searchParams) => {
  if (!shopSlug || !searchParams) return null;
  
  // Try to get phone from query params first (for SEO URLs)
  const phoneFromParams = searchParams.get('id');
  if (phoneFromParams) {
    if (process.env.NODE_ENV === 'development') {
      if (/^\d{3,}$/.test(phoneFromParams)) {
        return phoneFromParams;
      }
    } else {
      if (/^[6-9]\d{9}$/.test(phoneFromParams)) {
        return phoneFromParams;
      }
    }
  }
  
  // Check if shopSlug is already a phone number (old URL format)
  if (typeof shopSlug === 'string' && /^[6-9]\d{9}$/.test(shopSlug)) {
    return shopSlug;
  }
  
  // Extract phone from compound slug
  if (typeof shopSlug === 'string') {
    const phoneMatch = shopSlug.match(/[6-9]\d{9}$/);
    if (phoneMatch) {
      return phoneMatch[0];
    }
  }
  
  return null;
};

// ✅ SEO-friendly URL generator
const generateShopSlug = (shop) => {
  if (!shop) return 'shop';
  
  const shopName = (shop.name || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  const location = (shop.seller_address || shop.address || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .split('-')[0];
  
  const slug = location ? `${shopName}-${location}` : shopName;
  return slug.length >= 3 ? slug : `shop-${shop.seller_phone || 'store'}`;
};

// ✅ Image Gallery Component
function ProductImageGallery({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const images = [
    product.main_image_url,
    product.image_2_url,
    product.image_3_url,
    product.image_4_url,
    product.image_5_url
  ].filter(Boolean);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/media/')) {
      return `${getApiBaseUrl()}${url}`;
    }
    return url;
  };

  const currentImage = images[currentImageIndex];

  return (
    <div style={styles.imageGallery}>
      <div style={styles.mainImageContainer}>
        <img
          src={imageError || !currentImage ? 'https://placehold.co/500x500/e9ecef/6c757d?text=No+Image' : getImageUrl(currentImage)}
          alt={product.name || 'Product image'}
          style={styles.mainImage}
          onError={() => setImageError(true)}
        />
        {product.discount_percentage > 0 && (
          <div style={styles.discountBadge}>
            {product.discount_percentage}% OFF
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div style={styles.thumbnailContainer}>
          {images.map((image, index) => (
            <img
              key={index}
              src={getImageUrl(image)}
              alt={`${product.name} ${index + 1}`}
              style={{
                ...styles.thumbnail,
                ...(index === currentImageIndex ? styles.activeThumbnail : {})
              }}
              onClick={() => setCurrentImageIndex(index)}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ Product Info Component
function ProductInfo({ product, store, onAddToCart, isLoading, cartQuantity }) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStockStatus = () => {
    const stock = product.online_stock || 0;
    if (stock === 0) return { status: 'out-of-stock', text: 'Out of Stock', color: '#ef4444' };
    if (stock <= 5) return { status: 'low-stock', text: `Only ${stock} left`, color: '#f59e0b' };
    return { status: 'in-stock', text: 'In Stock', color: '#10b981' };
  };

  const stockInfo = getStockStatus();

  return (
    <div style={styles.productInfo}>
      {/* Store Badge */}
      <div style={styles.storeBadge}>
        <Store size={14} />
        <span>Sold by {store?.name || 'Store'}</span>
      </div>

      {/* Product Title */}
      <h1 style={styles.productTitle}>{product.name || 'Product Name'}</h1>
      
      {product.model_name && (
        <p style={styles.productModel}>Model: {product.model_name}</p>
      )}

      {/* Rating */}
      {product.average_rating && (
        <div style={styles.ratingContainer}>
          <div style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                fill={i < Math.floor(product.average_rating) ? '#fbbf24' : 'none'}
                color="#fbbf24"
              />
            ))}
          </div>
          <span style={styles.ratingText}>
            {product.average_rating.toFixed(1)} ({product.review_count || 0} reviews)
          </span>
        </div>
      )}

      {/* Price */}
      <div style={styles.priceContainer}>
        <span style={styles.currentPrice}>{formatPrice(product.price)}</span>
        {product.mrp && product.mrp > product.price && (
          <>
            <span style={styles.originalPrice}>{formatPrice(product.mrp)}</span>
            <span style={styles.savings}>
              You save {formatPrice(product.mrp - product.price)}
            </span>
          </>
        )}
      </div>

      {/* Stock Status */}
      <div style={styles.stockContainer}>
        <div style={{...styles.stockStatus, color: stockInfo.color}}>
          <Package size={16} />
          <span>{stockInfo.text}</span>
        </div>
      </div>

      {/* Quantity Selector */}
      {stockInfo.status !== 'out-of-stock' && (
        <div style={styles.quantityContainer}>
          <label style={styles.quantityLabel}>Quantity:</label>
          <div style={styles.quantitySelector}>
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.quantityButton}
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span style={styles.quantityValue}>{quantity}</span>
            <button 
              onClick={() => setQuantity(Math.min(product.online_stock, quantity + 1))}
              style={styles.quantityButton}
              disabled={quantity >= product.online_stock}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button
          onClick={() => onAddToCart(quantity)}
          disabled={stockInfo.status === 'out-of-stock' || isLoading}
          style={{
            ...styles.addToCartButton,
            ...(stockInfo.status === 'out-of-stock' ? styles.disabledButton : {})
          }}
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="spinning" />
              Adding...
            </>
          ) : stockInfo.status === 'out-of-stock' ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart size={18} />
              Add to Cart {cartQuantity > 0 && `(${cartQuantity} in cart)`}
            </>
          )}
        </button>
        
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          style={{
            ...styles.wishlistButton,
            ...(isWishlisted ? styles.wishlistActive : {})
          }}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
          {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
        </button>
      </div>

      {/* Product Features */}
      <div style={styles.features}>
        <div style={styles.feature}>
          <Truck size={16} />
          <span>Free delivery across Kerala</span>
        </div>
        <div style={styles.feature}>
          <Shield size={16} />
          <span>Genuine product guarantee</span>
        </div>
        <div style={styles.feature}>
          <RefreshCw size={16} />
          <span>Easy returns & exchanges</span>
        </div>
      </div>
    </div>
  );
}

// ✅ Main Product Page Component
function ShopProductPageContent() {
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { shopSlug, productId } = params;
  
  const sellerPhone = getSellerPhoneFromSlug(shopSlug, searchParams);
  
  const cartContext = useCart();
  const { addToCart, cartItems } = cartContext || { addToCart: null, cartItems: [] };

  // Check login status
  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken') || 
                   localStorage.getItem('access_token') ||
                   localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.warn('localStorage access error:', error);
      setIsLoggedIn(false);
    }
  }, []);

  // Get cart quantity for this product
  const cartQuantity = cartItems?.find(item => 
    item.product_id === parseInt(productId) && item.seller_phone === sellerPhone
  )?.quantity || 0;

  // Generate shop URL for navigation
  const getShopUrl = () => {
    if (!store || !sellerPhone) return `/shop`;
    const shopSlug = generateShopSlug(store);
    return `/shop/${shopSlug}?id=${sellerPhone}`;
  };

  // Fetch product and store data
  useEffect(() => {
    if (!sellerPhone || !productId) {
      setError('Invalid product URL. Please check the link and try again.');
      setIsLoading(false);
      return;
    }

    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔍 Fetching product data:', { sellerPhone, productId });

        // Fetch both product and store data
        const [productRes, storeRes] = await Promise.all([
          axios.get(`${getApiBaseUrl()}/api/products/${productId}/`, { timeout: 15000 }),
          axios.get(`${getApiBaseUrl()}/shop/${sellerPhone}/`, { timeout: 15000 })
        ]);

        console.log('✅ Product data received:', productRes.data);
        console.log('✅ Store data received:', storeRes.data);

        setProduct(productRes.data);
        setStore(storeRes.data.store || storeRes.data);
        
        // Set related products from the same store
        if (storeRes.data.products) {
          const related = storeRes.data.products
            .filter(p => p.id !== parseInt(productId))
            .slice(0, 4);
          setRelatedProducts(related);
        }

      } catch (error) {
        console.error('❌ Failed to fetch product data:', error);
        
        if (error.response?.status === 404) {
          setError('Product not found or not available in this store.');
        } else if (error.code === 'ECONNABORTED') {
          setError('Request timed out. Please check your connection and try again.');
        } else {
          setError('Failed to load product information. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [sellerPhone, productId]);

  // Add to cart handler
  const handleAddToCart = useCallback(async (quantity = 1) => {
    if (!product?.id || product.online_stock <= 0) {
      alert('Product is out of stock');
      return;
    }

    // Check if user is logged in
    if (!isLoggedIn) {
      router.push(`/login/buyer?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!addToCart) {
      alert('Cart service unavailable. Please refresh the page.');
      return;
    }

    try {
      setAddToCartLoading(true);
      
      // Add multiple quantities if needed
      for (let i = 0; i < quantity; i++) {
        await Promise.resolve(addToCart(sellerPhone, product));
      }
      
      console.log('✅ Successfully added to cart:', product.name, 'Quantity:', quantity);
    } catch (error) {
      console.error('❌ Add to cart failed:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddToCartLoading(false);
    }
  }, [addToCart, sellerPhone, product, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <h3>Loading product...</h3>
        <p>Please wait while we fetch product details from this Kerala seller</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>
          <Package size={48} />
        </div>
        <h2>Product Not Found</h2>
        <p>{error || 'This product could not be found in this store.'}</p>
        <div style={styles.errorActions}>
          <Link href={getShopUrl()} style={styles.backToStoreButton}>
            <ArrowLeft size={16} />
            Back to Store
          </Link>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <SHeader store={store} isLoggedIn={isLoggedIn} />
      
      {/* Breadcrumbs */}
      <div style={styles.breadcrumbContainer}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb}>
            <Link href="/" style={styles.breadcrumbLink}>Kerala Sellers</Link>
            <span style={styles.breadcrumbSeparator}>›</span>
            <Link href="/shop" style={styles.breadcrumbLink}>Shops</Link>
            <span style={styles.breadcrumbSeparator}>›</span>
            <Link href={getShopUrl()} style={styles.breadcrumbLink}>
              <Store size={14} />
              {store?.name || 'Store'}
            </Link>
            <span style={styles.breadcrumbSeparator}>›</span>
            <span style={styles.breadcrumbCurrent}>{product.name}</span>
          </nav>
        </div>
      </div>

      <div style={styles.container}>
        {/* Back to Store Button */}
        <Link href={getShopUrl()} style={styles.backButton}>
          <ArrowLeft size={16} />
          Back to {store?.name || 'Store'}
        </Link>

        {/* Product Content */}
        <div style={styles.productContainer}>
          <ProductImageGallery product={product} />
          <ProductInfo 
            product={product} 
            store={store}
            onAddToCart={handleAddToCart}
            isLoading={addToCartLoading}
            cartQuantity={cartQuantity}
          />
        </div>

        {/* Product Description */}
        {product.description && (
          <div style={styles.descriptionContainer}>
            <h2 style={styles.sectionTitle}>Product Description</h2>
            <div style={styles.description}>
              <p>{product.description}</p>
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={styles.relatedContainer}>
            <h2 style={styles.sectionTitle}>More from {store?.name}</h2>
            <div style={styles.relatedGrid}>
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/shop/${shopSlug}/product/${relatedProduct.id}?id=${sellerPhone}`}
                  style={styles.relatedProductCard}
                >
                  <img
                    src={relatedProduct.main_image_url || 'https://placehold.co/200x200/e9ecef/6c757d?text=No+Image'}
                    alt={relatedProduct.name}
                    style={styles.relatedProductImage}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/200x200/e9ecef/6c757d?text=No+Image';
                    }}
                  />
                  <div style={styles.relatedProductInfo}>
                    <h3 style={styles.relatedProductName}>{relatedProduct.name}</h3>
                    <p style={styles.relatedProductPrice}>
                      ₹{relatedProduct.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

// ✅ Main Export with Suspense Boundary
export default function ShopProductPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3>Loading product...</h3>
      </div>
    }>
      <ShopProductPageContent />
    </Suspense>
  );
}

// ✅ Enhanced styles
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
    minHeight: '60vh',
    gap: '20px'
  },

  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px',
    textAlign: 'center',
    padding: '40px'
  },

  errorIcon: {
    color: '#ef4444'
  },

  errorActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },

  backToStoreButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500'
  },

  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500'
  },

  breadcrumbContainer: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '12px 0'
  },

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    flexWrap: 'wrap'
  },

  breadcrumbLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#3b82f6',
    textDecoration: 'none'
  },

  breadcrumbSeparator: {
    color: '#9ca3af'
  },

  breadcrumbCurrent: {
    color: '#6b7280',
    fontWeight: '500'
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },

  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px'
  },

  productContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    marginBottom: '40px',
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },

  // Image Gallery
  imageGallery: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  mainImageContainer: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb'
  },

  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  discountBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },

  thumbnailContainer: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto'
  },

  thumbnail: {
    width: '60px',
    height: '60px',
    borderRadius: '6px',
    objectFit: 'cover',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  activeThumbnail: {
    borderColor: '#3b82f6'
  },

  // Product Info
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  storeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#059669',
    fontSize: '14px',
    fontWeight: '500'
  },

  productTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
    lineHeight: '1.2'
  },

  productModel: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0
  },

  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  stars: {
    display: 'flex',
    gap: '2px'
  },

  ratingText: {
    fontSize: '14px',
    color: '#6b7280'
  },

  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },

  currentPrice: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#059669'
  },

  originalPrice: {
    fontSize: '1.25rem',
    color: '#9ca3af',
    textDecoration: 'line-through'
  },

  savings: {
    fontSize: '14px',
    color: '#059669',
    fontWeight: '500'
  },

  stockContainer: {
    display: 'flex',
    alignItems: 'center'
  },

  stockStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '500'
  },

  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  quantityLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },

  quantitySelector: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    overflow: 'hidden'
  },

  quantityButton: {
    padding: '8px 12px',
    border: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151'
  },

  quantityValue: {
    padding: '8px 16px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#1f2937'
  },

  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  addToCartButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },

  wishlistButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  wishlistActive: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderColor: '#dc2626'
  },

  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },

  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151'
  },

  // Description
  descriptionContainer: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '40px'
  },

  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px'
  },

  description: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.7'
  },

  // Related Products
  relatedContainer: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },

  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },

  relatedProductCard: {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'all 0.2s'
  },

  relatedProductImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover'
  },

  relatedProductInfo: {
    padding: '12px'
  },

  relatedProductName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },

  relatedProductPrice: {
    fontSize: '14px',
    color: '#059669',
    fontWeight: '600',
    margin: 0
  }
};
