'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Edit3, Heart, ArrowLeft, LogOut, Store, RefreshCw, AlertTriangle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function ShopProfilePage() {
  const { shopSlug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [buyer, setBuyer] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [urlError, setUrlError] = useState(null);

  // Get actual store ID from URL parameters
  const getActualStoreId = () => {
    console.log('🔍 Getting store ID for profile...');
    console.log('- shopSlug from params:', shopSlug);
    console.log('- id from search params:', searchParams.get('id'));

    if (shopSlug === 'undefined' || shopSlug === undefined) {
      setUrlError('Invalid shop slug in URL');
      return null;
    }

    const queryId = searchParams.get('id');
    if (queryId && queryId !== 'undefined' && queryId.trim() !== '') {
      return queryId.trim();
    }
    
    if (shopSlug && shopSlug !== 'new' && shopSlug !== 'undefined') {
      return shopSlug;
    }
    
    setUrlError('No valid store ID found');
    return null;
  };

  const actualStoreId = getActualStoreId();
  console.log('👤 Profile store ID:', actualStoreId);

  // Generate shop URLs
  const getShopUrl = (path = '') => {
    if (!actualStoreId) {
      console.error('❌ Cannot generate URL - no store ID available');
      return '/';
    }
    
    if (searchParams.get('id') && shopSlug === 'new') {
      const basePath = `/shop/new${path}`;
      return `${basePath}?id=${actualStoreId}`;
    } else {
      return `/shop/${actualStoreId}${path}`;
    }
  };

  // Check authentication
  const checkAuth = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');
    if (!token) {
      const loginUrl = getShopUrl('/login');
      const currentUrl = getShopUrl('/profile');
      const redirectUrl = `${loginUrl}?redirect=${encodeURIComponent(currentUrl)}`;
      console.log('🔐 No token, redirecting to login:', redirectUrl);
      router.push(redirectUrl);
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  };

  // Redirect if invalid URL
  useEffect(() => {
    if (urlError || !actualStoreId) {
      console.log('🔍 Invalid profile URL, redirecting to home...');
      router.replace('/');
      return;
    }
  }, [urlError, actualStoreId, router]);

  // Fetch orders count using the working endpoint
  const fetchOrdersCount = async (storeId, headers) => {
    const endpoint = `${API_BASE_URL}/user/orders/count/?store_id=${storeId}`;
    
    try {
      console.log('📊 Fetching orders count from:', endpoint);
      const response = await fetch(endpoint, { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Orders count response:', data);
        
        // Extract count from response
        let count = 0;
        if (typeof data === 'object' && data !== null) {
          count = data.count || data.orders_count || data.total || 0;
        } else if (typeof data === 'number') {
          count = data;
        }
        
        console.log('📊 Final orders count:', count);
        return count;
      } else {
        console.log('❌ Orders count failed:', response.status);
        return 0;
      }
    } catch (error) {
      console.log('❌ Orders count error:', error);
      return 0;
    }
  };

  // Fetch wishlist count
  const fetchWishlistCount = async (storeId, headers) => {
    const endpoint = `${API_BASE_URL}/api/wishlist/?store_id=${storeId}`;
    
    try {
      console.log('❤️ Fetching wishlist count from:', endpoint);
      const response = await fetch(endpoint, { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Wishlist response:', data);
        
        // Extract count from response
        let count = 0;
        if (Array.isArray(data)) {
          count = data.length;
        } else if (data && typeof data === 'object') {
          count = data.items?.length || 
                  data.results?.length || 
                  data.count || 
                  data.total_items || 
                  data.total || 0;
        }
        
        console.log('❤️ Final wishlist count:', count);
        return count;
      } else {
        console.log('❌ Wishlist count failed:', response.status);
        return 0;
      }
    } catch (error) {
      console.log('❌ Wishlist count error:', error);
      return 0;
    }
  };

  // Main data fetching function
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const headers = checkAuth();
    if (!headers) return;

    if (!actualStoreId) {
      console.error('❌ No valid store ID found');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log('📡 Fetching profile data for store ID:', actualStoreId);
      
      // Fetch profile and store data in parallel
      const [profileRes, storeRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/buyer/profile/`, { headers }),
        fetch(`${API_BASE_URL}/shop/${actualStoreId}/`)
      ]);

      // Handle profile response
      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        const profileData = await profileRes.value.json();
        setBuyer(profileData);
        console.log('✅ Profile data loaded');
      } else {
        console.warn('⚠️ Profile API failed');
      }

      // Handle store response
      if (storeRes.status === 'fulfilled' && storeRes.value.ok) {
        const storeResData = await storeRes.value.json();
        setStoreData(storeResData.store || storeResData);
        console.log('✅ Store data loaded');
      } else {
        console.warn('⚠️ Store data not found, using fallback');
        setStoreData({
          name: `Store ${actualStoreId}`,
          seller_phone: actualStoreId,
          id: actualStoreId
        });
      }

      // Fetch counts
      console.log('📊 Fetching counts for store:', actualStoreId);
      
      const [ordersCountResult, wishlistCountResult] = await Promise.allSettled([
        fetchOrdersCount(actualStoreId, headers),
        fetchWishlistCount(actualStoreId, headers)
      ]);

      // Set orders count
      if (ordersCountResult.status === 'fulfilled') {
        setOrdersCount(ordersCountResult.value);
        console.log('✅ Orders count set to:', ordersCountResult.value);
      } else {
        setOrdersCount(0);
        console.warn('⚠️ Orders count failed');
      }

      // Set wishlist count
      if (wishlistCountResult.status === 'fulfilled') {
        setWishlistCount(wishlistCountResult.value);
        console.log('✅ Wishlist count set to:', wishlistCountResult.value);
      } else {
        setWishlistCount(0);
        console.warn('⚠️ Wishlist count failed');
      }

    } catch (error) {
      console.error('❌ Failed to fetch profile data:', error);
      setOrdersCount(0);
      setWishlistCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (actualStoreId && !urlError) {
      fetchData();
    }
  }, [actualStoreId]);

  // Handle logout
  const handleLogout = () => {
    if (window.confirm(`Logout from ${storeData?.name || 'this store'}?\n\nYou'll need to login again to access your account.`)) {
      console.log('🔐 Logging out from store:', actualStoreId);
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('buyerAccessToken');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
      
      const loginUrl = getShopUrl('/login');
      router.push(loginUrl);
    }
  };

  // Handle back navigation
  const handleBackClick = () => {
    const backUrl = getShopUrl('');
    console.log('🔙 Back to shop:', backUrl);
    router.push(backUrl);
  };

  // Handle refresh
  const handleRefresh = () => {
    console.log('🔄 Refreshing profile data...');
    fetchData(true);
  };

  // Loading state
  if (loading || urlError) {
    return (
      <div style={styles.loadingContainer}>
        {urlError ? (
          <>
            <AlertTriangle size={48} color="#ef4444" />
            <h2>Invalid Profile URL</h2>
            <p>{urlError}</p>
            <p>Redirecting to home...</p>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <p>Loading your profile...</p>
            <p style={{fontSize: '12px', color: '#666'}}>
              Store ID: {actualStoreId || 'Not found'}
            </p>
          </>
        )}
      </div>
    );
  }

  // Error state
  if (!actualStoreId) {
    return (
      <div style={styles.errorContainer}>
        <Store size={48} color="#ef4444" />
        <h2>Store Not Found</h2>
        <p>Unable to identify the store. Please check the URL.</p>
        <button onClick={() => router.push('/')} style={styles.homeButton}>
          Go Home
        </button>
      </div>
    );
  }

  // Login required state
  if (!buyer) {
    return (
      <div style={styles.errorContainer}>
        <User size={48} color="#3b82f6" />
        <h2>Please Login</h2>
        <p>Login to access your profile at {storeData?.name || `Store ${actualStoreId}`}</p>
        <Link href={getShopUrl('/login')} style={styles.loginButton}>
          Login to {storeData?.name || `Store ${actualStoreId}`}
        </Link>
      </div>
    );
  }

  // Main profile page
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={handleBackClick} style={styles.backButton}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={styles.title}>
          {storeData?.name || `Store ${actualStoreId}`} Profile
        </h1>
        <div style={styles.headerActions}>
          <button 
            onClick={handleRefresh} 
            style={{...styles.refreshButton, opacity: refreshing ? 0.6 : 1}}
            disabled={refreshing}
            title="Refresh data"
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
          </button>
          <button onClick={handleLogout} style={styles.logoutButton} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Store Indicator */}
      <div style={styles.storeIndicator}>
        <Store size={20} />
        <div>
          <div style={styles.storeTitle}>
            Shopping at {storeData?.name || `Store ${actualStoreId}`}
          </div>
          <div style={styles.storeSubtitle}>
            Your account data is store-specific • Store ID: {actualStoreId}
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div style={styles.profileCard}>
        <div style={styles.avatar}>
          {buyer.full_name?.charAt(0)?.toUpperCase() || buyer.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div style={styles.profileInfo}>
          <h2 style={styles.userName}>{buyer.full_name || 'User'}</h2>
          <p style={styles.userEmail}>{buyer.email}</p>
          {buyer.phone_number && (
            <p style={styles.userPhone}>{buyer.phone_number}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Package size={24} color="#3b82f6" />
          <div>
            <div style={styles.statNumber}>{ordersCount}</div>
            <div style={styles.statLabel}>Orders from Store</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <Heart size={24} color="#ef4444" />
          <div>
            <div style={styles.statNumber}>{wishlistCount}</div>
            <div style={styles.statLabel}>Store Wishlist</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={styles.menuSection}>
        <Link href={getShopUrl('/profile/edit')} style={styles.menuItem}>
          <Edit3 size={24} color="#6b7280" />
          <div>
            <div style={styles.menuLabel}>Edit Profile</div>
            <div style={styles.menuDesc}>Update your information</div>
          </div>
          <div style={styles.menuArrow}>→</div>
        </Link>

        <Link href={getShopUrl('/profile/orders')} style={styles.menuItem}>
          <Package size={24} color="#6b7280" />
          <div>
            <div style={styles.menuLabel}>My Orders</div>
            <div style={styles.menuDesc}>
              {ordersCount > 0 ? `${ordersCount} orders from this store` : 'No orders yet'}
            </div>
          </div>
          <div style={styles.menuArrow}>→</div>
        </Link>

        <Link href={getShopUrl('/profile/wishlist')} style={styles.menuItem}>
          <Heart size={24} color="#6b7280" />
          <div>
            <div style={styles.menuLabel}>Store Wishlist</div>
            <div style={styles.menuDesc}>
              {wishlistCount > 0 ? `${wishlistCount} items saved` : 'No wishlist items'}
            </div>
          </div>
          <div style={styles.menuArrow}>→</div>
        </Link>
      </div>

      {/* Simple Debug Info */}
      <div style={{
        backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px',
        marginTop: '20px', fontSize: '12px', color: '#666', fontFamily: 'monospace'
      }}>
        <div style={{fontWeight: 'bold', marginBottom: '8px', color: '#333'}}>🔍 Debug Information:</div>
        <div><strong>Store ID:</strong> {actualStoreId}</div>
        <div><strong>Orders Count:</strong> {ordersCount} (Endpoint: /user/orders/count/)</div>
        <div><strong>Wishlist Count:</strong> {wishlistCount} (Endpoint: /api/wishlist/)</div>
        <div><strong>User:</strong> {buyer?.full_name || buyer?.email || 'N/A'}</div>
        <div><strong>Store Name:</strong> {storeData?.name || 'Loading...'}</div>
        <div><strong>URL Pattern:</strong> {searchParams.get('id') ? 'new+id' : 'direct'}</div>
        <div><strong>Refreshing:</strong> {refreshing ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', maxWidth: '800px', margin: '0 auto' },
  loadingContainer: { 
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', minHeight: '100vh', gap: '20px', textAlign: 'center' 
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
  homeButton: { 
    padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', 
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' 
  },
  loginButton: { 
    padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', 
    textDecoration: 'none', borderRadius: '8px', fontWeight: '600' 
  },
  header: { 
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
    marginBottom: '20px', backgroundColor: 'white', borderRadius: '12px',
    padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  backButton: { 
    background: 'none', border: 'none', cursor: 'pointer', 
    color: '#3b82f6', padding: '8px', borderRadius: '6px',
    transition: 'all 0.2s'
  },
  title: { 
    fontSize: '20px', fontWeight: '700', color: '#1f2937', 
    flex: 1, textAlign: 'center', margin: '0 16px'
  },
  headerActions: {
    display: 'flex', alignItems: 'center', gap: '8px'
  },
  refreshButton: {
    background: 'none', border: '1px solid #d1d5db', borderRadius: '6px',
    padding: '8px', color: '#6b7280', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s'
  },
  logoutButton: { 
    background: 'none', border: '2px solid #ef4444', borderRadius: '8px', 
    padding: '8px 12px', color: '#ef4444', cursor: 'pointer', 
    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px',
    transition: 'all 0.2s'
  },
  storeIndicator: { 
    display: 'flex', alignItems: 'center', gap: '12px', 
    backgroundColor: '#ecfdf5', border: '2px solid #10b981', 
    borderRadius: '12px', padding: '16px', marginBottom: '20px' 
  },
  storeTitle: { fontSize: '16px', fontWeight: '700', color: '#047857' },
  storeSubtitle: { fontSize: '13px', color: '#059669', marginTop: '2px' },
  profileCard: { 
    display: 'flex', alignItems: 'center', gap: '16px', 
    backgroundColor: 'white', borderRadius: '12px', 
    padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  avatar: { 
    width: '60px', height: '60px', borderRadius: '50%', 
    backgroundColor: '#3b82f6', color: 'white', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', 
    fontSize: '24px', fontWeight: '700', flexShrink: 0
  },
  profileInfo: { flex: 1 },
  userName: { 
    fontSize: '20px', fontWeight: '700', color: '#1f2937', 
    margin: '0 0 4px 0' 
  },
  userEmail: { color: '#6b7280', margin: '0 0 2px 0', fontSize: '14px' },
  userPhone: { color: '#6b7280', margin: 0, fontSize: '14px' },
  statsGrid: { 
    display: 'grid', gridTemplateColumns: '1fr 1fr', 
    gap: '16px', marginBottom: '20px' 
  },
  statCard: { 
    display: 'flex', alignItems: 'center', gap: '12px', 
    backgroundColor: 'white', borderRadius: '12px', padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.2s'
  },
  statNumber: { fontSize: '24px', fontWeight: '700', color: '#1f2937' },
  statLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '500' },
  menuSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
  menuItem: { 
    display: 'flex', alignItems: 'center', gap: '16px', 
    backgroundColor: 'white', borderRadius: '12px', padding: '20px', 
    textDecoration: 'none', color: 'inherit', position: 'relative',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.2s'
  },
  menuLabel: { fontSize: '16px', fontWeight: '600', color: '#1f2937' },
  menuDesc: { fontSize: '14px', color: '#6b7280', marginTop: '2px' },
  menuArrow: { 
    marginLeft: 'auto', fontSize: '18px', color: '#d1d5db',
    transition: 'all 0.2s'
  }
};
