'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  CheckCircle
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DASHBOARD_URL = `${API_BASE_URL}/user/dashboard/`;

// Frontend base URL for store links
const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000';

// --- Sub-component for the "Setup Your Store" prompt ---
function SetupStorePrompt() {
    return (
        <div style={styles.setupCard}>
            <div style={styles.setupIconContainer}>
                <Store size={32} color="#f59e0b" />
            </div>
            <h3 style={styles.setupTitle}>Your store is not yet active!</h3>
            <p style={styles.setupDescription}>
                Complete your store setup to start selling and make your shop visible to customers.
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
                    <span>Easy product management</span>
                </div>
            </div>
        </div>
    );
}

// --- Main Dashboard Page Component ---
export default function SellerDashboardOverview() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        router.push('/login/seller');
        return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
        console.log('Fetching dashboard data from:', DASHBOARD_URL);
        const response = await axios.get(DASHBOARD_URL, { 
            headers: { Authorization: `Token ${token}` } 
        });
        
        console.log('Dashboard data received:', response.data);
        setDashboardData(response.data);
    } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        if (err.response?.status === 401) {
            localStorage.removeItem('accessToken');
            router.push('/login/seller');
        } else {
            setError('Failed to load dashboard data. Please refresh the page.');
        }
    } finally {
        setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const copyStoreLink = async () => {
    const storeUrl = `${FRONTEND_BASE_URL}/shop/${dashboardData.seller.phone}`;
    try {
        await navigator.clipboard.writeText(storeUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = storeUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const visitStore = () => {
    const storeUrl = `${FRONTEND_BASE_URL}/shop/${dashboardData.seller.phone}`;
    window.open(storeUrl, '_blank');
  };

  if (isLoading) {
    return (
        <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading your dashboard...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div style={styles.errorContainer}>
            <AlertCircle size={48} />
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button onClick={fetchData} style={styles.retryButton}>
                Try Again
            </button>
        </div>
    );
  }

  if (!dashboardData) {
    return (
        <div style={styles.errorContainer}>
            <AlertCircle size={48} />
            <p>Could not load dashboard data.</p>
            <button onClick={fetchData} style={styles.retryButton}>
                Reload Dashboard
            </button>
        </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
        {/* Header */}
        <div style={styles.header}>
            <div>
                <h1 style={styles.welcomeTitle}>
                    Welcome back, {dashboardData.seller?.name || 'Seller'}!
                </h1>
                <p style={styles.welcomeSubtitle}>
                    Here's what's happening with your store today
                </p>
            </div>
            <div style={styles.headerActions}>
                <Link href="/dashboard/seller/products" style={styles.quickAction}>
                    <Package size={18} />
                    Manage Products
                </Link>
            </div>
        </div>

        {/* ✅ Corrected conditional logic */}
        {dashboardData.has_store_profile ? (
            <>
                {/* Statistics Cards */}
                <div style={styles.statsContainer}>
                    <StatCard 
                        title="Total Revenue" 
                        value={`₹${(dashboardData.analytics?.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
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
                        title="Customers" 
                        value={dashboardData.analytics?.total_customers || 0}
                        icon={<Users size={24} />}
                        color="#f59e0b"
                        bgColor="#fef3c7"
                    />
                </div>

                {/* Main Content Grid */}
                <div style={styles.gridContainer}>
                    {/* Store Link Card */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>
                                <Store size={20} />
                                Your Public Storefront
                            </h3>
                        </div>
                        <p style={styles.cardDescription}>
                            Share this link with your customers to showcase your products.
                        </p>
                        <div style={styles.linkBox}>
                            <span style={styles.storeUrl}>
                                {`${FRONTEND_BASE_URL}/shop/${dashboardData.seller.phone}`}
                            </span>
                            <div style={styles.linkActions}>
                                <button 
                                    onClick={copyStoreLink} 
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
                                            Copy
                                        </>
                                    )}
                                </button>
                                <button onClick={visitStore} style={styles.visitButton}>
                                    <ExternalLink size={16} />
                                    Visit
                                </button>
                            </div>
                        </div>
                    </div>

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
                                                {item.product__name}
                                            </span>
                                            <span style={styles.productSales}>
                                                {item.total_sold} sold
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={styles.emptyState}>
                                <BarChart3 size={32} />
                                <p>No sales data yet</p>
                                <p style={styles.emptyHint}>
                                    Start adding products and sharing your store link!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={styles.quickActionsContainer}>
                    <h3 style={styles.sectionTitle}>Quick Actions</h3>
                    <div style={styles.quickActionsGrid}>
                        <Link href="/dashboard/seller/products/add" style={styles.quickActionCard}>
                            <Package size={24} />
                            <span>Add New Product</span>
                        </Link>
                        <Link href="/dashboard/seller/orders" style={styles.quickActionCard}>
                            <ShoppingCart size={24} />
                            <span>View Orders</span>
                        </Link>
                        <Link href="/dashboard/seller/settings" style={styles.quickActionCard}>
                            <Settings size={24} />
                            <span>Store Settings</span>
                        </Link>
                    </div>
                </div>
            </>
        ) : (
            <SetupStorePrompt />
        )}

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
                50% { opacity: 0.8; }
            }
        `}</style>
    </div>
  );
}

// Enhanced StatCard component
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

const styles = {
    dashboardContainer: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
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
        minHeight: '400px',
        gap: '20px',
        textAlign: 'center',
        color: '#ef4444'
    },
    
    retryButton: {
        padding: '12px 24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500'
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
        margin: 0
    },
    
    headerActions: {
        display: 'flex',
        gap: '12px'
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
        fontWeight: '500'
    },
    
    // Setup Store Prompt Styles
    setupCard: { 
        backgroundColor: '#fefce8', 
        border: '2px solid #facc15', 
        borderRadius: '16px', 
        padding: '32px', 
        margin: '20px 0', 
        textAlign: 'center'
    },
    
    setupIconContainer: {
        width: '64px',
        height: '64px',
        backgroundColor: '#fef3c7',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto'
    },
    
    setupTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#92400e',
        margin: '0 0 12px 0'
    },
    
    setupDescription: {
        fontSize: '1rem',
        color: '#a16207',
        marginBottom: '24px',
        lineHeight: '1.5'
    },
    
    setupActions: {
        marginBottom: '24px'
    },
    
    setupButton: { 
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 24px', 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '8px', 
        fontWeight: '600',
        fontSize: '16px'
    },
    
    setupBenefits: {
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        flexWrap: 'wrap'
    },
    
    benefit: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#059669',
        fontSize: '14px',
        fontWeight: '500'
    },
    
    // Statistics Cards
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
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
        fontWeight: '500'
    },
    
    statValue: { 
        margin: 0, 
        fontSize: '24px', 
        fontWeight: '700',
        color: '#1f2937'
    },
    
    // Main Content Grid
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
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    
    cardHeader: {
        marginBottom: '16px'
    },
    
    cardTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937'
    },
    
    cardDescription: {
        fontSize: '14px',
        color: '#6b7280',
        margin: '0 0 16px 0',
        lineHeight: '1.5'
    },
    
    linkBox: { 
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#f8fafc', 
        padding: '16px', 
        borderRadius: '8px', 
        border: '1px solid #e2e8f0'
    },
    
    storeUrl: {
        fontSize: '14px',
        color: '#374151',
        wordBreak: 'break-all',
        fontFamily: 'monospace'
    },
    
    linkActions: {
        display: 'flex',
        gap: '8px'
    },
    
    copyButton: { 
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px', 
        border: '1px solid #d1d5db', 
        cursor: 'pointer', 
        backgroundColor: 'white',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
    },
    
    copySuccessButton: {
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
        color: '#059669'
    },
    
    visitButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    
    // Products List
    productsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    
    productItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },
    
    productRank: {
        width: '32px',
        height: '32px',
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600'
    },
    
    productInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    
    productName: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#1f2937'
    },
    
    productSales: {
        fontSize: '12px',
        color: '#6b7280'
    },
    
    emptyState: {
        textAlign: 'center',
        padding: '32px',
        color: '#6b7280'
    },
    
    emptyHint: {
        fontSize: '14px',
        color: '#9ca3af',
        margin: '8px 0 0 0'
    },
    
    // Quick Actions
    quickActionsContainer: {
        marginTop: '32px'
    },
    
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '16px'
    },
    
    quickActionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
    },
    
    quickActionCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '24px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        textDecoration: 'none',
        color: '#374151',
        transition: 'all 0.2s ease',
        textAlign: 'center'
    }
};
