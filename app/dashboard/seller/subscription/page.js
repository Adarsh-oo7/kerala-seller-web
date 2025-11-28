'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import "../../../../styles/DashboardSubscription.css"
import {
    CheckCircle,
    Star,
    Package,
    Calendar,
    AlertCircle,
    Loader,
    CreditCard,
    RefreshCw,
    Crown,
    Zap,
    Shield,
    Clock // ✅ ADD: Clock icon for Coming Soon
} from 'lucide-react';

// ✅ Enhanced API URLs with subscription lifecycle support
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.4:8000';
const PLANS_API_URL = `${API_BASE_URL}/api/subscriptions/plans/`;
const CURRENT_SUB_API_URL = `${API_BASE_URL}/api/subscriptions/current/`;
const CREATE_ORDER_API = `${API_BASE_URL}/api/subscriptions/create-order/`;
const VERIFY_PAYMENT_API = `${API_BASE_URL}/api/subscriptions/verify-payment/`;

// ✅ NEW: Subscription lifecycle APIs
const STORE_STATUS_API = `${API_BASE_URL}/api/subscriptions/stores`;
const SUBSCRIPTION_STATUS_API = `${API_BASE_URL}/api/subscriptions/status/`;

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RClyCqWG0I7Frn';

// ✅ NEW: Helper function for status icons
function getStatusIcon(status) {
    const icons = {
        'ACTIVE': '🟢',
        'GRACE_PERIOD': '🟡',
        'OFFLINE': '🔴',
        'ARCHIVED': '⚫'
    };
    return icons[status] || '❓';
}

// ✅ ENHANCED: Current Plan Card with Store Status
function CurrentPlanCard({ subscription, isLoading, error, onRefresh, storeId }) {
    const [storeStatus, setStoreStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);

    // ✅ NEW: Load store operational status
    const loadStoreStatus = useCallback(async () => {
        if (!storeId) return;

        setStatusLoading(true);
        try {
            const response = await axios.get(`${STORE_STATUS_API}/${storeId}/status/`);
            setStoreStatus(response.data);
            console.log('✅ Store status loaded:', response.data);
        } catch (err) {
            console.error('❌ Failed to load store status:', err);
        } finally {
            setStatusLoading(false);
        }
    }, [storeId]);

    // Load store status when component mounts or storeId changes
    useEffect(() => {
        loadStoreStatus();

        // Auto-refresh store status every 2 minutes
        const interval = setInterval(loadStoreStatus, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadStoreStatus]);

    if (isLoading) {
        return (
            <div style={{ ...styles.card1, ...styles.loadingCard }}>
                <div style={styles.loadingContent}>
                    <div style={styles.spinner}></div>
                    <p>Loading subscription details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ ...styles.card1, ...styles.errorCard }}>
                <AlertCircle size={32} style={{ color: '#dc3545', marginBottom: '16px' }} />
                <h2 style={styles.errorTitle}>Unable to load subscription</h2>
                <p style={styles.errorText}>{error}</p>
                <button onClick={onRefresh} style={styles.retryButton}>
                    <RefreshCw size={16} />
                    Try Again
                </button>
            </div>
        );
    }

    if (!subscription || !subscription.is_active) {
        return (
            <div style={{ ...styles.card1, ...styles.noPlanCard }}>
                <Crown className='dashboardsubscribenoactiveplanicon' size={32} style={{ color: '#f59e0b', marginBottom: '16px' }} />
                <h2 className='dashboardsubscribenoactiveplan'>No Active Plan</h2>
                <p className='dashboardsubscribenoactiveplansub'>Choose a plan below to unlock the full potential of your online store.</p>

                {/* ✅ NEW: Show store status even without subscription */}
                {storeStatus && (
                    <div style={styles.storeStatusInfo}>
                        <div style={styles.statusDivider}></div>
                        <h3 style={styles.storeStatusTitle}>Store Status</h3>
                        <div style={{
                            ...styles.storeStatusBanner,
                            ...(storeStatus.subscription.can_sell ? styles.storeOnline : styles.storeOffline)
                        }}>
                            <span style={styles.statusIcon}>
                                {storeStatus.subscription.can_sell ? '🟢' : '🔴'}
                            </span>
                            <span style={styles.statusMessage}>
                                {storeStatus.subscription.message}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ✅ ENHANCED: Current plan with store status
    const remainingDays = subscription.days_remaining || 0;
    const isExpiringSoon = remainingDays <= 7;

    // Determine status style based on store status
    const getStatusStyle = () => {
        if (!storeStatus) return {};

        const status = storeStatus.subscription.status;
        switch (status) {
            case 'ACTIVE':
                return { backgroundColor: '#dcfce7', borderColor: '#22c55e' };
            case 'GRACE_PERIOD':
                return { backgroundColor: '#fef3c7', borderColor: '#f59e0b' };
            case 'OFFLINE':
                return { backgroundColor: '#fee2e2', borderColor: '#ef4444' };
            case 'ARCHIVED':
                return { backgroundColor: '#f3f4f6', borderColor: '#6b7280' };
            default:
                return {};
        }
    };

    return (
        <div style={{
            ...styles.card1,
            ...styles.currentPlanCard,
            ...(isExpiringSoon ? styles.expiringCard : {}),
            ...getStatusStyle()
        }}>
            <div style={styles.currentPlanHeader}>
                <div>
                    <h2 style={styles.currentPlanTitle}>Your Current Plan</h2>
                    <p className='dashboardsubscribecurrentplan' style={styles.currentPlanName}>{subscription.plan.name}</p>
                </div>
                <div style={styles.planIcon}>
                    <Shield size={24} color="#4f46e5" />
                </div>
            </div>

            <div style={styles.currentPlanDetails}>
                <div style={styles.detailItem}>
                    <Calendar size={20} />
                    <span style={isExpiringSoon ? styles.expiringText : {}}>
                        {remainingDays > 0
                            ? `${remainingDays} days remaining`
                            : 'Expires today'}
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

            {/* ✅ NEW: Enhanced Store Status Section */}
            {storeStatus && (
                <div style={styles.storeStatusSection}>
                    <div style={styles.statusDivider}></div>
                    <h3 style={styles.storeStatusTitle}>Store Status</h3>

                    <div style={{
                        ...styles.storeStatusBanner,
                        ...(storeStatus.subscription.can_sell ? styles.storeOnline : styles.storeOffline)
                    }}>
                        <span style={styles.statusIcon}>
                            {getStatusIcon(storeStatus.subscription.status)}
                        </span>
                        <div style={styles.statusDetails}>
                            <span style={styles.statusMessage}>
                                {storeStatus.subscription.message}
                            </span>
                            <span style={styles.orderStatus}>
                                {storeStatus.subscription.can_sell
                                    ? '✅ Accepting Orders'
                                    : '❌ Orders Disabled'
                                }
                            </span>
                        </div>

                        {/* Show archive countdown for offline stores */}
                        {storeStatus.subscription.status === 'OFFLINE' &&
                            storeStatus.subscription.days_until_archive > 0 && (
                                <div style={styles.archiveWarning}>
                                    <span style={styles.archiveText}>
                                        Archive in {storeStatus.subscription.days_until_archive} days
                                    </span>
                                </div>
                            )}
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={loadStoreStatus}
                        disabled={statusLoading}
                        style={styles.refreshButton}
                    >
                        <RefreshCw size={14} style={{
                            animation: statusLoading ? 'spin 1s linear infinite' : 'none'
                        }} />
                        {statusLoading ? 'Updating...' : 'Refresh Status'}
                    </button>
                </div>
            )}

            {isExpiringSoon && (
                <div className='dashboardsubscribeexpiretext' style={styles.expiringWarning}>
                    <AlertCircle style={{flexShrink:'0'}} size={16} />
                    <span>Your plan expires soon. Renew to continue selling online.</span>
                </div>
            )}
        </div>
    );
}

// ✅ FIXED: Move validateStoreForOrder INSIDE the component (no export)
export default function SubscriptionPage() {
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [storeId, setStoreId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);
    const [subscriptionError, setSubscriptionError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [error, setError] = useState('');
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const router = useRouter();

    // ✅ MOVED INSIDE COMPONENT: Order validation function (no export)
    const validateStoreForOrder = async (storeId) => {
        try {
            const response = await axios.get(`${STORE_STATUS_API}/${storeId}/validate-order/`);
            return response.data;
        } catch (error) {
            console.error('❌ Order validation failed:', error);
            return { valid: false, message: 'Unable to validate store status' };
        }
    };

    // ✅ Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            console.log('✅ Razorpay script loaded');
            setRazorpayLoaded(true);
        };
        script.onerror = () => {
            console.error('❌ Failed to load Razorpay script');
            setError('Payment system failed to load. Please refresh the page.');
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // ✅ Updated authentication headers
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('❌ No access token found');
            router.push('/login/seller');
            return null;
        }
        console.log('✅ Using Bearer token for authentication');
        return { Authorization: `Bearer ${token}` };
    }, [router]);

    // ✅ NEW: Load seller's store ID
    const loadStoreId = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/api/store/profile/`, { headers });
            setStoreId(response.data.id);
            console.log('✅ Store ID loaded:', response.data.id);
        } catch (err) {
            console.error('❌ Failed to load store ID:', err);
        }
    }, [getAuthHeaders]);

    // ✅ Updated subscription data loading to match your API
    const loadSubscriptionData = useCallback(async () => {
        setSubscriptionLoading(true);
        setSubscriptionError(null);

        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            console.log('🔍 Fetching current subscription...');
            const subResponse = await axios.get(CURRENT_SUB_API_URL, { headers });
            console.log('✅ Current subscription:', subResponse.data);
            setCurrentSubscription(subResponse.data);
        } catch (subErr) {
            console.log('⚠️ No active subscription found:', subErr.response?.status);
            setCurrentSubscription(null);

            if (subErr.response?.status === 401) {
                setSubscriptionError('Session expired. Please log in again.');
                setTimeout(() => router.push('/login/seller'), 2000);
            } else if (subErr.response?.status === 404) {
                console.log('ℹ️ No subscription found (normal for new users)');
            } else {
                setSubscriptionError('Failed to load subscription data');
            }
        } finally {
            setSubscriptionLoading(false);
        }
    }, [getAuthHeaders, router]);

    // ✅ Updated plans loading to match your API structure
    const loadPlansData = useCallback(async () => {
        try {
            console.log('🔍 Fetching plans from:', PLANS_API_URL);
            const plansResponse = await axios.get(PLANS_API_URL);

            const plansData = plansResponse.data.results || plansResponse.data || [];
            console.log('✅ Plans loaded:', plansData);

            const sortedPlans = plansData.sort((a, b) => {
                const priceA = parseFloat(a.price) || 0;
                const priceB = parseFloat(b.price) || 0;
                return priceA - priceB;
            });

            setPlans(sortedPlans);
        } catch (err) {
            console.error('❌ Failed to load plans:', err);
            setError('Failed to load subscription plans. Please refresh the page.');
        }
    }, []);

    // Load store ID on component mount
    useEffect(() => {
        loadStoreId();
    }, [loadStoreId]);

    // Load plans and subscription data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError('');

            await Promise.all([
                loadPlansData(),
                loadSubscriptionData()
            ]);

            setIsLoading(false);
        };

        loadData();
    }, [loadPlansData, loadSubscriptionData]);

    // ✅ Updated payment handling to match your Django API
    const handleChoosePlan = async (planId, planName) => {
        if (!razorpayLoaded || !window.Razorpay) {
            alert('Payment system is loading. Please wait a moment and try again.');
            return;
        }

        const plan = plans.find(p => p.id === planId);
        if (!plan) {
            alert('Plan not found. Please refresh the page and try again.');
            return;
        }

        const basePrice = parseFloat(plan.price) || 0;
        const yearlyPrice = parseFloat(plan.yearly_price || '') || (basePrice * 12 * 0.90);
        const displayPrice = billingCycle === 'yearly' ? yearlyPrice : basePrice;

        const confirmed = confirm(
            `Subscribe to ${planName}?\n\n` +
            `Price: ₹${Math.round(displayPrice).toLocaleString('en-IN')}/${billingCycle === 'yearly' ? 'year' : 'month'}\n\n` +
            `Click OK to proceed to secure payment.`
        );

        if (!confirmed) return;

        setIsProcessing(planId);
        const headers = getAuthHeaders();
        if (!headers) {
            setIsProcessing(null);
            return;
        }

        try {
            console.log('🔄 Creating order for plan:', planId, 'billing cycle:', billingCycle);

            const orderResponse = await axios.post(CREATE_ORDER_API, {
                plan_id: planId,
                billing_cycle: billingCycle
            }, { headers });

            console.log('✅ Order created:', orderResponse.data);
            const { order_id, amount, currency } = orderResponse.data;

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency || 'INR',
                order_id: order_id,
                name: 'Kerala Sellers',
                description: `${planName} - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`,
                image: '/logo.png',
                theme: {
                    color: '#3b82f6'
                },
                prefill: {
                    name: currentSubscription?.seller?.name || 'Kerala Seller',
                    email: currentSubscription?.seller?.email || 'seller@keralasellers.com'
                },
                handler: async function (response) {
                    console.log('✅ Payment successful:', response);

                    const verificationData = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        plan_id: planId,
                        billing_cycle: billingCycle,
                    };

                    try {
                        const verifyResponse = await axios.post(VERIFY_PAYMENT_API, verificationData, { headers });
                        console.log('✅ Payment verified:', verifyResponse.data);

                        setError('');
                        alert('🎉 Payment Successful!\n\nYour subscription is now active! You can now sell products online with Kerala Sellers Premium features.');

                        await loadSubscriptionData();

                    } catch (verifyError) {
                        console.error('❌ Payment verification failed:', verifyError);

                        if (verifyError.response?.status === 401) {
                            alert('❌ Session expired. Please log in again.');
                            setTimeout(() => router.push('/login/seller'), 2000);
                        } else {
                            const errorMessage = verifyError.response?.data?.error ||
                                verifyError.response?.data?.message ||
                                'Payment verification failed. Please contact support if money was deducted.';
                            alert(`❌ ${errorMessage}`);
                        }
                    } finally {
                        setIsProcessing(null);
                    }
                },
                modal: {
                    ondismiss: () => {
                        console.log('Payment modal dismissed');
                        setIsProcessing(null);
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                console.error('❌ Payment failed:', response.error);
                alert(`❌ Payment failed: ${response.error.description}`);
                setIsProcessing(null);
            });

            rzp.open();

        } catch (error) {
            console.error('❌ Subscription error:', error);

            if (error.response?.status === 401) {
                alert('❌ Session expired. Please log in again.');
                setTimeout(() => router.push('/login/seller'), 2000);
            } else {
                const errorMessage = error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to process subscription. Please try again.';
                alert(`❌ ${errorMessage}`);
            }
            setIsProcessing(null);
        }
    };

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading subscription plans...</p>
            </div>
        );
    }

    return (
        <div className='dashboardsubscriptionpagecontainer' style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 className='dashboardsubscriptiontitle' style={styles.title}>Your Subscription</h1>
                <p className='dashboardsubscriptionsubtitle' style={styles.subtitle}>
                    Manage your plan and unlock premium features for your online store
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div style={styles.errorAlert}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <button onClick={() => setError('')} style={styles.closeAlert}>
                        ×
                    </button>
                </div>
            )}

            {/* Loading indicator for Razorpay */}
            {!razorpayLoaded && (
                <div style={styles.razorpayLoading}>
                    <Loader size={16} />
                    <span>Loading payment system...</span>
                </div>
            )}

            {/* Billing Cycle Toggle */}
            <div className='toggleContainer' style={styles.toggleContainer}>
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
                    <span>Yearly</span>
                    <span className='savingsBadge' style={styles.savingsBadge}>Save 10%</span>
                </button>
            </div>

            {/* ✅ ADD: Coming Soon Notice for Yearly */}
            {billingCycle === 'yearly' && (
                <div style={styles.comingSoonNotice}>
                    <Clock size={18} />
                    <div>
                        <strong>Yearly Plans Coming Soon!</strong>
                        <p style={{margin: '4px 0 0 0'}}>We're preparing annual subscriptions with exclusive discounts. Switch to monthly to subscribe now.</p>
                    </div>
                </div>
            )}

            {/* ✅ ENHANCED: Current Plan Card with Store Status */}
            <CurrentPlanCard
                subscription={currentSubscription}
                isLoading={subscriptionLoading}
                error={subscriptionError}
                onRefresh={loadSubscriptionData}
                storeId={storeId}
            />

            {/* Plans Grid */}
            <div className='plan-grid' style={styles.planGrid}>
                {plans.map((plan, index) => {
                    const basePrice = parseFloat(plan.price) || 0;
                    const yearlyPrice = parseFloat(plan.yearly_price || '') || (basePrice * 12 * 0.90);
                    const displayPrice = billingCycle === 'yearly' ? yearlyPrice : basePrice;

                    const isCurrentPlan = currentSubscription?.plan?.id === plan.id && currentSubscription?.is_active;
                    const isPopular = plan.name.toLowerCase().includes('pro') ||
                        plan.name.toLowerCase().includes('professional') ||
                        index === Math.floor(plans.length / 2);
                    
                    // ✅ ADD: Check if coming soon
                    const isComingSoon = billingCycle === 'yearly';

                    return (
                        <div className="plan-card-wrapper" key={plan.id}>
                            {/* ✅ UPDATED: Show "Most Popular" only if not coming soon */}
                            {isPopular && !isComingSoon && (
                                <div className='popularBadge' style={styles.popularBadge}>
                                    <Star size={16} />
                                    Most Popular
                                </div>
                            )}

                            {/* ✅ ADD: Coming Soon Badge */}
                            {isComingSoon && (
                                <div className='comingSoonBadge' style={styles.comingSoonBadge}>
                                    <Clock size={16} />
                                    Coming Soon
                                </div>
                            )}

                            <div className="glossy-layer"></div>
                            <div
                                className='dashboardsubscriptionplancard'
                                style={{
                                    ...styles.card,
                                    ...(isCurrentPlan ? styles.currentPlanHighlight : {}),
                                    ...(isPopular && !isComingSoon ? styles.popularCard : {}),
                                    ...(isComingSoon ? styles.comingSoonCard : {}) // ✅ ADD: Dim coming soon cards
                                }}>

                                <div className='dashboardsubscribeplanheader' style={styles.planHeader}>
                                    <h2 style={styles.planName}>{plan.name}</h2>
                                    <div className='dashboardsubscribeplanheaderpricecontainer' style={styles.priceContainer}>
                                        <span className='dashboardsubscribeplanheaderprice' style={styles.price}>
                                            ₹{Math.round(displayPrice).toLocaleString('en-IN')}
                                        </span>
                                        <span style={styles.duration}>
                                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                                        </span>
                                    </div>

                                    {billingCycle === 'yearly' && (
                                        <div style={styles.savings}>
                                            <p>Billed as ₹{Math.round(yearlyPrice).toLocaleString('en-IN')} annually</p>
                                            <p style={styles.savingsAmount}>
                                                Save ₹{Math.round((basePrice * 12) - yearlyPrice).toLocaleString('en-IN')} per year
                                            </p>
                                        </div>
                                    )}

                                    {plan.description && (
                                        <p style={styles.planDescription}>{plan.description}</p>
                                    )}
                                </div>

                                <div style={styles.featuresContainer}>
                                    <ul className='dashboardsubscribelistfont' style={styles.featureList}>
                                        <li style={styles.featureItem}>
                                            <CheckCircle size={16} style={styles.checkIcon} />
                                            <span>
                                                {plan.product_limit
                                                    ? `${plan.product_limit} Online Products`
                                                    : 'Unlimited Online Products'
                                                }
                                            </span>
                                        </li>
                                        <li style={styles.featureItem}>
                                            <CheckCircle size={16} style={styles.checkIcon} />
                                            <span>Unlimited stock Products</span>
                                        </li>
                                        <li style={styles.featureItem}>
                                            <CheckCircle size={16} style={styles.checkIcon} />
                                            <span>Professional Storefront</span>
                                        </li>
                                        <li style={styles.featureItem}>
                                            <CheckCircle size={16} style={styles.checkIcon} />
                                            <span>WhatsApp Integration</span>
                                        </li>
                                        <li style={styles.featureItem}>
                                            <CheckCircle size={16} style={styles.checkIcon} />
                                            <span>24/7 Customer Support</span>
                                        </li>
                                        {isPopular && (
                                            <li style={styles.featureItem}>
                                                <Zap size={16} style={{ ...styles.checkIcon, color: '#f59e0b' }} />
                                                <span>Priority Support</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {/* ✅ UPDATED: Button logic for coming soon */}
                                <button
                                    className='dashboardsubscribechooseplanbtn'
                                    style={{
                                        ...styles.button,
                                        ...(isCurrentPlan ? styles.currentPlanButton : {}),
                                        ...(isProcessing === plan.id ? styles.processingButton : {}),
                                        ...(isPopular && !isCurrentPlan && !isComingSoon ? styles.popularButton : {}),
                                        ...(!razorpayLoaded || isComingSoon ? styles.disabledButton : {})
                                    }}
                                    onClick={() => handleChoosePlan(plan.id, plan.name)}
                                    disabled={isProcessing === plan.id || isCurrentPlan || !razorpayLoaded || isComingSoon}
                                >
                                    {isComingSoon ? (
                                        <div style={styles.buttonContent}>
                                            <Clock size={16} />
                                            Coming Soon
                                        </div>
                                    ) : isProcessing === plan.id ? (
                                        <div style={styles.buttonContent}>
                                            <div style={styles.buttonSpinner}></div>
                                            Processing...
                                        </div>
                                    ) : isCurrentPlan ? (
                                        <div style={styles.buttonContent}>
                                            <CheckCircle size={16} />
                                            Current Plan
                                        </div>
                                    ) : (
                                        <div style={styles.buttonContent}>
                                            <CreditCard size={16} />
                                            Choose Plan
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

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
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}

// ✅ ENHANCED STYLES with Coming Soon Support
const styles = {
    container: {
        padding: '24px',
        maxWidth: '1100px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        animation: 'fadeIn 0.6s ease-out'
    },

    // Loading
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px'
    },

    spinner: {
        width: '32px',
        height: '32px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },

    buttonSpinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },

    loadingText: {
        fontSize: '16px',
        color: '#6b7280'
    },

    razorpayLoading: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#eff6ff',
        border: '1px solid #3b82f6',
        borderRadius: '8px',
        color: '#1e40af',
        fontSize: '14px',
        marginBottom: '24px',
        justifyContent: 'center'
    },

    // Header
    header: {
        textAlign: 'center',
        marginBottom: '32px'
    },

    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: 'rgb(59, 130, 246)',
        marginBottom: '12px'
    },

    subtitle: {
        color: '#6b7280',
        fontSize: '17px',
        maxWidth: '600px',
        margin: '0 auto'
    },

    // Error Alert
    errorAlert: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: '#fef2f2',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        color: '#991b1b',
        marginBottom: '24px'
    },

    closeAlert: {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        color: 'inherit',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '4px 8px'
    },

    // Toggle
    toggleContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px',
        backgroundColor: '#f3f4f6',
        padding: '6px',
        borderRadius: '12px',
        width: 'fit-content',
        margin: '0 auto 32px auto',
        border: '1px solid rgb(59, 130, 246)'
    },

    toggleButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '8px',
        transition: 'all 0.2s',
        color: '#6b7280'
    },

    activeToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        border: 'none',
        background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(0, 0, 0))',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: 'white',
    },

    savingsBadge: {
        padding: '2px 6px',
        backgroundColor: '#10b981',
        color: 'white',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600'
    },

    // ✅ ADD: Coming Soon Notice
    comingSoonNotice: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        color: '#92400e',
        marginBottom: '32px',
        maxWidth: '800px',
        margin: '0 auto 32px auto'
    },

    // Cards
    card: {
        width: '100%',
        maxWidth: '320px',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        background: 'linear-gradient(135deg, #3b82f6, #000)',
        position: 'relative',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        margin: '0 auto',
        boxSizing: 'border-box',
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },

    card1: {
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '32px',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'relative',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
    },

    // Current Plan Card Styles
    loadingCard: {
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto 48px auto'
    },

    loadingContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        color: '#6b7280'
    },

    errorCard: {
        backgroundColor: '#fef2f2',
        border: '2px solid #ef4444',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto 48px auto'
    },

    errorTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#991b1b',
        margin: '0 0 8px 0'
    },

    errorText: {
        color: '#991b1b',
        marginBottom: '16px'
    },

    retryButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },

    currentPlanCard: {
        backgroundColor: '#eff6ff',
        border: '2px solid #3b82f6',
        maxWidth: '800px',
        margin: '0 auto 48px auto'
    },

    expiringCard: {
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b'
    },

    noPlanCard: {
        backgroundColor: '#fefce8',
        border: '2px solid #f59e0b',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto 48px auto',
        color: '#92400e'
    },

    currentPlanHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px'
    },

    planIcon: {
        width: '48px',
        height: '48px',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    currentPlanTitle: {
        fontSize: '15px',
        fontWeight: '500',
        color: '#6b7280',
        margin: '0 0 8px 0'
    },

    currentPlanName: {
        fontSize: '30px',
        fontWeight: '700',
        color: '#e5ce4bff',
        margin: 0
    },

    currentPlanDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },

    detailItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        color: '#374151'
    },

    expiringText: {
        color: '#dc2626',
        fontWeight: '600'
    },

    expiringWarning: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '16px',
        padding: '12px 16px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        color: '#92400e',
        fontSize: '14px'
    },

    // ✅ NEW: Store Status Styles
    storeStatusSection: {
        marginTop: '24px',
        paddingTop: '24px'
    },

    storeStatusInfo: {
        marginTop: '24px',
        paddingTop: '24px'
    },

    statusDivider: {
        height: '1px',
        backgroundColor: '#e5e7eb',
        marginBottom: '16px'
    },

    storeStatusTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '12px'
    },

    storeStatusBanner: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '12px',
        border: '2px solid',
        marginBottom: '12px'
    },

    storeOnline: {
        backgroundColor: '#dcfce7',
        borderColor: '#22c55e',
        color: '#166534'
    },

    storeOffline: {
        backgroundColor: '#fee2e2',
        borderColor: '#ef4444',
        color: '#991b1b'
    },

    statusIcon: {
        fontSize: '20px',
        marginRight: '12px'
    },

    statusDetails: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },

    statusMessage: {
        fontSize: '14px',
        fontWeight: '600'
    },

    orderStatus: {
        fontSize: '12px',
        fontWeight: '500',
        opacity: 0.8
    },

    archiveWarning: {
        padding: '8px 12px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '6px',
        border: '1px solid rgba(239, 68, 68, 0.2)'
    },

    archiveText: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#991b1b'
    },

    refreshButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },

    // Plan Cards
    planGrid: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '24px',
    },

    currentPlanHighlight: {
        border: '2px solid #3b82f6',
        transform: 'scale(1.02)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
    },

    popularCard: {
        border: '2px solid #3b82f6',
        transform: 'scale(1.05)',
        zIndex: 1
    },

    popularBadge: {
        position: 'absolute',
        top: '-23px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
        zIndex: 5
    },

    // ✅ ADD: Coming Soon Badge and Card Style
    comingSoonBadge: {
        position: 'absolute',
        top: '-23px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#f59e0b',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
        zIndex: 5
    },

    comingSoonCard: {
        opacity: 0.7,
        border: '2px dashed #d1d5db',
        position: 'relative'
    },

    planHeader: {
        textAlign: 'center',
        marginBottom: '32px'
    },

    planName: {
        fontSize: '18px',
        margin: '12px 0 12px 0',
        fontWeight: '700',
        color: '#e5ce4bff'
    },

    planDescription: {
        fontSize: '13px',
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 1.5,
        marginTop: '8px'
    },

    priceContainer: {
        marginBottom: '16px'
    },

    price: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'white'
    },

    duration: {
        fontSize: '14px',
        color: 'white',
        fontWeight: '500'
    },

    savings: {
        color: '#f4ee5aff',
        fontSize: '14px',
        lineHeight: '1.4'
    },

    savingsAmount: {
        color: '#10b981',
        fontWeight: '600'
    },

    featuresContainer: {
        marginBottom: '32px'
    },

    featureList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },

    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },

    checkIcon: {
        color: '#10b981',
        flexShrink: 0
    },

    // Buttons
    button: {
        width: '75%',
        padding: '10px 24px',
        border: '2px solid #3b82f6',
        borderRadius: '12px',
        backgroundColor: 'white',
        color: '#3b82f6',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    buttonContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },

    popularButton: {
        backgroundColor: '#3b82f6',
        color: 'white'
    },

    currentPlanButton: {
        backgroundColor: '#f3f4f6',
        border: '2px solid #d1d5db',
        color: '#6b7280',
        cursor: 'not-allowed'
    },

    processingButton: {
        backgroundColor: '#f9fafb',
        border: '2px solid #d1d5db',
        color: '#6b7280',
        cursor: 'not-allowed'
    },

    disabledButton: {
        backgroundColor: '#f9fafb',
        border: '2px solid #e5e7eb',
        color: '#9ca3af',
        cursor: 'not-allowed'
    }
};
