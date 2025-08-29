'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye } from 'lucide-react';

const ORDERS_API_URL = 'http://localhost:8000/user/orders/';

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
        // ✅ Correctly access the .results array from the paginated response
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

  if (isLoading) return <p>Loading orders...</p>;

  return (
    <div>
      <h1>Manage Orders</h1>
      
      {/* Filter Buttons */}
      <div style={styles.filterContainer}>
        <button onClick={() => setStatusFilter('')} style={!statusFilter ? styles.activeFilter : {}}>All</button>
        <button onClick={() => setStatusFilter('PENDING')} style={statusFilter === 'PENDING' ? styles.activeFilter : {}}>Pending</button>
        <button onClick={() => setStatusFilter('PROCESSING')} style={statusFilter === 'PROCESSING' ? styles.activeFilter : {}}>Processing</button>
        <button onClick={() => setStatusFilter('SHIPPED')} style={statusFilter === 'SHIPPED' ? styles.activeFilter : {}}>Shipped</button>
        <button onClick={() => setStatusFilter('DELIVERED')} style={statusFilter === 'DELIVERED' ? styles.activeFilter : {}}>Delivered</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customer_name}</td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
              <td>₹{order.total_amount}</td>
              <td><span style={{...styles.statusBadge, ...getStatusStyle(order.status)}}>{order.status}</span></td>
              <td>
                <Link href={`/dashboard/seller/orders/${order.id}`} style={styles.button}>
                  <Eye size={16} /> View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
    filterContainer: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    activeFilter: { backgroundColor: '#0d6efd', color: 'white', border: '1px solid #0d6efd' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' },
    statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' },
    button: { display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', padding: '8px 12px', borderRadius: '5px', backgroundColor: '#6c757d', color: 'white' },
    // Add some basic styling for the table itself
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '1rem',
    },
};