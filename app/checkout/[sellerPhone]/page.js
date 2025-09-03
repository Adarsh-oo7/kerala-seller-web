'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { ShoppingCart, CreditCard, User, Phone, Home, Truck, MapPin, AlertCircle, Wallet, Landmark } from 'lucide-react';

const PROFILE_API = 'http://localhost:8000/api/buyer/profile/';
const CREATE_ORDER_API = 'http://localhost:8000/user/orders/create-order/'; 
const STORE_API_URL = 'http://localhost:8000/shop/';
const CREATE_PAYMENT_ORDER_API = 'http://localhost:8000/user/orders/create-payment-order/';
const RAZORPAY_KEY_ID = 'rzp_test_RClyCqWG0I7Frn'; // Replace with your actual key

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
            router.push('/login/buyer');
            return null;
        }
        return { 'Authorization': `Bearer ${token}` };
    }, [router]);

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
            try {
                await axios.post(CREATE_ORDER_API, orderData, { headers });
                alert('Order placed successfully!');
                clearCartForSeller(sellerPhone);
                router.push('/profile/orders');
            } catch (error) {
                alert(`Error placing order: ${error.response?.data?.error || 'Please try again.'}`);
            } finally {
                setIsSubmitting(false);
            }
        } else if (selectedPaymentMethod === 'ONLINE') {
            try {
                const paymentOrderRes = await axios.post(CREATE_PAYMENT_ORDER_API, { amount: calculateTotal() }, { headers });
                const { order_id, amount } = paymentOrderRes.data;
                
                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount,
                    order_id,
                    name: "Kerala Sellers",
                    handler: async function (response) {
                        const finalOrderData = { ...orderData, razorpay_payment_id: response.razorpay_payment_id };
                        await axios.post(CREATE_ORDER_API, finalOrderData, { headers });
                        alert('Payment successful and order placed!');
                        clearCartForSeller(sellerPhone);
                        router.push('/profile/orders');
                    },
                    prefill: { name: buyerProfile.full_name, email: buyerProfile.email, contact: buyerProfile.phone_number },
                };
                
                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (error) {
                alert("Could not initiate online payment.");
            }
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p style={{textAlign: 'center', marginTop: '50px'}}>Loading checkout...</p>;
    }

    return (
        <div>
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
                                {/* ... Shipping Form Inputs ... */}

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
                                {cartItems.map(item => <div key={item.id} style={styles.summaryItem}><span>{item.quantity} x {item.name}</span><span>₹{(item.price * item.quantity).toFixed(2)}</span></div>)}
                                <hr style={styles.divider} />
                                <div style={{...styles.summaryRow, ...styles.totalRow}}><strong>Total Amount:</strong><strong>₹{calculateTotal().toFixed(2)}</strong></div>
                                <button onClick={handlePlaceOrder} disabled={isSubmitting || cartItems.length === 0} style={{...styles.checkoutButton, ...(isSubmitting && styles.disabledButton)}}>
                                    {isSubmitting ? 'Processing...' : (selectedPaymentMethod === 'ONLINE' ? 'Proceed to Pay' : 'Place Order')}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}

const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '20px' },
    title: { textAlign: 'center', marginBottom: '0.5rem', fontSize: '2.5rem' },
    subtitle: { textAlign: 'center', color: '#6c757d', marginTop: 0, marginBottom: '2rem' },
    checkoutLayout: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start' },
    formSection: { backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    summarySection: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: '20px' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '24px', color: '#212529' },
    formGroup: { marginBottom: '20px' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    label: { display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', marginBottom: '8px', color: '#374151', fontSize: '0.9rem' },
    input: { width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' },
    textarea: { width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit' },
    inputError: { borderColor: '#ef4444' },
    errorText: { color: '#ef4444', fontSize: '0.85rem', marginTop: '4px', display: 'block' },
    summaryItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
    divider: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' },
    hr: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '30px 0' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: '1rem' },
    totalRow: { fontSize: '1.2rem', fontWeight: 'bold', color: '#111827', paddingTop: '12px' },
    paymentOptions: { display: 'flex', flexDirection: 'column', gap: '15px' },
    paymentOption: { padding: '15px', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: 'none', textAlign: 'left', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' },
    paymentOptionSelected: { padding: '15px', border: '2px solid #0d6efd', borderRadius: '8px', cursor: 'pointer', background: '#eef2ff', textAlign: 'left', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#0d6efd', fontWeight: 'bold' },
    checkoutButton: { width: '100%', padding: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' },
    disabledButton: { backgroundColor: '#9ca3af', cursor: 'not-allowed' },
    noticeCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '20px', maxWidth: '800px', margin: '20px auto' },
    noticeTitle: { margin: '0 0 8px 0' },
    noticeText: { margin: '0 0 16px 0', color: '#64748b' },
    noticeButton: { display: 'inline-block', padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '500' },
};