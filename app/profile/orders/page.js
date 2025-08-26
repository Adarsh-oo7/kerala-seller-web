'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  ShoppingBag, 
  Phone,
  Eye,
  Star,
  Filter,
  Search
} from 'lucide-react';

const ORDERS_API_URL = 'http://localhost:8000/user/orders/history/';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('buyerAccessToken');
    if (!token) {
      router.push('/login/buyer');
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

  useEffect(() => {
    const fetchOrders = async () => {
      const headers = getAuthHeaders();
      if (!headers) return;

      try {
        const response = await axios.get(ORDERS_API_URL, { headers });
        const orderData = response.data.results || response.data || [];
        setOrders(orderData);
        setFilteredOrders(orderData);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [getAuthHeaders]);

  // Filter orders based on status and search query
  useEffect(() => {
    let filtered = orders;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchQuery) ||
        order.items?.some(item => 
          item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery]);

  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'inline-block'
    };

    switch (status?.toLowerCase()) {
      case 'pending':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'confirmed':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'shipped':
        return { ...baseStyle, backgroundColor: '#e0e7ff', color: '#3730a3' };
      case 'delivered':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'cancelled':
        return { ...baseStyle, backgroundColor: '#fecaca', color: '#dc2626' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getOrderSummary = () => {
    const total = orders.length;
    const delivered = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;
    const pending = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
    return { total, delivered, pending };
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  const summary = getOrderSummary();

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <Link href="/profile" style={styles.backButton}>
            <ArrowLeft size={20} />
            <span style={styles.backText}>Profile</span>
          </Link>
          <h1 style={styles.headerTitle}>My Orders</h1>
          <div style={styles.orderBadge}>
            <Package size={16} />
            <span>{orders.length}</span>
          </div>
        </div>
      </header>

      <div style={styles.container}>
        {/* Order Summary Cards - Desktop */}
        <div style={styles.summarySection}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              <Package size={20} />
            </div>
            <div>
              <span style={styles.summaryNumber}>{summary.total}</span>
              <span style={styles.summaryLabel}>Total Orders</span>
            </div>
          </div>
          
          <div style={styles.summaryCard}>
            <div style={{...styles.summaryIcon, backgroundColor: '#dcfce7', color: '#166534'}}>
              <Package size={20} />
            </div>
            <div>
              <span style={styles.summaryNumber}>{summary.delivered}</span>
              <span style={styles.summaryLabel}>Delivered</span>
            </div>
          </div>
          
          <div style={styles.summaryCard}>
            <div style={{...styles.summaryIcon, backgroundColor: '#fef3c7', color: '#92400e'}}>
              <Package size={20} />
            </div>
            <div>
              <span style={styles.summaryNumber}>{summary.pending}</span>
              <span style={styles.summaryLabel}>Pending</span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div style={styles.filtersSection}>
          <div style={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by order ID or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterTabs}>
            {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  ...styles.filterTab,
                  ...(statusFilter === status ? styles.activeFilterTab : {})
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Content */}
        {filteredOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <ShoppingBag size={64} />
            </div>
            <h3 style={styles.emptyTitle}>
              {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
            </h3>
            <p style={styles.emptyText}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start shopping to see your orders here'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/shops" style={styles.shopButton}>
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div style={styles.ordersList}>
            {filteredOrders.map(order => (
              <div key={order.id} style={styles.orderCard}>
                {/* Order Header */}
                <div style={styles.orderHeader}>
                  <div style={styles.orderInfo}>
                    <h4 style={styles.orderId}>Order #{order.id}</h4>
                    <div style={styles.orderMeta}>
                      <Calendar size={14} />
                      <span>{new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  <div style={styles.orderRight}>
                    <div style={styles.orderAmount}>{formatPrice(order.total_amount)}</div>
                    <span style={getStatusStyle(order.status)}>{order.status}</span>
                  </div>
                </div>

                {/* Seller Info */}
                {order.seller_info && (
                  <div style={styles.sellerInfo}>
                    <div style={styles.sellerDetails}>
                      <strong style={styles.sellerName}>{order.seller_info.name}</strong>
                      <div style={styles.sellerContact}>
                        <Phone size={14} />
                        <span>{order.seller_info.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div style={styles.orderItems}>
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item.id} style={styles.orderItem}>
                      <div style={styles.itemImagePlaceholder}>
                        <Package size={16} />
                      </div>
                      <div style={styles.itemDetails}>
                        <span style={styles.itemName}>{item.product?.name || 'Item'}</span>
                        <span style={styles.itemQuantity}>Qty: {item.quantity}</span>
                      </div>
                      <span style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p style={styles.moreItems}>+{order.items.length - 3} more items</p>
                  )}
                </div>

                {/* Delivery Address */}
                {order.shipping_address && (
                  <div style={styles.addressSection}>
                    <MapPin size={16} />
                    <div style={styles.addressContent}>
                      <span style={styles.addressLabel}>Delivery Address:</span>
                      <span style={styles.addressText}>
                        {typeof order.shipping_address === 'string' 
                          ? (order.shipping_address.length > 80 
                              ? `${order.shipping_address.substring(0, 80)}...`
                              : order.shipping_address)
                          : JSON.stringify(order.shipping_address)
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Order Actions */}
                <div style={styles.orderActions}>
                  <button style={styles.primaryAction}>
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>
                  {order.status?.toLowerCase() === 'delivered' && (
                    <button style={styles.secondaryAction}>
                      <Star size={16} />
                      <span>Rate & Review</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
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
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
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
  
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
    padding: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Header
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '8px'
  },
  backText: {
    display: 'none',
    '@media (min-width: 640px)': {
      display: 'inline'
    }
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    '@media (max-width: 640px)': {
      fontSize: '18px'
    }
  },
  orderBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },

  // Container
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    '@media (min-width: 768px)': {
      padding: '40px 20px'
    }
  },

  // Summary Section
  summarySection: {
    display: 'none',
    '@media (min-width: 768px)': {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      marginBottom: '32px'
    }
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  summaryIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#475569'
  },
  summaryNumber: {
    display: 'block',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: '1'
  },
  summaryLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px'
  },

  // Filters Section
  filtersSection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    animation: 'fadeIn 0.6s ease-out'
  },
  searchBox: {
    position: 'relative',
    marginBottom: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 44px',
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
    '@media (max-width: 640px)': {
      gap: '6px'
    }
  },
  filterTab: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '20px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    '@media (max-width: 640px)': {
      padding: '6px 12px',
      fontSize: '12px'
    }
  },
  activeFilterTab: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },

  // Empty State
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '60px 20px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    animation: 'fadeIn 0.6s ease-out'
  },
  emptyIcon: {
    color: '#cbd5e1',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 12px 0'
  },
  emptyText: {
    color: '#64748b',
    margin: '0 0 24px 0',
    fontSize: '16px',
    lineHeight: '1.5'
  },
  shopButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.2s'
  },

  // Orders List
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animation: 'fadeIn 0.6s ease-out'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9',
    transition: 'all 0.2s',
    ':hover': {
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
      transform: 'translateY(-2px)'
    }
  },

  // Order Header
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9'
  },
  orderInfo: {
    flex: 1
  },
  orderId: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  orderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
    fontSize: '14px'
  },
  orderRight: {
    textAlign: 'right'
  },
  orderAmount: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#059669',
    marginBottom: '8px'
  },

  // Seller Info
  sellerInfo: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  sellerDetails: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '@media (max-width: 640px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px'
    }
  },
  sellerName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b'
  },
  sellerContact: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#475569',
    fontSize: '14px'
  },

  // Order Items
  orderItems: {
    marginBottom: '20px'
  },
  orderItem: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  itemImagePlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0
  },
  itemName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  itemQuantity: {
    fontSize: '14px',
    color: '#64748b'
  },
  itemPrice: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#475569'
  },
  moreItems: {
    fontSize: '14px',
    color: '#64748b',
    margin: '8px 0 0 0',
    fontStyle: 'italic',
    textAlign: 'center'
  },

  // Address
  addressSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px'
  },
  addressContent: {
    flex: 1,
    minWidth: 0
  },
  addressLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px'
  },
  addressText: {
    display: 'block',
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5'
  },

  // Actions
  orderActions: {
    display: 'flex',
    gap: '12px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px'
  },
  primaryAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  secondaryAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fcd34d',
    borderRadius: '12px',
    color: '#92400e',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  }
};
