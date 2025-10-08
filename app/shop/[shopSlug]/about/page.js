'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import "../../../../styles/ShopslugAbout.css";

import {
  Star,
  Package,
  CheckCircle,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  ArrowLeft,
  Store,
  Award,
  Users,
  Clock,
  Truck,
  MessageCircle,
  Share2,
  Home,
  RefreshCw,
  AlertCircle,
  Mail,
  Globe,
  Calendar,
  TrendingUp
} from 'lucide-react';
import SHeader from '../../../../components/common/SHeader';

// ✅ Enhanced environment variable handling
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

// ✅ FIXED: Helper function to extract phone from slug or query params
const getSellerPhoneFromSlug = (shopSlug, searchParams) => {
  console.log('🔍 About page - Extracting phone from:', {
    shopSlug,
    searchParams: searchParams?.toString(),
    isDev: process.env.NODE_ENV === 'development'
  });

  // ✅ Add null/undefined checks
  if (!shopSlug) {
    console.log('❌ Missing shopSlug');
    return null;
  }

  // ✅ First: Check if shopSlug is already a phone number (direct phone URL)
  if (typeof shopSlug === 'string') {
    // In development, be more flexible with phone validation
    if (process.env.NODE_ENV === 'development') {
      // Allow any numeric string with 1+ digits for testing (very flexible for dev)
      if (/^\d+$/.test(shopSlug)) {
        console.log('✅ Direct phone URL detected (dev mode):', shopSlug);
        return shopSlug;
      }
    } else {
      // Production: strict Indian mobile validation
      if (/^[6-9]\d{9}$/.test(shopSlug)) {
        console.log('✅ Direct phone URL detected (production):', shopSlug);
        return shopSlug;
      }
    }
  }

  // Try to get phone from query params (for SEO URLs)
  const phoneFromParams = searchParams?.get('id');
  console.log('📱 Phone from params:', phoneFromParams);

  if (phoneFromParams) {
    if (process.env.NODE_ENV === 'development') {
      // Allow any numeric string with 1+ digits for testing
      if (/^\d+$/.test(phoneFromParams)) {
        console.log('✅ Valid phone found from params (dev mode):', phoneFromParams);
        return phoneFromParams;
      }
    } else {
      // Production: strict Indian mobile validation
      if (/^[6-9]\d{9}$/.test(phoneFromParams)) {
        console.log('✅ Valid Indian mobile number from params:', phoneFromParams);
        return phoneFromParams;
      }
    }
  }

  // Extract phone from compound slug (e.g., "raj-electronics-kochi-9544344339")
  if (typeof shopSlug === 'string') {
    if (process.env.NODE_ENV === 'development') {
      // Look for any sequence of digits at the end
      const phoneMatch = shopSlug.match(/\d+$/);
      if (phoneMatch) {
        console.log('✅ Phone extracted from compound slug (dev):', phoneMatch[0]);
        return phoneMatch[0];
      }
    } else {
      // Production: look for valid Indian mobile numbers
      const phoneMatch = shopSlug.match(/[6-9]\d{9}$/);
      if (phoneMatch) {
        console.log('✅ Phone extracted from compound slug (production):', phoneMatch[0]);
        return phoneMatch[0];
      }
    }
  }

  console.log('❌ No valid phone number found');
  return null;
};

// ✅ SEO-friendly URL generator (same as other components)
const generateShopSlug = (shop) => {
  if (!shop) return 'shop';

  const shopName = (shop.name || '').toLowerCase()
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




function StoreAboutContent() {
  const [storeData, setStoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { shopSlug } = params;

  // ✅ Extract seller phone from slug or query params
  const sellerPhone = getSellerPhoneFromSlug(shopSlug, searchParams);

  console.log('📍 About page debug:', {
    shopSlug,
    sellerPhone,
    url: typeof window !== 'undefined' ? window.location.href : 'SSR'
  });

  useEffect(() => {
    // Check login status
    try {
      const token = localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.warn('localStorage access error:', error);
      setIsLoggedIn(false);
    }
  }, []);

  const fetchStoreData = async () => {
    if (!sellerPhone) {
      console.error('❌ No sellerPhone provided:', { shopSlug, sellerPhone });
      setError('Invalid store URL - phone number is missing');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Fetching store about data for phone:', sellerPhone);

      // Try the about endpoint first, fallback to main shop endpoint
      let response;
      try {
        response = await axios.get(`${getApiBaseUrl()}/user/store/${sellerPhone}/about/`, {
          timeout: 15000
        });
        console.log('✅ About endpoint successful:', response.data);
      } catch (aboutError) {
        console.log('⚠️ About endpoint failed, trying main shop endpoint');
        response = await axios.get(`${getApiBaseUrl()}/shop/${sellerPhone}/`, {
          timeout: 15000
        });
        console.log('✅ Shop endpoint successful:', response.data);

        // Transform shop data to about format if needed
        if (response.data.store) {
          setStoreData(response.data.store);
        } else {
          setStoreData(response.data);
        }
        setIsLoading(false);
        return;
      }

      setStoreData(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch store about data:", error);
      if (error.response?.status === 404) {
        setError('Store not found. This store may no longer exist or the URL is incorrect.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Failed to load store information. Please try again.');
      }
      setStoreData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [sellerPhone]);

  // ✅ Enhanced: Generate SEO-friendly shop URL for navigation
  const getShopUrl = () => {
    if (!storeData || !sellerPhone) return `/shop`;

    // If we have full store data, create SEO-friendly URL
    if (storeData.name) {
      const shopSlug = generateShopSlug(storeData);
      return `/shop/${shopSlug}?id=${sellerPhone}`;
    }

    // Fallback: use direct phone URL
    return `/shop/${sellerPhone}`;
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently joined';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return `+91 ${phoneStr.slice(0, 5)} ${phoneStr.slice(5)}`;
    }
    return phoneStr;
  };

  if (isLoading) {
    return (
      <div style={styles.pageContainer}>
        <SHeader
          store={null}
          isLoggedIn={isLoggedIn}
        />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading store details...</p>
        </div>
      </div>
    );
  }

  if (!sellerPhone) {
    return (
      <div style={styles.pageContainer}>
        <SHeader
          store={null}
          isLoggedIn={isLoggedIn}
        />
        <div style={styles.errorContainer}>
          <Store size={64} style={styles.errorIcon} />
          <h2 style={styles.errorTitle}>Invalid Store URL</h2>
          <p style={styles.errorText}>The store information is missing from the URL.</p>

          {/* ✅ Enhanced Debug Info */}
          <div style={styles.errorDebug}>
            <strong>Debug Info:</strong><br />
            Shop Slug: <code>{shopSlug || 'undefined'}</code><br />
            Phone: <code>{sellerPhone || 'null'}</code><br />
            URL: <code>{typeof window !== 'undefined' ? window.location.href : 'N/A'}</code><br />
            Environment: <code>{process.env.NODE_ENV || 'unknown'}</code>
          </div>

          {/* ✅ Helpful suggestions */}
          <div style={styles.errorSuggestions}>
            <h4>Try these URLs instead:</h4>
            <ul style={styles.suggestionsList}>
              <li>
                <Link href={`/shop/${shopSlug}?id=${shopSlug}`} style={styles.suggestionLink}>
                  /shop/{shopSlug}?id={shopSlug}
                </Link>
              </li>
              <li>
                <Link href={`/shop/${shopSlug}`} style={styles.suggestionLink}>
                  /shop/{shopSlug} (direct access)
                </Link>
              </li>
            </ul>
          </div>

          <Link href="/shop" style={styles.backLink}>
            <ArrowLeft size={16} />
            Browse All Shops
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <SHeader store={null} isLoggedIn={isLoggedIn} />
        <div style={styles.errorContainer}>
          <AlertCircle size={64} style={styles.errorIcon} />
          <h2 style={styles.errorTitle}>Something went wrong</h2>
          <p style={styles.errorText}>{error}</p>
          <div style={styles.errorActions}>
            <button onClick={fetchStoreData} style={styles.retryButton}>
              <RefreshCw size={16} />
              Try Again
            </button>
            <Link href={getShopUrl()} style={styles.backLink}>
              <ArrowLeft size={16} />
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div style={styles.pageContainer}>
        <SHeader store={null} isLoggedIn={isLoggedIn} />
        <div style={styles.errorContainer}>
          <Store size={64} style={styles.errorIcon} />
          <h2 style={styles.errorTitle}>Store Not Found</h2>
          <p style={styles.errorText}>Could not find this store. It may have been removed or the URL is incorrect.</p>
          <Link href="/shop" style={styles.backLink}>
            <ArrowLeft size={16} />
            Browse All Shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='AboutpageContainer' style={styles.pageContainer}>
      <SHeader
        store={storeData}
        isLoggedIn={isLoggedIn}
      />

      {/* ✅ Enhanced Navigation breadcrumb with SEO URLs */}
      {/* <div style={styles.breadcrumbContainer}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb}>
            <Link href="/" style={styles.breadcrumbLink}>
              <Home size={16} />
              Kerala Sellers
            </Link>
            <span style={styles.breadcrumbSeparator}>›</span>
            <Link href="/shop" style={styles.breadcrumbLink}>
              Shops
            </Link>
            <span style={styles.breadcrumbSeparator}>›</span>
            <Link href={getShopUrl()} style={styles.breadcrumbLink}>
              <Store size={16} />
              {storeData.name}
            </Link>
            <span style={styles.breadcrumbSeparator}>›</span>
            <span style={styles.breadcrumbCurrent}>About</span>
          </nav>
        </div>
      </div> */}

      <div className='shopslugAboutcontainer1' style={styles.container}>
        {/* ✅ Enhanced Back button with correct URL */}
        {/* <Link href={getShopUrl()} style={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Store
        </Link> */}



        <div className="enhanced-store-info-section" style={styles.storeInfoSection}>
          <div className="shopslugAboutcontainer" style={styles.container}>
            <div className='aboutstore-header' style={styles.storeHeader}>
              {/* Left: Logo */}
              <div className='aboutlogocontainer' style={styles.logoContainer}>
                <img
                  src={storeData.logo_url || `https://via.placeholder.com/150x150/3b82f6/ffffff?text=${encodeURIComponent(storeData.name?.charAt(0) || 'S')}`}
                  alt={`${storeData.name} logo`}
                  className='logo-1'
                  style={styles.logo1}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/150x150/3b82f6/ffffff?text=${encodeURIComponent(storeData.name?.charAt(0) || 'S')}`;
                  }}
                />
                {storeData.verification_status === 'verified' && (
                  <div style={styles.verifiedBadge}>
                    <Award size={16} />
                  </div>
                )}
              </div>

              {/* Right: Info Column */}
              <div className='Aboutinfo-column' style={styles.infoColumn}>
                <h1 className='Aboutstorename' style={styles.storeName}>{storeData.name}</h1>
                {storeData.tagline && <p className='Aboutstoretags' style={styles.tagline}>{storeData.tagline}</p>}

                <div style={styles.badges}>
                  {storeData.verification_status === 'verified' && (
                    <span className='Aboutstoretags' style={styles.badge}>
                      <CheckCircle size={12} />
                      Verified Store
                    </span>
                  )}
                  <span className='Aboutstoretags' style={styles.badge}>
                    <Award size={12} />
                    Verified Kerala Seller
                  </span>
                  {storeData.date_joined && (
                    <span style={styles.badge}>
                      <Calendar size={12} />
                      Since {formatJoinDate(storeData.date_joined)}
                    </span>
                  )}
                </div>

                {/* Meta Item */}
                <div className='Aboutstoretags' style={styles.storeMeta}>
                  <Users size={12} />
                  <span>Trusted by customers</span>
                </div>
              </div>

              <div className="store-share" style={styles.storeShare}>
                <div className="store-actions" style={styles.storeActions}>
                  <button className="Aboutaction-button" style={styles.actionButtonPrimary}>
                    <MessageCircle size={16} className='abouticonsize' />
                    <span className="action-text">Chat</span>
                  </button>
                  <button className="Aboutaction-button" style={styles.actionButtonSecondary}>
                    <Phone size={16} className='abouticonsize' />
                    <span className="action-text">Call</span>
                  </button>
                  <button className="Aboutaction-button1" style={styles.actionButtonIcon}>
                    <Share2 size={16} className='abouticonsize' />
                  </button>
                </div>
              </div>

            </div>

            <div className="store-performance" style={styles.storePerformance}>

              <div className="performance-card" style={styles.performanceCard}>
                <div className="performance-icon" style={styles.performanceIcon}>
                  <TrendingUp size={18} aria-hidden="true" />
                </div>
                <div className="performance-content" style={styles.performanceContent}>
                  <span className="performance-number" style={styles.performanceNumber}>5.2k</span>
                  <span className="performance-label" style={styles.performanceLabel}>Orders</span>
                </div>
              </div>
              <div className="performance-card" style={styles.performanceCard}>
                <div className="performance-icon" style={styles.performanceIcon}>
                  <Truck size={18} aria-hidden="true" />
                </div>
                <div className="performance-content" style={styles.performanceContent}>
                  <span className="performance-number" style={styles.performanceNumber}>24hr</span>
                  <span className="performance-label" style={styles.performanceLabel}>Kerala Delivery</span>
                </div>
              </div>
              <div className="performance-card" style={styles.performanceCard}>
                <div className="performance-icon" style={styles.performanceIcon}>
                  <Users size={18} aria-hidden="true" />
                </div>
                <div className="performance-content" style={styles.performanceContent}>
                  <span className="performance-number" style={styles.performanceNumber}>98%</span>
                  <span className="performance-label" style={styles.performanceLabel}>Satisfied</span>
                </div>
              </div>
            </div>
          </div>
        </div>






        {/* Stats Grid */}
        <div style={styles.statsSection}>
          {/* <h2 style={styles.sectionTitle}>Store Performance</h2> */}
          <div className='aboutstat-grid' style={styles.statsGrid}>
            <StatCard
              icon={<Star size={24} fill="currentColor" />}
              value={storeData.average_rating ? Number(storeData.average_rating).toFixed(1) : "New"}
              label="Store Rating"
              color="#f59e0b"
            />
            <StatCard
              icon={<CheckCircle size={24} />}
              value={storeData.stats?.completed_orders || storeData.orders_completed || "0"}
              label="Orders Completed"
              color="#10b981"
            />
            <StatCard
              icon={<Package size={24} />}
              value={storeData.stats?.products_count || storeData.products_count || "0"}
              label="Products Available"
              color="#3b82f6"
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              value={storeData.stats?.monthly_growth || "Growing"}
              label="Monthly Growth"
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* Business Information */}
        {/* <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Business Information</h2>
          <div style={styles.card}>
            <div style={styles.businessGrid}>
              {storeData.gst_number && (
                <div style={styles.businessItem}>
                  <div style={styles.businessIcon}>
                    <Award size={20} />
                  </div>
                  <div>
                    <span style={styles.businessLabel}>GST Number</span>
                    <p style={styles.businessValue}>{storeData.gst_number}</p>
                  </div>
                </div>
              )}
              {storeData.business_license && (
                <div style={styles.businessItem}>
                  <div style={styles.businessIcon}>
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <span style={styles.businessLabel}>Business License</span>
                    <p style={styles.businessValue}>{storeData.business_license}</p>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div> */}

        <div className='aboutContainer' style={styles.aboutContainer}>
          <div className='aboutCard1'
          style={{
            ...styles.aboutCard1,
            textAlign: 'left',       // align text to start
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start' // align all items to left
          }}>
            {/* Left Card */}
            <img
              src={storeData.logo_url || `https://via.placeholder.com/150x150/3b82f6/ffffff?text=${encodeURIComponent(storeData.name?.charAt(0) || 'S')}`}
              alt={`${storeData.name} logo`}
              className='Aboutsluglogo'
              style={styles.logo}
            />
            <p className='aboutslugfootdesc' style={styles.description}>
              {storeData.description ||
                `Welcome to ${storeData.name}! We are a trusted Kerala-based business committed to providing quality and customer satisfaction.`}
            </p>
          </div>


          <div className='aboutCard2'
           style={{
            ...styles.aboutCard2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // center card content horizontally
            textAlign: 'center',  // center text inside each row
          }}>
            {/* Heading */}
            <h3 className='aboutslugfoottitle'
             style={{
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#1F2937'
            }}>
              CONTACT
            </h3>

            {/* Center Card Content */}
            {(storeData.owner_name || storeData.seller_name) && (
              <div style={{ ...styles.infoRow, justifyContent: 'center', width: '100%' }}>
                <Users size={18} />
                <span>{storeData.owner_name || storeData.seller_name}</span>
              </div>
            )}
            <div style={{ ...styles.infoRow, justifyContent: 'center', width: '100%' }}>
              <Phone size={18} />
              <span>{formatPhoneNumber(storeData.whatsapp_number || storeData.phone || sellerPhone)}</span>
            </div>
            {(storeData.business_address || storeData.address) && (
              <div style={{ ...styles.infoRow, justifyContent: 'center', width: '100%' }}>
                <MapPin size={18} />
                <span>{storeData.business_address || storeData.address}</span>
              </div>
            )}
          </div>




          <div className='aboutCard3'
          style={styles.aboutCard3}>
            {/* Right Card */}
            <h3 className='aboutslugfoottitle' style={styles.socialTitle}>FOLLOW US</h3>
            <div style={styles.socialIcons}>
              {storeData.facebook_link && (
                <a href={storeData.facebook_link} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                  <Facebook size={20} />
                </a>
              )}
              {storeData.instagram_link && (
                <a href={storeData.instagram_link} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                  <Instagram size={20} />
                </a>
              )}
            </div>
          </div>
        </div>







        {/* ✅ Enhanced Quick Actions with correct URL */}
        <div style={styles.quickActionsSection}>
          <Link href={getShopUrl()} style={styles.primaryButton}>
            <Package size={16} />
            View All Products
          </Link>
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
      `}</style>
    </div>
  );
}



function StatCard({ icon, value, label, color = '#3b82f6' }) {
  return (
    <div style={styles.statCard}>
      <div className='aboutstat-icon' style={{ ...styles.statIcon, color }}>
        {icon}
      </div>
      <div className='aboutstat-value' style={styles.statValue}>{value}</div>
      <div className='aboutstat-label' style={styles.statLabel}>{label}</div>
    </div>
  );
}

// ✅ Main Export with Suspense Boundary
export default function StoreAboutPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3>Loading store information...</h3>
      </div>
    }>
      <StoreAboutContent />
    </Suspense>
  );
}

// ✅ Enhanced styles with better error display
const styles = {
  pageContainer: {
    minHeight: '100vh',
    marginTop:'90px',
    backgroundColor: '#FDFFF0'
  },

  aboutContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '20px',
    boxSizing: 'border-box',
  },

  aboutCard1: {
    flex: '1 1 30%',      // take 30% width, grow/shrink as needed
    backgroundColor: '#FDFFF0',
    padding: '35px 40px',
    boxSizing: 'border-box',
    minWidth: '250px',   // ensures cards never shrink too much
    textAlign: 'center',
  },

 aboutCard2: {
    flex: '1 1 30%',      // take 30% width, grow/shrink as needed
    backgroundColor: '#FDFFF0',
    padding: '35px 0px',
    boxSizing: 'border-box',
    minWidth: '250px',   // ensures cards never shrink too much
    textAlign: 'center',
  },
   aboutCard3: {
    flex: '1 1 30%',      // take 30% width, grow/shrink as needed
    backgroundColor: '#FDFFF0',
    padding: '53px 0px',
    boxSizing: 'border-box',
    minWidth: '250px',   // ensures cards never shrink too much
    textAlign: 'center',
  },


  logo: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    // marginBottom: '15px',
  },



  description: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.5',
  },

  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#333',
  },



  socialIcons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },

  socialIcon: {
    color: '#555',
    transition: 'color 0.2s',
  },


  socialIconHover: {
    transform: 'scale(1.1)',
  },

  // Loading & Error States
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
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

  loadingText: {
    color: '#6b7280',
    fontSize: '16px'
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px',
    textAlign: 'center',
    padding: '40px'
  },

  errorIcon: {
    color: '#ef4444'
  },

  errorTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },

  errorText: {
    color: '#6b7280',
    fontSize: '16px',
    margin: 0,
    maxWidth: '400px',
    lineHeight: '1.5'
  },

  errorDebug: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    fontSize: '14px',
    maxWidth: '600px',
    textAlign: 'left',
    fontFamily: 'monospace'
  },

  // ✅ New: Error suggestions
  errorSuggestions: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    border: '1px solid #3b82f6'
  },

  suggestionsList: {
    textAlign: 'left',
    margin: '10px 0 0 20px'
  },

  suggestionLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontFamily: 'monospace',
    fontSize: '14px'
  },

  errorActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center'
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
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },

  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    textDecoration: 'none',
    padding: '12px 24px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },

  // Breadcrumb
  breadcrumbContainer: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '12px 0'
  },

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    flexWrap: 'wrap'
  },

  breadcrumbLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#3b82f6',
    textDecoration: 'none',
    transition: 'color 0.2s'
  },

  breadcrumbSeparator: {
    color: '#9ca3af'
  },

  breadcrumbCurrent: {
    color: '#6b7280',
    fontWeight: '500'
  },

  // Back button
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 0',
    marginBottom: '16px',
    transition: 'color 0.2s'
  },

  // Main Container
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animation: 'fadeIn 0.6s ease-out'
  },

  // Store Header
  storeHeader: {
    display: 'flex',
    justifyContent: 'space-between', // Logo+info left, actions right
    alignItems: 'center', // vertically align
    flexWrap: 'wrap',
    gap: '2rem',
    width: '100%',
  },

  logoContainer: {
    position: 'relative',
    flexShrink: 0,
  },


  logo1: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  verifiedBadge: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    backgroundColor: '#10B981',
    color: '#fff',
    borderRadius: '50%',
    padding: '4px',
  },

  infoColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: '0.5rem',
    flex: 1,
    marginTop: '19px',
  },

  storeName: {
    fontSize: '1.8rem',
    fontWeight: 600,
    margin: 0,
  },

  tagline: {
    fontSize: '1rem',
    color: '#555',
    margin: 0,
  },

  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },

  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    color: '#374151',

  },

  storeMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
    color: '#374151',
  },

  storeInfo: {
    flex: 1,
    minWidth: '250px'
  },

  storeShare: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  storeActions: {
    display: 'flex',
    flexDirection: 'column', // stack vertically
    alignItems: 'center',
    gap: '10px',
  },


  // Sections
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },

  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },

  // Stats Section
  statsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },

  statCard: {
    backgroundColor: 'transparent',
    padding: '24px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s'
  },

  statIcon: {
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'center'
  },

  statValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '4px'
  },

  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },

  // Business Information
  businessGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '20px'
  },

  businessItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  },

  businessIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3b82f6',
    flexShrink: 0
  },

  businessLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: '4px'
  },

  businessValue: {
    margin: 0,
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '500'
  },


  // Contact Section
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '20px',
    marginBottom: '24px'
  },

  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  },

  contactIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3b82f6',
    flexShrink: 0
  },

  contactInfo: {
    flex: 1
  },

  contactLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: '4px'
  },

  contactValue: {
    margin: 0,
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '500'
  },

  websiteLink: {
    color: '#3b82f6',
    textDecoration: 'none'
  },

  // Delivery Section
  deliverySection: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px',
    marginBottom: '24px'
  },

  deliveryTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 16px 0'
  },

  deliveryGrid: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },

  deliveryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151'
  },

  // Social Section
  socialSection: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px'
  },

  socialTitle: {
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 16px 0'
  },

  socialLinks: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },

  socialLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    textDecoration: 'none',
    padding: '12px 16px',
    backgroundColor: '#f1f5f9',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },

  // Quick Actions
  quickActionsSection: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 0'
  },

  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  // Store Info Styles
  storeInfoSection: {
    backgroundColor: '#FDFFF0',
    padding: '32px 0',
  },

  storeHeader: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },

  storeIdentity: {
    display: 'flex',
    gap: '20px',
    flex: 1,
    minWidth: '300px'
  },

  storeLogoWrapper: {
    position: 'relative',
    flexShrink: 0
  },

  storeLogo: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #f1f5f9',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },

  storeLogoPlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '700',
    border: '4px solid #f1f5f9',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },



  storeDetails: {
    flex: 1,
    minWidth: '250px'
  },

  storeNameSection: {
    marginBottom: '12px'
  },



  storeBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },

  badgeVerified: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #10b981',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#065f46',
    fontWeight: '500'
  },

  badgeResponsive: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#eff6ff',
    border: '1px solid #3b82f6',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#1e40af',
    fontWeight: '500'
  },

  storeTagline: {
    fontSize: '1.1rem',
    color: '#3b82f6',
    fontWeight: '500',
    margin: '0 0 16px 0'
  },



  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#4b5563'
  },

  metaItemLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#059669',
    fontWeight: '600'
  },


  actionButtonPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#1a4845',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },

  actionButtonSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },

  actionButtonIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: 'white',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  // Store Performance
  storePerformance: {
    display: 'flex',
    gap: '50px',
    padding: '20px 30px',
    flexWrap: 'wrap'
  },

  performanceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  performanceIcon: {
    color: '#3b82f6'
  },

  performanceContent: {
    display: 'flex',
    flexDirection: 'column'
  },

  performanceNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937'
  },

  performanceLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  storeDescriptionCard: {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },

  descriptionExpanded: {
    margin: '12px 0'
  },

  descriptionCollapsed: {
    margin: '12px 0',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },


};
