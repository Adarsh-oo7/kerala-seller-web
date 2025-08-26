'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, CreditCard, MapPin, User, Phone, Home, Truck } from 'lucide-react';

const PROFILE_API = 'http://localhost:8000/api/buyer/profile/';
const CREATE_ORDER_API = 'http://localhost:8000/api/orders/create/';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { sellerPhone } = params;
  const { getCartBySeller, clearCartForSeller } = useCart();

  const [shippingInfo, setShippingInfo] = useState({ 
    name: '', 
    phone: '', 
    address: '',
    city: '',
    pincode: '' 
  });
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [store, setStore] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('buyerAccessToken');
    if (!token) {
      router.push('/login/buyer');
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

  // Fetch data on component mount
  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers) {
      setIsLoading(false);
      return;
    }
    
    // Set cart items from context
    const items = getCartBySeller(sellerPhone);
    setCartItems(items);

    // If no items in cart, redirect back
    if (items.length === 0) {
      alert('Your cart is empty. Please add some items before checkout.');
      router.push(`/shop/${sellerPhone}`);
      return;
    }

    // Fetch store details and buyer profile
    Promise.all([
      fetchStoreDetails(),
      fetchBuyerProfile(headers)
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [sellerPhone, getCartBySeller, getAuthHeaders, router]);

  const fetchStoreDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/shop/${sellerPhone}/`);
      setStore(response.data.store);
    } catch (error) {
      console.error('Failed to fetch store details:', error);
    }
  };

  const fetchBuyerProfile = async (headers) => {
    try {
      const response = await axios.get(PROFILE_API, { headers });
      const data = response.data;
      
      setShippingInfo({
        name: data.full_name || '',
        phone: data.phone_number || '',
        address: data.address_line_1 || '',
        city: data.city || '',
        pincode: data.pincode || ''
      });
    } catch (error) {
      console.error("Failed to fetch profile", error);
      alert("Could not load your profile. Please try logging in again.");
      router.push('/login/buyer');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!shippingInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(shippingInfo.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!shippingInfo.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!shippingInfo.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!shippingInfo.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(shippingInfo.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      alert('Please fill all required fields correctly.');
      return;
    }

    const headers = getAuthHeaders();
    if (!headers || cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const orderData = {
        seller_phone: sellerPhone,
        customer_name: shippingInfo.name.trim(),
        customer_phone: shippingInfo.phone.trim(),
        shipping_address: {
          address: shippingInfo.address.trim(),
          city: shippingInfo.city.trim(),
          pincode: shippingInfo.pincode.trim()
        },
        items: cartItems.map(item => ({ 
          product_id: item.id, 
          quantity: item.quantity,
          price: item.price 
        })),
        total_amount: calculateTotal()
      };

      const response = await axios.post(CREATE_ORDER_API, orderData, { headers });
      
      if (response.status === 201) {
        alert('Order placed successfully! The seller has 24 hours to accept your order.');
        clearCartForSeller(sellerPhone);
        router.push('/profile/orders');
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      const errorMessage = error.response?.data?.error || 'Failed to place order. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <h1 style={styles.headerTitle}>
            <CreditCard size={24} />
            Checkout
          </h1>
        </div>
      </header>

      <div style={styles.container}>
        {/* Store Information */}
        {store && (
          <div style={styles.storeCard}>
            <h3>🏪 Ordering from: {store.name}</h3>
            <p>📞 {store.seller_phone}</p>
          </div>
        )}

        <div style={styles.checkoutLayout}>
          {/* Shipping Details Form */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>
              <Truck size={20} />
              Shipping Information
            </h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User size={16} />
                Full Name *
              </label>
              <input
                type="text"
                value={shippingInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{...styles.input, ...(errors.name ? styles.inputError : {})}}
                placeholder="Enter your full name"
              />
              {errors.name && <span style={styles.errorText}>{errors.name}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Phone size={16} />
                Phone Number *
              </label>
              <input
                type="tel"
                value={shippingInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{...styles.input, ...(errors.phone ? styles.inputError : {})}}
                placeholder="Enter 10-digit phone number"
              />
              {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Home size={16} />
                Address *
              </label>
              <textarea
                value={shippingInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                style={{...styles.textarea, ...(errors.address ? styles.inputError : {})}}
                placeholder="Enter your complete address"
                rows={3}
              />
              {errors.address && <span style={styles.errorText}>{errors.address}</span>}
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <MapPin size={16} />
                  City *
                </label>
                <input
                  type="text"
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  style={{...styles.input, ...(errors.city ? styles.inputError : {})}}
                  placeholder="City"
                />
                {errors.city && <span style={styles.errorText}>{errors.city}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Pincode *</label>
                <input
                  type="text"
                  value={shippingInfo.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  style={{...styles.input, ...(errors.pincode ? styles.inputError : {})}}
                  placeholder="000000"
                  maxLength={6}
                />
                {errors.pincode && <span style={styles.errorText}>{errors.pincode}</span>}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div style={styles.summarySection}>
            <h2 style={styles.sectionTitle}>
              <ShoppingCart size={20} />
              Order Summary
            </h2>
            
            {cartItems.map(item => (
              <div key={item.id} style={styles.summaryItem}>
                <div style={styles.itemInfo}>
                  <img 
                    src={item.main_image_url || 'https://placehold.co/50x50?text=No+Image'}
                    alt={item.name}
                    style={styles.itemImage}
                  />
                  <div>
                    <h4 style={styles.itemName}>{item.name}</h4>
                    <p style={styles.itemDetails}>Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                </div>
                <div style={styles.itemTotal}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}

            <hr style={styles.divider} />
            
            <div style={styles.summaryRow}>
              <span>Items Total:</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span>Delivery:</span>
              <span style={styles.freeText}>FREE</span>
            </div>
            
            <hr style={styles.divider} />
            
            <div style={{...styles.summaryRow, ...styles.totalRow}}>
              <strong>Total Amount:</strong>
              <strong>{formatPrice(calculateTotal())}</strong>
            </div>

            <button 
              onClick={handlePlaceOrder} 
              disabled={isSubmitting || cartItems.length === 0}
              style={{
                ...styles.checkoutButton,
                ...(isSubmitting ? styles.disabledButton : {})
              }}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>

            <div style={styles.orderNote}>
              <p>🔒 Your order will be sent to the seller for confirmation</p>
              <p>💳 Cash on Delivery available</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0d6efd',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Header
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e9ecef',
    padding: '20px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#212529',
    margin: 0
  },

  // Main Container
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '20px'
  },

  // Store Card
  storeCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },

  // Layout
  checkoutLayout: { 
    display: 'grid', 
    gridTemplateColumns: '1.5fr 1fr', 
    gap: '30px',
    alignItems: 'start'
  },

  // Form Section
  formSection: { 
    backgroundColor: 'white',
    borderRadius: '12px', 
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#212529'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#374151',
    fontSize: '0.9rem'
  },
  input: { 
    width: '100%', 
    padding: '12px 16px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s',
    outline: 'none'
  },
  textarea: {
    width: '100%', 
    padding: '12px 16px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '8px',
    fontSize: '1rem',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none'
  },
  inputError: {
    borderColor: '#ef4444'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.85rem',
    marginTop: '4px',
    display: 'block'
  },

  // Summary Section
  summarySection: { 
    backgroundColor: 'white',
    borderRadius: '12px', 
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: '20px',
    height: 'fit-content'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  itemImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  itemName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    margin: '0 0 4px 0'
  },
  itemDetails: {
    fontSize: '0.85rem',
    color: '#6b7280',
    margin: 0
  },
  itemTotal: {
    fontWeight: '600',
    color: '#374151'
  },
  summaryRow: { 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    fontSize: '1rem'
  },
  freeText: {
    color: '#10b981',
    fontWeight: '500'
  },
  divider: { 
    border: 'none', 
    borderTop: '1px solid #e5e7eb', 
    margin: '16px 0' 
  },
  totalRow: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#111827',
    paddingTop: '12px'
  },
  checkoutButton: { 
    width: '100%', 
    padding: '16px', 
    backgroundColor: '#10b981', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '20px'
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  orderNote: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#166534'
  }
};
