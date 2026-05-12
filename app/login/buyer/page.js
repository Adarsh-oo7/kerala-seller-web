'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import api from '../../../app/lib/api';
import "../../../styles/BuyerLogin.css";
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import Image from 'next/image';
const BagImage = '/assets/images/bag.png';
const StoreImage = '/assets/images/store.png';
const TrolleyImage = '/assets/images/trolley.png';
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

// âœ… Enhanced API configuration
// const getApiBaseUrl = () => {
//     const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
//     if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
//         return envUrl.trim();
//     }
//     if (process.env.NODE_ENV === 'development') {
//         return 'https://api.keralasellers.in';
//     }
//     return 'https://api.keralasellers.in';
// };

// const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
// const API_BASE_URL = 'https://api.keralasellers.in';
// const GOOGLE_LOGIN_API = `${API_BASE_URL}/user/buyer/login/google/`;
// const EMAIL_LOGIN_API = `${API_BASE_URL}/user/buyer/login/`;

// console.log(' Buyer Login API URLs configured:', {
//     API_BASE_URL,
//     GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'Not configured'
// });

// âœ… Works local (.env.local) + production (Vercel)
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     'https://api.keralasellers.in';

const GOOGLE_LOGIN_API = `${API_BASE_URL}/user/buyer/login/google/`;
const EMAIL_LOGIN_API = `${API_BASE_URL}/user/buyer/login/`;

console.log(' Buyer Login APIs:', {
    API_BASE_URL,
    GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'Not set',
    LOCAL: process.env.NEXT_PUBLIC_API_BASE_URL,
    ENV: process.env.NODE_ENV
});


// âœ… Enhanced EmailLoginForm with better UX
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
            console.log(' Attempting buyer login for:', email.trim());

            const response = await axios.post(EMAIL_LOGIN_API, {
                email: email.trim().toLowerCase(),
                password: password
            }, {
                timeout: 15000
            });

            console.log(' Login successful:', response.data);

            // Handle different token field names
            const token = response.data.access_token ||
                response.data.token ||
                response.data.access;

            if (!token) {
                throw new Error('No token received from server');
            }

            onLoginSuccess(token, response.data);

        } catch (err) {
            console.error(' Login error:', err);

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
            {/* âœ… Store context indicator */}
            {currentStoreInfo.isInStore && (
                <div style={styles.storeNotice}>
                    <Globe size={16} />
                    <span>Logging in for store: {currentStoreInfo.storeId}</span>
                </div>
            )}

            <div style={styles.inputGroup}>
                {/* <label style={styles.label}>Email Address</label> */}
                <div style={styles.inputWrapper}>
                    <Mail size={18} style={styles.inputIcon} />
                    <input
                        type="email"
                        value={email}
                        onChange={e => handleFieldChange('email', e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className='buyerlogininput'
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
                {/* <label style={styles.label}>Password</label> */}
                <div style={styles.inputWrapper}>
                    <Lock size={18} style={styles.inputIcon} />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => handleFieldChange('password', e.target.value)}
                        placeholder="Enter your password"
                        className='buyerloginpasswordinput'
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
                        className='buyerlogineye'
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
                className='buyerloginsigninbtn'
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

const FloatingIcons = ({ totalIcons = 12 }) => {
    const containerRef = useRef(null);
    const iconRefs = useRef([]);
    const iconSources = [BagImage, StoreImage, TrolleyImage];

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Random properties
        const speeds = Array.from({ length: totalIcons }, () => ({
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
        }));

        const positions = Array.from({ length: totalIcons }, () => ({
            x: Math.random() * (container.clientWidth - 40),
            y: Math.random() * (container.clientHeight - 40),
        }));

        const sizes = Array.from({ length: totalIcons }, () => 25 + Math.random() * 25);

        const animate = () => {
            const rect = container.getBoundingClientRect();

            iconRefs.current.forEach((icon, i) => {
                if (!icon) return;
                const size = sizes[i];
                const pos = positions[i];
                const speed = speeds[i];

                pos.x += speed.x;
                pos.y += speed.y;

                // Bounce horizontally
                if (pos.x <= 0 || pos.x + size >= rect.width) speed.x *= -1;
                // Bounce vertically
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



// âœ… Enhanced LoginContent with store awareness
function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });

    // âœ… Get current store info from URL
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
        console.log(' Login successful, storing token and redirecting...');

        // Store token with multiple keys for compatibility
        localStorage.setItem('access_token', token);
        localStorage.setItem('buyerAccessToken', token);

        // Store user data if provided
        if (userData.user) {
            localStorage.setItem('userInfo', JSON.stringify(userData.user));
        }

        // âœ… Store-aware redirect logic
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

    // âœ… Check for existing token on mount
useEffect(() => {
    const token = localStorage.getItem('buyerAccessToken') || localStorage.getItem('access_token');
    if (token) {
        console.log(' Existing token found, redirecting...');
        const redirectTo = searchParams.get('redirect');
        router.push(redirectTo ? decodeURIComponent(redirectTo) : '/profile');
    }
}, []);

    // âœ… Enhanced Google Login Handler
// At the top of BuyerLogin.js, import your configured api instance

// Then in handleGoogleSuccess, replace axios.post with api.post:
const handleGoogleSuccess = async (credentialResponse) => {
    try {
        console.log(' Google credential received, processing...');

        const response = await api.post('/user/buyer/login/google/', {  // ✅ relative path
            credential: credentialResponse.credential,
            store_context: currentStoreInfo.isInStore ? currentStoreInfo.storeId : null
        }, {
            timeout: 60000 // Increased to 60s for extremely slow local environments
        });

        const token = response.data.access_token ||
            response.data.token ||
            response.data.access;

        if (token) {
            handleLoginSuccess(token, response.data);
        } else {
            throw new Error('No token received from server');
        }

    } catch (error) {
        console.error(' Google login failed:', error);
        alert('Google login failed. Please try again.');
    }
};

    const handleGoogleError = (error) => {
        console.error(' Google login error:', error);
        alert('Google login failed. Please try again or use email login.');
    };



    // âœ… Store-aware links
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
            <Header />
            {/* <header style={styles.header}>
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
            </header> */}

            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div className='buyerloginiconcontainer' style={styles.iconContainer}>
                            <User className='byerloginiconsize' style={styles.iconsize} color="#1a4845" />
                        </div>
                        <h2 className='buyerlogincardtitle' style={styles.cardTitle}>
                            {currentStoreInfo.isInStore ? 'Store Access' : 'Welcome Back!'}
                        </h2>
                        <p className='buyerlogincardsubtitle' style={styles.cardSubtitle}>
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

                    <div className='google-login-wrapper' style={styles.googleButtonWrapper}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline"
                            size="large"
                            width="100%"
                            text="signin_with"
                            shape="pill"
                        />
                    </div>

                    {/* âœ… Security badges */}
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

                    <FloatingIcons totalIcons={8} />                

                    <div style={styles.footerLinks}>
                        <Link href={getForgotPasswordLink()} style={styles.link}>
                            Forgot Password?
                        </Link>
                        <span style={styles.linkDivider}> | </span>
                        <Link href={getRegisterLink()} style={styles.link}>
                            Create an Account
                        </Link>
                    </div>

                    {/* âœ… Seller login link */}
                    <div style={styles.sellerLink}>
                        <p style={styles.sellerText}>Are you a seller?</p>
                        <Link href="/login/seller" style={styles.sellerLinkButton}>
                            Sign in as Seller
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

// âœ… Enhanced Loading component
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
                        <p style={styles.loadingSubtext}>ðŸŒ Connected to: {API_BASE_URL}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// âœ… Enhanced main component with better error handling
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
                            <div className='buyerloginiconcontainer' style={styles.iconContainer}>
                                <AlertCircle className='byerloginiconsize' style={styles.iconsize} color="#ef4444" />
                            </div>
                            <h2 style={styles.cardTitle}>Configuration Error</h2>
                            <p style={styles.cardSubtitle}>
                                Google authentication is not properly configured. Please contact support.
                            </p>
                        </div>

                        {/* Still allow email login */}
                        <Suspense fallback={<LoginLoading />}>
                            <EmailLoginForm onLoginSuccess={() => { }} currentStoreInfo={{ isInStore: false }} />
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


// âœ… Enhanced styles with new components
const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
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
    iconsize: {
        width: "32px",
        height: "32px",
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
        minHeight: 'calc(100vh - 170px)', // âœ… UPDATE: Account for SHeader
        padding: '20px',
        backgroundColor: '#FDFFF0'
    },



    card: {
        position: 'relative',
        overflow: 'hidden',
        backgroundAttachment: 'fixed',
        marginTop: '50px',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        width: '90%',
        maxWidth: '400px',
        backgroundColor: 'rgba(137, 172, 120, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#fff',
        textAlign: 'center',
        zIndex: 0,
        transition: 'all 0.3s ease',
    },



    cardHeader: {
        textAlign: 'center',
        marginBottom: '32px'
    },

    iconContainer: {
        width: '64px',
        height: '64px',
        Scale: '0.9',
        backgroundColor: '#FDFFF0',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto'
    },

    iconsize: {
        width: "32px",
        height: "32px",
    },

    cardTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1a4845',
        marginBottom: '8px',
        margin: '0 0 8px 0'
    },

    cardSubtitle: {
        fontSize: '0.95rem',
        color: '#6b7280',
        lineHeight: '1.5',
        margin: 0
    },

    // âœ… Store notice
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
        backgroundColor: '#FDFFF0',
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
        backgroundColor: '#FDFFF0',
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
        backgroundColor: '#1a4845',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '46px'
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

    // âœ… Security badges
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

    // âœ… Seller link section
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

// âœ… Enhanced CSS animations
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes float {
            0% { transform: translate(0, 0); }
            50% { transform: translate(5px, 10px); } /* or translateY(10px) */
            100% { transform: translate(0, 0); }
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



