'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { CheckCircle, Star, Package, Calendar, AlertCircle, Loader } from 'lucide-react';

const PLANS_API_URL = 'http://localhost:8000/api/subscriptions/plans/';
const CURRENT_SUB_API_URL = 'http://localhost:8000/api/subscriptions/current/';
const CREATE_ORDER_API = 'http://localhost:8000/api/subscriptions/create-order/';
const VERIFY_PAYMENT_API = 'http://localhost:8000/api/subscriptions/verify-payment/';
const RAZORPAY_KEY_ID = 'rzp_test_RClyCqWG0I7Frn';

// --- Sub-component for displaying the current plan ---
function CurrentPlanCard({ subscription, isLoading, error }) {
    if (isLoading) {
        return (
            <div style={{...styles.card, ...styles.loadingCard}}>
                <Loader className="animate-spin mx-auto mb-2" size={24} />
                <p>Loading subscription details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{...styles.card, ...styles.errorCard}}>
                <AlertCircle size={24} style={{color: '#dc3545', marginBottom: '1rem'}} />
                <h2>Unable to load subscription</h2>
                <p>{error}</p>
            </div>
        );
    }
    
    if (!subscription || !subscription.is_active) {
        return (
            <div style={{...styles.card, ...styles.noPlanCard}}>
                <h2>No Active Plan</h2>
                <p>Choose a plan below to start selling online.</p>
            </div>
        );
    }
    
    const remainingDays = subscription.days_remaining || Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    return (
        <div style={{...styles.card, ...styles.currentPlanCard}}>
            <h2 style={styles.currentPlanTitle}>Your Current Plan</h2>
            <p style={styles.currentPlanName}>{subscription.plan.name}</p>
            <div style={styles.currentPlanDetails}>
                <div style={styles.detailItem}>
                    <Calendar size={20} />
                    <span>
                        {remainingDays > 0 ? `${remainingDays} days remaining` : 'Expires today'}
                    </span>
                </div>
                <div style={styles.detailItem}>
                    <Package size={20} />
                    <span>
                        {subscription.plan.product_limit 
                            ? `Up to ${subscription.plan.product_limit} products online` 
                            : 'Unlimited products online'
                        }
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function SubscriptionPage() {
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);
    const [subscriptionError, setSubscriptionError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const router = useRouter();

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login/seller');
            return null;
        }
        return { Authorization: `Token ${token}` };
    }, [router]);

    // Load plans and subscription data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setSubscriptionLoading(true);
            setSubscriptionError(null);
            
            try {
                // Load plans (public endpoint)
                const plansResponse = await axios.get(PLANS_API_URL);
                setPlans(plansResponse.data.results || plansResponse.data);
                
                // Load current subscription (authenticated endpoint)
                const headers = getAuthHeaders();
                if (headers) {
                    try {
                        const subResponse = await axios.get(CURRENT_SUB_API_URL, { headers });
                        setCurrentSubscription(subResponse.data);
                    } catch (subErr) {
                        console.log('No active subscription found');
                        setCurrentSubscription(null);
                        if (subErr.response?.status !== 404) {
                            setSubscriptionError('Failed to load subscription data');
                        }
                    }
                }
                
            } catch (err) {
                console.error('Failed to load data:', err);
                if (err.response?.status !== 404) {
                    setSubscriptionError('Failed to load subscription data');
                }
            } finally {
                setIsLoading(false);
                setSubscriptionLoading(false);
            }
        };
        
        loadData();
    }, [getAuthHeaders]);

    const handleChoosePlan = async (planId, planName) => {
        setIsProcessing(planId);
        const headers = getAuthHeaders();
        if (!headers) {
            setIsProcessing(null);
            return;
        }

        try {
            // Create order
            const orderResponse = await axios.post(CREATE_ORDER_API, {
                plan_id: planId,
                billing_cycle: billingCycle 
            }, { headers });

            const { order_id, amount } = orderResponse.data;

            // Initialize Razorpay
            const options = {
                key: RAZORPAY_KEY_ID,
                amount,
                order_id,
                name: `Kerala Sellers - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Plan`,
                description: `Payment for ${planName}`,
                handler: async function (response) {
                    const verificationData = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        plan_id: planId,
                        billing_cycle: billingCycle,
                    };
                    
                    try {
                        await axios.post(VERIFY_PAYMENT_API, verificationData, { headers });
                        alert('Subscription activated successfully!');
                        window.location.reload();
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert("Payment verification failed. Please contact support.");
                    } finally {
                        setIsProcessing(null);
                    }
                },
                modal: { 
                    ondismiss: () => setIsProcessing(null) 
                },
                theme: {
                    color: '#0d6efd'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Subscription error:', error);
            alert("Failed to process subscription. Please try again.");
            setIsProcessing(null);
        }
    };

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <Loader className="animate-spin" size={48} />
                <p style={styles.loadingText}>Loading subscription plans...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Your Subscription</h1>
            <p style={styles.subtitle}>Manage your plan and explore upgrade options.</p>
            
            <div style={styles.toggleContainer}>
                <button 
                    onClick={() => setBillingCycle('monthly')}
                    style={billingCycle === 'monthly' ? styles.activeToggle : styles.toggleButton}
                >
                    Monthly
                </button>
                <button 
                    onClick={() => setBillingCycle('yearly')}
                    style={billingCycle === 'yearly' ? styles.activeToggle : styles.toggleButton}
                >
                    Yearly (Save 10%)
                </button>
            </div>
            
            <CurrentPlanCard 
                subscription={currentSubscription} 
                isLoading={subscriptionLoading}
                error={subscriptionError}
            />
            
            <div style={styles.planGrid}>
                {plans.map(plan => {
                    const yearlyPrice = plan.yearly_price || (plan.price * 12 * 0.90);
                    const isCurrentPlan = currentSubscription?.plan?.id === plan.id;
                    const isPopular = plan.name === 'Professional' || plan.name === 'Pro';
                    
                    return (
                        <div key={plan.id} style={{
                            ...styles.card,
                            ...(isCurrentPlan ? styles.currentPlanHighlight : {}),
                            ...(isPopular ? styles.popularCard : {})
                        }}>
                            {isPopular && (
                                <div style={styles.popularBadge}>
                                    <Star size={16} />
                                    Most Popular
                                </div>
                            )}
                            
                            <h2 style={styles.planName}>{plan.name}</h2>
                            <p style={styles.price}>
                                ₹{parseInt(billingCycle === 'yearly' ? yearlyPrice : plan.price)}
                                <span style={styles.duration}>
                                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                                </span>
                            </p>
                            {billingCycle === 'yearly' && (
                                <p style={styles.savings}>
                                    Billed as ₹{parseInt(yearlyPrice)} annually
                                    <br />
                                    <span style={styles.savingsAmount}>
                                        Save ₹{parseInt((plan.price * 12) - yearlyPrice)}
                                    </span>
                                </p>
                            )}
                            
                            <ul style={styles.featureList}>
                                <li>
                                    <CheckCircle size={16} style={styles.checkIcon} /> 
                                    {plan.product_limit 
                                        ? `${plan.product_limit} Online Products` 
                                        : 'Unlimited Online Products'
                                    }
                                </li>
                                <li>
                                    <CheckCircle size={16} style={styles.checkIcon} /> 
                                    Unlimited Products for Stock
                                </li>
                                <li>
                                    <CheckCircle size={16} style={styles.checkIcon} /> 
                                    Your Own Professional Storefront
                                </li>
                                <li>
                                    <CheckCircle size={16} style={styles.checkIcon} /> 
                                    24/7 Customer Support
                                </li>
                            </ul>
                            
                            <button 
                                style={{
                                    ...styles.button,
                                    ...(isCurrentPlan ? styles.currentPlanButton : {}),
                                    ...(isProcessing === plan.id ? styles.processingButton : {}),
                                    ...(isPopular && !isCurrentPlan ? styles.popularButton : {})
                                }}
                                onClick={() => handleChoosePlan(plan.id, plan.name)}
                                disabled={isProcessing === plan.id || isCurrentPlan}
                            >
                                {isProcessing === plan.id ? (
                                    <>
                                        <Loader size={16} className="animate-spin" style={{marginRight: '8px'}} />
                                        Processing...
                                    </>
                                ) : isCurrentPlan ? (
                                    'Current Plan'
                                ) : (
                                    'Choose Plan'
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    container: { 
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '1rem'
    },
    loadingText: {
        fontSize: '1.1rem',
        color: '#6c757d'
    },
    title: { 
        textAlign: 'center', 
        marginBottom: '1rem', 
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#212529'
    },
    subtitle: { 
        textAlign: 'center', 
        color: '#6c757d', 
        marginBottom: '2rem', 
        fontSize: '1.2rem' 
    },
    toggleContainer: { 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '2rem', 
        backgroundColor: '#f8f9fa', 
        padding: '6px', 
        borderRadius: '10px', 
        width: 'fit-content', 
        margin: '0 auto 2rem auto',
        border: '1px solid #e9ecef'
    },
    toggleButton: { 
        padding: '12px 24px', 
        border: 'none', 
        background: 'transparent', 
        cursor: 'pointer', 
        fontSize: '1rem', 
        fontWeight: '500',
        borderRadius: '6px',
        transition: 'all 0.2s'
    },
    activeToggle: { 
        padding: '12px 24px', 
        border: 'none', 
        backgroundColor: 'white', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontSize: '1rem', 
        fontWeight: 'bold', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: '#0d6efd'
    },
    planGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '30px', 
        alignItems: 'stretch'
    },
    card: { 
        border: '1px solid #e9ecef', 
        borderRadius: '16px', 
        padding: '32px', 
        textAlign: 'center', 
        backgroundColor: '#fff', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        position: 'relative',
        transition: 'all 0.3s ease'
    },
    loadingCard: {
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        maxWidth: '800px',
        margin: '0 auto 3rem auto'
    },
    errorCard: {
        backgroundColor: '#fff5f5',
        border: '2px solid #feb2b2',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto 3rem auto'
    },
    currentPlanCard: { 
        backgroundColor: '#eef2ff', 
        border: '2px solid #4f46e5', 
        textAlign: 'left', 
        maxWidth: '800px', 
        margin: '0 auto 3rem auto' 
    },
    noPlanCard: { 
        backgroundColor: '#fffbeb', 
        border: '2px solid #f59e0b', 
        textAlign: 'center', 
        maxWidth: '800px', 
        margin: '0 auto 3rem auto' 
    },
    currentPlanHighlight: {
        border: '2px solid #4f46e5',
        transform: 'scale(1.02)'
    },
    popularCard: {
        border: '2px solid #0d6efd'
    },
    popularBadge: {
        position: 'absolute',
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#0d6efd',
        color: 'white',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    currentPlanTitle: { 
        fontSize: '1.2rem', 
        fontWeight: 'bold',
        marginBottom: '0.5rem'
    },
    currentPlanName: { 
        fontSize: '1.8rem', 
        fontWeight: 'bold', 
        color: '#4f46e5', 
        margin: '0.5rem 0 1rem 0' 
    },
    currentPlanDetails: { 
        display: 'flex', 
        gap: '20px',
        flexWrap: 'wrap'
    },
    detailItem: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        fontSize: '1rem' 
    },
    planName: { 
        fontSize: '1.5rem', 
        marginBottom: '1rem',
        fontWeight: 'bold'
    },
    price: { 
        fontSize: '3rem', 
        fontWeight: 'bold', 
        marginBottom: '0.5rem',
        color: '#212529'
    },
    duration: { 
        fontSize: '1rem', 
        color: '#6c757d', 
        fontWeight: 'normal' 
    },
    savings: { 
        color: '#6c757d', 
        fontSize: '0.9rem', 
        marginBottom: '1.5rem',
        lineHeight: '1.4'
    },
    savingsAmount: {
        color: '#28a745',
        fontWeight: 'bold'
    },
    featureList: { 
        listStyle: 'none', 
        padding: 0, 
        margin: '0 0 2rem 0', 
        textAlign: 'left', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
    },
    checkIcon: {
        color: '#28a745',
        marginRight: '8px',
        flexShrink: 0
    },
    button: { 
        width: '100%', 
        padding: '16px 24px', 
        border: '2px solid #0d6efd', 
        borderRadius: '10px', 
        backgroundColor: 'white', 
        color: '#0d6efd', 
        cursor: 'pointer', 
        fontSize: '1rem', 
        fontWeight: 'bold',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    popularButton: {
        backgroundColor: '#0d6efd',
        color: 'white'
    },
    currentPlanButton: {
        backgroundColor: '#e9ecef',
        border: '2px solid #6c757d',
        color: '#6c757d',
        cursor: 'not-allowed'
    },
    processingButton: {
        backgroundColor: '#f8f9fa',
        border: '2px solid #6c757d',
        color: '#6c757d'
    }
};