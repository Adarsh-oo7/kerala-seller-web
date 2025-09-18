'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ArrowLeft, 
  AlertCircle, 
  Store,
  Globe,
  Shield,
  CheckCircle,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

// ✅ Enhanced API configuration
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
const LOGIN_API_URL = `${API_BASE_URL}/user/login/`;

console.log('🌐 Seller Login API URLs configured:', { 
  API_BASE_URL, 
  LOGIN_API_URL 
});

// ✅ Enhanced LoginForm with better token handling
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // ✅ NEW: Auth check state

  // ✅ Get current store info from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
      setCurrentStoreInfo({
        storeId: storeMatch ? storeMatch[1] : null,
        isInStore: !!storeMatch
      });

      // Pre-fill phone if it matches store ID and is valid
      if (storeMatch && /^[6-9]\d{9}$/.test(storeMatch[1])) {
        setPhone(storeMatch[1]);
      }
    }
  }, []);

  // ✅ FIXED: Better auth check to prevent infinite redirects
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token || token === 'null' || token === 'undefined') {
          setIsCheckingAuth(false);
          return;
        }

        console.log('🔍 Checking existing seller token...');
        
        // Verify token is still valid by making a quick API call
        const response = await axios.get(`${API_BASE_URL}/user/store/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });

        if (response.status === 200) {
          console.log('✅ Valid seller token found, redirecting...');
          const redirectUrl = redirect || '/dashboard/seller';
          router.replace(redirectUrl);
          return;
        }
      } catch (error) {
        console.log('❌ Token invalid or expired, clearing auth data');
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('access_token');
        localStorage.removeItem('sellerInfo');
        localStorage.removeItem('userInfo');
      }
      
      setIsCheckingAuth(false);
    };

    checkExistingAuth();
  }, [router, redirect]);

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleFieldChange = (field, value) => {
    if (field === 'phone') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 10);
      setPhone(cleanValue);
      if (fieldErrors.phone && validatePhone(cleanValue)) {
        setFieldErrors(prev => ({ ...prev, phone: '' }));
      }
    } else if (field === 'password') {
      setPassword(value);
      if (fieldErrors.password && validatePassword(value)) {
        setFieldErrors(prev => ({ ...prev, password: '' }));
      }
    }
    
    // Clear general error when user starts typing
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    const newFieldErrors = {};
    
    if (!phone.trim()) {
      newFieldErrors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      newFieldErrors.phone = 'Please enter a valid 10-digit phone number (6-9xxxxxxxxx)';
    }

    if (!password) {
      newFieldErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newFieldErrors.password = 'Password must be at least 6 characters long';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      console.log('🔍 Attempting seller login with phone:', phone);
      
      const response = await axios.post(LOGIN_API_URL, { 
        phone: phone.trim(), 
        password: password,
        user_type: 'seller',
        store_context: currentStoreInfo.isInStore ? currentStoreInfo.storeId : null
      }, {
        timeout: 15000
      });
      
      console.log('✅ Login response received');
      
      // ✅ FIXED: Better token handling
      const token = response.data.access_token || 
                   response.data.token || 
                   response.data.access;
      
      if (!token) {
        throw new Error('No access token received from server');
      }
      
      const { seller, debug_info } = response.data;
      
      console.log('✅ Login successful for:', debug_info?.admin_user_email || phone);
      
      // ✅ CRITICAL: Clear any existing invalid tokens first
      localStorage.removeItem('accessToken');
      localStorage.removeItem('access_token');
      localStorage.removeItem('sellerInfo');
      localStorage.removeItem('userInfo');
      
      // Store new tokens
      localStorage.setItem('accessToken', token);
      localStorage.setItem('access_token', token);
      
      if (seller) {
        localStorage.setItem('sellerInfo', JSON.stringify(seller));
        localStorage.setItem('userInfo', JSON.stringify(seller));
      }
      
      if (rememberMe) {
        localStorage.setItem('rememberSeller', 'true');
      }
      
      console.log('✅ Token stored, redirecting to dashboard...');
      
      // ✅ FIXED: Use window.location for hard redirect to prevent loops
      setTimeout(() => {
        if (redirect) {
          window.location.href = decodeURIComponent(redirect);
        } else if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
          window.location.href = `/store/${currentStoreInfo.storeId}/dashboard`;
        } else {
          window.location.href = '/dashboard/seller';
        }
      }, 500); // Longer delay to ensure token is stored
      
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid phone number or password. Please check your credentials.';
      } else if (err.response?.status === 404) {
        errorMessage = 'No seller account found with this phone number. Please create an account first.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Account is not verified or inactive. Please contact support.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (err.response?.data) {
        errorMessage = err.response.data.error || 
                     err.response.data.detail || 
                     err.response.data.message || 
                     errorMessage;
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Store-aware navigation
  const handleBackClick = () => {
    if (redirect) {
      router.push(decodeURIComponent(redirect));
    } else if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
      router.push(`/store/${currentStoreInfo.storeId}`);
    } else {
      router.push('/');
    }
  };

  // ✅ Store-aware links
  const getForgotPasswordLink = () => {
    const redirectParam = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
      return `/store/${currentStoreInfo.storeId}/forgot-password${redirectParam}`;
    }
    return `/forgot-password/seller${redirectParam}`;
  };

  const getRegisterLink = () => {
    const redirectParam = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
      return `/store/${currentStoreInfo.storeId}/register${redirectParam}`;
    }
    return `/register/seller${redirectParam}`;
  };

  // ✅ Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div style={styles.card}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Checking authentication...</p>
          <p style={styles.loadingSubtext}>🌐 Connected to: {API_BASE_URL}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      {/* ✅ Store context indicator */}
      {currentStoreInfo.isInStore && (
        <div style={styles.storeNotice}>
          <Globe size={16} />
          <span>Store owner login for: {currentStoreInfo.storeId}</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.iconContainer}>
          <Store size={32} color="#3b82f6" />
        </div>
        <h1 style={styles.title}>
          {currentStoreInfo.isInStore ? 'Store Owner Login' : 'Seller Login'}
        </h1>
        <p style={styles.subtitle}>
          {currentStoreInfo.isInStore 
            ? 'Sign in to manage your store and access seller features'
            : 'Welcome back! Sign in to manage your store and products.'
          }
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            <Phone size={16} />
            Phone Number
          </label>
          <div style={styles.phoneInputContainer}>
            <span style={styles.countryCode}>+91</span>
            <input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              style={{
                ...styles.phoneInput,
                ...(fieldErrors.phone ? styles.inputError : {})
              }}
              maxLength={10}
              required
              disabled={loading}
              autoFocus
            />
          </div>
          {fieldErrors.phone && (
            <span style={styles.fieldError}>{fieldErrors.phone}</span>
          )}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            <Lock size={16} />
            Password
          </label>
          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              style={{
                ...styles.passwordInput,
                ...(fieldErrors.password ? styles.inputError : {})
              }}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              disabled={loading}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && (
            <span style={styles.fieldError}>{fieldErrors.password}</span>
          )}
        </div>

        {/* Remember Me */}
        <div style={styles.checkboxContainer}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={styles.checkbox}
              disabled={loading}
            />
            <span>Keep me signed in</span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorContainer}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading || !phone || !password}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonLoading : {})
          }}
        >
          {loading ? (
            <span style={styles.buttonContent}>
              <div style={styles.spinner}></div>
              Signing in...
            </span>
          ) : (
            <span style={styles.buttonContent}>
              <User size={18} />
              {currentStoreInfo.isInStore ? 'Access Store Dashboard' : 'Login to Dashboard'}
            </span>
          )}
        </button>
      </form>

      {/* ✅ Security badges */}
      <div style={styles.securityBadges}>
        <div style={styles.securityBadge}>
          <Shield size={14} />
          <span>Secure Login</span>
        </div>
        <div style={styles.securityBadge}>
          <CheckCircle size={14} />
          <span>Verified Sellers</span>
        </div>
      </div>

      {/* Footer Links */}
      <div style={styles.footerLinks}>
        <Link href={getForgotPasswordLink()} style={styles.link}>
          Forgot Password?
        </Link>
        <span style={styles.divider}>|</span>
        <Link href={getRegisterLink()} style={styles.link}>
          Create Account
        </Link>
      </div>

      {/* Back Section */}
      <div style={styles.backSection}>
        <button onClick={handleBackClick} style={styles.backLink}>
          <ArrowLeft size={16} />
          {currentStoreInfo.isInStore ? 'Back to Store' : 'Back to Home'}
        </button>
      </div>

      {/* ✅ Buyer login link */}
      <div style={styles.buyerLink}>
        <p style={styles.buyerText}>Are you a customer?</p>
        <Link href="/login/buyer" style={styles.buyerLinkButton}>
          Sign in as Customer
        </Link>
      </div>
    </div>
  );
}

// ✅ Enhanced Loading component
function LoginLoading() {
  return (
    <div style={styles.card}>
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading seller login...</p>
        <p style={styles.loadingSubtext}>🌐 Connected to: {API_BASE_URL}</p>
      </div>
    </div>
  );
}

// ✅ Enhanced Features component
function FeaturesSection() {
  const features = [
    {
      icon: <TrendingUp size={20} color="#059669" />,
      title: "Zero Commission",
      description: "Keep 100% of your sales revenue"
    },
    {
      icon: <Users size={20} color="#3b82f6" />,
      title: "Reach More Customers", 
      description: "Connect with buyers across Kerala"
    },
    {
      icon: <Shield size={20} color="#f59e0b" />,
      title: "Secure Payments",
      description: "Safe and reliable payment processing"
    },
    {
      icon: <Zap size={20} color="#8b5cf6" />,
      title: "Easy Management",
      description: "Simple tools to manage your store"
    }
  ];

  return (
    <div style={styles.featuresSection}>
      <h3 style={styles.featuresTitle}>Why Choose Kerala Sellers?</h3>
      <div style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <div key={index} style={styles.featureCard}>
            <div style={styles.featureIcon}>
              {feature.icon}
            </div>
            <div style={styles.featureContent}>
              <h4 style={styles.featureTitle}>{feature.title}</h4>
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* ✅ Success stats */}
      <div style={styles.statsSection}>
        <h4 style={styles.statsTitle}>Join Successful Sellers</h4>
        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>1000+</span>
            <span style={styles.statLabel}>Active Sellers</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>15K+</span>
            <span style={styles.statLabel}>Products Listed</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>0%</span>
            <span style={styles.statLabel}>Commission</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Enhanced main component
export default function LoginSellerPage() {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <Suspense fallback={<LoginLoading />}>
          <LoginForm />
        </Suspense>

        {/* Enhanced Features Section */}
        <FeaturesSection />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .input:focus, .phoneInput:focus, .passwordInput:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        .button:hover:not(:disabled) {
          background-color: #2563eb !important;
          transform: translateY(-1px);
        }
        
        .buyerLinkButton:hover {
          background-color: #047857 !important;
        }
      `}</style>
    </div>
  );
}

// All styles remain the same as your original code...
const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb'
  },
  
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    minHeight: '100vh', 
    padding: '40px 20px',
    gap: '60px',
    flexWrap: 'wrap'
  },
  
  card: { 
    backgroundColor: 'white', 
    padding: '32px', 
    borderRadius: '16px', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
    width: '100%',
    maxWidth: '420px',
    border: '1px solid #e5e7eb',
    animation: 'fadeIn 0.6s ease-out'
  },

  // Store notice
  storeNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#dbeafe',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#1e40af',
    marginBottom: '20px'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    gap: '16px'
  },

  loadingSubtext: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    margin: 0
  },
  
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  
  iconContainer: {
    width: '64px',
    height: '64px',
    backgroundColor: '#eff6ff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto'
  },
  
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  
  subtitle: { 
    color: '#6b7280', 
    fontSize: '0.95rem',
    lineHeight: '1.5'
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  
  inputGroup: { 
    display: 'flex',
    flexDirection: 'column'
  },
  
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },

  // Enhanced phone input
  phoneInputContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    overflow: 'hidden'
  },

  countryCode: {
    padding: '14px 12px',
    backgroundColor: '#f9fafb',
    borderRight: '1px solid #d1d5db',
    fontSize: '1rem',
    color: '#374151',
    fontWeight: '500'
  },

  phoneInput: {
    width: '100%',
    padding: '14px 16px',
    border: 'none',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    outline: 'none'
  },
  
  input: { 
    width: '100%', 
    padding: '14px 16px', 
    border: '1px solid #d1d5db', 
    borderRadius: '8px', 
    fontSize: '1rem',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    outline: 'none'
  },
  
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  
  passwordInput: {
    width: '100%', 
    padding: '14px 48px 14px 16px', 
    border: '1px solid #d1d5db', 
    borderRadius: '8px', 
    fontSize: '1rem',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    outline: 'none'
  },
  
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '4px'
  },
  
  inputError: {
    borderColor: '#ef4444'
  },

  fieldError: {
    color: '#ef4444',
    fontSize: '0.8rem',
    marginTop: '4px'
  },
  
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#374151',
    cursor: 'pointer'
  },
  
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#3b82f6'
  },
  
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#991b1b',
    fontSize: '0.9rem'
  },
  
  button: { 
    width: '100%', 
    padding: '16px 24px', 
    border: 'none', 
    borderRadius: '8px', 
    backgroundColor: '#3b82f6', 
    color: 'white', 
    cursor: 'pointer', 
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '52px'
  },
  
  buttonLoading: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Security badges
  securityBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9'
  },

  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
    color: '#059669',
    fontWeight: '500'
  },
  
  footerLinks: { 
    marginTop: '24px',
    display: 'flex', 
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.9rem',
    gap: '12px'
  },
  
  link: { 
    color: '#3b82f6', 
    textDecoration: 'none',
    fontWeight: '500'
  },
  
  divider: {
    color: '#d1d5db'
  },
  
  backSection: {
    marginTop: '20px',
    textAlign: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6b7280',
    background: 'none',
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },

  // Buyer link section
  buyerLink: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e2e8f0'
  },

  buyerText: {
    fontSize: '0.9rem',
    color: '#6b7280',
    margin: '0 0 8px 0'
  },

  buyerLinkButton: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#059669',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  
  // Enhanced features section
  featuresSection: {
    maxWidth: '400px',
    animation: 'slideIn 0.8s ease-out'
  },
  
  featuresTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px',
    textAlign: 'center'
  },

  featuresGrid: {
    display: 'grid',
    gap: '16px',
    marginBottom: '32px'
  },

  featureCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },

  featureIcon: {
    flexShrink: 0,
    padding: '8px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },

  featureContent: {
    flex: 1
  },

  featureTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },

  featureDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.4'
  },

  // Success stats
  statsSection: {
    padding: '20px',
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    border: '1px solid #bbf7d0'
  },

  statsTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#166534',
    marginBottom: '16px',
    textAlign: 'center'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },

  statItem: {
    textAlign: 'center'
  },

  statNumber: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#166534'
  },

  statLabel: {
    fontSize: '0.8rem',
    color: '#16a34a'
  }
};
