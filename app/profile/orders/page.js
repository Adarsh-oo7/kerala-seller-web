'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ Corrected API URL
const ORDERS_API_URL = 'http://localhost:8000/user/orders/history/';

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const headers = getAuthHeaders();
    if (!headers) return;

    axios.get(ORDERS_API_URL, { headers })
      .then(res => setOrders(res.data.results || res.data))
      .catch(err => console.error("Failed to fetch order history", err))
      .finally(() => setIsLoading(false));
  }, [getAuthHeaders]);

  if (isLoading) return <p>Loading your orders...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Orders</h1>
      {orders.length === 0 ? (
        <div style={styles.card}>
          <p>You haven't placed any orders yet.</p>
          <Link href="/shop" style={styles.button}>Start Shopping</Link>
        </div>
      ) : (
        <div style={styles.orderList}>
          {orders.map(order => (
            <div key={order.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={{margin: 0}}>Order #{order.id}</h3>
                  <span style={{color: '#6c757d'}}>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <strong style={{fontSize: '1.2rem'}}>₹{order.total_amount}</strong>
              </div>
              <div>
                <p><strong>Status:</strong> {order.status}</p>
                {order.tracking_id && <p><strong>Tracking ID:</strong> {order.tracking_id} ({order.shipping_provider})</p>}
                <ul>
                  {order.items.map(item => (
                    <li key={item.id}>{item.quantity} x {item.product?.name || 'Item'}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
    container: { maxWidth: '800px', margin: '40px auto', padding: '20px' },
    title: { textAlign: 'center', marginBottom: '2rem' },
    orderList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    button: { display: 'inline-block', marginTop: '1rem', padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', textDecoration: 'none', borderRadius: '5px' },
};