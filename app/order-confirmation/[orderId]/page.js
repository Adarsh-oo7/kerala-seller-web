'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { 
  CheckCircle, 
  Package, 
  ShoppingBag, 
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Truck,
  AlertCircle,
  RefreshCw,
  Share2,
  Download,
  Globe,
  Store,
  Star,
  ArrowRight,
  MessageSquare,
  Shield
} from 'lucide-react';

// ✅ Enhanced API configuration
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

// const API_BASE_URL = 'https://api.keralasellers.in';
// const ORDER_DETAIL_API_URL = `${API_BASE_URL}/user/orders/`;

// console.log('🌐 Order Confirmation API URLs configured:', { 
//   API_BASE_URL, 
//   ORDER_DETAIL_API_URL 
// });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in/api';

const ORDER_DETAIL_API_URL = `${API_BASE_URL}/user/orders/`;

console.log('📦 Order Confirmation:', API_BASE_URL);


export default function OrderConfirmationPage() {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });
    const [estimatedDelivery, setEstimatedDelivery] = useState(null);
    
    const { orderId } = useParams();
    const router = useRouter();

    // ✅ Get current store info from URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
            setCurrentStoreInfo({
                storeId: storeMatch ? storeMatch[1] : null,
                isInStore: !!storeMatch
            });
        }
    }, []);

    // ✅ Enhanced auth headers with multiple token support
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('access_token') || 
                     localStorage.getItem('buyerAccessToken') ||
                     localStorage.getItem('accessToken');
        if (!token) {
            const loginUrl = currentStoreInfo.isInStore && currentStoreInfo.storeId 
                ? `/store/${currentStoreInfo.storeId}/login`
                : '/login/buyer';
            router.push(loginUrl);
            return null;
        }
        return { 'Authorization': `Bearer ${token}` };
    }, [router, currentStoreInfo]);

    const fetchOrderDetails = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers || !orderId) return;

        setIsLoading(true);
        setError('');

        try {
            console.log('🔍 Fetching order details for ID:', orderId);
            const response = await axios.get(`${ORDER_DETAIL_API_URL}${orderId}/`, { 
                headers,
                timeout: 15000
            });
            
            console.log('✅ Order details received:', response.data);
            setOrder(response.data);
            
            // ✅ Calculate estimated delivery
            if (response.data.created_at) {
                const orderDate = new Date(response.data.created_at);
                const estimatedDate = new Date(orderDate);
                estimatedDate.setDate(orderDate.getDate() + (response.data.payment_method === 'COD' ? 5 : 3));
                setEstimatedDelivery(estimatedDate);
            }
            
        } catch (err) {
            console.error("❌ Failed to fetch order details", err);
            
            let errorMessage = 'Failed to load order details. Please try again.';
            
            if (err.response?.status === 401) {
                const loginUrl = currentStoreInfo.isInStore && currentStoreInfo.storeId 
                    ? `/store/${currentStoreInfo.storeId}/login`
                    : '/login/buyer';
                router.push(loginUrl);
                return;
            } else if (err.response?.status === 404) {
                errorMessage = 'Order not found. Please check your order ID.';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please check your connection and try again.';
            } else if (err.response?.data) {
                errorMessage = err.response.data.error || 
                             err.response.data.message || 
                             errorMessage;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [orderId, getAuthHeaders, router, currentStoreInfo]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric'
        });
    };

    // ✅ Enhanced status styles with more states
    const getStatusStyle = (status) => {
        const statusStyles = {
            'PENDING': { backgroundColor: '#fef3c7', color: '#92400e', icon: Clock, message: 'Waiting for seller confirmation' },
            'CONFIRMED': { backgroundColor: '#dbeafe', color: '#1e40af', icon: CheckCircle, message: 'Order confirmed by seller' },
            'PROCESSING': { backgroundColor: '#e0e7ff', color: '#3730a3', icon: Package, message: 'Preparing your order' },
            'SHIPPED': { backgroundColor: '#d1fae5', color: '#065f46', icon: Truck, message: 'On the way to you' },
            'OUT_FOR_DELIVERY': { backgroundColor: '#fef3c7', color: '#92400e', icon: Truck, message: 'Out for delivery today' },
            'DELIVERED': { backgroundColor: '#d1fae5', color: '#065f46', icon: CheckCircle, message: 'Successfully delivered' },
            'CANCELLED': { backgroundColor: '#fee2e2', color: '#991b1b', icon: AlertCircle, message: 'Order was cancelled' },
        };
        return statusStyles[status] || statusStyles.PENDING;
    };

    // ✅ Enhanced share functionality
    const handleShare = async () => {
        const orderText = `🎉 Order Confirmed from Kerala Sellers! 
Order #${order.id}
Total: ₹${parseFloat(order.total_amount).toFixed(2)}
${order.items?.length || 0} items from ${order.seller_name || 'seller'}

Track your order: ${window.location.href}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Kerala Sellers - Order Confirmation',
                    text: orderText,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share failed:', err);
                fallbackCopy();
            }
        } else {
            fallbackCopy();
        }

        function fallbackCopy() {
            navigator.clipboard.writeText(orderText).then(() => {
                alert('Order details copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = orderText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Order details copied to clipboard!');
            });
        }
    };

    // ✅ Enhanced download functionality
    const downloadOrderSummary = () => {
        const orderSummary = `
KERALA SELLERS - ORDER CONFIRMATION
=====================================

Order Details:
--------------
Order ID: #${order.id}
Date: ${formatDate(order.created_at)}
Status: ${order.status}
${order.seller_name ? `Seller: ${order.seller_name}` : ''}
${estimatedDelivery ? `Estimated Delivery: ${formatDate(estimatedDelivery)}` : ''}

Customer Information:
--------------------
Name: ${order.customer_name || 'N/A'}
Phone: ${order.customer_phone || 'N/A'}
Email: ${order.customer_email || 'N/A'}
Address: ${order.shipping_address || 'N/A'}

Items Ordered:
--------------
${order.items?.map((item, index) => 
    `${index + 1}. ${item.product?.name || item.product_name || 'Item'}
   ${item.product?.model_name ? `   Model: ${item.product.model_name}` : ''}
   Quantity: ${item.quantity}
   Price: ₹${parseFloat(item.price || 0).toFixed(2)}
   Total: ₹${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}`
).join('\n\n') || 'No items listed'}

Payment Summary:
---------------
Subtotal: ₹${parseFloat(order.total_amount).toFixed(2)}
Shipping: Free
Total Amount: ₹${parseFloat(order.total_amount).toFixed(2)}
Payment Method: ${order.payment_method === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
Payment Status: ${order.payment_status || 'Pending'}

Thank you for choosing Kerala Sellers!
Visit us at: https://keralasellers.in

For support: keralasellers.in@gmail.com
WhatsApp: +91 94003 55185
        `.trim();

        const blob = new Blob([orderSummary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kerala-sellers-order-${order.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ✅ Store-aware navigation
    const getNavigationLinks = () => {
        if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
            return {
                continueShopping: `/store/${currentStoreInfo.storeId}`,
                viewOrders: `/store/${currentStoreInfo.storeId}/orders`,
                storeHome: `/store/${currentStoreInfo.storeId}`
            };
        }
        return {
            continueShopping: '/shop',
            viewOrders: '/profile/orders',
            storeHome: '/'
        };
    };

    if (isLoading) {
        return (
            <div>
                <Header />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Confirming your order...</p>
                    <p style={styles.loadingSubtext}>🌐 Connected to: {API_BASE_URL}</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <div style={styles.errorContainer}>
                    <AlertCircle size={48} color="#ef4444" />
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={fetchOrderDetails} style={styles.retryButton}>
                        <RefreshCw size={18} />
                        Try Again
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div>
                <Header />
                <div style={styles.errorContainer}>
                    <Package size={48} color="#6b7280" />
                    <h2>Order not found</h2>
                    <p>We couldn't find the order you're looking for.</p>
                    <Link href={getNavigationLinks().continueShopping} style={styles.primaryButton}>
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const statusStyle = getStatusStyle(order.status);
    const StatusIcon = statusStyle.icon;
    const navLinks = getNavigationLinks();

    return (
        <div style={styles.pageContainer}>
            <Header />
            
            {/* ✅ Store context indicator */}
            {currentStoreInfo.isInStore && (
                <div style={styles.storeContext}>
                    <div style={styles.container}>
                        <div style={styles.storeNotice}>
                            <Globe size={16} />
                            <span>Order from store context: {currentStoreInfo.storeId}</span>
                        </div>
                    </div>
                </div>
            )}
            
            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Success Header */}
                    <div style={styles.successHeader}>
                        <div style={styles.successIcon}>
                            <CheckCircle size={64} color="#10b981" />
                        </div>
                        <h1 style={styles.title}>Order Confirmed!</h1>
                        <p style={styles.subtitle}>
                            Thank you for shopping with Kerala Sellers! Your order has been received and the seller has been notified.
                        </p>
                        
                        {/* ✅ Order timeline preview */}
                        {estimatedDelivery && (
                            <div style={styles.deliveryPreview}>
                                <Truck size={18} />
                                <span>Expected delivery by {formatDateShort(estimatedDelivery)}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* ✅ Status Timeline */}
                    <div style={styles.statusSection}>
                        <div style={styles.statusTimeline}>
                            <div style={{
                                ...styles.statusStep,
                                ...(order.status !== 'CANCELLED' ? styles.statusStepActive : {})
                            }}>
                                <CheckCircle size={20} />
                                <span>Order Placed</span>
                                <small>{formatDateShort(order.created_at)}</small>
                            </div>
                            <div style={styles.statusLine}></div>
                            <div style={{
                                ...styles.statusStep,
                                ...(['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? styles.statusStepActive : {})
                            }}>
                                <Package size={20} />
                                <span>Processing</span>
                            </div>
                            <div style={styles.statusLine}></div>
                            <div style={{
                                ...styles.statusStep,
                                ...(['SHIPPED', 'DELIVERED'].includes(order.status) ? styles.statusStepActive : {})
                            }}>
                                <Truck size={20} />
                                <span>Shipped</span>
                            </div>
                            <div style={styles.statusLine}></div>
                            <div style={{
                                ...styles.statusStep,
                                ...(order.status === 'DELIVERED' ? styles.statusStepActive : {})
                            }}>
                                <CheckCircle size={20} />
                                <span>Delivered</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div style={styles.orderSummary}>
                        <div style={styles.orderHeader}>
                            <h2 style={styles.sectionTitle}>Order Details</h2>
                            <div style={styles.headerActions}>
                                <button onClick={handleShare} style={styles.actionButton} title="Share order">
                                    <Share2 size={16} />
                                </button>
                                <button onClick={downloadOrderSummary} style={styles.actionButton} title="Download summary">
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                        
                        <div style={styles.orderDetails}>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Order ID:</span>
                                <span style={styles.detailValue}>#{order.id}</span>
                            </div>
                            
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Order Date:</span>
                                <span style={styles.detailValue}>{formatDate(order.created_at)}</span>
                            </div>
                            
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Total Amount:</span>
                                <span style={styles.totalAmount}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                            
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Status:</span>
                                <div style={styles.statusContainer}>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: statusStyle.backgroundColor,
                                        color: statusStyle.color
                                    }}>
                                        <StatusIcon size={16} />
                                        {order.status}
                                    </span>
                                    <small style={styles.statusMessage}>{statusStyle.message}</small>
                                </div>
                            </div>

                            {order.payment_method && (
                                <div style={styles.detailRow}>
                                    <span style={styles.detailLabel}>Payment:</span>
                                    <div style={styles.paymentInfo}>
                                        <span style={styles.detailValue}>
                                            {order.payment_method === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
                                        </span>
                                        {order.payment_method === 'ONLINE' && (
                                            <div style={styles.paymentBadge}>
                                                <Shield size={14} />
                                                <span>Secured</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ✅ Seller information */}
                            {(order.seller_name || order.seller_phone) && (
                                <div style={styles.detailRow}>
                                    <span style={styles.detailLabel}>Seller:</span>
                                    <div style={styles.sellerInfo}>
                                        <span style={styles.detailValue}>
                                            {order.seller_name || `Seller ${order.seller_phone}`}
                                        </span>
                                        {order.seller_phone && (
                                            <small style={styles.sellerPhone}>+91 {order.seller_phone}</small>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Information */}
                    {(order.customer_name || order.customer_phone || order.shipping_address) && (
                        <div style={styles.customerSection}>
                            <h3 style={styles.sectionTitle}>
                                <User size={20} />
                                Delivery Information
                            </h3>
                            <div style={styles.customerDetails}>
                                {order.customer_name && (
                                    <div style={styles.customerItem}>
                                        <User size={16} />
                                        <span>{order.customer_name}</span>
                                    </div>
                                )}
                                {order.customer_phone && (
                                    <div style={styles.customerItem}>
                                        <Phone size={16} />
                                        <span>+91 {order.customer_phone}</span>
                                    </div>
                                )}
                                {order.customer_email && (
                                    <div style={styles.customerItem}>
                                        <Mail size={16} />
                                        <span>{order.customer_email}</span>
                                    </div>
                                )}
                                {order.shipping_address && (
                                    <div style={styles.customerItem}>
                                        <MapPin size={16} />
                                        <span>{order.shipping_address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items List */}
                    {order.items && order.items.length > 0 && (
                        <div style={styles.itemsSection}>
                            <h3 style={styles.sectionTitle}>
                                <Package size={20} />
                                Items Ordered ({order.items.length})
                            </h3>
                            <div style={styles.itemsList}>
                                {order.items.map((item, index) => (
                                    <div key={item.id || index} style={styles.itemCard}>
                                        {item.product?.image_url && (
                                            <img 
                                                src={item.product.image_url} 
                                                alt={item.product.name}
                                                style={styles.itemImage}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                        <div style={styles.itemInfo}>
                                            <span style={styles.itemName}>
                                                {item.product?.name || item.product_name || 'Item'}
                                            </span>
                                            {item.product?.model_name && (
                                                <span style={styles.itemModel}>
                                                    Model: {item.product.model_name}
                                                </span>
                                            )}
                                            {item.product?.category && (
                                                <span style={styles.itemCategory}>
                                                    {item.product.category}
                                                </span>
                                            )}
                                        </div>
                                        <div style={styles.itemQuantity}>
                                            <span style={styles.quantityLabel}>Qty:</span>
                                            <span style={styles.quantityValue}>{item.quantity}</span>
                                        </div>
                                        <div style={styles.itemPricing}>
                                            <span style={styles.itemPrice}>
                                                ₹{parseFloat(item.price || 0).toFixed(2)}
                                            </span>
                                            <span style={styles.itemTotal}>
                                                Total: ₹{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ✅ Next Steps Section */}
                    <div style={styles.nextStepsSection}>
                        <h3 style={styles.sectionTitle}>What's Next?</h3>
                        <div style={styles.nextStepsList}>
                            <div style={styles.nextStep}>
                                <div style={styles.stepIcon}>
                                    <MessageSquare size={18} />
                                </div>
                                <div style={styles.stepContent}>
                                    <strong>Stay Updated</strong>
                                    <p>You'll receive SMS and email updates about your order status</p>
                                </div>
                            </div>
                            <div style={styles.nextStep}>
                                <div style={styles.stepIcon}>
                                    <Package size={18} />
                                </div>
                                <div style={styles.stepContent}>
                                    <strong>Seller Preparation</strong>
                                    <p>The seller is preparing your items for shipment</p>
                                </div>
                            </div>
                            <div style={styles.nextStep}>
                                <div style={styles.stepIcon}>
                                    <Star size={18} />
                                </div>
                                <div style={styles.stepContent}>
                                    <strong>Review & Rate</strong>
                                    <p>Share your experience after delivery to help other buyers</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={styles.buttonGroup}>
                        <Link href={navLinks.continueShopping} style={styles.secondaryButton}>
                            <ShoppingBag size={18} />
                            {currentStoreInfo.isInStore ? 'Back to Store' : 'Continue Shopping'}
                        </Link>
                        <Link href={navLinks.viewOrders} style={styles.primaryButton}>
                            <Package size={18} />
                            Track This Order
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* ✅ Support Section */}
                    <div style={styles.supportSection}>
                        <h4 style={styles.supportTitle}>Need Help?</h4>
                        <p style={styles.supportText}>
                            Our support team is here to help with any questions about your order.
                        </p>
                        <div style={styles.supportLinks}>
                            <a href="mailto:keralasellers.in@gmail.com" style={styles.supportLink}>
                                <Mail size={16} />
                                Email Support
                            </a>
                            <a href="https://wa.me/919400355185" target="_blank" rel="noopener noreferrer" style={styles.supportLink}>
                                <MessageSquare size={16} />
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
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
                
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }

                @keyframes slideIn {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

// ✅ Enhanced styles with new components
const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
    },

    // ✅ Store context
    storeContext: {
        backgroundColor: '#dbeafe',
        borderBottom: '1px solid #3b82f6'
    },

    storeNotice: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 0',
        fontSize: '0.9rem',
        color: '#1e40af',
        fontWeight: '500'
    },

    // Loading and Error States
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '16px'
    },

    loadingSubtext: {
        fontSize: '0.8rem',
        color: '#9ca3af',
        margin: 0
    },

    spinner: {
        width: '32px',
        height: '32px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3b82f6',
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
        fontWeight: '500',
        transition: 'background-color 0.2s'
    },

    // Main Layout
    container: { 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '40px 20px'
    },

    card: { 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        animation: 'fadeIn 0.6s ease-out'
    },

    // Success Header
    successHeader: {
        textAlign: 'center',
        padding: '40px 40px 32px 40px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
        borderBottom: '1px solid #e5e7eb'
    },

    successIcon: { 
        marginBottom: '24px',
        animation: 'bounceIn 0.8s ease-out'
    },

    title: { 
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '16px'
    },

    subtitle: { 
        color: '#6b7280', 
        fontSize: '18px',
        lineHeight: '1.6',
        maxWidth: '500px',
        margin: '0 auto 20px'
    },

    // ✅ Delivery preview
    deliveryPreview: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#dbeafe',
        border: '1px solid #3b82f6',
        borderRadius: '20px',
        fontSize: '14px',
        color: '#1e40af',
        fontWeight: '500'
    },

    // ✅ Status Timeline
    statusSection: {
        padding: '24px 40px',
        borderBottom: '1px solid #f3f4f6'
    },

    statusTimeline: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    },

    statusStep: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '12px',
        borderRadius: '8px',
        color: '#9ca3af',
        fontSize: '12px',
        minWidth: '80px'
    },

    statusStepActive: {
        color: '#059669',
        backgroundColor: '#f0fdf4'
    },

    statusLine: {
        width: '24px',
        height: '2px',
        backgroundColor: '#e5e7eb',
        margin: '0 4px'
    },

    // Order Summary
    orderSummary: {
        padding: '32px 40px'
    },

    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },

    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '20px',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0 0 20px 0'
    },

    headerActions: {
        display: 'flex',
        gap: '8px'
    },

    actionButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#6b7280',
        transition: 'all 0.2s'
    },

    orderDetails: {
        backgroundColor: '#f8fafc',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
    },

    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
    },

    detailLabel: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500',
        minWidth: '120px'
    },

    detailValue: {
        fontSize: '14px',
        color: '#1f2937',
        fontWeight: '600'
    },

    totalAmount: {
        fontSize: '18px',
        color: '#059669',
        fontWeight: '700'
    },

    // ✅ Enhanced status display
    statusContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px'
    },

    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase'
    },

    statusMessage: {
        fontSize: '11px',
        color: '#6b7280',
        fontStyle: 'italic'
    },

    // ✅ Payment info
    paymentInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px'
    },

    paymentBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        color: '#059669',
        fontWeight: '500'
    },

    // ✅ Seller info
    sellerInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '2px'
    },

    sellerPhone: {
        fontSize: '11px',
        color: '#6b7280'
    },

    // Customer Section
    customerSection: {
        padding: '32px 40px',
        borderTop: '1px solid #f3f4f6'
    },

    customerDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },

    customerItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        color: '#374151'
    },

    // Items Section
    itemsSection: {
        padding: '32px 40px',
        borderTop: '1px solid #f3f4f6'
    },

    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },

    itemCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },

    // ✅ Item image
    itemImage: {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
    },

    itemInfo: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: '4px'
    },

    itemName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1f2937'
    },

    itemModel: {
        fontSize: '12px',
        color: '#6b7280'
    },

    itemCategory: {
        fontSize: '11px',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },

    itemQuantity: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        minWidth: '60px'
    },

    quantityLabel: {
        fontSize: '11px',
        color: '#6b7280'
    },

    quantityValue: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
    },

    // ✅ Item pricing
    itemPricing: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
        minWidth: '100px'
    },

    itemPrice: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#059669'
    },

    itemTotal: {
        fontSize: '12px',
        color: '#6b7280'
    },

    // ✅ Next Steps Section
    nextStepsSection: {
        padding: '32px 40px',
        borderTop: '1px solid #f3f4f6',
        backgroundColor: '#fafbfc'
    },

    nextStepsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },

    nextStep: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        animation: 'slideIn 0.6s ease-out'
    },

    stepIcon: {
        width: '36px',
        height: '36px',
        backgroundColor: '#eff6ff',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3b82f6',
        flexShrink: 0
    },

    stepContent: {
        flex: 1
    },

    // Action Buttons
    buttonGroup: { 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '16px',
        padding: '32px 40px',
        borderTop: '1px solid #f3f4f6',
        flexWrap: 'wrap'
    },

    primaryButton: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '14px 28px', 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '12px', 
        fontWeight: '600',
        fontSize: '16px',
        transition: 'all 0.2s'
    },

    secondaryButton: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '14px 28px', 
        backgroundColor: '#f1f5f9', 
        color: '#1e293b', 
        textDecoration: 'none', 
        borderRadius: '12px', 
        fontWeight: '600',
        fontSize: '16px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s'
    },

    // ✅ Support Section
    supportSection: {
        padding: '24px 40px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb'
    },

    supportTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '8px'
    },

    supportText: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '16px',
        lineHeight: '1.5'
    },

    supportLinks: {
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap'
    },

    supportLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s'
    }
};
