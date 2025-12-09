'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../../../../styles/DashboardOrders.css'

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
  RefreshCw,
  Download,
  MessageSquare,
  Star,
  Copy,
  Eye,
  Timer
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'process.env.NEXT_PUBLIC_API_BASE_URL';
const ORDERS_API_URL = `${API_BASE_URL}/user/orders/`;

// ✅ Order Timeline Component
function OrderTimeline({ order }) {
  const timelineSteps = [
    {
      key: 'PENDING',
      label: 'Order Placed',
      icon: <CheckCircle size={16} />,
      completed: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
    },
    {
      key: 'PROCESSING',
      label: 'Processing',
      icon: <Package size={16} />,
      completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
    },
    {
      key: 'SHIPPED',
      label: 'Shipped',
      icon: <Truck size={16} />,
      completed: ['SHIPPED', 'DELIVERED'].includes(order.status)
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      icon: <Star size={16} />,
      completed: order.status === 'DELIVERED'
    }
  ];

  if (order.status === 'CANCELLED') {
    return (
      <div style={styles.timelineContainer}>
        <div style={styles.cancelledTimeline}>
          <AlertCircle size={20} color="#ef4444" />
          <span>Order was cancelled on {new Date(order.updated_at || order.created_at).toLocaleDateString()}</span>
          {order.cancel_reason && (
            <div style={styles.cancelReasonInline}>
              <strong>Reason:</strong> {order.cancel_reason}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-container" style={styles.timelineContainer}>
      <div className="timeline" style={styles.timeline}>
        {timelineSteps.map((step, index) => (
          <div className="timeline-step" key={step.key} style={styles.timelineStep}>
            <div className="icon-and-connector" style={styles.iconAndConnector}>
              {/* Left connector */}
              {index > 0 && (
                <div
                  className={`connector ${timelineSteps[index - 1].completed ? 'completed' : ''}`}
                  style={{
                    ...styles.connector,
                    left: 0,
                    width: '50%',
                    backgroundColor: timelineSteps[index - 1].completed ? '#10b981' : '#e5e7eb'
                  }}
                />
              )}

              {/* Icon */}
              <div
                className={`timeline-icon ${step.completed ? 'completed' : ''}`}
                style={{
                  ...styles.timelineIcon,
                  backgroundColor: step.completed ? '#10b981' : '#e5e7eb',
                  color: step.completed ? 'white' : '#6b7280',
                  zIndex: 1,
                }}
              >
                {step.icon}
              </div>

              {/* Right connector */}
              {index < timelineSteps.length - 1 && (
                <div
                  className={`connector ${step.completed ? 'completed' : ''}`}
                  style={{
                    ...styles.connector,
                    right: 0,
                    width: '50%',
                    backgroundColor: step.completed ? '#10b981' : '#e5e7eb'
                  }}
                />
              )}
            </div>

            <div className="timeline-content" style={styles.timelineContent}>
              <div
                className={`timeline-label ${step.completed ? 'active' : ''}`}
                style={{
                  ...styles.timelineLabel,
                  color: step.completed ? '#1f2937' : '#6b7280',
                  fontWeight: step.completed ? '600' : '400'
                }}
              >
                {step.label}
              </div>
              {step.key === order.status && (
                <div className="current-step" style={styles.currentStep}>Current Status</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ✅ FIXED: Enhanced Update Status Modal with cancellation prevention
function UpdateStatusModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [trackingId, setTrackingId] = useState(order.tracking_id || '');
  const [shippingProvider, setShippingProvider] = useState(order.shipping_provider || '');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // ✅ NEW: Check if order can be modified
  const canModifyOrder = order.status !== 'CANCELLED' && order.status !== 'DELIVERED';
  const isOrderCancelled = order.status === 'CANCELLED';
  const isOrderDelivered = order.status === 'DELIVERED';

  const handleSave = async () => {
    // ✅ FIXED: Prevent saving if order is cancelled or delivered
    if (isOrderCancelled) {
      setError('Cannot update status of a cancelled order.');
      return;
    }

    if (isOrderDelivered) {
      setError('Cannot update status of a delivered order.');
      return;
    }

    setIsSaving(true);
    setError('');

    const token = localStorage.getItem('accessToken') || localStorage.getItem('sellerAccessToken');
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

    if (notes.trim()) {
      updateData.notes = notes.trim();
    }

    try {
      console.log('Updating order status:', updateData);
      await axios.patch(`${ORDERS_API_URL}${order.id}/update_status/`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Status update failed:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login/seller';
        }, 2000);
      } else {
        const errorMessage = error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to update order status. Please try again.';
        setError(errorMessage);
      }
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
          <h2 style={styles.modalTitle}>
            {isOrderCancelled ? 'Order Details' : isOrderDelivered ? 'Order Details' : 'Update Order'} #{order.id}
          </h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* ✅ NEW: Show warning for cancelled orders */}
        {isOrderCancelled && (
          <div style={styles.cancelledWarning}>
            <AlertCircle size={16} />
            <div>
              <span>This order has been cancelled and cannot be modified.</span>
              {order.cancel_reason && (
                <div style={styles.cancelReason}>
                  <strong>Cancellation Reason:</strong> {order.cancel_reason}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ NEW: Show warning for delivered orders */}
        {isOrderDelivered && (
          <div style={styles.deliveredWarning}>
            <CheckCircle size={16} />
            <span>This order has been delivered and cannot be modified further.</span>
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={styles.modalBody}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Clock size={16} />
              Order Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{
                ...styles.input,
                backgroundColor: !canModifyOrder ? '#f3f4f6' : '#FDFFF0',
                cursor: !canModifyOrder ? 'not-allowed' : 'pointer'
              }}
              disabled={isSaving || !canModifyOrder}
            >
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            {!canModifyOrder && (
              <small style={styles.disabledNote}>
                Status cannot be changed for {isOrderCancelled ? 'cancelled' : 'delivered'} orders
              </small>
            )}
          </div>

          {status === 'SHIPPED' && canModifyOrder && (
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

          {/* ✅ Show existing shipping info for cancelled/delivered orders */}
          {!canModifyOrder && order.shipping_provider && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Shipping Information</label>
              <div style={styles.readOnlyInfo}>
                <div><strong>Provider:</strong> {order.shipping_provider}</div>
                {order.tracking_id && (
                  <div><strong>Tracking ID:</strong> {order.tracking_id}</div>
                )}
              </div>
            </div>
          )}

          {/* Notes field - always show for reference */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <MessageSquare size={16} />
              {canModifyOrder ? 'Additional Notes (Optional)' : 'Order Notes'}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                ...styles.input,
                minHeight: '80px',
                resize: 'vertical',
                backgroundColor: !canModifyOrder ? '#f3f4f6' : '#FDFFF0'
              }}
              placeholder={canModifyOrder ? "Add any additional information or instructions..." : "No additional notes available"}
              disabled={isSaving || !canModifyOrder}
              maxLength={500}
              readOnly={!canModifyOrder}
            />
            {canModifyOrder && (
              <small style={styles.charCount}>{notes.length}/500 characters</small>
            )}
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button
            onClick={onClose}
            style={styles.buttoncancel}
            disabled={isSaving}
          >
            {canModifyOrder ? 'Cancel' : 'Close'}
          </button>

          {/* ✅ Only show save button for modifiable orders */}
          {canModifyOrder && (
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
          )}
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
  const [copied, setCopied] = useState(false);
  const { orderId } = useParams();
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('sellerAccessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
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
        setError('Session expired. Please log in again.');
        setTimeout(() => router.push('/login/seller'), 2000);
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

  const copyTrackingId = async (trackingId) => {
    try {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy tracking ID:', err);
    }
  };

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
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => router.push('/login/seller'), 2000);
      } else {
        const errorMessage = error.response?.data?.error || 'Could not generate the bill. Please try again.';
        setError(errorMessage);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleDownloadBill = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    const billUrl = `${API_BASE_URL}/user/orders/${order.id}/download-bill/`;

    try {
      const response = await axios.get(billUrl, {
        headers,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill_${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Bill download failed:', error);
      setError('Could not download the bill. Please try again.');
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
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '13px',
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
    <div className='dashboardorderidpagecontainer' style={styles.pageContainer}>
      {/* <Link href="/dashboard/seller/orders" style={styles.backLink}>
        <ArrowLeft size={18} /> 
        Back to All Orders
      </Link> */}

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
<div className='dashboardorderidpageheader' style={styles.header}>
  <div style={styles.headerInfo}>
    <h1 className='dashboardordertitle' style={styles.pageTitle}>Order #{order.id}</h1>
{order.status === 'CANCELLED' && (
  <div style={{
    marginTop: '12px',
    background: '#ffefef',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    padding: '10px 16px',
    color: '#b91c1c',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
    <AlertCircle size={18} color='#ef4444' />
    <span>
      <strong>Cancelled:</strong> {order.cancelreason || 'No reason provided'}
    </span>
  </div>
)}


    <div className='dashboardorderidsubtitle' style={styles.orderMeta}>
      <Calendar size={16} />
      <span>Placed on {formatDate(order.created_at)}</span>
    </div>
  </div>
  <div style={styles.headerActions}>
    {/* Only show Download/View Bill if not CANCELLED */}
    {order.status !== 'CANCELLED' && (
      <>
        <button className='dashboardorderexportbtn' onClick={handleDownloadBill} style={styles.buttonTertiary}>
          <Download className='dashboardordernotificationbellicon' size={16} />
          Download PDF
        </button>
        <button className='dashboardorderexportbtn' onClick={handleGenerateBill} style={styles.buttonSecondary}>
          <FileText className='dashboardordernotificationbellicon' size={16} />
          View Bill
        </button>
      </>
    )}

    {/* Show Update Status for ongoing orders only */}
    {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
      <button className='dashboardorderexportbtn' onClick={() => setIsModalOpen(true)} style={styles.buttonPrimary}>
        <Edit className='dashboardordernotificationbellicon' size={16} />
        Update Status
      </button>
    )}

    {/* Show View Details for delivered/cancelled orders */}
    {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
      <button className='dashboardorderexportbtn' disabled style={styles.buttonInfo}>
        <Eye className='dashboardordernotificationbellicon' size={16} />
        View Details
      </button>
    )}
  </div>
</div>

      {/* ✅ Order Timeline */}
      <div style={styles.timelineCard}>
        <h3 style={styles.cardTitle1} className="order-progress-title">
          Order Progress
          <div className="truck-wrapper">
            <Truck size={20} className="truck-icon" />
            <span className="smoke"></span>
            <span className="smoke smoke2"></span>
          </div>
        </h3>
        <OrderTimeline order={order} />
      </div>

      <div className='dashboardorderdetailscardgrid' style={styles.grid}>
        <div style={styles.card}>
          <h3 className='dashboardorderdetailscardtitle' style={styles.cardTitle}>
            <User size={20} />
            Customer Details
          </h3>
          <div className='dashboardorderdetailscarddetailitem' style={styles.detailItem}>
            <strong>Name:</strong>
            <span>{order.customer_name || 'Guest Customer'}</span>
          </div>
          {order.customer_phone && (
            <div className='dashboardorderdetailscarddetailitem' style={styles.detailItem}>
              <strong>Phone:</strong>
              <span>+91 {order.customer_phone}</span>
            </div>
          )}
          {order.shipping_address && (
            <div className='dashboardorderdetailscarddetailitem' style={styles.detailItem}>
              <strong> Address:</strong>
              <span>{order.shipping_address}</span>
            </div>
          )}
          <div className='dashboardorderdetailscarddetailitem' style={styles.detailItem}>
            <strong>Order Type:</strong>
            <span style={{
              ...styles.orderType,
              // backgroundColor: order.order_type === 'LOCAL' ? '#fef3c7' : '#dbeafe',
              color: order.order_type === 'LOCAL' ? '#92400e' : '#1e40af'
            }}>
              {order.order_type === 'LOCAL' ? '🏪 Local Bill' : '🛒 Online Order'}
            </span>
          </div>
        </div>

        <div style={styles.card}>
          <h3 className='dashboardorderdetailscardtitle' style={styles.cardTitle}>
            <Truck size={20} />
            Order Status
          </h3>
          <div style={styles.statusSection}>
            <div className='dashboardorderdetailsstatusstyle' style={getStatusStyle(order.status)}>
              {getStatusIcon(order.status)}
              {order.status}
            </div>
          </div>
          {order.shipping_provider && (
            <div className='dashboardorderdetailscarddetailitem' style={styles.detailItem}>
              <strong>Provider:</strong>
              <span>{order.shipping_provider}</span>
            </div>
          )}
          {order.tracking_id && (
            <div className='dashboardorderdetailscarddetailitem' style={styles.detailItem}>
              <strong>Tracking ID:</strong>
              <div style={styles.trackingIdContainer}>
                <span style={styles.trackingId}>{order.tracking_id}</span>
                <button
                  onClick={() => copyTrackingId(order.tracking_id)}
                  style={styles.copyButton}
                  title="Copy tracking ID"
                >
                  <Copy size={14} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h3 className='dashboardorderdetailscardtitle' style={styles.cardTitle}>
            {order.payment_method === 'ONLINE' ? <CreditCard size={20} /> : <Wallet size={20} />}
            Payment Details
          </h3>
          <div className='dashboardorderdetailscarddetailitem' style={styles.detailItem}>
            <strong>Method:</strong>
            <span>{order.payment_method === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}</span>
          </div>
          {order.payment_status && (
            <div className='dashboardorderdetailscarddetailitem' style={styles.detailItem}>
              <strong>Status:</strong>
              <span style={{
                ...styles.paymentStatus,
                backgroundColor: order.payment_status === 'Paid' || order.payment_status === 'PAID' ? '#d1fae5' : '#dbeafe',
                color: order.payment_status === 'Paid' || order.payment_status === 'PAID' ? '#065f46' : '#1e40af'
              }}>
                {order.payment_status}
              </span>
            </div>
          )}
          <div className='dashboardorderdetailscarddetailitem' style={styles.detailItem}>
            <strong>Total Amount:</strong>
            <span style={styles.totalAmountHighlight}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={styles.itemsCard}>
        <h3 className="dashboardorderdetailscardtitle" style={styles.cardTitle}>
          <Package size={20} />
          Items in this Order ({order.items?.length || 0})
        </h3>

        {/* ✅ Desktop Table View */}
        <div className="desktop-view" style={styles.desktopView}>
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
                            <div style={styles.productModel}>Model: {item.product.model_name}</div>
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

        {/* ✅ Mobile Card View */}
        <div className="mobile-view" style={styles.mobileView}>
          {order.items && order.items.length > 0 ? (
            <>
              {order.items.map((item, index) => (
                <div key={item.id || index} style={styles.mobileCard}>
                  <div style={styles.mobileHeader}>
                    <strong>{item.product?.name || item.product_name || 'Product'}</strong>
                    {item.product?.model_name && (
                      <div style={styles.mobileModel}>Model: {item.product.model_name}</div>
                    )}
                  </div>
                  <div style={styles.mobileDetails}>
                    <div style={styles.mobileRow}>
                      <span style={styles.mobileLabel}>Quantity:</span>
                      <span style={styles.mobileValue}>{item.quantity}</span>
                    </div>
                    <div style={styles.mobileRow}>
                      <span style={styles.mobileLabel}>Unit Price:</span>
                      <span style={styles.mobileValue}>₹{parseFloat(item.price || 0).toFixed(2)}</span>
                    </div>
                    <div style={styles.mobileRowStrong}>
                      <span>Subtotal:</span>
                      <span>₹{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div style={styles.mobileTotal}>
                <span style={styles.mobileTotalLabel}>Grand Total:</span>
                <span style={styles.mobileTotalAmount}>
                  ₹{parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <div style={styles.emptyItems}>
              <Package size={32} />
              <p>No items found for this order</p>
            </div>
          )}
        </div>
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
    border: '2px solid rgba(59, 130, 246, 0.3)',
    borderTop: '2px solid #3b82f6',
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

  // Timeline styles
  timelineCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    backgroundColor: '#FDFFF0',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
    marginBottom: '32px'
  },

  timelineContainer: {
    marginTop: '16px',
  },

  timeline: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },

  timelineStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },

  iconAndConnector: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  connector: {
    position: 'absolute',
    top: '50%',
    height: '2px',
    backgroundColor: '#e5e7eb',
    transform: 'translateY(-50%)',
    zIndex: 0,
  },

  timelineIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    transition: 'all 0.3s ease',
  },

  timelineContent: {
    textAlign: 'center',
    marginTop: '8px', // ✅ push label below icon
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  timelineLabel: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '4px',
  },

  currentStep: {
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '600',
  },

  cancelledTimeline: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    color: '#991b1b'
  },

  // ✅ NEW: Cancel reason in timeline
  cancelReasonInline: {
    fontSize: '13px',
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '4px',
    marginTop: '8px'
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
    backgroundColor: '#FDFFF0',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
  },

  itemsCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    backgroundColor: '#FDFFF0',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
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

  cardTitle1: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '16px',
    marginBottom: '20px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#24964c',
    margin: '0 0 20px 0'
  },

  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#6b7280'
  },

  orderType: {
    // padding: '4px 8px',
    // borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },

  totalAmountHighlight: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#059669'
  },

  statusSection: {
    marginBottom: '16px'
  },

  trackingIdContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  trackingId: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px'
  },

  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500'
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
    backgroundColor: 'rgb(23, 94, 84)'
  },

  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
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
    backgroundColor: '#FDFFF0',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600'
  },

  totalRow: {
    backgroundColor: '#FDFFF0',
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
    background: '#FDFFF0',
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
    color: 'rgb(23, 94, 84',
    margin: 0
  },

  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'rgb(23, 94, 84',
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

  // ✅ NEW: Warning styles for cancelled orders
  cancelledWarning: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#991b1b',
    margin: '0 24px 20px 24px',
    fontSize: '14px'
  },

  cancelReason: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '4px',
    fontSize: '13px'
  },

  // ✅ NEW: Warning for delivered orders
  deliveredWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #10b981',
    borderRadius: '8px',
    color: '#065f46',
    margin: '0 24px 20px 24px',
    fontSize: '14px'
  },

  // ✅ NEW: Disabled field note
  disabledNote: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    fontStyle: 'italic'
  },

  // ✅ NEW: Read-only info display
  readOnlyInfo: {
    padding: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
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
    transition: 'border-color 0.2s',
    backgroundColor: '#FDFFF0'
  },

  charCount: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    textAlign: 'right'
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
    backgroundColor: '#80706bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },

    buttoncancel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#ed3939ff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },

  buttonTertiary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },

  // ✅ NEW: Info button style
  buttonInfo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  mobileContainer: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  mobileCard: {
    borderBottom: '1px solid #f1f1f1',
    paddingBottom: '10px',
    marginBottom: '10px',
  },
  mobileHeader: {
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 600,
  },
  mobileModel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
  mobileDetails: { fontSize: '13px' },
  mobileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
    color: '#374151',
  },
  mobileRowStrong: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '6px',
    fontWeight: 600,
  },
  mobileLabel: { color: '#6b7280' },
  mobileValue: { color: '#111827' },
  mobileTotal: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '10px',
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 600,
    fontSize: '15px',
  },
  mobileTotalLabel: { color: '#111827' },
  mobileTotalAmount: { color: 'rgb(5, 150, 105)' },

};
