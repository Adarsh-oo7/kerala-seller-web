'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
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
  RefreshCw,
  Check,
  Lock,
  Globe,
  Store,
  X,
  ArrowLeft,
  Star,
  ExternalLink
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

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RClyCqWG0I7Frn';

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
    const [debugInfo, setDebugInfo] = useState({});

    const params = useParams();
    const router = useRouter();
    const { sellerPhone } = params;

    // ✅ Enhanced cart hook with error handling
    let cartData = null;
    let cartError = null;
    
    try {
        cartData = useCart();
    } catch (err) {
        console.error('❌ Cart hook error:', err);
        cartError = err;
    }

    const {
        getCartBySeller,
        clearCartForSeller,
        validateCartStock,
        removeFromCart
    } = cartData || {};

    // ✅ ENHANCED: Debug cart contents function
    const debugCartContents = useCallback(async () => {
        console.log('🔍 DETAILED CART DEBUG for seller:', sellerPhone);
        
        // Check cart data sources
        const cartItems = getCartBySeller ? getCartBySeller(sellerPhone) : [];
        const localStorage_multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
        const localStorage_cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const debugData = {
            sellerPhone,
            cartItems: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                seller_phone: item.seller_phone,
                type: typeof item.id
            })),
            localStorage_multiCarts,
            localStorage_cart,
            cartItemsCount: cartItems.length
        };
        
        console.log('🔍 CART DEBUG DATA:', debugData);
        setDebugInfo(debugData);
        
        // ✅ NEW: Test each product individually
        if (cartItems.length > 0) {
            console.log('🧪 Testing individual products...');
            
            for (const item of cartItems) {
                try {
                    console.log(`🔍 Testing product ${item.id} for seller ${sellerPhone}`);
                    
                    // Test if product exists at all
                    const productTestUrl = `${API_BASE_URL}/api/products/${item.id}/`;
                    const productResponse = await fetch(productTestUrl);
                    
                    if (productResponse.ok) {
                        const productData = await productResponse.json();
                        console.log(`✅ Product ${item.id} exists:`, {
                            id: productData.id,
                            name: productData.name,
                            seller_phone: productData.seller?.phone_number || 'No seller info',
                            store_id: productData.store?.id || 'No store info'
                        });
                        
                        // Check if seller matches
                        if (productData.seller?.phone_number !== sellerPhone) {
                            console.error(`❌ MISMATCH: Product ${item.id} belongs to seller ${productData.seller?.phone_number}, not ${sellerPhone}`);
                        }
                    } else {
                        console.error(`❌ Product ${item.id} does not exist in database`);
                    }
                    
                } catch (error) {
                    console.error(`❌ Error testing product ${item.id}:`, error);
                }
            }
        }
        
        return debugData;
    }, [sellerPhone, getCartBySeller]);

    // ✅ ENHANCED: Product validation with detailed debugging
    const validateProductsDetailed = useCallback(async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return [];

            const items = getCartBySeller ? getCartBySeller(sellerPhone) : [];
            console.log('🔍 PRODUCT VALIDATION - Items to validate:', items);
            
            if (items.length === 0) {
                console.log('❌ No items to validate');
                return [];
            }

            // ✅ NEW: Enhanced validation with detailed request logging
            const validationPayload = {
                product_ids: items.map(item => item.id),
                seller_phone: sellerPhone
            };
            
            console.log('🔍 VALIDATION REQUEST:', {
                url: `${API_BASE_URL}/api/products/validate/`,
                payload: validationPayload,
                headers: headers
            });
            
            // Try validation API
            try {
                const response = await axios.post(`${API_BASE_URL}/api/products/validate/`, validationPayload, {
                    headers,
                    timeout: 10000
                });
                
                console.log('✅ VALIDATION RESPONSE:', response.data);
                return response.data.valid_products || [];
                
            } catch (validationError) {
                console.error('❌ VALIDATION API FAILED:', {
                    status: validationError.response?.status,
                    data: validationError.response?.data,
                    message: validationError.message
                });
                
                // ✅ NEW: Manual validation as fallback
                console.log('🔄 Attempting manual validation...');
                const validProducts = [];
                
                for (const item of items) {
                    try {
                        const productUrl = `${API_BASE_URL}/api/products/${item.id}/`;
                        const productResponse = await fetch(productUrl, { headers });
                        
                        if (productResponse.ok) {
                            const productData = await productResponse.json();
                            
                            // Check if product belongs to this seller
                            if (productData.seller?.phone_number === sellerPhone) {
                                validProducts.push({
                                    id: productData.id,
                                    name: productData.name,
                                    price: productData.price,
                                    quantity: item.quantity
                                });
                                console.log(`✅ Manual validation: Product ${item.id} is valid`);
                            } else {
                                console.error(`❌ Manual validation: Product ${item.id} belongs to ${productData.seller?.phone_number}, not ${sellerPhone}`);
                            }
                        } else {
                            console.error(`❌ Manual validation: Product ${item.id} not found`);
                        }
                    } catch (error) {
                        console.error(`❌ Manual validation error for product ${item.id}:`, error);
                    }
                }
                
                console.log('🔍 Manual validation result:', validProducts);
                return validProducts;
            }
            
        } catch (error) {
            console.error('❌ Product validation completely failed:', error);
            return [];
        }
    }, [sellerPhone, getCartBySeller]);

    // ✅ Shop context detection
    const getShopContext = useCallback(() => {
        if (typeof window === 'undefined') return { shopId: null, isInShop: false, pattern: 'none' };
        
        const currentPath = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        
        let shopMatch = currentPath.match(/\/shop\/([^\/]+)/);
        if (shopMatch) {
            const shopId = shopMatch[1];
            if (/^\d+$/.test(shopId)) {
                return { shopId, isInShop: true, pattern: 'shop' };
            }
        }
        
        let storeMatch = currentPath.match(/\/store\/([^\/]+)/);
        if (storeMatch) {
            const storeId = storeMatch[1];
            if (/^\d+$/.test(storeId)) {
                return { shopId: storeId, isInShop: true, pattern: 'store' };
            }
        }
        
        if (sellerPhone && /^\d+$/.test(sellerPhone)) {
            return { shopId: sellerPhone, isInShop: true, pattern: 'seller' };
        }
        
        return { shopId: null, isInShop: false, pattern: 'none' };
    }, [sellerPhone]);

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');
        if (!token) {
            console.log('🔐 No auth token found');
            const shopContext = getShopContext();
            const redirectUrl = shopContext.isInShop && shopContext.shopId 
                ? `/shop/${shopContext.shopId}/login?redirect=/checkout/${sellerPhone}`
                : `/login/buyer?redirect=/checkout/${sellerPhone}`;
            
            router.push(redirectUrl);
            return null;
        }
        return { 'Authorization': `Bearer ${token}` };
    }, [router, sellerPhone, getShopContext]);

    // ✅ Enhanced data loading with comprehensive debugging
    useEffect(() => {
        const loadCheckoutData = async () => {
            console.log(`🔍 Loading checkout data for seller: ${sellerPhone}`);
            
            const headers = getAuthHeaders();
            if (!headers) return;

            // Get cart items
            let items = [];
            if (getCartBySeller) {
                items = getCartBySeller(sellerPhone) || [];
            }

            if (!items || items.length === 0) {
                console.log('🛒 No cart items found, redirecting to shop');
                router.push(`/shop/${sellerPhone}`);
                return;
            }
            
            console.log(`🛒 Found ${items.length} items for seller ${sellerPhone}`);
            setCartItems(items);

            // ✅ Run detailed cart debugging
            await debugCartContents();

            try {
                // Load profile and store data
                const [profileRes, storeRes] = await Promise.all([
                    axios.get(PROFILE_API, { headers, timeout: 15000 }),
                    axios.get(`${STORE_API_URL}${sellerPhone}/`, { timeout: 10000 })
                        .catch(error => {
                            console.warn(`Store API failed for ${sellerPhone}:`, error);
                            return { data: { name: `Store ${sellerPhone}`, phone: sellerPhone } };
                        })
                ]);
                
                const data = profileRes.data;
                setBuyerProfile(data);
                
                const storeData = storeRes.data.store || storeRes.data;
                setStore(storeData);

                // ✅ Run product validation
                const validatedProducts = await validateProductsDetailed();
                
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
                }
                
            } catch (err) {
                console.error("❌ Failed to load checkout data:", err);
                setErrors({ general: 'Failed to load checkout information. Please refresh and try again.' });
            } finally {
                setIsLoading(false);
            }
        };
        
        loadCheckoutData();
    }, [sellerPhone, getCartBySeller, getAuthHeaders, router, debugCartContents, validateProductsDetailed]);

    // ✅ ENHANCED: Order placement with detailed error handling
    const handlePlaceOrder = async () => {
        console.log('🔍 ENHANCED ORDER PLACEMENT - Starting...');
        
        try {
            if (isSubmitting) {
                console.log('⚠️ Already submitting, ignoring');
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
            
            // ✅ NEW: Validate products before creating order
            console.log('🔍 Pre-order product validation...');
            const validatedProducts = await validateProductsDetailed();
            
            if (validatedProducts.length === 0) {
                console.error('❌ No valid products found for order');
                alert('No valid products found in cart. Please refresh and try again.');
                setIsSubmitting(false);
                return;
            }
            
            console.log('✅ Valid products for order:', validatedProducts);
            
            const finalAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.pincode}`;
            
            // ✅ NEW: Enhanced order data with validation
            const orderData = {
                customer_name: shippingInfo.name.trim(),
                customer_phone: shippingInfo.phone.trim(),
                shipping_address: finalAddress,
                items: validatedProducts.map(item => ({ 
                    id: parseInt(item.id), // ✅ Ensure ID is integer
                    quantity: parseInt(item.quantity),
                    name: item.name,
                    price: parseFloat(item.price)
                })),
                payment_method: selectedPaymentMethod,
                seller_phone: sellerPhone
            };
            
            console.log('🔍 FINAL ORDER DATA:', orderData);

            if (selectedPaymentMethod === 'COD') {
                try {
                    console.log(`🔍 Creating COD order with enhanced validation...`);
                    
                    const response = await axios.post(CREATE_ORDER_API, orderData, { 
                        headers,
                        timeout: 20000
                    });
                    
                    console.log('✅ COD order created successfully:', response.data);
                    
                    if (clearCartForSeller) {
                        clearCartForSeller(sellerPhone);
                    }
                    
                    router.push(`/order-confirmation/${response.data.order_id}`);
                    
                } catch (error) {
                    console.error('❌ COD order creation failed:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        message: error.message,
                        orderData: orderData
                    });
                    
                    let errorMessage = 'Failed to place order. Please try again.';
                    
                    if (error.response?.data?.error) {
                        errorMessage = error.response.data.error;
                    } else if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response?.status === 400) {
                        errorMessage = 'Invalid order data. Please check your cart and try again.';
                    }
                    
                    setErrors({ general: errorMessage });
                    alert(`Error placing order: ${errorMessage}`);
                } finally {
                    setIsSubmitting(false);
                }
            }
            // ... rest of online payment logic
            
        } catch (error) {
            console.error('❌ Order placement error:', error);
            setIsSubmitting(false);
            alert('Failed to place order. Please try again.');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!shippingInfo.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!shippingInfo.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }
        
        if (!shippingInfo.address.trim()) {
            newErrors.address = 'Address is required';
        }
        
        if (!shippingInfo.city.trim()) {
            newErrors.city = 'City is required';
        }
        
        if (!shippingInfo.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setShippingInfo(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handlePaymentMethodSelect = (method) => {
        console.log(`💳 Payment method selected: ${method}`);
        setSelectedPaymentMethod(method);
    };

    // Loading state
    if (isLoading) {
        return (
            <div>
                <Header />
                <div style={styles.loadingContainer}>
                    <RefreshCw size={40} style={{animation: 'spin 1s linear infinite'}} />
                    <p>Loading checkout...</p>
                    <p style={styles.loadingSubtext}>🔍 Validating products and cart data</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <Header />
            
            <div style={styles.container}>
                {/* ✅ ENHANCED DEBUG PANEL */}
                <div style={styles.debugPanel}>
                    <h4>🔍 Enhanced Debug Panel</h4>
                    <button 
                        onClick={() => {
                            setIsLoading(false);
                            setIsSubmitting(false);
                            setErrors({});
                        }}
                        style={styles.debugButton}
                    >
                        🚨 Reset State
                    </button>
                    <button 
                        onClick={debugCartContents}
                        style={styles.debugButton}
                    >
                        🔍 Debug Cart
                    </button>
                    <button 
                        onClick={validateProductsDetailed}
                        style={styles.debugButton}
                    >
                        ✅ Validate Products
                    </button>
                    <div style={styles.debugInfo}>
                        <strong>Status:</strong><br/>
                        Loading: {isLoading ? '✅' : '❌'}<br/>
                        Submitting: {isSubmitting ? '✅' : '❌'}<br/>
                        Items: {cartItems.length}<br/>
                        Payment: {selectedPaymentMethod || 'None'}<br/>
                        Seller: {sellerPhone}
                    </div>
                    {debugInfo.cartItems && (
                        <details style={{marginTop: '10px'}}>
                            <summary>Cart Items Detail</summary>
                            <pre style={{fontSize: '10px', maxHeight: '200px', overflow: 'auto'}}>
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>

                {/* Enhanced header */}
                <div style={styles.checkoutHeader}>
                    <h1 style={styles.title}>Enhanced Debug Checkout</h1>
                    <div style={styles.sellerInfo}>
                        <Store size={18} />
                        <span>Seller: {sellerPhone}</span>
                    </div>
                </div>
                
                {errors.general && (
                    <div style={styles.generalError}>
                        <AlertCircle size={20} />
                        <span>{errors.general}</span>
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div style={styles.noItemsCard}>
                        <h2>No items in cart</h2>
                        <Link href={`/shop/${sellerPhone}`} style={styles.shopButton}>
                            Continue Shopping
                        </Link>
                    </div>
                ) : !isProfileComplete ? (
                    <div style={styles.noticeCard}>
                        <h3>Complete Your Profile</h3>
                        <Link href="/profile" style={styles.noticeButton}>
                            Go to Profile
                        </Link>
                    </div>
                ) : (
                    <div style={styles.checkoutLayout}>
                        {/* Simplified form for debugging */}
                        <div style={styles.formSection}>
                            <h2>Shipping Information</h2>
                            
                            <input 
                                type="text" 
                                value={shippingInfo.name} 
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Full Name"
                                style={styles.input}
                            />
                            
                            <input 
                                type="tel" 
                                value={shippingInfo.phone} 
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Phone Number"
                                style={styles.input}
                            />
                            
                            <textarea 
                                value={shippingInfo.address} 
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                placeholder="Address"
                                style={styles.input}
                            />
                            
                            <input 
                                type="text" 
                                value={shippingInfo.city} 
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                placeholder="City"
                                style={styles.input}
                            />
                            
                            <input 
                                type="text" 
                                value={shippingInfo.pincode} 
                                onChange={(e) => handleInputChange('pincode', e.target.value)}
                                placeholder="Pincode"
                                style={styles.input}
                            />

                            <h2>Payment Method</h2>
                            
                            <button 
                                onClick={() => handlePaymentMethodSelect('ONLINE')}
                                style={{
                                    ...styles.paymentButton,
                                    backgroundColor: selectedPaymentMethod === 'ONLINE' ? '#0d6efd' : '#f8f9fa'
                                }}
                            >
                                Pay Online
                            </button>
                            
                            <button 
                                onClick={() => handlePaymentMethodSelect('COD')}
                                style={{
                                    ...styles.paymentButton,
                                    backgroundColor: selectedPaymentMethod === 'COD' ? '#0d6efd' : '#f8f9fa'
                                }}
                            >
                                Cash on Delivery
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div style={styles.summarySection}>
                            <h2>Order Summary</h2>
                            
                            {cartItems.map(item => (
                                <div key={item.id} style={styles.summaryItem}>
                                    <span>{item.name}</span>
                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            
                            <hr />
                            <div style={styles.totalRow}>
                                <strong>Total: ₹{calculateTotal().toFixed(2)}</strong>
                            </div>
                            
                            <button 
                                onClick={handlePlaceOrder}
                                disabled={isSubmitting || !selectedPaymentMethod} 
                                style={{
                                    ...styles.checkoutButton,
                                    backgroundColor: isSubmitting ? '#ccc' : '#28a745'
                                }}
                            >
                                {isSubmitting ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

// Enhanced styles for debugging
const styles = {
    pageContainer: { minHeight: '100vh', backgroundColor: '#f8fafc' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    
    // Enhanced debug panel
    debugPanel: {
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'white',
        border: '2px solid #dc2626',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 9999,
        maxHeight: '80vh',
        overflowY: 'auto'
    },
    debugButton: {
        background: '#dc2626',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '3px',
        cursor: 'pointer',
        width: '100%',
        marginBottom: '5px',
        fontSize: '11px'
    },
    debugInfo: {
        fontSize: '11px',
        lineHeight: '1.3',
        marginTop: '10px'
    },
    
    loadingContainer: { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px', 
        gap: '16px' 
    },
    loadingSubtext: { fontSize: '0.9rem', color: '#666', margin: 0 },
    
    checkoutHeader: { marginBottom: '30px' },
    title: { fontSize: '2rem', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' },
    sellerInfo: { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' },
    
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
    
    noItemsCard: { 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '40px', 
        textAlign: 'center', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
    },
    shopButton: { 
        display: 'inline-block', 
        padding: '12px 24px', 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '8px', 
        marginTop: '20px' 
    },
    
    noticeCard: { 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        textAlign: 'center', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
    },
    noticeButton: { 
        display: 'inline-block', 
        padding: '10px 20px', 
        backgroundColor: '#0d6efd', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '8px', 
        marginTop: '16px' 
    },
    
    checkoutLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    formSection: { backgroundColor: 'white', borderRadius: '12px', padding: '30px' },
    summarySection: { backgroundColor: 'white', borderRadius: '12px', padding: '24px' },
    
    input: { 
        width: '100%', 
        padding: '12px', 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        marginBottom: '15px',
        fontSize: '1rem'
    },
    
    paymentButton: { 
        width: '100%', 
        padding: '12px', 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        marginBottom: '10px',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    
    summaryItem: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '8px 0', 
        borderBottom: '1px solid #f3f4f6' 
    },
    totalRow: { marginTop: '15px', fontSize: '1.2rem' },
    
    checkoutButton: { 
        width: '100%', 
        padding: '16px', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontSize: '1.1rem', 
        fontWeight: '600', 
        cursor: 'pointer', 
        marginTop: '20px' 
    }
};
