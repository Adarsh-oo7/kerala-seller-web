'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import "../../styles/KeralasellersProfile.css";

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
  Globe,
  Store
} from 'lucide-react';

// API base URL handling
const getApiBaseUrl = () => {
  const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  if (process.env.NODE_ENV === 'development') {
    return 'https://api.keralasellers.in';
  }
  return 'https://api.keralasellers.in';
};

const API_BASE_URL = 'https://api.keralasellers.in';
const PROFILE_API = `${API_BASE_URL}/api/buyer/profile/`;
const WISHLIST_API = `${API_BASE_URL}/api/wishlist/`;
const ORDERS_COUNT_API = `${API_BASE_URL}/api/buyer/orders/count/`;

export default function ProfilePage() {
  const [buyer, setBuyer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });
  const [storeData, setStoreData] = useState(null);

  const hasFetchedRef = useRef(false);
  const router = useRouter();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') ||
      localStorage.getItem('buyerAccessToken');

    if (!token) {
      console.error('❌ No authentication token found');
      return null;
    }

    return { 'Authorization': `Bearer ${token}` };
  };

  // ✅ FIXED: Enhanced shop context detection with proper priority
  const getShopContext = () => {
    if (typeof window === 'undefined') return { shopId: null, isInShop: false, shopUrl: null };

    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    console.log('🔍 Analyzing shop context:', {
      path: currentPath,
      search: window.location.search,
      fullUrl: window.location.href
    });

    let shopId = null;
    let shopUrl = null;
    let isInShop = false;
    let detectionMethod = 'none';

    // ✅ CRITICAL FIX: Priority 1 - Query parameter ?id=xxx (highest priority for your case)
    const queryShopId = searchParams.get('id');
    if (queryShopId && queryShopId.trim() && /^\d+$/.test(queryShopId.trim())) {
      shopId = queryShopId.trim();
      shopUrl = `/shop/${shopId}`;
      isInShop = true;
      detectionMethod = 'query';
      console.log('✅ Shop context from query parameter:', { shopId, shopUrl, method: detectionMethod });
    }

    // Priority 2: Check /shop/{id} pattern in URL path (only if query didn't work)
    if (!isInShop) {
      const shopPathMatch = currentPath.match(/\/shop\/([^\/\?]+)/);
      if (shopPathMatch) {
        const pathShopId = shopPathMatch[1];
        // Only use if it's a valid numeric ID (not "new" or other words)
        if (/^\d+$/.test(pathShopId)) {
          shopId = pathShopId;
          shopUrl = `/shop/${shopId}`;
          isInShop = true;
          detectionMethod = 'path';
          console.log('✅ Shop context from path (numeric):', { shopId, shopUrl, method: detectionMethod });
        } else {
          console.log('⚠️ Ignoring non-numeric path segment:', pathShopId);
        }
      }
    }

    // Priority 3: Check document referrer (only if above methods failed)
    if (!isInShop && typeof document !== 'undefined') {
      const referrer = document.referrer;
      if (referrer) {
        const referrerMatch = referrer.match(/\/shop\/([^\/\?]+)/);
        if (referrerMatch) {
          const referrerShopId = referrerMatch[1];
          if (/^\d+$/.test(referrerShopId)) {
            shopId = referrerShopId;
            shopUrl = `/shop/${shopId}`;
            isInShop = true;
            detectionMethod = 'referrer';
            console.log('✅ Shop context from referrer:', { shopId, shopUrl, method: detectionMethod });
          }
        }
      }
    }

    // Priority 4: Check sessionStorage (only as last resort)
    if (!isInShop) {
      try {
        const savedShopContext = sessionStorage.getItem('currentShopContext');
        if (savedShopContext) {
          const parsed = JSON.parse(savedShopContext);
          if (parsed.shopId && /^\d+$/.test(parsed.shopId)) {
            // Only use if it's recent (within 1 hour)
            const age = Date.now() - (parsed.timestamp || 0);
            if (age < 3600000) { // 1 hour
              shopId = parsed.shopId;
              shopUrl = `/shop/${shopId}`;
              isInShop = true;
              detectionMethod = 'session';
              console.log('✅ Shop context from session:', { shopId, shopUrl, method: detectionMethod, age });
            } else {
              console.log('⚠️ Session shop context too old, ignoring');
              sessionStorage.removeItem('currentShopContext');
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ Failed to parse shop context from session');
      }
    }

    // Save current valid shop context to sessionStorage
    if (isInShop && shopId && /^\d+$/.test(shopId)) {
      try {
        sessionStorage.setItem('currentShopContext', JSON.stringify({
          shopId,
          shopUrl,
          detectionMethod,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('⚠️ Failed to save shop context to session');
      }
    }

    console.log('🏪 Final shop context:', { shopId, shopUrl, isInShop, detectionMethod });

    return { shopId, shopUrl, isInShop, detectionMethod };
  };

  const clearAuthAndLogout = () => {
    console.log('🔄 Clearing all authentication data...');

    const keysToRemove = [
      'access_token', 'buyerAccessToken', 'refresh_token',
      'userInfo', 'user', 'wishlist', 'multiCarts', 'cart',
      'cameFromLogin', 'preLoginPath'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    const shopContext = getShopContext();

    if (shopContext.isInShop && shopContext.shopId) {
      console.log('🏪 Redirecting to shop login:', `${shopContext.shopUrl}/login`);
      router.push(`${shopContext.shopUrl}/login`);
    } else {
      console.log('🏠 No shop context, redirecting to main login');
      router.push('/login/buyer');
    }
  };

  const getCurrentStoreInfo = () => {
    const shopContext = getShopContext();
    return {
      storeId: shopContext.shopId,
      isInStore: shopContext.isInShop,
      shopUrl: shopContext.shopUrl,
      detectionMethod: shopContext.detectionMethod
    };
  };

  const fetchStoreData = async (storeId, headers) => {
    // ✅ FIXED: Validate store ID before making API calls
    if (!storeId || !storeId.trim() || !/^\d+$/.test(storeId.trim())) {
      console.warn('⚠️ Invalid store ID for API call:', storeId);
      setStoreData(null);
      return null;
    }

    const validStoreId = storeId.trim();

    try {
      console.log('🏪 Fetching store data for valid ID:', validStoreId);

      let storeResponse;

      // Try phone-based lookup first
      try {
        storeResponse = await axios.get(`${API_BASE_URL}/api/stores/by-phone/${validStoreId}/`, {
          headers,
          timeout: 10000
        });
        console.log('✅ Store found by phone');
      } catch (phoneError) {
        console.warn('⚠️ Phone lookup failed, trying ID lookup');
      }

      // Fallback to ID lookup
      if (!storeResponse) {
        try {
          storeResponse = await axios.get(`${API_BASE_URL}/api/stores/${validStoreId}/`, {
            headers,
            timeout: 10000
          });
          console.log('✅ Store found by ID');
        } catch (idError) {
          console.warn('⚠️ ID lookup failed');
        }
      }

      if (storeResponse && storeResponse.data) {
        setStoreData(storeResponse.data);
        return storeResponse.data;
      } else {
        setStoreData(null);
        return null;
      }

    } catch (error) {
      console.error('❌ Error fetching store data:', error);
      setStoreData(null);
      return null;
    }
  };

  // ✅ ENHANCED: Fixed wishlist fetching with multiple fallback methods
  const fetchWishlistCount = async (headers) => {
    try {
      const storeInfo = getCurrentStoreInfo();

      console.log('🔍 Fetching wishlist count...');
      console.log('🔍 Store info:', storeInfo);

      // ✅ FIXED: Try multiple wishlist endpoints
      const wishlistEndpoints = [
        // Method 1: With store filter if in shop
        storeInfo.isInStore && storeInfo.storeId && /^\d+$/.test(storeInfo.storeId)
          ? `${WISHLIST_API}?store_id=${storeInfo.storeId}`
          : null,
        // Method 2: Standard wishlist endpoint
        WISHLIST_API,
        // Method 3: Alternative endpoints
        `${API_BASE_URL}/api/buyer/wishlist/`,
        `${API_BASE_URL}/user/wishlist/`,
        `${API_BASE_URL}/wishlist/`
      ].filter(Boolean); // Remove null values

      let wishlistData = null;
      let successfulEndpoint = null;

      // Try each endpoint until one works
      for (const endpoint of wishlistEndpoints) {
        try {
          console.log(`🔍 Trying wishlist endpoint: ${endpoint}`);

          const wishlistResponse = await axios.get(endpoint, {
            headers,
            timeout: 10000
          });

          if (wishlistResponse.data) {
            wishlistData = wishlistResponse.data;
            successfulEndpoint = endpoint;
            console.log('✅ Wishlist data received from:', endpoint);
            console.log('✅ Wishlist response:', wishlistData);
            break;
          }
        } catch (endpointError) {
          console.warn(`⚠️ Wishlist endpoint failed: ${endpoint}`, endpointError.response?.status);
          continue;
        }
      }

      // ✅ ENHANCED: Parse wishlist count from various response formats
      let count = 0;
      if (wishlistData) {
        if (Array.isArray(wishlistData)) {
          // Direct array response
          count = wishlistData.length;
          console.log('✅ Wishlist count from array:', count);
        } else if (wishlistData.items && Array.isArray(wishlistData.items)) {
          // Response with items array
          count = wishlistData.items.length;
          console.log('✅ Wishlist count from items array:', count);
        } else if (wishlistData.results && Array.isArray(wishlistData.results)) {
          // Paginated response
          count = wishlistData.results.length;
          console.log('✅ Wishlist count from results array:', count);
        } else if (typeof wishlistData.count === 'number') {
          // Count field
          count = wishlistData.count;
          console.log('✅ Wishlist count from count field:', count);
        } else if (typeof wishlistData.items_count === 'number') {
          // Alternative count field
          count = wishlistData.items_count;
          console.log('✅ Wishlist count from items_count field:', count);
        } else if (typeof wishlistData.total === 'number') {
          // Total field
          count = wishlistData.total;
          console.log('✅ Wishlist count from total field:', count);
        } else {
          // Try to find any array in the response
          const arrayKeys = Object.keys(wishlistData).filter(key => Array.isArray(wishlistData[key]));
          if (arrayKeys.length > 0) {
            count = wishlistData[arrayKeys[0]].length;
            console.log(`✅ Wishlist count from ${arrayKeys[0]} array:`, count);
          } else {
            console.log('⚠️ Could not determine wishlist count from response structure:', wishlistData);
          }
        }
      } else {
        console.warn('⚠️ No wishlist data received from any endpoint');
      }

      console.log('✅ Final wishlist count set:', count);
      setWishlistCount(count);

    } catch (wishlistError) {
      console.warn("⚠️ All wishlist API attempts failed:", wishlistError);
      setWishlistCount(0);
    }
  };

  const fetchOrdersCount = async (headers) => {
    try {
      const storeInfo = getCurrentStoreInfo();

      // ✅ FIXED: Only add store filter if we have a valid numeric store ID
      let ordersUrl = ORDERS_COUNT_API;
      if (storeInfo.isInStore && storeInfo.storeId && /^\d+$/.test(storeInfo.storeId)) {
        ordersUrl = `${ORDERS_COUNT_API}?store_id=${storeInfo.storeId}`;
        console.log('🔍 Fetching orders with store filter:', ordersUrl);
      } else {
        console.log('🔍 Fetching orders without store filter:', ordersUrl);
      }

      const ordersResponse = await axios.get(ordersUrl, {
        headers,
        timeout: 10000
      });

      const count = ordersResponse.data.count || ordersResponse.data.total || 0;
      console.log('✅ Orders count set:', count);
      setOrdersCount(count);

    } catch (ordersError) {
      console.warn("⚠️ Orders count API error:", ordersError);
      setOrdersCount(0);
    }
  };

  const fetchProfile = async (showRefreshing = false) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    if (hasFetchedRef.current && !showRefreshing) {
      return;
    }

    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError('');

    try {
      const response = await axios.get(PROFILE_API, {
        headers,
        timeout: 15000
      });

      setBuyer(response.data);

      try {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      } catch (storageError) {
        console.warn('⚠️ Failed to store user info:', storageError);
      }

      const storeInfo = getCurrentStoreInfo();
      setCurrentStoreInfo(storeInfo);
      console.log('🏪 Store info set:', storeInfo);

      if (!hasFetchedRef.current || showRefreshing) {
        const dataPromises = [
          fetchWishlistCount(headers),  // ✅ Enhanced wishlist fetching
          fetchOrdersCount(headers)
        ];

        // ✅ FIXED: Only fetch store data if we have a valid numeric store ID
        if (storeInfo.isInStore && storeInfo.storeId && /^\d+$/.test(storeInfo.storeId)) {
          dataPromises.push(fetchStoreData(storeInfo.storeId, headers));
        }

        await Promise.allSettled(dataPromises);
        hasFetchedRef.current = true;
      }

    } catch (error) {
      console.error("❌ Failed to fetch profile:", error);

      if (error.response?.status === 401) {
        clearAuthAndLogout();
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
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    const shopContext = getShopContext();
    const context = shopContext.isInShop ? `shop ${shopContext.shopId}` : 'your account';

    if (window.confirm(`Are you sure you want to logout from ${context}?`)) {
      clearAuthAndLogout();
    }
  };

  const handleBackClick = () => {
    const shopContext = getShopContext();

    console.log('🔄 Back button clicked with shop context:', shopContext);

    if (shopContext.isInShop && shopContext.shopId) {
      // ✅ FIXED: Use the original URL format for back navigation
      let backUrl = shopContext.shopUrl || `/shop/${shopContext.shopId}`;

      // If we detected from query params, preserve the original format
      if (shopContext.detectionMethod === 'query') {
        backUrl = `/shop/new?id=${shopContext.shopId}`;
      }

      console.log('↩️ Staying in shop context, going to:', backUrl);
      router.push(backUrl);
      return;
    }

    console.log('↩️ No shop context found, using regular navigation');

    try {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        const referrer = document.referrer;

        if (referrer && referrer.includes(window.location.origin)) {
          router.back();
          return;
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }

    router.push('/');
  };

  const renderMenuLinks = () => {
    const shopContext = getShopContext();

    const getShopAwareUrl = (basePath) => {
      if (shopContext.isInShop && shopContext.shopId) {
        // Preserve the original URL format
        if (shopContext.detectionMethod === 'query') {
          return `/shop/new${basePath}?id=${shopContext.shopId}`;
        } else {
          return `/shop/${shopContext.shopId}${basePath}`;
        }
      }
      return basePath;
    };

    return (
      <div style={styles.menuGrid}>
        <Link href={getShopAwareUrl('/profile/edit')} style={styles.menuItem}>
          <div style={styles.menuItemContent}>
            <div style={styles.menuIcon}>
              <Edit3 size={24} />
            </div>
            <div style={styles.menuInfo}>
              <span className='keralasellersprofilemenulabel' style={styles.menuLabel}>Edit Profile</span>
              <p className='keralasellersprofilemenudesc' style={styles.menuDesc}>Update personal information and address</p>
            </div>
          </div>
          <ChevronRight size={20} style={styles.chevron} />
        </Link>

        <Link href={getShopAwareUrl('/profile/orders')} style={styles.menuItem}>
          <div style={styles.menuItemContent}>
            <div style={styles.menuIcon}>
              <Package size={24} />
            </div>
            <div style={styles.menuInfo}>
              <span className='keralasellersprofilemenulabel' style={styles.menuLabel}>
                {shopContext.isInShop ? `Orders from ${storeData?.name || 'this Shop'}` : 'My Orders'}
              </span>
              <p className='keralasellersprofilemenudesc' style={styles.menuDesc}>
                {ordersCount > 0
                  ? `${ordersCount} order${ordersCount !== 1 ? 's' : ''} • Track and manage`
                  : 'Track orders and view purchase history'
                }
              </p>
            </div>
          </div>
          <ChevronRight size={20} style={styles.chevron} />
        </Link>

        <Link href={getShopAwareUrl('/profile/wishlist')} style={styles.menuItem}>
          <div style={styles.menuItemContent}>
            <div style={{ ...styles.menuIcon, color: '#ef4444' }}>
              <Heart size={24} />
            </div>
            <div style={styles.menuInfo}>
              <span className='keralasellersprofilemenulabel' style={styles.menuLabel}>
                {shopContext.isInShop ? `${storeData?.name || 'Shop'} Wishlist` : 'My Wishlist'}
              </span>
              <p className='keralasellersprofilemenudesc' style={styles.menuDesc}>
                {wishlistCount > 0
                  ? `${wishlistCount} item${wishlistCount !== 1 ? 's' : ''} saved for later`
                  : 'Save products for later purchase'
                }
              </p>
            </div>
          </div>
          <ChevronRight size={20} style={styles.chevron} />
        </Link>

        <Link href={getShopAwareUrl('/profile/verification')} style={styles.menuItem}>
          <div style={styles.menuItemContent}>
            <div style={{
              ...styles.menuIcon,
              color: buyer?.phone_verified ? '#10b981' : '#f59e0b'
            }}>
              <Shield size={24} />
            </div>
            <div style={styles.menuInfo}>
              <span className='keralasellersprofilemenulabel' style={styles.menuLabel}>Account Security</span>
              <p className='keralasellersprofilemenudesc' style={styles.menuDesc}>
                {buyer?.phone_verified
                  ? 'Your account is verified ✓'
                  : 'Verify your phone number for security'
                }
              </p>
            </div>
          </div>
          <ChevronRight size={20} style={styles.chevron} />
        </Link>

        {shopContext.isInShop && shopContext.shopId && (
          <Link href={shopContext.detectionMethod === 'query' ? `/shop/new?id=${shopContext.shopId}` : `/shop/${shopContext.shopId}`} style={styles.menuItem}>
            <div style={styles.menuItemContent}>
              <div style={{ ...styles.menuIcon, color: '#059669' }}>
                <Store size={24} />
              </div>
              <div style={styles.menuInfo}>
                <span className='keralasellersprofilemenulabel' style={styles.menuLabel}>
                  Back to {storeData?.name || 'Shop'}
                </span>
                <p className='keralasellersprofilemenudesc' style={styles.menuDesc}>Continue shopping in this store</p>
              </div>
            </div>
            <ChevronRight size={20} style={styles.chevron} />
          </Link>
        )}

        {/* {!shopContext.isInShop && (
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
        )} */}
      </div>
    );
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (isLoading) {
    const shopContext = getShopContext();
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your profile...</p>
        {shopContext.isInShop && (
          <p style={{ fontSize: '12px', color: '#666' }}>
            🏪 Shop ID: {shopContext.shopId} • Method: {shopContext.detectionMethod}
          </p>
        )}
      </div>
    );
  }

  // Error state
  if (error && !buyer) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} color="#ef4444" />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
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

  if (!buyer) {
    const shopContext = getShopContext();
    return (
      <div style={styles.errorContainer}>
        <User size={48} color="#6b7280" />
        <h2>Profile not found</h2>
        <p>Could not load profile. Please try logging in again.</p>
        <Link
          href={shopContext.isInShop ? `${shopContext.shopUrl}/login` : '/login/buyer'}
          style={styles.loginButton}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const shopContext = getShopContext();

  return (
    <div style={styles.pageContainer}>
      <Header />
      {/* Header */}
      {/* <header style={styles.header}>
        <div style={styles.headerContainer}>
          <button onClick={handleBackClick} style={styles.backButton}>
            <ArrowLeft size={20} />
            <span style={styles.backText}>
              {shopContext.isInShop ? `Back to ${storeData?.name || 'Shop'}` : 'Back'}
            </span>
          </button>
          <h1 style={styles.headerTitle}>
            {shopContext.isInShop ? `${storeData?.name || 'Shop'} Profile` : 'My Account'}
          </h1>

        </div>
      </header> */}

      <div style={styles.container}>
        <div style={styles.content}>
          {/* Shop context indicator */}
          {shopContext.isInShop && (
            <div style={styles.storeIndicator}>
              <Store size={20} />
              <div style={styles.storeIndicatorContent}>
                <span style={styles.storeIndicatorTitle}>
                  Shopping in Independent Store
                </span>
                <span style={styles.storeIndicatorSubtitle}>
                  {storeData ? (
                    <>You're shopping at <strong>{storeData.name}</strong> • Store ID: {shopContext.shopId}</>
                  ) : (
                    <>Store ID: {shopContext.shopId} • Detection: {shopContext.detectionMethod}</>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className='keralasellersprofilecardsize' style={styles.profileCard}>
            <div className='keralasellersprofilecardgap' style={styles.avatarSection}>
              <div className='keralasellersprofileavatar' style={styles.avatar}>
                {getInitials(buyer.full_name)}
              </div>
              <div style={styles.userInfo}>
                <h2 className='keralasellersnamefont' style={styles.userName}>{buyer.full_name || 'User'}</h2>
                <p className='keralasellerssubnamesfont' style={styles.userEmail}>{buyer.email || 'No email provided'}</p>
                <div style={styles.badgeContainer}>
                  <div style={styles.verificationBadge}>
                    {buyer.phone_verified ? (
                      <span className='keralasellerssubnamesfont' style={styles.verified}>
                        <Check size={14} /> Phone Verified
                      </span>
                    ) : (
                      <span className='keralasellerssubnamesfont' style={styles.notVerified}>
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
              <div className='keralasellersprofileheaderaction' style={styles.headerActions}>
                <button
                className='keralasellersprofilerefreshbtn'
                  onClick={() => fetchProfile(true)}
                  style={styles.refreshButton}
                  disabled={isRefreshing}
                >
                  <RefreshCw className='keralasellersprofilelogouticon' style={isRefreshing ? { animation: 'spin 1s linear infinite' } : {}} />
                </button>
                <button className='keralasellersprofilelogoutbtn' onClick={handleLogout} style={styles.logoutButton}>
                  <LogOut className='keralasellersprofilelogouticon' />
                  <span style={styles.logoutText}>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={styles.statsGrid}>
            <div className='keralasellersstatcardgap' style={styles.statCard}>
              <div style={styles.statIcon}>
                <Package size={24} color="#3b82f6" />
              </div>
              <div style={styles.statContent}>
                <span className='keralasellersprofilestatnum' style={styles.statNumber}>{ordersCount}</span>
                <span className='keralasellersprofilestatlabel' style={styles.statLabel}>
                  {shopContext.isInShop ? `Orders from ${storeData?.name || 'this Shop'}` : 'Total Orders'}
                </span>
              </div>
            </div>

            <div className='keralasellersstatcardgap' style={styles.statCard}>
              <div style={styles.statIcon}>
                <Heart size={24} color="#ef4444" />
              </div>
              <div style={styles.statContent}>
                <span className='keralasellersprofilestatnum' style={styles.statNumber}>{wishlistCount}</span>
                <span className='keralasellersprofilestatlabel' style={styles.statLabel}>
                  {shopContext.isInShop ? `${storeData?.name || 'Shop'} Wishlist` : 'Wishlist Items'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {/* <div style={styles.infoCards}>
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
          </div> */}

          {/* Menu section */}
          {/* <div style={styles.menuSection}> */}
          {/* <h3 style={styles.menuTitle}>
            {shopContext.isInShop ? `${storeData?.name || 'Shop'} Account Management` : 'Account Management'}
          </h3> */}
          {renderMenuLinks()}
          {/* </div> */}

          {/* Account Summary */}
          {/* <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Account Overview</h3>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Account Status</span>
                <span style={styles.summaryValue}>
                  {buyer.phone_verified ? '✅ Verified' : '⚠️ Pending'}
                </span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Orders</span>
                <span style={styles.summaryValue}>{ordersCount}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Wishlist</span>
                <span style={{ ...styles.summaryValue, color: '#ef4444' }}>
                  {wishlistCount}
                </span>
              </div>
            </div>
          </div> */}

          {/* Help Section */}
          <div style={styles.helpSection}>
            <h4 className='keralasellersprofilemenulabel' style={styles.helpTitle}>Need Help?</h4>
            <p className='keralasellersprofilemenudesc' style={styles.helpText}>
              {shopContext.isInShop
                ? `Contact support for assistance with your ${storeData?.name || 'shop'} account.`
                : 'Contact our support team for assistance with your account or orders.'
              }
            </p>
            <div style={styles.helpActions}>
              <Link className='keralasellershelpbtn' href="/support" style={styles.helpButton}>
                <Globe size={16} />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
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

// Keep all the existing styles
const styles = {
  storeIndicator: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px 24px',
    backgroundColor: '#ecfdf5',
    border: '2px solid #10b981',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  storeIndicatorContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  storeIndicatorTitle: {
    fontSize: '16px',
    color: '#047857',
    fontWeight: '700'
  },
  storeIndicatorSubtitle: {
    fontSize: '14px',
    color: '#059669',
    lineHeight: '1.4'
  },
  pageContainer: { minHeight: '100vh', backgroundColor: '#FDFFF0' },
  loadingContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: '20px', padding: '20px'
  },
  spinner: {
    width: '32px', height: '32px', border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6', borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: '20px',
    textAlign: 'center', padding: '40px'
  },
  retryButton: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
    backgroundColor: '#FDFFF0', color: '#1a4845', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '500'
  },
  logoutButtonError: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
    backgroundColor: '#ef4444', color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '500'
  },
  loginButton: {
    display: 'inline-block', padding: '12px 24px', backgroundColor: '#3b82f6',
    color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '500'
  },
  header: {
    backgroundColor: 'white', borderBottom: '1px solid #e5e7eb',
    position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  headerContainer: {
    maxWidth: '1200px', margin: '0 auto', padding: '16px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  },
  backButton: {
    display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6',
    background: 'none', border: 'none', fontSize: '16px', fontWeight: '500',
    padding: '8px', cursor: 'pointer', borderRadius: '6px'
  },
  backText: { display: 'none' },
  headerTitle: {
    fontSize: '20px', fontWeight: '700', color: '#1f2937',
    margin: 0, flex: 1, textAlign: 'center'
  },
  headerActions: { display: 'flex', alignItems: 'center', gap: '8px' },
  refreshButton: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '36px', height: '36px', backgroundColor: '#FDFFF0',
    border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#1a4845'
  },
  logoutButton: {
    display: 'flex', alignItems: 'center', gap: '6px', background: 'none',
    border: '2px solid red', borderRadius: '8px', padding: '8px 12px',
    color: '#dc2626', cursor: 'pointer', fontSize: '14px', fontWeight: '500'
  },
  logoutText: { display: 'none' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '24px 20px' },
  content: {
    display: 'flex', flexDirection: 'column', gap: '24px',
    animation: 'fadeIn 0.6s ease-out'
  },
  profileCard: {
    backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '32px',
    boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 3px', border: '1px solid #e5e7eb'
  },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '24px' },
  avatar: {
    width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1a4845',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '700', flexShrink: 0, border: '3px solid #dbeafe'
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: '25px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' },
  userEmail: { color: '#6b7280', margin: '0 0 16px 0', fontSize: '16px' },
  badgeContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
  verificationBadge: { display: 'inline-block' },
  verified: {
    display: 'flex', alignItems: 'center', gap: '6px',
    color: '#10b981', fontSize: '14px', fontWeight: '600'
  },
  notVerified: {
    display: 'flex', alignItems: 'center', gap: '6px',
    color: '#ef4444', fontSize: '14px', fontWeight: '600'
  },
  memberSince: {
    display: 'flex', alignItems: 'center', gap: '6px',
    color: '#6b7280', fontSize: '13px'
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(137px, 1fr))', gap: '16px'
  },
  statCard: {
    backgroundColor: '#FDFFF0', padding: '20px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', gap: '16px',
    boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 3px', border: '1px solid #e5e7eb'
  },
  statIcon: {
    width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FDFFF0',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  statContent: { display: 'flex', flexDirection: 'column' },
  statNumber: { fontSize: '24px', fontWeight: '700', color: '#1f2937' },
  statLabel: { fontSize: '14px', color: '#6b7280', fontWeight: '500' },
  infoCards: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px'
  },
  infoCard: {
    backgroundColor: '#FDFFF0', padding: '20px', borderRadius: '12px',
    display: 'flex', alignItems: 'flex-start', gap: '16px',
    boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 3px', border: '1px solid #e5e7eb'
  },
  infoIcon: {
    width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FDFFF0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#6b7280', flexShrink: 0
  },
  infoContent: { flex: 1, minWidth: 0 },
  infoLabel: {
    display: 'block', fontSize: '14px', color: '#6b7280',
    fontWeight: '600', marginBottom: '6px'
  },
  infoValue: {
    margin: 0, fontSize: '16px', color: '#1f2937',
    fontWeight: '500', lineHeight: '1.5'
  },
  menuSection: {
    backgroundColor: 'white', borderRadius: '16px', padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'
  },
  menuTitle: {
    fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 24px 0'
  },
  menuGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  menuItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px', backgroundColor: '#FDFFF0', borderRadius: '12px',
    textDecoration: 'none', color: 'inherit', border: '1px solid #e5e7eb',
    boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 3px',
  },
  menuItemContent: {
    display: 'flex', alignItems: 'center', gap: '16px', flex: 1
  },
  menuIcon: {
    width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FDFFF0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#3b82f6', flexShrink: 0,
  },
  menuInfo: { flex: 1, minWidth: 0 },
  menuLabel: {
    display: 'block', fontSize: '18px', fontWeight: '600',
    color: '#1f2937', marginBottom: '4px'
  },
  menuDesc: { margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.4' },
  chevron: { color: '#9ca3af', flexShrink: 0 },
  summaryCard: {
    backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '32px',
    boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 3px', border: '1px solid #e5e7eb'
  },
  summaryTitle: {
    fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 20px 0'
  },
  summaryGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px'
  },
  summaryItem: {
    display: 'flex', flexDirection: 'column', gap: '6px', padding: '20px',
    backgroundColor: '#FDFFF0', borderRadius: '12px', textAlign: 'center'
  },
  summaryLabel: { fontSize: '14px', color: '#6b7280', fontWeight: '500' },
  summaryValue: { fontSize: '18px', fontWeight: '700', color: '#1f2937' },
  helpSection: {
    backgroundColor: '#FDFFF0', padding: '32px',
    textAlign: 'center'
  },
  helpTitle: {
    fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0'
  },
  helpText: { color: '#6b7280', margin: '0 0 20px 0', fontSize: '14px' },
  helpActions: { display: 'flex', justifyContent: 'center' },
  helpButton: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
    backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none',
    borderRadius: '8px', fontSize: '14px', fontWeight: '500'
  }
};


