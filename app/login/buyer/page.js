'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { ArrowLeft } from 'lucide-react';

// ==============================================================================
// CONSTANTS
// ==============================================================================
const GOOGLE_CLIENT_ID = "108580007778-ctbmb96tl44p2bj91k5l128glba9bb3m.apps.googleusercontent.com";
const GOOGLE_LOGIN_API = 'http://localhost:8000/user/buyer/login/google/';
const EMAIL_LOGIN_API = 'http://localhost:8000/user/buyer/login/';

// ==============================================================================
// SUB-COMPONENTS
// ==============================================================================

function EmailLoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await axios.post(EMAIL_LOGIN_API, { email, password });
            onLoginSuccess(response.data.token);
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required style={styles.input} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={styles.input} />
            <button type="submit" style={styles.button} disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p style={styles.error}>{error}</p>}
        </form>
    );
}

// ==============================================================================
// MAIN LOGIN PAGE
// ==============================================================================

export default function BuyerLoginPage() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('buyerAccessToken');
        if (token) {
            // Check for URL redirect parameter first
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirect');
            
            if (redirectTo) {
                router.replace(decodeURIComponent(redirectTo));
            } else {
                router.replace('/profile');
            }
        }
    }, [router]);

    const handleLoginSuccess = (token) => {
        localStorage.setItem('buyerAccessToken', token);
        
        // Check for URL redirect parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect');
        
        if (redirectTo) {
            router.push(decodeURIComponent(redirectTo));
        } else {
            router.push('/profile');
        }
    };
    
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decodedToken = jwtDecode(credentialResponse.credential);
            const userData = {
                email: decodedToken.email,
                name: decodedToken.name
            };
            const response = await axios.post(GOOGLE_LOGIN_API, userData);
            handleLoginSuccess(response.data.token);
        } catch (error) {
            console.error("Google login failed:", error);
            alert("Google login failed. Please try again.");
        }
    };

    const handleBackClick = () => {
        // Check if user came from within the app (and not from login/register pages)
        const referrer = document.referrer;
        const currentHost = window.location.origin;
        
        // If there's a valid internal referrer that's not a login/register page
        if (referrer && 
            referrer.startsWith(currentHost) && 
            !referrer.includes('/login') && 
            !referrer.includes('/register') &&
            !referrer.includes('/auth')) {
            
            // Use browser's back button for smooth navigation
            window.history.back();
        } else {
            // Default to home page for external referrers or login pages
            router.push('/');
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div style={styles.pageContainer}>
                {/* Header with Back Button */}
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
                        <h2 style={styles.cardTitle}>Sign in to Your Account</h2>
                        
                        <EmailLoginForm onLoginSuccess={handleLoginSuccess} />
                        
                        <div style={styles.divider}>OR</div>
                        
                        <div style={styles.googleButtonWrapper}>
                            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} />
                        </div>

                        <div style={styles.footerLinks}>
                            <Link href="/forgot-password/buyer" style={styles.link}>Forgot Password?</Link>
                            <span> | </span>
                            <Link href="/register/buyer" style={styles.link}>Create an Account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f0f2f5'
    },
    
    // Loading state
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px'
    },
    spinner: {
        width: '32px',
        height: '32px',
        border: '3px solid #e2e8f0',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    
    // Header
    header: {
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
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
        borderRadius: '6px'
    },
    backText: {
        '@media (max-width: 640px)': {
            display: 'none'
        }
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
    
    // Main container
    container: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)',
        padding: '20px'
    },
    card: { 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)', 
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
    },
    cardTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '32px',
        marginTop: 0
    },
    input: { 
        width: '100%', 
        padding: '14px', 
        marginBottom: '16px', 
        border: '2px solid #e2e8f0', 
        borderRadius: '8px', 
        boxSizing: 'border-box',
        fontSize: '16px',
        transition: 'border-color 0.2s',
        outline: 'none'
    },
    button: { 
        width: '100%', 
        padding: '14px', 
        border: 'none', 
        borderRadius: '8px', 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        cursor: 'pointer', 
        fontSize: '16px',
        fontWeight: '600',
        transition: 'background-color 0.2s',
        marginBottom: '16px'
    },
    divider: { 
        margin: '24px 0', 
        color: '#64748b', 
        textTransform: 'uppercase', 
        fontSize: '12px',
        fontWeight: '600',
        position: 'relative'
    },
    googleButtonWrapper: { 
        display: 'flex', 
        justifyContent: 'center',
        marginBottom: '24px'
    },
    footerLinks: { 
        marginTop: '24px', 
        fontSize: '14px',
        color: '#64748b'
    },
    link: { 
        color: '#3b82f6', 
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.2s'
    },
    error: { 
        color: '#dc2626', 
        marginTop: '12px', 
        fontSize: '14px',
        backgroundColor: '#fef2f2',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #fecaca'
    }
};