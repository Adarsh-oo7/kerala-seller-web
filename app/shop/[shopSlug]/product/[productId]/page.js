'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import "../../../../../styles/Shopslugproduct.css";
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
  Zap,
  User,
  CreditCard
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

// ✅ API URLs
const API_BASE_URL = getApiBaseUrl();
const WISHLIST_API = `${API_BASE_URL}/api/wishlist/`;
const WISHLIST_TOGGLE_API = `${API_BASE_URL}/api/wishlist/toggle_product/`;
const WISHLIST_CHECK_API = `${API_BASE_URL}/api/wishlist/check_product/`;
const BUYER_PROFILE_URL = `${API_BASE_URL}/api/buyer/profile/`;

// ✅ Enhanced auth headers function
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') ||
    localStorage.getItem('buyerAccessToken') ||
    localStorage.getItem('buyerToken') ||
    localStorage.getItem('accessToken');

  return token ? { 'Authorization': `Bearer ${token}` } : null;
};

// ✅ NEW: Razorpay Script Loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
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

// ✅ NEW: Enhanced Review Form Component
function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('buyerAccessToken') ||
                  localStorage.getItem('access_token') ||
                  localStorage.getItem('accessToken');
    if (!token) {
      setError('Please login to submit a review');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/products/${productId}/create-review/`, 
        { rating, comment: comment.trim() }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComment('');
      setRating(5);
      setSuccess('Review submitted successfully!');
      
      setTimeout(() => {
        onReviewSubmitted();
        setSuccess('');
      }, 1500);
      
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div style={styles.reviewForm}>
      <h4 style={styles.reviewFormTitle}>Write Your Review</h4>
      
      {error && <div style={styles.errorMessage}>{error}</div>}
      {success && <div style={styles.successMessage}>{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={styles.ratingSection}>
          <label style={styles.label}>Your Rating:</label>
          <div style={styles.starRatingInput}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={28}
                onClick={() => setRating(star)}
                color={star <= rating ? "#ffc107" : "#e4e5e9"}
                fill={star <= rating ? "#ffc107" : "none"}
                style={styles.starButton}
              />
            ))}
            <span style={styles.ratingText}>({rating}/5 stars)</span>
          </div>
        </div>
        
        <div style={styles.commentSection}>
          <label style={styles.label}>Your Review:</label>
          <textarea 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            placeholder="Share your experience with this product. What did you like or dislike about it?" 
            style={styles.textarea}
            rows={4}
            maxLength={500}
          />
          <small style={styles.charCount}>
            {comment.length}/500 characters (minimum 10 required)
          </small>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting || comment.trim().length < 10}
          style={{
            ...styles.submitButton,
            ...(isSubmitting || comment.trim().length < 10 ? styles.disabledButton : {})
          }}
        >
          {isSubmitting ? (
            <span style={styles.buttonContent}>
              <RefreshCw size={16} className="spinning" />
              Submitting Review...
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  );
}

// ✅ NEW: Enhanced Star Rating Component
function StarRating({ rating = 0, reviewCount = 0, showCount = true }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div style={styles.starContainer}>
      <div style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            color={star <= fullStars || (star === fullStars + 1 && hasHalfStar) ? "#ffc107" : "#e4e5e9"}
            fill={star <= fullStars || (star === fullStars + 1 && hasHalfStar) ? "#ffc107" : "#e4e5e9"}
          />
        ))}
      </div>
      {rating > 0 && (
        <span style={styles.ratingDisplay}>
          {rating.toFixed(1)} out of 5
        </span>
      )}
      {showCount && reviewCount > 0 && (
        <span style={styles.reviewCount}>({reviewCount} reviews)</span>
      )}
    </div>
  );
}

// ✅ NEW: Individual Review Component
function ReviewItem({ review }) {
  return (
    <div style={styles.reviewItem}>
      <div style={styles.reviewHeader}>
        <div style={styles.reviewerInfo}>
          <div style={styles.reviewerAvatar}>
            <User size={16} />
          </div>
          <div>
            <StarRating rating={review.rating} showCount={false} />
            <h5 style={styles.reviewerName}>
              {review.buyer?.full_name || 'Anonymous Customer'}
            </h5>
          </div>
        </div>
        <span style={styles.reviewDate}>
          {new Date(review.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
      <p style={styles.reviewComment}>{review.comment}</p>
    </div>
  );
}

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

// ✅ ENHANCED: Product Info Component with Buy Now + Share
function ProductInfo({ product, store, onAddToCart, isLoading, cartQuantity, isLoggedIn, router }) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // ✅ Check if product is wishlisted on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const headers = getAuthHeaders();
      if (!headers || !product?.id) return;

      try {
        console.log(`🔍 Checking wishlist status for product ${product.id}`);
        const response = await axios.get(`${WISHLIST_CHECK_API}?product_id=${product.id}`, { 
          headers,
          timeout: 5000 
        });
        const isInWishlist = response.data.is_wishlisted || false;
        console.log(`✅ Product ${product.id} wishlist status:`, isInWishlist);
        setIsWishlisted(isInWishlist);
      } catch (error) {
        console.warn('❌ Failed to check wishlist status:', error);
      }
    };

    if (isLoggedIn && product?.id) {
      checkWishlistStatus();
    }
  }, [product?.id, isLoggedIn]);

  // ✅ Wishlist toggle handler
  const handleWishlistToggle = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      const shouldLogin = window.confirm('Please login to add items to your wishlist. Would you like to login now?');
      if (shouldLogin) {
        router.push('/login/buyer');
      }
      return;
    }

    if (isWishlistLoading) {
      console.log('⏳ Wishlist request already in progress for product:', product.id);
      return;
    }

    setIsWishlistLoading(true);
    const previousState = isWishlisted;

    // Optimistic update
    setIsWishlisted(!isWishlisted);

    try {
      console.log('🔄 Toggling wishlist for product:', product.id);

      const response = await axios.post(WISHLIST_TOGGLE_API, {
        product_id: product.id
      }, {
        headers,
        timeout: 10000
      });

      console.log('✅ Wishlist toggle response:', response.data);

      const newWishlistState = response.data.is_wishlisted ?? response.data.wishlisted;
      setIsWishlisted(newWishlistState);

      // Show user feedback
      const action = newWishlistState ? 'added to' : 'removed from';
      console.log(`✅ ${product.name} ${action} wishlist`);

    } catch (error) {
      console.error('❌ Wishlist toggle error:', error);

      // Revert optimistic update
      setIsWishlisted(previousState);

      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('buyerAccessToken');
        alert('Session expired. Please login again.');
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to update wishlist. Please try again.';
        alert(errorMessage);
      }
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // ✅ NEW: Buy Now Handler with Direct Payment
  const handleBuyNow = async () => {
    if (!product) return;

    if (!isLoggedIn) {
      router.push('/login/buyer');
      return;
    }

    setBuyingNow(true);

    try {
      // ✅ Load Razorpay script
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        alert('Payment gateway failed to load. Please try again.');
        setBuyingNow(false);
        return;
      }

      const headers = getAuthHeaders();
      if (!headers) {
        router.push('/login/buyer');
        return;
      }

      // ✅ Get seller phone from store
      const sellerPhone = store?.seller_phone || store?.phone;
      if (!sellerPhone) {
        alert('Store information missing. Cannot process payment.');
        setBuyingNow(false);
        return;
      }

      // ✅ Create order data for single product
      const orderData = {
        seller_phone: sellerPhone,
        items: [{
          id: product.id,
          quantity: quantity,
          name: product.name,
          price: product.price
        }],
        customer_name: 'Customer', // You can get this from user profile
        customer_phone: '', // You can get this from user profile
        shipping_address: "Default Address" // You can enhance this with address selection
      };

      const totalAmount = product.price * quantity;

      console.log('🛒 Creating Razorpay order for Buy Now:', orderData);

      // ✅ Create Razorpay order using existing endpoint
      const createOrderResponse = await axios.post(
        `${API_BASE_URL}/api/orders/create-razorpay-order/`, 
        {
          amount: totalAmount,
          order_data: orderData
        },
        {
          headers,
          timeout: 15000
        }
      );

      const { razorpay_order_id, amount, currency, key } = createOrderResponse.data;

      console.log('✅ Razorpay order created:', createOrderResponse.data);

      // ✅ Configure Razorpay payment options
      const options = {
        key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount, // Amount in paise
        currency: currency,
        name: 'Kerala Sellers',
        description: `Buy Now: ${product.name}`,
        order_id: razorpay_order_id,
        
        // ✅ Payment success handler
        handler: async function (response) {
          console.log('💳 Payment successful:', response);
          
          try {
            // ✅ Use existing payment verification endpoint
            const verifyResponse = await axios.post(
              `${API_BASE_URL}/api/orders/verify-payment-and-create-order/`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_data: orderData
              },
              { headers }
            );

            console.log('✅ Payment verified and order created:', verifyResponse.data);

            // ✅ Show success message
            alert(`🎉 Payment successful! Your order #${verifyResponse.data.order_id} has been placed.`);
            
            // ✅ Redirect to orders page
            router.push('/profile/orders');
            
          } catch (verifyError) {
            console.error('❌ Payment verification failed:', verifyError);
            alert('Payment completed but order creation failed. Please contact support.');
          }
        },
        
        // ✅ Prefill user information
        prefill: {
          name: 'Customer',
          email: '',
          contact: ''
        },
        
        // ✅ Order notes
        notes: {
          product_id: product.id,
          product_name: product.name,
          seller_phone: sellerPhone,
          order_type: 'buy_now'
        },
        
        // ✅ Theme
        theme: {
          color: '#3b82f6'
        },
        
        // ✅ Modal close handler
        modal: {
          ondismiss: function() {
            console.log('💳 Payment cancelled by user');
            setBuyingNow(false);
          }
        }
      };

      // ✅ Open Razorpay payment modal
      const razorpayInstance = new window.Razorpay(options);
      
      // ✅ Handle payment failure
      razorpayInstance.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setBuyingNow(false);
      });

      // ✅ Open the payment modal
      razorpayInstance.open();

    } catch (error) {
      console.error('❌ Buy now error:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('buyerAccessToken');
        alert('Session expired. Please login again.');
        router.push('/login/buyer');
      } else if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Failed to process payment. Please try again.');
      }
      
      setBuyingNow(false);
    }
  };

  // ✅ NEW: Share Handler
  const handleShare = async () => {
    const shareData = {
      title: `${product.name} - ${store?.name || 'Kerala Sellers'}`,
      text: `Check out this amazing product: ${product.name} for just ₹${product.price?.toLocaleString('en-IN')}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        console.log('✅ Shared successfully via native sharing');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard! Share it with your friends.');
        console.log('✅ Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        // Last resort: show the URL
        const urlToCopy = window.location.href;
        prompt('Copy this link to share:', urlToCopy);
      }
    }
  };

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

      {/* ✅ ENHANCED: Action Buttons with Buy Now */}
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

        {/* ✅ NEW: Buy Now Button */}
        <button
          onClick={handleBuyNow}
          disabled={stockInfo.status === 'out-of-stock' || buyingNow}
          style={{
            ...styles.buyNowButton,
            ...(stockInfo.status === 'out-of-stock' ? styles.disabledButton : {}),
            ...(buyingNow ? styles.buyNowLoading : {})
          }}
        >
          {buyingNow ? (
            <>
              <RefreshCw size={18} className="spinning" />
              Processing Payment...
            </>
          ) : stockInfo.status === 'out-of-stock' ? (
            'Out of Stock'
          ) : (
            <>
              <CreditCard size={18} />
              Buy Now - {formatPrice(product.price * quantity)}
            </>
          )}
        </button>
        
        {/* ✅ ENHANCED: Secondary Actions Row */}
        <div style={styles.secondaryActions}>
          {/* ✅ Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            style={{
              ...styles.wishlistButton,
              ...(isWishlisted ? styles.wishlistActive : {}),
              ...(isWishlistLoading ? styles.wishlistLoading : {})
            }}
          >
            {isWishlistLoading ? (
              <>
                <RefreshCw size={18} className="spinning" />
                {isWishlisted ? 'Removing...' : 'Adding...'}
              </>
            ) : (
              <>
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </>
            )}
          </button>

          {/* ✅ NEW: Share Button */}
          <button
            onClick={handleShare}
            style={styles.shareButton}
            title="Share this product"
          >
            <Share2 size={18} />
            Share Product
          </button>
        </div>
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

// ✅ ENHANCED: Related Products with Wishlist
function RelatedProductCard({ product, shopSlug, sellerPhone }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const headers = getAuthHeaders();
      if (!headers || !product?.id) return;

      try {
        const response = await axios.get(`${WISHLIST_CHECK_API}?product_id=${product.id}`, { 
          headers,
          timeout: 5000 
        });
        setIsWishlisted(response.data.is_wishlisted || false);
      } catch (error) {
        console.warn('❌ Failed to check wishlist status for related product:', error);
      }
    };

    checkWishlistStatus();
  }, [product?.id]);

  // Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const headers = getAuthHeaders();
    if (!headers) return;

    if (isWishlistLoading) return;

    setIsWishlistLoading(true);
    const previousState = isWishlisted;
    setIsWishlisted(!isWishlisted);

    try {
      const response = await axios.post(WISHLIST_TOGGLE_API, {
        product_id: product.id
      }, {
        headers,
        timeout: 10000
      });

      setIsWishlisted(response.data.is_wishlisted ?? response.data.wishlisted);
    } catch (error) {
      console.error('❌ Wishlist toggle error:', error);
      setIsWishlisted(previousState);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://placehold.co/200x200/e9ecef/6c757d?text=No+Image';
    if (url.startsWith('/media/')) {
      return `${getApiBaseUrl()}${url}`;
    }
    return url;
  };

  return (
    <div style={styles.relatedProductCard}>
      <Link
        href={`/shop/${shopSlug}/product/${product.id}?id=${sellerPhone}`}
        style={styles.relatedProductLink}
      >
        <div style={styles.relatedProductImageContainer}>
          <img
            src={getImageUrl(product.main_image_url)}
            alt={product.name}
            style={styles.relatedProductImage}
            onError={(e) => {
              e.target.src = 'https://placehold.co/200x200/e9ecef/6c757d?text=No+Image';
            }}
          />
          {/* ✅ Wishlist button for related products */}
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            style={{
              ...styles.relatedWishlistButton,
              ...(isWishlisted ? styles.relatedWishlistActive : {})
            }}
          >
            {isWishlistLoading ? (
              <RefreshCw size={12} className="spinning" />
            ) : (
              <Heart size={12} fill={isWishlisted ? 'currentColor' : 'none'} />
            )}
          </button>
        </div>
        <div style={styles.relatedProductInfo}>
          <h3 style={styles.relatedProductName}>{product.name}</h3>
          <p style={styles.relatedProductPrice}>
            ₹{product.price?.toLocaleString('en-IN')}
          </p>
        </div>
      </Link>
    </div>
  );
}

// ✅ ENHANCED: Main Product Page Component with Reviews + Wishlist
function ShopProductPageContent() {
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [buyerStatus, setBuyerStatus] = useState({ isLoggedIn: false, isVerified: false });
  const [canReview, setCanReview] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { shopSlug, productId } = params;
  
  const sellerPhone = getSellerPhoneFromSlug(shopSlug, searchParams);
  
  const cartContext = useCart();
  const { addToCart, cartItems } = cartContext || { addToCart: null, cartItems: [] };

  // ✅ NEW: Fetch reviews
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviewsResponse = await axios.get(`${API_BASE_URL}/api/products/${productId}/reviews/`);
      setReviews(reviewsResponse.data.results || reviewsResponse.data || []);
    } catch (reviewError) {
      console.log('Reviews fetch failed:', reviewError.message);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // ✅ NEW: Check review permission
  const checkReviewPermission = async () => {
    const token = localStorage.getItem('buyerAccessToken') ||
                  localStorage.getItem('access_token') ||
                  localStorage.getItem('accessToken');
    if (token) {
      try {
        const canReviewResponse = await axios.get(
          `${API_BASE_URL}/api/products/${productId}/can-review/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCanReview(canReviewResponse.data.can_review);
      } catch (e) {
        console.log('Can review check failed:', e.message);
        setCanReview(false);
      }
    }
  };

  // ✅ NEW: Handle review submission
  const handleReviewSubmitted = () => {
    fetchReviews();
    // Refetch product to update ratings
    fetchProductData();
  };

  // Check login status
  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken') || 
                   localStorage.getItem('access_token') ||
                   localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);

      // ✅ NEW: Also check buyer status for reviews
      if (token) {
        const headers = { 'Authorization': `Bearer ${token}` };
        axios.get(BUYER_PROFILE_URL, { headers })
          .then(res => {
            setBuyerStatus({ isLoggedIn: true, isVerified: res.data.phone_verified });
          })
          .catch(err => {
            console.error("Could not verify buyer status", err);
            setBuyerStatus({ isLoggedIn: false, isVerified: false });
          });
      } else {
        setBuyerStatus({ isLoggedIn: false, isVerified: false });
      }
    } catch (error) {
      console.warn('localStorage access error:', error);
      setIsLoggedIn(false);
      setBuyerStatus({ isLoggedIn: false, isVerified: false });
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

  // ✅ ENHANCED: Fetch product and store data with reviews
  const fetchProductData = async () => {
    if (!sellerPhone || !productId) {
      setError('Invalid product URL. Please check the link and try again.');
      setIsLoading(false);
      return;
    }

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

      // ✅ NEW: Fetch reviews and check review permission
      await fetchReviews();
      await checkReviewPermission();

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

  // Fetch product and store data
  useEffect(() => {
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

        {/* ✅ ENHANCED: Product Content with Mobile-First Layout */}
        <div style={styles.productContainer}>
          <ProductImageGallery product={product} />
          <ProductInfo 
            product={product} 
            store={store}
            onAddToCart={handleAddToCart}
            isLoading={addToCartLoading}
            cartQuantity={cartQuantity}
            isLoggedIn={isLoggedIn}
            router={router}
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

        {/* ✅ NEW: Reviews Section */}
        <div style={styles.reviewsSection}>
          <div style={styles.reviewsHeader}>
            <h2>Customer Reviews</h2>
            <div style={styles.reviewsSummary}>
              <StarRating 
                rating={product.average_rating || 0} 
                reviewCount={reviews.length}
              />
            </div>
          </div>
          
          {buyerStatus.isLoggedIn ? (
            canReview ? (
              <ReviewForm 
                productId={productId} 
                onReviewSubmitted={handleReviewSubmitted} 
              />
            ) : (
              <div style={styles.cannotReviewMessage}>
                <p>You can only review products you have purchased and received.</p>
              </div>
            )
          ) : (
            <div style={styles.loginPrompt}>
              <p>
                Please <Link href="/login/buyer" style={styles.loginLink}>login</Link> to write a review
              </p>
            </div>
          )}
          
          <div style={styles.reviewsList}>
            <h3>All Reviews ({reviews.length})</h3>
            
            {reviewsLoading ? (
              <div style={styles.loadingText}>
                <RefreshCw size={16} className="spinning" />
                <span>Loading reviews...</span>
              </div>
            ) : reviews.length > 0 ? (
              <div style={styles.reviewsContainer}>
                {reviews.map(review => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div style={styles.noReviews}>
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ ENHANCED: Related Products with Wishlist */}
        {relatedProducts.length > 0 && (
          <div style={styles.relatedContainer}>
            <h2 style={styles.sectionTitle}>More from {store?.name}</h2>
            <div style={styles.relatedGrid}>
              {relatedProducts.map((relatedProduct) => (
                <RelatedProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  shopSlug={shopSlug}
                  sellerPhone={sellerPhone}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* ✅ FULLY RESPONSIVE CSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* ✅ MOBILE FIRST: Extra Small Devices (320px - 479px) */
        @media (max-width: 479px) {
          .page-container {
            padding: 0 !important;
          }
          
          .container {
            padding: 8px !important;
          }
          
          .product-container {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
            padding: 12px !important;
            margin-bottom: 15px !important;
            border-radius: 8px !important;
          }
          
          /* Image at top - compact but visible */
          .image-gallery {
            order: 1 !important;
            margin-bottom: 12px !important;
          }
          
          .main-image-container {
            height: 65vw !important;
            max-height: 250px !important;
            min-height: 200px !important;
            border-radius: 12px !important;
          }
          
          .main-image {
            border-radius: 12px !important;
          }
          
          /* Product info below image */
          .product-info {
            order: 2 !important;
            gap: 12px !important;
            padding: 0 !important;
          }
          
          .product-title {
            font-size: 1.1rem !important;
            line-height: 1.2 !important;
          }
          
          .current-price {
            font-size: 1.3rem !important;
          }
          
          .action-buttons {
            gap: 10px !important;
            margin-top: 15px !important;
          }
          
          .add-to-cart-button,
          .buy-now-button {
            padding: 14px 16px !important;
            font-size: 0.9rem !important;
            min-height: 44px !important;
            border-radius: 8px !important;
          }
          
          .secondary-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .wishlist-button,
          .share-button {
            padding: 12px 16px !important;
            font-size: 13px !important;
            min-height: 42px !important;
          }
          
          .thumbnail {
            width: 45px !important;
            height: 45px !important;
          }
          
          .breadcrumb-container {
            display: none !important;
          }
          
          .related-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          
          .related-product-name {
            font-size: 12px !important;
          }
          
          .related-product-price {
            font-size: 13px !important;
          }
        }

        /* ✅ MOBILE: Small Devices (480px - 767px) */
        @media (min-width: 480px) and (max-width: 767px) {
          .container {
            padding: 12px !important;
          }
          
          .product-container {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 16px !important;
            margin-bottom: 20px !important;
          }
          
          .image-gallery {
            order: 1 !important;
            margin-bottom: 15px !important;
          }
          
          .main-image-container {
            height: 70vw !important;
            max-height: 300px !important;
            min-height: 240px !important;
            border-radius: 14px !important;
          }
          
          .main-image {
            border-radius: 14px !important;
          }
          
          .product-info {
            order: 2 !important;
            gap: 16px !important;
            padding: 0 !important;
          }
          
          .product-title {
            font-size: 1.3rem !important;
            line-height: 1.2 !important;
          }
          
          .current-price {
            font-size: 1.5rem !important;
          }
          
          .action-buttons {
            gap: 12px !important;
            margin-top: 18px !important;
          }
          
          .add-to-cart-button,
          .buy-now-button {
            padding: 15px 20px !important;
            font-size: 0.95rem !important;
            min-height: 48px !important;
            border-radius: 10px !important;
          }
          
          .secondary-actions {
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          .wishlist-button,
          .share-button {
            padding: 13px 18px !important;
            font-size: 14px !important;
            min-height: 46px !important;
          }
          
          .thumbnail {
            width: 50px !important;
            height: 50px !important;
          }
          
          .related-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
            gap: 12px !important;
          }
        }

        /* ✅ TABLET: Medium Devices (768px - 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .container {
            padding: 16px !important;
          }
          
          .product-container {
            grid-template-columns: 1fr 1fr !important;
            gap: 30px !important;
            padding: 24px !important;
            margin-bottom: 30px !important;
          }
          
          .image-gallery {
            order: unset !important;
          }
          
          .main-image-container {
            height: auto !important;
            max-height: 450px !important;
            aspect-ratio: 1 !important;
            border-radius: 12px !important;
          }
          
          .product-info {
            order: unset !important;
            gap: 18px !important;
            padding: 0 !important;
          }
          
          .product-title {
            font-size: 1.6rem !important;
          }
          
          .current-price {
            font-size: 1.7rem !important;
          }
          
          .action-buttons {
            gap: 14px !important;
          }
          
          .add-to-cart-button,
          .buy-now-button {
            padding: 16px 24px !important;
            font-size: 1rem !important;
            min-height: 52px !important;
          }
          
          .secondary-actions {
            flex-direction: row !important;
            gap: 12px !important;
          }
          
          .wishlist-button,
          .share-button {
            flex: 1 !important;
            padding: 14px 18px !important;
            font-size: 14px !important;
          }
          
          .related-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
            gap: 16px !important;
          }
        }

        /* ✅ DESKTOP: Large Devices (1024px - 1439px) */
        @media (min-width: 1024px) and (max-width: 1439px) {
          .container {
            padding: 20px !important;
            max-width: 1200px !important;
          }
          
          .product-container {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
            padding: 32px !important;
          }
          
          .main-image-container {
            max-height: 500px !important;
            aspect-ratio: 1 !important;
          }
          
          .main-image {
            object-fit: contain !important;
          }
          
          .product-title {
            font-size: 1.8rem !important;
          }
          
          .current-price {
            font-size: 1.75rem !important;
          }
          
          .secondary-actions {
            flex-direction: row !important;
          }
          
          .related-grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
            gap: 20px !important;
          }
        }

        /* ✅ LARGE DESKTOP: Extra Large Devices (1440px+) */
        @media (min-width: 1440px) {
          .container {
            max-width: 1400px !important;
            padding: 24px !important;
          }
          
          .product-container {
            grid-template-columns: 1fr 1fr !important;
            gap: 50px !important;
            padding: 40px !important;
          }
          
          .main-image-container {
            max-height: 600px !important;
          }
          
          .product-title {
            font-size: 2rem !important;
          }
          
          .current-price {
            font-size: 1.9rem !important;
          }
          
          .related-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
            gap: 24px !important;
          }
        }

        /* ✅ RELATED PRODUCTS: Responsive Square Images */
        @media (max-width: 479px) {
          .related-product-image-container {
            aspect-ratio: 1 !important;
            height: auto !important;
          }
          
          .related-product-image {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
        }

        @media (min-width: 480px) {
          .related-product-image-container {
            aspect-ratio: 1 !important;
            overflow: hidden !important;
          }
          
          .related-product-image {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
        }

        /* ✅ HOVER EFFECTS: Desktop Only */
        @media (min-width: 1024px) {
          .related-product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          }
          
          .main-image-container:hover .main-image {
            transform: scale(1.02);
          }
          
          .add-to-cart-button:hover,
          .buy-now-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
        }

        /* ✅ TOUCH INTERACTIONS: Mobile & Tablet */
        @media (max-width: 1023px) {
          .related-product-card:active {
            transform: scale(0.98);
          }
          
          .thumbnail:active {
            transform: scale(0.95);
          }
          
          .add-to-cart-button:active,
          .buy-now-button:active {
            transform: scale(0.98);
          }
          
          .wishlist-button:active,
          .share-button:active {
            transform: scale(0.97);
          }
        }

        /* ✅ ACCESSIBILITY: Focus States */
        @media (prefers-reduced-motion: no-preference) {
          .add-to-cart-button,
          .buy-now-button,
          .wishlist-button,
          .share-button {
            transition: all 0.2s ease;
          }
          
          .related-product-card {
            transition: all 0.3s ease;
          }
        }

        /* ✅ HIGH DPI DISPLAYS */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .main-image,
          .related-product-image {
            image-rendering: -webkit-optimize-contrast;
          }
        }

        /* ✅ PRINT STYLES */
        @media print {
          .breadcrumb-container,
          .back-button,
          .action-buttons,
          .secondary-actions,
          .related-container {
            display: none !important;
          }
          
          .product-container {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            page-break-inside: avoid;
          }
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

// ✅ FULLY RESPONSIVE STYLES: Perfect for All Devices
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

  // ✅ RESPONSIVE: Image Gallery
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
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },

  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
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
    overflowX: 'auto',
    justifyContent: 'center'
  },

  thumbnail: {
    width: '60px',
    height: '60px',
    borderRadius: '6px',
    objectFit: 'cover',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0
  },

  activeThumbnail: {
    borderColor: '#3b82f6'
  },

  // ✅ RESPONSIVE: Product Info
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
    fontSize: 'clamp(1.2rem, 4vw, 2rem)',
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
    gap: '8px',
    flexWrap: 'wrap'
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
    fontSize: 'clamp(1.3rem, 5vw, 1.75rem)',
    fontWeight: '700',
    color: '#059669'
  },

  originalPrice: {
    fontSize: 'clamp(1rem, 3vw, 1.25rem)',
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
    gap: '12px',
    flexWrap: 'wrap'
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
    color: '#374151',
    transition: 'background-color 0.2s'
  },

  quantityValue: {
    padding: '8px 16px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#1f2937',
    minWidth: '50px',
    textAlign: 'center'
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
    transition: 'all 0.2s',
    minHeight: '48px'
  },

  // ✅ RESPONSIVE: Buy Now Button
  buyNowButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 24px',
    backgroundColor: '#ff6b35',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
    minHeight: '52px'
  },

  buyNowLoading: {
    cursor: 'not-allowed',
    opacity: 0.8
  },

  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },

  // ✅ RESPONSIVE: Secondary Actions
  secondaryActions: {
    display: 'flex',
    gap: '12px'
  },

  wishlistButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 1,
    minHeight: '44px'
  },

  wishlistActive: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderColor: '#dc2626'
  },

  wishlistLoading: {
    cursor: 'not-allowed',
    opacity: 0.7
  },

  shareButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 1,
    minHeight: '44px'
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

  // ✅ RESPONSIVE: Description Section
  descriptionContainer: {
    backgroundColor: 'white',
    padding: 'clamp(20px, 4vw, 32px)',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '40px'
  },

  sectionTitle: {
    fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px'
  },

  description: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.7'
  },

  // ✅ RESPONSIVE: Reviews Section
  reviewsSection: { 
    backgroundColor: 'white',
    padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '40px'
  },
  
  reviewsHeader: {
    marginBottom: '30px',
    textAlign: 'center'
  },
  
  reviewsSummary: {
    marginTop: '15px'
  },
  
  loginPrompt: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    margin: '20px 0',
    border: '1px solid #e5e7eb'
  },
  
  loginLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600'
  },
  
  cannotReviewMessage: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '15px',
    borderRadius: '8px',
    margin: '20px 0',
    border: '1px solid #fbbf24'
  },
  
  // ✅ RESPONSIVE: Review Form
  reviewForm: { 
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    padding: 'clamp(20px, 4vw, 30px)', 
    margin: '30px 0'
  },
  
  reviewFormTitle: {
    fontSize: 'clamp(1.1rem, 2.5vw, 1.2rem)',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '20px'
  },
  
  errorMessage: {
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    border: '1px solid #fecaca'
  },
  
  successMessage: {
    color: '#065f46',
    backgroundColor: '#ecfdf5',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    border: '1px solid #a7f3d0'
  },
  
  ratingSection: {
    marginBottom: '20px'
  },
  
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151'
  },
  
  starRatingInput: { 
    display: 'flex', 
    alignItems: 'center',
    gap: '5px',
    marginTop: '8px',
    flexWrap: 'wrap'
  },
  
  starButton: {
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },

  ratingText: {
    marginLeft: '10px',
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  
  commentSection: {
    marginBottom: '20px'
  },
  
  textarea: { 
    width: '100%', 
    minHeight: '100px', 
    padding: '12px', 
    border: '1px solid #d1d5db', 
    borderRadius: '8px',
    resize: 'vertical',
    fontFamily: 'inherit',
    fontSize: '1rem',
    lineHeight: '1.5',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  
  charCount: {
    color: '#6b7280',
    fontSize: '0.8rem',
    marginTop: '5px',
    display: 'block'
  },
  
  submitButton: { 
    padding: '12px 30px', 
    border: 'none', 
    borderRadius: '8px', 
    backgroundColor: '#059669', 
    color: 'white', 
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    minHeight: '44px'
  },

  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  reviewsList: {
    marginTop: '40px'
  },
  
  reviewsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px'
  },
  
  reviewItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: 'clamp(16px, 3vw, 25px)'
  },
  
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },

  reviewerInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },

  reviewerAvatar: {
    width: '40px',
    height: '40px',
    backgroundColor: '#e5e7eb',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    flexShrink: 0
  },
  
  reviewerName: {
    margin: '8px 0 0 0',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  
  reviewDate: {
    fontSize: '0.85rem',
    color: '#6b7280'
  },
  
  reviewComment: {
    margin: 0,
    lineHeight: '1.6',
    color: '#374151',
    fontSize: '1rem'
  },
  
  starContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    flexWrap: 'wrap'
  },
  
  ratingDisplay: {
    fontSize: '0.9rem',
    color: '#6b7280',
    fontWeight: '500'
  },
  
  reviewCount: { 
    color: '#6b7280', 
    fontSize: '0.9rem' 
  },
  
  noReviews: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
    fontStyle: 'italic',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#6b7280',
    padding: '20px'
  },

  // ✅ FULLY RESPONSIVE: Related Products
  relatedContainer: {
    backgroundColor: 'white',
    padding: 'clamp(20px, 4vw, 32px)',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },

  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },

  relatedProductCard: {
    position: 'relative',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },

  relatedProductLink: {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit'
  },

  relatedProductImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1',
    overflow: 'hidden'
  },

  relatedProductImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },

  relatedWishlistButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    transition: 'all 0.2s',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },

  relatedWishlistActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },

  relatedProductInfo: {
    padding: '15px'
  },

  relatedProductName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 6px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.3'
  },

  relatedProductPrice: {
    fontSize: '16px',
    color: '#059669',
    fontWeight: '700',
    margin: 0
  }
};
