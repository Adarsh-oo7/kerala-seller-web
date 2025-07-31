'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/user/orders/';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState({}); // ✅ State for tracking inputs

  const fetchOrders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    setIsLoading(true);
    axios.get(API_URL, { headers: { Authorization: `Token ${token}` } })
      .then(response => setOrders(response.data))
      .catch(error => console.error('Failed to fetch orders:', error))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ✅ Updated to handle tracking info
  const handleStatusChange = (orderId, newStatus) => {
    const token = localStorage.getItem('accessToken');
    let data = { status: newStatus };

    if (newStatus === 'SHIPPED' && trackingInfo[orderId]) {
      data = { ...data, ...trackingInfo[orderId] };
    }
    
    axios.patch(`${API_URL}${orderId}/update_status/`, data, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(response => {
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? response.data : order
      ));
    })
    .catch(error => {
      alert('Failed to update order status.');
    });
  };

  // ✅ New handler for tracking input fields
  const handleTrackingInfoChange = (orderId, field, value) => {
    setTrackingInfo(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value }
    }));
  };

  // ✅ New handler for generating the bill
  const handleGenerateBill = (orderId) => {
    const token = localStorage.getItem('accessToken');
    const billUrl = `http://localhost:8000/user/orders/${orderId}/generate-bill/`;

    axios.get(billUrl, {
      headers: { Authorization: `Token ${token}` },
      responseType: 'blob', // Important: tells axios to expect file data
    })
    .then(response => {
      // Create a URL for the blob data
      const file = new Blob([response.data], { type: 'text/html' });
      const fileURL = URL.createObjectURL(file);
      // Open that URL in a new tab
      window.open(fileURL, '_blank');
    })
    .catch(error => {
      console.error('Failed to generate bill:', error);
      alert('Could not generate the bill.');
    });
  };
  
  // ✅ Helper for WhatsApp link
  const formatPhoneNumberForWhatsApp = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned;
  };

  if (isLoading) return <p>Loading orders...</p>;

  return (
    <div>
      <h1>Manage Orders</h1>
      <p>View and update the status of incoming customer orders.</p>
      {orders.length === 0 ? (
        <div style={styles.card}><p>You have no orders yet.</p></div>
      ) : (
        <div style={styles.orderList}>
          {orders.map(order => (
            <div key={order.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div><h3 style={{margin: 0}}>Order #{order.id}</h3><span style={styles.date}>{new Date(order.created_at).toLocaleString('en-IN')}</span></div>
                <strong style={styles.totalAmount}>₹{order.total_amount}</strong>
              </div>
              <div style={styles.customerInfo}>
                <p><strong>Customer:</strong> {order.customer_name}</p>
                <p><strong>Phone:</strong> {order.customer_phone}</p>
                <p><strong>Address:</strong> {order.shipping_address}</p>
                <a href={`https://wa.me/${formatPhoneNumberForWhatsApp(order.customer_phone)}`} target="_blank" rel="noopener noreferrer" style={styles.whatsappButton}>Contact on WhatsApp</a>
              </div>
              <div>
                <h4>Items Ordered</h4>
                <ul style={styles.itemList}>
                  {order.items.map(item => (<li key={item.id}>{item.quantity} x {item.product ? item.product.name : 'Deleted Product'} @ ₹{item.price}</li>))}
                </ul>
              </div>
              
              {/* ✅ Tracking Info Section */}
              {(order.status === 'SHIPPED' || order.status === 'PROCESSING') && (
                <div style={styles.trackingSection}>
                  <h4>Tracking Information</h4>
                  <input type="text" placeholder="Shipping Provider" defaultValue={order.shipping_provider || ''} onChange={(e) => handleTrackingInfoChange(order.id, 'shipping_provider', e.target.value)} style={styles.input}/>
                  <input type="text" placeholder="Tracking ID" defaultValue={order.tracking_id || ''} onChange={(e) => handleTrackingInfoChange(order.id, 'tracking_id', e.target.value)} style={styles.input}/>
                </div>
              )}

              <div style={styles.cardFooter}>
                <button onClick={() => handleGenerateBill(order.id)} style={styles.buttonSecondary}>Generate Bill</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Status:</span>
                  <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} style={styles.statusSelect}>
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
    orderList: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '1.5rem' },
    card: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' },
    date: { fontSize: '0.9rem', color: '#6c757d' },
    totalAmount: { fontSize: '1.2rem', fontWeight: 'bold' },
    customerInfo: { marginBottom: '15px', lineHeight: '1.6' },
    whatsappButton: { display: 'inline-block', marginTop: '10px', padding: '8px 15px', backgroundColor: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '5px', fontSize: '0.9rem'},
    itemList: { listStyle: 'none', padding: 0, margin: '10px 0' },
    trackingSection: { marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' },
    statusSelect: { padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f8f9fa' },
    buttonSecondary: { padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};