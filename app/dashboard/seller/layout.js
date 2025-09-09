'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import DashboardHeader from '../../../components/common/DashboardHeader';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Bell, 
  BarChart3, 
  History, 
  CreditCard, 
  Settings, 
  Crown,
  Store,
  LogOut
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const PROFILE_API_URL = `${API_BASE_URL}/user/store/profile/`;
const DASHBOARD_API_URL = `${API_BASE_URL}/user/dashboard/`;

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sellerName, setSellerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const hasInitialized = useRef(false); // ✅ Prevent infinite loops
  
  // State for notification counts
  const [notificationCounts, setNotificationCounts] = useState({
    orders: 0,
    notifications: 0
  });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Token ${token}` } : null;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    // ✅ Prevent multiple simultaneous calls
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const headers = getAuthHeaders();
    if (!headers) {
      router.replace('/login/seller');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Fetching dashboard data from:', { PROFILE_API_URL, DASHBOARD_API_URL });
      
      // Fetch both profile and dashboard data
      const [profileRes, dashRes] = await Promise.all([
        axios.get(PROFILE_API_URL, { headers }),
        axios.get(DASHBOARD_API_URL, { headers })
      ]);

      console.log('Profile response:', profileRes.data);
      console.log('Dashboard response:', dashRes.data);

      setSellerName(profileRes.data.name || 'Seller');
      
      // Set notification counts from dashboard data
      if (dashRes.data.analytics) {
        setNotificationCounts({
          orders: dashRes.data.analytics.new_orders_count || 0,
          notifications: dashRes.data.analytics.unread_notifications_count || 0,
        });
      }

      // ✅ Enhanced profile completion check
      const isComplete = profileRes.data.is_profile_complete;
      const isOnSettingsPage = pathname === '/dashboard/seller/settings';
      
      if (!isComplete && !isOnSettingsPage) {
        router.replace('/dashboard/seller/settings?setup=true');
      }
      
    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
      
      if (error.response?.status === 401) {
        // ✅ Clear token and redirect only once
        localStorage.removeItem('accessToken');
        router.replace('/login/seller?message=Session expired');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, pathname, router]);

  // ✅ Simplified useEffect with proper dependency management
  useEffect(() => {
    // Reset initialization flag when pathname changes
    hasInitialized.current = false;
    fetchDashboardData();
  }, [pathname]); // Only depend on pathname

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.replace('/login/seller');
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Verifying your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => {
          hasInitialized.current = false;
          fetchDashboardData();
        }} style={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  const navSections = [
    {
      title: 'SALES & E-COMMERCE',
      items: [
        { 
          name: 'Products', 
          href: '/dashboard/seller/products', 
          icon: <Package size={18} />
        },
        { 
          name: 'Orders', 
          href: '/dashboard/seller/orders', 
          count: notificationCounts.orders,
          icon: <ShoppingCart size={18} />
        },
        { 
          name: 'Notifications', 
          href: '/dashboard/seller/notifications', 
          count: notificationCounts.notifications,
          icon: <Bell size={18} />
        },
      ]
    },
    {
      title: 'INVENTORY',
      items: [
        { 
          name: 'Stock', 
          href: '/dashboard/seller/stock',
          icon: <BarChart3 size={18} />
        },
        { 
          name: 'History', 
          href: '/dashboard/seller/history',
          icon: <History size={18} />
        },
      ]
    }
  ];

  return (
    <div style={styles.layoutContainer}>
      {/* Enhanced Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoContainer}>
            <Store size={24} color="#3b82f6" />
            <h2 style={styles.logoText}>Seller Panel</h2>
          </div>
          <p style={styles.welcomeMessage}>Welcome, {sellerName}</p>
        </div>

        <nav style={styles.nav}>
          <NavItem 
            href="/dashboard/seller" 
            name="Overview" 
            pathname={pathname}
            icon={<Home size={18} />}
          />
          <NavItem 
            href="/dashboard/seller/billing" 
            name="Local Billing" 
            pathname={pathname}
            icon={<CreditCard size={18} />}
          />
          
          {navSections.map(section => (
            <div key={section.title} style={styles.navSection}>
              <h3 style={styles.sectionTitle}>{section.title}</h3>
              {section.items.map(item => (
                <NavItem 
                  key={item.name} 
                  href={item.href} 
                  name={item.name} 
                  pathname={pathname} 
                  count={item.count}
                  icon={item.icon}
                />
              ))}
            </div>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <h3 style={styles.sectionTitle}>ACCOUNT</h3>
          <NavItem 
            href="/dashboard/seller/settings" 
            name="Settings" 
            pathname={pathname}
            icon={<Settings size={18} />}
          />
          <NavItem 
            href="/dashboard/seller/subscription" 
            name="Subscription" 
            pathname={pathname}
            icon={<Crown size={18} />}
          />
          
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContentWrapper}>
        <DashboardHeader sellerName={sellerName} />
        <main style={styles.mainContent}>
          {children}
        </main>
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
      `}</style>
    </div>
  );
}

// Enhanced NavItem component
function NavItem({ href, name, pathname, count = 0, icon }) {
    const isActive = href === '/dashboard/seller' ? pathname === href : pathname.startsWith(href);
    
    return (
        <Link 
          href={href} 
          style={{
            ...styles.navLink, 
            ...(isActive ? styles.activeLink : {})
          }}
        >
          <div style={styles.navItemContent}>
            {icon}
            <span>{name}</span>
          </div>
          {count > 0 && (
            <span style={styles.indicator}>
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Link>
    );
}

const styles = {
  layoutContainer: { 
    display: 'flex', 
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '20px',
    backgroundColor: '#f8fafc'
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
    minHeight: '100vh',
    gap: '20px',
    textAlign: 'center',
    color: '#ef4444',
    backgroundColor: '#f8fafc'
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
  
  sidebar: { 
    width: '280px', 
    background: 'white', 
    padding: '0', 
    borderRight: '1px solid #e5e7eb', 
    display: 'flex', 
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid #e5e7eb'
  },
  
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  
  logoText: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937'
  },
  
  welcomeMessage: { 
    margin: 0, 
    color: '#6b7280',
    fontSize: '14px'
  },
  
  nav: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '4px',
    padding: '16px 12px',
    flex: 1
  },
  
  navSection: {
    marginTop: '24px'
  },
  
  sectionTitle: { 
    fontSize: '11px', 
    color: '#9ca3af', 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
    marginBottom: '12px', 
    padding: '0 12px',
    fontWeight: '600'
  },
  
  navLink: { 
    textDecoration: 'none', 
    color: '#6b7280', 
    padding: '12px 16px', 
    borderRadius: '8px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    transition: 'all 0.2s ease',
    margin: '2px 0'
  },
  
  activeLink: { 
    backgroundColor: '#eff6ff', 
    color: '#3b82f6',
    fontWeight: '600',
    borderLeft: '3px solid #3b82f6'
  },
  
  navItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  indicator: { 
    backgroundColor: '#ef4444', 
    color: 'white', 
    borderRadius: '10px', 
    minWidth: '20px',
    height: '20px', 
    fontSize: '11px',
    fontWeight: '600',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '0 6px'
  },
  
  sidebarFooter: {
    padding: '16px 12px 24px 12px',
    borderTop: '1px solid #e5e7eb',
    marginTop: 'auto'
  },
  
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    marginTop: '8px'
  },
  
  mainContentWrapper: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column',
    overflow: 'hidden'
  },
  
  mainContent: { 
    flex: 1, 
    padding: '24px', 
    backgroundColor: '#f8fafc', 
    overflowY: 'auto',
    animation: 'fadeIn 0.6s ease-out'
  },
};
