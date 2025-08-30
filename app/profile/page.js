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
  Settings
} from 'lucide-react';

const PROFILE_API = 'http://localhost:8000/api/buyer/profile/';

export default function ProfilePage() {
  const [buyer, setBuyer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('buyerAccessToken');
    if (!token) {
      router.push('/login/buyer');
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      try {
        const response = await axios.get(PROFILE_API, { headers });
        setBuyer(response.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('buyerAccessToken');
          router.push('/login/buyer');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [getAuthHeaders, router]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('buyerAccessToken');
      sessionStorage.removeItem('cameFromLogin');
      sessionStorage.removeItem('preLoginPath');
      router.push('/');
    }
  };

  const handleBackClick = () => {
    // Method 1: Check if there's a stored pre-login path
    const preLoginPath = sessionStorage.getItem('preLoginPath');
    
    if (preLoginPath) {
        sessionStorage.removeItem('preLoginPath');
        sessionStorage.removeItem('cameFromLogin');
        
        // Navigate to the stored path
        try {
            const url = new URL(preLoginPath);
            router.push(url.pathname + url.search);
        } catch {
            // If it's not a valid URL, treat it as a path
            router.push(preLoginPath);
        }
        return;
    }
    
    // Method 2: Check if we came directly from login
    const cameFromLogin = sessionStorage.getItem('cameFromLogin');
    
    if (cameFromLogin === 'true') {
        sessionStorage.removeItem('cameFromLogin');
        
        // Try to go back 2 steps to skip the login redirect
        if (window.history.length > 2) {
            window.history.go(-2);
        } else {
            router.push('/');
        }
        return;
    }
    
    // Method 3: Analyze the referrer
    const referrer = document.referrer;
    const currentHost = window.location.origin;
    
    if (referrer && 
        referrer.startsWith(currentHost) && 
        !referrer.includes('/login') && 
        !referrer.includes('/register') &&
        !referrer.includes('/profile')) {
        
        try {
            const url = new URL(referrer);
            router.push(url.pathname + url.search);
        } catch {
            router.back();
        }
        return;
    }
    
    // Method 4: Default smart back
    try {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    } catch {
        router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div style={styles.errorContainer}>
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
            <span style={styles.backText}>Back</span>
          </button>
          <h1 style={styles.headerTitle}>My Account</h1>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <LogOut size={18} />
            <span style={styles.logoutText}>Logout</span>
          </button>
        </div>
      </header>

      <div style={styles.container}>
        <div style={styles.content}>
          {/* Profile Card */}
          <div style={styles.profileCard}>
            <div style={styles.avatarSection}>
              <div style={styles.avatar}>
                {buyer.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={styles.userInfo}>
                <h2 style={styles.userName}>{buyer.full_name || 'User'}</h2>
                <p style={styles.userEmail}>{buyer.email || 'No email provided'}</p>
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
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div style={styles.infoCards}>
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>
                <Phone size={20} />
              </div>
              <div style={styles.infoContent}>
                <span style={styles.infoLabel}>Phone Number</span>
                <p style={styles.infoValue}>{buyer.phone_number || 'Not provided'}</p>
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

          {/* Action Menu */}
          <div style={styles.menuSection}>
            <h3 style={styles.menuTitle}>Account Management</h3>
            
            <div style={styles.menuGrid}>
              <Link href="/profile/edit" style={styles.menuItem}>
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

              <Link href="/profile/orders" style={styles.menuItem}>
                <div style={styles.menuItemContent}>
                  <div style={styles.menuIcon}>
                    <Package size={24} />
                  </div>
                  <div style={styles.menuInfo}>
                    <span style={styles.menuLabel}>My Orders</span>
                    <p style={styles.menuDesc}>Track orders and view purchase history</p>
                  </div>
                </div>
                <ChevronRight size={20} style={styles.chevron} />
              </Link>

              <Link href="/profile/verification" style={styles.menuItem}>
                <div style={styles.menuItemContent}>
                  <div style={styles.menuIcon}>
                    <Shield size={24} />
                  </div>
                  <div style={styles.menuInfo}>
                    <span style={styles.menuLabel}>Phone Verification</span>
                    <p style={styles.menuDesc}>
                      {buyer.phone_verified ? 'Your phone is verified ✓' : 'Verify your phone number'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} style={styles.chevron} />
              </Link>
            </div>
          </div>

          {/* Account Summary */}
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Account Summary</h3>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Account Status</span>
                <span style={styles.summaryValue}>Active</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Member Since</span>
                <span style={styles.summaryValue}>
                  {new Date(buyer.date_joined).toLocaleDateString()}
                </span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Verification</span>
                <span style={styles.summaryValue}>
                  {buyer.phone_verified ? 'Complete' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
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
    minHeight: '100vh',
    gap: '16px',
    padding: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    marginTop: '16px',
    fontWeight: '500'
  },

  // Header
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
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
    ':hover': {
      color: '#2563eb'
    }
  },
  backText: {
    display: 'none',
    '@media (min-width: 640px)': {
      display: 'inline'
    }
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    '@media (max-width: 640px)': {
      fontSize: '18px'
    }
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
    display: 'none',
    '@media (min-width: 640px)': {
      display: 'inline'
    }
  },

  // Container
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    '@media (min-width: 768px)': {
      padding: '40px 20px'
    }
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    animation: 'fadeIn 0.6s ease-out'
  },

  // Profile Card
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    '@media (min-width: 768px)': {
      padding: '32px'
    }
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    '@media (max-width: 640px)': {
      gap: '16px'
    }
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
    fontSize: '32px',
    fontWeight: '700',
    flexShrink: 0,
    '@media (max-width: 640px)': {
      width: '60px',
      height: '60px',
      fontSize: '24px'
    }
  },
  userInfo: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 6px 0',
    '@media (max-width: 640px)': {
      fontSize: '20px'
    }
  },
  userEmail: {
    color: '#64748b',
    margin: '0 0 12px 0',
    fontSize: '16px',
    '@media (max-width: 640px)': {
      fontSize: '14px'
    }
  },
  verificationBadge: {
    display: 'inline-block'
  },
  verified: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#059669',
    fontSize: '14px',
    fontWeight: '600',
    '@media (max-width: 640px)': {
      fontSize: '12px'
    }
  },
  notVerified: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '600',
    '@media (max-width: 640px)': {
      fontSize: '12px'
    }
  },

  // Info Cards
  infoCards: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    }
  },
  infoCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
    '@media (min-width: 768px)': {
      padding: '24px'
    }
  },
  infoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#475569',
    flexShrink: 0
  },
  infoContent: {
    flex: 1,
    minWidth: 0
  },
  infoLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
    marginBottom: '4px'
  },
  infoValue: {
    margin: 0,
    fontSize: '16px',
    color: '#1e293b',
    fontWeight: '500',
    lineHeight: '1.5'
  },

  // Menu Section
  menuSection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    '@media (min-width: 768px)': {
      padding: '32px'
    }
  },
  menuTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
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
    border: '2px solid transparent',
    ':hover': {
      backgroundColor: '#f1f5f9',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      borderColor: '#e2e8f0'
    }
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  menuInfo: {
    flex: 1,
    minWidth: 0
  },
  menuLabel: {
    display: 'block',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
    '@media (max-width: 640px)': {
      fontSize: '16px'
    }
  },
  menuDesc: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.4'
  },
  chevron: {
    color: '#94a3b8',
    flexShrink: 0
  },

  // Summary Card
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    '@media (min-width: 768px)': {
      padding: '32px'
    }
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 20px 0'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(3, 1fr)'
    }
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  summaryValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b'
  }
};