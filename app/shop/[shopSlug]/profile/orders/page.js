'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Package, Clock, CheckCircle, XCircle, Store, AlertTriangle, X, User, 
  MapPin, Phone, Calendar, CreditCard, AlertOctagon, Star, ThumbsUp 
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function ShopOrdersPage() {
  const { shopSlug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [urlError, setUrlError] = useState(null);
  
  // ✅ Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // ✅ Cancel order states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // ✅ SIMPLIFIED: Rating modal states (frontend only)
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [orderToRate, setOrderToRate] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

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

  // ✅ SIMPLIFIED: Handle rate order request (frontend only)
  const handleRateOrderRequest = (order) => {
    console.log('⭐ Requesting to rate order:', order.id);
    setOrderToRate(order);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
    setShowRatingModal(true);
  };

  // ✅ Close rating modal
  const closeRatingModal = () => {
    setShowRatingModal(false);
    setOrderToRate(null);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
  };

  // ✅ SIMPLIFIED: Handle rating submission (frontend only - no backend call)
  const handleSubmitRating = async () => {
    if (!orderToRate) return;

    if (rating === 0) {
      alert('Please select a rating (1-5 stars)');
      return;
    }

    setRatingLoading(true);

    try {
      // ✅ SIMULATE: Just update local state since backend doesn't have the endpoint
      console.log('⭐ Simulating rating submission for order:', orderToRate.id, 'Rating:', rating);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update order in local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderToRate.id 
            ? { ...order, rating: rating, review: reviewText, is_rated: true }
            : order
        )
      );

      // Store rating in localStorage for persistence
      const ratingKey = `order_${orderToRate.id}_rating`;
      localStorage.setItem(ratingKey, JSON.stringify({
        rating: rating,
        review: reviewText.trim(),
        rated_at: new Date().toISOString()
      }));

      console.log('✅ Rating saved locally');
      alert('Thank you for rating this order! Your feedback has been recorded.');
      closeRatingModal();
      
    } catch (error) {
      console.error('❌ Rating submission error:', error);
      alert('Failed to save rating. Please try again.');
    } finally {
      setRatingLoading(false);
    }
  };

  // ✅ Load saved ratings from localStorage
  useEffect(() => {
    if (orders.length > 0) {
      const updatedOrders = orders.map(order => {
        const ratingKey = `order_${order.id}_rating`;
        const savedRating = localStorage.getItem(ratingKey);
        
        if (savedRating) {
          try {
            const ratingData = JSON.parse(savedRating);
            return {
              ...order,
              rating: ratingData.rating,
              review: ratingData.review,
              is_rated: true
            };
          } catch (error) {
            console.warn('Failed to parse saved rating for order', order.id);
          }
        }
        
        return order;
      });
      
      // Only update if there are changes
      const hasChanges = updatedOrders.some((order, index) => 
        order.is_rated !== orders[index].is_rated
      );
      
      if (hasChanges) {
        setOrders(updatedOrders);
      }
    }
  }, [orders.length]);

  // ✅ Check if order can be cancelled
  const canCancelOrder = (order) => {
    const status = order.status?.toLowerCase();
    const cancelableStatuses = ['pending', 'processing', 'confirmed'];
    return cancelableStatuses.includes(status);
  };

  // ✅ Check if order can be rated
  const canRateOrder = (order) => {
    const status = order.status?.toLowerCase();
    return status === 'delivered' && !order.is_rated;
  };

  // ✅ Handle keyboard events for modals
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        if (showRatingModal) {
          closeRatingModal();
        } else if (showCancelModal) {
          closeCancelModal();
        } else if (showOrderDetails) {
          closeOrderDetails();
        }
      }
    };

    if (showOrderDetails || showCancelModal || showRatingModal) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [showOrderDetails, showCancelModal, showRatingModal]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock size={20} color="#f59e0b" />;
      case 'processing': return <Package size={20} color="#3b82f6" />;
      case 'delivered': return <CheckCircle size={20} color="#10b981" />;
      case 'cancelled': return <XCircle size={20} color="#ef4444" />;
      default: return <Package size={20} color="#6b7280" />;
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
            <p style={{fontSize: '12px', color: '#666'}}>
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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={handleBackClick} style={styles.backButton}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={styles.title}>
          Orders from {storeData?.name || `Store ${actualStoreId}`}
        </h1>
      </div>

      {/* Store Context */}
      <div style={styles.storeIndicator}>
        <Store size={16} />
        <span>Your orders from {storeData?.name || `Store ${actualStoreId}`} • {orders.length} order{orders.length !== 1 ? 's' : ''}</span>
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
              <div style={styles.orderHeader}>
                <div>
                  <div style={styles.orderId}>Order #{order.id}</div>
                  <div style={styles.orderDate}>{formatDate(order.created_at)}</div>
                  {order.customer_name && (
                    <div style={styles.customerName}>Customer: {order.customer_name}</div>
                  )}
                </div>
                <div style={styles.orderStatus}>
                  {getStatusIcon(order.status)}
                  <span 
                    style={{
                      ...styles.statusText,
                      color: getStatusColor(order.status)
                    }}
                  >
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>

              <div style={styles.orderItems}>
                {order.items && order.items.length > 0 ? (
                  order.items.map(item => (
                    <div key={item.id} style={styles.orderItem}>
                      <div style={styles.itemInfo}>
                        <div style={styles.itemName}>
                          {item.product?.name || item.name || 'Product'}
                        </div>
                        <div style={styles.itemDetails}>
                          {formatPrice(item.price)} × {item.quantity}
                        </div>
                      </div>
                      <div style={styles.itemTotal}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.noItems}>Items information not available</div>
                )}
              </div>

              <div style={styles.orderFooter}>
                <div style={styles.orderMeta}>
                  <div style={styles.orderTotal}>
                    Total: {formatPrice(order.total_amount)}
                  </div>
                  <div style={styles.paymentMethod}>
                    {order.payment_method === 'COD' ? 'Cash on Delivery' : 
                     order.payment_method === 'ONLINE' ? 'Online Payment' : 
                     order.payment_method || 'COD'}
                  </div>
                </div>
                
                {order.shipping_address && (
                  <div style={styles.shippingAddress}>
                    <strong>Delivery Address:</strong><br />
                    {order.shipping_address}
                  </div>
                )}

                {/* ✅ Show cancel reason if cancelled */}
                {order.status?.toLowerCase() === 'cancelled' && order.cancel_reason && (
                  <div style={styles.cancelReason}>
                    <strong>Cancellation Reason:</strong> {order.cancel_reason}
                  </div>
                )}

                {/* ✅ Show rating if already rated */}
                {order.is_rated && order.rating && (
                  <div style={styles.ratingDisplay}>
                    <strong>Your Rating:</strong>
                    <div style={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={16} 
                          fill={star <= order.rating ? '#fbbf24' : 'none'}
                          color={star <= order.rating ? '#fbbf24' : '#d1d5db'}
                        />
                      ))}
                      <span style={styles.ratingText}>({order.rating}/5)</span>
                    </div>
                    {order.review && (
                      <div style={styles.reviewText}>"{order.review}"</div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Actions */}
              <div style={styles.orderActions}>
                {/* ✅ SIMPLIFIED: Only Rate Order Button (No Detailed Review) */}
                {canRateOrder(order) && (
                  <button 
                    style={styles.actionButton}
                    onClick={() => handleRateOrderRequest(order)}
                  >
                    ⭐ Rate Order
                  </button>
                )}
                
                {/* ✅ Show "Rated" indicator for already rated orders */}
                {order.status?.toLowerCase() === 'delivered' && order.is_rated && (
                  <div style={styles.ratedIndicator}>
                    <ThumbsUp size={16} />
                    <span>Order Rated</span>
                  </div>
                )}

                {canCancelOrder(order) && (
                  <button 
                    style={{...styles.actionButton, backgroundColor: '#ef4444'}}
                    onClick={() => handleCancelOrderRequest(order)}
                  >
                    Cancel Order
                  </button>
                )}
                <button 
                  style={{...styles.actionButton, backgroundColor: '#6b7280'}}
                  onClick={() => handleViewDetails(order)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All the modals (Order Details, Cancel, Rating) */}
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
              {canRateOrder(selectedOrder) && (
                <button 
                  style={styles.rateButton}
                  onClick={() => {
                    closeOrderDetails();
                    handleRateOrderRequest(selectedOrder);
                  }}
                >
                  Rate Order
                </button>
              )}
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
                <AlertOctagon size={24} style={{marginRight: '8px'}} />
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

      {/* ✅ SIMPLIFIED: Rating Modal (Frontend Only) */}
      {showRatingModal && orderToRate && (
        <div style={styles.modalOverlay} onClick={closeRatingModal}>
          <div style={styles.ratingModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Star size={24} style={{marginRight: '8px'}} />
                Rate Order #{orderToRate.id}
              </h2>
              <button style={styles.closeButton} onClick={closeRatingModal}>
                <X size={24} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.ratingIntro}>
                <p><strong>How was your experience with this order?</strong></p>
                <p>Your feedback helps improve the service quality.</p>
              </div>

              <div style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>Overall Rating</h3>
                <div style={styles.starRating}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={32}
                      fill={(hoverRating || rating) >= star ? '#fbbf24' : 'none'}
                      color={(hoverRating || rating) >= star ? '#fbbf24' : '#d1d5db'}
                      style={styles.ratingStarButton}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
                <div style={styles.ratingDescription}>
                  {(hoverRating || rating) === 1 && "Poor - Not satisfied"}
                  {(hoverRating || rating) === 2 && "Fair - Below expectations"}
                  {(hoverRating || rating) === 3 && "Good - Met expectations"}
                  {(hoverRating || rating) === 4 && "Very Good - Above expectations"}
                  {(hoverRating || rating) === 5 && "Excellent - Outstanding service"}
                </div>
              </div>

              <div style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>Write a Review (Optional)</h3>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details about your experience with this order..."
                  style={styles.reviewTextarea}
                  rows={4}
                  maxLength={500}
                />
                <div style={styles.characterCount}>
                  {reviewText.length}/500 characters
                </div>
              </div>

              <div style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>Order Summary</h3>
                <div style={styles.ratingOrderSummary}>
                  <div style={styles.summaryRow}>
                    <span>Order Total:</span>
                    <span style={styles.summaryAmount}>{formatPrice(orderToRate.total_amount)}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Items:</span>
                    <span>{orderToRate.items?.length || 0} item(s)</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span>Delivered:</span>
                    <span>{formatDate(orderToRate.updated_at || orderToRate.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.closeModalButton} 
                onClick={closeRatingModal}
                disabled={ratingLoading}
              >
                Cancel
              </button>
              <button 
                style={styles.submitRatingButton}
                onClick={handleSubmitRating}
                disabled={ratingLoading || rating === 0}
              >
                {ratingLoading ? 'Submitting...' : 'Submit Rating'}
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
        
        .rating-star:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', maxWidth: '1200px', margin: '0 auto' },
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
    color: '#3b82f6', padding: '8px', borderRadius: '6px' 
  },
  title: { 
    fontSize: '24px', fontWeight: '700', color: '#1f2937', flex: 1 
  },
  storeIndicator: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#f0f8ff', border: '1px solid #3b82f6',
    borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
    fontSize: '14px', color: '#1e40af', fontWeight: '500'
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
    backgroundColor: 'white', borderRadius: '12px', padding: '24px', 
    border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
  },
  orderHeader: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', 
    marginBottom: '16px' 
  },
  orderId: { fontSize: '18px', fontWeight: '700', color: '#1f2937' },
  orderDate: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  customerName: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
  orderStatus: { 
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px'
  },
  statusText: { 
    fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' 
  },
  orderItems: { marginBottom: '16px' },
  orderItem: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    padding: '10px 0', borderBottom: '1px solid #f3f4f6' 
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: '15px', color: '#1f2937', fontWeight: '500' },
  itemDetails: { fontSize: '13px', color: '#6b7280', marginTop: '2px' },
  itemTotal: { fontSize: '14px', fontWeight: '600', color: '#1f2937' },
  noItems: { 
    fontSize: '14px', color: '#9ca3af', textAlign: 'center', 
    padding: '20px', fontStyle: 'italic' 
  },
  orderFooter: { 
    paddingTop: '16px', borderTop: '2px solid #f3f4f6', marginBottom: '16px' 
  },
  orderMeta: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '12px'
  },
  orderTotal: { fontSize: '18px', fontWeight: '700', color: '#1f2937' },
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
  ratingDisplay: {
    fontSize: '13px', backgroundColor: '#f0fdf4',
    padding: '12px', borderRadius: '6px', lineHeight: '1.4',
    border: '1px solid #bbf7d0', marginBottom: '12px'
  },
  ratingStars: {
    display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px'
  },
  ratingText: {
    fontSize: '12px', color: '#065f46', fontWeight: '600', marginLeft: '8px'
  },
  reviewText: {
    fontSize: '12px', color: '#065f46', marginTop: '6px',
    fontStyle: 'italic', lineHeight: '1.3'
  },
  ratedIndicator: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', backgroundColor: '#10b981', color: 'white',
    border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500'
  },
  orderActions: {
    display: 'flex', gap: '8px', flexWrap: 'wrap'
  },
  actionButton: {
    padding: '8px 16px', backgroundColor: '#10b981', color: 'white',
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
  ratingModalContent: {
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
    fontSize: '12px', color: '#9ca3af', lineHeight: '1.4'
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
  rateButton: {
    padding: '10px 20px', backgroundColor: '#10b981', color: 'white',
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

  // ✅ Rating Modal Specific Styles
  ratingIntro: {
    backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: '8px', padding: '16px', marginBottom: '24px'
  },
  starRating: {
    display: 'flex', alignItems: 'center', gap: '8px',
    justifyContent: 'center', padding: '20px'
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
  ratingOrderSummary: {
    backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px'
  },
  submitRatingButton: {
    padding: '10px 20px', backgroundColor: '#fbbf24', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
  }
};
