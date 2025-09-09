'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import WhatsAppButton from '../../../components/common/WhatsAppButton';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield } from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/products/`;
const BUYER_PROFILE_URL = `${API_BASE_URL}/api/buyer/profile/`;

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

export default function ProductDetailPage() {
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [buyerStatus, setBuyerStatus] = useState({ isLoggedIn: false, isVerified: false });
    const [canReview, setCanReview] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    
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
                <div style={styles.productLayout}>
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
                        
                        <div style={styles.stockContainer}>
                            <p style={styles.stock}>
                                {product.online_stock > 0 
                                    ? `✓ ${product.online_stock} available` 
                                    : '✗ Out of Stock'
                                }
                            </p>
                        </div>

                        {/* Features */}
                        <div style={styles.features}>
                            <div style={styles.feature}>
                                <Truck size={16} />
                                <span>Free Delivery</span>
                            </div>
                            <div style={styles.feature}>
                                <Shield size={16} />
                                <span>Secure Payment</span>
                            </div>
                        </div>
                        
                        <div style={styles.actionButtons}>
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

                            <div style={styles.secondaryActions}>
                                <button style={styles.secondaryButton}>
                                    <Heart size={16} />
                                </button>
                                <button style={styles.secondaryButton}>
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
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}

// Enhanced Styles
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
    
    imageContainer: { 
        display: 'flex',
        justifyContent: 'center'
    },
    
    image: { 
        width: '100%', 
        maxWidth: '500px',
        height: '500px',
        objectFit: 'cover',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
    
    stockContainer: {
        margin: '10px 0'
    },
    
    stock: { 
        fontWeight: '600',
        margin: 0,
        fontSize: '1rem',
        color: '#374151'
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
        gap: '12px',
        alignItems: 'center'
    },
    
    addToCartButton: { 
        flex: 1,
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
    
    buttonContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    
    secondaryActions: {
        display: 'flex',
        gap: '8px'
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
    
    // Reviews Section Styles
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
