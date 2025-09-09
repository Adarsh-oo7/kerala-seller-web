'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
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
  Home,
  RefreshCw,
  AlertCircle,
  Mail,
  Globe,
  Calendar,
  TrendingUp
} from 'lucide-react';
import SHeader from '../../../../components/common/SHeader';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/user/store/`;

export default function StoreAboutPage() {
  const [storeData, setStoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const params = useParams();
  const router = useRouter();
  
  // Get sellerPhone from params with proper validation
  const sellerPhone = params?.sellerPhone;

  // Debug logging
  console.log('📍 About page params:', params);
  console.log('📞 Seller phone:', sellerPhone);

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('buyerAccessToken');
    setIsLoggedIn(!!token);
  }, []);

  const fetchStoreData = async () => {
    if (!sellerPhone) {
      console.error('❌ No sellerPhone provided');
      setError('Invalid store URL - phone number is missing');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 Fetching store data for phone:', sellerPhone);
      const response = await axios.get(`${API_URL}${sellerPhone}/about/`);
      
      console.log('✅ Store data received:', response.data);
      setStoreData(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch store about data:", error);
      if (error.response?.status === 404) {
        setError('Store not found. This store may no longer exist.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
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

  // Navigation handler for going back to store home
  const handleNavigateToStore = () => {
    if (sellerPhone) {
      const storeUrl = `/shop/${sellerPhone}`;
      console.log('🏠 Navigating to store home:', storeUrl);
      router.push(storeUrl);
    } else {
      console.error('❌ Cannot navigate: sellerPhone is undefined');
      router.push('/');
    }
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
          sellerPhone={sellerPhone}
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
          sellerPhone={sellerPhone}
        />
        <div style={styles.errorContainer}>
          <Store size={64} style={styles.errorIcon} />
          <h2 style={styles.errorTitle}>Invalid Store URL</h2>
          <p style={styles.errorText}>The store phone number is missing from the URL.</p>
          <Link href="/" style={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <SHeader store={null} isLoggedIn={isLoggedIn} sellerPhone={sellerPhone} />
        <div style={styles.errorContainer}>
          <AlertCircle size={64} style={styles.errorIcon} />
          <h2 style={styles.errorTitle}>Something went wrong</h2>
          <p style={styles.errorText}>{error}</p>
          <div style={styles.errorActions}>
            <button onClick={fetchStoreData} style={styles.retryButton}>
              <RefreshCw size={16} />
              Try Again
            </button>
            <Link href={`/shop/${sellerPhone}`} style={styles.backLink}>
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
        <SHeader store={null} isLoggedIn={isLoggedIn} sellerPhone={sellerPhone} />
        <div style={styles.errorContainer}>
          <Store size={64} style={styles.errorIcon} />
          <h2 style={styles.errorTitle}>Store Not Found</h2>
          <p style={styles.errorText}>Could not find this store. It may have been removed or the URL is incorrect.</p>
          <Link href={`/shop/${sellerPhone}`} style={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Store
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
        sellerPhone={sellerPhone}
      />
      
      {/* Navigation breadcrumb */}
      <div style={styles.breadcrumbContainer}>
        <div style={styles.container}>
          <nav style={styles.breadcrumb}>
            <Link href={`/shop/${sellerPhone}`} style={styles.breadcrumbLink}>
              <Home size={16} />
              Store Home
            </Link>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbCurrent}>About</span>
          </nav>
        </div>
      </div>
      
      <div style={styles.container}>
        {/* Back button */}
        <button onClick={handleNavigateToStore} style={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Store
        </button>

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
                Trusted Seller
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
              {storeData.owner_name && (
                <div style={styles.businessItem}>
                  <div style={styles.businessIcon}>
                    <Users size={20} />
                  </div>
                  <div>
                    <span style={styles.businessLabel}>Owner</span>
                    <p style={styles.businessValue}>{storeData.owner_name}</p>
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
              {storeData.description || `Welcome to ${storeData.name}! We are committed to providing you with the best products and exceptional customer service. Our team works hard to ensure quality and satisfaction with every purchase.`}
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Contact & Location</h2>
          <div style={styles.card}>
            <div style={styles.contactGrid}>
              {(storeData.business_address || storeData.address) && (
                <div style={styles.contactItem}>
                  <div style={styles.contactIcon}>
                    <MapPin size={20} />
                  </div>
                  <div style={styles.contactInfo}>
                    <span style={styles.contactLabel}>Business Address</span>
                    <p style={styles.contactValue}>
                      {storeData.business_address || storeData.address}
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
                      <span>Local: {storeData.delivery_time_local}</span>
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

        {/* Quick Actions */}
        <div style={styles.quickActionsSection}>
          <Link href={`/shop/${sellerPhone}`} style={styles.primaryButton}>
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
      <div style={{...styles.statIcon, color}}>
        {icon}
      </div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

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
    maxWidth: '400px'
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
    fontSize: '14px'
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
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
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
    gap: '24px'
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
    flex: 1
  },
  
  storeName: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  
  tagline: {
    fontSize: '18px',
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
    fontSize: '24px',
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
  }
};
