'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Truck, User, Phone, MapPin, Edit, ArrowLeft } from 'lucide-react';

const ORDERS_API_URL = 'http://localhost:8000/user/orders/';

// --- Sub-component for the Update Status Modal ---
function UpdateStatusModal({ order, onClose, onUpdate }) {
    const [status, setStatus] = useState(order.status);
    const [trackingId, setTrackingId] = useState(order.tracking_id || '');
    const [shippingProvider, setShippingProvider] = useState(order.shipping_provider || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('accessToken');
        const updateData = { status };

        if (status === 'SHIPPED') {
            if (!trackingId || !shippingProvider) {
                alert("Please provide both a shipping provider and a tracking ID.");
                setIsSaving(false);
                return;
            }
            updateData.tracking_id = trackingId;
            updateData.shipping_provider = shippingProvider;
        }

        try {
            await axios.patch(`${ORDERS_API_URL}${order.id}/update_status/`, updateData, {
                headers: { Authorization: `Token ${token}` }
            });
            onUpdate(); // Refresh the order details on the main page
            onClose();
        } catch (error) {
            alert("Failed to update status. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <h2>Update Order #{order.id}</h2>
                <div style={styles.formGroup}>
                    <label>Order Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} style={styles.input}>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                {status === 'SHIPPED' && (
                    <>
                        <div style={styles.formGroup}>
                            <label>Shipping Provider (e.g., DTDC, Professional Couriers)</label>
                            <input type="text" value={shippingProvider} onChange={e => setShippingProvider(e.target.value)} style={styles.input} />
                        </div>
                        <div style={styles.formGroup}>
                            <label>Tracking ID</label>
                            <input type="text" value={trackingId} onChange={e => setTrackingId(e.target.value)} style={styles.input} />
                        </div>
                    </>
                )}
                <div style={styles.buttonContainer}>
                    <button onClick={onClose} style={styles.buttonSecondary} disabled={isSaving}>Cancel</button>
                    <button onClick={handleSave} style={styles.buttonPrimary} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Status'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Main Order Details Page Component ---
export default function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { orderId } = useParams();
  const router = useRouter();
  
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { 'Authorization': `Token ${token}` };
  }, [router]);

  const fetchOrderDetails = useCallback(() => {
    const headers = getAuthHeaders();
    if (!headers || !orderId) return;
    setIsLoading(true);
    axios.get(`${ORDERS_API_URL}${orderId}/`, { headers })
      .then(res => setOrder(res.data))
      .catch(err => {
          console.error("Failed to fetch order details", err);
          setOrder(null);
      })
      .finally(() => setIsLoading(false));
  }, [orderId, getAuthHeaders]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleGenerateBill = () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    const billUrl = `http://localhost:8000/user/orders/${order.id}/generate-bill/`;
    
    axios.get(billUrl, { headers, responseType: 'blob' })
        .then(response => {
            const file = new Blob([response.data], { type: 'text/html' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        })
        .catch(error => {
            console.error('Bill generation failed:', error);
            alert('Could not generate the bill.');
        });
  };

  if (isLoading) return <p style={styles.message}>Loading order details...</p>;
  if (!order) return <p style={styles.message}>Order not found or you do not have permission to view it.</p>;
  
  const getStatusStyle = (status) => {
      const baseStyle = { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' };
      const statusStyles = {
          PENDING: { backgroundColor: '#fffbeb', color: '#b45309' },
          PROCESSING: { backgroundColor: '#eef2ff', color: '#4338ca' },
          SHIPPED: { backgroundColor: '#dcfce7', color: '#166534' },
          DELIVERED: { backgroundColor: '#dcfce7', color: '#166534' },
          CANCELLED: { backgroundColor: '#fee2e2', color: '#991b1b' },
      };
      return { ...baseStyle, ...statusStyles[status] };
  };

  return (
    <div>
      <Link href="/dashboard/seller/orders" style={styles.backLink}>
        <ArrowLeft size={18} /> Back to All Orders
      </Link>
      <div style={styles.header}>
        <h1>Order #{order.id}</h1>
        <div style={styles.headerActions}>
            <button onClick={handleGenerateBill} style={styles.buttonSecondary}><FileText size={16}/> View Bill</button>
            <button onClick={() => setIsModalOpen(true)} style={styles.buttonPrimary}><Edit size={16}/> Update Status</button>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
            <h3 style={styles.cardTitle}><User size={18}/> Customer Details</h3>
            <p><strong>Name:</strong> {order.customer_name}</p>
            <p><strong>Phone:</strong> {order.customer_phone}</p>
            <p><strong><MapPin size={14}/> Address:</strong> {order.shipping_address}</p>
        </div>
        <div style={styles.card}>
            <h3 style={styles.cardTitle}><Truck size={18}/> Order Status</h3>
            <p><strong>Status:</strong> <span style={getStatusStyle(order.status)}>{order.status}</span></p>
            {order.shipping_provider && <p><strong>Provider:</strong> {order.shipping_provider}</p>}
            {order.tracking_id && <p><strong>Tracking ID:</strong> {order.tracking_id}</p>}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Items in this Order ({order.items.length})</h3>
        <table style={styles.table}>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {order.items.map(item => (
                    <tr key={item.id}>
                        <td>{item.product?.name || 'Deleted Product'}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                        <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan="3" style={{textAlign: 'right', fontWeight: 'bold'}}>Grand Total:</td>
                    <td style={{fontWeight: 'bold'}}>₹{order.total_amount}</td>
                </tr>
            </tfoot>
        </table>
      </div>

      {isModalOpen && (
        <UpdateStatusModal 
          order={order} 
          onClose={() => setIsModalOpen(false)} 
          onUpdate={fetchOrderDetails}
        />
      )}
    </div>
  );
}

const styles = {
    message: { textAlign: 'center', marginTop: '50px', fontSize: '1.1rem' },
    backLink: { textDecoration: 'none', color: '#0d6efd', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1rem', fontWeight: '500' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' },
    headerActions: { display: 'flex', gap: '10px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
    card: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    cardTitle: { display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' },
    statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%' },
    formGroup: { marginBottom: '1rem' },
    input: { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' },
    buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' },
    buttonPrimary: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    buttonSecondary: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};
