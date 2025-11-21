'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import '../../../styles/Keralasellersprofileorder.css'
import Link from 'next/link';
import {
    Package,
    ArrowLeft,
    Search,
    ShoppingBag,
    AlertCircle,
    RefreshCw,
    Calendar,
    Eye,
    Clock,
    CheckCircle,
    Truck,
    X,
    Filter,
    Globe,
    Home,
    Store,
    Download,
    XCircle,
    CreditCard,
    MapPin,
    User,
    AlertOctagon
} from 'lucide-react';

// ✅ Enhanced API base URL handling with environment variables
const getApiBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
        return envUrl.trim();
    }
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:8000';
    }
    return 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const ORDERS_API_URL = `${API_BASE_URL}/user/orders/history/`;
const INVOICE_API_URL = (orderId) => `${API_BASE_URL}/user/orders/${orderId}/invoice/`;
const CANCEL_ORDER_API_URL = (orderId) => `${API_BASE_URL}/user/orders/${orderId}/cancel/`;

export default function BuyerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const router = useRouter();
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // ✅ Cancellation Modal States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
    };

    const closeOrderDetails = () => {
        setShowOrderDetails(false);
        setSelectedOrder(null);
    };

    // ✅ Enhanced token handling - supports both Google login and regular login
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('access_token') ||
            localStorage.getItem('buyerAccessToken') ||
            localStorage.getItem('accessToken');

        if (!token) {
            console.error('❌ No authentication token found');
            router.push('/login/buyer');
            return null;
        }

        console.log('🔍 Using token:', token.substring(0, 30) + '...');
        return { 'Authorization': `Bearer ${token}` };
    }, [router]);

    // ✅ Enhanced: Get current store info from URL - supports both shop and store structures
    const getCurrentStoreInfo = useCallback(() => {
        if (typeof window === 'undefined') return { storeId: null, isInStore: false };

        const currentPath = window.location.pathname;
        const storeMatch = currentPath.match(/\/shop\/([^\/]+)/) || currentPath.match(/\/store\/([^\/]+)/);
        return {
            storeId: storeMatch ? storeMatch[1] : null,
            isInStore: !!storeMatch
        };
    }, []);

    // ✅ Store-aware fetch orders
    const fetchOrders = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) return;

        setIsLoading(true);
        setError('');

        try {
            const storeInfo = getCurrentStoreInfo();
            setCurrentStoreInfo(storeInfo);

            let apiUrl = ORDERS_API_URL;
            if (storeInfo.isInStore && storeInfo.storeId) {
                const separator = apiUrl.includes('?') ? '&' : '?';
                apiUrl = `${apiUrl}${separator}store_id=${storeInfo.storeId}`;
            }

            console.log('Fetching orders from:', apiUrl);
            const response = await axios.get(apiUrl, {
                headers,
                timeout: 15000
            });

            const orderData = response.data.results || response.data || [];
            console.log('Orders received:', orderData);

            setOrders(orderData);
            setFilteredOrders(orderData);
        } catch (err) {
            console.error("Failed to fetch order history", err);
            if (err.response?.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('buyerAccessToken');
                localStorage.removeItem('accessToken');
                router.push('/login/buyer');
            } else if (err.code === 'ECONNABORTED') {
                setError('Request timed out. Please check your connection and try again.');
            } else {
                setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, router, getCurrentStoreInfo]);

    // ✅ Download Invoice Handler
    const handleDownloadInvoice = async (orderId) => {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await axios.get(INVOICE_API_URL(orderId), {
                headers,
                responseType: 'blob',
                timeout: 20000
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Invoice download failed', err);
            alert(err.response?.data?.message || 'Failed to download invoice. Please try again.');
        }
    };

    // ✅ Open Cancel Modal
    const openCancelModal = (order) => {
        setOrderToCancel(order);
        setCancelReason('');
        setShowCancelModal(true);
    };

    // ✅ Close Cancel Modal
    const closeCancelModal = () => {
        setShowCancelModal(false);
        setOrderToCancel(null);
        setCancelReason('');
    };

    // ✅ Handle Cancel Order with Reason
    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        const headers = getAuthHeaders();
        if (!headers) return;

        setCancellingOrderId(orderToCancel.id);

        try {
            const response = await axios.post(
                CANCEL_ORDER_API_URL(orderToCancel.id),
                { reason: cancelReason.trim() },
                { headers, timeout: 15000 }
            );

            alert(response.data?.message || 'Order cancelled successfully!');
            closeCancelModal();
            await fetchOrders();
        } catch (err) {
            console.error('Order cancellation failed:', err);
            alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
        } finally {
            setCancellingOrderId(null);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        let filtered = [...orders];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order =>
                order.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order =>
                order.id.toString().includes(query) ||
                order.items?.some(item =>
                    item.product?.name?.toLowerCase().includes(query) ||
                    item.product_name?.toLowerCase().includes(query)
                ) ||
                order.customer_name?.toLowerCase().includes(query) ||
                order.store_name?.toLowerCase().includes(query)
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'amount_high':
                    return parseFloat(b.total_amount) - parseFloat(a.total_amount);
                case 'amount_low':
                    return parseFloat(a.total_amount) - parseFloat(b.total_amount);
                default:
                    return 0;
            }
        });

        setFilteredOrders(filtered);
    }, [orders, statusFilter, searchQuery, sortBy]);

    const getStatusStyle = (status) => {
        const statusStyles = {
            'PENDING': { color: '#f59e0b', icon: Clock },
            'PROCESSING': { color: '#3b82f6', icon: Package },
            'SHIPPED': { color: '#065f46', icon: Truck },
            'DELIVERED': { color: '#065f46', icon: CheckCircle },
            'CANCELLED': { color: '#ef4444', icon: XCircle },
        };
        return statusStyles[status?.toUpperCase()] || statusStyles.PENDING;
    };

    const getStatusCounts = () => {
        const counts = orders.reduce((acc, order) => {
            const status = order.status?.toLowerCase() || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            acc.all = (acc.all || 0) + 1;
            return acc;
        }, {});
        return counts;
    };

    const formatPrice = (price) => `₹${parseFloat(price).toFixed(2)}`;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getBackUrl = () => {
        if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
            if (window.location.pathname.includes('/shop/')) {
                return `/shop/${currentStoreInfo.storeId}`;
            }
            return `/store/${currentStoreInfo.storeId}`;
        }
        return '/profile';
    };

    const canCancelOrder = (order) => {
        return order.status?.toUpperCase() === 'PENDING';
    };

    if (isLoading) {
        return (
            <div style={styles.pagecontainer}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <h3>Loading orders...</h3>
                    <p>Please wait while we fetch your order history</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.pagecontainer}>
                <div style={styles.errorContainer}>
                    <AlertCircle size={48} color="#ef4444" />
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <div style={styles.errorActions}>
                        <button onClick={fetchOrders} style={styles.retryButton}>
                            <RefreshCw size={18} />
                            Try Again
                        </button>
                        <Link href={getBackUrl()} style={styles.backToProfileLink}>
                            <ArrowLeft size={18} />
                            Go Back
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const statusCounts = getStatusCounts();

    return (
        <div style={styles.pagecontainer}>
            <Header />

            <h2 className='keralasellersprofileordertitle' style={styles.pageTitle}>YOUR ORDERS</h2>

            <div style={styles.container}>
                {currentStoreInfo.isInStore && (
                    <div style={styles.storeIndicator}>
                        <Store size={16} />
                        <span>Viewing orders from Store: {currentStoreInfo.storeId}</span>
                    </div>
                )}

                {filteredOrders.length === 0 ? (
                    <div style={styles.emptyState}>
                        <ShoppingBag size={64} />
                        <h3>No orders found</h3>
                        <p>
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : currentStoreInfo.isInStore
                                    ? "You haven't ordered from this store yet."
                                    : "You haven't placed any orders yet. Start shopping to see your orders here!"
                            }
                        </p>
                        {(searchQuery || statusFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                }}
                                style={styles.clearFiltersButton}
                            >
                                Clear Filters
                            </button>
                        )}
                        {!searchQuery && statusFilter === 'all' && (
                            <div style={styles.emptyActions}>
                                <Link
                                    href={currentStoreInfo.isInStore
                                        ? `/shop/${currentStoreInfo.storeId}`
                                        : "/shop"
                                    }
                                    style={styles.shopButton}
                                >
                                    <ShoppingBag size={18} />
                                    {currentStoreInfo.isInStore ? 'Browse Store' : 'Start Shopping'}
                                </Link>
                                <Link href="/" style={styles.homeButton}>
                                    <Home size={18} />
                                    Back to Home
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={styles.orderList}>
                        {filteredOrders.map(order => {
                            const statusStyle = getStatusStyle(order.status);
                            const StatusIcon = statusStyle.icon;

                            return (
                                <div key={order.id} style={styles.card}>
                                    <div className='keralasellersprofileordercardbody' style={styles.cardBody}>
                                        <div className='keralasellersprofileordercardbodygap' style={styles.itemsAndStatus}>
                                            {order.items && order.items.length > 0 && (
                                                <div style={styles.itemsSection}>
                                                    <h4 className='keralasellersprofileorderitemname' style={styles.itemsHeader}>
                                                        Items ({order.items.length}):
                                                    </h4>
                                                    <ul style={styles.itemList}>
                                                        {order.items.slice(0, 3).map((item, index) => (
                                                            <li key={item.id || index} style={styles.itemListItem}>
                                                                <span className='keralasellersprofileorderitemdetails' style={styles.itemQuantity}>
                                                                    {item.quantity} x {item.product?.name || item.product_name || 'Item'}
                                                                </span>
                                                            </li>
                                                        ))}
                                                        {order.items.length > 3 && (
                                                            <li style={styles.moreItems}>
                                                                ...and {order.items.length - 3} more items
                                                            </li>
                                                        )}
                                                    </ul>
                                                    <div className='profileorderdate' style={styles.orderDate}>{formatDate(order.created_at)}</div>

                                                </div>
                                            )}


                                            <div style={styles.statusSectionBody}>
                                                <span className='keralasellersprofileorderstatustext' style={{
                                                    ...styles.statusBadge,
                                                    ...statusStyle
                                                }}>
                                                    <StatusIcon className='keralasellersprofileordericonsize' size={20} />
                                                    {order.status}
                                                </span>
                                            </div>

                                        </div>


                                    </div>

                                    <div className='keralasellersprofileordercardbody' style={styles.cardFooter}>
                                        <div style={styles.footerLeft}>
                                            <span className='keralasellersprofileordertotalprice' style={styles.totalLabel}>Total:</span>
                                            <strong className='keralasellersprofileordertotalprice' style={styles.totalFooter}>
                                                ₹{parseFloat(order.total_amount).toFixed(2)}
                                            </strong>
                                        </div>

                                        <div className='keralasellersorder-actions' style={styles.cardActions}>
                                            <button
                                                className='keralasellersprofileorderactionbtn'
                                                onClick={() => openOrderDetails(order)}
                                                style={styles.viewButton}
                                            >
                                                View Details
                                            </button>

                                            {canCancelOrder(order) && (
                                                <button
                                                    className="keralasellersprofileorderactionbtn"
                                                    onClick={() => openCancelModal(order)}
                                                    style={styles.cancelButton}
                                                    title="Cancel this order"
                                                >
                                                    <XCircle size={16} className='keralasellersprofileorderactionbtnicon' />
                                                    Cancel Order
                                                </button>
                                            )}

                                            {order.status?.toLowerCase() === 'delivered' && (
                                                <button
                                                    className='keralasellersprofileorderactionbtn'
                                                    onClick={() => handleDownloadInvoice(order.id)}
                                                    style={styles.invoiceButton}
                                                    title="Download invoice (PDF)"
                                                >
                                                    <Download size={16} className='keralasellersprofileorderactionbtnicon' />
                                                    Invoice
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ✅ Order Details Modal */}
                {showOrderDetails && selectedOrder && (
                    <div style={styles.modalOverlay} onClick={closeOrderDetails}>
                        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div style={styles.modalHeader}>
                                <h2 style={styles.modalTitle}>Order Details #{selectedOrder.id}</h2>
                                <button style={styles.closeButton} onClick={closeOrderDetails}>
                                    <X color="white" size={24} />
                                </button>
                            </div>

                            <div style={styles.modalBody}>
                                <div style={styles.detailSection}>
                                    <h3 style={styles.sectionTitle}>Order Status</h3>
                                    <div style={styles.statusDetail}>
                                        {(() => {
                                            const { icon: StatusIcon, color } = getStatusStyle(selectedOrder.status);
                                            return (
                                                <>
                                                    <StatusIcon color={color} size={18} style={{ marginRight: 6 }} />
                                                    <span
                                                        style={{
                                                            fontSize: '16px',
                                                            fontWeight: 600,
                                                            color,
                                                            textTransform: 'capitalize'
                                                        }}
                                                    >
                                                        {selectedOrder.status || 'Pending'}
                                                    </span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div style={styles.detailSection}>
                                    <h3 style={styles.sectionTitle}>Order Information</h3>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <Calendar size={16} />
                                            <div>
                                                <div style={styles.infoLabel}>Order Date</div>
                                                <div style={styles.infoValue}>
                                                    {formatDate(selectedOrder.created_at)} at {formatTime(selectedOrder.created_at)}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={styles.infoItem}>
                                            <CreditCard size={16} />
                                            <div>
                                                <div style={styles.infoLabel}>Payment Method</div>
                                                <div style={styles.infoValue}>
                                                    {selectedOrder.payment_method === 'COD'
                                                        ? 'Cash on Delivery'
                                                        : selectedOrder.payment_method === 'ONLINE'
                                                            ? 'Online Payment'
                                                            : selectedOrder.payment_method || 'COD'}
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

                                        {(selectedOrder.shipping_provider || selectedOrder.tracking_id) && (
                                            <div style={styles.shippingInfo}>
                                                {selectedOrder.shipping_provider && (
                                                    <div style={styles.shippingItem}>
                                                        <Truck size={16} />
                                                        <span>Via {selectedOrder.shipping_provider}</span>
                                                    </div>
                                                )}
                                                {selectedOrder.tracking_id && (
                                                    <div style={styles.shippingItem}>
                                                        <span style={styles.trackingLabel}>Tracking:</span>
                                                        <span style={styles.trackingId}>
                                                            {selectedOrder.tracking_id}
                                                        </span>
                                                    </div>
                                                )}
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
                                            selectedOrder.items.map((item) => (
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
                                            <div style={styles.noItemsModal}>
                                                No items information available
                                            </div>
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
                                        <div style={styles.totalLabel}>Total</div>
                                        <div style={styles.totalAmount}>
                                            {formatPrice(selectedOrder.total_amount)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.modalFooter}>
                                {selectedOrder.status?.toLowerCase() === 'delivered' && (
                                    <button
                                        style={styles.invoiceButton}
                                        onClick={() => handleDownloadInvoice(selectedOrder.id)}
                                    >
                                        Download Invoice
                                    </button>
                                )}


                                {canCancelOrder(selectedOrder) && (
                                    <button
                                        style={styles.cancelModalButton}
                                        onClick={() => {
                                            closeOrderDetails();
                                            openCancelModal(selectedOrder);
                                        }}
                                        disabled={cancellingOrderId === selectedOrder.id}
                                    >
                                        {cancellingOrderId === selectedOrder.id ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ CANCELLATION REASON MODAL */}
                {showCancelModal && orderToCancel && (
                    <div style={styles.modalOverlay} onClick={closeCancelModal}>
                        <div style={styles.cancelModalContent} onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div style={styles.modalHeader}>
                                <h2 style={styles.modalTitle}>
                                    <AlertOctagon size={24} style={{ marginRight: '8px' }} />
                                    Cancel Order #{orderToCancel.id}
                                </h2>
                                <button style={styles.closeButton} onClick={closeCancelModal}>
                                    <X color="white" size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div style={styles.modalBody}>
                                {/* Warning */}
                                <div style={styles.cancelWarning}>
                                    <AlertCircle size={20} color="#f59e0b" />
                                    <div>
                                        <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                                            Are you sure you want to cancel this order?
                                        </p>
                                        <p style={{ margin: 0, fontSize: '13px' }}>
                                            {orderToCancel.payment_method === 'COD'
                                                ? 'This COD order will be cancelled immediately.'
                                                : 'Refund will be processed within 5-7 business days.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Reason Input */}
                                <div style={styles.detailSection}>
                                    <h3 style={styles.sectionTitle}>
                                        Reason for Cancellation <span style={{ color: '#ef4444' }}>*</span>
                                    </h3>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Please provide a detailed reason for cancelling this order..."
                                        style={styles.customReasonTextarea}
                                        rows={4}
                                        maxLength={500}
                                        autoFocus
                                    />
                                    <div style={styles.characterCount}>
                                        {cancelReason.length}/500 characters
                                        {cancelReason.trim().length >= 10 && (
                                            <span style={{ color: '#10b981', marginLeft: '12px', fontWeight: '600' }}>
                                                ✓ Ready to submit
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Order Summary */}
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

                            {/* Footer */}
                            <div style={styles.modalFooter}>
                                <button
                                    className='keralasellersprofilekeeporderbtn'
                                    style={styles.closeModalButton}
                                    onClick={closeCancelModal}
                                    disabled={cancellingOrderId === orderToCancel.id}
                                >
                                    Keep Order
                                </button>
                                <button
                                    className='keralasellersprofilekeeporderbtn'
                                    style={{
                                        ...styles.confirmCancelButton,
                                        ...(cancellingOrderId === orderToCancel.id || !cancelReason.trim() ? styles.disabledButton : {})
                                    }}
                                    onClick={handleCancelOrder}
                                    disabled={cancellingOrderId === orderToCancel.id || !cancelReason.trim()}
                                >
                                    {cancellingOrderId === orderToCancel.id ? (
                                        <span style={styles.buttonContent}>
                                            <div style={styles.smallSpinner}></div>
                                            Cancelling...
                                        </span>
                                    ) : (
                                        <span style={styles.buttonContent}>
                                            Confirm Cancellation
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {filteredOrders.length > 0 && (
                    <div style={styles.resultsSummary}>
                        <p>
                            Showing {filteredOrders.length} of {orders.length} orders
                            {searchQuery && ` for "${searchQuery}"`}
                            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                            {currentStoreInfo.isInStore && ` from this store`}
                        </p>
                    </div>
                )}
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
    // Keep all your existing styles...
    storeIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#ecfdf5',
        border: '1px solid #10b981',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#065f46',
        fontWeight: '500',
        marginBottom: '24px'
    },
    storeInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '4px'
    },
    storeLabel: {
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: '500'
    },
    storeName: {
        fontSize: '12px',
        color: '#3b82f6',
        fontWeight: '600',
        backgroundColor: '#dbeafe',
        padding: '2px 6px',
        borderRadius: '4px'
    },
    pagecontainer: { backgroundColor: "#FDFFF0" },
    container: { minHeight: '100vh', backgroundColor: '#FDFFF0', padding: '20px', maxWidth: '1200px', margin: '0 auto' },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px',
        flex: 1
    },
    spinner: {
        width: '32px',
        height: '32px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    pageTitle: {
        textAlign: 'center',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1f2937',
        marginTop: '50px'
    },
    smallSpinner: {
        width: '14px',
        height: '14px',
        border: '2px solid #ffffff',
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px',
        textAlign: 'center',
        padding: '40px',
        flex: 1
    },
    errorActions: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    backToProfileLink: {
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
    clearFiltersButton: {
        padding: '10px 20px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        marginTop: '16px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 40px',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '2px dashed #d1d5db',
        color: '#6b7280'
    },

    // ✅ NEW: Cancel Modal Styles
    cancelWarning: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        color: '#92400e',
    },
    customReasonTextarea: {
        width: '100%',
        padding: '12px',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        resize: 'vertical',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    },
    characterCount: {
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'right',
        marginTop: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cancelOrderSummary: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'rgb(26, 72, 69)'
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'rgb(26, 72, 69)',
    },
    summaryAmount: {
        fontWeight: '700',
        color: '#10b981',
        fontSize: '16px',
    },
    emptyActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    homeButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#6b7280',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500'
    },
    shopButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#10b981',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500'
    },
    itemsAndStatus: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '24px',
        flexWrap: 'wrap'
    },
    statusSectionBody: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '150px',
        justifyContent: 'flex-end'
    },
    orderList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
    },
    orderDate: { fontSize: '13px', color: '#1a4845', marginTop: '4px' },

    card: {
        width: '100%',
        boxSizing: 'border-box',
        padding: '1rem',
        borderRadius: '8px',
        background: '#FDFFF0',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    },
    orderInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    orderId: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1f2937',
        margin: 0
    },
    orderMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#6b7280',
        fontSize: '14px',
        flexWrap: 'wrap'
    },
    orderTime: {
        fontSize: '13px',
        opacity: 0.8
    },
    orderAmount: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
    },
    total: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#059669'
    },
    paymentMethod: {
        fontSize: '12px',
        fontWeight: '600',
        padding: '4px 8px',
        borderRadius: '6px',
        backgroundColor: '#f3f4f6',
        color: '#374151'
    },
    cardBody: {
        padding: '12px 24px'
    },
    statusSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    statusLabel: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '14px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    itemsSection: {
        marginBottom: '16px'
    },
    itemsHeader: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a4845 ',
        margin: '0 0 8px 0'
    },
    itemList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    itemListItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: ' #1a4845'
    },
    itemQuantity: {
        fontWeight: '500',
        color: 'rgb(107, 114, 128) ',
        minWidth: '30px'
    },
    itemName: {
        flex: 1
    },
    moreItems: {
        fontStyle: 'italic',
        color: '#6b7280',
        fontSize: '13px'
    },
    shippingInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '12px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.38)',
        color: 'rgb(26, 72, 69)',
        borderRadius: '8px',
    },
    shippingItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: 'rgb(26, 72, 69)'
    },
    trackingLabel: {
        fontWeight: '500'
    },
    trackingId: {
        fontFamily: 'monospace',
        backgroundColor: '#dcfce7',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '13px'
    },
    footerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    totalFooter: {
        fontSize: '17px',
        fontWeight: '600',
        color: '#1a4845'
    },
    cardFooter: {
        padding: '16px 24px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#FDFFF0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    totalLabel: {
        fontSize: '17px',
        fontWeight: '600',
        color: '#1a4845'
    },
    cardActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        flexWrap: 'wrap'
    },
    viewButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: 'rgb(5, 150, 105)',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s',
        border: 'none',
        cursor: 'pointer'
    },
    cancelButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    invoiceButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px',
        backgroundColor: '#868686ff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    disabledButton: {
        opacity: 0.6,
        cursor: 'not-allowed',
        pointerEvents: 'none'
    },
    resultsSummary: {
        textAlign: 'center',
        marginTop: '24px',
        padding: '16px',
        color: '#6b7280',
        fontSize: '14px'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
    },
    modalContent: {
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'rgba(49, 47, 47, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
    },
    cancelModalContent: {
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'rgba(49, 47, 47, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(14, 69, 30, 0.2)',
    },
    modalTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'white',
        margin: 0,
        display: 'flex',
        alignItems: 'center'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#6b7280',
        padding: '8px',
        borderRadius: '8px',
        transition: 'all 0.2s'
    },
    modalBody: {
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        maxHeight: 'calc(90vh - 140px)',
        boxSizing: 'border-box',
    },
    detailSection: {
        marginBottom: '24px'
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a4845',
        marginBottom: '12px',
        margin: '0 0 12px 0'
    },
    statusDetail: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'transparent',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.38)',
        color: 'white',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
    },
    infoItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.38)',
        color: '#1a4845',
    },
    infoLabel: {
        fontSize: '12px',
        color: '#1a4845',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    infoValue: {
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500',
        marginTop: '2px'
    },
    itemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    modalOrderItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '16px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.38)',
        color: 'white',
        borderRadius: '8px'
    },
    modalItemInfo: {
        flex: 1
    },
    modalItemName: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a4845',
        marginBottom: '4px'
    },
    modalItemPrice: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '6px'
    },
    modalItemDesc: {
        fontSize: '12px',
        color: '#6b7280',
        lineHeight: '1.4',
        marginBottom: '8px'
    },
    modalItemTotal: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1a4845'
    },
    noItemsModal: {
        textAlign: 'center',
        padding: '20px',
        color: '#9ca3af',
        fontStyle: 'italic'
    },
    addressBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.38)',
        color: '#1a4845',
        borderRadius: '8px',
    },
    addressText: {
        fontSize: '14px',
        color: '#1a4845',
        lineHeight: '1.5'
    },
    cancelReasonBox: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca'
    },
    cancelReasonText: {
        fontSize: '14px',
        color: '#dc2626',
        lineHeight: '1.5'
    },
    totalSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.38)',
        color: 'white',
        borderRadius: '8px',
    },
    totalAmount: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1a4845'
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(14, 69, 30, 0.2)',
        position: 'sticky',
        bottom: 0,
        zIndex: 1,
    },
    closeModalButton: {
        padding: '10px 20px',
        backgroundColor: '#6b7280',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    cancelModalButton: {
        padding: '10px 20px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    confirmCancelButton: {
        padding: '10px 20px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    buttonContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
};
