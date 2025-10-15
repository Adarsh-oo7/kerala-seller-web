'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import WhatsAppButton from '../../../components/common/WhatsAppButton';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight, Zap, CreditCard } from 'lucide-react';

// ✅ API configuration - matches your existing backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/products/`;
const BUYER_PROFILE_URL = `${API_BASE_URL}/api/buyer/profile/`;

// ✅ Your existing Razorpay endpoints
const CREATE_RAZORPAY_ORDER_URL = `${API_BASE_URL}/api/orders/create-razorpay-order/`;
const VERIFY_PAYMENT_URL = `${API_BASE_URL}/api/orders/verify-payment-and-create-order/`;

// ✅ Wishlist API URLs
const WISHLIST_API = `${API_BASE_URL}/api/wishlist/`;
const WISHLIST_TOGGLE_API = `${API_BASE_URL}/api/wishlist/toggle_product/`;
const WISHLIST_CHECK_API = `${API_BASE_URL}/api/wishlist/check_product/`;

// ✅ Enhanced auth headers function
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') ||
    localStorage.getItem('buyerAccessToken') ||
    localStorage.getItem('buyerToken') ||
    localStorage.getItem('accessToken');

  return token ? { 'Authorization': `Bearer ${token}` } : null;
};

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
  const allImages = [
    {
      url: getBestImageUrl(product, 'main'),
      thumbnail: getBestImageUrl(product, 'thumbnail'),
      large: getBestImageUrl(product, 'large'),
      alt: product.name
    },
    ...(product.sub_images || []).map((subImage, index) => ({
      url: subImage.image_url || subImage.thumbnail_url || getBestImageUrl({ main_image_url: subImage.image }),
      thumbnail: subImage.thumbnail_url || subImage.image_url || getBestImageUrl({ main_image_url: subImage.image }),
      large: subImage.large_url || subImage.image_url || getBestImageUrl({ main_image_url: subImage.image }),
      alt: `${product.name} - Image ${index + 2}`
    }))
  ];

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
            src={isZoomed ? currentImage.large : currentImage.url}
            alt={currentImage.alt}
            className="main-image"
            style={{
              ...styles.mainImage,
              opacity: imageLoaded ? 1 : 0,
              transform: isZoomed ? 'scale(1.1)' : 'scale(1)'
            }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = 'https://placehold.co/600x400?text=No+Image';
              setImageLoaded(true);
            }}
          />
          
          {/* Navigation Arrows - Hidden on mobile */}
          {allImages.length > 1 && (
            <>
              <button 
                style={{...styles.navButton, ...styles.prevButton}} 
                className="nav-button"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                style={{...styles.navButton, ...styles.nextButton}} 
                className="nav-button"
                onClick={handleNext}
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div style={styles.imageCounter} className="image-counter">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Optimized Badge */}
          {product.image_metadata?.optimized && (
            <div style={styles.optimizedBadge} className="optimized-badge" title="Fast loading optimized image">
              <Zap size={12} />
            </div>
          )}

          {/* Zoom hint */}
          <div style={styles.zoomHint} className="zoom-hint">
            🖱️ Hover to zoom • 📱 Tap to select
          </div>
        </div>
      </div>

      {/* Thumbnail Selector */}
      {allImages.length > 1 && (
        <div style={styles.thumbnailContainer}>
          <div style={styles.thumbnailScroller} className="thumbnail-scroller">
            {allImages.map((image, index) => (
              <div
                key={index}
                style={{
                  ...styles.thumbnailWrapper,
                  ...(index === selectedImageIndex ? styles.activeThumbnail : {})
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
      )}
    </div>
  );
}

// Enhanced Review Form Component
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
        
        const token = localStorage.getItem('buyerAccessToken');
        if (!token) {
            setError('Please login to submit a review');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}${productId}/create-review/`, 
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
                            <div style={styles.spinner}></div>
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

// Enhanced Star Rating Component
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

// Individual Review Component
function ReviewItem({ review }) {
    return (
        <div style={styles.reviewItem}>
            <div style={styles.reviewHeader}>
                <div>
                    <StarRating rating={review.rating} showCount={false} />
                    <h5 style={styles.reviewerName}>
                        {review.buyer?.full_name || 'Anonymous Customer'}
                    </h5>
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

// ✅ Enhanced Wishlist Component
function WishlistButton({ productId, isLoggedIn, router }) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    // ✅ Check if product is wishlisted on component mount
    useEffect(() => {
        const checkWishlistStatus = async () => {
            const headers = getAuthHeaders();
            if (!headers || !productId) return;

            try {
                console.log(`🔍 Checking wishlist status for product ${productId}`);
                const response = await axios.get(`${WISHLIST_CHECK_API}?product_id=${productId}`, { 
                    headers,
                    timeout: 5000 
                });
                const isInWishlist = response.data.is_wishlisted || false;
                console.log(`✅ Product ${productId} wishlist status:`, isInWishlist);
                setIsWishlisted(isInWishlist);
            } catch (error) {
                console.warn('❌ Failed to check wishlist status:', error);
            }
        };

        if (isLoggedIn && productId) {
            checkWishlistStatus();
        }
    }, [productId, isLoggedIn]);

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
            console.log('⏳ Wishlist request already in progress for product:', productId);
            return;
        }

        setIsWishlistLoading(true);
        const previousState = isWishlisted;

        // Optimistic update
        setIsWishlisted(!isWishlisted);

        try {
            console.log('🔄 Toggling wishlist for product:', productId);

            const response = await axios.post(WISHLIST_TOGGLE_API, {
                product_id: productId
            }, {
                headers,
                timeout: 10000
            });

            console.log('✅ Wishlist toggle response:', response.data);

            const newWishlistState = response.data.is_wishlisted ?? response.data.wishlisted;
            setIsWishlisted(newWishlistState);

            // Show user feedback
            const action = newWishlistState ? 'added to' : 'removed from';
            console.log(`✅ Product ${action} wishlist`);

            // Visual feedback
            const button = document.querySelector('[data-wishlist-button]');
            if (button) {
                button.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 200);
            }

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

    return (
        <button 
            style={{
                ...styles.secondaryButton,
                ...(isWishlisted ? styles.wishlistActive : {}),
                ...(isWishlistLoading ? styles.wishlistLoading : {})
            }}
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            data-wishlist-button
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
            {isWishlistLoading ? (
                <RefreshCw size={16} className="spinning" />
            ) : (
                <Heart 
                    size={16} 
                    fill={isWishlisted ? '#ef4444' : 'none'}
                    color={isWishlisted ? '#ef4444' : '#6b7280'}
                />
            )}
        </button>
    );
}

// ✅ Razorpay Script Loader
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

// ✅ ENHANCED: Main Product Detail Component with Working Buy Now
export default function ProductDetailPage() {
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [buyerStatus, setBuyerStatus] = useState({ isLoggedIn: false, isVerified: false });
    const [canReview, setCanReview] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);
    
    const { productId } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();

    const fetchPageData = async () => {
        if (!productId) {
            setError('No product ID provided');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            
            console.log('Fetching product from:', `${API_URL}${productId}/`);
            
            const productResponse = await axios.get(`${API_URL}${productId}/`);
            console.log('Product response:', productResponse.data);
            setProduct(productResponse.data);

            await fetchReviews();
            await checkReviewPermission();

        } catch (err) {
            console.error('Failed to fetch product:', err);
            
            if (err.response?.status === 404) {
                setError('Product not found');
            } else if (err.response) {
                setError(`Server error: ${err.response.status} - ${err.response.data?.detail || err.response.statusText}`);
            } else if (err.request) {
                setError('Network error: Unable to connect to server. Make sure your backend is running.');
            } else {
                setError(`Error: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            const reviewsResponse = await axios.get(`${API_URL}${productId}/reviews/`);
            setReviews(reviewsResponse.data.results || reviewsResponse.data || []);
        } catch (reviewError) {
            console.log('Reviews fetch failed:', reviewError.message);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    const checkReviewPermission = async () => {
        const token = localStorage.getItem('buyerAccessToken');
        if (token) {
            try {
                const canReviewResponse = await axios.get(
                    `${API_URL}${productId}/can-review/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCanReview(canReviewResponse.data.can_review);
            } catch (e) {
                console.log('Can review check failed:', e.message);
                setCanReview(false);
            }
        }
    };

    // ✅ Check buyer status and login state
    useEffect(() => {
        const token = localStorage.getItem('buyerAccessToken');
        if (token) {
            const headers = { 'Authorization': `Bearer ${token}` };
            axios.get(BUYER_PROFILE_URL, { headers })
                .then(res => {
                    setBuyerStatus({ 
                        isLoggedIn: true, 
                        isVerified: res.data.phone_verified,
                        name: res.data.full_name,
                        email: res.data.email,
                        phone: res.data.phone_number
                    });
                })
                .catch(err => {
                    console.error("Could not verify buyer status", err);
                    setBuyerStatus({ isLoggedIn: false, isVerified: false });
                });
        } else {
            setBuyerStatus({ isLoggedIn: false, isVerified: false });
        }
    }, []);

    useEffect(() => {
        fetchPageData();
    }, [productId]);

    const handleReviewSubmitted = () => {
        fetchReviews();
        fetchPageData();
    };

    const handleAddToCart = async () => {
        if (!product) return;

        if (!buyerStatus.isLoggedIn) {
            router.push('/login/buyer');
            return;
        }
        if (!buyerStatus.isVerified) {
            alert('Please verify your phone number on your profile page before purchasing.');
            router.push('/profile');
            return;
        }
        
        setAddingToCart(true);
        
        try {
            if (product.store && product.store.seller_phone) {
                addToCart(product.store.seller_phone, product);
                
                // Show success feedback
                const button = document.querySelector('[data-add-to-cart]');
                if (button) {
                    const originalText = button.textContent;
                    button.textContent = 'Added to Cart!';
                    button.style.backgroundColor = '#28a745';
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.backgroundColor = '#3b82f6';
                    }, 2000);
                }
            } else {
                alert("Cannot add to cart, seller information is missing.");
            }
        } finally {
            setAddingToCart(false);
        }
    };

    // ✅ WORKING: Buy Now with Your Existing Backend
    const handleBuyNow = async () => {
        if (!product) return;

        if (!buyerStatus.isLoggedIn) {
            router.push('/login/buyer');
            return;
        }
        if (!buyerStatus.isVerified) {
            alert('Please verify your phone number on your profile page before purchasing.');
            router.push('/profile');
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

            // ✅ STEP 1: Create order data for single product
            const orderData = {
                seller_phone: product.store?.seller_phone,
                items: [{
                    id: product.id,
                    quantity: 1,
                    name: product.name,
                    price: product.price
                }],
                customer_name: buyerStatus.name || 'Customer',
                customer_phone: buyerStatus.phone || '',
                shipping_address: "Default Address" // You can enhance this with address selection
            };

            const totalAmount = product.price;

            console.log('🛒 Creating Razorpay order for Buy Now:', orderData);

            // ✅ STEP 2: Create Razorpay order using your existing endpoint
            const createOrderResponse = await axios.post(
                CREATE_RAZORPAY_ORDER_URL, 
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

            // ✅ STEP 3: Configure Razorpay payment options
            const options = {
                key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: amount, // Amount in paise
                currency: currency,
                name: 'Kerala Sellers',
                description: `Buy Now: ${product.name}`,
                order_id: razorpay_order_id,
                
                // ✅ STEP 4: Payment success handler
                handler: async function (response) {
                    console.log('💳 Payment successful:', response);
                    
                    try {
                        // ✅ Use your existing payment verification endpoint
                        const verifyResponse = await axios.post(
                            VERIFY_PAYMENT_URL,
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
                    name: buyerStatus.name || 'Customer',
                    email: buyerStatus.email || '',
                    contact: buyerStatus.phone || ''
                },
                
                // ✅ Order notes
                notes: {
                    product_id: product.id,
                    product_name: product.name,
                    seller_phone: product.store?.seller_phone,
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

            // ✅ STEP 5: Open Razorpay payment modal
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

    // ✅ Share functionality
    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Check out this product: ${product.name}`,
            url: window.location.href
        };

        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                alert('Product link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Final fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Product link copied to clipboard!');
            } catch (clipboardError) {
                console.error('Clipboard error:', clipboardError);
            }
        }
    };

    if (isLoading) {
        return (
            <div style={styles.pageContainer}>
                <Header />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading product details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.pageContainer}>
                <Header />
                <div style={styles.errorContainer}>
                    <h2>Error Loading Product</h2>
                    <p style={styles.errorText}>{error}</p>
                    <button onClick={fetchPageData} style={styles.retryButton}>
                        Try Again
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div style={styles.pageContainer}>
                <Header />
                <div style={styles.errorContainer}>
                    <p>Product not found.</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <Header />
            
            {/* Product Details Section */}
            <div style={styles.container} className="container">
                <div style={styles.productLayout} className="product-layout">
                    {/* ✅ ENHANCED: Image Gallery Component */}
                    <div className="image-gallery">
                        <ProductImageGallery product={product} />
                    </div>
                    
                    <div style={styles.detailsContainer} className="details-container">
                        <h1 style={styles.name} className="product-name">{product.name}</h1>
                        {product.model_name && <p style={styles.model}>Model: {product.model_name}</p>}
                        
                        <StarRating 
                            rating={product.average_rating || 0} 
                            reviewCount={product.review_count || 0} 
                        />

                        {product.description && <p style={styles.description}>{product.description}</p>}
                        
                        <div style={styles.priceContainer} className="price-container">
                            <span style={styles.price} className="product-price">₹{product.price}</span>
                            {product.mrp && product.mrp > product.price && (
                                <>
                                    <span style={styles.mrp} className="product-mrp">MRP: ₹{product.mrp}</span>
                                    <span style={styles.discount}>
                                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                                    </span>
                                </>
                            )}
                        </div>
                        
                        <div style={styles.stockContainer} className="stock-container">
                            <p style={{
                                ...styles.stock,
                                color: product.online_stock > 0 ? '#059669' : '#dc2626'
                            }}>
                                {product.online_stock > 0 
                                    ? `✓ ${product.online_stock} available` 
                                    : '✗ Out of Stock'
                                }
                            </p>
                        </div>

                        {/* Features */}
                        <div style={styles.features} className="features">
                            <div style={styles.feature}>
                                <Truck size={16} />
                                <span>Free Delivery</span>
                            </div>
                            <div style={styles.feature}>
                                <Shield size={16} />
                                <span>Secure Payment</span>
                            </div>
                            {product.image_metadata?.optimized && (
                                <div style={styles.feature}>
                                    <Zap size={16} />
                                    <span>Fast Loading</span>
                                </div>
                            )}
                        </div>
                        
                        {/* ✅ ENHANCED: Action Buttons with Working Buy Now */}
                        <div style={styles.actionButtons} className="action-buttons">
                            <button 
                                style={{
                                    ...styles.addToCartButton,
                                    backgroundColor: product.online_stock === 0 ? '#6c757d' : (addingToCart ? '#28a745' : '#3b82f6'),
                                    cursor: product.online_stock === 0 ? 'not-allowed' : 'pointer'
                                }} 
                                disabled={product.online_stock === 0 || addingToCart}
                                onClick={handleAddToCart}
                                data-add-to-cart
                            >
                                <span style={styles.buttonContent}>
                                    {addingToCart ? (
                                        <>
                                            <div style={styles.spinner}></div>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} />
                                            {product.online_stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </>
                                    )}
                                </span>
                            </button>

                            {/* ✅ WORKING: Buy Now Button with Your Backend */}
                            <button 
                                style={{
                                    ...styles.buyNowButton,
                                    backgroundColor: product.online_stock === 0 ? '#6c757d' : (buyingNow ? '#28a745' : '#ff6b35'),
                                    cursor: product.online_stock === 0 ? 'not-allowed' : 'pointer'
                                }} 
                                disabled={product.online_stock === 0 || buyingNow}
                                onClick={handleBuyNow}
                                data-buy-now
                            >
                                <span style={styles.buttonContent}>
                                    {buyingNow ? (
                                        <>
                                            <div style={styles.spinner}></div>
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={18} />
                                            {product.online_stock > 0 ? 'Buy Now' : 'Out of Stock'}
                                        </>
                                    )}
                                </span>
                            </button>

                            <div style={styles.secondaryActions} className="secondary-actions">
                                {/* ✅ Working Wishlist Button */}
                                <WishlistButton 
                                    productId={productId}
                                    isLoggedIn={buyerStatus.isLoggedIn}
                                    router={router}
                                />
                                
                                {/* ✅ Working Share Button */}
                                <button 
                                    style={styles.secondaryButton}
                                    onClick={handleShare}
                                    title="Share this product"
                                >
                                    <Share2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
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
                            Please <a href="/login/buyer" style={styles.loginLink}>login</a> to write a review
                        </p>
                    </div>
                )}
                
                <div style={styles.reviewsList}>
                    <h3>All Reviews ({reviews.length})</h3>
                    
                    {reviewsLoading ? (
                        <div style={styles.loadingText}>
                            <div style={styles.spinner}></div>
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

            {product.store?.whatsapp_number && (
                <WhatsAppButton phoneNumber={product.store.whatsapp_number} />
            )}

            <Footer />

            {/* ✅ Enhanced CSS with Mobile Square Images */}
{/* ✅ Enhanced CSS with Smaller Mobile Images for Better UI */}
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

    /* ✅ MOBILE: Smaller Square Images + Better Proportions */
    @media (max-width: 768px) {
        .container {
            padding: 15px !important;
        }
        
        .product-layout {
            grid-template-columns: 1fr !important;
            gap: 25px !important;
            margin-bottom: 20px !important;
        }
        
        /* ✅ MOBILE: Image Gallery - Full width at top */
        .image-gallery {
            order: 1;
            width: 100% !important;
            margin-bottom: 15px !important;
        }
        
        /* ✅ MOBILE: Smaller Square Image Container - Better proportions */
        .main-image-wrapper {
            width: 100% !important;
            height: 65vw !important; /* Smaller than before (was 80vw) */
            max-height: 320px !important; /* Smaller max height (was 400px) */
            min-height: 250px !important; /* Smaller min height (was 300px) */
            aspect-ratio: 1 / 1 !important;
            margin: 0 auto !important;
        }
        
        /* ✅ MOBILE: Square Image - Cover to fill square */
        .main-image {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            max-height: none !important;
        }
        
        /* ✅ MOBILE: Details section below image - Better spacing */
        .details-container {
            order: 2;
            padding: 20px 15px !important;
            gap: 16px !important;
            background: white;
            border-radius: 12px;
            margin-top: 5px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
        
        /* ✅ MOBILE: Hide navigation arrows */
        .nav-button {
            display: none !important;
        }
        
        /* ✅ MOBILE: Smaller thumbnails */
        .thumbnail-wrapper {
            min-width: 55px !important;
            width: 55px !important;
            height: 55px !important;
        }
        
        /* ✅ MOBILE: Better thumbnail scrolling */
        .thumbnail-scroller {
            gap: 6px !important;
            padding: 8px 5px !important;
            justify-content: center !important;
        }
        
        /* ✅ MOBILE: Responsive text sizes */
        .product-name {
            font-size: 1.3rem !important;
            line-height: 1.3 !important;
            margin-bottom: 8px !important;
        }
        
        .product-price {
            font-size: 1.5rem !important;
        }
        
        .product-mrp {
            font-size: 1rem !important;
        }
        
        /* ✅ MOBILE: Action buttons with better spacing */
        .action-buttons {
            gap: 12px !important;
            margin-top: 18px !important;
        }
        
        .action-buttons button {
            padding: 16px 24px !important;
            font-size: 0.95rem !important;
            font-weight: 600 !important;
        }
        
        /* ✅ MOBILE: Secondary actions spacing */
        .secondary-actions {
            justify-content: center !important;
            gap: 10px !important;
            margin-top: 8px !important;
        }
        
        /* ✅ MOBILE: Features section */
        .features {
            flex-wrap: wrap !important;
            gap: 12px !important;
            justify-content: center !important;
        }
        
        /* ✅ MOBILE: Stock container */
        .stock-container {
            text-align: center !important;
            padding: 8px !important;
            background: rgba(5, 150, 105, 0.1) !important;
            border-radius: 8px !important;
        }
        
        /* ✅ MOBILE: Price container */
        .price-container {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
            padding: 12px 0 !important;
        }
        
        /* ✅ MOBILE: Image counter positioning */
        .image-counter {
            font-size: 0.7rem !important;
            padding: 3px 6px !important;
            bottom: 8px !important;
            right: 8px !important;
        }
        
        /* ✅ MOBILE: Zoom hint */
        .zoom-hint {
            font-size: 0.6rem !important;
            padding: 2px 6px !important;
            bottom: 8px !important;
            left: 8px !important;
        }
        
        /* ✅ MOBILE: Optimized badge */
        .optimized-badge {
            width: 18px !important;
            height: 18px !important;
            top: 8px !important;
            right: 8px !important;
        }
    }

    /* ✅ MOBILE: Small screens - Even more compact and proportional */
    @media (max-width: 480px) {
        .container {
            padding: 10px !important;
        }
        
        /* ✅ SMALL MOBILE: Smaller square image - More proportional */
        .main-image-wrapper {
            height: 60vw !important; /* Even smaller (was 85vw) */
            max-height: 280px !important; /* Smaller max (was 350px) */
            min-height: 220px !important; /* Smaller min (was 280px) */
            margin: 0 auto !important;
        }
        
        .details-container {
            padding: 15px 12px !important;
            gap: 14px !important;
            margin-top: 8px !important;
        }
        
        .product-name {
            font-size: 1.2rem !important;
        }
        
        .product-price {
            font-size: 1.4rem !important;
        }
        
        .action-buttons button {
            padding: 15px 20px !important;
            font-size: 0.9rem !important;
        }
        
        .thumbnail-wrapper {
            min-width: 45px !important;
            width: 45px !important;
            height: 45px !important;
        }
        
        .thumbnail-scroller {
            gap: 4px !important;
            padding: 5px 3px !important;
        }
    }

    /* ✅ MOBILE: Very small screens - Ultra compact */
    @media (max-width: 360px) {
        .main-image-wrapper {
            height: 55vw !important;
            max-height: 250px !important;
            min-height: 200px !important;
        }
        
        .details-container {
            padding: 12px 10px !important;
            gap: 12px !important;
        }
        
        .product-name {
            font-size: 1.1rem !important;
        }
        
        .product-price {
            font-size: 1.3rem !important;
        }
        
        .action-buttons button {
            padding: 14px 18px !important;
            font-size: 0.85rem !important;
        }
    }

    /* ✅ DESKTOP: Keep large screen styles unchanged */
    @media (min-width: 769px) {
        .product-layout {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        
        .main-image-wrapper {
            min-height: 300px;
            max-height: 600px;
            height: auto;
            aspect-ratio: unset;
        }
        
        .main-image {
            width: 100%;
            height: auto;
            max-height: 600px;
            object-fit: contain;
        }
        
        .details-container {
            order: unset;
            padding: 0;
            margin-top: 0;
            background: transparent;
            box-shadow: none;
        }
        
        .nav-button {
            display: flex !important;
        }
    }

    /* ✅ MOBILE: Touch interactions */
    @media (max-width: 768px) {
        .main-image {
            cursor: default !important;
        }
        
        .thumbnail-wrapper {
            cursor: pointer;
            -webkit-tap-highlight-color: rgba(59, 130, 246, 0.1);
        }
        
        .thumbnail-wrapper:active {
            transform: scale(0.95);
        }
    }

    /* ✅ MOBILE: Smooth scrolling for thumbnails */
    .thumbnail-scroller {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
    }

    /* ✅ SCROLLBAR STYLING */
    .thumbnail-scroller::-webkit-scrollbar {
        height: 4px;
    }
    
    .thumbnail-scroller::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 2px;
    }
    
    .thumbnail-scroller::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 2px;
    }
`}</style>

        </div>
    );
}

// ✅ Enhanced Styles with Mobile Square Images + Responsive Layout
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
    
    spinner: {
        width: '20px',
        height: '20px',
        border: '2px solid #f3f3f3',
        borderTop: '2px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    
    errorContainer: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#dc3545'
    },
    
    errorText: {
        color: '#dc3545',
        marginBottom: '20px',
        fontSize: '1.1rem'
    },
    
    retryButton: {
        padding: '12px 24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500'
    },
    
    container: { 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        animation: 'fadeIn 0.6s ease-out'
    },
    
    productLayout: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginBottom: '40px'
    },

    // ✅ Image Gallery Styles
    imageGallery: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%'
    },

    mainImageContainer: {
        position: 'relative',
        width: '100%',
        margin: '0 auto'
    },

    mainImageWrapper: {
        position: 'relative',
        width: '100%',
        minHeight: '300px',
        maxHeight: '600px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    mainImage: {
        width: '100%',
        height: 'auto',
        maxHeight: '600px',
        objectFit: 'contain',
        transition: 'all 0.3s ease',
        cursor: 'zoom-in',
        touchAction: 'manipulation'
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

    loadingText: {
        color: '#6b7280',
        fontSize: '0.9rem'
    },

    navButton: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: 0.8,
        transition: 'all 0.3s ease',
        zIndex: 3
    },

    prevButton: {
        left: '10px'
    },

    nextButton: {
        right: '10px'
    },

    imageCounter: {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '500',
        zIndex: 2
    },

    optimizedBadge: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(34, 197, 94, 0.9)',
        color: 'white',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        zIndex: 2
    },

    zoomHint: {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.7rem',
        opacity: 0.6
    },

    thumbnailContainer: {
        width: '100%',
        margin: '0 auto'
    },

    thumbnailScroller: {
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '5px',
        scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch',
        justifyContent: 'flex-start'
    },

    thumbnailWrapper: {
        minWidth: '70px',
        width: '70px',
        height: '70px',
        borderRadius: '8px',
        border: '2px solid transparent',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: '#f9fafb',
        flexShrink: 0
    },

    activeThumbnail: {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 1px #3b82f6',
        transform: 'scale(1.05)'
    },

    thumbnailImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    
    detailsContainer: { 
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    
    name: { 
        fontSize: '2rem', 
        margin: 0,
        color: '#1f2937',
        fontWeight: '700',
        lineHeight: '1.2'
    },
    
    model: { 
        color: '#6b7280', 
        margin: 0,
        fontSize: '1.1rem'
    },
    
    starContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        flexWrap: 'wrap'
    },
    
    stars: {
        display: 'flex',
        gap: '2px'
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
    
    description: { 
        lineHeight: '1.6',
        margin: 0,
        color: '#374151',
        fontSize: '1rem'
    },
    
    priceContainer: { 
        display: 'flex', 
        alignItems: 'baseline', 
        gap: '15px',
        flexWrap: 'wrap'
    },
    
    price: { 
        fontSize: '2rem', 
        fontWeight: '700',
        color: '#059669'
    },
    
    mrp: { 
        textDecoration: 'line-through', 
        color: '#9ca3af',
        fontSize: '1.2rem'
    },

    discount: {
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '600'
    },
    
    stockContainer: {
        margin: '10px 0'
    },
    
    stock: { 
        fontWeight: '600',
        margin: 0,
        fontSize: '1rem'
    },
    
    features: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
    },
    
    feature: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#059669',
        fontSize: '0.9rem',
        fontWeight: '500'
    },
    
    actionButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    
    addToCartButton: { 
        width: '100%',
        padding: '16px 24px', 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontSize: '1.1rem', 
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    buyNowButton: { 
        width: '100%',
        padding: '16px 24px', 
        backgroundColor: '#ff6b35', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontSize: '1.1rem', 
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    
    buttonContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    
    secondaryActions: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'center'
    },
    
    secondaryButton: {
        width: '48px',
        height: '48px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        transition: 'all 0.2s ease'
    },

    wishlistActive: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
    },

    wishlistLoading: {
        cursor: 'not-allowed',
        opacity: 0.7
    },
    
    // Reviews Section Styles (keeping existing styles)
    reviewsSection: { 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
    
    // Review Form Styles
    reviewForm: { 
        backgroundColor: '#f8fafc',
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '30px', 
        margin: '30px 0'
    },
    
    reviewFormTitle: {
        fontSize: '1.2rem',
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
        marginTop: '8px'
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
        transition: 'all 0.3s ease'
    },
    
    disabledButton: {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed'
    },
    
    // Reviews List Styles
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
        padding: '25px'
    },
    
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px',
        flexWrap: 'wrap',
        gap: '10px'
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
    }
};
