'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, User, Phone, MapPin, Package, Store, AlertTriangle, CheckCircle, Shield, Truck, Weight } from 'lucide-react';
import "../../../../styles/Shopslugcheckout.css";
import SHeader from '../../../../components/common/SHeader';
import { toast } from "react-toastify";
import axios from 'axios';
import { useCart } from '../../../../app/context/CartContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in/api';

// ✅ Razorpay script loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
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

  // ✅ Cart context
  const cartContext = useCart();
  const { clearCartForSeller, clearAllCarts } = cartContext || {};
  
  const [cartItems, setCartItems] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    name: '', phone: '', address: '', city: '', pincode: ''
  });
  const [urlError, setUrlError] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBuyNow, setIsBuyNow] = useState(false);

  // ✅ Delivery calculation state
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);
  const [deliveryReason, setDeliveryReason] = useState('');
  const [calculating, setCalculating] = useState(false);

  // ✅ Check login status
  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.warn('localStorage access error:', error);
      setIsLoggedIn(false);
    }
  }, []);

  // ✅ Get store ID from URL
  const getActualStoreId = () => {
    if (shopSlug === 'undefined' || shopSlug === undefined) {
      setUrlError('Invalid shop slug in URL');
      return null;
    }

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

  // ✅ Load Razorpay script
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

  // ✅ Validate and enrich cart items with weight_kg
  const validateCartItems = async (items) => {
    console.log('🔍 Validating cart items for weight data...');
    
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        // If weight is already present and valid, return as-is
        if (item.weight_kg !== undefined && item.weight_kg !== null) {
          return item;
        }

        // Fetch product data to get weight
        try {
          console.log(`📦 Fetching weight for product ${item.id}...`);
          const response = await axios.get(`${API_BASE_URL}/api/products/${item.id}/`);
          const product = response.data;
          
          return {
            ...item,
            weight_kg: product.weight_kg || 0
          };
        } catch (error) {
          console.warn(`⚠️ Failed to fetch weight for product ${item.id}`, error);
          return {
            ...item,
            weight_kg: 0
          };
        }
      })
    );

    console.log('✅ Cart items enriched with weight data');
    return enrichedItems;
  };

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

  // ✅ NEW: Calculate delivery charge via backend API
  useEffect(() => {
    if (cartItems.length === 0 || !actualStoreId) {
      setDeliveryCharge(0);
      setSubtotal(0);
      setGrandTotal(0);
      setTotalWeight(0);
      setIsFreeDelivery(false);
      setDeliveryReason('');
      return;
    }

    const calculateDeliveryCharge = async () => {
      try {
        setCalculating(true);
        
        console.log('📊 Calculating delivery charge via backend API...');

        // Get token
        const token = localStorage.getItem('buyerAccessToken') || 
                     localStorage.getItem('access_token');

        if (!token) {
          console.warn('⚠️ No token, using fallback calculation');
          const fallbackSubtotal = cartItems.reduce((sum, item) => 
            sum + (parseFloat(item.price) * item.quantity), 0
          );
          setSubtotal(fallbackSubtotal);
          setGrandTotal(fallbackSubtotal);
          setDeliveryCharge(0);
          setIsFreeDelivery(false);
          setCalculating(false);
          return;
        }

        // ✅ Call backend API
        const response = await fetch(`${API_BASE_URL}/user/orders/calculate-checkout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            seller_phone: actualStoreId,
            items: cartItems.map(item => ({
              product_id: item.id,
              quantity: item.quantity,
              price: item.price,
              weight_kg: item.weight_kg || 0
            })),
            payment_method: paymentMethod || 'COD'
          })
        });

        const data = await response.json();

        if (data.success) {
          const deliveryAmount = parseFloat(data.delivery_charge || 0);
          const subtotalAmount = parseFloat(data.subtotal || 0);
          const totalAmount = parseFloat(data.grand_total || 0);
          const weight = parseFloat(data.total_weight_kg || 0);
          
          setSubtotal(subtotalAmount);
          setDeliveryCharge(deliveryAmount);
          setGrandTotal(totalAmount);
          setTotalWeight(weight);
          setIsFreeDelivery(data.is_free_delivery || false);
          setDeliveryReason(data.reason || '');
          
          console.log('✅ Delivery charge calculated:', {
            delivery: deliveryAmount,
            subtotal: subtotalAmount,
            total: totalAmount,
            weight: weight,
            reason: data.reason
          });
        } else {
          throw new Error(data.error || 'Calculation failed');
        }

      } catch (error) {
        console.error('❌ Delivery calculation error:', error);
        
        // Fallback calculation
        const fallbackSubtotal = cartItems.reduce((sum, item) => 
          sum + (parseFloat(item.price) * item.quantity), 0
        );
        
        const fallbackWeight = cartItems.reduce((sum, item) => 
          sum + (parseFloat(item.weight_kg || 0) * item.quantity), 0
        );
        
        setSubtotal(fallbackSubtotal);
        setGrandTotal(fallbackSubtotal);
        setDeliveryCharge(0);
        setTotalWeight(fallbackWeight);
        setIsFreeDelivery(false);
        setDeliveryReason('Unable to calculate delivery charges');
        
        toast.warning('Using estimated delivery charges', {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setCalculating(false);
      }
    };

    calculateDeliveryCharge();

  }, [cartItems, actualStoreId, paymentMethod]); // ✅ Recalculate when payment method changes

  // ✅ Generate shop URLs
  const getShopUrl = (path = '') => {
    if (!actualStoreId) {
      console.error('❌ Cannot generate URL - no store ID available');
      return '/';
    }

    if (searchParams.get('id') && shopSlug === 'new') {
      const basePath = `/shop/new${path}`;
      return `${basePath}?id=${actualStoreId}`;
    } else {
      return `/shop/${actualStoreId}${path}`;
    }
  };

  // ✅ Check authentication
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

  // ✅ REDIRECT: If invalid URL
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

  // ✅ Fetch single product for Buy Now
  const fetchSingleProduct = async (productId, quantity, sellerPhone, token) => {
    try {
      console.log('🛒 Fetching product for Buy Now:', productId);
      
      const productResponse = await axios.get(`${API_BASE_URL}/api/products/${productId}/`);
      const product = productResponse.data;

      console.log('✅ Product fetched:', product.name);

      setCartItems([{
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        weight_kg: product.weight_kg || 0,
        image: product.cloudinary_url || product.main_image_url,
        store: product.store
      }]);

      console.log('✅ Buy Now cart item set');
    } catch (error) {
      console.error('❌ Failed to fetch product:', error);
      toast.error('Failed to load product details', {
        position: "top-right",
        autoClose: 3000,
      });
      router.push(getShopUrl());
    }
  };

  // ✅ Load store and profile data
  const loadStoreAndProfile = async (sellerPhone, headers) => {
    try {
      const [storeRes, profileRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/shop/${sellerPhone}/`),
        fetch(`${API_BASE_URL}/api/buyer/profile/`, { headers })
      ]);

      if (storeRes.status === 'fulfilled' && storeRes.value.ok) {
        const storeResData = await storeRes.value.json();
        const store = storeResData.store || storeResData;
        setStoreData(store);
        
        console.log('✅ Store data loaded:', {
          name: store.name,
          accepts_cod: store.accepts_cod,
          payment_method: store.payment_method
        });
      } else {
        console.warn('⚠️ Store API failed, using fallback');
        setStoreData({
          name: `Store ${sellerPhone}`,
          seller_phone: sellerPhone,
          id: sellerPhone,
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
        console.log('✅ Profile data loaded');
      }
    } catch (error) {
      console.error('❌ Failed to load store/profile data:', error);
    }
  };

  // ✅ MAIN CHECKOUT INITIALIZATION WITH BUY NOW SUPPORT
  useEffect(() => {
    const initializeCheckout = async () => {
      const headers = checkAuth();
      if (!headers || !actualStoreId) return;

      console.log('📦 Initializing checkout for store:', actualStoreId);

      const buyNow = searchParams.get('buyNow') === '1';
      const productId = searchParams.get('productId');
      const quantity = parseInt(searchParams.get('quantity') || '1');

      console.log('🔍 Checkout params:', { buyNow, productId, quantity });

      if (buyNow && productId) {
        console.log('🛒 Buy Now mode detected');
        setIsBuyNow(true);
        
        await fetchSingleProduct(productId, quantity, actualStoreId, headers['Authorization'].split(' ')[1]);
        await loadStoreAndProfile(actualStoreId, headers);
        
        setLoading(false);
        return;
      }

      const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
      const storeCart = multiCarts[actualStoreId] || [];

      console.log('📦 Raw cart items:', storeCart);

      if (storeCart.length === 0) {
        console.warn('⚠️ No items in cart, redirecting to cart page');
        router.push(getShopUrl('/cart'));
        return;
      }

      // ✅ VALIDATE AND ENRICH CART ITEMS
      const enrichedCart = await validateCartItems(storeCart);
      console.log('📦 Enriched cart items:', enrichedCart);

      setCartItems(enrichedCart);
      await loadStoreAndProfile(actualStoreId, headers);
      setLoading(false);
    };

    if (actualStoreId && !urlError) {
      initializeCheckout();
    }
  }, [actualStoreId, searchParams]);

  // ✅ Check if COD is enabled for this store
  const isCODEnabled = () => {
    if (!storeData) {
      console.log('⚠️ No store data - COD disabled');
      return false;
    }
    
    const enabled = storeData.accepts_cod === true;
    console.log('🔍 COD Check:', { accepts_cod: storeData.accepts_cod, enabled });
    return enabled;
  };

  // ✅ Form validation
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

  // ✅ Price formatting
  const formatPrice = (price) => `₹${parseFloat(price).toFixed(2)}`;

  // ✅ Handle online payment
  const handleOnlinePayment = async (orderData) => {
    if (!razorpayLoaded) {
      alert('Payment system not loaded. Please refresh and try again.');
      return false;
    }

    try {
      console.log('💳 Starting online payment flow...');

      const headers = checkAuth();
      if (!headers) return false;

      const createOrderResponse = await fetch(`${API_BASE_URL}/user/orders/create-razorpay-order/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: grandTotal,
          order_data: orderData
        })
      });

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const { razorpay_order_id, amount, key_id } = await createOrderResponse.json();

      console.log('✅ Razorpay order created:', razorpay_order_id);

      if (!key_id) {
        throw new Error('Payment key not received from server');
      }

      const options = {
        key: key_id,
        amount: amount,
        currency: 'INR',
        name: storeData?.name || `Store ${actualStoreId}`,
        description: `Order from ${storeData?.name || 'Store'}`,
        order_id: razorpay_order_id,
        handler: async function (response) {
          console.log('💳 Payment completed, verifying...');

          try {
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
              // ✅ Clear cart via context
              if (!isBuyNow) {
                if (clearAllCarts) {
                  clearAllCarts();
                } else if (clearCartForSeller) {
                  clearCartForSeller(actualStoreId);
                } else {
                  // Fallback to localStorage
                  const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
                  delete multiCarts[actualStoreId];
                  localStorage.setItem('multiCarts', JSON.stringify(multiCarts));
                }
              }

              console.log('✅ Payment verified and order created');
              toast.success(`Payment successful! Order #${verifyData.order_id} placed successfully! 🎉`, {
                position: 'top-center',
                autoClose: 3000,
              });

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
          color: '#1a4845'
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

  // ✅ Handle order placement
  const handlePlaceOrder = async () => {
    console.log('🔄 Placing order...');

    if (!validateForm()) {
      toast.warning('Please fill in all required fields correctly', {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
      return;
    }

    if (paymentMethod === 'COD' && !isCODEnabled()) {
      toast.error('Cash on Delivery is not available for this store. Please choose online payment.', {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
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
        const paymentSuccess = await handleOnlinePayment(orderData);
        if (!paymentSuccess) {
          setSubmitting(false);
        }
      } else {
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
          // ✅ Clear cart via context
          if (!isBuyNow) {
            if (clearAllCarts) {
              clearAllCarts();
            } else if (clearCartForSeller) {
              clearCartForSeller(actualStoreId);
            } else {
              // Fallback to localStorage
              const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
              delete multiCarts[actualStoreId];
              localStorage.setItem('multiCarts', JSON.stringify(multiCarts));
            }
          }

          console.log('✅ COD Order placed successfully:', responseData);
          toast.success(`Order placed successfully! Order #${responseData.order_id} 🎉`, {
            position: 'top-center',
            autoClose: 3000,
          });
          
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

  const handleInputChange = (field, value) => {
    setShippingInfo({ ...shippingInfo, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  if (loading || urlError) {
    return (
      <div style={styles.loadingContainer}>
        {urlError ? (
          <>
            <AlertTriangle size={48} color="#ef4444" />
            <h2>Invalid Checkout URL</h2>
            <p>{urlError}</p>
            <p>Redirecting...</p>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <p>Loading checkout...</p>
            {isBuyNow && <p style={{ fontSize: '12px', color: '#666' }}>Buy Now Mode</p>}
          </>
        )}
      </div>
    );
  }

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
    <div style={styles.pageContainer}>
      <SHeader store={storeData} isLoggedIn={isLoggedIn} />
      
      <div className='shopslugcheckoutcontainer' style={styles.container}>
        <div className='shopslugcheckoutstoreindicator' style={styles.storeIndicator}>
          <button onClick={handleBackClick} style={styles.backButton}>
            <ArrowLeft size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={16} />
            <span>
              {isBuyNow ? 'Buy Now - ' : ''}Placing order {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className='shopslugcheckoutlayout' style={styles.checkoutLayout}>
          <div style={styles.formSection}>
            <div style={styles.section}>
              <h2 className='shopslugcheckouttitle' style={styles.sectionTitle}>
                <User size={20} />
                SHIPPING INFORMATION
              </h2>

              <div style={styles.inputGroup}>
                <input
                  className='shopslugckeckoutinputsize'
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
                <input
                  type="tel"
                  className='shopslugckeckoutinputsize'
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
                <textarea
                  value={shippingInfo.address}
                  className='shopslugckeckoutinputsize'
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
                  <input
                    type="text"
                    className='shopslugckeckoutinputsize'
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
                  <input
                    type="text"
                    className='shopslugckeckoutinputsize'
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
              <h2 className='shopslugcheckouttitle' style={styles.sectionTitle}>
                <CreditCard size={20} />
                PAYMENT METHOD
              </h2>

              <div style={styles.paymentOptions}>
                {isCODEnabled() && (
                  <label
                    className='shopslugcheckoutpayment'
                    style={{
                      ...styles.paymentOption,
                      backgroundColor: paymentMethod === 'COD' ? '#0e451e25' : 'transparent',
                      borderColor: paymentMethod === 'COD' ? '#1a484571' : '#e5e7eb'
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
                      <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Cash on Delivery
                        {paymentMethod === 'COD' && <CheckCircle size={16} color="#10b981" />}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Pay when you receive the order</div>
                    </div>
                  </label>
                )}

                <label
                  className='shopslugcheckoutpayment'
                  style={{
                    ...styles.paymentOption,
                    backgroundColor: paymentMethod === 'ONLINE' ? '#0e451e25' : 'transparent',
                    borderColor: paymentMethod === 'ONLINE' ? '#1a4845' : '#e5e7eb',
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
                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Pay Online
                      {razorpayLoaded ? <CheckCircle size={16} color="#10b981" /> : <div style={styles.miniSpinner}></div>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
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
                    <span>Cash on Delivery is not available for this store. Please use online payment.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={styles.summarySection}>
            <h2 className='shopslugcheckouttitle' style={styles.sectionTitle}>ORDER SUMMARY</h2>
            <div style={styles.storeInfo}>
              <strong>{storeData?.name || `Store ${actualStoreId}`}</strong>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Store ID: {actualStoreId}
              </div>
            </div>

            <div style={styles.itemsList}>
              {cartItems.map(item => (
                <div key={item.id} style={styles.summaryItem}>
                  <div style={styles.itemLeft}>
                    <div className='shopslugcheckoutitemname' style={styles.itemName}>{item.name}</div>
                    <div style={styles.itemDetails}>
                      {formatPrice(item.price)} × {item.quantity}
                      {item.weight_kg > 0 && (
                        <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                          • {item.weight_kg}kg
                        </span>
                      )}
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
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {/* ✅ NEW: Delivery Charge Row */}
              <div style={styles.subtotalRow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={16} />
                    Delivery
                    {totalWeight > 0 && (
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        ({totalWeight.toFixed(2)}kg)
                      </span>
                    )}
                  </span>
                  {deliveryReason && (
                    <span style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic' }}>
                      {deliveryReason}
                    </span>
                  )}
                </div>
                {calculating ? (
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>Calculating...</span>
                ) : isFreeDelivery ? (
                  <span style={{ color: '#10b981', fontWeight: '700' }}>FREE</span>
                ) : (
                  <span>{formatPrice(deliveryCharge)}</span>
                )}
              </div>

              <div style={styles.totalRow}>
                <span>Total:</span>
                <span className='shopslugcheckoutitemname' style={styles.totalAmount}>
                  {calculating ? 'Calculating...' : formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <button
              className='shopslugcheckoutbtn'
              onClick={handlePlaceOrder}
              disabled={submitting || cartItems.length === 0 || calculating}
              style={{
                ...styles.placeOrderButton,
                backgroundColor: (submitting || cartItems.length === 0 || calculating) ? '#ccc' : '#10b981',
                cursor: (submitting || cartItems.length === 0 || calculating) ? 'not-allowed' : 'pointer'
              }}
            >
              <CreditCard size={18} />
              {calculating ? (
                'Calculating...'
              ) : submitting ? (
                paymentMethod === 'ONLINE' ? 'Processing Payment...' : 'Placing Order...'
              ) : (
                `Place Order (${formatPrice(grandTotal)})`
              )}
            </button>

            {paymentMethod === 'ONLINE' && (
              <div style={styles.securityNotice}>
                <Shield size={14} />
                <span>Payments are secured by Razorpay</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { backgroundColor: '#FDFFF0' },
  container: {
    minHeight: '100vh',
    backgroundColor: '#FDFFF0',
    padding: '100px 20px 20px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
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
  backButton: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#1a4845', padding: '8px', borderRadius: '6px'
  },
  storeIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0e451e25',
    border: '1px solid #0e451e25',
    borderRadius: '8px',
    padding: '12px 16px',
    marginTop: '50px',
    marginBottom: '30px',
    fontSize: '14px',
    color: '#1a4845',
    fontWeight: '500'
  },
  checkoutLayout: {
    display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', backgroundColor: "#FDFFF0",
  },
  formSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
  section: {
    backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)', border: '1px solid #bbbbbbff'
  },
  sectionTitle: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '18px', fontWeight: '600', color: '#1a4845', marginBottom: '20px'
  },
  inputGroup: { marginBottom: '16px', },
  inputRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', },
  input: {
    width: '100%', padding: '12px 16px', border: '1px solid',
    borderRadius: '8px', fontSize: '16px', transition: 'border-color 0.2s',
    boxSizing: 'border-box', backgroundColor: '#FDFFF0'
  },
  textarea: {
    width: '100%', padding: '12px 16px', border: '1px solid',
    borderRadius: '8px', fontSize: '16px', resize: 'vertical', minHeight: '80px',
    boxSizing: 'border-box', backgroundColor: '#FDFFF0'
  },
  errorText: {
    fontSize: '12px', color: '#ef4444', marginTop: '4px', fontWeight: '500'
  },
  paymentOptions: { display: 'flex', flexDirection: 'column', gap: '12px' },
  paymentOption: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    padding: '16px', border: '1px solid', borderRadius: '8px',
    cursor: 'pointer', transition: 'all 0.2s'
  },
  radio: { marginTop: '2px', accentColor: '#1a4845', },
  summarySection: {
    backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)', border: '1px solid #bbbbbbff',
    height: 'fit-content'
  },
  storeInfo: {
    padding: '16px', backgroundColor: '#0e451e25',
    border: '1px solid #0e451e25', borderRadius: '8px',
    marginBottom: '20px', textAlign: 'center'
  },
  itemsList: { marginBottom: '20px' },
  summaryItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '12px 0', borderBottom: '1px solid #f3f4f6'
  },
  itemLeft: { flex: 1 },
  itemName: { fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' },
  itemDetails: { fontSize: '12px', color: '#6b7280' },
  itemTotal: { fontSize: '14px', fontWeight: '600', color: '#1f2937' },
  totalSection: {
    marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb'
  },
  subtotalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
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
};
