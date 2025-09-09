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
  Download
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ORDER_DETAIL_API_URL = `${API_BASE_URL}/user/orders/`;

export default function OrderConfirmationPage() {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showShareOptions, setShowShareOptions] = useState(false);
    const { orderId } = useParams();
    const router = useRouter();

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('buyerAccessToken');
        if (!token) {
            router.push('/login/buyer');
            return null;
        }
        return { 'Authorization': `Bearer ${token}` };
    }, [router]);

    const fetchOrderDetails = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers || !orderId) return;

        setIsLoading(true);
        setError('');

        try {
            console.log('Fetching order details for ID:', orderId);
            const response = await axios.get(`${ORDER_DETAIL_API_URL}${orderId}/`, { headers });
            
            console.log('Order details received:', response.data);
            setOrder(response.data);
        } catch (err) {
            console.error("Failed to fetch order details", err);
            if (err.response?.status === 401) {
                router.push('/login/buyer');
            } else if (err.response?.status === 404) {
                setError('Order not found. Please check your order ID.');
            } else {
                setError('Failed to load order details. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [orderId, getAuthHeaders, router]);

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

    const getStatusStyle = (status) => {
        const statusStyles = {
            'PENDING': { backgroundColor: '#fef3c7', color: '#92400e', icon: Clock },
            'PROCESSING': { backgroundColor: '#dbeafe', color: '#1e40af', icon: Package },
            'SHIPPED': { backgroundColor: '#d1fae5', color: '#065f46', icon: Truck },
            'DELIVERED': { backgroundColor: '#d1fae5', color: '#065f46', icon: CheckCircle },
            'CANCELLED': { backgroundColor: '#fee2e2', color: '#991b1b', icon: AlertCircle },
        };
        return statusStyles[status] || statusStyles.PENDING;
    };

    const handleShare = () => {
        const orderText = `🎉 Order Confirmed! 
Order #${order.id}
Total: ₹${parseFloat(order.total_amount).toFixed(2)}
${order.items?.length || 0} items ordered from Kerala Sellers`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Order Confirmation',
                text: orderText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(orderText).then(() => {
                alert('Order details copied to clipboard!');
            });
        }
    };

    const downloadOrderSummary = () => {
        const orderSummary = `
KERALA SELLERS - ORDER CONFIRMATION

Order ID: #${order.id}
Date: ${formatDate(order.created_at)}
Status: ${order.status}

CUSTOMER DETAILS:
Name: ${order.customer_name || 'N/A'}
Phone: ${order.customer_phone || 'N/A'}
Email: ${order.customer_email || 'N/A'}

ITEMS ORDERED:
${order.items?.map(item => 
    `- ${item.quantity} x ${item.product?.name || item.product_name || 'Item'} - ₹${parseFloat(item.price || 0).toFixed(2)}`
).join('\n') || 'No items listed'}

PAYMENT DETAILS:
Total Amount: ₹${parseFloat(order.total_amount).toFixed(2)}
Payment Method: ${order.payment_method === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
Payment Status: ${order.payment_status || 'Pending'}

Thank you for shopping with Kerala Sellers!
        `.trim();

        const blob = new Blob([orderSummary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order-${order.id}-summary.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div>
                <Header />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Confirming your order...</p>
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
                    <Link href="/shop" style={styles.primaryButton}>
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

    return (
        <div style={styles.pageContainer}>
            <Header />
            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Success Header */}
                    <div style={styles.successHeader}>
                        <div style={styles.successIcon}>
                            <CheckCircle size={64} color="#10b981" />
                        </div>
                        <h1 style={styles.title}>Order Confirmed!</h1>
                        <p style={styles.subtitle}>
                            Thank you for your order! We've received your purchase and the seller has been notified.
                        </p>
                    </div>
                    
                    {/* Order Summary */}
                    <div style={styles.orderSummary}>
                        <div style={styles.orderHeader}>
                            <h2 style={styles.sectionTitle}>Order Summary</h2>
                            <div style={styles.headerActions}>
                                <button onClick={handleShare} style={styles.actionButton}>
                                    <Share2 size={16} />
                                </button>
                                <button onClick={downloadOrderSummary} style={styles.actionButton}>
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
                                <span style={styles.detailLabel}>Date:</span>
                                <span style={styles.detailValue}>{formatDate(order.created_at)}</span>
                            </div>
                            
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Total Amount:</span>
                                <span style={styles.totalAmount}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                            
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Status:</span>
                                <span style={{
                                    ...styles.statusBadge,
                                    backgroundColor: statusStyle.backgroundColor,
                                    color: statusStyle.color
                                }}>
                                    <StatusIcon size={16} />
                                    {order.status}
                                </span>
                            </div>

                            {order.payment_method && (
                                <div style={styles.detailRow}>
                                    <span style={styles.detailLabel}>Payment:</span>
                                    <span style={styles.detailValue}>
                                        {order.payment_method === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Information */}
                    {(order.customer_name || order.customer_phone || order.shipping_address) && (
                        <div style={styles.customerSection}>
                            <h3 style={styles.sectionTitle}>
                                <User size={20} />
                                Customer Information
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
                                        <div style={styles.itemInfo}>
                                            <span style={styles.itemName}>
                                                {item.product?.name || item.product_name || 'Item'}
                                            </span>
                                            {item.product?.model_name && (
                                                <span style={styles.itemModel}>
                                                    Model: {item.product.model_name}
                                                </span>
                                            )}
                                        </div>
                                        <div style={styles.itemQuantity}>
                                            Qty: {item.quantity}
                                        </div>
                                        <div style={styles.itemPrice}>
                                            ₹{parseFloat(item.price || 0).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shipping Information */}
                    {(order.shipping_provider || order.tracking_id) && (
                        <div style={styles.shippingSection}>
                            <h3 style={styles.sectionTitle}>
                                <Truck size={20} />
                                Shipping Information
                            </h3>
                            <div style={styles.shippingDetails}>
                                {order.shipping_provider && (
                                    <div style={styles.shippingItem}>
                                        <strong>Shipping Provider:</strong> {order.shipping_provider}
                                    </div>
                                )}
                                {order.tracking_id && (
                                    <div style={styles.shippingItem}>
                                        <strong>Tracking ID:</strong> 
                                        <span style={styles.trackingId}>{order.tracking_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={styles.buttonGroup}>
                        <Link href="/shop" style={styles.secondaryButton}>
                            <ShoppingBag size={18} />
                            Continue Shopping
                        </Link>
                        <Link href="/profile/orders" style={styles.primaryButton}>
                            <Package size={18} />
                            View My Orders
                        </Link>
                    </div>

                    {/* Additional Info */}
                    <div style={styles.additionalInfo}>
                        <p style={styles.infoText}>
                            📧 You'll receive order updates via email and SMS
                        </p>
                        <p style={styles.infoText}>
                            🛍️ Need help? Contact our support team
                        </p>
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
            `}</style>
        </div>
    );
}

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
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
        fontWeight: '500'
    },

    // Main Layout
    container: { 
        maxWidth: '800px', 
        margin: '40px auto', 
        padding: '20px'
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
        backgroundColor: '#f0fdf4',
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
        margin: '0 auto'
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
        alignItems: 'center',
        marginBottom: '16px'
    },

    detailLabel: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
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
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },

    itemInfo: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
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

    itemQuantity: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500',
        minWidth: '60px',
        textAlign: 'center'
    },

    itemPrice: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#059669',
        minWidth: '80px',
        textAlign: 'right'
    },

    // Shipping Section
    shippingSection: {
        padding: '32px 40px',
        borderTop: '1px solid #f3f4f6'
    },

    shippingDetails: {
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },

    shippingItem: {
        fontSize: '14px',
        color: '#374151',
        marginBottom: '8px'
    },

    trackingId: {
        fontFamily: 'monospace',
        backgroundColor: '#e5e7eb',
        padding: '2px 6px',
        borderRadius: '4px',
        marginLeft: '8px'
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

    // Additional Info
    additionalInfo: {
        padding: '24px 40px',
        backgroundColor: '#f8fafc',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb'
    },

    infoText: {
        fontSize: '14px',
        color: '#6b7280',
        margin: '0 0 8px 0'
    }
};
