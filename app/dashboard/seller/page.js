'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import '../../../styles/DashboardSellerPage.css'
import {
    Store,
    TrendingUp,
    Package,
    ShoppingCart,
    Copy,
    ExternalLink,
    Settings,
    BarChart3,
    Users,
    IndianRupee,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Globe,
    Crown
} from 'lucide-react';

// const getApiBaseUrl = () => {
//     // 1. Check explicit env vars first
//     const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
//     if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
//         console.log(' Env var:', envUrl);
//         return envUrl.trim();
//     }
    
//     // 2. âœ… FIXED: Smart hostname detection
//     if (typeof window !== 'undefined') {
//         const hostname = window.location.hostname;
//         if (hostname === 'localhost' || hostname === '127.0.0.1') {
//             console.log(' Local dev: Using localhost:8000');
//             return 'https://api.keralasellers.in';
//         }
//         console.log(' Production: Using api.keralasellers.in');
//         return 'https://api.keralasellers.in';
//     }
    
//     // 3. Server-side fallback
//     return 'https://api.keralasellers.in';
// };


// const API_BASE_URL = 'https://api.keralasellers.in';
// const DASHBOARD_API_URL = `${API_BASE_URL}/user/dashboard/`;
// const PROFILE_API_URL = `${API_BASE_URL}/user/store/profile/`;
// const SUBSCRIPTION_API_URL = `${API_BASE_URL}/api/subscriptions/current/`; // âœ… Added

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

const DASHBOARD_API_URL = `${API_BASE_URL}/user/dashboard/`;
const PROFILE_API_URL = `${API_BASE_URL}/user/store/profile/`;
const SUBSCRIPTION_API_URL = `${API_BASE_URL}/api/subscriptions/current/`;

console.log(' Layout APIs:', API_BASE_URL);


const getFrontendBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.host}`;
    }
    return process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'https://keralasellers.in';
};

const generateShopSlug = (shop) => {
    if (!shop || !shop.name) return 'shop';

    const shopName = shop.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

    const location = (shop.seller_address || shop.address || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
        .split('-')[0];

    const slug = location ? `${shopName}-${location}` : shopName;
    return slug.length >= 3 ? slug : `shop-${shop.seller_phone || 'store'}`;
};

function SetupStorePrompt() {
    return (
        <div style={styles.setupCard}>
            <div style={styles.setupIconContainer}>
                <Store size={32} color="#f59e0b" />
            </div>
            <h3 style={styles.setupTitle}>Your Kerala store is not yet active!</h3>
            <p style={styles.setupDescription}>
                Complete your store setup to start selling and make your shop visible to customers across Kerala and India.
            </p>
            <div style={styles.setupActions}>
                <Link href="/dashboard/seller/settings" style={styles.setupButton}>
                    <Settings size={18} />
                    Setup Your Store Now
                </Link>
            </div>
            <div style={styles.setupBenefits}>
                <div style={styles.benefit}>
                    <CheckCircle size={16} />
                    <span>Zero commission fees</span>
                </div>
                <div style={styles.benefit}>
                    <CheckCircle size={16} />
                    <span>Reach customers across Kerala</span>
                </div>
                <div style={styles.benefit}>
                    <CheckCircle size={16} />
                    <span>SEO-optimized shop pages</span>
                </div>
                <div style={styles.benefit}>
                    <CheckCircle size={16} />
                    <span>Easy product management</span>
                </div>
            </div>
        </div>
    );
}

function StoreLink({ storeData, phone, copySuccess, onCopy, onVisit }) {
    const getShopUrl = () => {
        if (!phone) return `${getFrontendBaseUrl()}/shop`;

        if (storeData && storeData.name) {
            const shopSlug = generateShopSlug(storeData);
            return `${getFrontendBaseUrl()}/shop/${shopSlug}?id=${phone}`;
        }

        return `${getFrontendBaseUrl()}/shop/shop-${phone}?id=${phone}`;
    };

    const shopUrl = getShopUrl();

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 className='dashboardoverviewcardtitle' style={styles.cardTitle}>
                    <Globe size={20} color='#175E54' />
                    Your Public Storefront
                </h3>
            </div>
            <p className='dashboardoverviewcarddesc' style={styles.cardDescription}>
                Share this SEO-optimized link with your customers to showcase your products across Kerala and beyond.
            </p>
            <div style={styles.linkBox}>
                <div style={styles.urlPreview}>
                    <span style={styles.urlLabel}>Your Store URL:</span>
                    <span className='dashboardoverviewstoreurl' style={styles.storeUrl}>{shopUrl}</span>
                </div>
                <div style={styles.linkActions}>
                    <button
                        className='dashboardoverviewcopybtn'
                        onClick={() => onCopy(shopUrl)}
                        style={{
                            ...styles.copyButton,
                            ...(copySuccess ? styles.copySuccessButton : {})
                        }}
                        disabled={copySuccess}
                    >
                        {copySuccess ? (
                            <>
                                <CheckCircle size={16} />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy size={16} />
                                Copy Link
                            </>
                        )}
                    </button>
                    <button className='dashboardoverviewcopybtn' onClick={() => onVisit(shopUrl)} style={styles.visitButton}>
                        <ExternalLink size={16} color='#175E54' />
                        Visit Store
                    </button>
                </div>
            </div>
            {storeData && storeData.name && (
                <div style={styles.seoInfo}>
                    <div style={styles.seoTag}>
                        <CheckCircle size={14} color='#175E54' />
                        <span>SEO Optimized</span>
                    </div>
                    <span style={styles.seoDescription}>
                        Your store URL includes your business name and location for better search rankings
                    </span>
                </div>
            )}
        </div>
    );
}

// âœ… NEW: Subscription prompt component
function SubscriptionPromptCard() {
    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 className='dashboardoverviewcardtitle' style={styles.cardTitle}>
                    <Globe size={20} color='#ef4444' />
                    Your Public Storefront
                </h3>
            </div>
            <div style={styles.subscriptionPrompt}>
                <Crown size={48} color='#f59e0b' style={{ marginBottom: 16 }} />
                <h4 style={{ margin: '0 0 12px 0', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
                    Subscribe to Get Your Online Shop
                </h4>
                <p style={{ margin: '0 0 20px 0', color: '#6b7280', lineHeight: 1.6, fontSize: '14px' }}>
                    Get your own SEO-optimized online storefront to showcase your products to customers across Kerala and India.
                </p>
                <Link 
                    href="/dashboard/seller/subscription" 
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        fontSize: '14px'
                    }}
                >
                    <Crown size={18} />
                    Subscribe Now
                </Link>
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: '13px' }}>
                        <CheckCircle size={16} />
                        <span>SEO-optimized storefront</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: '13px' }}>
                        <CheckCircle size={16} />
                        <span>Reach customers across Kerala</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: '13px' }}>
                        <CheckCircle size={16} />
                        <span>Zero commission fees</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SellerDashboardOverview() {
    const [dashboardData, setDashboardData] = useState(null);
    const [storeData, setStoreData] = useState(null);
    const [subscription, setSubscription] = useState(null); // âœ… Added
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const router = useRouter();

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('accessToken') ||
            localStorage.getItem('buyerAccessToken') ||
            localStorage.getItem('access_token');
        return token ? { Authorization: `Bearer ${token}` } : null;
    }, []);

    // âœ… NEW: Fetch subscription
    const fetchSubscription = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await axios.get(SUBSCRIPTION_API_URL, { headers });
            setSubscription(response.data);
            console.log(' Subscription loaded:', response.data);
        } catch (err) {
            console.log(' No active subscription found');
            setSubscription(null);
        }
    }, [getAuthHeaders]);

    const fetchDashboardData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) {
            router.push('/login/seller');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log(' Fetching dashboard data...');

            const [dashboardRes, storeRes] = await Promise.all([
                axios.get(DASHBOARD_API_URL, { headers, timeout: 15000 }),
                axios.get(PROFILE_API_URL, { headers, timeout: 15000 }).catch(() => null)
            ]);

            console.log(' Dashboard data received:', dashboardRes.data);
            console.log(' Store profile data:', storeRes?.data);

            setDashboardData(dashboardRes.data);
            setStoreData(storeRes?.data?.store_profile || storeRes?.data || null);

        } catch (error) {
            console.error(' Failed to fetch dashboard data:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('buyerAccessToken');
                localStorage.removeItem('access_token');
                router.push('/login/seller?message=Session expired');
            } else if (error.code === 'ECONNABORTED') {
                setError('Request timed out. Please check your connection and try again.');
            } else {
                setError(error.response?.data?.error || 'Failed to load dashboard data. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, router]);

    useEffect(() => {
        fetchDashboardData();
        fetchSubscription(); // âœ… Added
    }, [fetchDashboardData, fetchSubscription]);

    const copyStoreLink = async (url) => {
        if (!url) return;

        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const visitStore = (url) => {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading your Kerala Sellers dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <AlertCircle size={48} />
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <button onClick={fetchDashboardData} style={styles.retryButton}>
                    <RefreshCw size={18} />
                    Try Again
                </button>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div style={styles.errorContainer}>
                <AlertCircle size={48} />
                <p>No dashboard data available</p>
                <button onClick={fetchDashboardData} style={styles.retryButton}>
                    <RefreshCw size={18} />
                    Reload Dashboard
                </button>
            </div>
        );
    }

    const hasStoreProfile = dashboardData.has_store_profile || (storeData && storeData.name);
    const sellerName = dashboardData.seller?.name || storeData?.seller?.name || storeData?.name || 'Kerala Seller';
    const sellerPhone = dashboardData.seller?.phone || storeData?.seller?.phone || storeData?.phone;

    return (
        <div className='dashboardoverviewcontainer' style={styles.dashboardContainer}>
            <div className='dashboardoverviewheader' style={styles.header}>
                <div className='dashboardoverviewwelcomesection' style={styles.welcomeSection}>
                    <div className='dashboardoverviewavatar' style={styles.avatar}>
                        {storeData?.logo_url ? (
                            <img
                                src={storeData.logo_url}
                                alt={`${storeData.name || sellerName || 'Seller'} logo`}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <div style={styles.logoPlaceholder}>
                                {storeData?.name?.charAt(0)?.toUpperCase() || sellerName?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className='dashboardoverviewwelcometitle' style={styles.welcomeTitle}>Welcome back, <span style={styles.sellernameclr}>{sellerName}</span> !</h1>
                        <p className='dashboardoverviewwelcomesubtitle' style={styles.welcomeSubtitle}>
                            What's New at Your Kerala Store Today
                        </p>
                    </div>
                </div>
                <div className='dashboardoverviewheaderaction' style={styles.headerActions}>
                    <Link className='dashboardoverviewquickaction' href="/dashboard/seller/products" style={styles.quickAction}>
                        <Package size={18} color='#175E54' />
                        Manage Products
                    </Link>
                    <button className='dashboardoverviewrefreshbtn' onClick={() => { fetchDashboardData(); fetchSubscription(); }} style={styles.refreshButton}>
                        <RefreshCw size={16} color='#175E54' />
                        Refresh
                    </button>
                </div>
            </div>

            {hasStoreProfile ? (
                <>
                    <div className='dashboardoverviewstatcontainer' style={styles.statsContainer}>
                        <StatCard
                            title="Total Revenue"
                            value={`₹${(dashboardData.analytics?.total_revenue || 0).toLocaleString('en-IN')}`}
                            icon={<IndianRupee className='dashboardoverviewstaticon' />}
                            color="#3e7572ff"
                            bgColor="rgba(255, 238, 175, 1)"
                        />
                        <StatCard
                            title="Total Orders"
                            value={dashboardData.analytics?.total_orders || 0}
                            icon={<ShoppingCart className='dashboardoverviewstaticon' />}
                            color="#3e7572ff"
                            bgColor="rgba(255, 238, 175, 1)"
                        />
                        <StatCard
                            title="Total Products"
                            value={dashboardData.analytics?.total_products || 0}
                            icon={<Package className='dashboardoverviewstaticon' />}
                            color="#3e7572ff"
                            bgColor="rgba(255, 238, 175, 1)"
                        />
                        <StatCard
                            title="Total Customers"
                            value={dashboardData.analytics?.total_customers || 0}
                            icon={<Users className='dashboardoverviewstaticon' />}
                            color="#3e7572ff"
                            bgColor="rgba(255, 238, 175, 1)"
                        />
                    </div>

                    <div className='dashboardoverviewgridcontainer' style={styles.gridContainer}>
                        {/* âœ… Conditional rendering based on subscription */}
                        {subscription?.is_active ? (
                            <StoreLink
                                storeData={storeData}
                                phone={sellerPhone}
                                copySuccess={copySuccess}
                                onCopy={copyStoreLink}
                                onVisit={visitStore}
                            />
                        ) : (
                            <SubscriptionPromptCard />
                        )}

                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 className='dashboardoverviewcardtitle' style={styles.cardTitle}>
                                    <TrendingUp size={20} color='#175E54' />
                                    Top Selling Products
                                </h3>
                            </div>
                            {dashboardData.analytics?.top_selling_products?.length > 0 ? (
                                <div style={styles.productsList}>
                                    {(() => {
                                        const products = dashboardData.analytics.top_selling_products.slice(0, 4);
                                        const maxSold = Math.max(...products.map(p => p.total_sold || p.sold_count || 0));

                                        return products.map((item, index) => {
                                            const soldCount = item.total_sold || item.sold_count || 0;
                                            const progress = maxSold ? (soldCount / maxSold) * 100 : 0;

                                            return (
                                                <div key={index} style={styles.productItem}>
                                                    <div style={styles.productRank}>#{index + 1}</div>
                                                    <div style={styles.productInfo}>
                                                        <span style={styles.productName}>
                                                            {item.product__name || item.name || 'Product'}
                                                        </span>
                                                        <span style={styles.productSales}>
                                                            {soldCount} sold
                                                        </span>
                                                        <div style={styles.progressBarContainer}>
                                                            <div
                                                                style={{
                                                                    ...styles.progressBarFill,
                                                                    width: `${progress}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            ) : (
                                <div style={styles.emptyState}>
                                    <BarChart3 size={32} color='#175E54' />
                                    <h4>No sales data yet</h4>
                                    <p style={styles.emptyHint}>
                                        Start adding products and sharing your Kerala store link to see analytics!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.quickActionsContainer}>
                        <h3 className='dashboardoverviewsectiontitle' style={styles.sectionTitle}>Quick Actions</h3>
                        <div className='dashboardoverviewquickactiongrid' style={styles.quickActionsGrid}>
                            <Link href="/dashboard/seller/history" style={styles.quickActionCard}>
                                <BarChart3 size={24} color='#175E54' />
                                <span>Stock History</span>
                            </Link>
                            <Link href="/dashboard/seller/orders" style={styles.quickActionCard}>
                                <ShoppingCart size={24} color='#175E54' />
                                <span>View Orders</span>
                            </Link>
                            <Link href="/dashboard/seller/settings" style={styles.quickActionCard}>
                                <Settings size={24} color='#175E54' />
                                <span>Store Settings</span>
                            </Link>
                            <Link href="/dashboard/seller/analytics" style={styles.quickActionCard}>
                                <BarChart3 size={24} color='#175E54' />
                                <span>View Analytics</span>
                            </Link>
                        </div>
                    </div>
                </>
            ) : (
                <SetupStorePrompt />
            )}

            <style jsx>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .dashboard-container {
                animation: fadeIn 0.6s ease-out;
            }
        `}</style>
        </div>
    );
}

function StatCard({ title, value, icon, color, bgColor }) {
    return (
        <div className='dashboardoverviewstatcardcontainer' style={styles.statCard}>
            <div className='dashboardoverviewstaticoncontainer' style={{ ...styles.statIcon, backgroundColor: bgColor, color: color }}>
                {icon}
            </div>
            <div style={styles.statContent}>
                <h3 className='dashboardoverviewstattitle' style={styles.statTitle}>{title}</h3>
                <p className='dashboardoverviewstatvalue' style={styles.statValue}>{value}</p>
            </div>
        </div>
    );
}

const styles = {
    dashboardContainer: {
        padding: '0px 0px 24px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh'
    },

    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px',
        textAlign: 'center',
        color: '#6b7280'
    },

    progressBarContainer: {
        width: '100%',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        marginTop: '6px',
        overflow: 'hidden',
    },

    progressBarFill: {
        height: '100%',
        backgroundColor: '#175E54',
        borderRadius: '4px',
        transition: 'width 0.5s ease',
    },

    spinner: {
        width: '32px',
        height: '32px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },

    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px',
        textAlign: 'center',
        color: '#ef4444'
    },

    retryButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '15px 25px',
        borderRadius: "15px",
        backgroundColor: '#3e7572ff'
    },

    welcomeSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },

    avatar: {
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        overflow: 'hidden',
        marginRight: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E5E7EB',
        flexShrink: 0,
    },

    avatarImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },

    logoPlaceholder: {
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        backgroundColor: '#175E54',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        fontSize: '20px',
        flexShrink: 0,
    },

    welcomeTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: 'white',
        margin: '0 0 8px 0'
    },

    sellernameclr: {
        color: "rgba(255, 238, 175, 1)",
    },

    welcomeSubtitle: {
        fontSize: '14px',
        color: 'white',
        margin: 0,
    },

    headerActions: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
    },

    quickAction: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: 'rgba(255, 238, 175, 1)',
        color: 'black',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },

    refreshButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: 'rgba(255, 238, 175, 1)',
        color: 'black',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },

    setupCard: {
        backgroundColor: '#fefce8',
        border: '2px solid #facc15',
        borderRadius: '16px',
        padding: '40px 32px',
        margin: '20px 0',
        textAlign: 'center'
    },

    setupIconContainer: {
        width: '80px',
        height: '80px',
        backgroundColor: '#fef3c7',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px auto',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
    },

    setupTitle: {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#92400e',
        margin: '0 0 16px 0'
    },

    setupDescription: {
        fontSize: '1.1rem',
        color: '#a16207',
        marginBottom: '32px',
        lineHeight: '1.6',
        maxWidth: '600px',
        margin: '0 auto 32px auto'
    },

    setupActions: {
        marginBottom: '32px'
    },

    setupButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 32px',
        backgroundColor: '#3b82f6',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '16px',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },

    setupBenefits: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '24px'
    },

    benefit: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#059669',
        fontSize: '14px',
        fontWeight: '500'
    },

    statsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '10px',
        marginBottom: '32px'
    },

    statCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        backgroundColor: '#FDFFF0',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(42, 108, 72, 0.3)',
        boxShadow: '0 4px 12px rgba(42, 108, 72, 0.3)',
        transition: 'all 0.2s'
    },

    statIcon: {
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    statContent: {
        flex: 1
    },

    statTitle: {
        margin: '0 0 8px 0',
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },

    statValue: {
        margin: 0,
        fontSize: '24px',
        fontWeight: '700',
        color: '#1f2937'
    },

    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
    },

    card: {
        padding: '24px',
        backgroundColor: '#FDFFF0',
        borderRadius: '12px',
        border: '1px solid rgba(42, 108, 72, 0.3)',
        boxShadow: '0 4px 12px rgba(42, 108, 72, 0.3)',
        transition: 'all 0.2s'
    },

    cardHeader: {
        marginBottom: '16px'
    },

    cardTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#175E54'
    },

    cardDescription: {
        fontSize: '14px',
        color: '#6b7280',
        margin: '0 0 20px 0',
        lineHeight: '1.5'
    },

    linkBox: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#FDFFF0',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #bfc0c2ff'
    },

    urlPreview: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },

    urlLabel: {
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },

    storeUrl: {
        fontSize: '14px',
        color: '#374151',
        wordBreak: 'break-all',
        fontFamily: 'monospace',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #d1d5db'
    },

    linkActions: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },

    copyButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        border: '1px solid #d1d5db',
        cursor: 'pointer',
        backgroundColor: 'rgba(255, 238, 175, 1)',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: 'black',
        transition: 'all 0.2s'
    },

    copySuccessButton: {
        backgroundColor: '#ecfdf5',
        color: '#059669'
    },

    visitButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: 'rgba(255, 238, 175, 1)',
        color: 'black',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },

    seoInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '6px',
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#FDFFF0',
        borderRadius: '8px',
        border: '1px solid #bfc0c2ff',
    },

    seoTag: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#059669',
        fontSize: '12px',
        fontWeight: '600',
    },

    seoDescription: {
        fontSize: '12px',
        color: '#047857',
        lineHeight: '1.5',
    },

    // âœ… NEW: Subscription prompt styles
    subscriptionPrompt: {
        textAlign: 'center',
        padding: '30px 20px',
        backgroundColor: '#fef2f2',
        borderRadius: '12px',
        border: '2px dashed #fca5a5'
    },

    productsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },

    productItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#FDFFF0',
        borderRadius: '10px',
        border: '1px solid #1a4845',
        transition: 'all 0.2s'
    },

    productRank: {
        width: '36px',
        height: '36px',
        backgroundColor: 'rgba(255, 238, 175, 1)',
        color: 'black',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '700',
        flexShrink: 0
    },

    productInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },

    productName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1f2937'
    },

    productSales: {
        fontSize: '12px',
        color: '#6b7280'
    },

    emptyState: {
        textAlign: 'center',
        padding: '40px 20px',
        color: '#6b7280'
    },

    emptyHint: {
        fontSize: '14px',
        color: '#9ca3af',
        margin: '12px 0 0 0',
        lineHeight: '1.5'
    },

    quickActionsContainer: {
        marginTop: '40px'
    },

    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '20px'
    },

    quickActionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
    },

    quickActionCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '32px 24px',
        backgroundColor: '#FDFFF0',
        borderRadius: '12px',
        textDecoration: 'none',
        color: '#374151',
        transition: 'all 0.2s ease',
        textAlign: 'center',
        border: '1px solid rgba(42, 108, 72, 0.3)',
        boxShadow: '0 4px 12px rgba(42, 108, 72, 0.3)',
    }
};



