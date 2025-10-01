'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <div style={styles.pageContainer}>
      <SHeader
        store={storeData}
        isLoggedIn={isLoggedIn}
      />

      {/* ✅ Enhanced Navigation breadcrumb with SEO URLs */}
      <div style={styles.breadcrumbContainer}>
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
      </div>

      <div style={styles.container}>
        {/* ✅ Enhanced Back button with correct URL */}
        <Link href={getShopUrl()} style={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Store
        </Link>

        {/* Store Header */}
        <div style={styles.storeHeader}>
          <div style={styles.logoContainer}>
            <img
              src={storeData.logo_url || `https://via.placeholder.com/150x150/3b82f6/ffffff?text=${encodeURIComponent(storeData.name?.charAt(0) || 'S')}`}
              alt={`${storeData.name} logo`}
              style={styles.logo}
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
          <div style={styles.storeInfo}>
            <h1 style={styles.storeName}>{storeData.name}</h1>
            {storeData.tagline && (
              <p style={styles.tagline}>{storeData.tagline}</p>
            )}
            <div style={styles.badges}>
              {storeData.verification_status === 'verified' && (
                <span style={styles.badge}>
                  <CheckCircle size={12} />
                  Verified Store
                </span>
              )}
              <span style={styles.badge}>
                <Users size={12} />
                Trusted Kerala Seller
              </span>
              {storeData.date_joined && (
                <span style={styles.badge}>
                  <Calendar size={12} />
                  Since {formatJoinDate(storeData.date_joined)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="enhanced-store-info-section" style={styles.storeInfoSection}>
          <div className="container" style={styles.container}>
            <div className="store-header" style={styles.storeHeader}>
              <div className="store-identity" style={styles.storeIdentity}>

                <div className="store-details-enhanced" style={styles.storeDetails}>
                  <div className="store-name-section" style={styles.storeNameSection}>
                    <div className="store-badges" style={styles.storeBadges}>
                      <span className="badge verified" style={styles.badgeVerified}>
                        <Award size={10} aria-hidden="true" />
                        Verified Kerala Seller
                      </span>
                      <span className="badge responsive" style={styles.badgeResponsive}>
                        <Clock size={10} aria-hidden="true" />
                        Fast Response
                      </span>
                    </div>
                  </div>

                  <div className="store-meta" style={styles.storeMeta}>

                    <div className="meta-item" style={styles.metaItem}>
                      <Users size={12} aria-hidden="true" />
                      <span>Trusted by customers</span>
                    </div>

                  </div>
                </div>
              </div>
              <div className="store-actions" style={styles.storeActions}>
                <button className="action-button primary" style={styles.actionButtonPrimary} aria-label="Chat with store">
                  <MessageCircle size={16} aria-hidden="true" />
                  <span className="action-text">Chat</span>
                </button>
                <button className="action-button secondary" style={styles.actionButtonSecondary} aria-label="Call store">
                  <Phone size={16} aria-hidden="true" />
                  <span className="action-text">Call</span>
                </button>
                <button className="action-button icon-only" style={styles.actionButtonIcon} aria-label="Share store">
                  <Share2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="store-performance" style={styles.storePerformance}>
              <div className="performance-card" style={styles.performanceCard}>
                <div className="performance-icon" style={styles.performanceIcon}>
                  <Star size={18} fill="currentColor" aria-hidden="true" />
                </div>
                {/* <div className="performance-content" style={styles.performanceContent}>
                  <span className="performance-number" style={styles.performanceNumber}>
                    {store.average_rating?.toFixed(1) || '4.8'}
                  </span>
                  <span className="performance-label" style={styles.performanceLabel}>Rating</span>
                </div> */}
              </div>
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
          <h2 style={styles.sectionTitle}>Store Performance</h2>
          <div style={styles.statsGrid}>
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
        <div style={styles.section}>
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
              {(storeData.owner_name || storeData.seller_name) && (
                <div style={styles.businessItem}>
                  <div style={styles.businessIcon}>
                    <Users size={20} />
                  </div>
                  <div>
                    <span style={styles.businessLabel}>Owner</span>
                    <p style={styles.businessValue}>{storeData.owner_name || storeData.seller_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>About Our Store</h2>
          <div style={styles.card}>
            <p style={styles.description}>
              {storeData.description || `Welcome to ${storeData.name}! We are a trusted Kerala-based business committed to providing you with the best products and exceptional customer service. Our team works hard to ensure quality and satisfaction with every purchase.`}
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Contact & Location</h2>
          <div style={styles.card}>
            <div style={styles.contactGrid}>
              {(storeData.business_address || storeData.address || storeData.seller_address) && (
                <div style={styles.contactItem}>
                  <div style={styles.contactIcon}>
                    <MapPin size={20} />
                  </div>
                  <div style={styles.contactInfo}>
                    <span style={styles.contactLabel}>Business Address</span>
                    <p style={styles.contactValue}>
                      {storeData.business_address || storeData.address || storeData.seller_address}
                    </p>
                  </div>
                </div>
              )}

              <div style={styles.contactItem}>
                <div style={styles.contactIcon}>
                  <Phone size={20} />
                </div>
                <div style={styles.contactInfo}>
                  <span style={styles.contactLabel}>Phone Number</span>
                  <p style={styles.contactValue}>
                    {formatPhoneNumber(storeData.whatsapp_number || storeData.phone || sellerPhone)}
                  </p>
                </div>
              </div>

              {storeData.email && (
                <div style={styles.contactItem}>
                  <div style={styles.contactIcon}>
                    <Mail size={20} />
                  </div>
                  <div style={styles.contactInfo}>
                    <span style={styles.contactLabel}>Email</span>
                    <p style={styles.contactValue}>{storeData.email}</p>
                  </div>
                </div>
              )}

              {storeData.website && (
                <div style={styles.contactItem}>
                  <div style={styles.contactIcon}>
                    <Globe size={20} />
                  </div>
                  <div style={styles.contactInfo}>
                    <span style={styles.contactLabel}>Website</span>
                    <p style={styles.contactValue}>
                      <a href={storeData.website} target="_blank" rel="noopener noreferrer" style={styles.websiteLink}>
                        {storeData.website}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Information */}
            {(storeData.delivery_time_local || storeData.delivery_time_national) && (
              <div style={styles.deliverySection}>
                <h3 style={styles.deliveryTitle}>Delivery Information</h3>
                <div style={styles.deliveryGrid}>
                  {storeData.delivery_time_local && (
                    <div style={styles.deliveryItem}>
                      <Clock size={16} />
                      <span>Local Kerala: {storeData.delivery_time_local}</span>
                    </div>
                  )}
                  {storeData.delivery_time_national && (
                    <div style={styles.deliveryItem}>
                      <Clock size={16} />
                      <span>National: {storeData.delivery_time_national}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            {(storeData.instagram_link || storeData.facebook_link) && (
              <div style={styles.socialSection}>
                <h3 style={styles.socialTitle}>Follow Us</h3>
                <div style={styles.socialLinks}>
                  {storeData.instagram_link && (
                    <a
                      href={storeData.instagram_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.socialLink}
                    >
                      <Instagram size={18} />
                      <span>Instagram</span>
                    </a>
                  )}
                  {storeData.facebook_link && (
                    <a
                      href={storeData.facebook_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.socialLink}
                    >
                      <Facebook size={18} />
                      <span>Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            )}
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
      <div style={{ ...styles.statIcon, color }}>
        {icon}
      </div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
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
    backgroundColor: '#f8fafc'
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animation: 'fadeIn 0.6s ease-out'
  },

  // Store Header
  storeHeader: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap'
  },

  logoContainer: {
    position: 'relative',
    flexShrink: 0
  },

  logo: {
    width: '120px',
    height: '120px',
    borderRadius: '20px',
    objectFit: 'cover',
    border: '3px solid #f1f5f9'
  },

  verifiedBadge: {
    position: 'absolute',
    bottom: '-8px',
    right: '-8px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid white'
  },

  storeInfo: {
    flex: 1,
    minWidth: '250px'
  },

  storeName: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },

  tagline: {
    fontSize: '1.125rem',
    color: '#6b7280',
    margin: '0 0 16px 0',
    lineHeight: '1.5'
  },

  badges: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },

  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f1f5f9',
    color: '#6b7280',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
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
    backgroundColor: 'white',
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
    fontSize: '2rem',
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

  // Description
  description: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.7',
    margin: 0
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
    fontSize: '18px',
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
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '32px 0',
    marginBottom: '32px'
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
    width: '120px',
    height: '120px',
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

  verifiedBadge: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    width: '24px',
    height: '24px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white'
  },

  storeDetails: {
    flex: 1,
    minWidth: '250px'
  },

  storeNameSection: {
    marginBottom: '12px'
  },

  storeName: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
    lineHeight: '1.2'
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

  storeMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
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

  storeActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  actionButtonPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
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
    gap: '32px',
    padding: '20px 0',
    borderTop: '1px solid #f3f4f6',
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
