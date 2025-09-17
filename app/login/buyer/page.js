'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  AlertCircle, 
  User, 
  Eye, 
  EyeOff,
  Globe,
  Shield,
  CheckCircle 
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

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_BASE_URL = getApiBaseUrl();
const GOOGLE_LOGIN_API = `${API_BASE_URL}/user/buyer/login/google/`;
const EMAIL_LOGIN_API = `${API_BASE_URL}/user/buyer/login/`;

console.log('🌐 Buyer Login API URLs configured:', { 
  API_BASE_URL, 
  GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'Not configured' 
});

// ✅ Enhanced EmailLoginForm with better UX
function EmailLoginForm({ onLoginSuccess, currentStoreInfo }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleFieldChange = (field, value) => {
        if (field === 'email') {
            setEmail(value);
            if (fieldErrors.email && validateEmail(value)) {
                setFieldErrors(prev => ({ ...prev, email: '' }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        
        // Enhanced validation
        const newFieldErrors = {};
        
        if (!email.trim()) {
            newFieldErrors.email = 'Email is required';
        } else if (!validateEmail(email.trim())) {
            newFieldErrors.email = 'Please enter a valid email address';
        }
        
        if (!password) {
            newFieldErrors.password = 'Password is required';
        } else if (!validatePassword(password)) {
            newFieldErrors.password = 'Password must be at least 6 characters';
        }
        
        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }
        
        setIsLoading(true);
        
        try {
            console.log('🔐 Attempting buyer login for:', email.trim());
            
            const response = await axios.post(EMAIL_LOGIN_API, { 
                email: email.trim().toLowerCase(), 
                password: password 
            }, {
                timeout: 15000
            });
            
            console.log('✅ Login successful:', response.data);
            
            // Handle different token field names
            const token = response.data.access_token || 
                         response.data.token || 
                         response.data.access;
            
            if (!token) {
                throw new Error('No token received from server');
            }
            
            onLoginSuccess(token, response.data);
            
        } catch (err) {
            console.error('❌ Login error:', err);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (err.response?.status === 401) {
                errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (err.response?.status === 404) {
                errorMessage = 'No account found with this email. Please create an account first.';
            } else if (err.response?.status === 403) {
                errorMessage = 'Account is not verified. Please check your email for verification instructions.';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please check your connection and try again.';
            } else if (err.response?.data) {
                errorMessage = err.response.data.error || 
                             err.response.data.message || 
                             err.response.data.detail || 
                             errorMessage;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            {/* ✅ Store context indicator */}
            {currentStoreInfo.isInStore && (
                <div style={styles.storeNotice}>
                    <Globe size={16} />
                    <span>Logging in for store: {currentStoreInfo.storeId}</span>
                </div>
            )}

            <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                    <Mail size={18} style={styles.inputIcon} />
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => handleFieldChange('email', e.target.value)}
                        placeholder="Enter your email address" 
                        required 
                        style={{
                            ...styles.input,
                            ...(fieldErrors.email ? styles.inputError : {})
                        }}
                        disabled={isLoading}
                        autoFocus
                        autoComplete="email"
                    />
                </div>
                {fieldErrors.email && (
                    <span style={styles.fieldError}>{fieldErrors.email}</span>
                )}
            </div>
            
            <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                    <Lock size={18} style={styles.inputIcon} />
                    <input 
                        type={showPassword ? "text" : "password"}
                        value={password} 
                        onChange={e => handleFieldChange('password', e.target.value)}
                        placeholder="Enter your password" 
                        required 
                        style={{
                            ...styles.passwordInput,
                            ...(fieldErrors.password ? styles.inputError : {})
                        }}
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                {fieldErrors.password && (
                    <span style={styles.fieldError}>{fieldErrors.password}</span>
                )}
            </div>
            
            {error && (
                <div style={styles.errorContainer}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}
            
            <button 
                type="submit" 
                style={{
                    ...styles.button,
                    ...(isLoading ? styles.buttonLoading : {})
                }} 
                disabled={isLoading || !email || !password}
            >
                {isLoading ? (
                    <span style={styles.buttonContent}>
                        <div style={styles.spinner}></div>
                        Signing in...
                    </span>
                ) : (
                    <span style={styles.buttonContent}>
                        <User size={18} />
                        Sign In
                    </span>
                )}
            </button>
        </form>
    );
}

// ✅ Enhanced LoginContent with store awareness
function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });
    
    // ✅ Get current store info from URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
            setCurrentStoreInfo({
                storeId: storeMatch ? storeMatch[1] : null,
                isInStore: !!storeMatch
            });
        }
    }, []);
    
    const handleLoginSuccess = useCallback((token, userData = {}) => {
        console.log('🎉 Login successful, storing token and redirecting...');
        
        // Store token with multiple keys for compatibility
        localStorage.setItem('access_token', token);
        localStorage.setItem('buyerAccessToken', token);
        
        // Store user data if provided
        if (userData.user) {
            localStorage.setItem('userInfo', JSON.stringify(userData.user));
        }
        
        // ✅ Store-aware redirect logic
        const redirectTo = searchParams.get('redirect');
        
        if (redirectTo) {
            router.push(decodeURIComponent(redirectTo));
        } else if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
            // Redirect to store if in store context
            router.push(`/store/${currentStoreInfo.storeId}`);
        } else {
            // Default to profile
            router.push('/profile');
        }
    }, [router, searchParams, currentStoreInfo]);
    
    // ✅ Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('buyerAccessToken') || localStorage.getItem('access_token');
        if (token) {
            console.log('🔍 Existing token found, redirecting...');
            handleLoginSuccess(token);
        }
    }, [handleLoginSuccess]);

    // ✅ Enhanced Google Login Handler
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log('🔍 Google credential received, processing...');
            
            const response = await axios.post(GOOGLE_LOGIN_API, {
                credential: credentialResponse.credential,
                store_context: currentStoreInfo.isInStore ? currentStoreInfo.storeId : null
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                timeout: 15000
            });
            
            console.log('✅ Google login response:', response.data);
            
            const token = response.data.access_token || 
                         response.data.token || 
                         response.data.access;
            
            if (token) {
                handleLoginSuccess(token, response.data);
            } else {
                throw new Error('No token received from server');
            }
            
        } catch (error) {
            console.error("❌ Google login failed:", error);
            
            let errorMessage = 'Google login failed. Please try again.';
            
            if (error.response?.status === 400) {
                errorMessage = 'Invalid Google credential. Please try again.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Google account not verified. Please complete your account setup.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please try again.';
            } else if (error.response?.data) {
                errorMessage = error.response.data.error || 
                             error.response.data.message || 
                             errorMessage;
            }
            
            alert(errorMessage);
        }
    };

    const handleGoogleError = (error) => {
        console.error('❌ Google login error:', error);
        alert('Google login failed. Please try again or use email login.');
    };

    // ✅ Store-aware back navigation
    const handleBackClick = () => {
        const redirectTo = searchParams.get('redirect');
        
        if (redirectTo) {
            router.push(decodeURIComponent(redirectTo));
        } else if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
            router.push(`/store/${currentStoreInfo.storeId}`);
        } else if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    // ✅ Store-aware links
    const getForgotPasswordLink = () => {
        const redirectParam = searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '';
        if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
            return `/store/${currentStoreInfo.storeId}/forgot-password${redirectParam}`;
        }
        return `/forgot-password/buyer${redirectParam}`;
    };

    const getRegisterLink = () => {
        const redirectParam = searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '';
        if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
            return `/store/${currentStoreInfo.storeId}/register${redirectParam}`;
        }
        return `/register/buyer${redirectParam}`;
    };

    return (
        <div style={styles.pageContainer}>
            <header style={styles.header}>
                <div style={styles.headerContainer}>
                    <button onClick={handleBackClick} style={styles.backButton}>
                        <ArrowLeft size={20} />
                        <span style={styles.backText}>Back</span>
                    </button>
                    <h1 style={styles.headerTitle}>
                        {currentStoreInfo.isInStore ? 'Store Sign In' : 'Sign In'}
                    </h1>
                    <div style={styles.headerSpacer}></div>
                </div>
            </header>
            
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconContainer}>
                            <User size={32} color="#3b82f6" />
                        </div>
                        <h2 style={styles.cardTitle}>
                            {currentStoreInfo.isInStore ? 'Store Access' : 'Welcome Back!'}
                        </h2>
                        <p style={styles.cardSubtitle}>
                            {currentStoreInfo.isInStore 
                                ? `Sign in to access ${currentStoreInfo.storeId} store features`
                                : 'Sign in to your account to continue shopping'
                            }
                        </p>
                    </div>
                    
                    <EmailLoginForm 
                        onLoginSuccess={handleLoginSuccess} 
                        currentStoreInfo={currentStoreInfo}
                    />
                    
                    <div style={styles.divider}>
                        <span style={styles.dividerLine}></span>
                        <span style={styles.dividerText}>OR</span>
                        <span style={styles.dividerLine}></span>
                    </div>
                    
                    <div style={styles.googleButtonWrapper}>
                        <GoogleLogin 
                            onSuccess={handleGoogleSuccess} 
                            onError={handleGoogleError}
                            theme="outline"
                            size="large"
                            width="350"
                            text="signin_with"
                            shape="rectangular"
                        />
                    </div>
                    
                    {/* ✅ Security badges */}
                    <div style={styles.securityBadges}>
                        <div style={styles.securityBadge}>
                            <Shield size={14} />
                            <span>Secure Login</span>
                        </div>
                        <div style={styles.securityBadge}>
                            <CheckCircle size={14} />
                            <span>Verified Platform</span>
                        </div>
                    </div>
                    
                    <div style={styles.footerLinks}>
                        <Link href={getForgotPasswordLink()} style={styles.link}>
                            Forgot Password?
                        </Link>
                        <span style={styles.linkDivider}> | </span>
                        <Link href={getRegisterLink()} style={styles.link}>
                            Create an Account
                        </Link>
                    </div>
                    
                    {/* ✅ Seller login link */}
                    <div style={styles.sellerLink}>
                        <p style={styles.sellerText}>Are you a seller?</p>
                        <Link href="/login/seller" style={styles.sellerLinkButton}>
                            Sign in as Seller
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ✅ Enhanced Loading component
function LoginLoading() {
    return (
        <div style={styles.pageContainer}>
            <header style={styles.header}>
                <div style={styles.headerContainer}>
                    <div style={styles.backButton}>
                        <ArrowLeft size={20} />
                        <span style={styles.backText}>Back</span>
                    </div>
                    <h1 style={styles.headerTitle}>Sign In</h1>
                    <div style={styles.headerSpacer}></div>
                </div>
            </header>
            
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p>Loading sign in form...</p>
                        <p style={styles.loadingSubtext}>🌐 Connected to: {API_BASE_URL}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ✅ Enhanced main component with better error handling
export default function BuyerLoginPage() {
    const [configError, setConfigError] = useState('');

    useEffect(() => {
        // Check configuration
        if (!GOOGLE_CLIENT_ID) {
            console.warn('Google Client ID not found. Google login will be disabled.');
            setConfigError('Google login is not configured');
        }
    }, []);

    // Show error for missing configuration
    if (!GOOGLE_CLIENT_ID) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.container}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={styles.iconContainer}>
                                <AlertCircle size={32} color="#ef4444" />
                            </div>
                            <h2 style={styles.cardTitle}>Configuration Error</h2>
                            <p style={styles.cardSubtitle}>
                                Google authentication is not properly configured. Please contact support.
                            </p>
                        </div>
                        
                        {/* Still allow email login */}
                        <Suspense fallback={<LoginLoading />}>
                            <EmailLoginForm onLoginSuccess={() => {}} currentStoreInfo={{ isInStore: false }} />
                        </Suspense>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Suspense fallback={<LoginLoading />}>
                <LoginContent />
            </Suspense>
        </GoogleOAuthProvider>
    );
}

// ✅ Enhanced styles with new components
const styles = {
    pageContainer: { 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc' 
    },
    
    header: { 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
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
        borderRadius: '6px',
        transition: 'all 0.2s ease'
    },
    
    backText: { 
        display: 'block'
    },
    
    headerTitle: { 
        fontSize: '20px', 
        fontWeight: '700', 
        color: '#1e293b', 
        margin: 0 
    },
    
    headerSpacer: { 
        width: '60px' 
    },
    
    container: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)', 
        padding: '20px' 
    },
    
    card: { 
        backgroundColor: 'white', 
        padding: '32px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
        width: '100%', 
        maxWidth: '420px',
        border: '1px solid #e5e7eb'
    },
    
    cardHeader: {
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
    
    cardTitle: { 
        fontSize: '1.5rem', 
        fontWeight: '700', 
        color: '#1e293b', 
        marginBottom: '8px', 
        margin: '0 0 8px 0'
    },
    
    cardSubtitle: {
        fontSize: '0.95rem',
        color: '#6b7280',
        lineHeight: '1.5',
        margin: 0
    },

    // ✅ Store notice
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
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
    },
    
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: '#6b7280',
        zIndex: 1
    },
    
    input: { 
        width: '100%', 
        padding: '14px 16px 14px 48px', 
        border: '1px solid #d1d5db', 
        borderRadius: '8px', 
        boxSizing: 'border-box', 
        fontSize: '16px',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease',
        outline: 'none'
    },

    passwordInput: {
        width: '100%', 
        padding: '14px 48px 14px 48px', 
        border: '1px solid #d1d5db', 
        borderRadius: '8px', 
        boxSizing: 'border-box', 
        fontSize: '16px',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease',
        outline: 'none'
    },

    eyeButton: {
        position: 'absolute',
        right: '16px',
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
        fontSize: '16px', 
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
    
    divider: { 
        margin: '24px 0', 
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#e5e7eb'
    },
    
    dividerText: {
        color: '#6b7280', 
        textTransform: 'uppercase', 
        fontSize: '12px', 
        fontWeight: '600',
        padding: '0 8px'
    },
    
    googleButtonWrapper: { 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '24px' 
    },

    // ✅ Security badges
    securityBadges: {
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '24px',
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
        fontSize: '14px', 
        color: '#6b7280',
        textAlign: 'center'
    },
    
    link: { 
        color: '#3b82f6', 
        textDecoration: 'none', 
        fontWeight: '500',
        transition: 'color 0.2s ease'
    },
    
    linkDivider: {
        color: '#d1d5db'
    },

    // ✅ Seller link section
    sellerLink: {
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
    },

    sellerText: {
        fontSize: '0.9rem',
        color: '#6b7280',
        margin: '0 0 8px 0'
    },

    sellerLinkButton: {
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
    
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: '16px'
    },

    loadingSubtext: {
        fontSize: '0.8rem',
        color: '#9ca3af',
        margin: 0
    }
};

// ✅ Enhanced CSS animations
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 640px) {
            .back-text { display: none !important; }
        }
        
        .input:focus, .passwordInput:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        .button:hover:not(:disabled) {
            background-color: #2563eb !important;
            transform: translateY(-1px);
        }
        
        .sellerLinkButton:hover {
            background-color: #047857 !important;
        }
    `;
    document.head.appendChild(style);
}
