'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
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
  Store
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

export default function BuyerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });
    const router = useRouter();

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
        // Support both /shop/[slug] and /store/[id] URL patterns
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
            // Get current store context
            const storeInfo = getCurrentStoreInfo();
            setCurrentStoreInfo(storeInfo);
            
            // Build API URL with store filter if in store context
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
                // Clear tokens and redirect
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

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        let filtered = [...orders];

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => 
                order.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Apply search filter
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

        // Apply sorting
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
            'PENDING': { backgroundColor: '#fef3c7', color: '#92400e', icon: Clock },
            'PROCESSING': { backgroundColor: '#dbeafe', color: '#1e40af', icon: Package },
            'SHIPPED': { backgroundColor: '#d1fae5', color: '#065f46', icon: Truck },
            'DELIVERED': { backgroundColor: '#d1fae5', color: '#065f46', icon: CheckCircle },
            'CANCELLED': { backgroundColor: '#fee2e2', color: '#991b1b', icon: X },
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

    // ✅ Enhanced: Smart back navigation that works with different URL structures
    const getBackUrl = () => {
        if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
            // Check if it's a shop URL structure
            if (window.location.pathname.includes('/shop/')) {
                return `/shop/${currentStoreInfo.storeId}`;
            }
            return `/store/${currentStoreInfo.storeId}`;
        }
        return '/profile';
    };

    if (isLoading) {
        return (
            <div style={styles.pageContainer}>
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
            <div style={styles.pageContainer}>
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
        <div style={styles.pageContainer}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <Link href={getBackUrl()} style={styles.backLink}>
                        <ArrowLeft size={20}/>
                        <span>
                            {currentStoreInfo.isInStore ? 'Back to Store' : 'Back to Profile'}
                        </span>
                    </Link>
                    <div style={styles.titleSection}>
                        <h1 style={styles.title}>
                            <Package size={28} />
                            {currentStoreInfo.isInStore ? 'Store Orders' : 'My Orders'}
                        </h1>
                        <p style={styles.subtitle}>
                            {currentStoreInfo.isInStore 
                                ? 'Orders from this store only'
                                : 'Track and manage all your orders'
                            }
                        </p>
                    </div>
                    <button onClick={fetchOrders} style={styles.refreshButton}>
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* ✅ Show store context indicator */}
                {currentStoreInfo.isInStore && (
                    <div style={styles.storeIndicator}>
                        <Store size={16} />
                        <span>Viewing orders from Store: {currentStoreInfo.storeId}</span>
                    </div>
                )}

                <div style={styles.filtersSection}>
                    {/* Search Box */}
                    <div style={styles.searchBox}>
                        <Search size={18} style={styles.searchIcon} />
                        <input 
                            type="text" 
                            placeholder={`Search by Order ID, Product name${currentStoreInfo.isInStore ? '...' : ', Store name...'}`}
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            style={styles.searchInput}
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div style={styles.filterTabs}>
                        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <button 
                                key={status} 
                                onClick={() => setStatusFilter(status)} 
                                style={{
                                    ...styles.filterTab, 
                                    ...(statusFilter === status ? styles.activeFilterTab : {})
                                }}
                            >
                                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                                {statusCounts[status] && (
                                    <span style={styles.filterCount}>
                                        ({statusCounts[status]})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Sort Options */}
                    <div style={styles.sortSection}>
                        <label style={styles.sortLabel}>Sort by:</label>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            style={styles.sortSelect}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="amount_high">Amount (High to Low)</option>
                            <option value="amount_low">Amount (Low to High)</option>
                        </select>
                    </div>
                </div>

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
                                    <div style={styles.cardHeader}>
                                        <div style={styles.orderInfo}>
                                            <h3 style={styles.orderId}>Order #{order.id}</h3>
                                            <div style={styles.orderMeta}>
                                                <Calendar size={14} />
                                                <span>Placed on {formatDate(order.created_at)}</span>
                                                <span style={styles.orderTime}>
                                                    at {formatTime(order.created_at)}
                                                </span>
                                            </div>
                                            {/* ✅ Show store name if not in store context */}
                                            {!currentStoreInfo.isInStore && order.store_name && (
                                                <div style={styles.storeInfo}>
                                                    <span style={styles.storeLabel}>From:</span>
                                                    <span style={styles.storeName}>{order.store_name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={styles.orderAmount}>
                                            <strong style={styles.total}>
                                                ₹{parseFloat(order.total_amount).toFixed(2)}
                                            </strong>
                                        </div>
                                    </div>

                                    <div style={styles.cardBody}>
                                        <div style={styles.statusSection}>
                                            <span style={styles.statusLabel}>Status:</span>
                                            <span style={{
                                                ...styles.statusBadge, 
                                                ...statusStyle
                                            }}>
                                                <StatusIcon size={14} />
                                                {order.status}
                                            </span>
                                        </div>

                                        {order.items && order.items.length > 0 && (
                                            <div style={styles.itemsSection}>
                                                <h4 style={styles.itemsHeader}>
                                                    Items ({order.items.length}):
                                                </h4>
                                                <ul style={styles.itemList}>
                                                    {order.items.slice(0, 3).map((item, index) => (
                                                        <li key={item.id || index} style={styles.itemListItem}>
                                                            <span style={styles.itemQuantity}>
                                                                {item.quantity}x
                                                            </span>
                                                            <span style={styles.itemName}>
                                                                {item.product?.name || item.product_name || 'Item'}
                                                            </span>
                                                        </li>
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <li style={styles.moreItems}>
                                                            ...and {order.items.length - 3} more items
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Shipping Info */}
                                        {(order.shipping_provider || order.tracking_id) && (
                                            <div style={styles.shippingInfo}>
                                                {order.shipping_provider && (
                                                    <div style={styles.shippingItem}>
                                                        <Truck size={14} />
                                                        <span>Via {order.shipping_provider}</span>
                                                    </div>
                                                )}
                                                {order.tracking_id && (
                                                    <div style={styles.shippingItem}>
                                                        <span style={styles.trackingLabel}>Tracking:</span>
                                                        <span style={styles.trackingId}>
                                                            {order.tracking_id}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div style={styles.cardFooter}>
                                        <div style={styles.cardActions}>
                                            <Link 
                                                href={`/profile/orders/${order.id}`}
                                                style={styles.viewButton}
                                            >
                                                <Eye size={16} />
                                                View Details
                                            </Link>
                                            {order.status?.toLowerCase() === 'delivered' && (
                                                <button style={styles.reorderButton}>
                                                    <RefreshCw size={16} />
                                                    Reorder
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Results Summary */}
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
    // ✅ Enhanced: Store context indicator
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

    // Store info in order cards
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

    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
    },

    // Loading and Error States
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

    // Main Layout
    container: { 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '24px 20px',
        flex: 1
    },

    header: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
    },

    backLink: { 
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textDecoration: 'none', 
        color: '#3b82f6',
        fontSize: '16px',
        fontWeight: '500',
        padding: '8px 12px',
        borderRadius: '6px',
        backgroundColor: '#eff6ff',
        transition: 'all 0.2s'
    },

    titleSection: {
        textAlign: 'center',
        flex: 1
    },

    title: { 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1f2937',
        margin: '0 0 8px 0'
    },

    subtitle: {
        color: '#6b7280',
        fontSize: '16px',
        margin: 0
    },

    refreshButton: {
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

    // Filters Section
    filtersSection: { 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        padding: '24px', 
        marginBottom: '24px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
    },

    searchBox: { 
        position: 'relative', 
        marginBottom: '20px'
    },

    searchIcon: {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#6b7280',
        zIndex: 1
    },

    searchInput: { 
        width: '100%', 
        padding: '12px 16px 12px 48px', 
        border: '2px solid #e5e7eb', 
        borderRadius: '12px',
        fontSize: '16px',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
    },

    filterTabs: { 
        display: 'flex', 
        gap: '8px', 
        flexWrap: 'wrap',
        marginBottom: '16px'
    },

    filterTab: { 
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px', 
        backgroundColor: '#f8fafc', 
        border: '2px solid #e5e7eb', 
        borderRadius: '20px', 
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        transition: 'all 0.2s'
    },

    activeFilterTab: { 
        backgroundColor: '#3b82f6', 
        borderColor: '#3b82f6',
        color: 'white'
    },

    filterCount: {
        fontSize: '12px',
        opacity: 0.8
    },

    sortSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid #f3f4f6'
    },

    sortLabel: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
    },

    sortSelect: {
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white',
        color: '#374151'
    },

    // Empty State
    emptyState: { 
        textAlign: 'center', 
        padding: '80px 40px',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '2px dashed #d1d5db',
        color: '#6b7280'
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

    // Order List
    orderList: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        animation: 'fadeIn 0.6s ease-out'
    },

    card: { 
        border: '1px solid #e5e7eb', 
        borderRadius: '16px', 
        backgroundColor: '#fff', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'all 0.2s'
    },

    cardHeader: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        padding: '20px 24px', 
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: '#f8fafc'
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
        textAlign: 'right'
    },

    total: { 
        fontSize: '20px', 
        fontWeight: '700',
        color: '#059669'
    },

    cardBody: { 
        padding: '20px 24px'
    },

    statusSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
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
        padding: '6px 12px', 
        borderRadius: '20px', 
        fontSize: '12px', 
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
        color: '#1f2937',
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
        color: '#374151'
    },

    itemQuantity: {
        fontWeight: '600',
        color: '#3b82f6',
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
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        border: '1px solid #bbf7d0'
    },

    shippingItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#166534'
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

    cardFooter: { 
        padding: '16px 24px', 
        borderTop: '1px solid #f3f4f6', 
        backgroundColor: '#f8fafc'
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
        padding: '10px 16px', 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },

    reorderButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },

    // Results Summary
    resultsSummary: {
        textAlign: 'center',
        marginTop: '24px',
        padding: '16px',
        color: '#6b7280',
        fontSize: '14px'
    }
};
