'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import DashboardHeader from '../../../components/common/DashboardHeader';
import '../../../styles/DashboardSellerPage.css'

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

// ✅ FIXED: Use hostname detection (same as your login page)
const getApiBaseUrl = () => {
  const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log(' Local dev: Using localhost:8000');
    return 'http://localhost:8000';
    }
    return 'https://api.keralasellers.in';
  }
  return 'https://api.keralasellers.in';
};

const API_BASE_URL = 'https://api.keralasellers.in';
const PROFILE_API_URL = `${API_BASE_URL}/user/store/profile/`;
const DASHBOARD_API_URL = `${API_BASE_URL}/user/dashboard/`;
const NOTIFICATIONS_API_URL = `${API_BASE_URL}/api/notifications/count/`;


export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sellerName, setSellerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const hasInitialized = useRef(false);
  const isLoggingOut = useRef(false); // ✅ CRITICAL: Prevent logout loops
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  const [notificationCounts, setNotificationCounts] = useState({
    orders: 0,
    notifications: 0
  });

  // ✅ FIXED: Better auth headers with validation
  const getAuthHeaders = useCallback(() => {
    if (isLoggingOut.current) return null; // Don't try to get headers if logging out

    try {
      const token = localStorage.getItem('accessToken');
      if (!token || token === 'null' || token === 'undefined') {
        console.log('No valid auth token found');
        return null;
      }
      return { Authorization: `Bearer ${token}` };
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }, []);

  // ✅ FIXED: Fetch notification counts with better error handling
  const fetchNotificationCounts = useCallback(async () => {
    if (isLoggingOut.current) return; // Don't fetch if logging out

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await axios.get(NOTIFICATIONS_API_URL, {
        headers,
        timeout: 8000 // 8 second timeout
      });

      if (!isLoggingOut.current) { // Only update if not logging out
        setNotificationCounts(prev => ({
          ...prev,
          notifications: response.data.unread_count || 0
        }));
      }
    } catch (error) {
      if (error.response?.status !== 401 && !isLoggingOut.current) {
        console.error('Failed to fetch notification counts:', error);
      }
    }
  }, [getAuthHeaders]);

  // ✅ FIXED: Dashboard data fetching with proper cleanup
  const fetchDashboardData = useCallback(async () => {
    if (hasInitialized.current || isLoggingOut.current) return;

    const headers = getAuthHeaders();
    if (!headers) {
      console.log('No auth headers, redirecting to login');
      if (!isLoggingOut.current) {
        isLoggingOut.current = true;
        router.replace('/login/seller');
      }
      return;
    }

    hasInitialized.current = true;
    setIsLoading(true);
    setError('');

    try {
      console.log('Fetching dashboard data...');

      // Fetch profile data with timeout
      const profileRes = await axios.get(PROFILE_API_URL, {
        headers,
        timeout: 12000 // 12 second timeout
      });

      // Only proceed if not logging out
      if (isLoggingOut.current) return;

      console.log('Profile data received successfully');

      // Handle seller name from multiple possible response structures
      const name = profileRes.data.seller?.name ||
        profileRes.data.store_profile?.name ||
        profileRes.data.name ||
        'Seller';

      setSellerName(name);

      // Try to fetch dashboard data (optional)
      try {
        const dashRes = await axios.get(DASHBOARD_API_URL, {
          headers,
          timeout: 8000
        });

        if (dashRes.data.analytics && !isLoggingOut.current) {
          setNotificationCounts({
            orders: dashRes.data.analytics.new_orders_count || 0,
            notifications: dashRes.data.analytics.unread_notifications_count || 0,
          });
        }
      } catch (dashError) {
        console.warn('Dashboard API failed (non-critical):', dashError.message);
      }

      // Fetch notification counts separately
      if (!isLoggingOut.current) {
        fetchNotificationCounts();
      }

      // Profile completion check
      const isComplete = profileRes.data.is_profile_complete ||
        (profileRes.data.store_profile && profileRes.data.store_profile.is_profile_complete);
      const isOnSettingsPage = pathname === '/dashboard/seller/settings';

      if (!isComplete && !isOnSettingsPage && !isLoggingOut.current) {
        console.log('Profile incomplete, redirecting to settings');
        router.replace('/dashboard/seller/settings?setup=true');
      }

    } catch (error) {
      console.error('Dashboard fetch error:', error);

      if (error.response?.status === 401) {
        console.log('Authentication failed, logging out');
        handleLogout();
      } else if (!isLoggingOut.current) {
        if (error.code === 'ECONNABORTED') {
          setError('Connection timeout. Please check your internet connection and try again.');
        } else if (error.request) {
          setError('Unable to connect to server. Please check your connection.');
        } else {
          setError('Failed to load dashboard data. Please refresh the page.');
        }
      }
    } finally {
      if (!isLoggingOut.current) {
        setIsLoading(false);
      }
    }
  }, [getAuthHeaders, pathname, router, fetchNotificationCounts]);

  // ✅ CRITICAL FIX: Proper logout handling to prevent infinite loops
  const handleLogout = useCallback(() => {
    if (isLoggingOut.current) {
      console.log('Logout already in progress, ignoring');
      return;
    }

    console.log('🔐 Starting logout process...');
    isLoggingOut.current = true;
    hasInitialized.current = false;

    try {
      // Clear all auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('sellerInfo');
      localStorage.removeItem('refreshToken');

      // Clear component state
      setSellerName('');
      setNotificationCounts({ orders: 0, notifications: 0 });
      setError('');
      setIsLoading(false);

      console.log('✅ Cleared all data, performing hard redirect...');

      // Use window.location for hard redirect to break any React routing loops
      setTimeout(() => {
        window.location.href = '/login/seller';
      }, 100); // Small delay to ensure state is cleared

    } catch (error) {
      console.error('Logout error:', error);
      // Emergency fallback
      window.location.reload();
    }
  }, []);

  // ✅ FIXED: Notification updates with cleanup
  useEffect(() => {
    if (isLoggingOut.current) return;

    const interval = setInterval(() => {
      if (!isLoggingOut.current) {
        fetchNotificationCounts();
      }
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [fetchNotificationCounts]);

  // ✅ FIXED: Initialize data with proper cleanup
  useEffect(() => {
    if (!isLoggingOut.current) {
      hasInitialized.current = false;
      fetchDashboardData();
    }

    // Cleanup function
    return () => {
      if (isLoggingOut.current) {
        hasInitialized.current = false;
      }
    };
  }, [pathname, fetchDashboardData]);

  // ✅ NEW: Reset logout flag on component mount
  useEffect(() => {
    isLoggingOut.current = false;

    return () => {
      // Don't reset on unmount if logging out
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 767) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Run on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Show loading only if not logging out
  if (isLoading && !isLoggingOut.current) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Show error only if not logging out
  if (error && !isLoggingOut.current) {
    return (
      <div style={styles.errorContainer}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <div style={styles.errorActions}>
          <button onClick={() => {
            hasInitialized.current = false;
            setError('');
            fetchDashboardData();
          }} style={styles.retryButton}>
            Try Again
          </button>
          <button onClick={handleLogout} style={styles.logoutButtonError}>
            Logout & Login Again
          </button>
        </div>
      </div>
    );
  }

  // Don't render dashboard if logging out
  if (isLoggingOut.current) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Logging out...</p>
      </div>
    );
  }

  const navSections = [
    {
      title: 'SALES & E-COMMERCE',
      items: [
        { name: 'Products', href: '/dashboard/seller/products', icon: <Package size={18} /> },
        { name: 'Orders', href: '/dashboard/seller/orders', count: notificationCounts.orders, icon: <ShoppingCart size={18} /> },
        { name: 'Notifications', href: '/dashboard/seller/notifications', count: notificationCounts.notifications, icon: <Bell size={18} /> },
      ]
    },
    {
      title: 'INVENTORY',
      items: [
        { name: 'Stock', href: '/dashboard/seller/stock', icon: <BarChart3 size={18} /> },
        { name: 'History', href: '/dashboard/seller/history', icon: <History size={18} /> },
      ]
    },
      {
    title: 'PAYMENTS & EARNINGS',
    items: [
      { 
        name: 'Payments', 
        href: '/dashboard/seller/payments', 
        icon: <CreditCard size={18} />,
        description: '💰 View earnings & bank details'
      },
    ]
  }

  ];

  return (
    <div style={styles.layoutContainer}>
      {/* Sidebar */}
      <div
        className="dashboardcustom-sidebar"
        style={{
          ...styles.sidebar,
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          position: window.innerWidth <= 767 ? 'fixed' : 'fixed',
          left: 0,
          top: 0,
          height: '100%',
          zIndex: 20,
          scrollBehavior: 'smooth',
        }}
      >

        <div className='dashboardlayoutsidebarheader' style={styles.sidebarHeader}>
          <div className='dashboardlayoutlogocontainer' style={styles.logoContainer}>
            <Store size={24} color="#ffd67dff" />
            <h2 className='dashboardlayoutlogotext' style={styles.logoText}>Seller Panel</h2>
            {/* ✅ Close Icon (only visible on mobile) */}
            {window.innerWidth <= 767 && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                style={styles.closeButton}
                aria-label="Close Sidebar"
              >
                ✕
              </button>
            )}
          </div>
          <p style={styles.welcomeMessage}>Welcome, {sellerName}</p>
        </div>


        <nav className='dashboardoverviewsidebarnav' style={styles.nav}>
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

        <div className='dashboardoverviewsidebarnav' style={styles.sidebarFooter}>
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

          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            disabled={isLoggingOut.current} // ✅ Prevent multiple clicks
          >
            <LogOut size={18} />
            <span>{isLoggingOut.current ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {window.innerWidth <= 767 && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 10,
          }}
        />
      )}



      {/* Main Content */}
      <div
      className='dashboardlayoutmaincontwrap'
        style={{
          ...styles.mainContentWrapper,
          marginLeft: window.innerWidth < 767 ? 0 : '230px',
          transition: 'margin-left 0.3s ease',
          width: '100%',
        }}
      >
        <DashboardHeader
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          sellerName={sellerName}
          notificationCount={notificationCounts.notifications}
          onNotificationUpdate={fetchNotificationCounts}
        />
        <main style={styles.mainContent}>
          {children}
        </main>
      </div>

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
          50% { opacity: 0.5; }
        }
          .dashboardcustom-sidebar::-webkit-scrollbar {
    width: 6px;
  }
  .dashboardcustom-sidebar::-webkit-scrollbar-track {
    background: transparent;
  }
  .dashboardcustom-sidebar::-webkit-scrollbar-thumb {
    background-color: #5ebdb0ff;
    border-radius: 10px;
  }
  .dashboardcustom-sidebar::-webkit-scrollbar-thumb:hover {
    background-color: #ffd97a;
  }
      `}</style>
    </div>
  );
}

function NavItem({ href, name, pathname, count = 0, icon }) {
  const isActive = href === '/dashboard/seller' ? pathname === href : pathname.startsWith(href);

  return (
    <Link
    className='dashboardlayoutnavlink'
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
        <span style={{
          ...styles.indicator,
          animation: count > 0 ? 'pulse 2s infinite' : 'none'
        }}>
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
    backgroundColor: '#FDFFF0'
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
    backgroundColor: '#f8fafc',
    padding: '20px'
  },

  // ✅ NEW: Error actions container
  errorActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center'
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

  // ✅ NEW: Logout button for error state
  logoutButtonError: {
    padding: '12px 24px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500'
  },

  sidebar: {
    width: '250px',
    background: '#175E54',
    padding: '0',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto'
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
    color: 'white'
  },

  welcomeMessage: {
    margin: 0,
    color: '#9ca3af',
    fontSize: '14px',
    marginLeft: '35px'
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
    color: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    margin: '2px 0'
  },

  activeLink: {
    backgroundColor: '#ffd67dff',
    color: 'black',
    fontWeight: '600',
    borderLeft: '3px solid #ffd67dff'
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
    marginLeft: '280px',
    overflow: 'hidden'
  },

  mainContent: {
    flex: 1,
    padding: '24px',
    backgroundColor: '#FDFFF0',
    overflowY: 'auto',
    animation: 'fadeIn 0.6s ease-out'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#F8C862',
    fontSize: '22px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px',
    marginLeft: 'auto'
  },
};

