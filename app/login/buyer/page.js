'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

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
        // If a user is already logged in, redirect them to their profile
        const token = localStorage.getItem('buyerAccessToken');
        if (token) {
            router.push('/profile');
        }
    }, [router]);

    const handleLoginSuccess = (token) => {
        localStorage.setItem('buyerAccessToken', token);
        router.push('/profile');
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

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2>Sign in to Your Account</h2>
                    
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
        </GoogleOAuthProvider>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center', maxWidth: '90%' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', border: 'none', borderRadius: '5px', backgroundColor: '#0d6efd', color: 'white', cursor: 'pointer', fontSize: '1rem' },
    divider: { margin: '20px 0', color: '#6c757d', textTransform: 'uppercase', fontSize: '0.8rem' },
    googleButtonWrapper: { display: 'flex', justifyContent: 'center' },
    footerLinks: { marginTop: '20px', fontSize: '0.9rem' },
    link: { color: '#0d6efd', textDecoration: 'none' },
    error: { color: 'red', marginTop: '10px', fontSize: '0.9rem' },
};