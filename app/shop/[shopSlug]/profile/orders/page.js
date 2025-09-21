'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Store, AlertTriangle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function ShopOrdersPage() {
  const { shopSlug } = useParams(); // ✅ FIXED: Use shopSlug instead of sellerPhone
  const searchParams = useSearchParams(); // ✅ ADDED: Get search parameters
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [urlError, setUrlError] = useState(null);

  // ✅ CRITICAL FIX: Get the actual store ID from query parameter or shopSlug
  const getActualStoreId = () => {
    console.log('🔍 Getting store ID for orders...');
    console.log('- shopSlug from params:', shopSlug);
    console.log('- id from search params:', searchParams.get('id'));

    // Check for undefined values
    if (shopSlug === 'undefined' || shopSlug === undefined) {
      setUrlError('Invalid shop slug in URL');
      return null;
    }

    // Get store ID from query parameter or slug
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

  // ✅ ENHANCED: URL generation with validation
  const getShopUrl = (path = '') => {
    if (!actualStoreId) {
      console.error('❌ Cannot generate URL - no store ID available');
      return '/';
    }
    
    if (searchParams.get('id') && shopSlug === 'new') {
      // Pattern: /shop/new/path?id=123
      const basePath = `/shop/new${path}`;
      return `${basePath}?id=${actualStoreId}`;
    } else {
      // Pattern: /shop/123/path
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
      router.replace('/profile'); // Redirect to global profile
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
        // ✅ ENHANCED: Use store_id parameter for better filtering
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

  // Show error if no store ID found (shouldn't reach here due to redirect)
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

      {/* Debug Info (remove in production) */}
      <div style={{
        backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px',
        marginBottom: '20px', fontSize: '12px', color: '#666'
      }}>
        <strong>Debug:</strong> Store: {actualStoreId} | Orders: {orders.length} | 
        Store Name: {storeData?.name || 'Loading...'}
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
              </div>

              {/* Order Actions */}
              <div style={styles.orderActions}>
                {order.status?.toLowerCase() === 'delivered' && (
                  <button style={styles.actionButton}>
                    Rate Order
                  </button>
                )}
                {order.status?.toLowerCase() === 'pending' && (
                  <button style={{...styles.actionButton, backgroundColor: '#ef4444'}}>
                    Cancel Order
                  </button>
                )}
                <button style={{...styles.actionButton, backgroundColor: '#6b7280'}}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
    padding: '12px', borderRadius: '6px', lineHeight: '1.4'
  },
  orderActions: {
    display: 'flex', gap: '8px', flexWrap: 'wrap'
  },
  actionButton: {
    padding: '8px 16px', backgroundColor: '#10b981', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
  }
};
