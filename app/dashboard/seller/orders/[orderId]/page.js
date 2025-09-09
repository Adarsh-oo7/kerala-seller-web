'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  Edit, 
  ArrowLeft, 
  Package,
  CreditCard,
  Wallet,
  Clock,
  Calendar,
  AlertCircle,
  X,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ORDERS_API_URL = `${API_BASE_URL}/user/orders/`;

// Enhanced Update Status Modal with better validation and UX
function UpdateStatusModal({ order, onClose, onUpdate }) {
    const [status, setStatus] = useState(order.status);
    const [trackingId, setTrackingId] = useState(order.tracking_id || '');
    const [shippingProvider, setShippingProvider] = useState(order.shipping_provider || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            setIsSaving(false);
            return;
        }

        const updateData = { status };

        if (status === 'SHIPPED') {
            if (!trackingId.trim() || !shippingProvider.trim()) {
                setError("Please provide both a shipping provider and a tracking ID for shipped orders.");
                setIsSaving(false);
                return;
            }
            updateData.tracking_id = trackingId.trim();
            updateData.shipping_provider = shippingProvider.trim();
        }

        try {
            console.log('Updating order status:', updateData);
            await axios.patch(`${ORDERS_API_URL}${order.id}/update_status/`, updateData, {
                headers: { Authorization: `Token ${token}` }
            });
            onUpdate(); // Refresh the order details on the main page
            onClose();
        } catch (error) {
            console.error('Status update failed:', error);
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.message ||
                               'Failed to update order status. Please try again.';
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div style={styles.modalOverlay} onClick={handleOverlayClick}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>Update Order #{order.id}</h2>
                    <button onClick={onClose} style={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div style={styles.errorMessage}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div style={styles.modalBody}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Order Status</label>
                        <select 
                            value={status} 
                            onChange={e => setStatus(e.target.value)} 
                            style={styles.input}
                            disabled={isSaving}
                        >
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
                                <label style={styles.label}>
                                    <Truck size={16} />
                                    Shipping Provider
                                </label>
                                <input 
                                    type="text" 
                                    value={shippingProvider} 
                                    onChange={e => setShippingProvider(e.target.value)} 
                                    style={styles.input}
                                    placeholder="e.g., DTDC, Professional Couriers, Blue Dart"
                                    disabled={isSaving}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    <Package size={16} />
                                    Tracking ID
                                </label>
                                <input 
                                    type="text" 
                                    value={trackingId} 
                                    onChange={e => setTrackingId(e.target.value)} 
                                    style={styles.input}
                                    placeholder="Enter tracking number"
                                    disabled={isSaving}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div style={styles.modalFooter}>
                    <button 
                        onClick={onClose} 
                        style={styles.buttonSecondary} 
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        style={styles.buttonPrimary} 
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <div style={styles.spinner}></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} />
                                Save Status
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Order Details Page Component
export default function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
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

  const fetchOrderDetails = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers || !orderId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching order details for ID:', orderId);
      const response = await axios.get(`${ORDERS_API_URL}${orderId}/`, { headers });
      
      console.log('Order details received:', response.data);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order details", error);
      if (error.response?.status === 401) {
        router.push('/login/seller');
      } else if (error.response?.status === 404) {
        setError('Order not found or you do not have permission to view it.');
      } else {
        setError('Failed to load order details. Please try again.');
      }
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, getAuthHeaders, router]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleGenerateBill = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    const billUrl = `${API_BASE_URL}/user/orders/${order.id}/generate-bill/`;
    
    try {
      const response = await axios.get(billUrl, { 
        headers, 
        responseType: 'blob' 
      });
      
      const file = new Blob([response.data], { type: 'text/html' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error('Bill generation failed:', error);
      const errorMessage = error.response?.data?.error || 'Could not generate the bill. Please try again.';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      'PENDING': { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#f59e0b' },
      'PROCESSING': { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#3b82f6' },
      'SHIPPED': { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#10b981' },
      'DELIVERED': { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#10b981' },
      'CANCELLED': { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#ef4444' },
    };
    const baseStyle = { 
      padding: '8px 16px', 
      borderRadius: '20px', 
      fontSize: '14px', 
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      border: '1px solid'
    };
    return { ...baseStyle, ...statusStyles[status] };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={14} />;
      case 'PROCESSING':
        return <Package size={14} />;
      case 'SHIPPED':
      case 'DELIVERED':
        return <Truck size={14} />;
      case 'CANCELLED':
        return <X size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchOrderDetails} style={styles.retryButton}>
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.errorContainer}>
        <Package size={48} />
        <h2>Order not found</h2>
        <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link href="/dashboard/seller/orders" style={styles.backToOrdersLink}>
          <ArrowLeft size={18} />
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Link href="/dashboard/seller/orders" style={styles.backLink}>
        <ArrowLeft size={18} /> 
        Back to All Orders
      </Link>

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <h1 style={styles.pageTitle}>Order #{order.id}</h1>
          <div style={styles.orderMeta}>
            <Calendar size={16} />
            <span>Placed on {formatDate(order.created_at)}</span>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button onClick={handleGenerateBill} style={styles.buttonSecondary}>
            <FileText size={16}/>
            View Bill
          </button>
          <button onClick={() => setIsModalOpen(true)} style={styles.buttonPrimary}>
            <Edit size={16}/>
            Update Status
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <User size={20}/>
            Customer Details
          </h3>
          <div style={styles.detailItem}>
            <strong>Name:</strong> 
            <span>{order.customer_name || 'Guest Customer'}</span>
          </div>
          {order.customer_phone && (
            <div style={styles.detailItem}>
              <strong>Phone:</strong>
              <span>+91 {order.customer_phone}</span>
            </div>
          )}
          {order.shipping_address && (
            <div style={styles.detailItem}>
              <strong><MapPin size={14}/> Address:</strong>
              <span>{order.shipping_address}</span>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <Truck size={20}/>
            Order Status
          </h3>
          <div style={styles.statusSection}>
            <div style={getStatusStyle(order.status)}>
              {getStatusIcon(order.status)}
              {order.status}
            </div>
          </div>
          {order.shipping_provider && (
            <div style={styles.detailItem}>
              <strong>Provider:</strong>
              <span>{order.shipping_provider}</span>
            </div>
          )}
          {order.tracking_id && (
            <div style={styles.detailItem}>
              <strong>Tracking ID:</strong>
              <span style={styles.trackingId}>{order.tracking_id}</span>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            {order.payment_method === 'ONLINE' ? <CreditCard size={20}/> : <Wallet size={20}/>}
            Payment Details
          </h3>
          <div style={styles.detailItem}>
            <strong>Method:</strong>
            <span>{order.payment_method === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}</span>
          </div>
          {order.payment_status && (
            <div style={styles.detailItem}>
              <strong>Status:</strong>
              <span style={{
                ...styles.paymentStatus,
                backgroundColor: order.payment_status === 'Paid' ? '#d1fae5' : '#dbeafe',
                color: order.payment_status === 'Paid' ? '#065f46' : '#1e40af'
              }}>
                {order.payment_status}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={styles.itemsCard}>
        <h3 style={styles.cardTitle}>
          <Package size={20}/>
          Items in this Order ({order.items?.length || 0})
        </h3>
        {order.items && order.items.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Unit Price</th>
                  <th style={styles.th}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.id || index} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.productInfo}>
                        <strong>{item.product?.name || item.product_name || 'Product'}</strong>
                        {item.product?.model_name && (
                          <div style={styles.productModel}>
                            Model: {item.product.model_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.quantity}>{item.quantity}</span>
                    </td>
                    <td style={styles.td}>₹{parseFloat(item.price || 0).toFixed(2)}</td>
                    <td style={styles.td}>
                      <strong>₹{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={styles.totalRow}>
                  <td colSpan="3" style={styles.totalLabel}>Grand Total:</td>
                  <td style={styles.totalAmount}>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div style={styles.emptyItems}>
            <Package size={32} />
            <p>No items found for this order</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <UpdateStatusModal 
          order={order} 
          onClose={() => setIsModalOpen(false)} 
          onUpdate={fetchOrderDetails}
        />
      )}

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
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
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
  
  backToOrdersLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    color: '#3b82f6',
    fontWeight: '500',
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff'
  },
  
  backLink: { 
    textDecoration: 'none', 
    color: '#3b82f6', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginBottom: '24px', 
    fontWeight: '500',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#eff6ff',
    width: 'fit-content'
  },
  
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#991b1b',
    marginBottom: '20px'
  },
  
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '32px', 
    paddingBottom: '20px', 
    borderBottom: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '16px'
  },
  
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  
  orderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
    fontSize: '14px'
  },
  
  headerActions: { 
    display: 'flex', 
    gap: '12px',
    flexWrap: 'wrap'
  },
  
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
    gap: '24px', 
    marginBottom: '32px'
  },
  
  card: { 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    padding: '24px', 
    backgroundColor: '#fff', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  itemsCard: {
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    padding: '24px', 
    backgroundColor: '#fff', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  cardTitle: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    borderBottom: '1px solid #e5e7eb', 
    paddingBottom: '16px', 
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 20px 0'
  },
  
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '14px'
  },
  
  statusSection: {
    marginBottom: '16px'
  },
  
  trackingId: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px'
  },
  
  paymentStatus: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  
  tableContainer: {
    overflowX: 'auto'
  },
  
  table: { 
    width: '100%', 
    borderCollapse: 'collapse'
  },
  
  tableHeader: {
    backgroundColor: '#f8fafc'
  },
  
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    borderBottom: '1px solid #e5e7eb'
  },
  
  tableRow: {
    borderBottom: '1px solid #f3f4f6'
  },
  
  td: {
    padding: '16px 12px',
    fontSize: '14px',
    verticalAlign: 'middle'
  },
  
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  
  productModel: {
    fontSize: '12px',
    color: '#6b7280'
  },
  
  quantity: {
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600'
  },
  
  totalRow: {
    backgroundColor: '#f8fafc',
    borderTop: '2px solid #e5e7eb'
  },
  
  totalLabel: {
    textAlign: 'right',
    fontWeight: '600',
    fontSize: '16px',
    padding: '16px 12px'
  },
  
  totalAmount: {
    fontWeight: '700',
    fontSize: '18px',
    color: '#059669',
    padding: '16px 12px'
  },
  
  emptyItems: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '16px',
    color: '#6b7280'
  },
  
  // Modal Styles
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000,
    padding: '20px'
  },
  
  modalContent: { 
    background: 'white', 
    borderRadius: '12px', 
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 0 24px',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px'
  },
  
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '4px'
  },
  
  modalBody: {
    padding: '0 24px'
  },
  
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#991b1b',
    margin: '0 24px 20px 24px',
    fontSize: '14px'
  },
  
  formGroup: { 
    marginBottom: '20px'
  },
  
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  
  input: { 
    width: '100%', 
    padding: '12px 16px', 
    boxSizing: 'border-box', 
    border: '1px solid #d1d5db', 
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid #e5e7eb',
    marginTop: '24px'
  },
  
  buttonPrimary: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 20px', 
    backgroundColor: '#3b82f6', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  
  buttonSecondary: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 20px', 
    backgroundColor: '#6b7280', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
};
