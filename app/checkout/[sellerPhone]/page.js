'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { ShoppingCart, CreditCard, User, Phone, Home, Truck, MapPin, AlertCircle, Wallet, Landmark } from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const PROFILE_API = `${API_BASE_URL}/api/buyer/profile/`;
const CREATE_ORDER_API = `${API_BASE_URL}/user/orders/create-order/`; 
const STORE_API_URL = `${API_BASE_URL}/shop/`;
const CREATE_PAYMENT_ORDER_API = `${API_BASE_URL}/user/orders/create-payment-order/`;
const VERIFY_PAYMENT_API = `${API_BASE_URL}/user/orders/verify-product-payment/`;

// ✅ Environment variable for Razorpay Key
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RClyCqWG0I7Frn';

export default function CheckoutPage() {
    const [buyerProfile, setBuyerProfile] = useState(null);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '', city: '', pincode: '' });
    const [cartItems, setCartItems] = useState([]);
    const [store, setStore] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const params = useParams();
    const router = useRouter();
    const { sellerPhone } = params;
    const { getCartBySeller, clearCartForSeller } = useCart();

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('buyerAccessToken');
        if (!token) {
            router.push(`/login/buyer?redirect=/checkout/${sellerPhone}`);
            return null;
        }
        return { 'Authorization': `Bearer ${token}` };
    }, [router, sellerPhone]);

    useEffect(() => {
        const headers = getAuthHeaders();
        if (!headers) return;

        const items = getCartBySeller(sellerPhone);
        if (items.length === 0) {
            router.push(`/shop/${sellerPhone}`);
            return;
        }
        setCartItems(items);

        Promise.all([
            axios.get(PROFILE_API, { headers }),
            axios.get(`${STORE_API_URL}${sellerPhone}/`)
        ]).then(([profileRes, storeRes]) => {
            const data = profileRes.data;
            setBuyerProfile(data);
            setStore(storeRes.data.store);

            if (data.full_name && data.phone_number && data.address_line_1 && data.city && data.pincode) {
                setIsProfileComplete(true);
                const fullAddress = [data.address_line_1, data.address_line_2].filter(Boolean).join(', ');
                setShippingInfo({
                    name: data.full_name,
                    phone: data.phone_number,
                    address: fullAddress,
                    city: data.city,
                    pincode: data.pincode
                });
            } else {
                setIsProfileComplete(false);
            }
        }).catch(err => {
            console.error("Failed to load checkout data", err);
            router.push('/login/buyer');
        }).finally(() => setIsLoading(false));
    }, [sellerPhone, getCartBySeller, getAuthHeaders, router]);
    
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!shippingInfo.name.trim()) newErrors.name = 'Name is required';
        if (!shippingInfo.phone.trim() || !/^[6-9]\d{9}$/.test(shippingInfo.phone.trim())) newErrors.phone = 'Please enter a valid 10-digit phone number';
        if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
        if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
        if (!shippingInfo.pincode.trim() || !/^\d{6}$/.test(shippingInfo.pincode.trim())) newErrors.pincode = 'Please enter a valid 6-digit pincode';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setShippingInfo(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handlePlaceOrder = async () => {
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
        
        const finalAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.pincode}`;
        const orderData = {
            customer_name: shippingInfo.name.trim(),
            customer_phone: shippingInfo.phone.trim(),
            shipping_address: finalAddress,
            items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
            payment_method: selectedPaymentMethod,
        };

        if (selectedPaymentMethod === 'COD') {
            // For COD, create order directly
            try {
                const response = await axios.post(CREATE_ORDER_API, orderData, { headers });
                clearCartForSeller(sellerPhone);
                router.push(`/order-confirmation/${response.data.order_id}`);
            } catch (error) {
                alert(`Error placing order: ${error.response?.data?.error || 'Please try again.'}`);
            } finally {
                setIsSubmitting(false);
            }
        } else if (selectedPaymentMethod === 'ONLINE') {
            // For online payments, use the verification flow
            try {
                const paymentOrderRes = await axios.post(CREATE_PAYMENT_ORDER_API, { amount: calculateTotal() }, { headers });
                const { order_id, amount } = paymentOrderRes.data;
                
                // ✅ Check if Razorpay is available
                if (typeof window === 'undefined' || !window.Razorpay) {
                    alert('Payment service is not available. Please try again later.');
                    setIsSubmitting(false);
                    return;
                }
                
                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount,
                    order_id,
                    name: "Kerala Sellers",
                    handler: async function (response) {
                        try {
                            // Call the verification API with payment details AND order data
                            const verificationData = {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                // Include all order details for verification API
                                customer_name: orderData.customer_name,
                                customer_phone: orderData.customer_phone,
                                shipping_address: orderData.shipping_address,
                                items: orderData.items
                            };

                            const verifyResponse = await axios.post(VERIFY_PAYMENT_API, verificationData, { headers });
                            
                            // Payment verified and order created successfully
                            clearCartForSeller(sellerPhone);
                            router.push(`/order-confirmation/${verifyResponse.data.order_id}`);
                        } catch (verificationError) {
                            console.error('Payment verification failed:', verificationError);
                            alert('Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
                            setIsSubmitting(false);
                        }
                    },
                    prefill: { 
                        name: buyerProfile?.full_name || '', 
                        email: buyerProfile?.email || '', 
                        contact: buyerProfile?.phone_number || ''
                    },
                    modal: { 
                        ondismiss: () => {
                            console.log('Payment modal closed by user');
                            setIsSubmitting(false);
                        }
                    },
                    theme: {
                        color: "#28a745"
                    }
                };
                
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    console.error('Payment failed:', response.error);
                    alert('Payment failed: ' + response.error.description);
                    setIsSubmitting(false);
                });
                
                rzp.open();
            } catch (error) {
                console.error('Could not initiate online payment:', error);
                alert("Could not initiate online payment. Please try again.");
                setIsSubmitting(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div>
                <Header />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading checkout...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <Header />
            <div style={styles.container}>
                <h1 style={styles.title}>Checkout</h1>
                
                {!isProfileComplete ? (
                    <div style={styles.noticeCard}>
                        <AlertCircle size={24} style={{ color: '#f59e0b' }} />
                        <div>
                            <h3 style={styles.noticeTitle}>Complete Your Profile</h3>
                            <p style={styles.noticeText}>Your shipping address is incomplete. Please update your profile before proceeding.</p>
                            <Link href="/profile" style={styles.noticeButton}>
                                Go to My Profile
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <p style={styles.subtitle}>You are ordering from: <strong>{store?.name}</strong></p>
                        <div style={styles.checkoutLayout}>
                            <div style={styles.formSection}>
                                <h2 style={styles.sectionTitle}><Truck size={20} /> Shipping Information</h2>
                                
                                {/* Shipping Form Inputs */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}><User size={16} /> Full Name *</label>
                                    <input 
                                        type="text" 
                                        value={shippingInfo.name} 
                                        onChange={e => handleInputChange('name', e.target.value)} 
                                        style={{...styles.input, ...(errors.name && styles.inputError)}} 
                                        placeholder="Enter your full name"
                                    />
                                    {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}><Phone size={16} /> Phone Number *</label>
                                    <input 
                                        type="tel" 
                                        value={shippingInfo.phone} 
                                        onChange={e => handleInputChange('phone', e.target.value)} 
                                        style={{...styles.input, ...(errors.phone && styles.inputError)}} 
                                        placeholder="Enter 10-digit phone number"
                                        maxLength={10}
                                    />
                                    {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}><Home size={16} /> Address *</label>
                                    <textarea 
                                        value={shippingInfo.address} 
                                        onChange={e => handleInputChange('address', e.target.value)} 
                                        style={{...styles.textarea, ...(errors.address && styles.inputError)}} 
                                        rows={3}
                                        placeholder="Enter your full address"
                                    />
                                    {errors.address && <span style={styles.errorText}>{errors.address}</span>}
                                </div>

                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}><MapPin size={16} /> City *</label>
                                        <input 
                                            type="text" 
                                            value={shippingInfo.city} 
                                            onChange={e => handleInputChange('city', e.target.value)} 
                                            style={{...styles.input, ...(errors.city && styles.inputError)}} 
                                            placeholder="Enter city"
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
                                        />
                                        {errors.pincode && <span style={styles.errorText}>{errors.pincode}</span>}
                                    </div>
                                </div>

                                <hr style={styles.hr} />

                                <h2 style={styles.sectionTitle}><CreditCard size={20} /> Payment Method</h2>
                                <div style={styles.paymentOptions}>
                                    {store?.payment_method !== 'NONE' && (
                                        <button 
                                            style={selectedPaymentMethod === 'ONLINE' ? styles.paymentOptionSelected : styles.paymentOption}
                                            onClick={() => setSelectedPaymentMethod('ONLINE')}
                                        >
                                            <CreditCard size={18}/> Pay Online (UPI, Cards, etc.)
                                        </button>
                                    )}
                                    {store?.accepts_cod && (
                                        <button 
                                            style={selectedPaymentMethod === 'COD' ? styles.paymentOptionSelected : styles.paymentOption}
                                            onClick={() => setSelectedPaymentMethod('COD')}
                                        >
                                            <Wallet size={18}/> Cash on Delivery
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={styles.summarySection}>
                                <h2 style={styles.sectionTitle}><ShoppingCart size={20} /> Order Summary</h2>
                                
                                <div style={styles.orderItems}>
                                    {cartItems.map(item => (
                                        <div key={item.id} style={styles.summaryItem}>
                                            <div style={styles.itemDetails}>
                                                <span style={styles.itemName}>{item.name}</span>
                                                <span style={styles.itemQuantity}>Qty: {item.quantity}</span>
                                            </div>
                                            <span style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <hr style={styles.divider} />
                                
                                <div style={styles.summaryRow}>
                                    <span>Subtotal</span>
                                    <span>₹{calculateTotal().toFixed(2)}</span>
                                </div>
                                
                                <div style={styles.summaryRow}>
                                    <span>Shipping</span>
                                    <span style={styles.freeShipping}>Free</span>
                                </div>
                                
                                <hr style={styles.divider} />
                                
                                <div style={{...styles.summaryRow, ...styles.totalRow}}>
                                    <strong>Total Amount:</strong>
                                    <strong>₹{calculateTotal().toFixed(2)}</strong>
                                </div>
                                
                                <button 
                                    onClick={handlePlaceOrder} 
                                    disabled={isSubmitting || cartItems.length === 0} 
                                    style={{...styles.checkoutButton, ...(isSubmitting && styles.disabledButton)}}
                                >
                                    {isSubmitting ? 'Processing...' : (selectedPaymentMethod === 'ONLINE' ? 'Proceed to Pay' : 'Place Order')}
                                </button>
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
            `}</style>
        </div>
    );
}

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
        gap: '20px'
    },
    
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    
    title: { 
        textAlign: 'center', 
        marginBottom: '0.5rem', 
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1e293b'
    },
    
    subtitle: { 
        textAlign: 'center', 
        color: '#6c757d', 
        marginTop: 0, 
        marginBottom: '2rem',
        fontSize: '1.1rem'
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
        transition: 'border-color 0.2s',
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
        transition: 'border-color 0.2s',
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
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        padding: '12px 0', 
        borderBottom: '1px solid #f3f4f6' 
    },
    
    itemDetails: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    
    itemName: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#374151'
    },
    
    itemQuantity: {
        fontSize: '0.8rem',
        color: '#6b7280'
    },
    
    itemPrice: {
        fontWeight: '600',
        color: '#1f2937'
    },
    
    divider: { 
        border: 'none', 
        borderTop: '1px solid #e5e7eb', 
        margin: '8px 0' 
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
        gap: '15px' 
    },
    
    paymentOption: { 
        padding: '15px', 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        background: 'none', 
        textAlign: 'left', 
        fontSize: '1rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        transition: 'all 0.2s'
    },
    
    paymentOptionSelected: { 
        padding: '15px', 
        border: '2px solid #0d6efd', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        background: '#eef2ff', 
        textAlign: 'left', 
        fontSize: '1rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        color: '#0d6efd', 
        fontWeight: 'bold' 
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
        transition: 'all 0.2s'
    },
    
    disabledButton: { 
        backgroundColor: '#9ca3af', 
        cursor: 'not-allowed' 
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
