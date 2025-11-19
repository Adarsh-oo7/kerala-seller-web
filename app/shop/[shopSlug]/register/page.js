'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import "../../../../styles/RegisterBuyer.css"; // Reuse buyer styles

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Shield,
    Store,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    KeyRound
} from 'lucide-react';
import SHeader from '../../../../components/common/SHeader';

// ✅ API Configuration
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
const SEND_OTP_API = `${API_BASE_URL}/user/buyer/register/send-otp/`;
const REGISTER_API = `${API_BASE_URL}/user/buyer/register/`;
const GOOGLE_REGISTER_API = `${API_BASE_URL}/user/buyer/register/google/`;

console.log('🌐 Shop Register API URLs:', { API_BASE_URL });

// ✅ OTP Registration Form (2-step with progress bar)
function ShopRegisterForm({ onRegisterSuccess, storeInfo }) {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        password: '',
        password2: ''
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.full_name.trim()) {
            errors.full_name = 'Full name is required';
        } else if (formData.full_name.trim().length < 2) {
            errors.full_name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (!formData.password2) {
            errors.password2 = 'Please confirm your password';
        } else if (formData.password !== formData.password2) {
            errors.password2 = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        if (error) setError('');
    };

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            setError('Please fix the errors above');
            return;
        }

        setIsLoading(true);

        try {
            console.log('📧 Sending OTP for shop registration');
            await axios.post(SEND_OTP_API, {
                email: formData.email.trim(),
                full_name: formData.full_name.trim(),
                store_context: storeInfo.actualStoreId
            });
            setStep(2);
        } catch (err) {
            console.error('OTP send error:', err);
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                err.response?.data?.email?.[0] ||
                'Failed to send OTP. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Register with OTP
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        const finalData = {
            ...formData,
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            otp: otp.trim(),
            store_context: storeInfo.actualStoreId
        };

        try {
            const response = await axios.post(REGISTER_API, finalData);

            const token = response.data.token || response.data.access_token || response.data.access;

            if (token) {
                onRegisterSuccess(token, response.data);
            } else {
                throw new Error('No token received');
            }

        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.otp?.[0] ||
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Registration failed. Please check your OTP and try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setIsLoading(true);

        try {
            await axios.post(SEND_OTP_API, {
                email: formData.email.trim(),
                full_name: formData.full_name.trim(),
                store_context: storeInfo.actualStoreId
            });
            setError('OTP has been resent to your email');
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setOtp('');
        setError('');
    };

    return (
        <>
            {/* Progress Bar */}
            <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                    <div
                        style={{
                            ...styles.progressFill,
                            width: step === 1 ? '50%' : '100%'
                        }}
                    ></div>
                </div>
                <div style={styles.stepIndicator}>
                    Step {step} of 2
                </div>
            </div>

            {step === 1 ? (
                /* Step 1: Personal Details */
                <form onSubmit={handleSendOtp} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <div style={styles.inputWrapper}>
                            <User size={18} style={styles.inputIcon} />
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.full_name ? styles.inputError : {})
                                }}
                                className='buyerregisterinput'
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                        {validationErrors.full_name && (
                            <span style={styles.errorText}>{validationErrors.full_name}</span>
                        )}
                    </div>

                    <div style={styles.inputGroup}>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} style={styles.inputIcon} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                required
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.email ? styles.inputError : {})
                                }}
                                className='buyerregisterinput'
                                disabled={isLoading}
                            />
                        </div>
                        {validationErrors.email && (
                            <span style={styles.errorText}>{validationErrors.email}</span>
                        )}
                    </div>

                    <div style={styles.inputGroup}>
                        <div style={styles.passwordContainer}>
                            <Lock size={18} style={styles.inputIcon} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                required
                                style={{
                                    ...styles.passwordInput,
                                    ...(validationErrors.password ? styles.inputError : {})
                                }}
                                className='buyerregisterpasswordinput'
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className='buyerregistereye'
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {validationErrors.password && (
                            <span style={styles.errorText}>{validationErrors.password}</span>
                        )}
                    </div>

                    <div style={styles.inputGroup}>
                        <div style={styles.passwordContainer}>
                            <Lock size={18} style={styles.inputIcon} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="password2"
                                value={formData.password2}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                required
                                style={{
                                    ...styles.passwordInput,
                                    ...(validationErrors.password2 ? styles.inputError : {})
                                }}
                                className='buyerregisterpasswordinput'
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className='buyerregistereye'
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeButton}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {validationErrors.password2 && (
                            <span style={styles.errorText}>{validationErrors.password2}</span>
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
                        className='buyerregistersigninbtn'
                        style={{
                            ...styles.button,
                            ...(isLoading ? styles.buttonLoading : {})
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span style={styles.buttonContent}>
                                <div style={styles.spinner}></div>
                                Sending OTP...
                            </span>
                        ) : (
                            <span style={styles.buttonContent}>
                                <Shield size={18} />
                                Send Verification OTP
                            </span>
                        )}
                    </button>
                </form>
            ) : (
                /* Step 2: OTP Verification */
                <form onSubmit={handleRegister} style={styles.form}>
                    <div className='shopshopslugregisterotpinfo' style={styles.otpInfo}>
                        <Mail size={20} color='#1a4845' />
                        <div style={styles.otpDetails}>
                            <p style={styles.otpText}>
                                Verification code sent to:
                            </p>
                            <strong style={styles.otpemail}>{formData.email}</strong>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <KeyRound size={16} />
                            Verification Code
                        </label>
                        <input
                            type="text"
                            className='buyerregisterverificationinput'
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            required
                            style={{
                                ...styles.input,
                                ...styles.otpInput
                            }}
                            maxLength={6}
                            disabled={isLoading}
                            autoFocus
                        />
                        <div style={styles.otpActions}>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                style={styles.resendButton}
                                disabled={isLoading}
                            >
                                Resend OTP
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className='shopshopslugregistererrorcontainer' style={styles.errorContainer}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        className='buyerregistersigninbtn'
                        type="submit"
                        style={{
                            ...styles.button,
                            ...(isLoading ? styles.buttonLoading : {})
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span style={styles.buttonContent}>
                                <div style={styles.spinner}></div>
                                Creating Account...
                            </span>
                        ) : (
                            <span style={styles.buttonContent}>
                                <CheckCircle size={18} />
                                Create Account
                            </span>
                        )}
                    </button>

                    <button
                        className='buyerregisterbacktodetailbtn'
                        type="button"
                        onClick={handleBackToStep1}
                        style={styles.backButton}
                        disabled={isLoading}
                    >
                        <ArrowLeft size={16} />
                        Back to Details
                    </button>
                </form>
            )}
        </>
    );
}

// ✅ Shop Register Content
function ShopRegisterContent() {
    const { shopSlug } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [storeInfo, setStoreInfo] = useState({
        actualStoreId: null,
        storeData: null,
        loading: true,
        error: null
    });
    const [hasCheckedToken, setHasCheckedToken] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        try {
            const token = localStorage.getItem('buyerAccessToken') || localStorage.getItem('access_token');
            setIsLoggedIn(!!token);
        } catch (error) {
            setIsLoggedIn(false);
        }
    }, []);

    const getActualStoreId = () => {
        if (shopSlug === 'undefined' || shopSlug === undefined) {
            return { error: 'Invalid shop slug', storeId: null };
        }

        const queryId = searchParams.get('id');
        if (queryId && queryId !== 'undefined' && queryId.trim() !== '') {
            return { error: null, storeId: queryId.trim() };
        }

        if (shopSlug && shopSlug !== 'new' && shopSlug !== 'undefined') {
            return { error: null, storeId: shopSlug };
        }

        return { error: 'No valid store ID', storeId: null };
    };

    const getShopUrl = (path = '') => {
        if (!storeInfo.actualStoreId) return '/';
        if (searchParams.get('id') && shopSlug === 'new') {
            return `/shop/new${path}?id=${storeInfo.actualStoreId}`;
        }
        return `/shop/${storeInfo.actualStoreId}${path}`;
    };

    useEffect(() => {
        const { error, storeId } = getActualStoreId();
        if (error || !storeId) {
            router.replace('/');
            return;
        }

        setStoreInfo(prev => ({ ...prev, actualStoreId: storeId }));

        const fetchStoreData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/shop/${storeId}/`);
                if (response.ok) {
                    const storeResData = await response.json();
                    const storeData = storeResData.store || storeResData;
                    setStoreInfo(prev => ({ ...prev, storeData, loading: false }));
                } else {
                    setStoreInfo(prev => ({
                        ...prev,
                        storeData: { name: `Store ${storeId}`, id: storeId },
                        loading: false
                    }));
                }
            } catch (error) {
                setStoreInfo(prev => ({
                    ...prev,
                    storeData: { name: `Store ${storeId}`, id: storeId },
                    loading: false
                }));
            }
        };

        fetchStoreData();
    }, [shopSlug, searchParams, router]);

    const handleRegisterSuccess = useCallback((token, userData = {}) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('buyerAccessToken', token);
        if (userData.user) {
            localStorage.setItem('userInfo', JSON.stringify(userData.user));
        }
        setIsLoggedIn(true);

        const redirectTo = searchParams.get('redirect');
        setTimeout(() => {
            if (redirectTo) {
                router.push(decodeURIComponent(redirectTo));
            } else {
                router.push(getShopUrl(''));
            }
        }, 1000);
    }, [router, searchParams, storeInfo.actualStoreId]);

    useEffect(() => {
        if (!hasCheckedToken && storeInfo.actualStoreId && !storeInfo.loading) {
            const token = localStorage.getItem('buyerAccessToken') || localStorage.getItem('access_token');
            if (token) {
                router.push(getShopUrl(''));
            } else {
                setHasCheckedToken(true);
            }
        }
    }, [hasCheckedToken, storeInfo.actualStoreId, storeInfo.loading, router]);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axios.post(GOOGLE_REGISTER_API, {
                credential: credentialResponse.credential,
                store_context: storeInfo.actualStoreId
            }, { timeout: 15000 });

            const token = response.data.access_token || response.data.token;
            if (token) {
                handleRegisterSuccess(token, response.data);
            }
        } catch (error) {
            alert('Google registration failed. Please try email registration.');
        }
    };

    if (storeInfo.loading || !hasCheckedToken) {
        return (
            <div style={styles.pageContainer}>
                <SHeader store={storeInfo.storeData} isLoggedIn={isLoggedIn} />
                <div style={styles.container}>
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!storeInfo.actualStoreId) {
        return (
            <div style={styles.pageContainer}>
                <SHeader store={null} isLoggedIn={isLoggedIn} />
                <div style={styles.container}>
                    <div style={styles.card}>
                        <div style={styles.iconContainer}>
                            <AlertTriangle size={32} color="#ef4444" />
                        </div>
                        <h2 style={styles.title}>Store Not Found</h2>
                        <button onClick={() => router.push('/')} style={styles.button}>
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <SHeader store={storeInfo.storeData} isLoggedIn={isLoggedIn} />

            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div className='buyerregistericoncontainer' style={styles.iconContainer}>
                            <Store className='buyerregistericonsize' size={32} color="#1a4845" />
                        </div>
                        <h1 className='buyerregistercardtitle' style={styles.title}>
                            Join {storeInfo.storeData?.name || 'Store'}
                        </h1>
                        <p className='buyerregistercardsubtitle' style={styles.subtitle}>
                            Create your account to start shopping at this store
                        </p>
                    </div>

                    <ShopRegisterForm
                        onRegisterSuccess={handleRegisterSuccess}
                        storeInfo={storeInfo}
                    />

                    <div style={styles.divider}>
                        <span style={styles.dividerLine}></span>
                        <span style={styles.dividerText}>OR</span>
                        <span style={styles.dividerLine}></span>
                    </div>

                    <div className='google-login-wrapper' style={styles.googleButtonWrapper}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => alert('Google registration failed')}
                            theme="outline"
                            size="large"
                            text="signup_with"
                            shape="pill"
                        />
                    </div>

                    <div style={styles.footerLinks}>
                        <Link href={getShopUrl('/login')} style={styles.link}>
                            Already have an account? Login
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default function ShopRegisterPage() {
    if (!GOOGLE_CLIENT_ID) {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <ShopRegisterContent />
            </Suspense>
        );
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Suspense fallback={<div>Loading...</div>}>
                <ShopRegisterContent />
            </Suspense>
        </GoogleOAuthProvider>
    );
}

// ✅ Styles (matching your buyer register styles)
const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#FDFFF0',
        paddingTop: '90px'
    },
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: '20px'
    },
    card: {
        backgroundImage: 'url("/assets/images/Shoppagebanner.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        marginTop: '50px',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        width: '90%',
        maxWidth: '500px',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#fff',
        textAlign: 'center'
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px'
    },
    iconContainer: {
        width: '64px',
        height: '64px',
        backgroundColor: '#FDFFF0',
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
        fontSize: '0.95rem',
        color: '#6b7280',
        lineHeight: '1.5'
    },
    progressContainer: {
        marginBottom: '24px'
    },
    progressBar: {
        width: '100%',
        height: '4px',
        backgroundColor: '#e5e7eb',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '8px'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#1a4845',
        borderRadius: '2px',
        transition: 'width 0.3s ease'
    },
    stepIndicator: {
        fontSize: '0.875rem',
        color: '#6b7280',
        textAlign: 'center'
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
        padding: '14px 16px 14px 48px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '15px',
        backgroundColor: '#FDFFF0',
        outline: 'none',
        boxSizing: 'border-box'
    },
    passwordInput: {
        width: '100%',
        padding: '14px 48px 14px 48px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '15px',
        backgroundColor: '#FDFFF0',
        outline: 'none'
    },
    passwordContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    eyeButton: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#1a4845',
        padding: '4px'
    },
    inputError: {
        borderColor: '#ef4444'
    },
    errorText: {
        color: '#ef4444',
        fontSize: '0.875rem',
        marginTop: '6px'
    },
    otpInfo: {
        display: 'flex',
        justifyContent: "center",
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0'
    },
    otpDetails: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    otpText: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        color: '#1a4845'
    },
    otpemail: {
        fontSize: '0.9rem',
        color: '#1a4845'
    },
    otpInput: {
        textAlign: 'center',
        letterSpacing: '0.5em',
        fontSize: '1.2rem',
        fontWeight: '600',
        boxSizing: 'border-box'
    },
    otpActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '8px'
    },
    resendButton: {
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        cursor: 'pointer',
        fontSize: '0.85rem'
    },
    button: {
        width: '100%',
        padding: '16px 24px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#1a4845',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
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
    backButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        padding: '12px 16px',
        background: 'none',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        color: '#6b7280',
        cursor: 'pointer',
        fontSize: '0.9rem',
        marginTop: '8px'
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
        fontSize: '12px',
        fontWeight: '600'
    },
    googleButtonWrapper: {
        display: 'flex',
        justifyContent: 'center',
        maxWidth: '350px',
        margin: '0 auto 24px'
    },
    footerLinks: {
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '14px'
    },
    link: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontWeight: '500'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
    }
};
