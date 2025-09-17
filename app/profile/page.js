'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Package, 
  Edit3, 
  Shield, 
  Phone, 
  MapPin, 
  Check, 
  X,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Settings,
  Heart,
  AlertCircle,
  RefreshCw,
  Calendar,
  Globe
} from 'lucide-react';

// ✅ Enhanced API base URL handling with environment variables
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
const PROFILE_API = `${API_BASE_URL}/api/buyer/profile/`;
const WISHLIST_API = `${API_BASE_URL}/api/wishlist/`;
const ORDERS_COUNT_API = `${API_BASE_URL}/api/buyer/orders/count/`;

console.log('🌐 Profile API URLs configured:', { 
  API_BASE_URL, 
  PROFILE_API, 
  WISHLIST_API, 
  ORDERS_COUNT_API 
});

export default function ProfilePage() {
  const [buyer, setBuyer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });
  const [storeData, setStoreData] = useState(null);
  const router = useRouter();

  // ✅ Enhanced token handling - supports both Google login and regular login
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('buyerAccessToken');
    
    if (!token) {
      console.error('❌ No authentication token found');
      router.push('/login/buyer');
      return null;
    }
    
    console.log('🔍 Using token:', token.substring(0, 30) + '...');
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

  // ✅ Enhanced logout function that clears ALL authentication data
  const clearAuthAndLogout = useCallback(() => {
    console.log('🔄 Clearing all authentication data...');
    
    // Clear all possible token and data keys
    const keysToRemove = [
      'access_token',
      'buyerAccessToken', 
      'refresh_token',
      'userInfo',
      'user',
      'wishlist',
      'multiCarts',
      'cart',
      'cameFromLogin',
      'preLoginPath'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('✅ Authentication data cleared');
    
    // Redirect to appropriate login page based on store context
    const { isInStore, storeId } = getCurrentStoreInfo();
    if (isInStore && storeId) {
      router.push(`/store/${storeId}/login`);
    } else {
      router.push('/login/buyer');
    }
  }, [router]);

  // ✅ Enhanced: Get current store info from URL
  const getCurrentStoreInfo = useCallback(() => {
    if (typeof window === 'undefined') return { storeId: null, isInStore: false };
    
    const currentPath = window.location.pathname;
    const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
    return {
      storeId: storeMatch ? storeMatch[1] : null,
      isInStore: !!storeMatch
    };
  }, []);

  // ✅ Enhanced: Fetch store data when in store context
  const fetchStoreData = useCallback(async (storeId, headers) => {
    try {
      console.log('🏪 Fetching store data for:', storeId);
      const storeResponse = await axios.get(`${API_BASE_URL}/api/stores/${storeId}/`, { 
        headers,
        timeout: 10000
      });
      
      console.log('✅ Store data received:', storeResponse.data);
      setStoreData(storeResponse.data);
      
    } catch (error) {
      console.warn('⚠️ Failed to fetch store data:', error);
      // Don't fail the whole profile load if store data fails
      setStoreData(null);
    }
  }, []);

  // ✅ Enhanced: Store-specific wishlist count with better error handling
  const fetchWishlistCount = useCallback(async (headers) => {
    try {
      console.log('🔍 Fetching wishlist count...');
      
      // Get current store context
      const { storeId, isInStore } = getCurrentStoreInfo();
      
      // Build wishlist URL with store filter if in store context
      const wishlistUrl = isInStore && storeId 
        ? `${WISHLIST_API}?store_id=${storeId}` 
        : WISHLIST_API;
      
      console.log('🔍 Fetching wishlist from:', wishlistUrl);
      
      const wishlistResponse = await axios.get(wishlistUrl, { 
        headers,
        timeout: 10000
      });
      const wishlistData = wishlistResponse.data;
      
      console.log('✅ Wishlist data received:', wishlistData);
      
      // ✅ Enhanced: Better handling of different response formats
      let count = 0;
      if (wishlistData) {
        if (Array.isArray(wishlistData)) {
          count = wishlistData.length;
        } else if (wishlistData.items && Array.isArray(wishlistData.items)) {
          count = wishlistData.items.length;
        } else if (wishlistData.results && Array.isArray(wishlistData.results)) {
          count = wishlistData.results.length;
        } else if (typeof wishlistData.count === 'number') {
          count = wishlistData.count;
        } else if (typeof wishlistData.items_count === 'number') {
          count = wishlistData.items_count;
        }
      }
      
      console.log('📊 Setting wishlist count:', count);
      setWishlistCount(count);
      
    } catch (wishlistError) {
      console.warn("⚠️ Wishlist API error:", wishlistError.response?.status, wishlistError.response?.data);
      
      // ✅ Enhanced: Better fallback handling
      if (wishlistError.response?.status === 401) {
        // Don't fallback to localStorage on auth error - this indicates session expired
        console.warn('🔐 Auth error for wishlist - session may be expired');
        setWishlistCount(0);
      } else {
        // Fallback to localStorage only for other errors (network, server issues)
        try {
          const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
          const fallbackCount = Array.isArray(localWishlist) ? localWishlist.length : 0;
          console.log('📱 Using localStorage fallback count:', fallbackCount);
          setWishlistCount(fallbackCount);
        } catch (localError) {
          console.warn('❌ localStorage fallback failed:', localError);
          setWishlistCount(0);
        }
      }
    }
  }, [getCurrentStoreInfo]);

  // ✅ Enhanced: Store-specific orders count with better error handling
  const fetchOrdersCount = useCallback(async (headers) => {
    try {
      console.log('🔍 Fetching orders count...');
      
      // Get current store context
      const { storeId, isInStore } = getCurrentStoreInfo();
      
      // Build orders URL with store filter if in store context
      const ordersUrl = isInStore && storeId 
        ? `${ORDERS_COUNT_API}?store_id=${storeId}` 
        : ORDERS_COUNT_API;
      
      console.log('🔍 Fetching orders from:', ordersUrl);
      
      const ordersResponse = await axios.get(ordersUrl, { 
        headers,
        timeout: 10000
      });
      
      const count = ordersResponse.data.count || ordersResponse.data.total || 0;
      console.log('📊 Setting orders count:', count);
      setOrdersCount(count);
      
    } catch (ordersError) {
      console.warn("⚠️ Orders count API error:", ordersError.response?.status, ordersError.response?.data);
      setOrdersCount(0);
    }
  }, [getCurrentStoreInfo]);

  // ✅ Enhanced: Main profile fetch function with parallel data loading
  const fetchProfile = useCallback(async (showRefreshing = false) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError('');
    
    try {
      console.log('🔍 Fetching profile from:', PROFILE_API);
      console.log('🔍 Using headers:', headers);
      
      // Fetch profile data
      const response = await axios.get(PROFILE_API, { 
        headers,
        timeout: 15000
      });
      
      console.log('✅ Profile data received:', response.data);
      setBuyer(response.data);
      
      // Store user info for header component
      try {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      } catch (storageError) {
        console.warn('⚠️ Failed to store user info:', storageError);
      }
      
      // ✅ Update current store info
      const storeInfo = getCurrentStoreInfo();
      setCurrentStoreInfo(storeInfo);
      
      // ✅ Fetch additional data in parallel
      const dataPromises = [
        fetchWishlistCount(headers),
        fetchOrdersCount(headers)
      ];
      
      // Add store data fetch if in store context
      if (storeInfo.isInStore && storeInfo.storeId) {
        dataPromises.push(fetchStoreData(storeInfo.storeId, headers));
      }
      
      await Promise.allSettled(dataPromises);
      console.log('✅ All profile data loaded');
      
    } catch (error) {
      console.error("❌ Failed to fetch profile:", error.response?.status, error.response?.data);
      
      if (error.response?.status === 401) {
        console.error('❌ 401 Unauthorized - clearing all auth data');
        clearAuthAndLogout();
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.detail || 
                           error.message || 
                           'Unknown error occurred';
        setError(`Failed to load profile data: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getAuthHeaders, fetchWishlistCount, fetchOrdersCount, fetchStoreData, clearAuthAndLogout, getCurrentStoreInfo]);

  // ✅ Load profile on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ✅ Enhanced logout with confirmation
  const handleLogout = () => {
    const { isInStore, storeId } = currentStoreInfo;
    const context = isInStore ? `store ${storeId}` : 'your account';
    
    if (window.confirm(`Are you sure you want to logout from ${context}?`)) {
      clearAuthAndLogout();
    }
  };

  // ✅ Enhanced: Store-aware back navigation
  const handleBackClick = () => {
    // Get current store context
    const { storeId, isInStore } = getCurrentStoreInfo();
    
    if (isInStore && storeId) {
      // If we're in a store, go back to that store's main page
      router.push(`/store/${storeId}`);
      return;
    }
    
    // Original logic for non-store pages
    const preLoginPath = sessionStorage.getItem('preLoginPath');
    
    if (preLoginPath && preLoginPath !== '/profile') {
      sessionStorage.removeItem('preLoginPath');
      sessionStorage.removeItem('cameFromLogin');
      
      if (preLoginPath.startsWith('/') && !preLoginPath.includes('/login') && !preLoginPath.includes('/register')) {
        router.push(preLoginPath);
        return;
      }
    }
    
    const cameFromLogin = sessionStorage.getItem('cameFromLogin');
    if (cameFromLogin === 'true') {
      sessionStorage.removeItem('cameFromLogin');
      router.push('/');
      return;
    }
    
    try {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        const referrer = document.referrer;
        const currentOrigin = window.location.origin;
        
        if (referrer && 
            referrer.startsWith(currentOrigin) && 
            !referrer.includes('/login') && 
            !referrer.includes('/register') &&
            !referrer.includes('/profile')) {
          router.back();
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      router.push('/');
    }
  };

  // ✅ Enhanced: Store-aware menu links with smart URLs
  const renderMenuLinks = () => {
    const { storeId, isInStore } = currentStoreInfo;
    
    // ✅ Generate store-aware URLs
    const getStoreAwareUrl = (basePath) => {
      return isInStore && storeId ? `/store/${storeId}${basePath}` : basePath;
    };
    
    return (
      <div style={styles.menuGrid}>
        <Link href={getStoreAwareUrl('/profile/edit')} style={styles.menuItem}>
          <div style={styles.menuItemContent}>
            <div style={styles.menuIcon}>
              <Edit3 size={24} />
            </div>
            <div style={styles.menuInfo}>
              <span style={styles.menuLabel}>Edit Profile</span>
              <p style={styles.menuDesc}>Update personal information and address</p>
            </div>
          </div>
          <ChevronRight size={20} style={styles.chevron} />
        </Link>

        <Link href={getStoreAwareUrl('/profile/orders')} style={styles.menuItem}>
          <div style={styles.menuItemContent}>
            <div style={styles.menuIcon}>
              <Package size={24} />
            </div>
            <div style={styles.menuInfo}>
              <span style={styles.menuLabel}>
                {isInStore ? 'Orders from this Store' : 'My Orders'}
              </span>
              <p style={styles.menuDesc}>
                {ordersCount > 0 
                  ? `${ordersCount} order${ordersCount !== 1 ? 's' : ''} • Track and manage`
                  : 'Track orders and view purchase history'
                }
              </p>
            </div>
          </div>
          <ChevronRight size={20} style={styles.chevron} />
        </Link>

        <Link href={getStoreAwareUrl('/profile/wishlist')} style={styles.menuItem}>
          <div style={styles.menuItemContent}>
            <div style={{...styles.menuIcon, color: '#ef4444'}}>
              <Heart size={24} />
            </div>
            <div style={styles.menuInfo}>
              <span style={styles.menuLabel}>
                {isInStore ? 'Wishlist from this Store' : 'My Wishlist'}
              </span>
              <p style={styles.menuDesc}>
                {wishlistCount > 0 
                  ? `${wishlistCount} item${wishlistCount !== 1 ? 's' : ''} saved for later`
                  : 'Save products for later purchase'
                }
              </p>
            </div>
          </div>
          <ChevronRight size={20} style={styles.chevron} />
        </Link>

        <Link href={getStoreAwareUrl('/profile/verification')} style={styles.menuItem}>
          <div style={styles.menuItemContent}>
            <div style={{
              ...styles.menuIcon, 
              color: buyer?.phone_verified ? '#10b981' : '#f59e0b'
            }}>
              <Shield size={24} />
            </div>
            <div style={styles.menuInfo}>
              <span style={styles.menuLabel}>Account Security</span>
              <p style={styles.menuDesc}>
                {buyer?.phone_verified 
                  ? 'Your account is verified ✓' 
                  : 'Verify your phone number for security'
                }
              </p>
            </div>
          </div>
          <ChevronRight size={20} style={styles.chevron} />
        </Link>

        <Link href="/profile/settings" style={styles.menuItem}>
          <div style={styles.menuItemContent}>
            <div style={styles.menuIcon}>
              <Settings size={24} />
            </div>
            <div style={styles.menuInfo}>
              <span style={styles.menuLabel}>Account Settings</span>
              <p style={styles.menuDesc}>Manage privacy, notifications, and preferences</p>
            </div>
          </div>
          <ChevronRight size={20} style={styles.chevron} />
        </Link>
      </div>
    );
  };

  // ✅ Enhanced date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Date formatting error:', error);
      return 'N/A';
    }
  };

  // ✅ Enhanced initials generation
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your profile...</p>
        <p style={{fontSize: '12px', color: '#666'}}>
          🌐 Connected to: {API_BASE_URL}
        </p>
      </div>
    );
  }

  // ✅ Error state
  if (error && !buyer) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} color="#ef4444" />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
          <button onClick={() => fetchProfile()} style={styles.retryButton}>
            <RefreshCw size={18} />
            Try Again
          </button>
          <button onClick={clearAuthAndLogout} style={styles.logoutButtonError}>
            <LogOut size={18} />
            Logout & Login Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ No profile state
  if (!buyer) {
    return (
      <div style={styles.errorContainer}>
        <User size={48} color="#6b7280" />
        <h2>Profile not found</h2>
        <p>Could not load profile. Please try logging in again.</p>
        <Link href="/login/buyer" style={styles.loginButton}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <button onClick={handleBackClick} style={styles.backButton}>
            <ArrowLeft size={20} />
            <span style={styles.backText}>
              {currentStoreInfo.isInStore ? 'Back to Store' : 'Back'}
            </span>
          </button>
          <h1 style={styles.headerTitle}>
            {currentStoreInfo.isInStore ? 'Store Profile' : 'My Account'}
          </h1>
          <div style={styles.headerActions}>
            <button 
              onClick={() => fetchProfile(true)} 
              style={styles.refreshButton}
              disabled={isRefreshing}
              title="Refresh profile data"
            >
              <RefreshCw size={16} style={isRefreshing ? {animation: 'spin 1s linear infinite'} : {}} />
            </button>
            <button onClick={handleLogout} style={styles.logoutButton} title="Logout">
              <LogOut size={18} />
              <span style={styles.logoutText}>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div style={styles.container}>
        <div style={styles.content}>
          {/* ✅ Enhanced store context indicator */}
          {currentStoreInfo.isInStore && (
            <div style={styles.storeIndicator}>
              <Globe size={16} />
              <div style={styles.storeIndicatorContent}>
                <span style={styles.storeIndicatorTitle}>
                  Store Profile Context
                </span>
                <span style={styles.storeIndicatorSubtitle}>
                  {storeData ? (
                    <>Viewing profile for <strong>{storeData.name}</strong> • ID: {currentStoreInfo.storeId}</>
                  ) : (
                    <>Store ID: {currentStoreInfo.storeId}</>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div style={styles.profileCard}>
            <div style={styles.avatarSection}>
              <div style={styles.avatar}>
                {getInitials(buyer.full_name)}
              </div>
              <div style={styles.userInfo}>
                <h2 style={styles.userName}>{buyer.full_name || 'User'}</h2>
                <p style={styles.userEmail}>{buyer.email || 'No email provided'}</p>
                <div style={styles.badgeContainer}>
                  <div style={styles.verificationBadge}>
                    {buyer.phone_verified ? (
                      <span style={styles.verified}>
                        <Check size={14} /> Phone Verified
                      </span>
                    ) : (
                      <span style={styles.notVerified}>
                        <X size={14} /> Phone Not Verified
                      </span>
                    )}
                  </div>
                  {buyer.date_joined && (
                    <div style={styles.memberSince}>
                      <Calendar size={14} />
                      <span>Member since {formatDate(buyer.date_joined)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Enhanced Quick Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <Package size={24} color="#3b82f6" />
              </div>
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{ordersCount}</span>
                <span style={styles.statLabel}>
                  {currentStoreInfo.isInStore ? 'Orders from Store' : 'Total Orders'}
                </span>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <Heart size={24} color="#ef4444" />
              </div>
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{wishlistCount}</span>
                <span style={styles.statLabel}>
                  {currentStoreInfo.isInStore ? 'Store Wishlist' : 'Wishlist Items'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={styles.infoCards}>
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>
                <Phone size={20} />
              </div>
              <div style={styles.infoContent}>
                <span style={styles.infoLabel}>Phone Number</span>
                <p style={styles.infoValue}>
                  {buyer.phone_number ? `+91 ${buyer.phone_number}` : 'Not provided'}
                </p>
              </div>
            </div>
            
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>
                <MapPin size={20} />
              </div>
              <div style={styles.infoContent}>
                <span style={styles.infoLabel}>Address</span>
                <p style={styles.infoValue}>
                  {[buyer.address_line_1, buyer.address_line_2, buyer.city, buyer.pincode]
                    .filter(Boolean).join(', ') || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Enhanced menu section */}
          <div style={styles.menuSection}>
            <h3 style={styles.menuTitle}>
              {currentStoreInfo.isInStore ? 'Store Account Management' : 'Account Management'}
            </h3>
            {renderMenuLinks()}
          </div>

          {/* ✅ Enhanced Account Summary */}
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>
              {currentStoreInfo.isInStore ? 'Store Account Overview' : 'Account Overview'}
            </h3>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Account Status</span>
                <span style={styles.summaryValue}>
                  {buyer.phone_verified ? '✅ Verified' : '⚠️ Pending'}
                </span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>
                  {currentStoreInfo.isInStore ? 'Store Orders' : 'Total Orders'}
                </span>
                <span style={styles.summaryValue}>{ordersCount}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>
                  {currentStoreInfo.isInStore ? 'Store Wishlist' : 'Wishlist Items'}
                </span>
                <span style={{...styles.summaryValue, color: '#ef4444'}}>
                  {wishlistCount}
                </span>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div style={styles.helpSection}>
            <h4 style={styles.helpTitle}>Need Help?</h4>
            <p style={styles.helpText}>
              Contact our support team for assistance with your account or orders.
            </p>
            <div style={styles.helpActions}>
              <Link href="/support" style={styles.helpButton}>
                <Globe size={16} />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
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
        
        @media (max-width: 768px) {
          .menu-item:hover {
            transform: none;
          }
          
          .menu-item:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
}

// ✅ Enhanced styles with new store indicator styles
const styles = {
  // ✅ Enhanced store context indicator
  storeIndicator: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#dbeafe',
    border: '1px solid #3b82f6',
    borderRadius: '12px',
    marginBottom: '24px'
  },

  storeIndicatorContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  storeIndicatorTitle: {
    fontSize: '14px',
    color: '#1e40af',
    fontWeight: '600'
  },

  storeIndicatorSubtitle: {
    fontSize: '13px',
    color: '#3730a3',
    lineHeight: '1.4'
  },

  pageContainer: {
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
    padding: '20px'
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
    padding: '40px'
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

  logoutButtonError: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  
  loginButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '500'
  },

  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderRadius: '6px'
  },
  
  backText: {
    display: 'none'
  },
  
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: '2px solid #fee2e2',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  
  logoutText: {
    display: 'none'
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px'
  },
  
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    animation: 'fadeIn 0.6s ease-out'
  },

  profileCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    flexShrink: 0,
    border: '3px solid #dbeafe'
  },
  
  userInfo: {
    flex: 1,
    minWidth: 0
  },
  
  userName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  
  userEmail: {
    color: '#6b7280',
    margin: '0 0 16px 0',
    fontSize: '16px'
  },
  
  badgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  verificationBadge: {
    display: 'inline-block'
  },
  
  verified: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '600'
  },
  
  notVerified: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '600'
  },
  
  memberSince: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6b7280',
    fontSize: '13px'
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  
  statContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937'
  },
  
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },

  infoCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px'
  },
  
  infoCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  
  infoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    flexShrink: 0
  },
  
  infoContent: {
    flex: 1,
    minWidth: 0
  },
  
  infoLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: '6px'
  },
  
  infoValue: {
    margin: 0,
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '500',
    lineHeight: '1.5'
  },

  menuSection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  
  menuTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 24px 0'
  },
  
  menuGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.2s',
    border: '2px solid transparent'
  },
  
  menuItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1
  },
  
  menuIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3b82f6',
    flexShrink: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  menuInfo: {
    flex: 1,
    minWidth: 0
  },
  
  menuLabel: {
    display: 'block',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  
  menuDesc: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.4'
  },
  
  chevron: {
    color: '#9ca3af',
    flexShrink: 0
  },

  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 20px 0'
  },
  
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px'
  },
  
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    textAlign: 'center'
  },
  
  summaryLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  
  summaryValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937'
  },

  // Help Section
  helpSection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    textAlign: 'center'
  },
  
  helpTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  
  helpText: {
    color: '#6b7280',
    margin: '0 0 20px 0',
    fontSize: '14px'
  },
  
  helpActions: {
    display: 'flex',
    justifyContent: 'center'
  },
  
  helpButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  }
};
