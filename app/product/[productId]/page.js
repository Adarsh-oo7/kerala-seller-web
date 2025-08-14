'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import WhatsAppButton from '../../../components/common/WhatsAppButton';
import Header from '../../../components/common/Header';
import { Star } from 'lucide-react';

const API_URL = 'http://localhost:8000/user/store/products/';
const BUYER_PROFILE_URL = 'http://localhost:8000/api/buyer/profile/'; 
const REVIEWS_API_URL = 'http://localhost:8000/user/store/products/'; // Base URL

// --- Review Form Component ---
function ReviewForm({ productId, onReviewSubmitted }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        const token = localStorage.getItem('buyerAccessToken');
        try {
            await axios.post(`${REVIEWS_API_URL}${productId}/create-review/`, 
                { rating, comment }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComment('');
            setRating(5);
            onReviewSubmitted(); // Refresh the reviews list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div style={styles.reviewForm}>
            <h4>Write Your Review</h4>
            <div style={styles.starRatingInput}>
                {[...Array(5)].map((_, index) => (
                    <Star
                        key={index}
                        size={24}
                        onClick={() => setRating(index + 1)}
                        color={index < rating ? "#ffc107" : "#e4e5e9"}
                        fill={index < rating ? "#ffc107" : "none"}
                        style={{cursor: 'pointer'}}
                    />
                ))}
            </div>
            <textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder="Share your thoughts about the product..." 
                style={styles.textarea}
            />
            <button 
                type="submit" 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                style={styles.button}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
            {error && <p style={{color: 'red', marginTop: '10px'}}>{error}</p>}
        </div>
    );
}

// --- Star Rating Component ---
function StarRating({ rating = 0, reviewCount = 0 }) {
    const totalStars = 5;
    const fullStars = Math.round(rating);

    return (
        <div style={styles.starContainer}>
            {[...Array(totalStars)].map((_, index) => (
                <Star
                    key={index}
                    size={20}
                    color={index < fullStars ? "#ffc107" : "#e4e5e9"}
                    fill={index < fullStars ? "#ffc107" : "#e4e5e9"}
                />
            ))}
            {reviewCount > 0 && <span style={styles.reviewCount}>({reviewCount} reviews)</span>}
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
    
    const { productId } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();

    // Debug logging
    console.log('ProductDetailPage - productId:', productId);
    console.log('API_URL:', API_URL);
    console.log('Full URL:', `${API_URL}${productId}/`);

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
            
            // First try to fetch the product
            console.log('Fetching product from:', `${API_URL}${productId}/`);
            const productResponse = await axios.get(`${API_URL}${productId}/`);
            console.log('Product response:', productResponse.data);
            setProduct(productResponse.data);

            // Then try to fetch reviews (optional)
            try {
                console.log('Fetching reviews from:', `${REVIEWS_API_URL}${productId}/reviews/`);
                const reviewsResponse = await axios.get(`${REVIEWS_API_URL}${productId}/reviews/`);
                console.log('Reviews response:', reviewsResponse.data);
                setReviews(reviewsResponse.data.results || reviewsResponse.data || []);
            } catch (reviewError) {
                console.log('Reviews fetch failed (this is optional):', reviewError.message);
                setReviews([]); // Set empty array if reviews endpoint doesn't exist
            }

        } catch (err) {
            console.error('Failed to fetch product:', err);
            console.error('Error response:', err.response);
            
            if (err.response) {
                // Server responded with error status
                setError(`Server error: ${err.response.status} - ${err.response.data?.detail || err.response.statusText}`);
            } else if (err.request) {
                // Request was made but no response received
                setError('Network error: Unable to connect to server. Make sure your backend is running.');
            } else {
                // Something else happened
                setError(`Error: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
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
                    setCanReview(true); // User can review if logged in
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
        } else {
            alert("Cannot add to cart, seller information is missing.");
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div>
                <Header />
                <p style={{textAlign: 'center', marginTop: '50px'}}>Loading product details...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div>
                <Header />
                <div style={{textAlign: 'center', marginTop: '50px', padding: '20px'}}>
                    <h2>Error Loading Product</h2>
                    <p style={{color: 'red', marginBottom: '20px'}}>{error}</p>
                    <button 
                        onClick={fetchPageData}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#0d6efd',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                    <div style={{marginTop: '20px', fontSize: '14px', color: '#666'}}>
                        <p>Troubleshooting tips:</p>
                        <ul style={{textAlign: 'left', maxWidth: '400px', margin: '0 auto'}}>
                            <li>Make sure your backend server is running on localhost:8000</li>
                            <li>Check that the product ID in the URL is correct</li>
                            <li>Verify the API endpoint exists: {`${API_URL}${productId}/`}</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // No product found state
    if (!product) {
        return (
            <div>
                <Header />
                <p style={{textAlign: 'center', marginTop: '50px'}}>Product not found.</p>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div style={styles.container}>
                <div style={styles.imageContainer}>
                    <img src={product.image_url || '/placeholder.png'} alt={product.name} style={styles.image} />
                </div>
                <div style={styles.detailsContainer}>
                    <h1 style={styles.name}>{product.name}</h1>
                    {product.model_name && <p style={styles.model}>{product.model_name}</p>}
                    
                    <StarRating rating={product.average_rating} reviewCount={product.review_count} />

                    <p style={styles.description}>{product.description}</p>
                    <div style={styles.priceContainer}>
                        <span style={styles.price}>₹{product.price}</span>
                        {product.mrp && <span style={styles.mrp}>MRP: ₹{product.mrp}</span>}
                    </div>
                    <p style={styles.stock}>
                        {product.online_stock > 0 ? `${product.online_stock} available` : 'Out of Stock'}
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
                <h2>Customer Reviews ({product?.review_count || 0})</h2>
                <StarRating rating={product?.average_rating} reviewCount={product?.review_count} />
                
                {/* Only show the form if the user can review */}
                {canReview && (
                    <ReviewForm 
                        productId={productId} 
                        onReviewSubmitted={fetchPageData} 
                    />
                )}
                
                <div style={styles.reviewList}>
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} style={styles.review}>
                                <StarRating rating={review.rating} />
                                <p><strong>{review.buyer_name || 'Anonymous'}</strong></p>
                                <p>{review.comment}</p>
                                <span style={{fontSize: '0.8rem', color: '#6c757d'}}>
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p style={{color: '#666', fontStyle: 'italic'}}>No reviews yet. Be the first to review!</p>
                    )}
                </div>
            </div>

            <WhatsAppButton phoneNumber={product.store?.whatsapp_number} />
        </div>
    );
}

const styles = {
    container: { display: 'flex', maxWidth: '1000px', margin: '40px auto', padding: '20px', gap: '40px' },
    imageContainer: { flex: 1 },
    image: { width: '100%', borderRadius: '8px' },
    detailsContainer: { flex: 1 },
    name: { fontSize: '2.5rem', margin: '0 0 10px 0' },
    model: { color: '#666', marginTop: 0 },
    starContainer: { display: 'flex', alignItems: 'center', gap: '4px', margin: '10px 0' },
    reviewCount: { marginLeft: '10px', color: '#6c757d', fontSize: '0.9rem' },
    description: { lineHeight: '1.6' },
    priceContainer: { display: 'flex', alignItems: 'baseline', gap: '15px', margin: '2rem 0' },
    price: { fontSize: '2rem', fontWeight: 'bold' },
    mrp: { textDecoration: 'line-through', color: '#999' },
    stock: { color: 'green', fontWeight: 'bold' },
    addToCartButton: { 
        width: '100%', 
        padding: '15px', 
        backgroundColor: '#0d6efd', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px', 
        fontSize: '1.1rem', 
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
    },
    reviewsSection: { 
        maxWidth: '1000px', 
        margin: '40px auto', 
        padding: '20px', 
        borderTop: '1px solid #eee' 
    },
    reviewForm: { 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        padding: '20px', 
        margin: '20px 0', 
        backgroundColor: '#f8f9fa' 
    },
    starRatingInput: { 
        display: 'flex', 
        gap: '5px', 
        marginBottom: '15px' 
    },
    textarea: { 
        width: '100%', 
        minHeight: '80px', 
        padding: '10px', 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        resize: 'vertical',
        fontFamily: 'inherit'
    },
    button: { 
        marginTop: '10px', 
        padding: '10px 20px', 
        border: 'none', 
        borderRadius: '5px', 
        backgroundColor: '#0d6efd', 
        color: 'white', 
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
    },
    reviewList: { 
        marginTop: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px' 
    },
    review: { 
        borderBottom: '1px solid #f0f0f0', 
        paddingBottom: '15px' 
    }
};