'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
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
  Globe
} from 'lucide-react';

// ✅ Enhanced API Configuration
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
const DASHBOARD_API_URL = `${API_BASE_URL}/user/dashboard/`;
const PROFILE_API_URL = `${API_BASE_URL}/user/store/profile/`;

// ✅ Enhanced Frontend base URL for store links
const getFrontendBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000';
};

// ✅ SEO-friendly URL generator (same as in other components)
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

// ✅ Enhanced Setup Store Prompt Component
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

// ✅ Enhanced Store Link Component
function StoreLink({ storeData, phone, copySuccess, onCopy, onVisit }) {
    // Generate SEO-friendly shop URL
    const getShopUrl = () => {
        if (!phone) return `${getFrontendBaseUrl()}/shop`;
        
        if (storeData && storeData.name) {
            const shopSlug = generateShopSlug(storeData);
            return `${getFrontendBaseUrl()}/shop/${shopSlug}?id=${phone}`;
        }
        
        // Fallback to direct phone URL for incomplete profiles
        return `${getFrontendBaseUrl()}/shop/shop-${phone}?id=${phone}`;
    };

    const shopUrl = getShopUrl();

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                    <Globe size={20} />
                    Your Public Storefront
                </h3>
            </div>
            <p style={styles.cardDescription}>
                Share this SEO-optimized link with your customers to showcase your products across Kerala and beyond.
            </p>
            <div style={styles.linkBox}>
                <div style={styles.urlPreview}>
                    <span style={styles.urlLabel}>Your Store URL:</span>
                    <span style={styles.storeUrl}>{shopUrl}</span>
                </div>
                <div style={styles.linkActions}>
                    <button 
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
                    <button onClick={() => onVisit(shopUrl)} style={styles.visitButton}>
                        <ExternalLink size={16} />
                        Visit Store
                    </button>
                </div>
            </div>
            {storeData && storeData.name && (
                <div style={styles.seoInfo}>
                    <div style={styles.seoTag}>
                        <CheckCircle size={14} />
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

// Main Dashboard Overview Component
export default function SellerDashboardOverview() {
  const [dashboardData, setDashboardData] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();

  // Get authentication headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken') || 
                 localStorage.getItem('buyerAccessToken') ||
                 localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  // ✅ Enhanced fetch function with better error handling
  const fetchDashboardData = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      router.push('/login/seller');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Fetching dashboard data...');
      
      // Fetch both dashboard and store profile data
      const [dashboardRes, storeRes] = await Promise.all([
        axios.get(DASHBOARD_API_URL, { headers, timeout: 15000 }),
        axios.get(PROFILE_API_URL, { headers, timeout: 15000 }).catch(() => null) // Don't fail if profile doesn't exist
      ]);

      console.log('✅ Dashboard data received:', dashboardRes.data);
      console.log('✅ Store profile data:', storeRes?.data);

      setDashboardData(dashboardRes.data);
      setStoreData(storeRes?.data?.store_profile || storeRes?.data || null);

    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
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
  }, [fetchDashboardData]);

  // ✅ Enhanced copy function that handles SEO URLs
  const copyStoreLink = async (url) => {
    if (!url) return;
    
    try {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
        // Fallback for browsers that don't support clipboard API
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

  // ✅ Enhanced visit store function
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

  // Determine if store profile is complete
  const hasStoreProfile = dashboardData.has_store_profile || (storeData && storeData.name);
  const sellerName = dashboardData.seller?.name || storeData?.seller?.name || storeData?.name || 'Kerala Seller';
  const sellerPhone = dashboardData.seller?.phone || storeData?.seller?.phone || storeData?.phone;

  return (
    <div style={styles.dashboardContainer}>
        {/* ✅ Enhanced Header */}
        <div style={styles.header}>
            <div>
                <h1 style={styles.welcomeTitle}>
                    Welcome back, {sellerName}! 🌴
                </h1>
                <p style={styles.welcomeSubtitle}>
                    Here's what's happening with your Kerala store today
                </p>
            </div>
            <div style={styles.headerActions}>
                <Link href="/dashboard/seller/products" style={styles.quickAction}>
                    <Package size={18} />
                    Manage Products
                </Link>
                <button onClick={fetchDashboardData} style={styles.refreshButton}>
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>
        </div>

        {hasStoreProfile ? (
            <>
                {/* ✅ Enhanced Statistics Cards */}
                <div style={styles.statsContainer}>
                    <StatCard 
                        title="Total Revenue" 
                        value={`₹${(dashboardData.analytics?.total_revenue || 0).toLocaleString('en-IN')}`}
                        icon={<IndianRupee size={24} />}
                        color="#059669"
                        bgColor="#ecfdf5"
                    />
                    <StatCard 
                        title="Total Orders" 
                        value={dashboardData.analytics?.total_orders || 0}
                        icon={<ShoppingCart size={24} />}
                        color="#3b82f6"
                        bgColor="#eff6ff"
                    />
                    <StatCard 
                        title="Total Products" 
                        value={dashboardData.analytics?.total_products || 0}
                        icon={<Package size={24} />}
                        color="#8b5cf6"
                        bgColor="#f3e8ff"
                    />
                    <StatCard 
                        title="Total Customers" 
                        value={dashboardData.analytics?.total_customers || 0}
                        icon={<Users size={24} />}
                        color="#f59e0b"
                        bgColor="#fef3c7"
                    />
                </div>

                {/* ✅ Enhanced Main Content Grid */}
                <div style={styles.gridContainer}>
                    {/* ✅ Enhanced Store Link Card with SEO URLs */}
                    <StoreLink 
                        storeData={storeData}
                        phone={sellerPhone}
                        copySuccess={copySuccess}
                        onCopy={copyStoreLink}
                        onVisit={visitStore}
                    />

                    {/* Top Selling Products */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>
                                <TrendingUp size={20} />
                                Top Selling Products
                            </h3>
                        </div>
                        {dashboardData.analytics?.top_selling_products?.length > 0 ? (
                            <div style={styles.productsList}>
                                {dashboardData.analytics.top_selling_products.slice(0, 5).map((item, index) => (
                                    <div key={index} style={styles.productItem}>
                                        <div style={styles.productRank}>#{index + 1}</div>
                                        <div style={styles.productInfo}>
                                            <span style={styles.productName}>
                                                {item.product__name || item.name || 'Product'}
                                            </span>
                                            <span style={styles.productSales}>
                                                {item.total_sold || item.sold_count || 0} sold
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={styles.emptyState}>
                                <BarChart3 size={32} />
                                <h4>No sales data yet</h4>
                                <p style={styles.emptyHint}>
                                    Start adding products and sharing your Kerala store link to see analytics!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ Enhanced Quick Actions */}
                <div style={styles.quickActionsContainer}>
                    <h3 style={styles.sectionTitle}>Quick Actions</h3>
                    <div style={styles.quickActionsGrid}>
                        <Link href="/dashboard/seller/history" style={styles.quickActionCard}>
    <BarChart3 size={24} />
    <span>Stock History</span>
</Link>
                        <Link href="/dashboard/seller/orders" style={styles.quickActionCard}>
                            <ShoppingCart size={24} />
                            <span>View Orders</span>
                        </Link>
                        <Link href="/dashboard/seller/settings" style={styles.quickActionCard}>
                            <Settings size={24} />
                            <span>Store Settings</span>
                        </Link>
                        <Link href="/dashboard/seller/analytics" style={styles.quickActionCard}>
                            <BarChart3 size={24} />
                            <span>View Analytics</span>
                        </Link>
                    </div>
                </div>
            </>
        ) : (
            <SetupStorePrompt />
        )}

        {/* ✅ CSS Animations */}
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

// ✅ Enhanced StatCard component
function StatCard({ title, value, icon, color, bgColor }) {
    return (
        <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: bgColor, color: color}}>
                {icon}
            </div>
            <div style={styles.statContent}>
                <h3 style={styles.statTitle}>{title}</h3>
                <p style={styles.statValue}>{value}</p>
            </div>
        </div>
    );
}

// ✅ Enhanced styles with better visual hierarchy
const styles = {
    dashboardContainer: {
        padding: '24px',
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
        gap: '16px'
    },
    
    welcomeTitle: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1f2937',
        margin: '0 0 8px 0'
    },
    
    welcomeSubtitle: {
        fontSize: '1rem',
        color: '#6b7280',
        margin: 0,
        lineHeight: '1.5'
    },
    
    headerActions: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    
    quickAction: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    
    refreshButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px',
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    
    // ✅ Enhanced Setup Card
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
    
    // Statistics
    statsContainer: { 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px', 
        marginBottom: '32px'
    },
    
    statCard: { 
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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
    
    // Grid
    gridContainer: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
    },
    
    card: { 
        padding: '24px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
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
        color: '#1f2937'
    },
    
    cardDescription: {
        fontSize: '14px',
        color: '#6b7280',
        margin: '0 0 20px 0',
        lineHeight: '1.5'
    },
    
    // ✅ Enhanced Link Box
    linkBox: { 
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f8fafc', 
        padding: '20px', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0'
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
        backgroundColor: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        transition: 'all 0.2s'
    },
    
    copySuccessButton: {
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
        color: '#059669'
    },
    
    visitButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },

    // ✅ New SEO Info
    seoInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#ecfdf5',
        borderRadius: '8px',
        border: '1px solid #10b981'
    },

    seoTag: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#059669',
        fontSize: '12px',
        fontWeight: '600'
    },

    seoDescription: {
        fontSize: '12px',
        color: '#047857',
        flex: 1
    },
    
    // Products
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
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s'
    },
    
    productRank: {
        width: '36px',
        height: '36px',
        backgroundColor: '#3b82f6',
        color: 'white',
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
    
    // Quick Actions
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
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        textDecoration: 'none',
        color: '#374151',
        transition: 'all 0.2s ease',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }
};
