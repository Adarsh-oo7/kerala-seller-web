'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../../../styles/DashboardOrders.css'

import {
  Eye, Package, Clock, User, CreditCard, Wallet, Filter,
  RefreshCw, Download, Search, AlertCircle, TrendingUp,
  ShoppingCart, Bell, BellRing, X,
} from 'lucide-react';

// const API_BASE_URL = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL || 'https://api.keralasellers.in';
// const ORDERS_API_URL = `${API_BASE_URL}/user/orders/`;
// const NOTIFICATIONS_API_URL = `${API_BASE_URL}/api/notifications/`;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     'https://api.keralasellers.in';

const ORDERS_API_URL = `${API_BASE_URL}/user/orders/`;
const NOTIFICATIONS_API_URL = `${API_BASE_URL}/api/notifications/`;

console.log('ðŸ”” Notifications:', {
  API_BASE_URL,
  ORDERS_API_URL,
  usingLocal: process.env.NEXT_PUBLIC_API_BASE_URL
});


function NotificationBell({ count, onClick }) {
  return (
    <div className='dashboardordernotftbtn' style={styles.notificationContainer} onClick={onClick}>
      {count > 0 ? <BellRing size={20} className='dashboardordernotificationbellicon' /> : <Bell size={20} className='dashboardordernotificationbellicon' />}
      {count > 0 && (<span style={styles.notificationBadge}>{count > 99 ? '99+' : count}</span>)}
    </div>
  );
}

function AdvancedFilters({ statusFilter, setStatusFilter, paymentFilter, setPaymentFilter, dateFilter, setDateFilter, minAmount, setMinAmount, maxAmount, setMaxAmount, sortBy, setSortBy, orderStats, onClearFilters }) {
  return (
    <div style={styles.advancedFilters}>
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Sort By</label>
        <div style={styles.filterButtonGroup}>
          {[
            { value: '-created_at', label: 'Latest Orders' },
            { value: '-total_amount', label: 'Highest Amount' },
            { value: 'total_amount', label: 'Lowest Amount' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              style={sortBy === option.value ? styles.activeFilter : styles.filterButton}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Status</label>
        <div style={styles.filterButtonGroup}>
          <button onClick={() => setStatusFilter('')} style={!statusFilter ? styles.activeFilter : styles.filterButton}>
            All {orderStats.total && `(${orderStats.total})`}
          </button>
          {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} style={statusFilter === status ? styles.activeFilter : styles.filterButton}>
              {status} {orderStats[status] && `(${orderStats[status]})`}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Payment Method</label>
        <div style={styles.filterButtonGroup}>
          <button onClick={() => setPaymentFilter('')} style={!paymentFilter ? styles.activeFilter : styles.filterButton}>All</button>
          {['ONLINE', 'COD'].map(method => (
            <button key={method} onClick={() => setPaymentFilter(method)} style={paymentFilter === method ? styles.activeFilter : styles.filterButton}>
              {method === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Date Range</label>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={styles.dateSelect}>
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">Last 3 Months</option>
        </select>
      </div>

      {(statusFilter || paymentFilter || minAmount || maxAmount || dateFilter || sortBy !== '-created_at') && (
        <button onClick={onClearFilters} style={styles.clearFiltersBtn}><X size={16} />Clear All</button>
      )}
    </div>
  );
}

function OrderCard({ order, getStatusStyle, getPaymentStatusStyle }) {
  const formatDate = (dateString) => new Date(dateString).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock size={14} />;
      case 'PROCESSING': return <Package size={14} />;
      case 'SHIPPED':
      case 'DELIVERED': return <TrendingUp size={14} />;
      default: return <Package size={14} />;
    }
  };

  return (

    <div
      style={{
        border: '1px solid #c5c5c5ff',
        borderRadius: '0.5rem',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Header Section */}
      <div
        className='dashboardorderpageorderheader'
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '0.9rem',
              fontWeight: '700',
              color: '#3b82f6',
              margin: 0,
              lineHeight: '1.4',
            }}
          >
            Order #{order.id}
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              color: 'var(--muted-foreground)',
              marginTop: '0.25rem',
            }}
          >
            <Clock size={13} style={{ marginTop: '1px' }} />
            <span>{formatDate(order.created_at)}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div
          style={{
            ...styles.statusBadge, ...getStatusStyle(order.status),
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.6rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {getStatusIcon(order.status)}
          <span>{order.status}</span>
        </div>

      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

      {/* Customer Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Customer Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '1.25rem',
              height: '1.25rem',
              borderRadius: '0.25rem',
              backgroundColor: 'rgba(var(--primary-rgb), 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={12} style={{ color: 'var(--primary)' }} />
          </div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--foreground)',
            }}
          >
            {order.customer_name || 'Guest Customer'}
          </span>
        </div>

        {/* Item Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '1.25rem',
              height: '1.25rem',
              borderRadius: '0.25rem',
              backgroundColor: 'rgba(var(--primary-rgb), 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingCart size={12} style={{ color: 'var(--primary)' }} />
          </div>
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--muted-foreground)',
            }}
          >
            {order.items?.length || 0} items ordered
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border)',
          paddingTop: '0.75rem',
          marginTop: '0.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'rgb(23, 94, 84)',
            }}
          >
            {parseFloat(order.total_amount).toFixed(2)}
          </span>
        </div>

        <Link
          href={`/dashboard/seller/orders/${order.id}`}
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#3b82f6',
            textDecoration: 'none',
            transition: 'color 0.2s ease-in-out',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(var(--primary-rgb), 0.8)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
        >
          View Details
        </Link>
      </div>
    </div>

  );
}

export default function OrdersListPage() {
  const [allOrders, setAllOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderStats, setOrderStats] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // âœ… Real-time search input
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('sellerAccessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

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
      console.error('Notification error:', error);
    }
  }, [getAuthHeaders]);

  // âœ… FIXED: Fetch all orders once from backend
  const fetchOrdersData = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsLoading(true);
    setError('');

    try {
      let url = ORDERS_API_URL;
      const params = new URLSearchParams();

      // Only filter by backend filters, no search yet
      if (statusFilter) params.append('status', statusFilter);
      if (paymentFilter) params.append('payment_method', paymentFilter);
      if (minAmount) params.append('min_amount', minAmount);
      if (maxAmount) params.append('max_amount', maxAmount);

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

      params.append('ordering', sortBy || '-created_at');

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('ðŸ“¡ Fetching all orders:', url);
      const response = await axios.get(url, { headers });

      const orderData = response.data.results || response.data || [];
      console.log('âœ… Fetched orders:', orderData.length);

      setAllOrders(orderData);

      const stats = orderData.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        acc.total = (acc.total || 0) + 1;
        return acc;
      }, {});
      setOrderStats(stats);

    } catch (error) {
      console.error('âŒ Error:', error);
      if (error.response?.status === 401) {
        setError('Session expired.');
        setTimeout(() => router.push('/login/seller'), 2000);
      } else {
        setError('Failed to load orders.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // âœ… NEW: Client-side filtering & searching in real-time
  // âœ… FIXED: Combined client-side filtering with ALL filters
  const applyClientFilters = useCallback(() => {
    let filtered = [...allOrders];

    // 1. Status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // 2. Payment method filter
    if (paymentFilter) {
      filtered = filtered.filter(order => order.payment_method === paymentFilter);
    }

    // 3. Search filter (instant)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(search) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(search)) ||
        (order.customer_phone && order.customer_phone.includes(searchTerm))
      );
    }

    // 4. Amount range filter
    if (minAmount) {
      filtered = filtered.filter(order => parseFloat(order.total_amount) >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(order => parseFloat(order.total_amount) <= parseFloat(maxAmount));
    }

    // 5. Date filter
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
        filtered = filtered.filter(order => new Date(order.created_at) >= startDate);
      }
    }

    // 6. Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case '-created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case '-total_amount':
          return parseFloat(b.total_amount) - parseFloat(a.total_amount);
        case 'total_amount':
          return parseFloat(a.total_amount) - parseFloat(b.total_amount);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    console.log(`âœ… Filtered orders: ${filtered.length} (Status: ${statusFilter}, Payment: ${paymentFilter}, Search: "${searchTerm}")`);
    setDisplayedOrders(filtered);
  }, [allOrders, searchTerm, statusFilter, paymentFilter, dateFilter, minAmount, maxAmount, sortBy]);


  const markNotificationAsRead = async (notificationId) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      await axios.patch(`${NOTIFICATIONS_API_URL}${notificationId}/mark-as-read/`, {}, { headers });
      fetchNotifications();
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const clearAllFilters = () => {
    setStatusFilter('');
    setPaymentFilter('');
    setDateFilter('');
    setSearchTerm('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('-created_at');
  };

  // âœ… Initial load
  useEffect(() => {
    fetchOrdersData();
  }, []);

  // âœ… Fetch when backend filters change
  useEffect(() => {
    fetchOrdersData();
  }, [statusFilter, paymentFilter, dateFilter, minAmount, maxAmount, sortBy]);

  // âœ… Apply client-side search when search term changes (NO API CALL)
  useEffect(() => {
    applyClientFilters();
  }, [searchTerm, applyClientFilters]);

  useEffect(() => {
    fetchNotifications();
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
    if (displayedOrders.length === 0) {
      alert('No orders to export');
      return;
    }

    const csvContent = [
      ['Order ID', 'Date', 'Customer', 'Phone', 'Amount', 'Status', 'Payment Method', 'Items Count'],
      ...displayedOrders.map(order => [
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
        <button onClick={fetchOrdersData} style={styles.retryButton}>
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className='dashboardorderpagecontainer' style={styles.pageContainer}>
      <div className='dashboardorderheader' style={styles.header}>
        <div>
          <h1 className='dashboardordertitle' style={styles.pageTitle}>
            <Package className='dashboardorderpackageicon' size={28} />My Orders {orderStats.total && (<span style={styles.totalBadge}>({orderStats.total})</span>)}</h1>
          <p className='dashboardordersubtitle' style={styles.pageSubtitle}>View and manage all your customer orders</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.notificationWrapper}>
            <NotificationBell count={notificationCount} onClick={() => setShowNotifications(!showNotifications)} />

            {showNotifications && (
              <div className='dashboardordernotificationdropdown notfscroll' style={styles.notificationsDropdown}>
                <div className='dashboardordernotificationdropdownheader' style={styles.notificationsHeader}>
                  <h3>Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} style={styles.closeNotificationsBtn}><X size={18} /></button>
                </div>
                <div style={styles.notificationsList}>
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map(notification => (
                      <div key={notification.id} style={styles.notificationItem} onClick={() => markNotificationAsRead(notification.id)}>
                        <p style={styles.notificationMessage}>{notification.message}</p>
                        <small style={styles.notificationTime}>{new Date(notification.created_at).toLocaleString()}</small>
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

          <button className='dashboardorderexportbtn' onClick={handleExportOrders} style={styles.exportButton}><Download className='dashboardordernotificationbellicon' size={18} />Export CSV</button>
          <button className='dashboardorderexportbtn' onClick={fetchOrdersData} style={styles.refreshButton}><RefreshCw className='dashboardordernotificationbellicon' size={18} />Refresh</button>
        </div>
      </div>

      {/* âœ… IMPROVED: Real-time search (NO button needed) */}
      <div style={styles.searchContainer}>
        <Search className='dashboardorderfiltericon' size={18} style={styles.searchIcon} />
        <input
          className='dashboardordersearchinput'
          type="text"
          placeholder="Search by customer name, phone, or order ID... (instant)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        {/* âœ… Clear button when searching */}
        {searchTerm && (
          <button className='dashboardorderclearsearchicon' onClick={() => setSearchTerm('')} style={styles.clearInsideInput}>
            <X size={16} />
          </button>
        )}

        <button className='dashboardorderfilterbtn' onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} style={styles.filterToggle}><Filter className='dashboardorderfiltericon' size={18} />Filters</button>
      </div>

      {searchTerm && (
        <div style={styles.searchResultsInfo}>
          ðŸ” Found <strong>{displayedOrders.length}</strong> order(s) matching "{searchTerm}"
        </div>
      )}

      <div className="desktop-filters">
        {showAdvancedFilters && (
          <AdvancedFilters
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter}
            dateFilter={dateFilter} setDateFilter={setDateFilter}
            minAmount={minAmount} setMinAmount={setMinAmount}
            maxAmount={maxAmount} setMaxAmount={setMaxAmount}
            sortBy={sortBy} setSortBy={setSortBy}
            orderStats={orderStats} onClearFilters={clearAllFilters}
          />
        )}
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className="mobile-filter-sidebar"
        style={{
          ...styles.mobileSidebar,
          transform: showAdvancedFilters ? "translateX(0)" : "translateX(100%)",
        }}
      >

        <div style={styles.sidebarHeader}>
          <h3 style={{ margin: 0 }}>Filters</h3>
          <button
            onClick={() => setShowAdvancedFilters(false)}
            style={styles.closeBtn}
          >
          
          </button>
        </div>
        <div className="mobile-filter-wrapper">
          <AdvancedFilters
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter}
            dateFilter={dateFilter} setDateFilter={setDateFilter}
            minAmount={minAmount} setMinAmount={setMinAmount}
            maxAmount={maxAmount} setMaxAmount={setMaxAmount}
            sortBy={sortBy} setSortBy={setSortBy}
            orderStats={orderStats} onClearFilters={clearAllFilters}
          />
        </div>
      </div>

      <div className='dashboardorderpageordercardgrid' style={styles.orderGrid}>
        {displayedOrders.length > 0 ? (
          displayedOrders.map(order => (
            <OrderCard key={order.id} order={order} getStatusStyle={getStatusStyle} getPaymentStatusStyle={getPaymentStatusStyle} />
          ))
        ) : (
          <div style={styles.emptyState}>
            <Package className='dashboardorderemptyicon' size={48} />
            <h3>No orders found</h3>
            <p>
              {searchTerm
                ? `No orders match your search "${searchTerm}"`
                : statusFilter || paymentFilter || dateFilter || minAmount || maxAmount
                  ? `No orders match your filters.`
                  : 'No orders yet.'
              }
            </p>
            {(searchTerm || statusFilter || paymentFilter || dateFilter || minAmount || maxAmount) && (
              <button onClick={clearAllFilters} style={styles.clearFiltersButton}>Clear All</button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
         .notfscroll::-webkit-scrollbar {
  height: 1px;   /* thinner horizontal scrollbar */
  width: 1px;    /* thinner vertical scrollbar */
}

.notfscroll::-webkit-scrollbar-track {
  background: transparent; /* optional: hide track for cleaner look */
}

.notfscroll::-webkit-scrollbar-thumb {
  background: #dbef8bff;   /* light gray thumb */
  border-radius: 4px;
}

.notfscroll::-webkit-scrollbar-thumb:hover {
  background: #aaa;   /* slightly darker on hover */
}

/* Firefox support */
.notfscroll {
  scrollbar-width: thin; /* options: auto | thin | none */
  scrollbar-color: #255230ff transparent; /* thumb | track */
}

      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: { padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.6s ease-out' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '20px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  errorContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '20px', textAlign: 'center', color: '#ef4444' },
  retryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  pageTitle: { fontSize: '2rem', fontWeight: '700', color: 'rgb(23, 94, 84)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' },
  totalBadge: { backgroundColor: '#e5e7eb', color: '#374151', borderRadius: '12px', padding: '4px 8px', fontSize: '16px', fontWeight: '500' },
  pageSubtitle: { fontSize: '1rem', color: '#6b7280', margin: 0 },
  headerActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  notificationWrapper: { position: 'relative' },
  notificationContainer: { position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#FDFFF0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notificationBadge: { position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', animation: 'pulse 2s infinite' },
  notificationsDropdown: { position: 'absolute', top: '100%', right: '0', backgroundColor: 'rgb(254, 252, 232)', border: '1px solid rgb(250, 204, 21) ', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '320px', zIndex: 1000, maxHeight: '400px', overflow: 'hidden', marginTop: '8px' },
  notificationsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px', borderBottom: '1px solid #a0a0a0ff' },
  closeNotificationsBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#224c26ff', padding: '4px' },
  notificationsList: { maxHeight: '300px', overflowY: 'auto' },
  notificationItem: { padding: '12px 16px', borderBottom: '1px solid #a0a0a0ff', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s' },
  notificationMessage: { margin: '0 0 4px 0', fontSize: '14px', color: '#374151' },
  notificationTime: { color: '#6b7280', fontSize: '12px' },
  unreadDot: { position: 'absolute', top: '5px', right: '12px', width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' },
  noNotifications: { padding: '20px', textAlign: 'center', color: '#6b7280', fontStyle: 'italic', margin: 0 },
  exportButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  searchContainer: { position: 'relative', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  searchIcon: { position: 'absolute', left: '12px', color: 'rgb(23, 94, 84)', zIndex: 1 },
  searchInput: { flex: 1, minWidth: '250px', padding: '10px 12px 10px 40px', border: '1px solid rgb(23, 94, 84)', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', backgroundColor: '#FDFFF0' },
  clearSearchBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', backgroundColor: '#f3f4f6', color: '#ef4444', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  filterToggle: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'rgb(23, 94, 84)', color: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  searchResultsInfo: { padding: '12px 16px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', color: '#065f46', fontSize: '13px', fontWeight: '500', marginBottom: '16px' },
  advancedFilters: { backgroundColor: 'rgb(159 191 166 / 21%)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
  filterGroup: { marginBottom: '16px' },
  filterLabel: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' },
  filterButtonGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  amountFilterGroup: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  amountInput: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '120px' },
  dateSelect: { padding: '8px 12px', border: '1px solid rgb(23, 94, 84)', borderRadius: '6px', fontSize: '14px', backgroundColor: '#FDFFF0' },
  clearFiltersBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  filterButton: { padding: '6px 12px', border: '1px solid rgb(23, 94, 84)', borderRadius: '20px', background: '#FDFFF0', cursor: 'pointer', fontWeight: '500', fontSize: '13px', color: '#374151', transition: 'all 0.2s', height: '35px' },
  activeFilter: { padding: '6px 12px', border: '1px solid rgb(23, 94, 84)', borderRadius: '20px', background: 'rgb(23, 94, 84)', color: 'white', cursor: 'pointer', fontWeight: '500', fontSize: '13px', height: '35px' },
  orderGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1rem',
  },
  card: { border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', transition: 'all 0.2s ease' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f8fafc' },
  orderInfo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  orderId: { fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 },
  orderMeta: { display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px' },
  orderAmount: { textAlign: 'right' },
  totalAmount: { fontSize: '20px', fontWeight: '700', color: '#1f2937' },
  cardBody: { padding: '20px 24px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' },
  detailItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' },
  phoneNumber: { fontSize: '13px', color: '#6b7280' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: '1px solid' },
  itemsSection: { borderTop: '1px solid #f3f4f6', paddingTop: '16px' },
  itemsHeader: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px', margin: '0 0 12px 0' },
  itemList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' },
  itemListItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '14px' },
  itemQuantity: { fontWeight: '600', color: '#3b82f6', minWidth: '30px' },
  itemPrice: { fontWeight: '600', color: '#059669' },
  moreItems: { fontStyle: 'italic', color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '8px' },
  noItems: { color: '#9ca3af', fontStyle: 'italic', fontSize: '14px', margin: 0 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #f3f4f6', backgroundColor: '#f8fafc' },
  actionButton: { display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', fontSize: '14px', fontWeight: '500', transition: 'background-color 0.2s' },
  emptyState: { textAlign: 'center', padding: '60px 40px', backgroundColor: '#FDFFF0', borderRadius: '12px', border: '1px dashed #d1d5db', color: '#6b7280' },
  clearFiltersButton: { padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginTop: '12px' },
  mobileSidebar: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100vh",
    width: "60%",
    maxWidth: "240px",
    background: "#FDFFF0",
    zIndex: 9999,
    padding: "20px",
    boxShadow: "-2px 0 12px rgba(0,0,0,0.25)",
    overflowY: "auto",
    transition: "transform 0.3s ease",
    transform: "translateX(100%)", // start hidden on right
  },

  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  closeBtn: {
    background: "#ffe6e6ff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    color: "red",
  },
 clearInsideInput: {
  position: 'absolute',
  right: '120px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.7,
},

};


