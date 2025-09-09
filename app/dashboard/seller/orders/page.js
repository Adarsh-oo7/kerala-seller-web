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
  ShoppingCart
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ORDERS_API_URL = `${API_BASE_URL}/user/orders/`;

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
                            {order.payment_status}
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
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStats, setOrderStats] = useState({});
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { 'Authorization': `Token ${token}` };
  }, [router]);

  const fetchOrders = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsLoading(true);
    setError('');

    try {
      let url = ORDERS_API_URL;
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }

      console.log('Fetching orders from:', url);
      const response = await axios.get(url, { headers });
      
      const orderData = response.data.results || response.data || [];
      console.log('Orders fetched:', orderData.length);
      
      setOrders(orderData);
      setFilteredOrders(orderData);
      
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
        router.push('/login/seller');
      } else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, getAuthHeaders, router]);

  // Apply search filter
  useEffect(() => {
    let filtered = [...orders];
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(order => 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm) ||
        order.customer_phone?.includes(searchTerm)
      );
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
    };
    return paymentStyles[status] || { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#9ca3af' };
  };

  const handleExportOrders = () => {
    const csvContent = [
      ['Order ID', 'Date', 'Customer', 'Phone', 'Amount', 'Status', 'Payment Status', 'Items Count'],
      ...filteredOrders.map(order => [
        order.id,
        new Date(order.created_at).toLocaleString(),
        order.customer_name || 'Guest',
        order.customer_phone || '',
        order.total_amount,
        order.status,
        order.payment_status || '',
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
        <p>Loading orders...</p>
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
            Manage Orders
            {orderStats.total && (
              <span style={styles.totalBadge}>({orderStats.total})</span>
            )}
          </h1>
          <p style={styles.pageSubtitle}>View and manage all your customer orders</p>
        </div>
        <div style={styles.headerActions}>
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

      {/* Search */}
      <div style={styles.searchContainer}>
        <Search size={18} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by customer name, phone, or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>
      
      {/* Status Filter Buttons */}
      <div style={styles.filterContainer}>
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

      {/* Orders List */}
      <div style={styles.orderGrid}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
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
              {searchTerm 
                ? `No orders match "${searchTerm}". Try different search terms.`
                : statusFilter
                ? `No orders found with status "${statusFilter}".`
                : 'No orders have been placed yet.'
              }
            </p>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                style={styles.clearFiltersButton}
              >
                Clear Filters
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
    gap: '12px'
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
    marginBottom: '20px'
  },
  
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    zIndex: 1
  },
  
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  
  filterContainer: { 
    display: 'flex', 
    gap: '12px', 
    marginBottom: '24px', 
    flexWrap: 'wrap'
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
    marginBottom: '12px'
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
