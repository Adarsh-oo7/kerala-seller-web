'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../../../context/CartContext';
import WhatsAppButton from '../../../../../components/common/WhatsAppButton';
import SHeader from '../../../../../components/common/SHeader';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/products/`;
const BUYER_PROFILE_URL = `${API_BASE_URL}/api/buyer/profile/`;

// Enhanced Auth Helper Functions
const getAuthHeaders = () => {
    const token = localStorage.getItem('buyerAccessToken');
    console.log('🔑 Getting auth token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    if (!token) {
        console.warn('⚠️ No auth token found in localStorage');
        return {};
    }
    
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const checkTokenValidity = async () => {
    const token = localStorage.getItem('buyerAccessToken');
    if (!token) {
        console.log('🚫 No token to validate');
        return false;
    }
    
    try {
        const response = await axios.get(BUYER_PROFILE_URL, { 
            headers: getAuthHeaders()
        });
        console.log('✅ Token is valid, user profile:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Token validation failed:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401) {
            console.log('🔄 Token expired or invalid, clearing localStorage');
            localStorage.removeItem('buyerAccessToken');
            localStorage.removeItem('buyerRefreshToken');
            return false;
        }
        return false;
    }
};

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
        
        const isTokenValid = await checkTokenValidity();
        if (!isTokenValid) {
            setError('Please login again to submit a review');
            setIsSubmitting(false);
            return;
        }

        try {
            console.log('🚀 Submitting review:', { productId, rating, comment: comment.trim() });
            
            const response = await axios.post(
                `${API_URL}${productId}/create-review/`, 
                { rating, comment: comment.trim() }, 
                { headers: getAuthHeaders() }
            );
            
            console.log('✅ Review submitted successfully:', response.data);
            
            setComment('');
            setRating(5);
            setSuccess('Review submitted successfully!');
            
            setTimeout(() => {
                onReviewSubmitted();
                setSuccess('');
            }, 1500);
            
        } catch (err) {
            console.error('❌ Review submission error:', err);
            
            if (err.response?.status === 401) {
                setError('Authentication failed. Please login again.');
                localStorage.removeItem('buyerAccessToken');
                localStorage.removeItem('buyerRefreshToken');
            } else {
                setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to submit review');
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div style={styles.reviewForm}>
            <h4 style={styles.reviewFormTitle}>Write Your Review</h4>
            
            {error && (
                <div style={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div style={styles.successMessage}>
                    <CheckCircle size={16} />
                    <span>{success}</span>
                </div>
            )}
            
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
                        <>
                            <div style={styles.buttonSpinner}></div>
                            Submitting Review...
                        </>
                    ) : (
                        <>
                            <MessageSquare size={16} />
                            Submit Review
                        </>
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
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div style={styles.reviewItem}>
            <div style={styles.reviewHeader}>
                <div style={styles.reviewerInfo}>
                    <div style={styles.reviewerAvatar}>
                        <User size={20} />
                    </div>
                    <div>
                        <h5 style={styles.reviewerName}>
                            {review.buyer?.full_name || 'Anonymous Customer'}
                        </h5>
                        <StarRating rating={review.rating} showCount={false} />
                    </div>
                </div>
                <div style={styles.reviewDate}>
                    <Calendar size={14} />
                    <span>{formatDate(review.created_at)}</span>
                </div>
            </div>
            <p style={styles.reviewComment}>{review.comment}</p>
        </div>
    );
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    
    console.log('=== ROUTE DEBUG INFO ===');
    console.log('Current URL:', typeof window !== 'undefined' ? window.location.pathname : 'N/A');
    console.log('All params from useParams():', params);
    
    const { shopId, sellerId, productId } = params || {};
    
    const fallbackProductId = typeof window !== 'undefined' ? 
        window.location.pathname.split('/').pop() : null;
    
    const finalProductId = productId || fallbackProductId;
    console.log('Final productId to use:', finalProductId);

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [buyerStatus, setBuyerStatus] = useState({ isLoggedIn: false, isVerified: false, profile: null });
    const [canReview, setCanReview] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const { addToCart } = useCart();

    const checkBuyerStatus = async () => {
        console.log('🔍 Checking buyer status...');
        
        const token = localStorage.getItem('buyerAccessToken');
        if (!token) {
            console.log('❌ No token found, user not logged in');
            setBuyerStatus({ isLoggedIn: false, isVerified: false, profile: null });
            return;
        }
        
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(BUYER_PROFILE_URL, { headers });
            console.log('✅ Profile fetch successful:', response.data);
            
            setBuyerStatus({ 
                isLoggedIn: true, 
                isVerified: response.data.phone_verified,
                profile: response.data
            });
            
        } catch (err) {
            console.error('❌ Profile fetch failed:', err.response?.status, err.response?.data);
            
            if (err.response?.status === 401) {
                localStorage.removeItem('buyerAccessToken');
                localStorage.removeItem('buyerRefreshToken');
            }
            
            setBuyerStatus({ isLoggedIn: false, isVerified: false, profile: null });
        }
    };

    const fetchPageData = async () => {
        if (!finalProductId) {
            setError('No product ID provided');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            
            console.log('📦 Fetching product from:', `${API_URL}${finalProductId}/`);
            
            const productResponse = await axios.get(`${API_URL}${finalProductId}/`);
            console.log('✅ Product response:', productResponse.data);
            setProduct(productResponse.data);

            await fetchReviews();

            if (buyerStatus.isLoggedIn) {
                await checkReviewPermission();
            }

        } catch (err) {
            console.error('❌ Failed to fetch product:', err);
            
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
            console.log('📋 Fetching reviews from:', `${API_URL}${finalProductId}/reviews/`);
            const reviewsResponse = await axios.get(`${API_URL}${finalProductId}/reviews/`);
            console.log('✅ Reviews response:', reviewsResponse.data);
            setReviews(reviewsResponse.data.results || reviewsResponse.data || []);
        } catch (reviewError) {
            console.log('⚠️ Reviews fetch failed:', reviewError.message);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    const checkReviewPermission = async () => {
        const isTokenValid = await checkTokenValidity();
        if (!isTokenValid) {
            setCanReview(false);
            return;
        }

        try {
            console.log('🔍 Checking review permission for product:', finalProductId);
            
            const canReviewResponse = await axios.get(
                `${API_URL}${finalProductId}/can-review/`,
                { headers: getAuthHeaders() }
            );
            
            console.log('✅ Can review response:', canReviewResponse.data);
            setCanReview(canReviewResponse.data.can_review);
            
        } catch (e) {
            console.error('❌ Can review check failed:', e.response?.status, e.response?.data);
            setCanReview(false);
        }
    };

    useEffect(() => {
        checkBuyerStatus();
    }, []);

    useEffect(() => {
        fetchPageData();
    }, [finalProductId]);

    useEffect(() => {
        if (buyerStatus.isLoggedIn && finalProductId) {
            checkReviewPermission();
        } else {
            setCanReview(false);
        }
    }, [buyerStatus.isLoggedIn, finalProductId]);

    const handleReviewSubmitted = () => {
        fetchReviews();
        fetchPageData();
    };

    const handleAddToCart = () => {
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
        
        if (product.store && product.store.seller_phone) {
            addToCart(product.store.seller_phone, product);
            alert('Product added to cart successfully!');
        } else {
            alert("Cannot add to cart, seller information is missing.");
        }
    };

    const handleWishlistToggle = async () => {
        if (!buyerStatus.isLoggedIn) {
            router.push('/login/buyer');
            return;
        }
        
        // Add wishlist functionality here
        alert('Wishlist functionality to be implemented');
    };

    const handleShare = () => {
        if (navigator.share && product) {
            navigator.share({
                title: product.name,
                text: `Check out this product: ${product.name}`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Product link copied to clipboard!');
            });
        }
    };

    if (isLoading) {
        return (
            <div style={styles.pageContainer}>
                <SHeader store={product?.store || null} isLoggedIn={buyerStatus.isLoggedIn} />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.pageContainer}>
                <SHeader store={product?.store || null} isLoggedIn={buyerStatus.isLoggedIn} />
                <div style={styles.errorContainer}>
                    <AlertCircle size={48} color="#ef4444" />
                    <h2>Error Loading Product</h2>
                    <p style={styles.errorText}>{error}</p>
                    <button onClick={fetchPageData} style={styles.retryButton}>
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={styles.pageContainer}>
                <SHeader store={null} isLoggedIn={buyerStatus.isLoggedIn} />
                <div style={styles.errorContainer}>
                    <p>Product not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <SHeader store={product?.store || null} isLoggedIn={buyerStatus.isLoggedIn} />
            
            {/* Back Navigation */}
            <div style={styles.backNavigation}>
                <button onClick={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
            </div>
            
            {/* Product Details Section */}
            <div style={styles.container}>
                <div style={styles.productLayout}>
                    <div style={styles.imageContainer}>
                        <img 
                            src={product.main_image_url || `https://via.placeholder.com/400x400/e9ecef/6c757d?text=${encodeURIComponent(product.name?.slice(0, 2) || 'No')}`} 
                            alt={product.name} 
                            style={styles.image}
                            onError={(e) => {
                                e.target.src = `https://via.placeholder.com/400x400/e9ecef/6c757d?text=${encodeURIComponent(product.name?.slice(0, 2) || 'No')}`;
                            }}
                        />
                    </div>
                    
                    <div style={styles.detailsContainer}>
                        <div style={styles.productHeader}>
                            <h1 style={styles.productName}>{product.name}</h1>
                            <div style={styles.actionButtons}>
                                <button onClick={handleWishlistToggle} style={styles.iconButton}>
                                    <Heart size={20} />
                                </button>
                                <button onClick={handleShare} style={styles.iconButton}>
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        {product.model_name && (
                            <p style={styles.modelName}>Model: {product.model_name}</p>
                        )}
                        
                        <StarRating 
                            rating={product.average_rating || 0} 
                            reviewCount={product.review_count || 0} 
                        />

                        <div style={styles.priceContainer}>
                            <span style={styles.currentPrice}>₹{Number(product.price).toLocaleString('en-IN')}</span>
                            {product.mrp && product.mrp > product.price && (
                                <>
                                    <span style={styles.originalPrice}>₹{Number(product.mrp).toLocaleString('en-IN')}</span>
                                    <span style={styles.discount}>
                                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        <div style={styles.stockInfo}>
                            {product.online_stock > 0 ? (
                                <span style={styles.inStock}>
                                    <CheckCircle size={16} />
                                    {product.online_stock} available
                                </span>
                            ) : (
                                <span style={styles.outOfStock}>
                                    <AlertCircle size={16} />
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        {product.description && (
                            <div style={styles.descriptionSection}>
                                <h3>Description</h3>
                                <p style={styles.description}>{product.description}</p>
                            </div>
                        )}
                        
                        <button 
                            style={{
                                ...styles.addToCartButton,
                                ...(product.online_stock === 0 ? styles.disabledCartButton : {})
                            }} 
                            disabled={product.online_stock === 0}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart size={18} />
                            {product.online_stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
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
                            productId={finalProductId} 
                            onReviewSubmitted={handleReviewSubmitted} 
                        />
                    ) : (
                        <div style={styles.cannotReviewMessage}>
                            <AlertCircle size={16} />
                            <p>You can only review products you have purchased and received.</p>
                        </div>
                    )
                ) : (
                    <div style={styles.loginPrompt}>
                        <MessageSquare size={20} />
                        <div>
                            <p>Want to share your experience?</p>
                            <a href="/login/buyer" style={styles.loginLink}>Login to write a review</a>
                        </div>
                    </div>
                )}
                
                <div style={styles.reviewsList}>
                    <h3>All Reviews ({reviews.length})</h3>
                    
                    {reviewsLoading ? (
                        <div style={styles.reviewsLoading}>
                            <div style={styles.spinner}></div>
                            <p>Loading reviews...</p>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div style={styles.reviewsContainer}>
                            {reviews.map(review => (
                                <ReviewItem key={review.id} review={review} />
                            ))}
                        </div>
                    ) : (
                        <div style={styles.noReviews}>
                            <MessageSquare size={48} />
                            <h4>No reviews yet</h4>
                            <p>Be the first to review this product!</p>
                        </div>
                    )}
                </div>
            </div>

            {product.store?.whatsapp_number && (
                <WhatsAppButton phoneNumber={product.store.whatsapp_number} />
            )}

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
    },

    // Navigation
    backNavigation: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 0'
    },
    
    backButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        padding: '8px 20px',
        transition: 'color 0.2s'
    },

    // Loading and Error States
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px'
    },
    
    spinner: {
        width: '32px',
        height: '32px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    
    buttonSpinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px',
        textAlign: 'center',
        padding: '40px'
    },
    
    errorText: {
        color: '#ef4444',
        marginBottom: '20px',
        maxWidth: '500px'
    },
    
    retryButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500'
    },

    // Main Layout
    container: { 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '24px 20px',
        animation: 'fadeIn 0.6s ease-out'
    },
    
    productLayout: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: '24px'
        }
    },
    
    imageContainer: { 
        position: 'sticky',
        top: '100px',
        height: 'fit-content'
    },
    
    image: { 
        width: '100%', 
        height: '500px',
        objectFit: 'cover',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    
    detailsContainer: { 
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
    },

    // Product Header
    productHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
    },
    
    productName: { 
        fontSize: '2rem', 
        fontWeight: '700',
        color: '#1f2937',
        margin: 0,
        flex: 1
    },
    
    actionButtons: {
        display: 'flex',
        gap: '8px'
    },
    
    iconButton: {
        width: '40px',
        height: '40px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        transition: 'all 0.2s'
    },
    
    modelName: { 
        color: '#6b7280', 
        margin: '0 0 16px 0',
        fontSize: '16px'
    },

    // Rating
    starContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        margin: '16px 0',
        flexWrap: 'wrap'
    },
    
    stars: {
        display: 'flex',
        gap: '2px'
    },
    
    ratingDisplay: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
    },
    
    reviewCount: { 
        color: '#6b7280', 
        fontSize: '14px' 
    },

    // Pricing
    priceContainer: { 
        display: 'flex', 
        alignItems: 'baseline', 
        gap: '12px', 
        margin: '20px 0',
        flexWrap: 'wrap'
    },
    
    currentPrice: { 
        fontSize: '2rem', 
        fontWeight: '700',
        color: '#10b981'
    },
    
    originalPrice: { 
        textDecoration: 'line-through', 
        color: '#9ca3af',
        fontSize: '1.2rem'
    },
    
    discount: {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600'
    },

    // Stock Info
    stockInfo: {
        margin: '20px 0'
    },
    
    inStock: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#10b981',
        fontWeight: '600',
        fontSize: '16px'
    },
    
    outOfStock: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#ef4444',
        fontWeight: '600',
        fontSize: '16px'
    },

    // Description
    descriptionSection: {
        margin: '24px 0'
    },
    
    description: { 
        lineHeight: '1.6',
        color: '#374151',
        fontSize: '16px',
        margin: '8px 0 0 0'
    },

    // Add to Cart Button
    addToCartButton: { 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%', 
        padding: '16px', 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        border: 'none', 
        borderRadius: '12px', 
        fontSize: '16px', 
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginTop: '24px'
    },
    
    disabledCartButton: {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed'
    },
    
    // Reviews Section
    reviewsSection: { 
        maxWidth: '1200px', 
        margin: '40px auto 0', 
        padding: '0 20px'
    },
    
    reviewsHeader: {
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '16px 16px 0 0',
        border: '1px solid #e5e7eb',
        borderBottom: 'none',
        textAlign: 'center'
    },
    
    reviewsSummary: {
        marginTop: '16px'
    },

    // Review Form
    reviewForm: { 
        backgroundColor: 'white',
        border: '1px solid #e5e7eb', 
        borderTop: 'none',
        borderBottom: 'none',
        padding: '32px'
    },
    
    reviewFormTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '20px'
    },
    
    errorMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#ef4444',
        backgroundColor: '#fef2f2',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #fecaca'
    },
    
    successMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#10b981',
        backgroundColor: '#ecfdf5',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #bbf7d0'
    },
    
    ratingSection: {
        marginBottom: '20px'
    },
    
    label: {
        display: 'block',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#374151',
        fontSize: '14px'
    },
    
    starRatingInput: { 
        display: 'flex', 
        alignItems: 'center',
        gap: '8px',
        marginTop: '8px'
    },
    
    starButton: {
        cursor: 'pointer',
        transition: 'transform 0.2s'
    },
    
    ratingText: {
        marginLeft: '12px',
        color: '#6b7280',
        fontSize: '14px'
    },
    
    commentSection: {
        marginBottom: '20px'
    },
    
    textarea: { 
        width: '100%', 
        minHeight: '100px', 
        padding: '12px 16px', 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px',
        resize: 'vertical',
        fontFamily: 'inherit',
        fontSize: '16px',
        lineHeight: '1.5',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
    },
    
    charCount: {
        color: '#6b7280',
        fontSize: '12px',
        marginTop: '6px',
        display: 'block'
    },
    
    submitButton: { 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 24px', 
        border: 'none', 
        borderRadius: '8px', 
        backgroundColor: '#10b981', 
        color: 'white', 
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s'
    },
    
    disabledButton: {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed'
    },

    // Review Messages
    loginPrompt: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: 'white',
        padding: '24px 32px',
        textAlign: 'left',
        border: '1px solid #e5e7eb',
        borderTop: 'none',
        borderBottom: 'none'
    },
    
    loginLink: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontWeight: '600'
    },
    
    cannotReviewMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#fffbeb',
        color: '#92400e',
        padding: '20px 32px',
        border: '1px solid #fde68a',
        borderTop: 'none',
        borderBottom: 'none'
    },
    
    // Reviews List
    reviewsList: {
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0 0 16px 16px',
        padding: '32px'
    },
    
    reviewsLoading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '40px',
        color: '#6b7280'
    },
    
    reviewsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        marginTop: '24px'
    },
    
    reviewItem: {
        padding: '24px',
        border: '1px solid #f3f4f6',
        borderRadius: '12px',
        backgroundColor: '#f8fafc'
    },
    
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
        gap: '16px'
    },
    
    reviewerInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    
    reviewerAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280'
    },
    
    reviewerName: {
        margin: '0 0 8px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937'
    },
    
    reviewDate: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#6b7280'
    },
    
    reviewComment: {
        margin: 0,
        lineHeight: '1.6',
        color: '#374151',
        fontSize: '15px'
    },
    
    noReviews: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '60px 40px',
        color: '#6b7280',
        textAlign: 'center'
    }
};
