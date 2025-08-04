'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PROFILE_API = 'http://localhost:8000/api/buyer/profile/';
const SEND_OTP_API = 'http://localhost:8000/user/buyer/send-otp/';
const VERIFY_OTP_API = 'http://localhost:8000/user/buyer/verify-otp/';

export default function ProfilePage() {
    const [buyer, setBuyer] = useState(null);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('buyerAccessToken');
        if (!token) {
            router.push('/login/buyer');
            return null;
        }
        // ✅ Use 'Bearer' for JWT, which is what buyers use
        return { 'Authorization': `Bearer ${token}` };
    }, [router]);

    // Fetch buyer profile to check verification status
    const fetchProfile = useCallback(() => {
        const headers = getAuthHeaders();
        if (!headers) return;

        axios.get(PROFILE_API, { headers })
            .then(res => {
                setBuyer(res.data);
                if (res.data.phone_number) {
                    setPhone(res.data.phone_number);
                }
            })
            .catch(err => console.error("Failed to fetch profile", err))
            .finally(() => setIsLoading(false));
    }, [getAuthHeaders]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSendOtp = async () => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            await axios.post(SEND_OTP_API, { phone }, { headers });
            setOtpSent(true);
        } catch (error) {
            console.error("Failed to send OTP", error);
            alert("Failed to send OTP. Please check the phone number and try again.");
        }
    };

    const handleVerifyOtp = async () => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            await axios.post(VERIFY_OTP_API, { otp }, { headers });
            alert('Verification successful!');
            fetchProfile(); // Refresh profile to show verified status
        } catch (error) {
            alert('Invalid OTP. Please try again.');
        }
    };

    if (isLoading) {
        return <p style={{textAlign: 'center', marginTop: '50px'}}>Loading profile...</p>;
    }

    if (buyer?.phone_verified) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2>Profile Verified</h2>
                    <p>Your phone number is verified. You can now make purchases.</p>
                    <Link href="/shop" style={styles.button}>
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Verify Your Phone Number</h2>
                <p>A final step is required before you can start shopping.</p>
                
                {!otpSent ? (
                    <div style={styles.formGroup}>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter your 10-digit phone number" style={styles.input} />
                        <button onClick={handleSendOtp} style={styles.button}>Send OTP</button>
                    </div>
                ) : (
                    <div style={styles.formGroup}>
                        <p>An OTP has been sent to {phone}.</p>
                        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 4-digit OTP" style={styles.input} />
                        <button onClick={handleVerifyOtp} style={styles.button}>Verify</button>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '400px', maxWidth: '90%' },
    formGroup: { marginTop: '20px' },
    input: { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1rem', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
};