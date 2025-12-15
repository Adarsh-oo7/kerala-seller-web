'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import WhatsAppButton from '../../../components/common/Whatsapp';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import "../../../styles/Keralasellersproductpage.css";
import { toast } from "react-toastify";

import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, ChevronLeft, Minus, Plus, ChevronRight, Zap, CreditCard } from 'lucide-react';

// ✅ API configuration - matches your existing backend
const API_BASE_URL = 'https://api.keralasellers.in' || 'https://api.keralasellers.in';
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

// ✅ FIXED: Cloudinary gets HIGHEST priority
const getBestImageUrl = (product, imageType = 'main', size = 'default') => {
    if (!product) return 'https://placehold.co/400x400?text=No+Image';

    // ✅ Priority 1: CLOUDINARY URL FIRST (regardless of imageType)
    if (product.cloudinary_url) {
        console.log('✅ Using Cloudinary URL:', product.cloudinary_url);
        return product.cloudinary_url;
    }

    // ✅ Priority 2: Size-specific URLs
    const imageUrls = {
        thumbnail: product.thumbnail_url || product.main_image_url,
        large: product.large_image_url || product.main_image_url,
        main: product.main_image_url
    };

    let imageUrl = imageUrls[imageType] || product.main_image_url;

    if (!imageUrl) return 'https://placehold.co/400x400?text=No+Image';

    // ✅ If it's already a Cloudinary URL, return as is
    if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
        console.log('✅ Using Cloudinary URL from imageUrl:', imageUrl);
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
    // ✅ FIXED: Combine main image and sub-images with Cloudinary priority
    const allImages = [
        {
            url: product.cloudinary_url || getBestImageUrl(product, 'main'),
            thumbnail: product.cloudinary_url || getBestImageUrl(product, 'thumbnail'),
            large: product.cloudinary_url || getBestImageUrl(product, 'large'),
            alt: product.name
        },
        ...(product.sub_images || []).map((subImage, index) => ({
            url: subImage.cloudinary_image_url || subImage.image_url || subImage.thumbnail_url || getBestImageUrl({ main_image_url: subImage.image }),
            thumbnail: subImage.cloudinary_image_url || subImage.thumbnail_url || subImage.image_url || getBestImageUrl({ main_image_url: subImage.image }),
            large: subImage.cloudinary_image_url || subImage.large_url || subImage.image_url || getBestImageUrl({ main_image_url: subImage.image }),
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
            router.push('/login/buyer');
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
                // alert('Session expired. Please login again.');
                router.push('/login/buyer');
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
            className='keralasellersproductsharebtn'
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
                <>
                    <Heart
                        size={16}
                        fill={isWishlisted ? '#ef4444' : 'none'}
                        color={isWishlisted ? '#ef4444' : '#1a4845'}
                    />
                    <span style={{ marginLeft: '8px', fontWeight: 500 }}>
                        {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </span>
                </>

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
    const [quantity, setQuantity] = useState(1);


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

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Add to Cart: adds current product & quantity to the cart
    const handleAddToCart = async () => {
        if (!product) return;
        if (!buyerStatus.isLoggedIn) {
            router.push('/login/buyer');
            return;
        }
        setAddingToCart(true);
        try {
            if (product.store && product.store.seller_phone) {
                addToCart(product.store.seller_phone, { ...product, quantity });
                toast.success('Added to cart!', { position: "top-right", autoClose: 1500 });
            } else {
                alert("Cannot add to cart, seller information is missing.");
            }
        } finally {
            setAddingToCart(false);
        }
    };

    // Buy Now: just redirect to checkout with product/quantity
    const handleBuyNow = () => {
        if (!product) return;
        if (!buyerStatus.isLoggedIn) {
            router.push('/login/buyer');
            return;
        }
        if (!product.store?.seller_phone) {
            alert("Seller information missing.");
            return;
        }
        router.push(`/checkout/${product.store.seller_phone}?buyNow=1&productId=${product.id}&quantity=${quantity}`);
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
                // alert('Product link copied to clipboard!');
                toast.success("Product link copied to clipboard!", {
                    position: "top-right",
                    autoClose: 1500,
                    theme: "colored",
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Final fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                // alert('Product link copied to clipboard!');
                toast.success("Product link copied to clipboard!", {
                    position: "top-right",
                    autoClose: 1500,
                    theme: "colored",
                });
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
            <div style={styles.container}>
                <div className='keralasellersproductpageproductcontainer' style={styles.productLayout}>
                    {/* Left: Image Gallery */}
                    <div style={styles.imageGallery}>
                        <ProductImageGallery product={product} />
                    </div>

                    {/* Right: Product Details */}
                    <div style={styles.detailsContainer}>
                        <div className="keralasellersproductdetails-top">
                            <div className="keralasellersproductdetails-left">
                                <h1 className='keralasellersproducttitle' style={styles.name}>{product.name}</h1>
                                {product.model_name && (
                                    <p className='keralasellersproductmodel' style={styles.model}>
                                        Model: {product.model_name}
                                    </p>
                                )}
                                <div style={styles.priceContainer}>
                                    <span className='keralasellersproductprice' style={styles.price}>₹{product.price}</span>
                                    {product.mrp && product.mrp > product.price && (
                                        <>
                                            <span className='keralasellersproductmrp' style={styles.mrp}>MRP: ₹{product.mrp}</span>
                                            <span style={styles.discount}>
                                                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="keralasellersproductdetails-right">
                                <StarRating rating={product.average_rating || 0} reviewCount={product.review_count || 0} />
                                <p className='keralasellersproductstock' style={{ ...styles.stock, color: product.online_stock > 0 ? '#059669' : '#dc2626' }}>
                                    {product.online_stock > 0 ? `✓ ${product.online_stock} available` : '✗ Out of Stock'}
                                </p>
                                <div className='keralasellersproductquantity' style={styles.quantityContainer}>
                                    <label style={styles.quantityLabel}>Quantity:</label>
                                    <div style={styles.quantitySelector}>
                                        <button
                                            className='keralasellersproductqntybtn'
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            style={styles.quantityButton}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className='keralasellersproductqntyvalue' style={styles.quantityValue}>{quantity}</span>
                                        <button
                                            className='keralasellersproductqntybtn'
                                            onClick={() => setQuantity(Math.min(product.online_stock, quantity + 1))}
                                            style={styles.quantityButton}
                                            disabled={quantity >= product.online_stock}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>




                        <div style={styles.actionButtons} className='keralasellersproductactnbtngap'>
                            <button
                                className='keralasellersproductaddcartbtn'
                                style={{
                                    ...styles.addToCartButton,
                                    backgroundColor: product.online_stock === 0 ? '#6c757d' : (addingToCart ? '#28a745' : 'rgb(5, 150, 105)'),
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
                                className='keralasellersproductaddcartbtn'
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
                                            <span style={{ marginLeft: '8px', fontWeight: 500 }}>
                                                {product.online_stock > 0 ? 'Buy Now' : 'Out of Stock'}
                                            </span>

                                            {product.online_stock > 0 && (
                                                <span style={{ marginLeft: '8px', color: 'white', fontWeight: 600 }}>
                                                    {formatPrice(product.price * quantity)}
                                                </span>
                                            )}
                                        </>

                                    )}
                                </span>
                            </button>

                            <div style={styles.secondaryActions} className="keralasellerssecondary-actions">
                                {/* ✅ Working Wishlist Button */}
                                <WishlistButton
                                    productId={productId}
                                    isLoggedIn={buyerStatus.isLoggedIn}
                                    router={router}
                                />

                                {/* ✅ Working Share Button */}
                                <button
                                    className='keralasellersproductsharebtn'
                                    style={styles.secondaryButton}
                                    onClick={handleShare}
                                    title="Share this product"
                                >
                                    <Share2 size={16} />
                                    <span style={{ marginLeft: '8px' }}>Share Product</span>
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

                    </div>
                </div>
            </div>



            <div style={styles.pageContainerInner}>
                {product.description && (
                    <div style={styles.descriptionContainer}>
                        <h2 className='keralasellersproductpagedescriptiontitle' style={styles.sectionTitle}>Product Description</h2>
                        <div className='keralasellersproductpagedescription' style={styles.description}>
                            <p>{product.description}</p>
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div style={styles.reviewsSection}>
                    <div style={styles.reviewsHeader}>
                        <h2 className='keralasellersproductpagedescriptiontitle'>Customer Reviews</h2>
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
                                <p className='keralasellersproductpagedescription'>You can only review products you have purchased and received.</p>
                            </div>
                        )
                    ) : (
                        <div style={styles.loginPrompt}>
                            <p className='keralasellersproductpagedescription'>
                                Please <a href="/login/buyer" style={styles.loginLink}>login</a> to write a review
                            </p>
                        </div>
                    )}

                    <div style={styles.reviewsList}>
                        <h3 className='keralasellersproductpagedescriptiontitle'>All Reviews ({reviews.length})</h3>

                        {reviewsLoading ? (
                            <div style={styles.loadingText}>
                                <div style={styles.spinner}></div>
                                <span className='keralasellersproductpagedescription'>Loading reviews...</span>
                            </div>
                        ) : reviews.length > 0 ? (
                            <div style={styles.reviewsContainer}>
                                {reviews.map(review => (
                                    <ReviewItem key={review.id} review={review} />
                                ))}
                            </div>
                        ) : (
                            <div style={styles.noReviews}>
                                <p className='keralasellersproductpagedescription'>No reviews yet. Be the first to review this product!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {product.store?.whatsapp_number && (
                <WhatsAppButton phoneNumber={product.store.whatsapp_number} />
            )}

            <Footer />



        </div>
    );
}

// ✅ Enhanced Styles with Mobile Square Images + Responsive Layout
const styles = {
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#FDFFF0',
    },
    container: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px', // reduce top/bottom padding
        boxSizing: 'border-box',
    },

    pageContainerInner: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px', // ✅ adds side spacing
        boxSizing: 'border-box',
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

    productLayout: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '40px',
        marginBottom: '40px',
        backgroundColor: 'rgb(253, 255, 240)',
        padding: '32px',
        borderRadius: '12px',
        boxSizing: 'border-box',
    },


    // ✅ Image Gallery Styles
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


    detailsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        justifyContent: "center",
    },

    name: {
        fontSize: 'clamp(1.2rem, 4vw, 2rem)',
        fontWeight: '700',
        color: '#1f2937',
        margin: 0,
        lineHeight: '1.2'
    },

    model: {
        fontSize: '1rem',
        color: '#6b7280',
        margin: 0
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

    priceContainer: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '12px',
        flexWrap: 'wrap'
    },

    price: {
        fontSize: '25px',
        fontWeight: '700',
        color: '#059669'
    },

    mrp: {
        textDecoration: 'line-through',
        color: '#9ca3af',
        fontSize: '16px'
    },

    discount: {
        backgroundColor: '#059669',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '600'
    },

    stockContainer: {
        margin: '10px 0'
    },

    stock: {
        fontWeight: '600',
        margin: 0,
        fontSize: '14px'
    },


    actionButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },

    addToCartButton: {
        width: '100%',
        padding: '14px 24px',
        backgroundColor: 'rgb(5, 150, 105)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        minHeight: '48px'
    },

    buyNowButton: {
        width: '100%',
        padding: '14px 24px',
        backgroundColor: '#ff6b35',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        minHeight: '48px'

    },

    buttonContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },

    secondaryActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'space-between', // spread buttons across full width
        width: '100%',                  // full container width
        marginTop: '2px'
    },


    secondaryButton: {
        flex: 1,                  // each button takes equal space
        height: '48px',
        backgroundColor: '#FDFFF0',
        border: '1px solid #1a4845',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1a4845',
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
    },
    descriptionContainer: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto 40px',
        backgroundColor: '#FDFFF0',
        padding: '32px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow:
            '0 -20px 25px -5px rgba(0, 0, 0, 0.2), ' +
            '0 10px 10px -5px rgba(0, 0, 0, 0.1), ' +
            '0 -10px 10px -5px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box', // ✅ important
        overflow: 'hidden',       // ✅ prevents horizontal scroll
        wordBreak: 'break-word',  // ✅ long text doesn't expand container
    },
    reviewsSection: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        backgroundColor: '#FDFFF0',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow:
            '0 -20px 25px -5px rgba(0, 0, 0, 0.2), ' +
            '0 10px 10px -5px rgba(0, 0, 0, 0.1), ' +
            '0 -10px 10px -5px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box', // ✅ important
        overflow: 'hidden',       // ✅ prevents horizontal scroll
        wordBreak: 'break-word',  // ✅ long text doesn't expand container        boxSizing: 'border-box', // ✅ add
        overflow: 'hidden'
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
        color: '#1a4845'
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
};
