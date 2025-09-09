'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../../components/common/Header';
import Footer from '../../../../components/common/Footer';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  Package, 
  Calendar,
  User,
  Phone,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Wallet,
  Eye
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ORDER_DETAIL_API_URL = `${API_BASE_URL}/user/orders/`;

export default function OrderDetailPage() {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
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
        if (!headers || !orderId) {
            setIsLoading(false);
            return;
        }

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
                setError('Order not found or you do not have permission to view it.');
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
    
    const getStatusStyle = (status) => {
        const statusStyles = {
            'PENDING': { backgroundColor: '#fef3c7', color: '#92400e', icon: Clock },
            'PROCESSING': { backgroundColor: '#dbeafe', color: '#1e40af', icon: Package },
            'SHIPPED': { backgroundColor: '#d1fae5', color: '#065f46', icon: Truck },
            'DELIVERED': { backgroundColor: '#d1fae5', color: '#065f46', icon: CheckCircle },
            'CANCELLED': { backgroundColor: '#fee2e2', color: '#991b1b', icon: X },
        };
        const baseStyle = { 
            padding: '8px 16px', 
            borderRadius: '20px', 
            fontSize: '14px', 
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        };
        const config = statusStyles[status] || statusStyles.PENDING;
        return { ...baseStyle, ...config };
    };

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

    const calculateItemTotal = (price, quantity) => {
        return (parseFloat(price || 0) * quantity).toFixed(2);
    };

    if (isLoading) {
        return (
            <div>
                <Header />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading order details...</p>
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
                    <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
                    <Link href="/profile/orders" style={styles.backToOrdersLink}>
                        <ArrowLeft size={18} />
                        Back to Orders
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const statusConfig = getStatusStyle(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div style={styles.pageContainer}>
            <Header />
            <div style={styles.container}>
                <Link href="/profile/orders" style={styles.backLink}>
                    <ArrowLeft size={20}/> 
                    <span>Back to All Orders</span>
                </Link>

                <div style={styles.orderCard}>
                    {/* Order Header */}
                    <div style={styles.orderHeader}>
                        <div style={styles.orderInfo}>
                            <h1 style={styles.orderTitle}>Order #{order.id}</h1>
                            <div style={styles.orderMeta}>
                                <Calendar size={16} />
                                <span>Placed on {formatDate(order.created_at)}</span>
                            </div>
                        </div>
                        <div style={styles.orderAmount}>
                            <strong style={styles.totalAmount}>₹{parseFloat(order.total_amount).toFixed(2)}</strong>
                        </div>
                    </div>

                    {/* Order Status */}
                    <div style={styles.statusSection}>
                        <h3 style={styles.sectionTitle}>
                            <Truck size={20} />
                            Order Status
                        </h3>
                        <div style={styles.statusContent}>
                            <div style={statusConfig}>
                                <StatusIcon size={16} />
                                {order.status}
                            </div>
                            {order.tracking_id && (
                                <div style={styles.trackingInfo}>
                                    <div style={styles.trackingItem}>
                                        <strong>Tracking ID:</strong>
                                        <span style={styles.trackingId}>{order.tracking_id}</span>
                                    </div>
                                    {order.shipping_provider && (
                                        <div style={styles.trackingItem}>
                                            <strong>Shipping Provider:</strong>
                                            <span>{order.shipping_provider}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer & Shipping Information */}
                    <div style={styles.infoGrid}>
                        <div style={styles.infoCard}>
                            <h3 style={styles.sectionTitle}>
                                <User size={20} />
                                Customer Details
                            </h3>
                            <div style={styles.infoContent}>
                                {order.customer_name && (
                                    <div style={styles.infoItem}>
                                        <User size={16} />
                                        <span>{order.customer_name}</span>
                                    </div>
                                )}
                                {order.customer_phone && (
                                    <div style={styles.infoItem}>
                                        <Phone size={16} />
                                        <span>+91 {order.customer_phone}</span>
                                    </div>
                                )}
                                {order.customer_email && (
                                    <div style={styles.infoItem}>
                                        <span>📧</span>
                                        <span>{order.customer_email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <h3 style={styles.sectionTitle}>
                                <MapPin size={20} />
                                Shipping Address
                            </h3>
                            <div style={styles.addressContent}>
                                {order.shipping_address ? (
                                    <p style={styles.addressText}>{order.shipping_address}</p>
                                ) : (
                                    <p style={styles.noData}>No shipping address provided</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    {(order.payment_method || order.payment_status) && (
                        <div style={styles.paymentSection}>
                            <h3 style={styles.sectionTitle}>
                                {order.payment_method === 'ONLINE' ? <CreditCard size={20} /> : <Wallet size={20} />}
                                Payment Information
                            </h3>
                            <div style={styles.paymentContent}>
                                {order.payment_method && (
                                    <div style={styles.paymentItem}>
                                        <strong>Payment Method:</strong>
                                        <span>
                                            {order.payment_method === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
                                        </span>
                                    </div>
                                )}
                                {order.payment_status && (
                                    <div style={styles.paymentItem}>
                                        <strong>Payment Status:</strong>
                                        <span style={{
                                            ...styles.paymentStatus,
                                            backgroundColor: order.payment_status === 'Paid' ? '#d1fae5' : '#dbeafe',
                                            color: order.payment_status === 'Paid' ? '#065f46' : '#1e40af'
                                        }}>
                                            {order.payment_status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div style={styles.itemsSection}>
                        <h3 style={styles.sectionTitle}>
                            <Package size={20} />
                            Items in this order ({order.items?.length || 0})
                        </h3>
                        
                        {order.items && order.items.length > 0 ? (
                            <div style={styles.itemsList}>
                                {order.items.map((item, index) => (
                                    <div key={item.id || index} style={styles.itemCard}>
                                        <img 
                                            src={item.product?.main_image_url || item.product?.image_url || 'https://via.placeholder.com/80x80/e9ecef/6c757d?text=No+Image'} 
                                            alt={item.product?.name || 'Product'} 
                                            style={styles.itemImage}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/80x80/e9ecef/6c757d?text=No+Image';
                                            }}
                                        />
                                        <div style={styles.itemDetails}>
                                            <h4 style={styles.itemName}>
                                                {item.product?.name || item.product_name || 'Product'}
                                            </h4>
                                            {item.product?.model_name && (
                                                <p style={styles.itemModel}>
                                                    Model: {item.product.model_name}
                                                </p>
                                            )}
                                            <div style={styles.itemPricing}>
                                                <span style={styles.itemQuantity}>
                                                    Quantity: {item.quantity}
                                                </span>
                                                <span style={styles.itemPrice}>
                                                    ₹{parseFloat(item.price || 0).toFixed(2)} each
                                                </span>
                                            </div>
                                        </div>
                                        <div style={styles.itemTotal}>
                                            <strong>₹{calculateItemTotal(item.price, item.quantity)}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={styles.noItems}>
                                <Package size={32} />
                                <p>No items found for this order</p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div style={styles.orderSummary}>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>Total Amount</span>
                            <span style={styles.summaryTotal}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={styles.actionButtons}>
                        {order.status?.toLowerCase() === 'delivered' && (
                            <button style={styles.reorderButton}>
                                <RefreshCw size={16} />
                                Reorder Items
                            </button>
                        )}
                        <button style={styles.supportButton}>
                            <Phone size={16} />
                            Contact Support
                        </button>
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

    backToOrdersLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none',
        color: '#3b82f6',
        fontWeight: '500',
        padding: '10px 16px',
        borderRadius: '8px',
        backgroundColor: '#eff6ff'
    },

    // Main Layout
    container: { 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '24px 20px'
    },

    backLink: { 
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none', 
        color: '#3b82f6',
        fontSize: '16px',
        fontWeight: '500',
        marginBottom: '24px',
        padding: '8px 12px',
        borderRadius: '6px',
        backgroundColor: '#eff6ff',
        width: 'fit-content',
        transition: 'all 0.2s'
    },

    // Order Card
    orderCard: { 
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        animation: 'fadeIn 0.6s ease-out'
    },

    orderHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        padding: '24px 32px', 
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e5e7eb'
    },

    orderInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },

    orderTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1f2937',
        margin: 0
    },

    orderMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#6b7280',
        fontSize: '14px'
    },

    orderAmount: {
        textAlign: 'right'
    },

    totalAmount: { 
        fontSize: '24px', 
        fontWeight: '700',
        color: '#059669'
    },

    // Sections
    statusSection: {
        padding: '32px',
        borderBottom: '1px solid #f3f4f6'
    },

    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '16px'
    },

    statusContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },

    trackingInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        border: '1px solid #bbf7d0'
    },

    trackingItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#166534'
    },

    trackingId: {
        fontFamily: 'monospace',
        backgroundColor: '#dcfce7',
        padding: '2px 6px',
        borderRadius: '4px'
    },

    // Info Grid
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        padding: '32px',
        borderBottom: '1px solid #f3f4f6',
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: '16px'
        }
    },

    infoCard: {
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
    },

    infoContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },

    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#374151'
    },

    addressContent: {
        padding: '4px 0'
    },

    addressText: {
        fontSize: '14px',
        color: '#374151',
        lineHeight: '1.5',
        margin: 0
    },

    noData: {
        fontSize: '14px',
        color: '#9ca3af',
        fontStyle: 'italic',
        margin: 0
    },

    // Payment Section
    paymentSection: {
        padding: '32px',
        borderBottom: '1px solid #f3f4f6'
    },

    paymentContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },

    paymentItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#374151'
    },

    paymentStatus: {
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
    },

    // Items Section
    itemsSection: {
        padding: '32px'
    },

    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },

    itemCard: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        padding: '20px',
        backgroundColor: '#f8fafc', 
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
    },

    itemImage: { 
        width: '80px', 
        height: '80px', 
        objectFit: 'cover', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
    },

    itemDetails: { 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },

    itemName: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
        margin: 0
    },

    itemModel: {
        fontSize: '14px',
        color: '#6b7280',
        margin: 0
    },

    itemPricing: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },

    itemQuantity: {
        fontSize: '14px',
        color: '#374151'
    },

    itemPrice: {
        fontSize: '14px',
        color: '#6b7280'
    },

    itemTotal: { 
        fontSize: '18px',
        fontWeight: '700',
        color: '#059669',
        textAlign: 'right'
    },

    noItems: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '40px',
        color: '#6b7280',
        textAlign: 'center'
    },

    // Order Summary
    orderSummary: {
        padding: '24px 32px',
        backgroundColor: '#f8fafc',
        borderTop: '2px solid #e5e7eb'
    },

    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    summaryLabel: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151'
    },

    summaryTotal: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#059669'
    },

    // Action Buttons
    actionButtons: {
        display: 'flex',
        gap: '12px',
        padding: '24px 32px',
        justifyContent: 'flex-end'
    },

    reorderButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },

    supportButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    }
};
