'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import WhatsAppButton from '../../../components/common/WhatsAppButton';
import Header from '../../../components/common/Header';
import { Star } from 'lucide-react';

// ✅ Correct API URLs based on your Django setup
const API_URL = 'http://localhost:8000/api/products/';
const BUYER_PROFILE_URL = 'http://localhost:8000/api/buyer/profile/'; 

// Enhanced Review Form Component
function ReviewForm({ productId, onReviewSubmitted }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
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
            
            // Reset form
            setComment('');
            setRating(5);
            setSuccess('Review submitted successfully!');
            
            // Refresh reviews
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
            <h4>Write Your Review</h4>
            
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
                    {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
}

// Enhanced Star Rating Component
function StarRating({ rating = 0, reviewCount = 0, showCount = true }) {
    const totalStars = 5;
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

export default function ProductDetailPage() {
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [buyerStatus, setBuyerStatus] = useState({ isLoggedIn: false, isVerified: false });
    const [canReview, setCanReview] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    
    const { productId } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();

    // Fetch product and reviews data
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
            
            // Fetch product details
            const productResponse = await axios.get(`${API_URL}${productId}/`);
            console.log('Product response:', productResponse.data);
            setProduct(productResponse.data);

            // Fetch reviews
            await fetchReviews();

            // Check if user can review
            await checkReviewPermission();

        } catch (err) {
            console.error('Failed to fetch product:', err);
            console.error('Error response:', err.response);
            
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

    // Separate function to fetch reviews
    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            console.log('Fetching reviews from:', `${API_URL}${productId}/reviews/`);
            const reviewsResponse = await axios.get(`${API_URL}${productId}/reviews/`);
            console.log('Reviews response:', reviewsResponse.data);
            setReviews(reviewsResponse.data.results || reviewsResponse.data || []);
        } catch (reviewError) {
            console.log('Reviews fetch failed:', reviewError.message);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    // Check if user can review
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

    // Check buyer status
    useEffect(() => {
        const token = localStorage.getItem('buyerAccessToken');
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
        }
    }, []);

    // Fetch initial data
    useEffect(() => {
        fetchPageData();
    }, [productId]);

    // Handle review submission callback
    const handleReviewSubmitted = () => {
        fetchReviews();
        fetchPageData(); // Refresh product to update average rating
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

    // Loading state
    if (isLoading) {
        return (
            <div>
                <Header />
                <div style={styles.loadingContainer}>
                    <p>Loading product details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div>
                <Header />
                <div style={styles.errorContainer}>
                    <h2>Error Loading Product</h2>
                    <p style={styles.errorText}>{error}</p>
                    <button onClick={fetchPageData} style={styles.retryButton}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No product found state
    if (!product) {
        return (
            <div>
                <Header />
                <div style={styles.errorContainer}>
                    <p>Product not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            
            {/* Product Details Section */}
            <div style={styles.container}>
                <div style={styles.imageContainer}>
                    <img 
                        src={product.main_image_url || 'https://placehold.co/400x400?text=No+Image'} 
                        alt={product.name} 
                        style={styles.image}
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/400x400?text=No+Image';
                        }}
                    />
                </div>
                
                <div style={styles.detailsContainer}>
                    <h1 style={styles.name}>{product.name}</h1>
                    {product.model_name && <p style={styles.model}>Model: {product.model_name}</p>}
                    
                    <StarRating 
                        rating={product.average_rating || 0} 
                        reviewCount={product.review_count || 0} 
                    />

                    {product.description && <p style={styles.description}>{product.description}</p>}
                    
                    <div style={styles.priceContainer}>
                        <span style={styles.price}>₹{product.price}</span>
                        {product.mrp && product.mrp > product.price && (
                            <span style={styles.mrp}>MRP: ₹{product.mrp}</span>
                        )}
                    </div>
                    
                    <p style={styles.stock}>
                        {product.online_stock > 0 
                            ? `✓ ${product.online_stock} available` 
                            : '✗ Out of Stock'
                        }
                    </p>
                    
                    <button 
                        style={{
                            ...styles.addToCartButton,
                            backgroundColor: product.online_stock === 0 ? '#ccc' : '#0d6efd',
                            cursor: product.online_stock === 0 ? 'not-allowed' : 'pointer'
                        }} 
                        disabled={product.online_stock === 0}
                        onClick={handleAddToCart}
                    >
                        {product.online_stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
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
                
                {/* Review Form - Show only if user can review */}
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
                
                {/* Reviews List */}
                <div style={styles.reviewsList}>
                    <h3>All Reviews ({reviews.length})</h3>
                    
                    {reviewsLoading ? (
                        <p style={styles.loadingText}>Loading reviews...</p>
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
        </div>
    );
}

// Enhanced Styles
const styles = {
    loadingContainer: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '18px'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '50px',
        color: '#dc3545'
    },
    errorText: {
        color: '#dc3545',
        marginBottom: '20px'
    },
    retryButton: {
        padding: '10px 20px',
        backgroundColor: '#0d6efd',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    container: { 
        display: 'flex', 
        maxWidth: '1200px', 
        margin: '40px auto', 
        padding: '20px', 
        gap: '40px',
        flexWrap: 'wrap'
    },
    imageContainer: { 
        flex: 1,
        minWidth: '300px'
    },
    image: { 
        width: '100%', 
        maxWidth: '400px',
        height: '400px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
    },
    detailsContainer: { 
        flex: 1,
        minWidth: '300px'
    },
    name: { 
        fontSize: '2.5rem', 
        margin: '0 0 10px 0',
        color: '#333'
    },
    model: { 
        color: '#666', 
        margin: '0 0 15px 0'
    },
    starContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        margin: '15px 0',
        flexWrap: 'wrap'
    },
    stars: {
        display: 'flex',
        gap: '2px'
    },
    ratingDisplay: {
        fontSize: '0.9rem',
        color: '#666',
        fontWeight: '500'
    },
    reviewCount: { 
        color: '#6c757d', 
        fontSize: '0.9rem' 
    },
    description: { 
        lineHeight: '1.6',
        margin: '20px 0',
        color: '#555'
    },
    priceContainer: { 
        display: 'flex', 
        alignItems: 'baseline', 
        gap: '15px', 
        margin: '25px 0',
        flexWrap: 'wrap'
    },
    price: { 
        fontSize: '2.5rem', 
        fontWeight: 'bold',
        color: '#28a745'
    },
    mrp: { 
        textDecoration: 'line-through', 
        color: '#999',
        fontSize: '1.5rem'
    },
    stock: { 
        fontWeight: 'bold',
        margin: '15px 0',
        fontSize: '1.1rem'
    },
    addToCartButton: { 
        width: '100%', 
        padding: '15px', 
        backgroundColor: '#0d6efd', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontSize: '1.1rem', 
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    
    // Reviews Section Styles
    reviewsSection: { 
        maxWidth: '1200px', 
        margin: '60px auto', 
        padding: '40px 20px', 
        borderTop: '2px solid #e9ecef',
        backgroundColor: '#f8f9fa'
    },
    reviewsHeader: {
        marginBottom: '30px',
        textAlign: 'center'
    },
    reviewsSummary: {
        marginTop: '15px'
    },
    loginPrompt: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        margin: '20px 0',
        border: '1px solid #e9ecef'
    },
    loginLink: {
        color: '#0d6efd',
        textDecoration: 'none',
        fontWeight: '600'
    },
    cannotReviewMessage: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px 0',
        border: '1px solid #ffeaa7'
    },
    
    // Review Form Styles
    reviewForm: { 
        backgroundColor: '#ffffff',
        border: '1px solid #e9ecef', 
        borderRadius: '12px', 
        padding: '30px', 
        margin: '30px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    errorMessage: {
        color: '#dc3545',
        backgroundColor: '#f8d7da',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '15px',
        border: '1px solid #f5c6cb'
    },
    successMessage: {
        color: '#155724',
        backgroundColor: '#d4edda',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '15px',
        border: '1px solid #c3e6cb'
    },
    ratingSection: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#333'
    },
    starRatingInput: { 
        display: 'flex', 
        alignItems: 'center',
        gap: '5px',
        marginTop: '8px'
    },
    starButton: {
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    ratingText: {
        marginLeft: '10px',
        color: '#666',
        fontSize: '0.9rem'
    },
    commentSection: {
        marginBottom: '20px'
    },
    textarea: { 
        width: '100%', 
        minHeight: '100px', 
        padding: '12px', 
        border: '1px solid #e9ecef', 
        borderRadius: '8px',
        resize: 'vertical',
        fontFamily: 'inherit',
        fontSize: '1rem',
        lineHeight: '1.5'
    },
    charCount: {
        color: '#6c757d',
        fontSize: '0.8rem',
        marginTop: '5px'
    },
    submitButton: { 
        padding: '12px 30px', 
        border: 'none', 
        borderRadius: '8px', 
        backgroundColor: '#28a745', 
        color: 'white', 
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.3s ease'
    },
    disabledButton: {
        backgroundColor: '#6c757d',
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
        backgroundColor: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
        color: '#333'
    },
    reviewDate: {
        fontSize: '0.85rem',
        color: '#6c757d'
    },
    reviewComment: {
        margin: 0,
        lineHeight: '1.6',
        color: '#333',
        fontSize: '1rem'
    },
    noReviews: {
        textAlign: 'center',
        padding: '40px',
        color: '#666',
        fontStyle: 'italic',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
    },
    loadingText: {
        textAlign: 'center',
        color: '#666',
        padding: '20px'
    }
};
