'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import "../../../../styles/ShopslugAbout.css";
import ShopFooter from '../../../../components/common/ShopFooter';

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
  TrendingUp,
  Heart,
  Shield,
  Zap,
  Target,
  Copy,
  Check, ShieldCheck, Lock, Headphones,
} from 'lucide-react';
import SHeader from '../../../../components/common/SHeader';

// ✅ Enhanced environment variable handling
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

// ✅ Helper function to extract phone from slug or query params
const getSellerPhoneFromSlug = (shopSlug, searchParams) => {
  console.log('🔍 About page - Extracting phone from:', {
    shopSlug,
    searchParams: searchParams?.toString(),
    isDev: process.env.NODE_ENV === 'development'
  });

  if (!shopSlug) {
    console.log('❌ Missing shopSlug');
    return null;
  }

  // First: Check if shopSlug is already a phone number (direct phone URL)
  if (typeof shopSlug === 'string') {
    if (process.env.NODE_ENV === 'development') {
      if (/^\d+$/.test(shopSlug)) {
        console.log('✅ Direct phone URL detected (dev mode):', shopSlug);
        return shopSlug;
      }
    } else {
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
      if (/^\d+$/.test(phoneFromParams)) {
        console.log('✅ Valid phone found from params (dev mode):', phoneFromParams);
        return phoneFromParams;
      }
    } else {
      if (/^[6-9]\d{9}$/.test(phoneFromParams)) {
        console.log('✅ Valid Indian mobile number from params:', phoneFromParams);
        return phoneFromParams;
      }
    }
  }

  // Extract phone from compound slug (e.g., "raj-electronics-kochi-9544344339")
  if (typeof shopSlug === 'string') {
    if (process.env.NODE_ENV === 'development') {
      const phoneMatch = shopSlug.match(/\d+$/);
      if (phoneMatch) {
        console.log('✅ Phone extracted from compound slug (dev):', phoneMatch[0]);
        return phoneMatch[0];
      }
    } else {
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

// ✅ SEO-friendly URL generator
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
  const [shareStatus, setShareStatus] = useState(''); // For share feedback
  const [copied, setCopied] = useState(false); // For copy link feedback

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

  // ✅ ENHANCED: Working action button handlers
  const handleChatClick = () => {
    const phone = storeData?.whatsapp_number || storeData?.phone || sellerPhone;
    const message = `Hi ${storeData?.name || 'there'}! I'm interested in your products. Can you help me?`;
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCallClick = () => {
    const phone = storeData?.whatsapp_number || storeData?.phone || sellerPhone;
    window.open(`tel:+91${phone}`, '_self');
  };

  // ✅ ENHANCED: Advanced sharing functionality
  const handleShareClick = async () => {
    const shareData = {
      title: `${storeData?.name || 'Kerala Store'} - Kerala Sellers`,
      text: `Check out ${storeData?.name || 'this amazing store'} on Kerala Sellers! ${storeData?.tagline || 'Quality products from Kerala.'}`,
      url: window.location.href
    };

    try {
      // Try native Web Share API first (mobile)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareStatus('shared');
        setTimeout(() => setShareStatus(''), 2000);
        return;
      }

      // Fallback: Copy link to clipboard
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setShareStatus('copied');
      setTimeout(() => {
        setCopied(false);
        setShareStatus('');
      }, 2000);

    } catch (error) {
      console.error('Error sharing:', error);
      // Last resort: Manual copy
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setCopied(true);
      setShareStatus('copied');
      setTimeout(() => {
        setCopied(false);
        setShareStatus('');
      }, 2000);
    }
  };

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
      console.log('🔍 Fetching store data for phone:', sellerPhone);

      // ✅ Use the working main shop endpoint first
      let response;
      try {
        console.log('🔍 Trying main shop endpoint...');
        response = await axios.get(`${'https://api.keralasellers.in'}/shop/${sellerPhone}/`, {
          timeout: 15000
        });
        console.log('✅ Main shop endpoint successful:', response.data);

        // Handle main endpoint response
        if (response.data.store) {
          // Main endpoint returns { store: {...}, products: [...], products_count: 5 }
          const storeWithStats = {
            ...response.data.store,
            products_count: response.data.products_count,
            available_products: response.data.products_count,
            total_orders: response.data.store.total_orders || 0,
            completed_orders: response.data.store.completed_orders || 0,
            average_rating: response.data.store.average_rating || 0.0,
          };
          setStoreData(storeWithStats);
        } else {
          setStoreData(response.data);
        }
        setIsLoading(false);
        return;

      } catch (mainError) {
        console.log('⚠️ Main shop endpoint failed, trying about endpoint');
        try {
          response = await axios.get(`${'https://api.keralasellers.in'}/shop/${sellerPhone}/about/`, {
            timeout: 15000
          });
          console.log('✅ About endpoint successful:', response.data);
          setStoreData(response.data);
          setIsLoading(false);
          return;
        } catch (aboutError) {
          console.log('⚠️ About endpoint failed, trying profile endpoint');
          try {
            response = await axios.get(`${'https://api.keralasellers.in'}/shop/${sellerPhone}/profile/`, {
              timeout: 15000
            });
            console.log('✅ Profile endpoint successful:', response.data);
            setStoreData(response.data);
            setIsLoading(false);
            return;
          } catch (profileError) {
            throw new Error('All endpoints failed');
          }
        }
      }

    } catch (error) {
      console.error("❌ Failed to fetch store data:", error);
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

  // ✅ Generate SEO-friendly shop URL for navigation
  const getShopUrl = () => {
    if (!storeData || !sellerPhone) return `/shop`;

    if (storeData.name) {
      const shopSlug = generateShopSlug(storeData);
      return `/shop/${shopSlug}?id=${sellerPhone}`;
    }

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
<ShopFooter store={storeData} />
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
          <Link href="/shop" style={styles.backLink}>
            <ArrowLeft size={16} />
            Browse All Shops
          </Link>
        </div>
<ShopFooter store={storeData} />
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
       <ShopFooter store={storeData} />


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
        <ShopFooter store={storeData} />

      </div>
    );
  }

  return (
    <div className='AboutpageContainer' style={styles.pageContainer}>
      <SHeader
        store={storeData}
        isLoggedIn={isLoggedIn}
      />

      <div className='shopslugAboutcontainer1' style={styles.container}>

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
                  {/* ✅ WORKING Chat Button */}
                  <button
                    className="Aboutaction-button"
                    style={styles.actionButtonPrimary}
                    onClick={handleChatClick}
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle size={16} className='abouticonsize' />
                    <span className="action-text">Chat</span>
                  </button>

                  {/* ✅ WORKING Call Button */}
                  <button
                    className="Aboutaction-button"
                    style={styles.actionButtonSecondary}
                    onClick={handleCallClick}
                    title="Call now"
                  >
                    <Phone size={16} className='abouticonsize' />
                    <span className="action-text">Call</span>
                  </button>

                  {/* ✅ WORKING Share Button */}
                  <button
                    className="Aboutaction-button"
                    style={{
                      ...styles.actionButtonIcon,
                      backgroundColor: shareStatus === 'copied' ? '#10b981' : shareStatus === 'shared' ? '#3b82f6' : '#eda5a7'
                    }}
                    onClick={handleShareClick}
                    title={shareStatus === 'copied' ? 'Link copied!' : shareStatus === 'shared' ? 'Shared!' : 'Share store'}
                  >
                    {shareStatus === 'copied' ? <Check size={16} className='abouticonsize' /> : <Share2 size={16} className='abouticonsize' />}
                  </button>
                </div>

                {/* Share Status */}
                {shareStatus && (
                  <div style={styles.shareStatus}>
                    {shareStatus === 'copied' && '🔗 Link copied!'}
                    {shareStatus === 'shared' && '📤 Shared successfully!'}
                  </div>
                )}
              </div>

            </div>

            {/* ✅ Store Performance with REAL DATA */}
            <div className="store-performance" style={styles.storePerformance}>
              <div className="performance-card" style={styles.performanceCard}>
                <div className="performance-icon" style={styles.performanceIcon}>
                  <TrendingUp size={18} aria-hidden="true" />
                </div>
                <div className="performance-content" style={styles.performanceContent}>
                  <span className="performance-number" style={styles.performanceNumber}>
                    {storeData?.total_orders ?? storeData?.stats?.total_orders ?? 0}
                  </span>
                  <span className="performance-label" style={styles.performanceLabel}>Orders</span>
                </div>
              </div>
              <div className="performance-card" style={styles.performanceCard}>
                <div className="performance-icon" style={styles.performanceIcon}>
                  <Truck size={18} aria-hidden="true" />
                </div>
                <div className="performance-content" style={styles.performanceContent}>
                  <span className="performance-number" style={styles.performanceNumber}>
                    {storeData?.delivery_time_local || '24hr'}
                  </span>
                  <span className="performance-label" style={styles.performanceLabel}>Kerala Delivery</span>
                </div>
              </div>
              <div className="performance-card" style={styles.performanceCard}>
                <div className="performance-icon" style={styles.performanceIcon}>
                  <Users size={18} aria-hidden="true" />
                </div>
                <div className="performance-content" style={styles.performanceContent}>
                  <span className="performance-number" style={styles.performanceNumber}>
                    {storeData?.average_rating ? `${Number(storeData.average_rating * 20).toFixed(0)}%` : '0%'}
                  </span>
                  <span className="performance-label" style={styles.performanceLabel}>Satisfied</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED Stats Grid with MORE INFORMATION */}
        <div style={styles.statsSection}>
          <div className='aboutstat-grid' style={styles.statsGrid}>
            <StatCard
              icon={<Star size={24} fill="currentColor" />}
              value={storeData.average_rating ? Number(storeData.average_rating).toFixed(1) : "0.0"}
              label="Store Rating"
              color="#f59e0b"
            />
            <StatCard
              icon={<CheckCircle size={24} />}
              value={storeData?.completed_orders ?? storeData?.orders_completed ?? storeData?.stats?.completed_orders ?? 0}
              label="Orders Completed"
              color="#10b981"
            />
            <StatCard
              icon={<Package size={24} />}
              value={storeData?.products_count ?? storeData?.available_products ?? storeData?.stats?.products_count ?? storeData?.stats?.available_products ?? 0}
              label="Products Available"
              color="#3b82f6"
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              value={storeData?.total_orders && storeData.total_orders > 0 ? "Growing" : "New Store"}
              label="Monthly Growth"
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* ✅ ENHANCED Store Features Section */}
        <div style={styles.featuresSection}>
          <h3 style={styles.sectionTitle}>Why Choose {storeData.name}?</h3>
          <div className='shopslugaboutpagefeaturegrid' style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <Shield size={24} style={{ color: '#10b981' }} />
              <h4>Verified Business</h4>
              <p>Authenticated Kerala-based seller with genuine products</p>
            </div>
            <div style={styles.featureCard}>
              <Truck size={24} style={{ color: '#3b82f6' }} />
              <h4>Fast Delivery</h4>
              <p>Quick delivery across Kerala with reliable shipping</p>
            </div>
            <div style={styles.featureCard}>
              <Heart size={24} style={{ color: '#ef4444' }} />
              <h4>Customer Focused</h4>
              <p>Dedicated to customer satisfaction and quality service</p>
            </div>
            <div style={styles.featureCard}>
              <Zap size={24} style={{ color: '#f59e0b' }} />
              <h4>Local Support</h4>
              <p>Supporting Kerala's local economy and businesses</p>
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED Store Details Section */}
        <div className='aboutContainer' >
          <div className='aboutCard aboutCard1'
            style={{
              ...styles.aboutCard1,
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
            {/* Left Card - About Store */}
            <img
              src={storeData.logo_url || `https://via.placeholder.com/150x150/3b82f6/ffffff?text=${encodeURIComponent(storeData.name?.charAt(0) || 'S')}`}
              alt={`${storeData.name} logo`}
              className='Aboutsluglogo'
              style={styles.logo}
            />
            <h3 className='aboutslugfoottitle' style={styles.cardTitle}>ABOUT OUR STORE</h3>
            <p className='aboutslugfootdesc' style={styles.description}>
              {storeData.description ||
                `Welcome to ${storeData.name}! We are a trusted Kerala-based business committed to providing quality products and excellent customer service. Our mission is to bring you the best products while supporting the local economy of Kerala.`}
            </p>

            <div style={styles.socialIcons}>
              {storeData.facebook_link && (
                <a href={storeData.facebook_link} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                  <Facebook size={24} />
                </a>
              )}
              {storeData.instagram_link && (
                <a href={storeData.instagram_link} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                  <Instagram size={24} />
                </a>
              )}
              {storeData.website && (
                <a href={storeData.website} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                  <Globe size={24} />
                </a>
              )}
            </div>

            {/* Store Specialties */}
            {storeData.business_category && (
              <div style={styles.categoryTag}>
                <Target size={16} />
                <span>Specializes in {storeData.business_category}</span>
              </div>
            )}
          </div>

          <div
            className='aboutCard aboutCard2'
            style={{
              ...styles.aboutCard2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // center horizontally
              justifyContent: 'center',
              textAlign: 'center',
              gap: '18px',
            }}
          >
            <h3
              className='aboutslugfoottitle'
              style={{
                fontWeight: 600,
                color: '#1a4845',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
              }}
            >
              CONTACT INFO
            </h3>
            <div>
              <div style={styles.contactList}>
                {(storeData.owner_name || storeData.seller_name) && (
                  <div className='aboutslugfootdesc' style={styles.infoRow}>
                    {/* <Users size={18} style={styles.infoIcon} /> */}
                    <span>{storeData.owner_name || storeData.seller_name}</span>
                  </div>
                )}

                <div className='aboutslugfootdesc' style={styles.infoRow}>
                  {/* <Phone size={18} style={styles.infoIcon} /> */}
                  <span>{formatPhoneNumber(storeData.whatsapp_number || storeData.phone || sellerPhone)}</span>
                </div>

                {(storeData.business_address || storeData.address) && (
                  <div className='aboutslugfootdesc' style={styles.infoRow}>
                    {/* <MapPin size={18} style={styles.infoIcon} /> */}
                    <span>{storeData.business_address || storeData.address}</span>
                  </div>
                )}

                <div className='aboutslugfootdesc' style={styles.infoRow}>
                  {/* <Clock size={18} style={styles.infoIcon} /> */}
                  <span>{storeData.business_hours || '9:00 AM - 8:00 PM'}</span>
                </div>
              </div>
            </div>
          </div>


          <div className='aboutCard aboutCard3' style={styles.aboutCard3}>
            {storeData.payment_methods && (
              <div style={styles.paymentInfo}>
                <h4 style={styles.cardSubtitle}>Payment Options</h4>
                <p>{storeData.payment_methods}</p>
              </div>
            )}
            <div className='aboutcard3sevicelist' style={styles.servicesList}>
              <h3 className='aboutslugfoottitle' style={styles.cardTitle}>SERVICES</h3>
              <ul style={styles.serviceItems}>
                <li className='aboutslugfootdesc' style={styles.serviceItem}>
                  <ShieldCheck size={18} style={styles.serviceIcon} />
                  <span>Quality Guaranteed</span>
                </li>
                <li className='aboutslugfootdesc' style={styles.serviceItem}>
                  <Lock size={18} style={styles.serviceIcon} />
                  <span>Secure Payments</span>
                </li>
                <li className='aboutslugfootdesc' style={styles.serviceItem}>
                  <Truck size={18} style={styles.serviceIcon} />
                  <span>Kerala Delivery</span>
                </li>
                <li className='aboutslugfootdesc' style={styles.serviceItem}>
                  <Headphones size={18} style={styles.serviceIcon} />
                  <span>Customer Support</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* ✅ ENHANCED Quick Actions */}
        <div style={styles.quickActionsSection}>
          <Link href={getShopUrl()} className='shopslugaboutpagefooterprimarybtn' style={styles.primaryButton}>
            <Package size={16} />
            View All {storeData?.products_count || 0} Products
          </Link>
          <button onClick={handleChatClick} className='shopslugaboutpagefooterprimarybtn' style={styles.secondaryButton}>
            <MessageCircle size={16} />
            Chat with {storeData.name}
          </button>
        </div>
      </div>
     <ShopFooter store={storeData} />

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
          50% { opacity: 0.5; }
        }
      `}</style>
    </div >
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

// ✅ Enhanced styles with new sections
const styles = {
  pageContainer: {
    minHeight: '100vh',
    marginTop: '90px',
    backgroundColor: '#FDFFF0'
  },

  // Share Status
  shareStatus: {
    position: 'absolute',
    top: '-40px',
    right: '0',
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    animation: 'fadeIn 0.3s'
  },

  // Features Section
  featuresSection: {
    backgroundColor: '#FDFFF0',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },

  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: '24px'
  },

  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '20px'
  },

  featureCard: {
    textAlign: 'center',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #9cfcbfff',
    backgroundColor: '#FDFFF0'
  },

  // Enhanced About Container
  aboutContainer: {
    display: 'flex',
    flexDirection: 'row',   // all in a single row
    flexWrap: 'nowrap',     // prevent wrapping
    justifyContent: 'space-between',
    alignItems: 'stretch',  // equal height
    gap: '20px',
    width: '100%',
    padding: '20px',
    boxSizing: 'border-box',
    boxShadow: '0 4px 20px #2753503f',
    borderRadius: '12px',
  },

  aboutCard1: {
    flex: 1,
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    padding: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  aboutCard2: {
    flex: 1,
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  aboutCard3: {
    flex: 1,
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: "center",
    paddingTop: '40px'
  },

  cardSubtitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px'
  },

  categoryTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '8px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '16px'
  },

  paymentInfo: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px'
  },

  servicesList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px',
    paddingTop: '25px'
  },

  cardTitle: {
    fontWeight: 600,
    fontSize: '18px',
    color: '#1a4845',
    marginBottom: '8px',
  },

  serviceItems: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  serviceItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '15px',
    color: '#6b7280',
  },

  serviceIcon: {
    color: '#1a4845', // green accent
  },

  logo: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    marginBottom: '16px'
  },

  description: {
    fontSize: '15px',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: '12px 0'
  },

  contactList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // centers all items below header
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
  },

  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // keeps icon+text centered
    gap: '8px',
    fontSize: '15px',
    color: '#6b7280',
    lineHeight: '1.6',
    textAlign: 'center',
    flexWrap: 'wrap',
  },


  socialIcons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '20px'
  },

  socialIcon: {
    color: '#1a4845',
    transition: 'all 0.2s',
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative'
  },

  storeActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },

  actionButtonPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
  },

  actionButtonSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
  },

  actionButtonIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 20px',
    color: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '20%',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
    backgroundColor: '#FDFFF0',
    padding: '28px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    border: '1px solid #f3f4f6',
    transition: 'all 0.3s'
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
    marginBottom: '6px'
  },

  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },

  // Store Info Styles
  storeInfoSection: {
    backgroundColor: '#FDFFF0',
    borderRadius: '16px',
    marginTop: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
  },

  // Enhanced Quick Actions
  quickActionsSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    padding: '32px 0',
    flexWrap: 'wrap'
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
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
  },

  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
  },
};
