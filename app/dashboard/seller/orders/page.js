'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Eye, 
  Package, 
  Clock, 
  User, 
  CreditCard, 
  Wallet, 
  Filter,
  RefreshCw,
  Download,
  Search,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  Bell,
  BellRing,
  X,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ORDERS_API_URL = `${API_BASE_URL}/user/orders/`;
const NOTIFICATIONS_API_URL = `${API_BASE_URL}/api/notifications/`;

// ✅ NEW: Notification Badge Component
function NotificationBell({ count, onClick }) {
  return (
    <div style={styles.notificationContainer} onClick={onClick}>
      {count > 0 ? <BellRing size={20} /> : <Bell size={20} />}
      {count > 0 && (
        <span style={styles.notificationBadge}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
}

// ✅ NEW: Advanced Filters Component
function AdvancedFilters({ 
  statusFilter, 
  setStatusFilter, 
  paymentFilter, 
  setPaymentFilter,
  dateFilter,
  setDateFilter,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  orderStats,
  onClearFilters 
}) {
  return (
    <div style={styles.advancedFilters}>
      {/* Status Filter */}
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Status</label>
        <div style={styles.filterButtonGroup}>
          <button 
            onClick={() => setStatusFilter('')} 
            style={!statusFilter ? styles.activeFilter : styles.filterButton}
          >
            All {orderStats.total && `(${orderStats.total})`}
          </button>
          {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)} 
              style={statusFilter === status ? styles.activeFilter : styles.filterButton}
            >
              {status} {orderStats[status] && `(${orderStats[status]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Filter */}
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Payment Method</label>
        <div style={styles.filterButtonGroup}>
          <button 
            onClick={() => setPaymentFilter('')} 
            style={!paymentFilter ? styles.activeFilter : styles.filterButton}
          >
            All
          </button>
          {['ONLINE', 'COD'].map(method => (
            <button 
              key={method}
              onClick={() => setPaymentFilter(method)} 
              style={paymentFilter === method ? styles.activeFilter : styles.filterButton}
            >
              {method === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
            </button>
          ))}
        </div>
      </div>

      {/* Amount Range Filter */}
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Amount Range</label>
        <div style={styles.amountFilterGroup}>
          <input
            type="number"
            placeholder="Min ₹"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            style={styles.amountInput}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            style={styles.amountInput}
          />
        </div>
      </div>

      {/* Date Filter */}
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Date Range</label>
        <select 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)}
          style={styles.dateSelect}
        >
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">Last 3 Months</option>
        </select>
      </div>

      {/* Clear Filters */}
      {(statusFilter || paymentFilter || minAmount || maxAmount || dateFilter) && (
        <button onClick={onClearFilters} style={styles.clearFiltersBtn}>
          <X size={16} />
          Clear All Filters
        </button>
      )}
    </div>
  );
}

// Enhanced OrderCard component with better styling and features
function OrderCard({ order, getStatusStyle, getPaymentStatusStyle }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock size={14} />;
            case 'PROCESSING':
                return <Package size={14} />;
            case 'SHIPPED':
            case 'DELIVERED':
                return <TrendingUp size={14} />;
            default:
                return <Package size={14} />;
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <div style={styles.orderInfo}>
                    <h3 style={styles.orderId}>Order #{order.id}</h3>
                    <div style={styles.orderMeta}>
                        <Clock size={14} />
                        <span>{formatDate(order.created_at)}</span>
                    </div>
                </div>
                <div style={styles.orderAmount}>
                    <strong style={styles.totalAmount}>₹{parseFloat(order.total_amount).toFixed(2)}</strong>
                </div>
            </div>

            <div style={styles.cardBody}>
                <div style={styles.detailRow}>
                    <div style={styles.detailItem}>
                        <User size={16} />
                        <span>{order.customer_name || 'Guest Customer'}</span>
                    </div>
                    {order.customer_phone && (
                        <div style={styles.detailItem}>
                            <span style={styles.phoneNumber}>+91 {order.customer_phone}</span>
                        </div>
                    )}
                </div>

                {order.payment_method && (
                    <div style={styles.detailRow}>
                        <div style={styles.detailItem}>
                            {order.payment_method === 'ONLINE' ? <CreditCard size={16} /> : <Wallet size={16} />}
                            <span>{order.payment_method === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}</span>
                        </div>
                        <div style={{...styles.statusBadge, ...getPaymentStatusStyle(order.payment_status)}}>
                            {order.payment_status || (order.payment_method === 'ONLINE' ? 'PAID' : 'COD')}
                        </div>
                    </div>
                )}

                <div style={styles.itemsSection}>
                    <h4 style={styles.itemsHeader}>
                        <ShoppingCart size={16} />
                        Items ({order.items?.length || 0})
                    </h4>
                    {order.items && order.items.length > 0 ? (
                        <ul style={styles.itemList}>
                            {order.items.slice(0, 3).map((item, index) => (
                                <li key={item.id || index} style={styles.itemListItem}>
                                    <span style={styles.itemQuantity}>{item.quantity}x</span>
                                    <span>{item.product?.name || item.product_name || 'Item'}</span>
                                    {item.price && (
                                        <span style={styles.itemPrice}>₹{parseFloat(item.price).toFixed(2)}</span>
                                    )}
                                </li>
                            ))}
                            {order.items.length > 3 && (
                                <li style={styles.moreItems}>
                                    ...and {order.items.length - 3} more items
                                </li>
                            )}
                        </ul>
                    ) : (
                        <p style={styles.noItems}>No items listed</p>
                    )}
                </div>
            </div>
            
            <div style={styles.cardFooter}>
                <div style={{...styles.statusBadge, ...getStatusStyle(order.status)}}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                </div>
                <Link href={`/dashboard/seller/orders/${order.id}`} style={styles.actionButton}>
                    <Eye size={16} />
                    <span>View Details</span>
                </Link>
            </div>
        </div>
    );
}

export default function OrdersListPage() {
  // ✅ EXISTING STATE
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderStats, setOrderStats] = useState({});
  const router = useRouter();

  // ✅ ENHANCED FILTER STATE
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ✅ NEW: NOTIFICATION STATE
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // ✅ FIXED: Changed Token to Bearer authentication
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('sellerAccessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

  // ✅ NEW: Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const [countResponse, listResponse] = await Promise.all([
        axios.get(`${NOTIFICATIONS_API_URL}count/`, { headers }),
        axios.get(`${NOTIFICATIONS_API_URL}`, { headers })
      ]);
      
      setNotificationCount(countResponse.data.unread_count || 0);
      setNotifications(listResponse.data.results || listResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Don't show error for notifications - they're not critical
    }
  }, [getAuthHeaders]);

  // ✅ ENHANCED: Advanced Order Fetching with Backend Filtering
  const fetchOrders = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsLoading(true);
    setError('');

    try {
      let url = ORDERS_API_URL;
      const params = new URLSearchParams();
      
      // ✅ BACKEND FILTERS
      if (statusFilter) params.append('status', statusFilter);
      if (paymentFilter) params.append('payment_method', paymentFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      
      // ✅ NEW: Amount filters
      if (minAmount) params.append('min_amount', minAmount);
      if (maxAmount) params.append('max_amount', maxAmount);
      
      // ✅ NEW: Date filters
      if (dateFilter) {
        const now = new Date();
        let startDate;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'quarter':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
        }
        
        if (startDate) {
          params.append('created_at__gte', startDate.toISOString());
        }
      }
      
      // ✅ ORDERING
      params.append('ordering', '-created_at');
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('Fetching orders from:', url);
      const response = await axios.get(url, { headers });
      
      const orderData = response.data.results || response.data || [];
      console.log('Orders fetched:', orderData.length);
      
      setOrders(orderData);
      
      // Calculate order statistics
      const stats = orderData.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        acc.total = (acc.total || 0) + 1;
        return acc;
      }, {});
      setOrderStats(stats);
      
    } catch (error) {
      console.error("Failed to fetch orders", error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => router.push('/login/seller'), 2000);
      } else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, paymentFilter, dateFilter, searchTerm, minAmount, maxAmount, getAuthHeaders, router]);

  // ✅ NEW: Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      await axios.patch(`${NOTIFICATIONS_API_URL}${notificationId}/mark-as-read/`, {}, { headers });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // ✅ NEW: Clear all filters
  const clearAllFilters = () => {
    setStatusFilter('');
    setPaymentFilter('');
    setDateFilter('');
    setSearchTerm('');
    setMinAmount('');
    setMaxAmount('');
  };

  // ✅ EFFECTS
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchNotifications();
    // ✅ Real-time notification updates every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const getStatusStyle = (status) => {
    const statusStyles = {
      'PENDING': { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#f59e0b' },
      'PROCESSING': { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#3b82f6' },
      'SHIPPED': { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#10b981' },
      'DELIVERED': { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#10b981' },
      'CANCELLED': { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#ef4444' },
    };
    return statusStyles[status] || { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#9ca3af' };
  };

  const getPaymentStatusStyle = (status) => {
    const paymentStyles = {
      'Paid': { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#10b981' },
      'Pay on Delivery': { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#3b82f6' },
      'Pending': { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#f59e0b' },
      'PAID': { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#10b981' },
      'COD': { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#3b82f6' },
      'PENDING': { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#f59e0b' },
    };
    return paymentStyles[status] || { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#9ca3af' };
  };

  const handleExportOrders = () => {
    if (orders.length === 0) {
      alert('No orders to export');
      return;
    }

    const csvContent = [
      ['Order ID', 'Date', 'Customer', 'Phone', 'Amount', 'Status', 'Payment Method', 'Items Count'],
      ...orders.map(order => [
        order.id,
        new Date(order.created_at).toLocaleString(),
        order.customer_name || 'Guest',
        order.customer_phone || '',
        order.total_amount,
        order.status,
        order.payment_method || '',
        order.items?.length || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchOrders} style={styles.retryButton}>
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>
            <Package size={28} />
            My Orders
            {orderStats.total && (
              <span style={styles.totalBadge}>({orderStats.total})</span>
            )}
          </h1>
          <p style={styles.pageSubtitle}>View and manage all your customer orders</p>
        </div>
        <div style={styles.headerActions}>
          {/* ✅ NEW: Notification Bell */}
          <div style={styles.notificationWrapper}>
            <NotificationBell 
              count={notificationCount} 
              onClick={() => setShowNotifications(!showNotifications)}
            />
            
            {/* ✅ FIXED: Proper positioning for notifications dropdown */}
            {showNotifications && (
              <div style={styles.notificationsDropdown}>
                <div style={styles.notificationsHeader}>
                  <h3>Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} style={styles.closeNotificationsBtn}>
                    <X size={18} />
                  </button>
                </div>
                <div style={styles.notificationsList}>
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map(notification => (
                      <div 
                        key={notification.id} 
                        style={styles.notificationItem}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <p style={styles.notificationMessage}>{notification.message}</p>
                        <small style={styles.notificationTime}>
                          {new Date(notification.created_at).toLocaleString()}
                        </small>
                        {!notification.is_read && <div style={styles.unreadDot}></div>}
                      </div>
                    ))
                  ) : (
                    <p style={styles.noNotifications}>No notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button onClick={handleExportOrders} style={styles.exportButton}>
            <Download size={18} />
            Export CSV
          </button>
          <button onClick={fetchOrders} style={styles.refreshButton}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* ✅ ENHANCED: Search Bar */}
      <div style={styles.searchContainer}>
        <Search size={18} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by customer name, phone, or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <button 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={styles.filterToggle}
        >
          <Filter size={18} />
          Filters
        </button>
      </div>
      
      {/* ✅ NEW: Advanced Filters */}
      {showAdvancedFilters && (
        <AdvancedFilters 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          paymentFilter={paymentFilter}
          setPaymentFilter={setPaymentFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          minAmount={minAmount}
          setMinAmount={setMinAmount}
          maxAmount={maxAmount}
          setMaxAmount={setMaxAmount}
          orderStats={orderStats}
          onClearFilters={clearAllFilters}
        />
      )}

      {/* Orders List */}
      <div style={styles.orderGrid}>
        {orders.length > 0 ? (
          orders.map(order => (
            <OrderCard 
              key={order.id}
              order={order}
              getStatusStyle={getStatusStyle}
              getPaymentStatusStyle={getPaymentStatusStyle}
            />
          ))
        ) : (
          <div style={styles.emptyState}>
            <Package size={48} />
            <h3>No orders found</h3>
            <p>
              {searchTerm || statusFilter || paymentFilter || dateFilter || minAmount || maxAmount
                ? `No orders match your current filters.`
                : 'No orders have been placed at your store yet.'
              }
            </p>
            {(searchTerm || statusFilter || paymentFilter || dateFilter || minAmount || maxAmount) && (
              <button onClick={clearAllFilters} style={styles.clearFiltersButton}>
                Clear All Filters
              </button>
            )}
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    animation: 'fadeIn 0.6s ease-out'
  },
  
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
    color: '#ef4444'
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
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  totalBadge: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    borderRadius: '12px',
    padding: '4px 8px',
    fontSize: '16px',
    fontWeight: '500'
  },
  
  pageSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0
  },
  
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  // ✅ FIXED: Notification Styles with proper positioning
  notificationWrapper: {
    position: 'relative'
  },

  notificationContainer: {
    position: 'relative',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  notificationBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    animation: 'pulse 2s infinite'
  },

  notificationsDropdown: {
    position: 'absolute',
    top: '100%',
    right: '0',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '320px',
    zIndex: 1000,
    maxHeight: '400px',
    overflow: 'hidden',
    marginTop: '8px'
  },

  notificationsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #f3f4f6'
  },

  closeNotificationsBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px'
  },

  notificationsList: {
    maxHeight: '300px',
    overflowY: 'auto'
  },

  notificationItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s'
  },

  notificationMessage: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    color: '#374151'
  },

  notificationTime: {
    color: '#6b7280',
    fontSize: '12px'
  },

  unreadDot: {
    position: 'absolute',
    top: '12px',
    right: '16px',
    width: '8px',
    height: '8px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%'
  },

  noNotifications: {
    padding: '20px',
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    margin: 0
  },
  
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  searchContainer: {
    position: 'relative',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#6b7280',
    zIndex: 1
  },
  
  searchInput: {
    flex: 1,
    padding: '12px 12px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },

  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },

  // ✅ Advanced Filter Styles
  advancedFilters: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  },

  filterGroup: {
    marginBottom: '16px'
  },

  filterLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },

  filterButtonGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },

  amountFilterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },

  amountInput: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    width: '120px'
  },

  dateSelect: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white'
  },

  clearFiltersBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  filterButton: { 
    padding: '10px 16px', 
    border: '1px solid #d1d5db', 
    borderRadius: '20px', 
    background: '#fff', 
    cursor: 'pointer', 
    fontWeight: '500',
    fontSize: '14px',
    color: '#374151',
    transition: 'all 0.2s'
  },
  
  activeFilter: { 
    padding: '10px 16px', 
    border: '1px solid #3b82f6', 
    borderRadius: '20px', 
    background: '#3b82f6', 
    color: 'white', 
    cursor: 'pointer', 
    fontWeight: '500',
    fontSize: '14px'
  },
  
  orderGrid: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px'
  },
  
  card: { 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    backgroundColor: '#fff', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
    overflow: 'hidden',
    transition: 'all 0.2s ease'
  },
  
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
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
    gap: '6px', 
    color: '#6b7280', 
    fontSize: '14px'
  },
  
  orderAmount: {
    textAlign: 'right'
  },
  
  totalAmount: { 
    fontSize: '20px', 
    fontWeight: '700',
    color: '#1f2937'
  },
  
  cardBody: { 
    padding: '20px 24px'
  },
  
  detailRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  
  detailItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    fontSize: '14px',
    color: '#374151'
  },
  
  phoneNumber: {
    fontSize: '13px',
    color: '#6b7280'
  },
  
  statusBadge: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '6px 12px', 
    borderRadius: '20px', 
    fontSize: '12px', 
    fontWeight: '600',
    border: '1px solid'
  },
  
  itemsSection: { 
    borderTop: '1px solid #f3f4f6', 
    paddingTop: '16px'
  },
  
  itemsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px',
    margin: '0 0 12px 0'
  },
  
  itemList: { 
    listStyle: 'none', 
    padding: 0, 
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  itemListItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    fontSize: '14px'
  },
  
  itemQuantity: {
    fontWeight: '600',
    color: '#3b82f6',
    minWidth: '30px'
  },
  
  itemPrice: {
    fontWeight: '600',
    color: '#059669'
  },
  
  moreItems: {
    fontStyle: 'italic',
    color: '#6b7280',
    fontSize: '13px',
    textAlign: 'center',
    padding: '8px'
  },
  
  noItems: {
    color: '#9ca3af',
    fontStyle: 'italic',
    fontSize: '14px',
    margin: 0
  },
  
  cardFooter: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '16px 24px', 
    borderTop: '1px solid #f3f4f6', 
    backgroundColor: '#f8fafc'
  },
  
  actionButton: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '8px', 
    textDecoration: 'none', 
    padding: '10px 16px', 
    borderRadius: '8px', 
    backgroundColor: '#3b82f6', 
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  
  emptyState: { 
    textAlign: 'center', 
    padding: '60px 40px', 
    backgroundColor: '#fff', 
    borderRadius: '12px', 
    border: '1px dashed #d1d5db',
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
    marginTop: '12px'
  }
};
