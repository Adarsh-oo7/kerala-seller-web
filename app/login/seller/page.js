'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import "../../../styles/SellerLogin.css";
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import Image from 'next/image';
const BagImage = '/assets/images/bag.png';
const StoreImage = '/assets/images/store.png';
const TrolleyImage = '/assets/images/trolley.png';
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
} from 'lucide-react';

// âœ… API configuration
// const getApiBaseUrl = () => {
//   const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
//   if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
//     return envUrl.trim();
//   }
  
//   // âœ… FIXED: Use hostname instead of NODE_ENV
//   if (typeof window !== 'undefined') {
//     const hostname = window.location.hostname;
//     if (hostname === 'localhost' || hostname === '127.0.0.1') {
//       return 'https://api.keralasellers.in';
//     }
//     return 'https://api.keralasellers.in';
//   }
  
//   return 'https://api.keralasellers.in';
// };


// const API_BASE_URL = 'https://api.keralasellers.in';
// const LOGIN_API_URL = `${API_BASE_URL}/user/login/`;

// console.log(' Seller Login API URLs configured:', {
//   API_BASE_URL,
//   LOGIN_API_URL
// });

// âœ… PROVEN working (BuyerLogin tested)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     'https://api.keralasellers.in';

const LOGIN_API_URL = `${API_BASE_URL}/user/login/`;

console.log(' Seller Login:', {
  API_BASE_URL,
  LOCAL: process.env.NEXT_PUBLIC_API_BASE_URL || 'none',
  LOGIN_API_URL
});



const FloatingIcons = ({ totalIcons = 12 }) => {
  const containerRef = useRef(null);
  const iconRefs = useRef([]);
  const iconSources = [BagImage, StoreImage, TrolleyImage];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const speeds = Array.from({ length: totalIcons }, () => ({
      x: (Math.random() - 0.5) * 1,
      y: (Math.random() - 0.5) * 1,
    }));

    const positions = Array.from({ length: totalIcons }, () => ({
      x: Math.random() * (container.clientWidth - 40),
      y: Math.random() * (container.clientHeight - 40),
    }));

    const sizes = Array.from({ length: totalIcons }, () => 25 + Math.random() * 10);

    const animate = () => {
      const rect = container.getBoundingClientRect();

      iconRefs.current.forEach((icon, i) => {
        if (!icon) return;
        const size = sizes[i];
        const pos = positions[i];
        const speed = speeds[i];

        pos.x += speed.x;
        pos.y += speed.y;

        if (pos.x <= 0 || pos.x + size >= rect.width) speed.x *= -1;
        if (pos.y <= 0 || pos.y + size >= rect.height) speed.y *= -1;

        icon.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [totalIcons]);

  return (
    <div
      ref={containerRef}
      className="floating-icons-container"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: -1,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: totalIcons }).map((_, i) => {
        const img = iconSources[i % iconSources.length];
        const size = 25 + Math.random() * 25;
        const opacity = 0.1 + Math.random() * 0.2;

        return (
          <Image
            key={i}
            src={img}
            alt="Floating icon"
            width={size}
            height={size}
            ref={(el) => (iconRefs.current[i] = el)}
            className="floating-icon"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              opacity,
              transform: `translate(${Math.random() * 200}px, ${Math.random() * 200}px)`,
              transition: "transform 0s",
            }}
          />
        );
      })}
    </div>
  );
};

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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
      setCurrentStoreInfo({
        storeId: storeMatch ? storeMatch[1] : null,
        isInStore: !!storeMatch
      });

      if (storeMatch && /^[6-9]\d{9}$/.test(storeMatch[1])) {
        setPhone(storeMatch[1]);
      }
    }
  }, []);

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token || token === 'null' || token === 'undefined') {
          setIsCheckingAuth(false);
          return;
        }

        console.log(' Checking existing seller token...');

        const response = await axios.get(`${API_BASE_URL}/user/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });

        if (response.status === 200) {
          console.log(' Valid seller token found, redirecting...');
          const redirectUrl = redirect || '/dashboard/seller';
          router.replace(redirectUrl);
          return;
        }
      } catch (error) {
        console.log(' Token invalid or expired, clearing auth data');
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

    if (error) setError('');
  };

  // âœ… SIMPLIFIED ONBOARDING - NO COUPON PAGE
  const handleLogin = async (e) => {
    e.preventDefault();

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
      console.log(' Attempting seller login with phone:', phone);

      const response = await axios.post(LOGIN_API_URL, {
        phone: phone.trim(),
        password: password,
        user_type: 'seller'
      }, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      console.log(' Login response received:', response.data);

      const token = response.data.access_token || response.data.token || response.data.access;

      if (!token) {
        throw new Error('No access token received from server');
      }

      const { seller, debug_info } = response.data;
      console.log(' Login successful for:', debug_info?.admin_user_email || seller?.email || phone);

      // Clear old tokens
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

      // âœ… SIMPLIFIED: Check onboarding status (NO COUPON CHECK)
      try {
        console.log(' Checking seller onboarding status...');
        
        const statusResponse = await axios.get(
          `${API_BASE_URL}/users/seller/onboarding/status/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { 
          store_setup_completed,
          razorpay_connected 
        } = statusResponse.data;

        console.log(' Onboarding status:', statusResponse.data);

        // âœ… Simplified redirect logic (Login â†’ Settings â†’ Payments)
        let redirectUrl;

        if (!store_setup_completed) {
          redirectUrl = '/dashboard/seller/settings';
          console.log(' Redirecting to: Setup Store (Settings)');
        } else if (!razorpay_connected) {
          redirectUrl = '/dashboard/seller/payments';
          console.log(' Redirecting to: Connect Razorpay (Payments)');
        } else if (redirect) {
          redirectUrl = decodeURIComponent(redirect);
          console.log(' Redirecting to: Custom redirect');
        } else if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
          redirectUrl = `/store/${currentStoreInfo.storeId}/dashboard`;
          console.log(' Redirecting to: Store Dashboard');
        } else {
          redirectUrl = '/dashboard/seller';
          console.log(' Redirecting to: Main Dashboard');
        }

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);

      } catch (statusError) {
        console.error(' Failed to check onboarding status:', statusError);
        
        // Fallback - go to settings if onboarding status check fails
        const fallbackUrl = '/dashboard/seller/settings';
        
        setTimeout(() => {
          window.location.href = fallbackUrl;
        }, 500);
      }

    } catch (err) {
      console.error(' Login error:', err);
      console.error(' Error response:', err.response?.data);

      let errorMessage = 'Login failed. Please check your credentials.';

      if (err.response?.status === 400) {
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.phone) {
          errorMessage = Array.isArray(err.response.data.phone)
            ? err.response.data.phone[0]
            : err.response.data.phone;
        } else if (err.response.data?.password) {
          errorMessage = Array.isArray(err.response.data.password)
            ? err.response.data.password[0]
            : err.response.data.password;
        } else {
          errorMessage = 'Invalid request. Please check your phone number and password format.';
        }
      } else if (err.response?.status === 401) {
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

  const handleBackClick = () => {
    if (redirect) {
      router.push(decodeURIComponent(redirect));
    } else if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
      router.push(`/store/${currentStoreInfo.storeId}`);
    } else {
      router.push('/');
    }
  };

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

  if (isCheckingAuth) {
    return (
      <div style={styles.card}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Checking authentication...</p>
          <p style={styles.loadingSubtext}>ðŸŒ Connected to: {API_BASE_URL}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      {currentStoreInfo.isInStore && (
        <div style={styles.storeNotice}>
          <Globe size={16} />
          <span>Store owner login for: {currentStoreInfo.storeId}</span>
        </div>
      )}

      <div style={styles.header}>
        <div className='sellerloginiconcontainer' style={styles.iconContainer}>
          <Store className='sellerloginiconsize' size={32} color="#3b82f6" />
        </div>
        <h1 className='sellerlogincardtitle' style={styles.title}>
          {currentStoreInfo.isInStore ? 'Store Owner Login' : 'Seller Login'}
        </h1>
        <p className='sellerlogincardsubtitle' style={styles.subtitle}>
          {currentStoreInfo.isInStore
            ? 'Sign in to manage your store and access seller features'
            : 'Welcome back! Sign in to manage your store and products.'
          }
        </p>
      </div>

      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputGroup}>
          <div style={styles.phoneInputContainer}>
            <span className='sellerlogincountrycode' style={styles.countryCode}>+91</span>
            <input
              type="tel"
              className='sellerlogininput'
              placeholder="Enter phone number"
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
          <div style={styles.passwordContainer}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              className='sellerloginpasswordinput'
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
              className='sellerlogineye'
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

        {error && (
          <div style={styles.errorContainer}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className='sellerloginsigninbtn'
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

      <FloatingIcons totalIcons={8} />

      <div className='sellerloginfooterlinks' style={styles.footerLinks}>
        <Link href={getForgotPasswordLink()} style={styles.link}>
          Forgot Password?
        </Link>
        <span style={styles.divider}>|</span>
        <Link href={getRegisterLink()} style={styles.link}>
          Create Account
        </Link>
      </div>

      <div style={styles.backSection}>
        <button onClick={handleBackClick} style={styles.backLink}>
          <ArrowLeft size={16} />
          {currentStoreInfo.isInStore ? 'Back to Store' : 'Back to Home'}
        </button>
      </div>

      <div style={styles.buyerLink}>
        <p style={styles.buyerText}>Are you a customer?</p>
        <Link href="/login/buyer" style={styles.buyerLinkButton}>
          Sign in as Customer
        </Link>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div style={styles.card}>
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading seller login...</p>
        <p style={styles.loadingSubtext}>ðŸŒ Connected to: {API_BASE_URL}</p>
      </div>
    </div>
  );
}

export default function LoginSellerPage() {
  return (
    <div style={styles.pageContainer}>
      <Header />
      <div style={styles.container}>
        <Suspense fallback={<LoginLoading />}>
          <LoginForm />
        </Suspense>
      </div>
      <Footer />
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

const styles = {
  pageContainer: { minHeight: '100vh', backgroundColor: '#f9fafb' },
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 170px)', padding: '20px', backgroundColor: '#FDFFF0' },
  card: { position: 'relative', overflow: 'hidden', backgroundAttachment: 'fixed', marginTop: '50px', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)', width: '90%', maxWidth: '400px', backgroundColor: 'rgba(137, 172, 120, 0.45)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#fff', textAlign: 'center', zIndex: 0, transition: 'all 0.3s ease' },
  storeNotice: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '8px', fontSize: '0.9rem', color: '#1e40af', marginBottom: '20px' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' },
  loadingSubtext: { fontSize: '0.8rem', color: '#9ca3af', margin: 0 },
  header: { textAlign: 'center', marginBottom: '32px' },
  iconContainer: { width: '64px', height: '64px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  subtitle: { color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  phoneInputContainer: { display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#ffffff', overflow: 'hidden' },
  countryCode: { padding: '14px 12px', backgroundColor: '#f9fafb', borderRight: '1px solid #d1d5db', fontSize: '1rem', color: '#374151', fontWeight: '500' },
  phoneInput: { width: '100%', padding: '14px 16px', border: 'none', fontSize: '1rem', backgroundColor: 'transparent', outline: 'none' },
  passwordContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '16px', color: '#6b7280', zIndex: 1 },
  passwordInput: { width: '100%', padding: '14px 48px 14px 70px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#ffffff', transition: 'all 0.2s ease', boxSizing: 'border-box', outline: 'none' },
  eyeButton: { position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px', borderRadius: '4px' },
  inputError: { borderColor: '#ef4444' },
  fieldError: { color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' },
  checkboxContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#374151', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', accentColor: '#3b82f6' },
  errorContainer: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem' },
  button: { width: '100%', padding: '16px 24px', border: 'none', borderRadius: '8px', backgroundColor: '#1a4845', color: 'white', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '52px' },
  buttonLoading: { backgroundColor: '#9ca3af', cursor: 'not-allowed' },
  buttonContent: { display: 'flex', alignItems: 'center', gap: '8px' },
  spinner: { width: '16px', height: '16px', border: '2px solid #f3f3f3', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  securityBadges: { display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
  securityBadge: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#059669', fontWeight: '500' },
  footerLinks: { marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem', gap: '12px' },
  link: { color: '#3b82f6', textDecoration: 'none', fontWeight: '500' },
  divider: { color: '#d1d5db' },
  backSection: { marginTop: '20px', textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6b7280', background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer' },
  buyerLink: { marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  buyerText: { fontSize: '0.9rem', color: '#6b7280', margin: '0 0 8px 0' },
  buyerLinkButton: { display: 'inline-block', padding: '8px 16px', backgroundColor: '#059669', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500', transition: 'background-color 0.2s' }
};



