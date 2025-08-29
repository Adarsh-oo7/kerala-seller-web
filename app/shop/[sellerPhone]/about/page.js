'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
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
  Clock
} from 'lucide-react';
import SHeader from '../../../../components/common/SHeader';

const API_URL = 'http://localhost:8000/user/store/';

export default function StoreAboutPage() {
  const [storeData, setStoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { sellerPhone } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('buyerAccessToken');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (!sellerPhone) return;
    axios.get(`${API_URL}${sellerPhone}/about/`)
      .then(response => setStoreData(response.data))
      .catch(error => console.error("Failed to fetch store about data:", error))
      .finally(() => setIsLoading(false));
  }, [sellerPhone]);

  if (isLoading) {
    return (
      <div style={styles.pageContainer}>
        <SHeader store={null} isLoggedIn={isLoggedIn} />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading store details...</p>
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
          <p style={styles.errorText}>Could not find this store.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <SHeader store={storeData} isLoggedIn={isLoggedIn} />
      
      <div style={styles.container}>
        {/* Store Header */}
        <div style={styles.storeHeader}>
          <div style={styles.logoContainer}>
            <img 
              src={storeData.logo_url || 'https://placehold.co/150x150/3b82f6/ffffff?text=Store'} 
              alt={`${storeData.name} logo`} 
              style={styles.logo} 
            />
            <div style={styles.verifiedBadge}>
              <Award size={16} />
            </div>
          </div>
          <div style={styles.storeInfo}>
            <h1 style={styles.storeName}>{storeData.name}</h1>
            {storeData.tagline && (
              <p style={styles.tagline}>{storeData.tagline}</p>
            )}
            <div style={styles.badges}>
              <span style={styles.badge}>
                <Clock size={12} />
                Verified Store
              </span>
              <span style={styles.badge}>
                <Users size={12} />
                Trusted Seller
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsSection}>
          <h2 style={styles.sectionTitle}>Store Performance</h2>
          <div style={styles.statsGrid}>
            <StatCard 
              icon={<Star size={24} fill="currentColor" />} 
              value={storeData.stats.overall_rating || "4.5"} 
              label="Overall Rating"
              color="#f59e0b"
            />
            <StatCard 
              icon={<CheckCircle size={24} />} 
              value={storeData.stats.completed_orders || "150+"} 
              label="Orders Completed"
              color="#10b981"
            />
            <StatCard 
              icon={<Package size={24} />} 
              value={storeData.stats.products_count || "25"} 
              label="Products Listed"
              color="#3b82f6"
            />
          </div>
        </div>

        {/* About Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>About Our Store</h2>
          <div style={styles.card}>
            <p style={styles.description}>
              {storeData.description || 'Welcome to our store! We are committed to providing you with the best products and exceptional customer service. Our team works hard to ensure quality and satisfaction with every purchase.'}
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Contact & Location</h2>
          <div style={styles.card}>
            <div style={styles.contactGrid}>
              <div style={styles.contactItem}>
                <div style={styles.contactIcon}>
                  <MapPin size={20} />
                </div>
                <div style={styles.contactInfo}>
                  <span style={styles.contactLabel}>Address</span>
                  <p style={styles.contactValue}>
                    {storeData.address || 'Kerala, India'}
                  </p>
                </div>
              </div>
              
              <div style={styles.contactItem}>
                <div style={styles.contactIcon}>
                  <Phone size={20} />
                </div>
                <div style={styles.contactInfo}>
                  <span style={styles.contactLabel}>Phone</span>
                  <p style={styles.contactValue}>
                    {storeData.phone || sellerPhone}
                  </p>
                </div>
              </div>
            </div>
            
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
      </div>
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
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '16px'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px',
    textAlign: 'center'
  },
  errorIcon: {
    color: '#94a3b8'
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  errorText: {
    color: '#64748b',
    fontSize: '16px',
    margin: 0
  },

  // Main Container
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },

  // Store Header
  storeHeader: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    '@media (max-width: 640px)': {
      flexDirection: 'column',
      textAlign: 'center',
      padding: '24px'
    }
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
    border: '4px solid #f1f5f9',
    '@media (max-width: 640px)': {
      width: '100px',
      height: '100px'
    }
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
    color: '#1e293b',
    margin: '0 0 8px 0',
    '@media (max-width: 640px)': {
      fontSize: '24px'
    }
  },
  tagline: {
    fontSize: '18px',
    color: '#64748b',
    margin: '0 0 16px 0',
    lineHeight: '1.5'
  },
  badges: {
    display: 'flex',
    gap: '12px',
    '@media (max-width: 640px)': {
      justifyContent: 'center'
    }
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
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
    color: '#1e293b',
    margin: 0
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  statIcon: {
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
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
    marginBottom: '24px',
    '@media (min-width: 640px)': {
      gridTemplateColumns: '1fr 1fr'
    }
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
    color: '#64748b',
    fontWeight: '600',
    marginBottom: '4px'
  },
  contactValue: {
    margin: 0,
    fontSize: '16px',
    color: '#1e293b',
    fontWeight: '500'
  },

  // Social Section
  socialSection: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '24px'
  },
  socialTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 16px 0'
  },
  socialLinks: {
    display: 'flex',
    gap: '16px'
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
  }
};