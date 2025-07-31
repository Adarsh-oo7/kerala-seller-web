'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const PLANS_URL = 'http://localhost:8000/api/subscriptions/plans/';
const CREATE_ORDER_URL = 'http://localhost:8000/api/subscriptions/create-order/';
const VERIFY_PAYMENT_URL = 'http://localhost:8000/api/subscriptions/verify-payment/';
const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID'; // Important: Replace with your actual key

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios.get(PLANS_URL, { headers: { Authorization: `Token ${token}` } })
      .then(response => {
        setPlans(response.data);
        if (response.data.length > 0) {
          setSelectedPlanId(response.data[0].id); // Select the first plan by default
        }
      })
      .catch(error => console.error("Failed to fetch plans", error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlanId) {
      alert("Please select a plan.");
      return;
    }

    const token = localStorage.getItem('accessToken');
    try {
      // Step 1: Create an order on your backend
      const orderResponse = await axios.post(CREATE_ORDER_URL, 
        { plan_id: selectedPlanId },
        { headers: { Authorization: `Token ${token}` } }
      );

      const { order_id, amount } = orderResponse.data;

      // Step 2: Open Razorpay Checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "Kerala Sellers Subscription",
        description: "Monthly Plan",
        order_id: order_id,
        handler: async function (response) {
          // Step 3: Verify the payment on your backend
          try {
            await axios.post(VERIFY_PAYMENT_URL, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: selectedPlanId
            }, { headers: { Authorization: `Token ${token}` } });
            
            alert("Subscription successful! Your plan is now active.");
            // You can redirect or update the UI here
            window.location.reload(); 
          } catch (verifyError) {
            console.error("Payment verification failed", verifyError);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          // You can prefill user data here if available
          // name: "Seller Name",
          // email: "seller@email.com",
        },
        theme: {
          color: "#3399cc"
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Failed to create subscription order", error);
      alert("Could not initiate payment. Please try again.");
    }
  };

  if (isLoading) return <p>Loading plans...</p>;

  return (
    <div>
      <h1>Subscriptions & Billing</h1>
      <p>Choose a plan that fits your business needs.</p>

      <div style={styles.planContainer}>
        {plans.map(plan => (
          <div 
            key={plan.id}
            onClick={() => setSelectedPlanId(plan.id)}
            style={{...styles.card, ...(selectedPlanId === plan.id ? styles.selectedCard : {})}}
          >
            <h3>{plan.name}</h3>
            <p style={styles.price}>₹{plan.price}<span style={styles.priceTerm}>/{plan.duration_days} days</span></p>
            <ul style={styles.featureList}>
              <li>Up to {plan.product_limit} Products</li>
              <li>Basic Analytics</li>
              <li>Email & Chat Support</li>
            </ul>
          </div>
        ))}
      </div>
      
      <button onClick={handleSubscribe} style={styles.buttonPrimary} disabled={!selectedPlanId}>
        Proceed to Payment
      </button>
    </div>
  );
}

const styles = {
    planContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', margin: '2rem 0' },
    card: { border: '2px solid #e9ecef', borderRadius: '8px', padding: '25px', textAlign: 'center', cursor: 'pointer', flex: 1, minWidth: '220px', transition: 'all 0.2s ease-in-out' },
    selectedCard: { borderColor: '#0d6efd', boxShadow: '0 4px 15px rgba(13,110,253,0.15)', transform: 'scale(1.05)' },
    price: { fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#212529' },
    priceTerm: { fontSize: '1rem', color: '#6c757d', fontWeight: 'normal' },
    featureList: { listStyle: 'none', padding: 0, margin: 0, color: '#495057' },
    buttonPrimary: { padding: '12px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' },
};