'use client';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode"; // ✅ Import the decoder

// IMPORTANT: This should be your actual Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "108580007778-ctbmb96tl44p2bj91k5l128glba9bb3m.apps.googleusercontent.com";
const LOGIN_API = 'http://localhost:8000/user/buyer/login/google/';

export default function BuyerLoginPage() {
    const router = useRouter();

    const handleGoogleSuccess = async (credentialResponse) => {
        // ✅ START: Decode the real user data from Google's token
        const decodedToken = jwtDecode(credentialResponse.credential);
        
        const userData = {
            email: decodedToken.email,
            name: decodedToken.name
        };
        // ✅ END: Decode the real user data

        try {
            // Send the real user data to your backend
            const response = await axios.post(LOGIN_API, userData);
            
            localStorage.setItem('buyerAccessToken', response.data.token);
            router.push('/profile'); // Redirect to profile for phone verification
        } catch (error) {
            console.error("Login failed", error);
            alert("Login with our backend failed. Please try again.");
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2>Sign In to Your Account</h2>
                    <p>Log in with your Google account to start shopping.</p>
                    <div style={styles.googleButtonWrapper}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                console.log('Google Login Failed');
                                alert('Google login failed. Please try again.');
                            }}
                        />
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '400px' },
    googleButtonWrapper: { marginTop: '20px', display: 'flex', justifyContent: 'center' }
};