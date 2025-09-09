'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { ArrowLeft, Mail, Lock, AlertCircle, User } from 'lucide-react';

// ==============================================================================
// CONSTANTS (Using Environment Variables)
// ==============================================================================
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const GOOGLE_LOGIN_API = `${API_BASE_URL}/user/buyer/login/google/`;
const EMAIL_LOGIN_API = `${API_BASE_URL}/user/buyer/login/`;

// ==============================================================================
// SUB-COMPONENTS
// ==============================================================================
function EmailLoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Client-side validation
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await axios.post(EMAIL_LOGIN_API, { email, password });
            onLoginSuccess(response.data.token);
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.error || 
                               err.response?.data?.message || 
                               'Invalid credentials. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
                <div style={styles.inputWrapper}>
                    <Mail size={18} style={styles.inputIcon} />
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="Enter your email address" 
                        required 
                        style={{
                            ...styles.input,
                            ...(error && !validateEmail(email) && email ? styles.inputError : {})
                        }}
                        disabled={isLoading}
                    />
                </div>
            </div>
            
            <div style={styles.inputGroup}>
                <div style={styles.inputWrapper}>
                    <Lock size={18} style={styles.inputIcon} />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="Enter your password" 
                        required 
                        style={{
                            ...styles.input,
                            ...(error && password.length < 6 && password ? styles.inputError : {})
                        }}
                        disabled={isLoading}
                    />
                </div>
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
                disabled={isLoading}
            >
                {isLoading ? (
                    <span style={styles.buttonContent}>
                        <div style={styles.spinner}></div>
                        Logging in...
                    </span>
                ) : (
                    <span style={styles.buttonContent}>
                        <User size={18} />
                        Login
                    </span>
                )}
            </button>
        </form>
    );
}

// ✅ Component that uses useSearchParams - wrapped separately
function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const handleLoginSuccess = useCallback((token) => {
        localStorage.setItem('buyerAccessToken', token);
        const redirectTo = searchParams.get('redirect');
        
        if (redirectTo) {
            router.push(decodeURIComponent(redirectTo));
        } else {
            router.push('/profile');
        }
    }, [router, searchParams]);
    
    useEffect(() => {
        const token = localStorage.getItem('buyerAccessToken');
        if (token) {
            handleLoginSuccess(token);
        }
    }, [router, handleLoginSuccess]);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decodedToken = jwtDecode(credentialResponse.credential);
            const userData = {
                email: decodedToken.email,
                name: decodedToken.name,
                picture: decodedToken.picture
            };
            
            const response = await axios.post(GOOGLE_LOGIN_API, userData);
            handleLoginSuccess(response.data.token);
        } catch (error) {
            console.error("Google login failed:", error);
            alert("Google login failed. Please try again.");
        }
    };

    const handleGoogleError = () => {
        console.log('Google login failed');
        alert('Google login failed. Please try again.');
    };

    const handleBackClick = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <div style={styles.pageContainer}>
            <header style={styles.header}>
                <div style={styles.headerContainer}>
                    <button onClick={handleBackClick} style={styles.backButton}>
                        <ArrowLeft size={20} />
                        <span style={styles.backText}>Back</span>
                    </button>
                    <h1 style={styles.headerTitle}>Sign In</h1>
                    <div style={styles.headerSpacer}></div>
                </div>
            </header>
            
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconContainer}>
                            <User size={32} color="#3b82f6" />
                        </div>
                        <h2 style={styles.cardTitle}>Welcome Back!</h2>
                        <p style={styles.cardSubtitle}>
                            Sign in to your account to continue shopping
                        </p>
                    </div>
                    
                    <EmailLoginForm onLoginSuccess={handleLoginSuccess} />
                    
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
                            width="100%"
                        />
                    </div>
                    
                    <div style={styles.footerLinks}>
                        <Link href="/forgot-password/buyer" style={styles.link}>
                            Forgot Password?
                        </Link>
                        <span style={styles.linkDivider}> | </span>
                        <Link href="/register/buyer" style={styles.link}>
                            Create an Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ✅ Loading component for Suspense fallback
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
                        <p>Loading login form...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==============================================================================
// MAIN LOGIN PAGE WITH SUSPENSE WRAPPER
// ==============================================================================
export default function BuyerLoginPage() {
    // Check if Google Client ID is available
    if (!GOOGLE_CLIENT_ID) {
        console.warn('Google Client ID not found. Google login will not work.');
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ''}>
            {/* ✅ Wrap the component that uses useSearchParams in Suspense */}
            <Suspense fallback={<LoginLoading />}>
                <LoginContent />
            </Suspense>
        </GoogleOAuthProvider>
    );
}

// ==============================================================================
// ENHANCED STYLES
// ==============================================================================
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
    
    inputError: {
        borderColor: '#ef4444'
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
    
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: '16px'
    }
};

// ✅ Add CSS animations
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
    `;
    document.head.appendChild(style);
}
