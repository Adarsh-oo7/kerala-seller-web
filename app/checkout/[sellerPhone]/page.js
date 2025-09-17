'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { 
  ShoppingCart, 
  CreditCard, 
  User, 
  Phone, 
  Home, 
  Truck, 
  MapPin, 
  AlertCircle, 
  Wallet, 
  Landmark,
  RefreshCw,
  Check,
  Lock,
  Globe,
  Store
} from 'lucide-react';

// ✅ Enhanced API base URL function
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  return 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const PROFILE_API = `${API_BASE_URL}/api/buyer/profile/`;
const CREATE_ORDER_API = `${API_BASE_URL}/user/orders/create-order/`; 
const STORE_API_URL = `${API_BASE_URL}/shop/`;
const CREATE_PAYMENT_ORDER_API = `${API_BASE_URL}/user/orders/create-payment-order/`;
const VERIFY_PAYMENT_API = `${API_BASE_URL}/user/orders/verify-payment/`;

// ✅ Environment variable for Razorpay Key
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RClyCqWG0I7Frn';

console.log('🌐 Checkout API URLs configured:', { 
  API_BASE_URL, 
  RAZORPAY_KEY_ID: RAZORPAY_KEY_ID.substring(0, 10) + '...' 
});

export default function CheckoutPage() {
    const [buyerProfile, setBuyerProfile] = useState(null);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({ 
      name: '', 
      phone: '', 
      address: '', 
      city: '', 
      pincode: '' 
    });
    const [cartItems, setCartItems] = useState([]);
    const [store, setStore] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [stockValidation, setStockValidation] = useState({ valid: true, errors: [], warnings: [] });
    const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });

    const params = useParams();
    const router = useRouter();
    const { sellerPhone } = params;
    const { getCartBySeller, clearCartForSeller, validateCartStock } = useCart();

    // ✅ Get current store info from URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
            setCurrentStoreInfo({
                storeId: storeMatch ? storeMatch[1] : null,
                isInStore: !!storeMatch
            });
        }
    }, []);

    // ✅ Enhanced token handling - check both possible keys
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');
        if (!token) {
            console.log('🔐 No auth token found, redirecting to login');
            const redirectUrl = currentStoreInfo.isInStore && currentStoreInfo.storeId 
              ? `/store/${currentStoreInfo.storeId}/login?redirect=/checkout/${sellerPhone}`
              : `/login/buyer?redirect=/checkout/${sellerPhone}`;
            router.push(redirectUrl);
            return null;
        }
        console.log('🔍 Using auth token:', token.substring(0, 30) + '...');
        return { 'Authorization': `Bearer ${token}` };
    }, [router, sellerPhone, currentStoreInfo]);

    // ✅ Enhanced cart validation
    useEffect(() => {
        const items = getCartBySeller(sellerPhone);
        if (items && items.length > 0) {
            const validation = validateCartStock(sellerPhone);
            setStockValidation(validation);
            console.log('📊 Checkout cart validation:', validation);
        }
    }, [sellerPhone, getCartBySeller, validateCartStock]);

    useEffect(() => {
        const headers = getAuthHeaders();
        if (!headers) return;

        const items = getCartBySeller(sellerPhone);
        if (!items || items.length === 0) {
            console.log('🛒 No cart items found, redirecting to shop');
            const shopUrl = currentStoreInfo.isInStore && currentStoreInfo.storeId
              ? `/store/${currentStoreInfo.storeId}`
              : `/shop/${sellerPhone}`;
            router.push(shopUrl);
            return;
        }
        
        console.log('🛒 Found cart items:', items.length);
        setCartItems(items);

        Promise.all([
            axios.get(PROFILE_API, { headers, timeout: 15000 }),
            axios.get(`${STORE_API_URL}${sellerPhone}/`, { timeout: 10000 })
        ]).then(([profileRes, storeRes]) => {
            console.log('✅ Profile data received:', profileRes.data);
            console.log('✅ Store data received:', storeRes.data);
            
            const data = profileRes.data;
            setBuyerProfile(data);
            
            // Handle different store response structures
            const storeData = storeRes.data.store || storeRes.data;
            setStore(storeData);

            // ✅ Enhanced profile completion check
            const isComplete = Boolean(
                data.full_name?.trim() && 
                data.phone_number?.trim() && 
                data.address_line_1?.trim() && 
                data.city?.trim() && 
                data.pincode?.trim()
            );
            
            setIsProfileComplete(isComplete);
            
            if (isComplete) {
                const fullAddress = [data.address_line_1, data.address_line_2]
                  .filter(Boolean)
                  .join(', ');
                  
                setShippingInfo({
                    name: data.full_name.trim(),
                    phone: data.phone_number.trim(),
                    address: fullAddress,
                    city: data.city.trim(),
                    pincode: data.pincode.trim()
                });
                
                console.log('✅ Profile is complete, pre-filled shipping info');
            } else {
                console.log('⚠️ Profile incomplete:', {
                    hasName: !!data.full_name?.trim(),
                    hasPhone: !!data.phone_number?.trim(),
                    hasAddress: !!data.address_line_1?.trim(),
                    hasCity: !!data.city?.trim(),
                    hasPincode: !!data.pincode?.trim()
                });
            }
            
        }).catch(err => {
            console.error("❌ Failed to load checkout data:", err);
            if (err.response?.status === 401) {
                console.log('🔐 Auth error, clearing tokens');
                localStorage.removeItem('access_token');
                localStorage.removeItem('buyerAccessToken');
                router.push('/login/buyer');
            } else {
                setErrors({ general: 'Failed to load checkout information. Please refresh and try again.' });
            }
        }).finally(() => {
            setIsLoading(false);
        });
    }, [sellerPhone, getCartBySeller, getAuthHeaders, router, currentStoreInfo]);
    
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // ✅ Enhanced form validation
    const validateForm = () => {
        const newErrors = {};
        
        if (!shippingInfo.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (shippingInfo.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        const phonePattern = /^[6-9]\d{9}$/;
        if (!shippingInfo.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phonePattern.test(shippingInfo.phone.trim())) {
            newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
        }
        
        if (!shippingInfo.address.trim()) {
            newErrors.address = 'Address is required';
        } else if (shippingInfo.address.trim().length < 10) {
            newErrors.address = 'Please provide a complete address';
        }
        
        if (!shippingInfo.city.trim()) {
            newErrors.city = 'City is required';
        } else if (shippingInfo.city.trim().length < 2) {
            newErrors.city = 'Please enter a valid city name';
        }
        
        const pincodePattern = /^\d{6}$/;
        if (!shippingInfo.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!pincodePattern.test(shippingInfo.pincode.trim())) {
            newErrors.pincode = 'Please enter a valid 6-digit pincode';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setShippingInfo(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: '' }));
        }
    };

    // ✅ Enhanced order placement with comprehensive error handling
    const handlePlaceOrder = async () => {
        console.log('🔍 Starting order placement process...');
        
        // Validate stock first
        if (!stockValidation.valid) {
            alert('Some items in your cart have stock issues. Please review your cart before proceeding.');
            return;
        }
        
        if (!validateForm()) {
            alert('Please fill all required fields correctly.');
            return;
        }
        
        if (!selectedPaymentMethod) {
            alert('Please select a payment method.');
            return;
        }
        
        const headers = getAuthHeaders();
        if (!headers) return;
        
        setIsSubmitting(true);
        setErrors({});
        
        console.log('🔍 Placing order with:', {
            paymentMethod: selectedPaymentMethod,
            totalAmount: calculateTotal(),
            itemsCount: cartItems.length
        });
        
        const finalAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.pincode}`;
        const orderData = {
            customer_name: shippingInfo.name.trim(),
            customer_phone: shippingInfo.phone.trim(),
            shipping_address: finalAddress,
            items: cartItems.map(item => ({ 
                id: item.id, 
                quantity: item.quantity,
                name: item.name, // For logging
                price: item.price // For logging
            })),
            payment_method: selectedPaymentMethod,
        };

        if (selectedPaymentMethod === 'COD') {
            // ✅ Cash on Delivery flow
            try {
                console.log('🔍 Creating COD order...');
                const response = await axios.post(CREATE_ORDER_API, orderData, { 
                    headers,
                    timeout: 15000
                });
                
                console.log('✅ COD order created:', response.data);
                
                // Clear cart and redirect
                clearCartForSeller(sellerPhone);
                
                const orderConfirmUrl = currentStoreInfo.isInStore && currentStoreInfo.storeId
                  ? `/store/${currentStoreInfo.storeId}/order-confirmation/${response.data.order_id}`
                  : `/order-confirmation/${response.data.order_id}`;
                  
                router.push(orderConfirmUrl);
                
            } catch (error) {
                console.error('❌ COD order error:', error);
                const errorMessage = error.response?.data?.error || 
                                   error.response?.data?.message ||
                                   'Failed to place order. Please try again.';
                setErrors({ general: errorMessage });
                alert(`Error placing order: ${errorMessage}`);
            } finally {
                setIsSubmitting(false);
            }
            
        } else if (selectedPaymentMethod === 'ONLINE') {
            // ✅ Enhanced online payment flow
            try {
                console.log('🔍 Creating online payment order...');
                
                // Step 1: Create order first (before payment)
                const orderResponse = await axios.post(CREATE_ORDER_API, orderData, { 
                    headers,
                    timeout: 15000
                });
                const orderId = orderResponse.data.order_id;
                console.log('✅ Order created:', orderId);
                
                // Step 2: Create Razorpay payment order
                const paymentOrderRes = await axios.post(CREATE_PAYMENT_ORDER_API, { 
                    amount: calculateTotal(),
                    order_id: orderId // Pass our order ID for reference
                }, { 
                    headers,
                    timeout: 15000
                });
                
                const { order_id: razorpayOrderId, amount } = paymentOrderRes.data;
                console.log('✅ Razorpay order created:', { razorpayOrderId, amount });
                
                // ✅ Enhanced Razorpay availability check
                if (typeof window === 'undefined' || !window.Razorpay) {
                    console.error('❌ Razorpay not available');
                    setErrors({ general: 'Payment service is not available. Please try again later or use Cash on Delivery.' });
                    setIsSubmitting(false);
                    return;
                }
                
                // ✅ Enhanced Razorpay options
                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount,
                    order_id: razorpayOrderId,
                    name: "Kerala Sellers",
                    description: `Order from ${store?.name || 'Store'}`,
                    image: '/favicon.ico', // Add your logo
                    currency: 'INR',
                    handler: async function (response) {
                        try {
                            console.log('🔍 Payment successful, verifying...', {
                                payment_id: response.razorpay_payment_id,
                                order_id: response.razorpay_order_id
                            });
                            
                            // Step 3: Verify payment and update order status
                            const verificationData = {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                order_id: orderId // Include our order ID
                            };

                            const verifyResponse = await axios.post(VERIFY_PAYMENT_API, verificationData, { 
                                headers,
                                timeout: 20000
                            });
                            
                            console.log('✅ Payment verified:', verifyResponse.data);
                            
                            // Payment verified successfully - clear cart and redirect
                            clearCartForSeller(sellerPhone);
                            
                            const orderConfirmUrl = currentStoreInfo.isInStore && currentStoreInfo.storeId
                              ? `/store/${currentStoreInfo.storeId}/order-confirmation/${orderId}`
                              : `/order-confirmation/${orderId}`;
                              
                            router.push(orderConfirmUrl);
                            
                        } catch (verificationError) {
                            console.error('❌ Payment verification failed:', verificationError);
                            const errorMessage = verificationError.response?.data?.message || 
                                               'Payment verification failed';
                            setErrors({ 
                                general: `${errorMessage}. Please contact support with your payment ID: ${response.razorpay_payment_id}` 
                            });
                            alert(`Payment verification failed. Please contact support with your payment ID: ${response.razorpay_payment_id}`);
                            setIsSubmitting(false);
                        }
                    },
                    prefill: { 
                        name: buyerProfile?.full_name || shippingInfo.name, 
                        email: buyerProfile?.email || '', 
                        contact: buyerProfile?.phone_number || shippingInfo.phone
                    },
                    modal: { 
                        ondismiss: () => {
                            console.log('🔄 Payment modal closed by user');
                            setIsSubmitting(false);
                            setErrors({ general: 'Payment was cancelled. You can try again or use Cash on Delivery.' });
                        }
                    },
                    theme: {
                        color: "#28a745"
                    },
                    notes: {
                        order_id: orderId,
                        seller_phone: sellerPhone,
                        store_name: store?.name || 'Unknown Store'
                    },
                    retry: {
                        enabled: true,
                        max_count: 3
                    },
                    timeout: 300 // 5 minutes timeout
                };
                
                const rzp = new window.Razorpay(options);
                
                rzp.on('payment.failed', function (response) {
                    console.error('❌ Payment failed:', response.error);
                    const reason = response.error.reason || response.error.description || 'Unknown error';
                    setErrors({ general: `Payment failed: ${reason}. Please try again or use Cash on Delivery.` });
                    alert(`Payment failed: ${reason}`);
                    setIsSubmitting(false);
                });
                
                console.log('🔍 Opening Razorpay payment modal...');
                rzp.open();
                
            } catch (error) {
                console.error('❌ Online payment error:', error);
                const errorMessage = error.response?.data?.error || 
                                   error.response?.data?.message ||
                                   'Could not initiate online payment. Please try again.';
                setErrors({ general: errorMessage });
                alert(`Could not initiate online payment: ${errorMessage}`);
                setIsSubmitting(false);
            }
        }
    };

    // ✅ Loading state
    if (isLoading) {
        return (
            <div>
                <Header />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading checkout...</p>
                    <p style={styles.loadingSubtext}>🌐 Connected to: {API_BASE_URL}</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <Header />
            
            <div style={styles.container}>
                {/* ✅ Store context indicator */}
                {currentStoreInfo.isInStore && (
                    <div style={styles.storeIndicator}>
                        <Globe size={16} />
                        <span>Checkout from store context • Store ID: {currentStoreInfo.storeId}</span>
                    </div>
                )}
                
                <h1 style={styles.title}>Checkout</h1>
                
                {/* ✅ General error display */}
                {errors.general && (
                    <div style={styles.generalError}>
                        <AlertCircle size={20} />
                        <span>{errors.general}</span>
                        <button 
                            onClick={() => setErrors(prev => ({ ...prev, general: '' }))}
                            style={styles.dismissError}
                        >
                            ×
                        </button>
                    </div>
                )}
                
                {/* ✅ Stock validation warnings */}
                {!stockValidation.valid && (
                    <div style={styles.stockValidationError}>
                        <AlertCircle size={20} />
                        <div>
                            <strong>Cart Issues Found:</strong>
                            <ul style={styles.errorList}>
                                {stockValidation.errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                            <Link href={`/cart/${sellerPhone}`} style={styles.reviewCartButton}>
                                Review Cart
                            </Link>
                        </div>
                    </div>
                )}
                
                {!isProfileComplete ? (
                    <div style={styles.noticeCard}>
                        <AlertCircle size={24} style={{ color: '#f59e0b' }} />
                        <div>
                            <h3 style={styles.noticeTitle}>Complete Your Profile</h3>
                            <p style={styles.noticeText}>
                                Your shipping address is incomplete. Please update your profile before proceeding.
                            </p>
                            <Link 
                                href={currentStoreInfo.isInStore ? `/store/${currentStoreInfo.storeId}/profile` : "/profile"} 
                                style={styles.noticeButton}
                            >
                                Go to My Profile
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={styles.storeInfo}>
                            <Store size={18} />
                            <span>You are ordering from: <strong>{store?.name || 'Store'}</strong></span>
                        </div>
                        
                        <div style={styles.checkoutLayout}>
                            <div style={styles.formSection}>
                                <h2 style={styles.sectionTitle}>
                                    <Truck size={20} /> 
                                    Shipping Information
                                </h2>
                                
                                {/* Shipping Form Inputs */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <User size={16} /> Full Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={shippingInfo.name} 
                                        onChange={e => handleInputChange('name', e.target.value)} 
                                        style={{...styles.input, ...(errors.name && styles.inputError)}} 
                                        placeholder="Enter your full name"
                                        disabled={isSubmitting}
                                    />
                                    {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <Phone size={16} /> Phone Number *
                                    </label>
                                    <input 
                                        type="tel" 
                                        value={shippingInfo.phone} 
                                        onChange={e => handleInputChange('phone', e.target.value)} 
                                        style={{...styles.input, ...(errors.phone && styles.inputError)}} 
                                        placeholder="Enter 10-digit phone number"
                                        maxLength={10}
                                        disabled={isSubmitting}
                                    />
                                    {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <Home size={16} /> Address *
                                    </label>
                                    <textarea 
                                        value={shippingInfo.address} 
                                        onChange={e => handleInputChange('address', e.target.value)} 
                                        style={{...styles.textarea, ...(errors.address && styles.inputError)}} 
                                        rows={3}
                                        placeholder="Enter your complete address with landmarks"
                                        disabled={isSubmitting}
                                    />
                                    {errors.address && <span style={styles.errorText}>{errors.address}</span>}
                                </div>

                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>
                                            <MapPin size={16} /> City *
                                        </label>
                                        <input 
                                            type="text" 
                                            value={shippingInfo.city} 
                                            onChange={e => handleInputChange('city', e.target.value)} 
                                            style={{...styles.input, ...(errors.city && styles.inputError)}} 
                                            placeholder="Enter city"
                                            disabled={isSubmitting}
                                        />
                                        {errors.city && <span style={styles.errorText}>{errors.city}</span>}
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Pincode *</label>
                                        <input 
                                            type="text" 
                                            value={shippingInfo.pincode} 
                                            onChange={e => handleInputChange('pincode', e.target.value)} 
                                            style={{...styles.input, ...(errors.pincode && styles.inputError)}} 
                                            maxLength={6}
                                            placeholder="6-digit pincode"
                                            disabled={isSubmitting}
                                        />
                                        {errors.pincode && <span style={styles.errorText}>{errors.pincode}</span>}
                                    </div>
                                </div>

                                <hr style={styles.hr} />

                                <h2 style={styles.sectionTitle}>
                                    <CreditCard size={20} /> Payment Method
                                </h2>
                                
                                <div style={styles.paymentOptions}>
                                    {/* Online Payment Option */}
                                    {store?.payment_method !== 'NONE' && (
                                        <button 
                                            style={selectedPaymentMethod === 'ONLINE' ? styles.paymentOptionSelected : styles.paymentOption}
                                            onClick={() => setSelectedPaymentMethod('ONLINE')}
                                            disabled={isSubmitting}
                                        >
                                            <div style={styles.paymentOptionContent}>
                                                <div style={styles.paymentOptionHeader}>
                                                    <CreditCard size={18}/>
                                                    <span>Pay Online</span>
                                                    {selectedPaymentMethod === 'ONLINE' && <Check size={16} color="#0d6efd" />}
                                                </div>
                                                <div style={styles.paymentOptionDesc}>
                                                    UPI, Credit/Debit Cards, Net Banking
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                    
                                    {/* Cash on Delivery Option */}
                                    {store?.accepts_cod && (
                                        <button 
                                            style={selectedPaymentMethod === 'COD' ? styles.paymentOptionSelected : styles.paymentOption}
                                            onClick={() => setSelectedPaymentMethod('COD')}
                                            disabled={isSubmitting}
                                        >
                                            <div style={styles.paymentOptionContent}>
                                                <div style={styles.paymentOptionHeader}>
                                                    <Wallet size={18}/>
                                                    <span>Cash on Delivery</span>
                                                    {selectedPaymentMethod === 'COD' && <Check size={16} color="#0d6efd" />}
                                                </div>
                                                <div style={styles.paymentOptionDesc}>
                                                    Pay when you receive your order
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {/* Security badges */}
                                <div style={styles.securityBadges}>
                                    <div style={styles.securityBadge}>
                                        <Lock size={16} />
                                        <span>Secure Checkout</span>
                                    </div>
                                    <div style={styles.securityBadge}>
                                        <Check size={16} />
                                        <span>Verified Seller</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div style={styles.summarySection}>
                                <h2 style={styles.sectionTitle}>
                                    <ShoppingCart size={20} /> Order Summary
                                </h2>
                                
                                <div style={styles.orderItems}>
                                    {cartItems.map(item => (
                                        <div key={item.id} style={styles.summaryItem}>
                                            <img 
                                                src={item.main_image_url || item.image_url || '/placeholder.svg'} 
                                                alt={item.name}
                                                style={styles.itemThumbnail}
                                                onError={(e) => e.target.src = '/placeholder.svg'}
                                            />
                                            <div style={styles.itemDetails}>
                                                <span style={styles.itemName}>{item.name}</span>
                                                <span style={styles.itemQuantity}>Qty: {item.quantity}</span>
                                                <span style={styles.itemUnitPrice}>₹{item.price.toFixed(2)} each</span>
                                            </div>
                                            <span style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <hr style={styles.divider} />
                                
                                <div style={styles.summaryRow}>
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>₹{calculateTotal().toFixed(2)}</span>
                                </div>
                                
                                <div style={styles.summaryRow}>
                                    <span>Shipping</span>
                                    <span style={styles.freeShipping}>Free</span>
                                </div>
                                
                                <div style={styles.summaryRow}>
                                    <span>Tax</span>
                                    <span>Included</span>
                                </div>
                                
                                <hr style={styles.divider} />
                                
                                <div style={{...styles.summaryRow, ...styles.totalRow}}>
                                    <strong>Total Amount:</strong>
                                    <strong>₹{calculateTotal().toFixed(2)}</strong>
                                </div>
                                
                                <button 
                                    onClick={handlePlaceOrder} 
                                    disabled={isSubmitting || cartItems.length === 0 || !stockValidation.valid} 
                                    style={{
                                        ...styles.checkoutButton, 
                                        ...(isSubmitting && styles.disabledButton)
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw size={18} style={{animation: 'spin 1s linear infinite'}} />
                                            Processing...
                                        </>
                                    ) : (
                                        selectedPaymentMethod === 'ONLINE' ? 'Proceed to Pay' : 'Place Order'
                                    )}
                                </button>
                                
                                {selectedPaymentMethod === 'ONLINE' && (
                                    <div style={styles.paymentNote}>
                                        <Lock size={14} />
                                        <span>Your payment is secured by Razorpay</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Footer />

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .input:focus, .textarea:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .payment-option:hover:not(:disabled) {
                    border-color: #3b82f6;
                    background-color: #f8fafc;
                }
                
                .checkout-button:hover:not(:disabled) {
                    background-color: #218838;
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
}

// ✅ Enhanced styles with new components
const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
    },
    
    container: { 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '20px',
        animation: 'fadeIn 0.6s ease-out'
    },
    
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '16px'
    },
    
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    
    loadingSubtext: {
        fontSize: '0.9rem',
        color: '#666',
        margin: 0
    },

    // ✅ Store context indicator
    storeIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#dbeafe',
        border: '1px solid #3b82f6',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e40af',
        fontWeight: '500',
        marginBottom: '20px'
    },

    // ✅ General error display
    generalError: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b',
        marginBottom: '20px'
    },

    dismissError: {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#991b1b'
    },

    // ✅ Stock validation error
    stockValidationError: {
        display: 'flex',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b',
        marginBottom: '20px'
    },

    errorList: {
        margin: '8px 0',
        paddingLeft: '20px'
    },

    reviewCartButton: {
        display: 'inline-block',
        marginTop: '8px',
        padding: '6px 12px',
        backgroundColor: '#dc2626',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '0.9rem'
    },

    // ✅ Store info section
    storeInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        textAlign: 'center',
        color: '#6c757d',
        marginBottom: '2rem',
        fontSize: '1.1rem',
        justifyContent: 'center'
    },
    
    title: { 
        textAlign: 'center', 
        marginBottom: '1rem', 
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1e293b'
    },
    
    checkoutLayout: { 
        display: 'grid', 
        gridTemplateColumns: '1.5fr 1fr', 
        gap: '30px', 
        alignItems: 'start'
    },
    
    formSection: { 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '30px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
    },
    
    summarySection: { 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        position: 'sticky', 
        top: '20px'
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
        outline: 'none',
        fontFamily: 'inherit'
    },
    
    textarea: { 
        width: '100%', 
        padding: '12px 16px', 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        fontSize: '1rem', 
        resize: 'vertical', 
        fontFamily: 'inherit',
        transition: 'all 0.2s',
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
    
    orderItems: {
        marginBottom: '16px'
    },

    summaryItem: { 
        display: 'flex', 
        alignItems: 'center',
        gap: '12px',
        padding: '12px 0', 
        borderBottom: '1px solid #f3f4f6' 
    },

    itemThumbnail: {
        width: '50px',
        height: '50px',
        objectFit: 'cover',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
    },
    
    itemDetails: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        minWidth: 0
    },
    
    itemName: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#374151',
        lineHeight: '1.2'
    },
    
    itemQuantity: {
        fontSize: '0.8rem',
        color: '#6b7280'
    },

    itemUnitPrice: {
        fontSize: '0.8rem',
        color: '#9ca3af'
    },
    
    itemPrice: {
        fontWeight: '600',
        color: '#1f2937',
        fontSize: '0.95rem'
    },
    
    divider: { 
        border: 'none', 
        borderTop: '1px solid #e5e7eb', 
        margin: '12px 0' 
    },
    
    hr: { 
        border: 'none', 
        borderTop: '1px solid #e5e7eb', 
        margin: '30px 0' 
    },
    
    summaryRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 0', 
        fontSize: '1rem' 
    },
    
    freeShipping: {
        color: '#059669',
        fontWeight: '600'
    },
    
    totalRow: { 
        fontSize: '1.2rem', 
        fontWeight: 'bold', 
        color: '#111827', 
        paddingTop: '12px',
        borderTop: '2px solid #e5e7eb',
        marginTop: '8px'
    },
    
    paymentOptions: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        marginBottom: '20px'
    },

    paymentOption: { 
        padding: '0', 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        background: 'white', 
        textAlign: 'left', 
        fontSize: '1rem',
        transition: 'all 0.2s',
        fontFamily: 'inherit'
    },
    
    paymentOptionSelected: { 
        padding: '0', 
        border: '2px solid #0d6efd', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        background: '#eef2ff', 
        textAlign: 'left', 
        fontSize: '1rem',
        color: '#0d6efd', 
        fontWeight: 'bold',
        fontFamily: 'inherit'
    },

    paymentOptionContent: {
        padding: '16px'
    },

    paymentOptionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '4px'
    },

    paymentOptionDesc: {
        fontSize: '0.85rem',
        color: '#6b7280',
        marginLeft: '28px'
    },

    // ✅ Security badges
    securityBadges: {
        display: 'flex',
        gap: '16px',
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '6px'
    },

    securityBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.8rem',
        color: '#059669',
        fontWeight: '500'
    },
    
    checkoutButton: { 
        width: '100%', 
        padding: '16px', 
        backgroundColor: '#28a745', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontSize: '1.1rem', 
        fontWeight: '600', 
        cursor: 'pointer',
        marginTop: '20px',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    
    disabledButton: { 
        backgroundColor: '#9ca3af', 
        cursor: 'not-allowed' 
    },

    // ✅ Payment security note
    paymentNote: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        justifyContent: 'center',
        marginTop: '12px',
        fontSize: '0.8rem',
        color: '#6b7280'
    },
    
    noticeCard: { 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        maxWidth: '800px', 
        margin: '20px auto',
        border: '1px solid #f59e0b'
    },
    
    noticeTitle: { 
        margin: '0 0 8px 0',
        color: '#92400e',
        fontSize: '1.2rem'
    },
    
    noticeText: { 
        margin: '0 0 16px 0', 
        color: '#64748b' 
    },
    
    noticeButton: { 
        display: 'inline-block', 
        padding: '10px 20px', 
        backgroundColor: '#0d6efd', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '8px', 
        fontWeight: '500',
        transition: 'background-color 0.2s'
    }
};
