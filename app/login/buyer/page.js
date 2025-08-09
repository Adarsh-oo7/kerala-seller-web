'use client';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

const GOOGLE_CLIENT_ID = "108580007778-ctbmb96tl44p2bj91k5l128glba9bb3m.apps.googleusercontent.com";
const LOGIN_API = 'http://localhost:8000/user/buyer/login/google/';

export default function BuyerLoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');
    const router = useRouter();

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError('');
        setDebugInfo('Starting Google login process...');
        
        try {
            console.log('🔍 Google credential received');
            setDebugInfo('Google credential received, decoding...');
            
            const decodedToken = jwtDecode(credentialResponse.credential);
            console.log('🔍 Decoded Google token:', decodedToken);
            
            const userData = {
                email: decodedToken.email,
                name: decodedToken.name
            };

            console.log('🔍 Sending user data to backend:', userData);
            setDebugInfo(`Sending login request for: ${userData.email}`);

            const response = await axios.post(LOGIN_API, userData);
            
            console.log('🔍 Backend login response:', response.data);
            setDebugInfo('Backend response received, storing token...');
            
            // Check if token exists in response
            if (!response.data.token) {
                throw new Error('No token received from backend');
            }
            
            // Store the JWT token
            localStorage.setItem('buyerAccessToken', response.data.token);
            console.log('🔍 Token stored in localStorage');
            
            // Verify token was stored
            const storedToken = localStorage.getItem('buyerAccessToken');
            if (storedToken) {
                console.log('✅ Token verified in localStorage:', storedToken.substring(0, 30) + '...');
                setDebugInfo('Login successful! Redirecting to profile...');
                
                // Small delay to ensure token is saved
                setTimeout(() => {
                    router.push('/profile');
                }, 100);
            } else {
                throw new Error('Token was not saved to localStorage');
            }
            
        } catch (error) {
            console.error("❌ Login failed:", error);
            console.error("❌ Error response:", error.response?.data);
            setError(`Login failed: ${error.response?.data?.error || error.message}`);
            setDebugInfo(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const testTokenStorage = () => {
        // Test localStorage functionality
        try {
            localStorage.setItem('test', 'value');
            const test = localStorage.getItem('test');
            localStorage.removeItem('test');
            setDebugInfo(`LocalStorage test: ${test === 'value' ? 'Working' : 'Failed'}`);
        } catch (e) {
            setDebugInfo(`LocalStorage error: ${e.message}`);
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2>Sign In to Your Account</h2>
                    <p>Log in with your Google account to start shopping.</p>
                    
                    {error && (
                        <div style={styles.error}>
                            {error}
                        </div>
                    )}
                    
                    {debugInfo && (
                        <div style={styles.debug}>
                            {debugInfo}
                        </div>
                    )}
                    
                    {isLoading && (
                        <div style={styles.loading}>
                            Processing login...
                        </div>
                    )}
                    
                    <div style={styles.googleButtonWrapper}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                console.log('❌ Google Login Failed');
                                setError('Google login failed. Please try again.');
                            }}
                        />
                    </div>
                    
                    <div style={styles.testSection}>
                        <button onClick={testTokenStorage} style={styles.testButton}>
                            Test LocalStorage
                        </button>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}

const styles = {
    container: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#f0f2f5' 
    },
    card: { 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
        textAlign: 'center', 
        width: '450px',
        maxWidth: '90%'
    },
    googleButtonWrapper: { 
        marginTop: '20px', 
        display: 'flex', 
        justifyContent: 'center' 
    },
    error: {
        color: 'red',
        backgroundColor: '#fee',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        fontSize: '14px'
    },
    loading: {
        color: '#0d6efd',
        padding: '10px',
        marginBottom: '15px'
    },
    debug: {
        color: '#28a745',
        backgroundColor: '#d4edda',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        fontSize: '14px'
    },
    testSection: {
        marginTop: '20px'
    },
    testButton: {
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};
