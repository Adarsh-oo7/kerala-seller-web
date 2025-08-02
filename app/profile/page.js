'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

const PROFILE_API = 'http://localhost:8000/api/buyer/profile/'; // You'll need to create this endpoint
const SEND_OTP_API = 'http://localhost:8000/user/buyer/send-otp/';
const VERIFY_OTP_API = 'http://localhost:8000/user/buyer/verify-otp/';

export default function ProfilePage() {
    const [buyer, setBuyer] = useState(null);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // Fetch buyer profile to check verification status
    useEffect(() => {
        const token = localStorage.getItem('buyerAccessToken');
        // axios.get(PROFILE_API, { headers: { Authorization: `Token ${token}` }})
        //     .then(res => setBuyer(res.data));
    }, []);

    const handleSendOtp = async () => {
        const token = localStorage.getItem('buyerAccessToken');
        try {
            await axios.post(SEND_OTP_API, { phone }, { headers: { Authorization: `Token ${token}` }});
            setOtpSent(true);
        } catch (error) { console.error("Failed to send OTP", error); }
    };

    const handleVerifyOtp = async () => {
        const token = localStorage.getItem('buyerAccessToken');
        try {
            await axios.post(VERIFY_OTP_API, { otp }, { headers: { Authorization: `Token ${token}` }});
            alert('Verification successful!');
            // Refresh profile data
        } catch (error) { alert('Invalid OTP'); }
    };

    // if (buyer?.phone_verified) {
    //     return <div>Your phone is verified! You can now shop.</div>;
    // }

    return (
        <div>
            <h2>Verify Your Phone Number</h2>
            <p>Please enter your phone number to complete your profile.</p>
            
            {!otpSent ? (
                <div>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />
                    <button onClick={handleSendOtp}>Send OTP</button>
                </div>
            ) : (
                <div>
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" />
                    <button onClick={handleVerifyOtp}>Verify</button>
                </div>
            )}
        </div>
    );
}