'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import Header from '../../../components/common/Header';

const PROFILE_API = 'http://localhost:8000/api/buyer/profile/';
const CREATE_ORDER_API = 'http://localhost:8000/user/orders/create-order/';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { sellerPhone } = params;
  const { getCartBySeller, clearCartForSeller } = useCart();

  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '' });
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('buyerAccessToken');
    if (!token) {
      router.push('/login/buyer');
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

  // ✅ Simplified data fetching
  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers) {
      // If no headers, stop loading as we are redirecting
      setIsLoading(false);
      return;
    }
    
    // Set cart items from context immediately
    setCartItems(getCartBySeller(sellerPhone));

    // Fetch the buyer's profile
    axios.get(PROFILE_API, { headers })
      .then(res => {
        const fullAddress = [
            res.data.address_line_1,
            res.data.address_line_2,
            res.data.city,
            res.data.pincode
        ].filter(Boolean).join(', '); // Join parts that are not empty

        setShippingInfo({
          name: res.data.full_name || '',
          phone: res.data.phone_number || '',
          address: fullAddress
        });
      })
      .catch(err => {
        console.error("Failed to fetch profile", err);
        // Handle cases where the profile might not load
        alert("Could not load your profile. Please try logging in again.");
        router.push('/login/buyer');
      })
      .finally(() => {
        setIsLoading(false); // This will now always be called
      });
  }, [sellerPhone, getCartBySeller, getAuthHeaders, router]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    const headers = getAuthHeaders();
    if (!headers || cartItems.length === 0) return;

    try {
      // Step 1: Create a payment order on your backend
      const orderResponse = await axios.post(CREATE_PAYMENT_ORDER_API, {
        amount: calculateTotal()
      }, { headers });

      const { order_id, amount } = orderResponse.data;

      // Step 2: Open Razorpay Checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "Kerala Sellers",
        description: "Order Payment",
        order_id: order_id,
        handler: async function (response) {
          // Step 3: Payment is successful, now create the order in your DB
          const orderData = {
            customer_name: shippingInfo.name,
            customer_phone: shippingInfo.phone,
            shipping_address: shippingInfo.address,
            items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
            razorpay_payment_id: response.razorpay_payment_id, // Send this for reference
          };
          
          try {
            await axios.post(FINALIZE_ORDER_API, orderData, { headers });
            alert('Order placed successfully! The seller has 24 hours to accept.');
            clearCartForSeller(sellerPhone); // Clear the cart for this seller
            router.push('/profile/orders'); // Redirect to order history
          } catch (finalizeError) {
            alert('Payment was successful, but failed to save order. Please contact support.');
          }
        },
        prefill: {
          name: buyer.full_name,
          email: buyer.email,
          contact: buyer.phone_number
        },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      alert("Could not initiate payment. Please try again.");
    }
  };

  if (isLoading) return <p>Loading checkout...</p>;

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <h1 style={styles.title}>Checkout</h1>
        <div style={styles.checkoutLayout}>
          {/* Shipping Details Form */}
          <div style={styles.formSection}>
            <h2>Shipping Information</h2>
            {/* ... form inputs ... */}
          </div>

          {/* Order Summary */}
          <div style={styles.summarySection}>
            <h2>Order Summary</h2>
            {/* ... summary items ... */}
            <div style={styles.summaryTotal}>
              <strong>Total</strong>
              <strong>₹{calculateTotal().toFixed(2)}</strong>
            </div>
            <button onClick={handlePlaceOrder} style={styles.buttonPrimary}>
              Pay Securely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' },
    title: { textAlign: 'center', marginBottom: '2rem' },
    checkoutLayout: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' },
    formSection: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px' },
    summarySection: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa', height: 'fit-content' },
    input: { width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '15px' },
    summaryItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    hr: { border: 'none', borderTop: '1px solid #ddd', margin: '15px 0' },
    summaryTotal: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' },
    buttonPrimary: { width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer' },
};