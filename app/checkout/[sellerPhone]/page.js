'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import "../../../styles/keralasellerscheckout.css";
import { toast } from "react-toastify";
import axios from 'axios';
import { useCart } from '../../context/CartContext';

import { ArrowLeft, CreditCard, User, AlertTriangle, Package, CheckCircle, Truck, Weight } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     'https://api.keralasellers.in/api';

// ✅ Razorpay script loader
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
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    name: '', phone: '', address: '', city: '', pincode: ''
  });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isBuyNow, setIsBuyNow] = useState(false);
  
  // ✅ NEW: Delivery charge states
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [totalWeight, setTotalWeight] = useState(0);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);

  const { clearCartForSeller, clearAllCarts } = useCart();

  console.log('🔍 Checkout Debug:');
  console.log('- sellerPhone:', sellerPhone);

  // ✅ Load Razorpay script
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

  // ✅ Auto-select payment method when store data is loaded
  useEffect(() => {
    if (storeData && !paymentMethod) {
      const codEnabled = storeData.accepts_cod === true;
      
      if (codEnabled) {
        setPaymentMethod('COD');
        console.log('✅ Auto-selected COD');
      } else if (razorpayLoaded) {
        setPaymentMethod('ONLINE');
        console.log('✅ Auto-selected ONLINE payment');
      }
    }
  }, [storeData, razorpayLoaded, paymentMethod]);

  // ✅ NEW: Calculate delivery when payment method or cart changes
  useEffect(() => {
    if (cartItems.length > 0 && paymentMethod && storeData) {
      calculateDeliveryCharge();
    }
  }, [paymentMethod, cartItems, storeData]);

  // ✅ Buy Now + Cart checkout logic
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

      const buyNow = searchParams.get('buyNow') === '1';
      const productId = searchParams.get('productId');
      const quantity = parseInt(searchParams.get('quantity') || '1');

      if (buyNow && productId) {
        setIsBuyNow(true);
        await fetchSingleProduct(productId, quantity, token);
      } else {
        setIsBuyNow(false);
        await loadCartItems(token);
      }
    };

    initializeCheckout();
  }, [sellerPhone, router, searchParams]);

  // ✅ NEW: Calculate delivery charge from backend
  const calculateDeliveryCharge = async () => {
    try {
      setCalculatingDelivery(true);
      console.log('📦 Calculating delivery charge...');

      const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');

      // Prepare items with weight
      const itemsWithWeight = await Promise.all(
        cartItems.map(async (item) => {
          // Fetch product details to get weight if not already in cart
          if (!item.weight_kg) {
            try {
              const productRes = await axios.get(`${API_BASE_URL}/api/products/${item.id}/`);
              item.weight_kg = productRes.data.weight_kg || 0;
            } catch (err) {
              console.warn(`⚠️ Could not fetch weight for product ${item.id}`);
              item.weight_kg = 0;
            }
          }
          return {
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            weight_kg: item.weight_kg || 0
          };
        })
      );

      // Calculate total weight
      const weight = itemsWithWeight.reduce((sum, item) => 
        sum + (parseFloat(item.weight_kg) * item.quantity), 0
      );
      setTotalWeight(weight);

      // Call backend API
      const response = await axios.post(
        `${API_BASE_URL}/api/orders/calculate-checkout/`,
        {
          seller_phone: sellerPhone,
          items: itemsWithWeight,
          payment_method: paymentMethod
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setDeliveryCharge(response.data.delivery_charge);
        setDeliveryInfo(response.data.delivery_info);
        console.log('✅ Delivery calculated:', response.data);
      }
    } catch (error) {
      console.error('❌ Failed to calculate delivery:', error);
      // Fallback to free delivery
      setDeliveryCharge(0);
      setDeliveryInfo({ is_free: true, reason: 'Free delivery' });
    } finally {
      setCalculatingDelivery(false);
    }
  };

  // ✅ Fetch single product for Buy Now
  const fetchSingleProduct = async (productId, quantity, token) => {
    try {
      console.log('🛒 Fetching product for Buy Now:', productId);
      
      const productResponse = await axios.get(`${API_BASE_URL}/api/products/${productId}/`);
      const product = productResponse.data;

      setCartItems([{
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.cloudinary_url || product.main_image_url,
        store: product.store,
        weight_kg: product.weight_kg || 0 // ✅ Include weight
      }]);

      await loadStoreAndProfile(token);
      setLoading(false);
    } catch (error) {
      console.error('❌ Failed to fetch product:', error);
      toast.error('Failed to load product details');
      router.push('/');
    }
  };

  // ✅ Load cart items
  const loadCartItems = async (token) => {
    const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
    const sellerCart = multiCarts[sellerPhone] || [];

    if (!sellerCart || sellerCart.length === 0) {
      router.push(`/cart/${sellerPhone}`);
      return;
    }

    setCartItems(sellerCart);
    await loadStoreAndProfile(token);
    setLoading(false);
  };

  // ✅ Load store and buyer profile
  const loadStoreAndProfile = async (token) => {
    try {
      const [storeRes, profileRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/shop/${sellerPhone}/`),
        fetch(`${API_BASE_URL}/api/buyer/profile/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (storeRes.status === 'fulfilled' && storeRes.value.ok) {
        const storeResData = await storeRes.value.json();
        const store = storeResData.store || storeResData;
        setStoreData(store);
      } else {
        setStoreData({
          name: `Store ${sellerPhone}`,
          seller_phone: sellerPhone,
          accepts_cod: false
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
    }
  };

  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const calculateTotal = () => calculateSubtotal() + deliveryCharge;
  const formatPrice = (price) => `₹${parseFloat(price).toFixed(2)}`;

  const isCODEnabled = () => {
    if (!storeData) return false;
    return storeData.accepts_cod === true;
  };

  // ✅ Enhanced online payment with delivery charge
  const handleOnlinePayment = async (orderData) => {
    if (!razorpayLoaded) {
      alert('Payment system not loaded. Please refresh and try again.');
      return false;
    }

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');

      const createOrderResponse = await fetch(`${API_BASE_URL}/user/orders/create-razorpay-order/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: calculateTotal(), // ✅ Include delivery
          order_data: {
            ...orderData,
            delivery_charge: deliveryCharge, // ✅ Pass delivery charge
            total_weight_kg: totalWeight
          }
        })
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const { razorpay_order_id, amount, key_id } = await createOrderResponse.json();

      const options = {
        key: key_id,
        amount: amount,
        currency: 'INR',
        name: storeData?.name || `Store ${sellerPhone}`,
        description: `Order from ${storeData?.name || 'Store'}`,
        order_id: razorpay_order_id,
        handler: async function (response) {
          try {
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
                order_data: {
                  ...orderData,
                  delivery_charge: deliveryCharge,
                  total_weight_kg: totalWeight
                }
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              if (!isBuyNow) {
                if (clearAllCarts) {
                  clearAllCarts();
                } else if (clearCartForSeller) {
                  clearCartForSeller(sellerPhone);
                }
              }

              toast.success(`Payment successful! Order #${verifyData.order_id} placed! 🎉`);
              router.push(`/profile/orders`);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error('❌ Payment verification failed:', verifyError);
            alert(`Payment completed but order creation failed: ${verifyError.message}`);
          }

          setSubmitting(false);
        },
        modal: {
          ondismiss: function () {
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

  // ✅ Enhanced order placement with delivery
  const handlePlaceOrder = async () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address ||
      !shippingInfo.city || !shippingInfo.pincode || !paymentMethod) {
      toast.warn('Please fill all required fields and select a payment method.');
      return;
    }

    if (paymentMethod === 'COD' && !isCODEnabled()) {
      toast.error('Cash on Delivery is not available for this store.');
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
        seller_phone: sellerPhone,
        delivery_charge: deliveryCharge, // ✅ Include delivery
        total_weight_kg: totalWeight
      };

      if (paymentMethod === 'ONLINE') {
        await handleOnlinePayment(orderData);
      } else {
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

        if (response.ok) {
          if (!isBuyNow) {
            if (clearAllCarts) {
              clearAllCarts();
            } else if (clearCartForSeller) {
              clearCartForSeller(sellerPhone);
            }
          }

          toast.success(`Order placed successfully! Order #${responseData.order_id} 🎉`);
          router.push(`/profile/orders`);
        } else {
          alert('Order failed: ' + (responseData.error || 'Unknown error'));
        }

        setSubmitting(false);
      }
    } catch (error) {
      console.error('❌ ORDER ERROR:', error);
      alert('Order failed: ' + (error.message || 'Network error'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>Loading checkout...</div>
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
            onClick={() => router.back()}
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
            Checkout {isBuyNow && '- Buy Now'}
          </h1>
        </div>

        <div className='keralasellerscheckoutlayout' style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '30px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Shipping Information Section */}
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

            {/* Payment Method Section */}
            <div style={{ backgroundColor: '#FDFFF0', color: '#1a4845', border: '1px solid #bbbbbbff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', borderRadius: '12px', padding: '30px' }}>
              <h2 className='keralasellerscheckouttitle' style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                <CreditCard size={20} />
                PAYMENT METHOD
              </h2>

              <div style={{ marginBottom: '20px' }}>
                {isCODEnabled() && (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                        <span>Cash on Delivery</span>
                        {paymentMethod === 'COD' && <CheckCircle size={16} color="#10b981" />}
                      </div>
                      <div style={{ fontSize: '12px', color: '#1a4845' }}>Pay when you receive the order</div>
                    </div>
                  </label>
                )}

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                      <span>Pay Online {!razorpayLoaded && '(Loading...)'}</span>
                      {paymentMethod === 'ONLINE' && <CheckCircle size={16} color="#10b981" />}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1a4845' }}>
                      {razorpayLoaded ? 'UPI, Card, Net Banking via Razorpay' : 'Loading payment system...'}
                    </div>
                  </div>
                </label>

                {!isCODEnabled() && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#856404',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertTriangle size={16} />
                    <span>Cash on Delivery is not available for this store.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ ENHANCED: Order Summary with Delivery */}
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
                    {item.weight_kg > 0 && ` • ${item.weight_kg}kg`}
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
              <span className='keralasellerscheckoutitemname'>{formatPrice(calculateSubtotal())}</span>
            </div>

            {/* ✅ NEW: Delivery Charge Display */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px',
              fontSize: '14px',
              padding: '12px',
              backgroundColor: calculatingDelivery ? '#f9fafb' : 'transparent',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} />
                <span>Delivery</span>
                {totalWeight > 0 && (
                  <span style={{ fontSize: '11px', color: '#666' }}>
                    ({totalWeight.toFixed(2)}kg)
                  </span>
                )}
              </div>
              <span style={{ 
                color: deliveryCharge === 0 ? '#10b981' : '#1a4845', 
                fontWeight: '600' 
              }}>
                {calculatingDelivery ? (
                  'Calculating...'
                ) : deliveryCharge === 0 ? (
                  'Free'
                ) : (
                  formatPrice(deliveryCharge)
                )}
              </span>
            </div>

            {/* ✅ NEW: Delivery Info Message */}
            {deliveryInfo && deliveryInfo.reason && (
              <div style={{
                fontSize: '12px',
                color: '#666',
                padding: '8px 12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                marginTop: '8px'
              }}>
                {deliveryInfo.reason}
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              marginTop: '16px',
              fontSize: '20px',
            }}>
              <span className='keralasellerscheckoutitemname'>Total:</span>
              <span className='keralasellerscheckoutitemname' style={{ color: 'rgb(5, 150, 105)', fontWeight: 'bold' }}>
                {formatPrice(calculateTotal())}
              </span>
            </div>

            <button
              className='keralasellerscheckoutbtn'
              onClick={handlePlaceOrder}
              disabled={submitting || cartItems.length === 0 || calculatingDelivery}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor:
                  submitting || cartItems.length === 0 || calculatingDelivery ? '#ccc' : 'rgb(16, 185, 129)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: submitting || cartItems.length === 0 || calculatingDelivery ? 'not-allowed' : 'pointer',
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
                : calculatingDelivery
                ? 'Calculating...'
                : `Place Order (${formatPrice(calculateTotal())})`}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
