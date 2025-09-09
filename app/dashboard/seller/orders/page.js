'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Package, Clock, User, CreditCard, Wallet } from 'lucide-react';

const ORDERS_API_URL = 'http://localhost:8000/user/orders/';

// A dedicated component for a single order card for better organization
function OrderCard({ order, getStatusStyle, getPaymentStatusStyle }) {
    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <div>
                    <h3 style={styles.orderId}>Order #{order.id}</h3>
                    <div style={styles.orderMeta}>
                        <Clock size={14} />
                        <span>{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                </div>
                <strong style={styles.totalAmount}>₹{order.total_amount}</strong>
            </div>

            <div style={styles.cardBody}>
                <div style={styles.detailRow}>
                    <div style={styles.detailItem}>
                        <User size={16} />
                        <span>{order.customer_name}</span>
                    </div>
                    {order.payment_method && (
                        <div style={styles.detailItem}>
                            {order.payment_method === 'ONLINE' ? <CreditCard size={16} /> : <Wallet size={16} />}
                            <span style={{...styles.badge, ...getPaymentStatusStyle(order.payment_status)}}>
                                {order.payment_status}
                            </span>
                        </div>
                    )}
                </div>

                <div style={styles.itemsSection}>
                    <h4>Items ({order.items.length})</h4>
                    <ul style={styles.itemList}>
                        {order.items.slice(0, 2).map(item => (
                            <li key={item.id}>{item.quantity} x {item.product?.name || 'Item'}</li>
                        ))}
                        {order.items.length > 2 && (
                            <li>...and {order.items.length - 2} more</li>
                        )}
                    </ul>
                </div>
            </div>
            
            <div style={styles.cardFooter}>
                <div style={{...styles.badge, ...getStatusStyle(order.status)}}>
                    {order.status}
                </div>
                <Link href={`/dashboard/seller/orders/${order.id}`} style={styles.actionButton}>
                    <Eye size={16} /> View Details
                </Link>
            </div>
        </div>
    );
}

export default function OrdersListPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { 'Authorization': `Token ${token}` };
  }, [router]);

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers) return;

    const url = statusFilter ? `${ORDERS_API_URL}?status=${statusFilter}` : ORDERS_API_URL;
    
    axios.get(url, { headers })
      .then(res => {
        setOrders(res.data.results || res.data);
      })
      .catch(err => console.error("Failed to fetch orders", err))
      .finally(() => setIsLoading(false));
  }, [statusFilter, getAuthHeaders]);

  const getStatusStyle = (status) => {
      const styles = {
          PENDING: { backgroundColor: '#fffbeb', color: '#b45309' },
          PROCESSING: { backgroundColor: '#eef2ff', color: '#4338ca' },
          SHIPPED: { backgroundColor: '#dcfce7', color: '#166534' },
          DELIVERED: { backgroundColor: '#dcfce7', color: '#166534' },
          CANCELLED: { backgroundColor: '#fee2e2', color: '#991b1b' },
      };
      return styles[status] || {};
  };

  const getPaymentStatusStyle = (status) => {
      const styles = {
          'Paid': { backgroundColor: '#dcfce7', color: '#166534' },
          'Pay on Delivery': { backgroundColor: '#eef2ff', color: '#4338ca' },
      };
      return styles[status] || {};
  };

  if (isLoading) return <p>Loading orders...</p>;

  return (
    <div>
      <div style={styles.header}>
        <h1>Manage Orders</h1>
      </div>
      
      <div style={styles.filterContainer}>
        <button onClick={() => setStatusFilter('')} style={!statusFilter ? styles.activeFilter : styles.filterButton}>All</button>
        <button onClick={() => setStatusFilter('PENDING')} style={statusFilter === 'PENDING' ? styles.activeFilter : styles.filterButton}>Pending</button>
        <button onClick={() => setStatusFilter('PROCESSING')} style={statusFilter === 'PROCESSING' ? styles.activeFilter : styles.filterButton}>Processing</button>
        <button onClick={() => setStatusFilter('SHIPPED')} style={statusFilter === 'SHIPPED' ? styles.activeFilter : styles.filterButton}>Shipped</button>
        <button onClick={() => setStatusFilter('DELIVERED')} style={statusFilter === 'DELIVERED' ? styles.activeFilter : styles.filterButton}>Delivered</button>
        <button onClick={() => setStatusFilter('CANCELLED')} style={statusFilter === 'CANCELLED' ? styles.activeFilter : styles.filterButton}>Cancelled</button>
      </div>

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
                <p>No orders found for this status.</p>
            </div>
        )}
      </div>
    </div>
  );
}

const styles = {
    header: { borderBottom: '1px solid #dee2e6', paddingBottom: '1rem', marginBottom: '1.5rem' },
    filterContainer: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    filterButton: { padding: '8px 16px', border: '1px solid #dee2e6', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontWeight: '500' },
    activeFilter: { padding: '8px 16px', border: '1px solid #0d6efd', borderRadius: '20px', background: '#0d6efd', color: 'white', cursor: 'pointer', fontWeight: '500' },
    orderGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { border: '1px solid #dee2e6', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #f1f5f9' },
    orderId: { fontSize: '1.1rem', fontWeight: 'bold' },
    orderMeta: { display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.9rem' },
    totalAmount: { fontSize: '1.3rem', fontWeight: 'bold' },
    cardBody: { padding: '15px 20px' },
    detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    detailItem: { display: 'flex', alignItems: 'center', gap: '8px' },
    badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
    itemsSection: { borderTop: '1px solid #f1f5f9', paddingTop: '15px' },
    itemList: { listStyle: 'none', padding: 0, margin: '5px 0 0 0', color: '#475569' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc' },
    actionButton: { display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', padding: '8px 12px', borderRadius: '5px', backgroundColor: '#6c757d', color: 'white' },
    emptyState: { textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #dee2e6' },
};

