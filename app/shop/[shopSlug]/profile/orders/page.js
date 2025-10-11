'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import "../../../../../styles/ShopProfileOrders.css";
import SHeader from '../../../../../components/common/SHeader';

import {
  ArrowLeft, Package, Clock, CheckCircle, XCircle, Store, AlertTriangle, X, User,
  MapPin, Phone, Calendar, CreditCard, AlertOctagon, Star, RefreshCw, Check
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';




// ✅ Enhanced auth headers function
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') ||
    localStorage.getItem('buyerAccessToken') ||
    localStorage.getItem('buyerToken') ||
    localStorage.getItem('accessToken');

  return token ? { 'Authorization': `Bearer ${token}` } : null;
};

// ✅ ENHANCED: Product Review Form Component
function ProductReviewForm({ productId, productName, onReviewSubmitted, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const headers = getAuthHeaders();
    if (!headers) {
      setError('Please login to submit a review');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📝 Submitting product review:', { productId, rating, comment: comment.trim() });

      const response = await axios.post(
        `${API_BASE_URL}/api/products/${productId}/create-review/`,

        {
          rating,
          comment: comment.trim()
        },
        {
          headers,
          timeout: 15000
        }
      );

      console.log('✅ Review submitted successfully:', response.data);

      setComment('');
      setRating(5);
      setHoverRating(0);
      setSuccess('Review submitted successfully! Thank you for your feedback.');

      // Call parent callback to refresh reviews
      if (onReviewSubmitted) {
        setTimeout(() => {
          onReviewSubmitted();
          onClose && onClose();
        }, 2000);
      }

    } catch (err) {
      console.error('❌ Review submission error:', err);

      let errorMessage = 'Failed to submit review. Please try again.';

      if (err.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || err.response.data?.message || 'Invalid review data. Please check your input.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You can only review products you have purchased.';
      } else if (err.response?.status === 409) {
        errorMessage = 'You have already reviewed this product.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingDescription = (rating) => {
    switch (rating) {
      case 1: return "Poor - Not satisfied";
      case 2: return "Fair - Below expectations";
      case 3: return "Good - Met expectations";
      case 4: return "Very Good - Above expectations";
      case 5: return "Excellent - Outstanding product";
      default: return "";
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose && onClose();
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={handleOverlayClick}>
      <div style={styles.reviewModalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            <Star size={24} style={{ marginRight: '8px' }} />
            Review Product: {productName}
          </h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.reviewFormDescription}>
            Share your experience with this product to help other customers make informed decisions.
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={styles.successMessage}>
              <Check size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.detailSection}>
              <h3 style={styles.sectionTitle}>Your Rating:</h3>
              <div style={styles.starRatingInput}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={32}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    color={(hoverRating || rating) >= star ? "#fbbf24" : "#d1d5db"}
                    fill={(hoverRating || rating) >= star ? "#fbbf24" : "none"}
                    style={styles.ratingStarButton}
                  />
                ))}
              </div>
              <div style={styles.ratingDescription}>
                {getRatingDescription(hoverRating || rating)}
              </div>
            </div>

            <div style={styles.detailSection}>
              <h3 style={styles.sectionTitle}>Your Review:</h3>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience with this product. What did you like or dislike about it? How was the quality, delivery, and overall experience?"
                style={styles.reviewTextarea}
                rows={5}
                maxLength={1000}
                disabled={isSubmitting}
              />
              <div style={styles.charCountContainer}>
                <small style={styles.characterCount}>
                  {comment.length}/1000 characters (minimum 10 required)
                </small>
                {comment.length >= 10 && (
                  <span style={styles.validIndicator}>
                    <Check size={14} />
                    Ready to submit
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>

        <div style={styles.modalFooter}>
          <button
            style={styles.closeModalButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || comment.trim().length < 10}
            style={{
              ...styles.submitReviewButton,
              ...(isSubmitting || comment.trim().length < 10 ? styles.disabledButton : {})
            }}
          >
            {isSubmitting ? (
              <span style={styles.buttonContent}>
                <RefreshCw size={16} className="spinning" />
                Submitting Review...
              </span>
            ) : (
              <span style={styles.buttonContent}>
                <Star size={16} />
                Submit Review
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ ENHANCED: Product Review Button Component
function ProductReviewButton({ product, onReviewSubmitted }) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(false);

  // Check if user can review this product
  useEffect(() => {
    const checkReviewPermission = async () => {
      const headers = getAuthHeaders();
      if (!headers || !product?.id) {
        setCanReview(false);
        return;
      }

      setCheckingPermission(true);
      try {
        console.log('🔍 Checking review permission for product:', product.id);

        const response = await axios.get(
          `${API_BASE_URL}/api/products/${product.id}/can-review/`,
          {
            headers,
            timeout: 8000
          }
        );

        const canReviewProduct = response.data.can_review || false;
        console.log('✅ Can review status:', canReviewProduct);

        setCanReview(canReviewProduct);
      } catch (error) {
        console.warn('⚠️ Can review check failed:', error.message);

        // If endpoint doesn't exist, allow reviews for logged in users
        if (error.response?.status === 404) {
          setCanReview(true);
        } else {
          setCanReview(false);
        }
      } finally {
        setCheckingPermission(false);
      }
    };

    if (product?.id) {
      checkReviewPermission();
    }
  }, [product?.id]);

  const handleReviewClick = () => {
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    setCanReview(false); // Prevent multiple reviews
    if (onReviewSubmitted) {
      onReviewSubmitted();
    }
  };

  if (checkingPermission) {
    return (
      <div style={styles.checkingReview}>
        <RefreshCw size={14} className="spinning" />
        <span>Checking...</span>
      </div>
    );
  }

  if (!canReview) {
    return null;
  }

  return (
    <>
      <button
        style={styles.reviewProductButton}
        onClick={handleReviewClick}
      >
        <Star size={16} />
        Review Product
      </button>

      {showReviewModal && (
        <ProductReviewForm
          productId={product.id}
          productName={product.name}
          onReviewSubmitted={handleReviewSubmitted}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
}

export default function ShopOrdersPage() {
  const { shopSlug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [urlError, setUrlError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ ADD: Login state for SHeader


  // ✅ Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // ✅ Cancel order states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Pre-defined cancellation reasons
  const cancelReasons = [
    { value: 'change_mind', label: 'Changed my mind' },
    { value: 'found_better_price', label: 'Found a better price elsewhere' },
    { value: 'wrong_item', label: 'Ordered wrong item by mistake' },
    { value: 'delivery_delay', label: 'Delivery taking too long' },
    { value: 'payment_issue', label: 'Payment/billing issue' },
    { value: 'quality_concern', label: 'Concerned about product quality' },
    { value: 'duplicate_order', label: 'Duplicate order placed by mistake' },
    { value: 'seller_request', label: 'Seller requested cancellation' },
    { value: 'other', label: 'Other reason (please specify)' }
  ];

  // ✅ Get the actual store ID from query parameter or shopSlug
  const getActualStoreId = () => {
    console.log('🔍 Getting store ID for orders...');
    console.log('- shopSlug from params:', shopSlug);
    console.log('- id from search params:', searchParams.get('id'));

    if (shopSlug === 'undefined' || shopSlug === undefined) {
      setUrlError('Invalid shop slug in URL');
      return null;
    }

    const queryId = searchParams.get('id');
    if (queryId && queryId !== 'undefined' && queryId.trim() !== '') {
      return queryId.trim();
    }

    if (shopSlug && shopSlug !== 'new' && shopSlug !== 'undefined') {
      return shopSlug;
    }

    setUrlError('No valid store ID found');
    return null;
  };

  const actualStoreId = getActualStoreId();
  console.log('📦 Orders store ID:', actualStoreId);

  // ✅ URL generation with validation
  const getShopUrl = (path = '') => {
    if (!actualStoreId) {
      console.error('❌ Cannot generate URL - no store ID available');
      return '/';
    }

    if (searchParams.get('id') && shopSlug === 'new') {
      const basePath = `/shop/new${path}`;
      return `${basePath}?id=${actualStoreId}`;
    } else {
      return `/shop/${actualStoreId}${path}`;
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');
    if (!token) {
      const loginUrl = getShopUrl('/login');
      const currentUrl = getShopUrl('/profile/orders');
      const redirectUrl = `${loginUrl}?redirect=${encodeURIComponent(currentUrl)}`;
      console.log('🔐 No token, redirecting to login:', redirectUrl);
      router.push(redirectUrl);
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  };

  // ✅ REDIRECT: If we have an invalid URL, redirect appropriately
  useEffect(() => {
    if (urlError || !actualStoreId) {
      console.log('🔍 Invalid orders URL, redirecting...');
      router.replace('/profile');
      return;
    }
  }, [urlError, actualStoreId, router]);


  // ✅ ADD: Check login status for SHeader
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

  useEffect(() => {
    const fetchData = async () => {
      if (!actualStoreId) return;

      const headers = checkAuth();
      if (!headers) return;

      console.log('📦 Loading orders for store:', actualStoreId);

      try {
        const [ordersRes, storeRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/user/orders/?store_id=${actualStoreId}`, { headers }),
          fetch(`${API_BASE_URL}/shop/${actualStoreId}/`)
        ]);

        if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
          const ordersData = await ordersRes.value.json();
          const ordersList = Array.isArray(ordersData) ? ordersData : ordersData.results || [];
          setOrders(ordersList);
          console.log('✅ Orders loaded:', ordersList.length);
        } else {
          console.warn('⚠️ Orders API failed');
          setOrders([]);
        }

        if (storeRes.status === 'fulfilled' && storeRes.value.ok) {
          const storeResData = await storeRes.value.json();
          setStoreData(storeResData.store || storeResData);
          console.log('✅ Store data loaded for orders');
        } else {
          console.warn('⚠️ Store API failed, using fallback');
          setStoreData({
            name: `Store ${actualStoreId}`,
            seller_phone: actualStoreId,
            id: actualStoreId
          });
        }
      } catch (error) {
        console.error('❌ Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (actualStoreId && !urlError) {
      fetchData();
    }
  }, [actualStoreId]);

  // ✅ Handle view details
  const handleViewDetails = (order) => {
    console.log('👁️ Viewing order details:', order.id);
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // ✅ Close details modal
  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  // ✅ Handle cancel order request
  const handleCancelOrderRequest = (order) => {
    console.log('❌ Requesting to cancel order:', order.id);
    setOrderToCancel(order);
    setCancelReason('');
    setCustomReason('');
    setShowCancelModal(true);
  };

  // ✅ Close cancel modal
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setOrderToCancel(null);
    setCancelReason('');
    setCustomReason('');
  };

  // ✅ Handle cancel order submission
  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    if (!cancelReason) {
      alert('Please select a reason for cancellation');
      return;
    }

    if (cancelReason === 'other' && !customReason.trim()) {
      alert('Please provide a specific reason for cancellation');
      return;
    }

    const headers = checkAuth();
    if (!headers) return;

    setCancelLoading(true);

    try {
      const reasonText = cancelReason === 'other' ? customReason :
        cancelReasons.find(r => r.value === cancelReason)?.label || cancelReason;

      console.log('🚫 Cancelling order:', orderToCancel.id, 'with reason:', reasonText);

      const response = await fetch(`${API_BASE_URL}/user/orders/${orderToCancel.id}/cancel/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reasonText,
          cancel_reason_code: cancelReason
        })
      });

      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderToCancel.id
              ? { ...order, status: 'cancelled', cancel_reason: reasonText }
              : order
          )
        );

        console.log('✅ Order cancelled successfully');
        alert('Order cancelled successfully! The seller has been notified.');
        closeCancelModal();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to cancel order';
        console.error('❌ Cancel order failed:', errorMessage);
        alert(`Failed to cancel order: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Cancel order error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  // ✅ Check if order can be cancelled
  const canCancelOrder = (order) => {
    const status = order.status?.toLowerCase();
    const cancelableStatuses = ['pending', 'processing', 'confirmed'];
    return cancelableStatuses.includes(status);
  };

  // ✅ Handle keyboard events for modals
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        if (showCancelModal) {
          closeCancelModal();
        } else if (showOrderDetails) {
          closeOrderDetails();
        }
      }
    };

    if (showOrderDetails || showCancelModal) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [showOrderDetails, showCancelModal]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock size={20} className='profileordericonsize' color="#f59e0b" />;
      case 'processing': return <Package size={20} className='profileordericonsize' color="#3b82f6" />;
      case 'delivered': return <CheckCircle size={20} className='profileordericonsize' color="#10b981" />;
      case 'cancelled': return <XCircle size={20} className='profileordericonsize' color="#ef4444" />;
      default: return <Package size={20} className='profileordericonsize' color="#6b7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatPrice = (price) => `₹${parseFloat(price).toFixed(2)}`;
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (date) => {
    try {
      return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleBackClick = () => {
    const profileUrl = getShopUrl('/profile');
    console.log('🔙 Back to profile:', profileUrl);
    router.push(profileUrl);
  };

  const handleStartShopping = () => {
    const shopUrl = getShopUrl('');
    console.log('🛍️ Start shopping:', shopUrl);
    router.push(shopUrl);
  };

  // ✅ Handle review submitted callback
  const handleReviewSubmitted = () => {
    console.log('🔄 Product review submitted successfully! Reviews will appear in product pages.');
    alert('Review submitted successfully! Your review will appear on the product page.');
  };

  // Show loading while redirecting or loading
  if (loading || urlError) {
    return (
      <div style={styles.loadingContainer}>
        {urlError ? (
          <>
            <AlertTriangle size={48} color="#ef4444" />
            <h2>Invalid Orders URL</h2>
            <p>{urlError}</p>
            <p>Redirecting to profile...</p>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <p>Loading your orders...</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Store: {actualStoreId || 'Not found'}
            </p>
          </>
        )}
      </div>
    );
  }

  if (!actualStoreId) {
    return (
      <div style={styles.errorContainer}>
        <Store size={48} color="#ef4444" />
        <h2>Store Not Found</h2>
        <p>Unable to load orders for this store.</p>
        <button onClick={() => router.push('/profile')} style={styles.homeButton}>
          Go to Profile
        </button>
      </div>
    );
  }

  return (
    <div className='profilorderspagecont' style={styles.pagecontainer}>
      <SHeader
        store={storeData}
        isLoggedIn={isLoggedIn}
      />
      <div style={styles.container}>
        {/* Header */}


        {/* Store Context */}
        <div style={styles.storeIndicator}>
          <button onClick={handleBackClick} style={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Package size={16} />
            <span>Total {orders.length} order{orders.length !== 1 ? 's' : ''} you got.</span>
          </div>
        </div>


        {/* Orders List */}
        {orders.length === 0 ? (
          <div style={styles.emptyState}>
            <Package size={48} color="#ccc" />
            <h2>No orders yet</h2>
            <p>You haven't placed any orders from {storeData?.name || 'this store'}.</p>
            <button onClick={handleStartShopping} style={styles.shopButton}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {orders.map(order => (
              <div key={order.id} style={styles.orderCard}>


                <div style={styles.orderItems}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map(item => (
                      <div key={item.id} style={styles.orderItem}>
                        <div style={styles.itemInfo}>
                          <div className='profileorderitemname' style={styles.itemName}>
                            {item.product?.name || item.name || 'Product'}
                          </div>
                          <div className='profileorderitemdetails' style={styles.itemDetails}>
                            {formatPrice(item.price)} × {item.quantity}
                            <div className='profileorderdate' style={styles.orderDate}>{formatDate(order.created_at)}</div>

                          </div>

                          {/* ✅ ONLY Product Review Button for delivered orders */}
                          {order.status?.toLowerCase() === 'delivered' && item.product && (
                            <div style={styles.productReviewSection}>
                              <ProductReviewButton
                                product={item.product}
                                onReviewSubmitted={handleReviewSubmitted}
                              />
                            </div>
                          )}
                        </div>

                        <div style={styles.orderHeader}>

                          <div style={styles.orderStatus}>
                            {getStatusIcon(order.status)}
                            <span
                            className='profileorderstatustext'
                              style={{
                                ...styles.statusText,
                                color: getStatusColor(order.status)
                              }}
                            >
                              {order.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={styles.noItems}>Items information not available</div>
                  )}
                </div>

                <div style={styles.orderFooter}>
                  <div style={styles.orderMeta}>
                    <div className='profileordertotalprice' style={styles.orderTotal}>
                      Total: {formatPrice(order.total_amount)}
                    </div>

                    <div style={styles.orderActions}>
                      {canCancelOrder(order) && (
                        <button
                        className='profileorderactionbtn'
                          style={{ ...styles.actionButton, backgroundColor: '#ef4444' }}
                          onClick={() => handleCancelOrderRequest(order)}
                        >
                          Cancel Order
                        </button>
                      )}
                      <button
                      className='profileorderactionbtn'
                        style={{ ...styles.actionButton }}
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* ✅ Show cancel reason if cancelled */}
                  {order.status?.toLowerCase() === 'cancelled' && order.cancel_reason && (
                    <div style={styles.cancelReason}>
                      <strong>Cancellation Reason:</strong> {order.cancel_reason}
                    </div>
                  )}
                </div>

                {/* Order Actions - NO ORDER RATING, ONLY PRODUCT REVIEWS */}

              </div>
            ))}
          </div>
        )}

        {/* ✅ Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div style={styles.modalOverlay} onClick={closeOrderDetails}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Order Details #{selectedOrder.id}</h2>
                <button style={styles.closeButton} onClick={closeOrderDetails}>
                  <X size={24} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.detailSection}>
                  <h3 style={styles.sectionTitle}>Order Status</h3>
                  <div style={styles.statusDetail}>
                    {getStatusIcon(selectedOrder.status)}
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: getStatusColor(selectedOrder.status),
                      textTransform: 'capitalize'
                    }}>
                      {selectedOrder.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div style={styles.detailSection}>
                  <h3 style={styles.sectionTitle}>Order Information</h3>
                  <div style={styles.infoGrid}>
                    <div style={styles.infoItem}>
                      <Calendar size={16} />
                      <div>
                        <div style={styles.infoLabel}>Order Date</div>
                        <div style={styles.infoValue}>{formatDateTime(selectedOrder.created_at)}</div>
                      </div>
                    </div>

                    <div style={styles.infoItem}>
                      <CreditCard size={16} />
                      <div>
                        <div style={styles.infoLabel}>Payment Method</div>
                        <div style={styles.infoValue}>
                          {selectedOrder.payment_method === 'COD' ? 'Cash on Delivery' :
                            selectedOrder.payment_method === 'ONLINE' ? 'Online Payment' :
                              selectedOrder.payment_method || 'COD'}
                        </div>
                      </div>
                    </div>

                    {selectedOrder.customer_name && (
                      <div style={styles.infoItem}>
                        <User size={16} />
                        <div>
                          <div style={styles.infoLabel}>Customer</div>
                          <div style={styles.infoValue}>{selectedOrder.customer_name}</div>
                        </div>
                      </div>
                    )}

                    {selectedOrder.phone && (
                      <div style={styles.infoItem}>
                        <Phone size={16} />
                        <div>
                          <div style={styles.infoLabel}>Phone</div>
                          <div style={styles.infoValue}>{selectedOrder.phone}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.detailSection}>
                  <h3 style={styles.sectionTitle}>Order Items</h3>
                  <div style={styles.itemsList}>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map(item => (
                        <div key={item.id} style={styles.modalOrderItem}>
                          <div style={styles.modalItemInfo}>
                            <div style={styles.modalItemName}>
                              {item.product?.name || item.name || 'Product'}
                            </div>
                            <div style={styles.modalItemPrice}>
                              {formatPrice(item.price)} × {item.quantity}
                            </div>
                            {item.product?.description && (
                              <div style={styles.modalItemDesc}>
                                {item.product.description}
                              </div>
                            )}
                            {/* ✅ Product Review in Modal for delivered orders */}
                            {selectedOrder.status?.toLowerCase() === 'delivered' && item.product && (
                              <div style={styles.modalProductReview}>
                                <ProductReviewButton
                                  product={item.product}
                                  onReviewSubmitted={handleReviewSubmitted}
                                />
                              </div>
                            )}
                          </div>
                          <div style={styles.modalItemTotal}>
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={styles.noItemsModal}>No items information available</div>
                    )}
                  </div>
                </div>

                {selectedOrder.shipping_address && (
                  <div style={styles.detailSection}>
                    <h3 style={styles.sectionTitle}>Delivery Address</h3>
                    <div style={styles.addressBox}>
                      <MapPin size={16} />
                      <div style={styles.addressText}>{selectedOrder.shipping_address}</div>
                    </div>
                  </div>
                )}

                {selectedOrder.status?.toLowerCase() === 'cancelled' && selectedOrder.cancel_reason && (
                  <div style={styles.detailSection}>
                    <h3 style={styles.sectionTitle}>Cancellation Reason</h3>
                    <div style={styles.cancelReasonBox}>
                      <AlertOctagon size={16} />
                      <div style={styles.cancelReasonText}>{selectedOrder.cancel_reason}</div>
                    </div>
                  </div>
                )}

                <div style={styles.detailSection}>
                  <div style={styles.totalSection}>
                    <div style={styles.totalLabel}>Order Total</div>
                    <div style={styles.totalAmount}>{formatPrice(selectedOrder.total_amount)}</div>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button style={styles.closeModalButton} onClick={closeOrderDetails}>
                  Close
                </button>
                {canCancelOrder(selectedOrder) && (
                  <button
                    style={styles.cancelModalButton}
                    onClick={() => {
                      closeOrderDetails();
                      handleCancelOrderRequest(selectedOrder);
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Cancel Order Modal */}
        {showCancelModal && orderToCancel && (
          <div style={styles.modalOverlay} onClick={closeCancelModal}>
            <div style={styles.cancelModalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  <AlertOctagon size={24} style={{ marginRight: '8px' }} />
                  Cancel Order #{orderToCancel.id}
                </h2>
                <button style={styles.closeButton} onClick={closeCancelModal}>
                  <X size={24} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.cancelWarning}>
                  <p><strong>Are you sure you want to cancel this order?</strong></p>
                  <p>This action cannot be undone. The seller will be notified immediately.</p>
                </div>

                <div style={styles.detailSection}>
                  <h3 style={styles.sectionTitle}>Please select a reason for cancellation:</h3>
                  <div style={styles.reasonsList}>
                    {cancelReasons.map(reason => (
                      <label key={reason.value} style={styles.reasonOption}>
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason.value}
                          checked={cancelReason === reason.value}
                          onChange={(e) => setCancelReason(e.target.value)}
                          style={styles.reasonRadio}
                        />
                        <span style={styles.reasonLabel}>{reason.label}</span>
                      </label>
                    ))}
                  </div>

                  {cancelReason === 'other' && (
                    <div style={styles.customReasonSection}>
                      <label style={styles.customReasonLabel}>
                        Please specify your reason:
                      </label>
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Please provide specific details about why you want to cancel this order..."
                        style={styles.customReasonTextarea}
                        rows={4}
                        maxLength={500}
                      />
                      <div style={styles.characterCount}>
                        {customReason.length}/500 characters
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.detailSection}>
                  <h3 style={styles.sectionTitle}>Order Summary</h3>
                  <div style={styles.cancelOrderSummary}>
                    <div style={styles.summaryRow}>
                      <span>Order Total:</span>
                      <span style={styles.summaryAmount}>{formatPrice(orderToCancel.total_amount)}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span>Payment Method:</span>
                      <span>{orderToCancel.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span>Items:</span>
                      <span>{orderToCancel.items?.length || 0} item(s)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  style={styles.closeModalButton}
                  onClick={closeCancelModal}
                  disabled={cancelLoading}
                >
                  Keep Order
                </button>
                <button
                  style={styles.confirmCancelButton}
                  onClick={handleCancelOrder}
                  disabled={cancelLoading || !cancelReason || (cancelReason === 'other' && !customReason.trim())}
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}

const styles = {
  pagecontainer: { backgroundColor: "#FDFFF0", paddingTop: "140px", },
  container: { minHeight: '100vh', backgroundColor: '#FDFFF0', padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  loadingContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: '20px', textAlign: 'center'
  },
  spinner: {
    width: '32px', height: '32px', border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6', borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: '20px',
    textAlign: 'center', padding: '40px'
  },
  homeButton: {
    padding: '12px 24px', backgroundColor: '#6b7280', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px',
    backgroundColor: 'white', borderRadius: '12px', padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  backButton: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#1a4845', padding: '8px', borderRadius: '6px'
  },
  title: {
    fontSize: '24px', fontWeight: '700', color: '#1f2937', flex: 1
  },
  storeIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // ✅ push items to edges
    backgroundColor: '#0e451e25',
    border: '1px solid #0e451e25',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    fontSize: '14px',
    color: '#1a4845',
    fontWeight: '500'
  },

  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', padding: '60px',
    backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  shopButton: {
    padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px',
    fontSize: '16px', fontWeight: '600', transition: 'all 0.2s'
  },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  orderCard: {
    backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '5px 24px',
    border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
  },
  orderHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '16px'
  },
  orderId: { fontSize: '18px', fontWeight: '700', color: '#1f2937' },
  orderDate: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  customerName: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
  orderStatus: {
    display: 'flex', alignItems: 'center', gap: '8px',
    borderRadius: '8px'
  },
  statusText: {
    fontSize: '14px', fontWeight: '600', textTransform: 'capitalize'
  },
  orderItems: { marginBottom: '16px' },
  orderItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '12px 0', borderBottom: '1px solid #f3f4f6'
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: '16px', color: '#1f2937', fontWeight: '600' },
  itemDetails: { fontSize: '13px', color: '#6b7280', marginTop: '5px' },
  itemTotal: { fontSize: '14px', fontWeight: '600', color: '#1f2937' },

  // ✅ Product Review Section Styles
  productReviewSection: {
    marginTop: '8px'
  },

  checkingReview: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#6b7280'
  },

  reviewProductButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },

  noItems: {
    fontSize: '14px', color: '#9ca3af', textAlign: 'center',
    padding: '20px', fontStyle: 'italic'
  },

  orderMeta: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '12px'
  },
  orderTotal: { fontSize: '17px', fontWeight: '600', color: '#1f2937' },
  paymentMethod: {
    fontSize: '13px', color: '#6b7280', backgroundColor: '#f3f4f6',
    padding: '6px 10px', borderRadius: '6px', fontWeight: '500'
  },
  shippingAddress: {
    fontSize: '13px', color: '#6b7280', backgroundColor: '#f8fafc',
    padding: '12px', borderRadius: '6px', lineHeight: '1.4', marginBottom: '12px'
  },
  cancelReason: {
    fontSize: '13px', color: '#dc2626', backgroundColor: '#fef2f2',
    padding: '12px', borderRadius: '6px', lineHeight: '1.4',
    border: '1px solid #fecaca', marginBottom: '12px'
  },
  orderActions: {
    display: 'flex', gap: '8px', flexWrap: 'wrap'
  },
  actionButton: {
    padding: '8px 16px', backgroundColor: 'rgb(5, 150, 105)', color: 'white', 
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white', borderRadius: '16px', maxWidth: '600px',
    width: '100%', maxHeight: '90vh', overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  cancelModalContent: {
    backgroundColor: 'white', borderRadius: '16px', maxWidth: '500px',
    width: '100%', maxHeight: '90vh', overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },

  // ✅ Review Modal Content
  reviewModalContent: {
    backgroundColor: 'white', borderRadius: '16px', maxWidth: '500px',
    width: '100%', maxHeight: '90vh', overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },

  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '24px', borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0,
    display: 'flex', alignItems: 'center'
  },
  closeButton: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#6b7280', padding: '8px', borderRadius: '8px',
    transition: 'all 0.2s'
  },
  modalBody: {
    padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 180px)'
  },
  detailSection: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '16px', fontWeight: '600', color: '#1f2937',
    marginBottom: '12px', margin: '0 0 12px 0'
  },
  statusDetail: {
    display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px'
  },
  infoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  infoItem: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px'
  },
  infoLabel: {
    fontSize: '12px', color: '#6b7280', fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: '0.05em'
  },
  infoValue: {
    fontSize: '14px', color: '#1f2937', fontWeight: '500', marginTop: '2px'
  },
  itemsList: {
    display: 'flex', flexDirection: 'column', gap: '12px'
  },
  modalOrderItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px'
  },
  modalItemInfo: {
    flex: 1
  },
  modalItemName: {
    fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px'
  },
  modalItemPrice: {
    fontSize: '14px', color: '#6b7280', marginBottom: '6px'
  },
  modalItemDesc: {
    fontSize: '12px', color: '#9ca3af', lineHeight: '1.4', marginBottom: '8px'
  },

  // ✅ Product Review in Modal
  modalProductReview: {
    marginTop: '8px'
  },

  modalItemTotal: {
    fontSize: '16px', fontWeight: '700', color: '#1f2937'
  },
  noItemsModal: {
    textAlign: 'center', padding: '20px', color: '#9ca3af',
    fontStyle: 'italic'
  },
  addressBox: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    padding: '16px', backgroundColor: '#f0f8ff', borderRadius: '8px',
    border: '1px solid #dbeafe'
  },
  addressText: {
    fontSize: '14px', color: '#1f2937', lineHeight: '1.5'
  },
  cancelReasonBox: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px',
    border: '1px solid #fecaca'
  },
  cancelReasonText: {
    fontSize: '14px', color: '#dc2626', lineHeight: '1.5'
  },
  totalSection: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px', backgroundColor: '#f0f8ff', borderRadius: '8px',
    border: '2px solid #3b82f6'
  },
  totalLabel: {
    fontSize: '16px', fontWeight: '600', color: '#1f2937'
  },
  totalAmount: {
    fontSize: '20px', fontWeight: '700', color: '#3b82f6'
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
    gap: '12px', padding: '24px', borderTop: '1px solid #e5e7eb'
  },
  closeModalButton: {
    padding: '10px 20px', backgroundColor: '#6b7280', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
  },
  cancelModalButton: {
    padding: '10px 20px', backgroundColor: '#ef4444', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
  },

  // Cancel Modal Specific Styles
  cancelWarning: {
    backgroundColor: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '8px', padding: '16px', marginBottom: '24px'
  },
  reasonsList: {
    display: 'flex', flexDirection: 'column', gap: '12px',
    backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px'
  },
  reasonOption: {
    display: 'flex', alignItems: 'center', gap: '12px',
    cursor: 'pointer', padding: '8px', borderRadius: '6px',
    transition: 'background-color 0.2s'
  },
  reasonRadio: {
    width: '16px', height: '16px', cursor: 'pointer'
  },
  reasonLabel: {
    fontSize: '14px', color: '#1f2937', cursor: 'pointer'
  },
  customReasonSection: {
    marginTop: '16px'
  },
  customReasonLabel: {
    display: 'block', fontSize: '14px', fontWeight: '500',
    color: '#1f2937', marginBottom: '8px'
  },
  customReasonTextarea: {
    width: '100%', padding: '12px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', resize: 'vertical',
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s'
  },
  characterCount: {
    fontSize: '12px', color: '#6b7280', textAlign: 'right',
    marginTop: '4px'
  },
  cancelOrderSummary: {
    backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px'
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid #e5e7eb'
  },
  summaryAmount: {
    fontWeight: '600', color: '#1f2937'
  },
  confirmCancelButton: {
    padding: '10px 20px', backgroundColor: '#ef4444', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
  },

  // ✅ Product Review Form Styles
  reviewFormDescription: {
    fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5'
  },

  errorMessage: {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: '#991b1b', backgroundColor: '#fef2f2',
    border: '1px solid #fecaca', padding: '12px 16px',
    borderRadius: '8px', marginBottom: '20px', fontSize: '14px'
  },

  successMessage: {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: '#065f46', backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0', padding: '12px 16px',
    borderRadius: '8px', marginBottom: '20px', fontSize: '14px'
  },

  starRatingInput: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '8px', justifyContent: 'center'
  },

  ratingStarButton: {
    cursor: 'pointer', transition: 'all 0.2s ease',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
  },

  ratingDescription: {
    textAlign: 'center', fontSize: '14px', color: '#374151',
    fontWeight: '500', marginTop: '12px', minHeight: '20px'
  },

  reviewTextarea: {
    width: '100%', padding: '12px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', resize: 'vertical',
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s'
  },

  charCountContainer: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginTop: '8px'
  },

  validIndicator: {
    display: 'flex', alignItems: 'center', gap: '4px',
    color: '#059669', fontSize: '12px', fontWeight: '500'
  },

  buttonContent: {
    display: 'flex', alignItems: 'center', gap: '8px'
  },

  submitReviewButton: {
    padding: '10px 20px', backgroundColor: '#059669', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
  },

  disabledButton: {
    backgroundColor: '#9ca3af', cursor: 'not-allowed'
  }
};
