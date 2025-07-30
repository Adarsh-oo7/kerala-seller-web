'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/user/orders/';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    setIsLoading(true);
    axios.get(API_URL, { headers: { Authorization: `Token ${token}` } })
      .then(response => setOrders(response.data))
      .catch(error => console.error('Failed to fetch orders:', error))
      .finally(() => setIsLoading(false));
  };

  const handleStatusChange = (orderId, newStatus) => {
    const token = localStorage.getItem('accessToken');
    axios.patch(`${API_URL}${orderId}/update_status/`, { status: newStatus }, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(response => {
      // Update the order in the local state to reflect the change immediately
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? response.data : order
      ));
    })
    .catch(error => alert('Failed to update status.'));
  };

  if (isLoading) return <p>Loading orders...</p>;

  return (
    <div>
      <h1>Manage Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div style={styles.orderList}>
          {orders.map(order => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.cardHeader}>
                <h3>Order #{order.id}</h3>
                <span style={styles.date}>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div style={styles.customerInfo}>
                <p><strong>Customer:</strong> {order.customer_name}</p>
                <p><strong>Phone:</strong> {order.customer_phone}</p>
                <p><strong>Address:</strong> {order.shipping_address}</p>
              </div>
              <div>
                <h4>Items</h4>
                <ul>
                  {order.items.map(item => (
                    <li key={item.id}>{item.quantity} x {item.product.name} @ ₹{item.price}</li>
                  ))}
                </ul>
              </div>
              <div style={styles.cardFooter}>
                <strong>Total: ₹{order.total_amount}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Status:</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={styles.statusSelect}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
    orderList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    orderCard: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' },
    date: { fontSize: '0.9rem', color: '#6c757d' },
    customerInfo: { marginBottom: '15px' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' },
    statusSelect: { padding: '5px 10px', borderRadius: '5px', border: '1px solid #ccc' },
};