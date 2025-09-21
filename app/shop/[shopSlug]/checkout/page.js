'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, User, Phone, MapPin, Store, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// ✅ ENHANCED: Razorpay script loader with retry mechanism
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('✅ Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function ShopCheckoutPage() {
  const { shopSlug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingInfo, setShippingInfo] = useState({
    name: '', phone: '', address: '', city: '', pincode: ''
  });
  const [urlError, setUrlError] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // ✅ ENHANCED: Store ID detection with validation
  const getActualStoreId = () => {
    console.log('🔍 Getting store ID for checkout...');
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
  
  console.log('🛒 Checkout store ID:', actualStoreId);

  // ✅ ENHANCED: Load Razorpay script with retry
  useEffect(() => {
    const loadScript = async () => {
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !razorpayLoaded) {
        const loaded = await loadRazorpayScript();
        if (loaded) {
          setRazorpayLoaded(true);
          break;
        }
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`⚠️ Razorpay load attempt ${attempts} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!razorpayLoaded && attempts >= maxAttempts) {
        console.warn('⚠️ Failed to load Razorpay after multiple attempts');
      }
    };

    loadScript();
  }, []);

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
      const currentUrl = getShopUrl('/checkout');
      const redirectUrl = `${loginUrl}?redirect=${encodeURIComponent(currentUrl)}`;
      console.log('🔐 No token, redirecting to login:', redirectUrl);
      router.push(redirectUrl);
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  };

  // ✅ REDIRECT: If we have an invalid URL, redirect to cart
  useEffect(() => {
    if (urlError || !actualStoreId) {
      console.log('🔍 Invalid checkout URL, redirecting to cart...');
      
      try {
        const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
        const availableStores = Object.keys(multiCarts).filter(storeId => 
          multiCarts[storeId] && multiCarts[storeId].length > 0
        );
        
        if (availableStores.length === 1) {
          router.replace(`/shop/${availableStores[0]}/cart`);
          return;
        } else {
          router.replace('/');
          return;
        }
      } catch (error) {
        router.replace('/');
        return;
      }
    }
  }, [urlError, actualStoreId, router]);

  useEffect(() => {
    const headers = checkAuth();
    if (!headers || !actualStoreId) return;

    const loadData = async () => {
      console.log('📦 Loading checkout data for store:', actualStoreId);

      // ✅ FIXED: Load cart using actual store ID
      const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
      const storeCart = multiCarts[actualStoreId] || [];
      
      console.log('📦 Cart items for checkout:', storeCart);
      
      if (storeCart.length === 0) {
        console.warn('⚠️ No items in cart, redirecting to cart page');
        router.push(getShopUrl('/cart'));
        return;
      }
      
      setCartItems(storeCart);

      try {
        // Load store and profile data
        const [storeRes, profileRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/shop/${actualStoreId}/`),
          fetch(`${API_BASE_URL}/api/buyer/profile/`, { headers })
        ]);

        if (storeRes.status === 'fulfilled' && storeRes.value.ok) {
          const storeResData = await storeRes.value.json();
          setStoreData(storeResData.store || storeResData);
          console.log('✅ Store data loaded for checkout');
        } else {
          console.warn('⚠️ Store API failed, using fallback');
          setStoreData({
            name: `Store ${actualStoreId}`,
            seller_phone: actualStoreId,
            id: actualStoreId
          });
        }

        if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          const profileData = await profileRes.value.json();
          setShippingInfo({
            name: profileData.full_name || '',
            phone: profileData.phone_number || '',
            address: [profileData.address_line_1, profileData.address_line_2].filter(Boolean).join(', '),
            city: profileData.city || '',
            pincode: profileData.pincode || ''
          });
          console.log('✅ Profile data loaded for shipping');
        }
      } catch (error) {
        console.error('❌ Failed to load checkout data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (actualStoreId && !urlError) {
      loadData();
    }
  }, [actualStoreId]);

  // ✅ ENHANCED: Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!shippingInfo.name.trim()) errors.name = 'Name is required';
    if (!shippingInfo.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(shippingInfo.phone.trim())) errors.phone = 'Phone number must be 10 digits';
    if (!shippingInfo.address.trim()) errors.address = 'Address is required';
    if (!shippingInfo.city.trim()) errors.city = 'City is required';
    if (!shippingInfo.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(shippingInfo.pincode.trim())) errors.pincode = 'Pincode must be 6 digits';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateTotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const formatPrice = (price) => `₹${parseFloat(price).toFixed(2)}`;

  // ✅ ENHANCED: Handle online payment with better error handling
  const handleOnlinePayment = async (orderData) => {
    if (!razorpayLoaded) {
      alert('Payment system not loaded. Please refresh and try again.');
      return false;
    }

    try {
      console.log('💳 Starting online payment flow...');
      
      const headers = checkAuth();
      if (!headers) return false;

      // Step 1: Create Razorpay order
      const createOrderResponse = await fetch(`${API_BASE_URL}/user/orders/create-razorpay-order/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          order_data: orderData
        })
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const { razorpay_order_id, amount, key } = await createOrderResponse.json();
      console.log('✅ Razorpay order created:', razorpay_order_id);

      // Step 2: Initialize Razorpay payment
      const options = {
        key: key,
        amount: amount,
        currency: 'INR',
        name: storeData?.name || `Store ${actualStoreId}`,
        description: `Order from ${storeData?.name || 'Store'}`,
        order_id: razorpay_order_id,
        handler: async function (response) {
          console.log('💳 Payment completed, verifying...');
          
          try {
            // Step 3: Verify payment and create order
            const verifyResponse = await fetch(`${API_BASE_URL}/user/orders/verify-payment-and-create-order/`, {
              method: 'POST',
              headers: {
                ...headers,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                order_data: orderData
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok && verifyData.success) {
              // Clear cart
              const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
              delete multiCarts[actualStoreId];
              localStorage.setItem('multiCarts', JSON.stringify(multiCarts));
              
              console.log('✅ Payment verified and order created');
              alert(`Payment successful! Order #${verifyData.order_id} placed successfully! 🎉`);
              
              // ✅ FIXED: Navigate to store-specific profile orders page
              const profileUrl = getShopUrl('/profile/orders');
              router.push(profileUrl);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error('❌ Payment verification failed:', verifyError);
            alert(`Payment completed but order creation failed: ${verifyError.message}. Please contact support with payment ID: ${response.razorpay_payment_id}`);
          }
          
          setSubmitting(false);
        },
        modal: {
          ondismiss: function() {
            console.log('💳 Payment modal closed');
            setSubmitting(false);
          }
        },
        prefill: {
          name: shippingInfo.name,
          email: '',
          contact: shippingInfo.phone
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('💳 Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setSubmitting(false);
      });
      
      rzp.open();
      return true;
    } catch (error) {
      console.error('❌ Online payment error:', error);
      alert(`Failed to initialize payment: ${error.message}`);
      return false;
    }
  };

  // ✅ ENHANCED: Handle order placement with validation
  const handlePlaceOrder = async () => {
    console.log('🔄 Placing order...');
    console.log('- Store ID:', actualStoreId);
    console.log('- Cart items:', cartItems.length);
    console.log('- Payment method:', paymentMethod);

    // Validate form
    if (!validateForm()) {
      alert('Please fix the form errors and try again');
      return;
    }

    if (!actualStoreId) {
      alert('Store information not available. Please try again.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (paymentMethod === 'ONLINE' && !razorpayLoaded) {
      alert('Payment system is still loading. Please wait and try again.');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        customer_name: shippingInfo.name.trim(),
        customer_phone: shippingInfo.phone.trim(),
        shipping_address: `${shippingInfo.address.trim()}, ${shippingInfo.city.trim()}, ${shippingInfo.pincode.trim()}`,
        items: cartItems.map(item => ({
          id: parseInt(item.id),
          quantity: parseInt(item.quantity),
          name: item.name,
          price: parseFloat(item.price)
        })),
        payment_method: paymentMethod,
        seller_phone: actualStoreId
      };

      console.log('📤 Sending order data:', orderData);

      if (paymentMethod === 'ONLINE') {
        // Handle online payment
        const paymentSuccess = await handleOnlinePayment(orderData);
        if (!paymentSuccess) {
          setSubmitting(false);
        }
        // Don't set submitting to false here as payment is in progress
      } else {
        // Handle COD
        const headers = checkAuth();
        if (!headers) {
          setSubmitting(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/user/orders/create-order/`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });

        const responseData = await response.json();

        if (response.ok) {
          // Clear cart
          const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
          delete multiCarts[actualStoreId];
          localStorage.setItem('multiCarts', JSON.stringify(multiCarts));
          
          console.log('✅ COD Order placed successfully:', responseData);
          alert(`Order placed successfully! Order #${responseData.order_id} 🎉`);
          
          // ✅ FIXED: Navigate to store-specific profile orders page
          const profileUrl = getShopUrl('/profile/orders');
          router.push(profileUrl);
        } else {
          const errorMessage = responseData.error || responseData.detail || 'Please try again';
          console.error('❌ COD Order failed:', responseData);
          alert('Order failed: ' + errorMessage);
        }
        
        setSubmitting(false);
      }
    } catch (error) {
      console.error('❌ Order network error:', error);
      alert('Network error occurred. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  const handleBackClick = () => {
    const cartUrl = getShopUrl('/cart');
    console.log('🔙 Back to cart:', cartUrl);
    router.push(cartUrl);
  };

  // ✅ ENHANCED: Input change handler with error clearing
  const handleInputChange = (field, value) => {
    setShippingInfo({...shippingInfo, [field]: value});
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors({...formErrors, [field]: ''});
    }
  };

  // Show loading while redirecting or loading
  if (loading || urlError) {
    return (
      <div style={styles.loadingContainer}>
        {urlError ? (
          <>
            <AlertTriangle size={48} color="#ef4444" />
            <h2>Invalid Checkout URL</h2>
            <p>{urlError}</p>
            <p>Redirecting to cart...</p>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <p>Loading checkout...</p>
            <p style={{fontSize: '12px', color: '#666'}}>
              Store ID: {actualStoreId || 'Not found'}
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
        <p>Unable to identify the store for checkout.</p>
        <button onClick={() => router.push('/')} style={styles.homeButton}>
          Go Home
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
          Checkout - {storeData?.name || `Store ${actualStoreId}`}
        </h1>
      </div>

      {/* Store Context */}
      <div style={styles.storeIndicator}>
        <Store size={16} />
        <span>Placing order at {storeData?.name || `Store ${actualStoreId}`} • {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Security Indicator */}
      <div style={styles.securityIndicator}>
        <Shield size={16} />
        <span>Secure checkout • Your data is encrypted and protected</span>
      </div>

      <div style={styles.checkoutLayout}>
        {/* Left: Forms */}
        <div style={styles.formSection}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <User size={20} />
              Shipping Information
            </h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text"
                value={shippingInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: formErrors.name ? '#ef4444' : '#e5e7eb'
                }}
                placeholder="Enter your full name"
                required
              />
              {formErrors.name && (
                <div style={styles.errorText}>{formErrors.name}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                type="tel"
                value={shippingInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: formErrors.phone ? '#ef4444' : '#e5e7eb'
                }}
                placeholder="Enter 10-digit phone number"
                required
              />
              {formErrors.phone && (
                <div style={styles.errorText}>{formErrors.phone}</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Address *</label>
              <textarea
                value={shippingInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                style={{
                  ...styles.textarea,
                  borderColor: formErrors.address ? '#ef4444' : '#e5e7eb'
                }}
                placeholder="Enter your complete address"
                required
              />
              {formErrors.address && (
                <div style={styles.errorText}>{formErrors.address}</div>
              )}
            </div>

            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City *</label>
                <input
                  type="text"
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  style={{
                    ...styles.input,
                    borderColor: formErrors.city ? '#ef4444' : '#e5e7eb'
                  }}
                  placeholder="City"
                  required
                />
                {formErrors.city && (
                  <div style={styles.errorText}>{formErrors.city}</div>
                )}
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Pincode *</label>
                <input
                  type="text"
                  value={shippingInfo.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  style={{
                    ...styles.input,
                    borderColor: formErrors.pincode ? '#ef4444' : '#e5e7eb'
                  }}
                  placeholder="6-digit pincode"
                  required
                />
                {formErrors.pincode && (
                  <div style={styles.errorText}>{formErrors.pincode}</div>
                )}
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <CreditCard size={20} />
              Payment Method
            </h2>

            <div style={styles.paymentOptions}>
              <label style={{
                ...styles.paymentOption,
                backgroundColor: paymentMethod === 'COD' ? '#f0f8ff' : 'white',
                borderColor: paymentMethod === 'COD' ? '#3b82f6' : '#e5e7eb'
              }}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={styles.radio}
                />
                <div>
                  <div style={{fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    Cash on Delivery
                    <CheckCircle size={16} color="#10b981" />
                  </div>
                  <div style={{fontSize: '12px', color: '#6b7280'}}>Pay when you receive the order</div>
                </div>
              </label>

              <label style={{
                ...styles.paymentOption,
                backgroundColor: paymentMethod === 'ONLINE' ? '#f0f8ff' : 'white',
                borderColor: paymentMethod === 'ONLINE' ? '#3b82f6' : '#e5e7eb',
                opacity: razorpayLoaded ? 1 : 0.5
              }}>
                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={styles.radio}
                  disabled={!razorpayLoaded}
                />
                <div>
                  <div style={{fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    Pay Online 
                    {razorpayLoaded ? <CheckCircle size={16} color="#10b981" /> : <div style={styles.miniSpinner}></div>}
                  </div>
                  <div style={{fontSize: '12px', color: '#6b7280'}}>
                    {razorpayLoaded ? 'UPI, Card, Net Banking via Razorpay' : 'Loading payment system...'}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div style={styles.summarySection}>
          <h2 style={styles.sectionTitle}>Order Summary</h2>
          <div style={styles.storeInfo}>
            <strong>{storeData?.name || `Store ${actualStoreId}`}</strong>
            <div style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>
              Store ID: {actualStoreId}
            </div>
          </div>

          <div style={styles.itemsList}>
            {cartItems.map(item => (
              <div key={item.id} style={styles.summaryItem}>
                <div style={styles.itemLeft}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemDetails}>
                    {formatPrice(item.price)} × {item.quantity}
                  </div>
                </div>
                <div style={styles.itemTotal}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.totalSection}>
            <div style={styles.subtotalRow}>
              <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
            <div style={styles.subtotalRow}>
              <span>Delivery</span>
              <span style={{color: '#10b981', fontWeight: '600'}}>Free</span>
            </div>
            <div style={styles.totalRow}>
              <span>Total:</span>
              <span style={styles.totalAmount}>{formatPrice(calculateTotal())}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={submitting || cartItems.length === 0}
            style={{
              ...styles.placeOrderButton,
              backgroundColor: (submitting || cartItems.length === 0) ? '#ccc' : '#10b981',
              cursor: (submitting || cartItems.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            <CreditCard size={18} />
            {submitting ? (
              paymentMethod === 'ONLINE' ? 'Processing Payment...' : 'Placing Order...'
            ) : (
              `Place Order (${formatPrice(calculateTotal())})`
            )}
          </button>

          {/* Payment Security Notice */}
          {paymentMethod === 'ONLINE' && (
            <div style={styles.securityNotice}>
              <Shield size={14} />
              <span>Payments are secured by Razorpay</span>
            </div>
          )}
        </div>
      </div>

      {/* ✅ ENHANCED: Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={styles.debugPanel}>
          <div style={styles.debugTitle}>🔧 Debug Info</div>
          <div>Store ID: {actualStoreId}</div>
          <div>Cart Items: {cartItems.length}</div>
          <div>Payment Method: {paymentMethod}</div>
          <div>Razorpay: {razorpayLoaded ? '✅' : '❌'}</div>
          <div>Form Errors: {Object.keys(formErrors).length}</div>
          <div>Submitting: {submitting ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  loadingContainer: { 
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', minHeight: '100vh', gap: '20px', textAlign: 'center' 
  },
  spinner: { 
    width: '32px', height: '32px', border: '3px solid #f3f3f3', 
    borderTop: '3px solid #3b82f6', borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
  miniSpinner: {
    width: '12px', height: '12px', border: '2px solid #f3f3f3',
    borderTop: '2px solid #3b82f6', borderRadius: '50%',
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
    borderRadius: '8px', padding: '12px 16px', marginBottom: '8px',
    fontSize: '14px', color: '#1e40af', fontWeight: '500'
  },
  securityIndicator: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#f0fdf4', border: '1px solid #10b981',
    borderRadius: '8px', padding: '10px 16px', marginBottom: '20px',
    fontSize: '13px', color: '#047857', fontWeight: '500'
  },
  checkoutLayout: { 
    display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px',
    '@media (max-width: 968px)': {
      gridTemplateColumns: '1fr',
      gap: '20px'
    }
  },
  formSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
  section: { 
    backgroundColor: 'white', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'
  },
  sectionTitle: { 
    display: 'flex', alignItems: 'center', gap: '8px', 
    fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' 
  },
  inputGroup: { marginBottom: '16px' },
  inputRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: { 
    display: 'block', fontSize: '14px', fontWeight: '600', 
    color: '#374151', marginBottom: '6px' 
  },
  input: { 
    width: '100%', padding: '12px 16px', border: '2px solid', 
    borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  textarea: { 
    width: '100%', padding: '12px 16px', border: '2px solid', 
    borderRadius: '8px', fontSize: '16px', resize: 'vertical', minHeight: '80px',
    boxSizing: 'border-box'
  },
  errorText: {
    fontSize: '12px', color: '#ef4444', marginTop: '4px', fontWeight: '500'
  },
  paymentOptions: { display: 'flex', flexDirection: 'column', gap: '12px' },
  paymentOption: { 
    display: 'flex', alignItems: 'flex-start', gap: '12px', 
    padding: '16px', border: '2px solid', borderRadius: '8px', 
    cursor: 'pointer', transition: 'all 0.2s'
  },
  radio: { marginTop: '2px' },
  summarySection: { 
    backgroundColor: 'white', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
    height: 'fit-content'
  },
  storeInfo: { 
    padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', 
    marginBottom: '20px', textAlign: 'center'
  },
  itemsList: { marginBottom: '20px' },
  summaryItem: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', 
    padding: '12px 0', borderBottom: '1px solid #f3f4f6' 
  },
  itemLeft: { flex: 1 },
  itemName: { fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' },
  itemDetails: { fontSize: '12px', color: '#6b7280' },
  itemTotal: { fontSize: '14px', fontWeight: '600', color: '#1f2937' },
  totalSection: { 
    marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' 
  },
  subtotalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '8px', fontSize: '14px', color: '#6b7280'
  },
  totalRow: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6'
  },
  totalAmount: { fontSize: '20px', fontWeight: '700', color: '#059669' },
  placeOrderButton: { 
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', color: 'white', border: 'none', borderRadius: '10px', 
    padding: '16px', fontSize: '16px', fontWeight: '600', marginTop: '20px',
    transition: 'all 0.2s'
  },
  securityNotice: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    marginTop: '12px', fontSize: '12px', color: '#6b7280'
  },
  debugPanel: {
    backgroundColor: '#f3f4f6', border: '1px solid #d1d5db',
    borderRadius: '8px', padding: '12px', marginTop: '20px',
    fontSize: '12px', fontFamily: 'monospace'
  },
  debugTitle: {
    fontWeight: 'bold', marginBottom: '8px', color: '#374151'
  }
};
