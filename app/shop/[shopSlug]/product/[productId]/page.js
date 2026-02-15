'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import "../../../../../styles/Shopslugproduct.css";
import { useCart } from '../../../../context/CartContext';
import SHeader from '../../../../../components/common/SHeader';
import Footer from '../../../../../components/common/Footer';
import { toast } from "react-toastify";

import {
  ShoppingCart,
  Star,
  Heart,
  Share2,
  ArrowLeft,
  Store,
  Package,
  Truck,
  ChevronLeft,
  ChevronRight,
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
// const getApiBaseUrl = () => {
//   const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;

//   if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
//     return envUrl.trim();
//   }

//   if (process.env.NODE_ENV === 'development') {
//     return 'https://api.keralasellers.in';
//   }

//   return 'https://api.keralasellers.in';
// };

// // ✅ API URLs
// const API_BASE_URL = 'https://api.keralasellers.in';
// const WISHLIST_API = `${API_BASE_URL}/api/wishlist/`;
// const WISHLIST_TOGGLE_API = `${API_BASE_URL}/api/wishlist/toggle_product/`;
// const WISHLIST_CHECK_API = `${API_BASE_URL}/api/wishlist/check_product/`;
// const BUYER_PROFILE_URL = `${API_BASE_URL}/api/buyer/profile/`;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (typeof window !== 'undefined' ? 'https://api.keralasellers.in' : 'http://localhost:8000/api');

const WISHLIST_API = `${API_BASE_URL}/api/wishlist/`;
const WISHLIST_TOGGLE_API = `${API_BASE_URL}/api/wishlist/toggle_product/`;
const WISHLIST_CHECK_API = `${API_BASE_URL}/api/wishlist/check_product/`;
const BUYER_PROFILE_URL = `${API_BASE_URL}/api/buyer/profile/`;

console.log('❤️ Wishlist APIs:', API_BASE_URL);



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
      <div className='shopslugproductpagestarsicongap' style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            className='shopslugproductpagestarsicon'
            key={star}
            size={20}
            color={star <= fullStars || (star === fullStars + 1 && hasHalfStar) ? "#ffc107" : "#e4e5e9"}
            fill={star <= fullStars || (star === fullStars + 1 && hasHalfStar) ? "#ffc107" : "#e4e5e9"}
          />
        ))}
      </div>
      {rating > 0 && (
        <span className='shopslugproductreviewtext' style={styles.ratingDisplay}>
          {rating.toFixed(1)} out of 5
        </span>
      )}
      {showCount && reviewCount > 0 && (
        <span className='shopslugproductreviewtext' style={styles.reviewCount}>({reviewCount} reviews)</span>
      )}
    </div>
  );
}

// ✅ NEW: Individual Review Component
function ReviewItem({ review }) {
  return (
    <div style={styles.reviewItem}>
      <div className='shopslugproductreview-header' style={styles.reviewHeader}>
        <div style={styles.reviewerInfo}>
          <div style={styles.reviewerAvatar}>
            <User size={16} />
          </div>
          <div>
            <StarRating rating={review.rating} showCount={false} />
            <h5 className='shopslugproductpagedescription' style={styles.reviewerName}>
              {review.buyer?.full_name || 'Anonymous Customer'}
            </h5>
          </div>
        </div>
        <span className='shopslugproductreview-date' style={styles.reviewDate}>
          {new Date(review.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
      <p className='shopslugproductpagedescription' style={styles.reviewComment}>{review.comment}</p>
    </div>
  );
}

// ✅ SMART: Get best image URL with Cloudinary support
const getBestImageUrl = (product, imageType = 'main', size = 'default') => {
  if (!product) return 'https://placehold.co/400x400?text=No+Image';

  // Priority order for different image types
  const imageUrls = {
    thumbnail: product.thumbnail_url || product.main_image_url || product.cloudinary_url,
    large: product.large_image_url || product.main_image_url || product.cloudinary_url,
    main: product.main_image_url || product.cloudinary_url
  };

  let imageUrl = imageUrls[imageType] || product.main_image_url;

  if (!imageUrl) return 'https://placehold.co/400x400?text=No+Image';

  // If it's already a Cloudinary URL, return as is
  if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }

  // Handle local URLs
  if (imageUrl.startsWith('/media/') || imageUrl.startsWith('/static/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  return imageUrl.startsWith('/') ? `${API_BASE_URL}${imageUrl}` : imageUrl;
};

// ✅ Enhanced Image Gallery Component with Mobile Square Support
function ProductImageGallery({ product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Combine main image and sub-images
const allImages = React.useMemo(() => {
  const images = [];
  
  // ✅ Step 1: Add main image if it exists and is valid
  const mainImageUrl = getBestImageUrl(product, 'main');
  if (mainImageUrl && !mainImageUrl.includes('placehold.co') && !mainImageUrl.includes('No+Image')) {
    images.push({
      url: mainImageUrl,
      thumbnail: getBestImageUrl(product, 'thumbnail'),
      large: getBestImageUrl(product, 'large'),
      alt: product.name,
      isMain: true
    });
  }
  
  // ✅ Step 2: Add sub-images with correct property names and duplicate prevention
  if (product.sub_images && Array.isArray(product.sub_images)) {
    product.sub_images.forEach((subImage, index) => {
      // Use correct backend property names (cloudinary_image_url first)
      const subImageUrl = subImage.cloudinary_image_url || 
                          subImage.image_url || 
                          subImage.thumbnail_url || 
                          getBestImageUrl({ main_image_url: subImage.image });
      
      // ✅ Only add if valid and NOT a duplicate of main image
      if (subImageUrl && 
          !subImageUrl.includes('placehold.co') && 
          !subImageUrl.includes('No+Image') &&
          subImageUrl !== mainImageUrl) {
        images.push({
          url: subImageUrl,
          thumbnail: subImage.thumbnail_url || subImage.cloudinary_image_url || subImage.image_url || subImageUrl,
          large: subImage.large_url || subImage.cloudinary_image_url || subImage.image_url || subImageUrl,
          alt: `${product.name} - Image ${index + 2}`,
          isMain: false
        });
      }
    });
  }
  
  // ✅ Step 3: Fallback if no valid images exist
  if (images.length === 0) {
    images.push({
      url: 'https://placehold.co/400x400?text=No+Image',
      thumbnail: 'https://placehold.co/80x80?text=No+Image',
      large: 'https://placehold.co/600x400?text=No+Image',
      alt: 'No image available',
      isMain: true
    });
  }
  
  return images;
}, [product?.main_image_url, product?.cloudinary_url, product?.sub_images]);

  const handlePrevious = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
    setImageLoaded(false);
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
    setImageLoaded(false);
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
    setImageLoaded(false);
  };

  const currentImage = allImages[selectedImageIndex];

  return (
    <div style={styles.imageGallery} className="image-gallery">
      {/* Main Image Display */}
      <div style={styles.mainImageContainer}>
        <div
          style={styles.mainImageWrapper}
          className="main-image-wrapper"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          {!imageLoaded && (
            <div style={styles.imageLoader}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading image...</p>
            </div>
          )}

          <img
            src={currentImage.large}
            alt={currentImage.alt}
            className="main-image"
            style={{
              ...styles.mainImage,
              opacity: imageLoaded ? 1 : 0,
              transform: isZoomed ? 'scale(1.1)' : 'scale(1)',
              width: '100%',
              height: 'auto',
              objectFit: 'contain'
            }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = 'https://placehold.co/600x400?text=No+Image';
              setImageLoaded(true);
            }}
          />



          {/* Optimized Badge */}
          {product.image_metadata?.optimized && (
            <div
              style={styles.optimizedBadge}
              className="optimized-badge"
              title="Fast loading optimized image"
            >
              <Zap size={12} />
            </div>
          )}

        </div>
      </div>

      {/* Thumbnail Selector */}
      {allImages.length > 1 && (
        <div style={styles.thumbnailRowWrapper}>
          {/* Prev Arrow */}
          <button
            style={styles.thumbnailNavButtonLeft}
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Thumbnails */}
          <div style={styles.thumbnailContainer}>
            <div style={styles.thumbnailScroller} className="thumbnail-scroller">
              {allImages.map((image, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.thumbnailWrapper,
                    ...(index === selectedImageIndex ? styles.activeThumbnail : {}),
                  }}
                  className="thumbnail-wrapper"
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={image.thumbnail}
                    alt={image.alt}
                    style={styles.thumbnailImage}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/80x80?text=No+Image';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Next Arrow */}
          <button
            style={styles.thumbnailNavButtonRight}
            onClick={handleNext}
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

    </div>
  );
}

// ✅ ENHANCED: Product Info Component with Buy Now + Share
// ✅ ENHANCED: Product Info Component with Buy Now + Share + DELIVERY INFO
function ProductInfo({ product, store, onAddToCart, isLoading, cartQuantity, isLoggedIn, router }) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  
  // ✅ NEW: Calculate delivery charge based on weight and price
const [deliveryInfo, setDeliveryInfo] = useState({ charge: 0, isFree: true, hasDelivery: false });

// ✅ FIXED: Calculate delivery ONLY if seller has it enabled
useEffect(() => {
    if (!product) return;
    
    // ✅ Check if seller has delivery charges configured
    const hasDeliveryEnabled = product.delivery_info?.has_charges_configured === true;
    
    if (!hasDeliveryEnabled) {
        // Seller has disabled delivery charges
        setDeliveryInfo({ charge: 0, isFree: true, hasDelivery: false });
        return;
    }
    
    // ✅ Only calculate if delivery is enabled
    const weight = product.weight_kg || 0;
    const price = product.price || 0;
    const orderTotal = price * quantity;
    let charge = 0;
    let isFree = true;
    
    // Delivery logic (from backend)
    if (weight > 0) {
        // Base charge: ₹50 + ₹10 per kg
        charge = 50 + (weight * 10);
        isFree = false;
        
        // Free delivery conditions
        if (orderTotal >= 500 && weight <= 1) {
            charge = 0;
            isFree = true;
        }
    } else {
        // No weight = Free delivery
        charge = 0;
        isFree = true;
    }
    
    setDeliveryInfo({ charge, isFree, hasDelivery: true });
}, [product, quantity]);


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

  // ✅ Buy Now Handler - Redirect to Individual Shop's Checkout
  const handleBuyNow = () => {
    if (!product) return;

    // ✅ Check if user is logged in
    if (!isLoggedIn) {
      if (!store) {
        alert('Store information is loading. Please wait and try again.');
        return;
      }

      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      const shopSlug = generateShopSlug(store);
      const phone = store?.seller_phone || store?.phone;

      if (!phone) {
        alert('Store information is incomplete. Please try again later.');
        return;
      }

      console.log('🔄 Redirecting to seller login:', `/shop/${shopSlug}/login?redirect=${returnUrl}&id=${phone}`);
      router.push(`/shop/${shopSlug}/login?redirect=${returnUrl}&id=${phone}`);
      return;
    }

    const shopSlug = generateShopSlug(store);
    const sellerPhone = store?.seller_phone || store?.phone;

    if (!shopSlug || !sellerPhone) {
      alert('Store information missing. Cannot proceed to checkout.');
      return;
    }

    // ✅ Navigate to individual shop's checkout with Buy Now parameters
    console.log('🛒 Buy Now: Redirecting to shop checkout', {
      shopSlug,
      sellerPhone,
      productId: product.id,
      quantity
    });

    // ✅ Redirect to: /shop/[shopSlug]/checkout?buyNow=1&productId=123&quantity=2
    router.push(`/shop/${shopSlug}/checkout?buyNow=1&productId=${product.id}&quantity=${quantity}&id=${sellerPhone}`);
  };

  // ✅ Share Handler
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
        toast.success(
          `Product link copied to clipboard! Share it with your friends.`,
          {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
          }
        );
        console.log('✅ Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(
          `Product link copied to clipboard!`,
          {
            position: "top-right",
            autoClose: 2000,
            theme: "colored",
          }
        );
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
    <div className='shopslugproductproductinfo' style={styles.productInfo}>
      <div className="product-grid" style={styles.productgrid}>
        {/* Left Column */}
        <div className="left-column" style={styles.leftcolumn}>
          {/* Product Title */}
          <h1 className='shopslugproducttitle' style={styles.productTitle}>{product.name || 'Product Name'}</h1>
          {product.model_name && (
            <p className='shopslugproductmodel' style={styles.productModel}>Model: {product.model_name}</p>
          )}

          {/* Price */}
          <div style={styles.priceContainer}>
            <span className='shopslugproductprice' style={styles.currentPrice}>{formatPrice(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className='shopslugproductprice' style={styles.originalPrice}>{formatPrice(product.mrp)}</span>
                <span style={styles.savings}>
                  You save {formatPrice(product.mrp - product.price)}
                </span>
              </>
            )}
          </div>

          {/* ✅ NEW: Delivery Info Section */}
{/* ✅ FIXED: Only show delivery if enabled */}
{deliveryInfo.hasDelivery && (
    <>
        <div style={deliveryInfo.isFree ? styles.deliveryInfoFree : styles.deliveryInfoPaid}>
            <Truck size={20} color={deliveryInfo.isFree ? '#059669' : '#374151'} />
            <div style={styles.deliveryText}>
                {deliveryInfo.isFree ? (
                    <>
                        <span style={styles.freeDeliveryText}>FREE Delivery</span>
                        {product.price * quantity < 500 && (
                            <span style={styles.deliveryHint}>Free on orders above ₹500</span>
                        )}
                    </>
                ) : (
                    <>
                        <span style={styles.deliveryChargeText}>
                            Delivery: ₹{deliveryInfo.charge.toLocaleString('en-IN')}
                        </span>
                        <span style={styles.deliveryHint}>Free for orders above ₹500</span>
                    </>
                )}
            </div>
        </div>

        {/* Weight Info if available */}
        {product.weight_kg && product.weight_kg > 0 && (
            <div style={styles.weightInfo}>
                <Package size={16} color="#6b7280" />
                <span>Weight: {product.weight_kg} kg</span>
            </div>
        )}
    </>
)}


          {/* ✅ Weight Info (if available) */}
          {product.weight_kg && product.weight_kg > 0 && (
            <div style={styles.weightInfo}>
              <Package size={16} color="#6b7280" />
              <span>Weight: {product.weight_kg} kg</span>
            </div>
          )}
        </div>

        <div className="right-column" style={styles.rightcolumn} >
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

          {/* Stock Status */}
          <div className='shopslugproductstock' style={styles.stockContainer}>
            <div style={{ ...styles.stockStatus, color: stockInfo.color }}>
              <Package size={16} />
              <span>{stockInfo.text}</span>
            </div>
          </div>

          {/* Quantity Selector */}
          {stockInfo.status !== 'out-of-stock' && (
            <div className='shopslugproductquantity' style={styles.quantityContainer}>
              <label style={styles.quantityLabel}>Quantity:</label>
              <div style={styles.quantitySelector}>
                <button
                  className='shopslugproductqntybtn'
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.quantityButton}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className='shopslugproductqntyvalue' style={styles.quantityValue}>{quantity}</span>
                <button
                  className='shopslugproductqntybtn'
                  onClick={() => setQuantity(Math.min(product.online_stock, quantity + 1))}
                  style={styles.quantityButton}
                  disabled={quantity >= product.online_stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ✅ ENHANCED: Action Buttons with Buy Now */}
      <div className='shopslugproductactnbtngap' style={styles.actionButtons}>
        <button
          className='shopslugproductaddcartbtn'
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

        {/* ✅ Buy Now Button */}
        <button
          className='shopslugproductaddcartbtn'
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

        {/* ✅ Secondary Actions Row */}
        <div style={styles.secondaryActions}>
          {/* ✅ Wishlist Button */}
          <button
            className='shopslugproductsharebtn'
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
                <Heart className='shopslugproducticon' fill={isWishlisted ? 'currentColor' : 'none'} />
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </>
            )}
          </button>

          {/* ✅ Share Button */}
          <button
            className='shopslugproductsharebtn'
            onClick={handleShare}
            style={styles.shareButton}
            title="Share this product"
          >
            <Share2 className='shopslugproducticon' />
            Share Product
          </button>
        </div>
      </div>

      {/* Product Features */}
      <div style={styles.features}>
        <div style={styles.feature}>
          <Shield size={16} />
          <span>Genuine product guarantee</span>
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
      return `${'https://api.keralasellers.in'}${url}`;
    }
    return url;
  };

  // Pricing functions
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
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
              <Heart className='shopslugproductrelatedhearticon' fill={isWishlisted ? 'currentColor' : 'none'} />
            )}
          </button>
        </div>

        <div style={styles.relatedProductInfo}>
          <h3 className='shopslugrelatedproductname' style={styles.relatedProductName}>{product.name}</h3>

          <div style={styles.priceRow}>
            <p className='shopslugrelatedproductprice' style={styles.relatedProductPrice}>
              ₹{product.price?.toLocaleString('en-IN')}
            </p>
            {product.mrp && product.mrp > product.price && (
              <span className='shopslugrelatedproductprice' style={styles.originalPrice}>{formatPrice(product.mrp)}</span>
            )}
          </div>
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
        axios.get(`${API_BASE_URL}/api/products/${productId}/`, { timeout: 15000 }),
        axios.get(`${API_BASE_URL}/shop/${sellerPhone}/`, { timeout: 15000 })
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
      // alert('Product is out of stock');
       toast.warning(
        `Product is out of stock`,
        {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        }
      );
      return;
    }
    // ✅ FIXED: Redirect to shop-specific login page with full URL preservation
if (!isLoggedIn) {
  if (!store) {
    alert('Store information is loading. Please wait and try again.');
    return;
  }

  // ✅ Get current full URL with query parameters
  const currentFullPath = window.location.pathname + window.location.search;
  const returnUrl = encodeURIComponent(currentFullPath);
  
  // ✅ Generate shop slug and get phone
  const shopSlugForLogin = generateShopSlug(store);
  const phone = store?.seller_phone || store?.phone;

  if (!phone) {
    alert('Store information is incomplete. Please try again later.');
    return;
  }

  // ✅ Redirect to shop-specific login page
  console.log('🔄 Redirecting to seller login:', `/shop/${shopSlugForLogin}/login?redirect=${returnUrl}&id=${phone}`);
  router.push(`/shop/${shopSlugForLogin}/login?redirect=${returnUrl}&id=${phone}`);
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

      console.log('✅ Successfully added to cart:', product.name);
      toast.success(
        `${product.name} added to cart`,
        {
          position: "top-right",
          autoClose: 2000,
          theme: "colored",
        }
      );
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



      <div className='shopslugproductpagecontainer' style={styles.container}>


        {/* ✅ ENHANCED: Product Content with Mobile-First Layout */}
        <div className='shopslugproductpageproductcontainer' style={styles.productContainer}>
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
            <h2 className='shopslugproductpagedescriptiontitle' style={styles.sectionTitle}>Product Description</h2>
            <div className='shopslugproductpagedescription' style={styles.description}>
              <p>{product.description}</p>
            </div>
          </div>
        )}

        {/* ✅ NEW: Reviews Section */}
        <div style={styles.reviewsSection}>
          <div style={styles.reviewsHeader}>
            <h2 className='shopslugproductpagedescriptiontitle'>Customer Reviews</h2>
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
                <p className='shopslugproductpagedescription'>You can only review products you have purchased and received.</p>
              </div>
            )
          ) : (
            <div style={styles.loginPrompt}>
              <p className='shopslugproductpagedescription'>
                Please <Link href="/login/buyer" style={styles.loginLink}>login</Link> to write a review
              </p>
            </div>
          )}

          <div style={styles.reviewsList}>
            <h3 className='shopslugproductpagedescriptiontitle'>All Reviews ({reviews.length})</h3>

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
              <div className='shopslugproductpagedescription' style={styles.noReviews}>
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ ENHANCED: Related Products with Wishlist */}
        {relatedProducts.length > 0 && (
          <div style={styles.relatedContainer}>
            <h2 style={styles.sectionTitle}>You May Also Like</h2>
            <div className='shopslugproductrelatedprod' style={styles.relatedGrid}>
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


    </div>
  );
}

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
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#FDFFF0',
  },
  container: {
    width: '100%',
    maxWidth: '1200px', // reduced for better balance
    margin: '0 auto',
    padding: 'clamp(16px, 3vw, 32px)', // dynamic padding
    paddingTop: '150px',
    boxSizing: 'border-box',
  },

  productContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // ✅ responsive columns
    gap: '40px',
    marginBottom: '40px',
    backgroundColor: '#FDFFF0',
    padding: '32px',
  },

  imageGallery: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },

  mainImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },

  mainImageWrapper: {
    width: '100%',          // take full container width
    maxWidth: '550px',
    aspectRatio: '1 / 1',   // maintain square ratio
    backgroundColor: '#FDFFF0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '12px',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',   // ✅ Show full image
    transition: 'transform 0.3s ease, opacity 0.3s ease',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    gap: '10px'
  },
  optimizedBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#4CAF50',
    color: 'white',
    padding: '3px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  thumbnailRowWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '12px',
    position: 'relative',
  },
  thumbnailContainer: {
    overflowX: 'auto',
    flex: 1,
    maxWidth: '300px', // adjust width to show ~4 thumbnails
    display: 'flex',
    justifyContent: 'center',
  },
  thumbnailScroller: {
    display: 'flex',
    gap: '8px',
    padding: '5px 0',
    scrollbarWidth: 'none', // Firefox
  },
  // Add these to your existing styles object:

  // ✅ NEW: Delivery Info Styles
  deliveryInfoFree: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '10px',
    marginTop: '16px',
    transition: 'all 0.3s ease'
  },

  deliveryInfoPaid: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#fef3c7',
    border: '2px solid #fbbf24',
    borderRadius: '10px',
    marginTop: '16px',
    transition: 'all 0.3s ease'
  },

  deliveryText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1
  },

  freeDeliveryText: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#059669',
    letterSpacing: '0.3px'
  },

  deliveryChargeText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151'
  },

  deliveryHint: {
    fontSize: '13px',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: '2px'
  },
  weightInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '10px',
    padding: '8px 12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb'
  },
  thumbnailNavButtonLeft: {
    backgroundColor: '#FDFFF0',
    color: 'black',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  thumbnailNavButtonRight: {
    backgroundColor: '#FDFFF0',
    color: 'black',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },

  thumbnailWrapper: {
    flex: '0 0 calc(25% - 7.5px)', // 4 thumbnails visible
    borderRadius: '6px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '2px solid transparent',
    flexShrink: 0,
  },
  activeThumbnail: {
    border: '2px solid #007bff',
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

  thumbnailImage: {
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    display: 'block',
  },

  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  bottomNavButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '10px',
  },

  bottomNavButton: {
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },


  prevButton: { left: '10px' },
  nextButton: { right: '10px' },

  imageCounter: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '12px',
  },



  zoomHint: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    background: 'rgba(255,255,255,0.8)',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
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




  // ✅ RESPONSIVE: Product Info
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    justifyContent: 'center'
  },
  productgrid: {
    display: 'flex', /* or whatever your original layout used */
    flexDirection: 'column',
    gap: '15px',/* same as your current styles.productInfo spacing */
  },

  leftcolumn: {
    display: 'flex', /* or whatever your original layout used */
    flexDirection: 'column',
    gap: '15px',/* same as your current styles.productInfo spacing */
  },
  rightcolumn: {
    display: 'flex', /* or whatever your original layout used */
    flexDirection: 'column',
    gap: '15px',/* same as your current styles.productInfo spacing */
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
    backgroundColor: '#FDFFF0',
    border: '1px solid #1a4845',
    borderRadius: '8px',
    overflow: 'hidden'
  },

  quantityButton: {
    padding: '8px 12px',
    border: 'none',
    backgroundColor: '#FDFFF0',
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
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #1a4845',
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
    backgroundColor: 'transparent',
    color: '#374151',
    border: '1px solid #1a4845',
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
    backgroundColor: 'transparent',
    borderRadius: '8px',
    border: '1px solid #1a4845'
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
    backgroundColor: '#FDFFF0',
    padding: 'clamp(20px, 4vw, 32px)',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '40px',
    boxShadow:
      '0 -20px 25px -5px rgba(0, 0, 0, 0.2), ' + // top
      '0 10px 10px -5px rgba(0, 0, 0, 0.1), ' +
      '0 -10px 10px -5px rgba(0, 0, 0, 0.1)',
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
    backgroundColor: '#FDFFF0',
    padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '40px',
    boxShadow:
      '0 20px 25px -5px rgba(0, 0, 0, 0.2), ' + // bottom
      '0 -20px 25px -5px rgba(0, 0, 0, 0.2), ' + // top
      '0 10px 10px -5px rgba(0, 0, 0, 0.1), ' +
      '0 -10px 10px -5px rgba(0, 0, 0, 0.1)',
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
    backgroundColor: 'rgba(14, 69, 30, 0.145)',
    border: '1px solid rgba(14, 69, 30, 0.145)',
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
    backgroundColor: '#FDFFF0',
    padding: 'clamp(20px, 4vw, 32px)',
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', // ✅ smaller cards
    gap: '20px',
    justifyContent: 'center',
  },

  relatedProductCard: {
    width: '100%',
    maxWidth: '180px', // ✅ reduced width
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    margin: '0 auto',
  },
  relatedProductLink: {
    display: 'flex',
    flexDirection: 'column',
    textDecoration: 'none',
    color: 'inherit',
  },
  relatedProductImageContainer: {
    position: 'relative',
    width: '100%',
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8efea',
    overflow: 'hidden',
  },
  relatedProductImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    backgroundColor: '#fff',
  },
  relatedWishlistButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '25px',
    height: "25px",
    background: 'rgba(255,255,255,0.85)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, background 0.2s ease',
  },
  relatedWishlistActive: {
    color: 'red',
    background: 'rgba(255,255,255,1)',
  },
  relatedProductInfo: {
    padding: '10px',
    textAlign: 'left',
  },
  relatedProductName: {
    fontSize: '15px',
    fontWeight: '500',
    margin: '5px 0',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  relatedProductPrice: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#28a745',
    margin: 0,
  },
  originalPrice: {
    textDecoration: 'line-through',
    fontSize: '12px',
    color: '#888',
  },
};



