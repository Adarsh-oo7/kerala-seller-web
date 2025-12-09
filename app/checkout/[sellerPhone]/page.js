'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import "../../../styles/keralasellerscheckout.css";
import { toast } from "react-toastify";


import { ArrowLeft, CreditCard, User, AlertTriangle, Package, CheckCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'process.env.NEXT_PUBLIC_API_BASE_URL';

// ✅ FIXED: Razorpay script loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { sellerPhone } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingInfo, setShippingInfo] = useState({
    name: '', phone: '', address: '', city: '', pincode: ''
  });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  console.log('🔍 Checkout Debug:');
  console.log('- sellerPhone:', sellerPhone);
  console.log('- Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');

  // ✅ FIXED: Load Razorpay script
  useEffect(() => {
    const loadScript = async () => {
      const loaded = await loadRazorpayScript();
      setRazorpayLoaded(loaded);
      if (!loaded) {
        console.warn('⚠️ Razorpay script failed to load');
      }
    };
    loadScript();
  }, []);

  useEffect(() => {
    const initializeCheckout = async () => {
      const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');
      if (!token) {
        router.push('/login/buyer');
        return;
      }

      if (!sellerPhone || sellerPhone === 'undefined') {
        console.error('❌ Invalid seller phone');
        router.push('/');
        return;
      }

      const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
      const sellerCart = multiCarts[sellerPhone] || [];

      console.log('📦 Cart loaded for seller:', sellerPhone, sellerCart);

      if (!sellerCart || sellerCart.length === 0) {
        console.warn('⚠️ No items in cart, redirecting...');
        router.push(`/cart/${sellerPhone}`);
        return;
      }

      setCartItems(sellerCart);

      try {
        const [storeRes, profileRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/shop/${sellerPhone}/`),
          fetch(`${API_BASE_URL}/api/buyer/profile/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (storeRes.status === 'fulfilled' && storeRes.value.ok) {
          const storeResData = await storeRes.value.json();
          setStoreData(storeResData.store || storeResData);
        } else {
          setStoreData({
            name: `Store ${sellerPhone}`,
            seller_phone: sellerPhone
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
        }
      } catch (error) {
        console.error('❌ Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [sellerPhone, router]);

  const calculateTotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const formatPrice = (price) => `₹${parseFloat(price).toFixed(2)}`;

  // ✅ FIXED: Enhanced online payment with Razorpay - SELLER ROUTING
  const handleOnlinePayment = async (orderData) => {
    if (!razorpayLoaded) {
      alert('Payment system not loaded. Please refresh and try again.');
      return false;
    }

    try {
      console.log('💳 Starting online payment...');

      const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');

      // Step 1: Create Razorpay order
      const createOrderResponse = await fetch(`${API_BASE_URL}/user/orders/create-razorpay-order/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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

      // ✅ CHANGE #1: key → key_id (SELLER'S KEY)
      const { razorpay_order_id, amount, key_id } = await createOrderResponse.json();
      console.log('✅ Razorpay order created:', razorpay_order_id);
      console.log('✅ Using seller key:', key_id);

      // Step 2: Initialize Razorpay payment
      const options = {
        key: key_id,  // ✅ CHANGE #2: key → key_id (SELLER'S KEY)
        amount: amount,
        currency: 'INR',
        name: storeData?.name || `Store ${sellerPhone}`,
        description: `Order from ${storeData?.name || 'Store'}`,
        order_id: razorpay_order_id,
        handler: async function (response) {
          console.log('💳 Payment completed, verifying...');

          try {
            // Step 3: Verify payment and create order
            const verifyResponse = await fetch(`${API_BASE_URL}/user/orders/verify-payment-and-create-order/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
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
              // ✅ Clear cart using sellerPhone
              const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
              delete multiCarts[sellerPhone];
              localStorage.setItem('multiCarts', JSON.stringify(multiCarts));

              console.log('✅ Payment verified and order created');
              // alert(`Payment successful! Order #${verifyData.order_id} placed successfully! 🎉`);
              toast.success(`Payment successful! Order #${verifyData.order_id} placed successfully! 🎉`, {
                position: "top-right",
                autoClose: 4500,
              });

              router.push(`/profile/orders`);
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
          ondismiss: function () {
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
          color: '#007bff'
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

  // ✅ FIXED: Enhanced order placement with proper validation
  const handlePlaceOrder = async () => {
    console.log('🔄 Place order clicked');
    console.log('- Payment method:', paymentMethod);
    console.log('- Cart items:', cartItems.length);
    console.log('- Seller phone:', sellerPhone);

    // ✅ FIXED: Enhanced validation
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address ||
      !shippingInfo.city || !shippingInfo.pincode || !paymentMethod) {
      // alert('Please fill all required fields and select a payment method');
      toast.warn('Please fill all required fields and select a payment method.', {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
        style: {
          width: "440px",
          height: "70px",
          padding: "12px",
          borderRadius: "12px",
        },
      });
      return;
    }

    if (!sellerPhone || sellerPhone === 'undefined') {
      alert('Store information not available. Please try again.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        customer_name: shippingInfo.name,
        customer_phone: shippingInfo.phone,
        shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.pincode}`,
        items: cartItems.map(item => ({
          id: parseInt(item.id),
          quantity: parseInt(item.quantity),
          name: item.name,
          price: parseFloat(item.price)
        })),
        payment_method: paymentMethod,
        seller_phone: sellerPhone
      };

      console.log('🔍 ORDER DATA:', orderData);

      if (paymentMethod === 'ONLINE') {
        // Handle online payment
        const paymentSuccess = await handleOnlinePayment(orderData);
        if (!paymentSuccess) {
          setSubmitting(false);
        }
      } else {
        // Handle COD
        const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');

        const response = await fetch(`${API_BASE_URL}/user/orders/create-order/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });

        const responseData = await response.json();
        console.log('📤 COD Response:', responseData);

        if (response.ok) {
          // ✅ Clear cart using sellerPhone
          const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
          delete multiCarts[sellerPhone];
          localStorage.setItem('multiCarts', JSON.stringify(multiCarts));

          // alert(`Order placed successfully! Order #${responseData.order_id} 🎉`);
          toast.success(`Order placed successfully! Order #${responseData.order_id} 🎉`, {
            position: "top-right",
            autoClose: 4500,
          });
          router.push(`/profile/orders`);
        } else {
          const errorMessage = responseData.error || responseData.detail || 'Unknown error';
          console.error('❌ COD Order failed:', responseData);
          alert('Order failed: ' + errorMessage);
        }

        setSubmitting(false);
      }
    } catch (error) {
      console.error('❌ ORDER ERROR:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      const errorMessage = error.response?.data?.error || error.message || 'Network error occurred';
      alert('Order failed: ' + errorMessage);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>Loading checkout...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Store: {sellerPhone}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!sellerPhone || sellerPhone === 'undefined') {
    return (
      <div>
        <Header />
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <AlertTriangle size={48} color="#ef4444" />
          <h2>Invalid Store</h2>
          <p>Store information not available.</p>
          <button onClick={() => router.push('/')} style={{
            padding: '12px 24px', backgroundColor: '#007bff', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer'
          }}>
            Go Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FDFFF0' }}>
      <Header />

      <div style={{
        backgroundColor: 'rgb(253, 255, 240)',
        padding: '10px 20px 20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(14, 69, 30, 0.145)', justifyContent: 'space-between', marginBottom: '30px', border: '1px solid rgba(14, 69, 30, 0.145)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px' }}>

          <button
            onClick={() => router.push(`/cart/`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#1a4845',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '20px' }}>
            <Package size={20} />
            Checkout
          </h1>
        </div>

        <div className='keralasellerscheckoutlayout' style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '30px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ backgroundColor: '#FDFFF0', color: '#1a4845', border: '1px solid #bbbbbbff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', borderRadius: '12px', padding: '30px' }}>
              <h2 className='keralasellerscheckouttitle' style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                <User size={20} />
                SHIPPING INFORMATION
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  className='keralasellersckeckoutinputsize'
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid rgb(229, 231, 235)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: 'rgb(253, 255, 240)'
                  }}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <input
                  type="tel"
                  className='keralasellersckeckoutinputsize'
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid rgb(229, 231, 235)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: 'rgb(253, 255, 240)'
                  }}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <textarea
                  value={shippingInfo.address}
                  className='keralasellersckeckoutinputsize'
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid rgb(229, 231, 235)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    backgroundColor: 'rgb(253, 255, 240)',
                    resize: 'vertical'
                  }}
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <input
                    type="text"
                    className='keralasellersckeckoutinputsize'
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid rgb(229, 231, 235)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      backgroundColor: 'rgb(253, 255, 240)'
                    }}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className='keralasellersckeckoutinputsize'
                    value={shippingInfo.pincode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid rgb(229, 231, 235)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      backgroundColor: 'rgb(253, 255, 240)'
                    }}
                    placeholder="Pincode"
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FDFFF0', color: '#1a4845', border: '1px solid #bbbbbbff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', borderRadius: '12px', padding: '30px' }}>
              <h2 className='keralasellerscheckouttitle' style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                <CreditCard size={20} />
                PAYMENT METHOD
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label className='keralasellerscheckoutpayment' style={{
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  display: 'flex',
                  padding: '16px',
                  border: `2px solid rgba(14, 69, 30, 0.145)`,
                  borderRadius: '8px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'COD' ? 'rgba(14, 69, 30, 0.145)' : '#FDFFF0',
                  transition: 'background-color 0.3s ease'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: '12px', accentColor: '#1a4845' }}
                  />
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 'bold'
                      }}
                    >
                      <span>Cash on Delivery</span>
                      {paymentMethod === 'COD' && <CheckCircle size={16} color="#10b981" />}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1a4845' }}>Pay when you receive the order</div>
                  </div>
                </label>

                <label className='keralasellerscheckoutpayment' style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: '16px',
                  border: `2px solid rgba(14, 69, 30, 0.145)`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'ONLINE' ? 'rgba(14, 69, 30, 0.145)' : '#FDFFF0',
                  opacity: razorpayLoaded ? 1 : 0.5,
                  transition: 'background-color 0.3s ease'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginRight: '12px', accentColor: '#1a4845' }}
                    disabled={!razorpayLoaded}
                  />
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 'bold'
                      }}
                    >
                      <span>Pay Online {!razorpayLoaded && '(Loading...)'}</span>
                      {paymentMethod === 'ONLINE' && <CheckCircle size={16} color="#10b981" />}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1a4845' }}>
                      {razorpayLoaded ? 'UPI, Card, Net Banking via Razorpay' : 'Loading payment system...'}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div style={{ flex: '0 0 400px', backgroundColor: '#FDFFF0', color: '#1a4845', border: '1px solid #bbbbbbff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', borderRadius: '12px', padding: '30px', height: 'fit-content' }}>
            <h2 className='keralasellerscheckouttitle' style={{ fontSize: '18px' }}>ORDER SUMMARY</h2>

            <div style={{
              backgroundColor: 'rgba(14, 69, 30, 0.145)', padding: '12px', borderRadius: '8px',
              marginBottom: '20px', textAlign: 'center', border: '1px solid rgba(14, 69, 30, 0.145)',
            }}>
              <strong>{storeData?.name || `Store ${sellerPhone}`}</strong>
            </div>

            {cartItems.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className='keralasellerscheckoutitemname' style={{ fontSize: '18px' }}>{item.name}</div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    {formatPrice(item.price)} × {item.quantity}
                  </div>
                </div>

                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              fontSize: '14px'
            }}>
              <span>
                Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
              </span>
              <span className='keralasellerscheckoutitemname'>{formatPrice(calculateTotal())}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px',
              fontSize: '14px'
            }}>
              <span>Delivery</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>Free</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              marginTop: '16px',
              fontSize: '20px',
            }}>
              <span className='keralasellerscheckoutitemname'>Total:</span>
              <span className='keralasellerscheckoutitemname' style={{ color: 'rgb(5, 150, 105)', fontWeight: 'bold' }}>{formatPrice(calculateTotal())}</span>
            </div>

            <button
              className='keralasellerscheckoutbtn'
              onClick={handlePlaceOrder}
              disabled={submitting || cartItems.length === 0}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor:
                  submitting || cartItems.length === 0 ? '#ccc' : 'rgb(16, 185, 129)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: submitting || cartItems.length === 0 ? 'not-allowed' : 'pointer',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'background-color 0.3s ease'
              }}
            >
              <CreditCard size={20} color="white" />
              {submitting
                ? 'Processing...'
                : `Place Order (${formatPrice(calculateTotal())})`}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
