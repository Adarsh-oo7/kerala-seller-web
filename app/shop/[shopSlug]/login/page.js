'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Store,
  Shield,
  CheckCircle,
  AlertTriangle 
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

console.log('🌐 Shop Login API URLs configured:', { 
  API_BASE_URL, 
  GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'Not configured' 
});

// ✅ Enhanced EmailLoginForm with store context
function EmailLoginForm({ onLoginSuccess, storeInfo }) {
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
        
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        
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
            console.log('🔐 Shop login attempt for store:', storeInfo.actualStoreId);
            
            const response = await axios.post(EMAIL_LOGIN_API, { 
                email: email.trim().toLowerCase(), 
                password: password,
                store_context: storeInfo.actualStoreId // ✅ Include store context
            }, {
                timeout: 15000
            });
            
            console.log('✅ Shop login successful:', response.data);
            
            const token = response.data.access_token || 
                         response.data.token || 
                         response.data.access;
            
            if (!token) {
                throw new Error('No token received from server');
            }
            
            onLoginSuccess(token, response.data);
            
        } catch (err) {
            console.error('❌ Shop login error:', err);
            
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
            <div style={styles.storeNotice}>
                <Store size={16} />
                <span>Logging in for {storeInfo.storeData?.name || `Store ${storeInfo.actualStoreId}`}</span>
            </div>

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
                        Sign In to Store
                    </span>
                )}
            </button>
        </form>
    );
}

// ✅ Shop Login Content with store awareness
function ShopLoginContent() {
    const { shopSlug } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [storeInfo, setStoreInfo] = useState({
        actualStoreId: null,
        storeData: null,
        loading: true,
        error: null
    });

    // Get actual store ID from URL parameters
    const getActualStoreId = () => {
        console.log('🔍 Getting store ID for shop login...');
        console.log('- shopSlug from params:', shopSlug);
        console.log('- id from search params:', searchParams.get('id'));

        if (shopSlug === 'undefined' || shopSlug === undefined) {
            return { error: 'Invalid shop slug in URL', storeId: null };
        }

        const queryId = searchParams.get('id');
        if (queryId && queryId !== 'undefined' && queryId.trim() !== '') {
            return { error: null, storeId: queryId.trim() };
        }
        
        if (shopSlug && shopSlug !== 'new' && shopSlug !== 'undefined') {
            return { error: null, storeId: shopSlug };
        }
        
        return { error: 'No valid store ID found', storeId: null };
    };

    // Generate shop URLs
    const getShopUrl = (path = '') => {
        if (!storeInfo.actualStoreId) {
            return '/';
        }
        
        if (searchParams.get('id') && shopSlug === 'new') {
            const basePath = `/shop/new${path}`;
            return `${basePath}?id=${storeInfo.actualStoreId}`;
        } else {
            return `/shop/${storeInfo.actualStoreId}${path}`;
        }
    };

    // Initialize store info
    useEffect(() => {
        const { error, storeId } = getActualStoreId();
        
        if (error || !storeId) {
            console.log('🔍 Invalid shop login URL, redirecting to home...');
            router.replace('/');
            return;
        }

        setStoreInfo(prev => ({ ...prev, actualStoreId: storeId }));

        // Fetch store data
        const fetchStoreData = async () => {
            try {
                console.log('📡 Fetching store data for shop login:', storeId);
                const response = await fetch(`${API_BASE_URL}/shop/${storeId}/`);
                
                if (response.ok) {
                    const storeResData = await response.json();
                    const storeData = storeResData.store || storeResData;
                    console.log('✅ Store data loaded for login');
                    
                    setStoreInfo(prev => ({
                        ...prev,
                        storeData,
                        loading: false
                    }));
                } else {
                    console.warn('⚠️ Store data not found, using fallback');
                    setStoreInfo(prev => ({
                        ...prev,
                        storeData: {
                            name: `Store ${storeId}`,
                            seller_phone: storeId,
                            id: storeId
                        },
                        loading: false
                    }));
                }
            } catch (error) {
                console.error('❌ Failed to fetch store data:', error);
                setStoreInfo(prev => ({
                    ...prev,
                    storeData: {
                        name: `Store ${storeId}`,
                        seller_phone: storeId,
                        id: storeId
                    },
                    loading: false,
                    error: error.message
                }));
            }
        };

        fetchStoreData();
    }, [shopSlug, searchParams, router]);

    const handleLoginSuccess = useCallback((token, userData = {}) => {
        console.log('🎉 Shop login successful, storing token and redirecting...');
        
        // Store token with multiple keys for compatibility
        localStorage.setItem('access_token', token);
        localStorage.setItem('buyerAccessToken', token);
        
        // Store user data if provided
        if (userData.user) {
            localStorage.setItem('userInfo', JSON.stringify(userData.user));
        }
        
        // Shop-specific redirect logic
        const redirectTo = searchParams.get('redirect');
        
        if (redirectTo) {
            router.push(decodeURIComponent(redirectTo));
        } else {
            // Default to shop profile
            const profileUrl = getShopUrl('/profile');
            console.log('🔄 Redirecting to shop profile:', profileUrl);
            router.push(profileUrl);
        }
    }, [router, searchParams, storeInfo.actualStoreId]);
    
    // ✅ Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('buyerAccessToken') || localStorage.getItem('access_token');
        if (token && storeInfo.actualStoreId) {
            console.log('🔍 Existing token found, redirecting to shop...');
            handleLoginSuccess(token);
        }
    }, [handleLoginSuccess, storeInfo.actualStoreId]);

    // ✅ Enhanced Google Login Handler with store context
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log('🔍 Google credential received for shop:', storeInfo.actualStoreId);
            
            const response = await axios.post(GOOGLE_LOGIN_API, {
                credential: credentialResponse.credential,
                store_context: storeInfo.actualStoreId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                timeout: 15000
            });
            
            console.log('✅ Google shop login response:', response.data);
            
            const token = response.data.access_token || 
                         response.data.token || 
                         response.data.access;
            
            if (token) {
                handleLoginSuccess(token, response.data);
            } else {
                throw new Error('No token received from server');
            }
            
        } catch (error) {
            console.error("❌ Google shop login failed:", error);
            
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
        console.error('❌ Google shop login error:', error);
        alert('Google login failed. Please try again or use email login.');
    };

    // Handle back navigation
    const handleBackClick = () => {
        const redirectTo = searchParams.get('redirect');
        
        if (redirectTo) {
            router.push(decodeURIComponent(redirectTo));
        } else {
            const shopUrl = getShopUrl('');
            console.log('🔙 Back to shop:', shopUrl);
            router.push(shopUrl);
        }
    };

    // Loading state
    if (storeInfo.loading) {
        return <ShopLoginLoading />;
    }

    // Error state
    if (!storeInfo.actualStoreId) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.container}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={styles.iconContainer}>
                                <AlertTriangle size={32} color="#ef4444" />
                            </div>
                            <h2 style={styles.cardTitle}>Store Not Found</h2>
                            <p style={styles.cardSubtitle}>
                                Unable to identify the store. Please check the URL.
                            </p>
                        </div>
                        <button 
                            onClick={() => router.push('/')} 
                            style={styles.button}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <header style={styles.header}>
                <div style={styles.headerContainer}>
                    <button onClick={handleBackClick} style={styles.backButton}>
                        <ArrowLeft size={20} />
                        <span style={styles.backText}>Back</span>
                    </button>
                    <h1 style={styles.headerTitle}>
                        {storeInfo.storeData?.name || `Store ${storeInfo.actualStoreId}`} - Sign In
                    </h1>
                    <div style={styles.headerSpacer}></div>
                </div>
            </header>
            
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconContainer}>
                            <Store size={32} color="#3b82f6" />
                        </div>
                        <h2 style={styles.cardTitle}>
                            Welcome to {storeInfo.storeData?.name || 'Store'}
                        </h2>
                        <p style={styles.cardSubtitle}>
                            Sign in to access your account and shop at {storeInfo.storeData?.name || 'this store'}
                        </p>
                    </div>
                    
                    <EmailLoginForm 
                        onLoginSuccess={handleLoginSuccess} 
                        storeInfo={storeInfo}
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
                            <span>Store Verified</span>
                        </div>
                    </div>
                    
                    <div style={styles.footerLinks}>
                        <Link href={getShopUrl('/forgot-password')} style={styles.link}>
                            Forgot Password?
                        </Link>
                        <span style={styles.linkDivider}> | </span>
                        <Link href={getShopUrl('/register')} style={styles.link}>
                            Create Store Account
                        </Link>
                    </div>
                    
                    {/* ✅ Main KeralaSellers link */}
                    <div style={styles.sellerLink}>
                        <p style={styles.sellerText}>Want to access the main platform?</p>
                        <Link href="/login/buyer" style={styles.sellerLinkButton}>
                            KeralaSellers Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Debug Info */}
            <div style={styles.debugInfo}>
                <div style={styles.debugTitle}>🔍 Shop Login Debug Info:</div>
                <div><strong>Store ID:</strong> {storeInfo.actualStoreId}</div>
                <div><strong>Store Name:</strong> {storeInfo.storeData?.name || 'Loading...'}</div>
                <div><strong>URL Pattern:</strong> {searchParams.get('id') ? 'new+id' : 'direct'}</div>
                <div><strong>Redirect URL:</strong> {searchParams.get('redirect') || 'None'}</div>
                <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</div>
            </div>
        </div>
    );
}

// ✅ Enhanced Loading component
function ShopLoginLoading() {
    return (
        <div style={styles.pageContainer}>
            <header style={styles.header}>
                <div style={styles.headerContainer}>
                    <div style={styles.backButton}>
                        <ArrowLeft size={20} />
                        <span style={styles.backText}>Back</span>
                    </div>
                    <h1 style={styles.headerTitle}>Loading Shop...</h1>
                    <div style={styles.headerSpacer}></div>
                </div>
            </header>
            
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p>Loading shop login...</p>
                        <p style={styles.loadingSubtext}>🌐 Connected to: {API_BASE_URL}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ✅ Enhanced main component with Google OAuth Provider
export default function ShopLoginPage() {
    const [configError, setConfigError] = useState('');

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn('Google Client ID not found. Google login will be disabled.');
            setConfigError('Google login is not configured');
        }
    }, []);

    // Show error for missing Google configuration but still allow email login
    if (!GOOGLE_CLIENT_ID) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.container}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div style={styles.iconContainer}>
                                <AlertCircle size={32} color="#f59e0b" />
                            </div>
                            <h2 style={styles.cardTitle}>Limited Login Options</h2>
                            <p style={styles.cardSubtitle}>
                                Google authentication is not configured. You can still login with email.
                            </p>
                        </div>
                        
                        <Suspense fallback={<ShopLoginLoading />}>
                            <ShopLoginContent />
                        </Suspense>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Suspense fallback={<ShopLoginLoading />}>
                <ShopLoginContent />
            </Suspense>
        </GoogleOAuthProvider>
    );
}

// ✅ Enhanced styles (same as your KeralaSellers login but with shop-specific colors)
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
        fontSize: '18px', 
        fontWeight: '700', 
        color: '#1e293b', 
        margin: 0,
        textAlign: 'center',
        flex: 1
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

    // ✅ Store notice (shop-specific styling)
    storeNotice: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#ecfdf5',
        border: '1px solid #10b981',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#047857',
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
        backgroundColor: '#10b981', // ✅ Shop-specific green color
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
        borderTop: '2px solid #10b981',
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
        color: '#10b981', // ✅ Shop-specific green
        textDecoration: 'none', 
        fontWeight: '500',
        transition: 'color 0.2s ease'
    },
    
    linkDivider: {
        color: '#d1d5db'
    },

    // ✅ KeralaSellers link section
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
        backgroundColor: '#3b82f6',
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
    },

    debugInfo: {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px auto',
        maxWidth: '420px',
        fontSize: '12px',
        color: '#666',
        fontFamily: 'monospace'
    },

    debugTitle: {
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#333'
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
            border-color: #10b981 !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }
        
        .button:hover:not(:disabled) {
            background-color: #047857 !important;
            transform: translateY(-1px);
        }
        
        .sellerLinkButton:hover {
            background-color: #2563eb !important;
        }
    `;
    document.head.appendChild(style);
}
