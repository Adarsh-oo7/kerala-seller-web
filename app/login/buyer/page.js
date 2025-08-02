'use client';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const LOGIN_API = 'http://localhost:8000/user/buyer/login/google/';

export default function BuyerLoginPage() {
    const router = useRouter();

    const handleGoogleSuccess = async (credentialResponse) => {
        // In a real app, you'd send the credentialResponse.credential (a JWT)
        // to your backend for verification. For this example, we'll simulate it.
        // const decoded = jwt_decode(credentialResponse.credential);
        const simulatedUserData = {
            email: 'buyer@example.com', // Replace with decoded.email
            name: 'Test Buyer' // Replace with decoded.name
        };

        try {
            const response = await axios.post(LOGIN_API, simulatedUserData);
            localStorage.setItem('buyerAccessToken', response.data.token);
            router.push('/profile'); // Redirect to profile to verify phone
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <div>
                    <h2>Sign in to Your Account</h2>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => console.log('Login Failed')}
                    />
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}