'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { Phone, Lock, Eye, EyeOff, User, ArrowLeft, AlertCircle, Store } from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const LOGIN_API_URL = `${API_BASE_URL}/user/login/`;

export default function LoginSellerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // If a seller is already logged in, redirect them to the dashboard
    const token = localStorage.getItem('accessToken');
    if (token) {
      const redirectUrl = redirect || '/dashboard/seller';
      router.push(redirectUrl);
    }
  }, [router, redirect]);

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!phone || !password) {
      setError('Phone number and password are required.');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(LOGIN_API_URL, { 
        phone, 
        password,
        user_type: 'seller' // Specify user type if needed
      });
      
      // Store token
      if (rememberMe) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('rememberSeller', 'true');
      } else {
        sessionStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('accessToken', response.data.token);
      }
      
      // Store user info if available
      if (response.data.user) {
        localStorage.setItem('sellerInfo', JSON.stringify(response.data.user));
      }
      
      // Redirect to intended page or dashboard
      const redirectUrl = redirect || '/dashboard/seller';
      router.push(redirectUrl);
      
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          err.response?.data?.message ||
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.iconContainer}>
              <Store size={32} color="#3b82f6" />
            </div>
            <h1 style={styles.title}>Seller Login</h1>
            <p style={styles.subtitle}>
              Welcome back! Sign in to manage your store and products.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Phone size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={phone}
                onChange={handlePhoneChange}
                style={{
                  ...styles.input,
                  ...(error && !validatePhone(phone) && phone ? styles.inputError : {})
                }}
                maxLength={10}
                required
                disabled={loading}
              />
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
                  onChange={handlePasswordChange}
                  style={{
                    ...styles.passwordInput,
                    ...(error && password.length < 6 && password ? styles.inputError : {})
                  }}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
                <span>Remember me</span>
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
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonLoading : {})
              }}
            >
              {loading ? (
                <span style={styles.buttonContent}>
                  <div style={styles.spinner}></div>
                  Logging in...
                </span>
              ) : (
                <span style={styles.buttonContent}>
                  <User size={18} />
                  Login to Dashboard
                </span>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div style={styles.footerLinks}>
            <Link href="/forgot-password/seller" style={styles.link}>
              Forgot Password?
            </Link>
            <span style={styles.divider}>|</span>
            <Link href="/register/seller" style={styles.link}>
              Create Account
            </Link>
          </div>

          {/* Back to Home */}
          <div style={styles.backSection}>
            <Link href="/" style={styles.backLink}>
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div style={styles.featuresSection}>
          <h3 style={styles.featuresTitle}>Why Choose Kerala Sellers?</h3>
          <ul style={styles.featuresList}>
            <li>✓ Zero commission on sales</li>
            <li>✓ Easy product management</li>
            <li>✓ Reach customers across Kerala</li>
            <li>✓ Secure payment processing</li>
            <li>✓ 24/7 support</li>
          </ul>
        </div>
      </div>
      <Footer />

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
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb'
  },
  
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '80vh', 
    padding: '20px',
    gap: '40px',
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
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  footerLinks: { 
    marginTop: '24px',
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem'
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
    textDecoration: 'none',
    fontSize: '0.9rem'
  },
  
  featuresSection: {
    maxWidth: '300px',
    animation: 'slideIn 0.8s ease-out'
  },
  
  featuresTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px'
  },
  
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  }
};
