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
    const [formData, setFormData] = useState({
        full_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        pincode: '',
        phone_number: ''
    });
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('buyerAccessToken');
        if (!token) {
            router.push('/login/buyer');
            return null;
        }
        // ✅ This is the corrected line for JWT authentication
        return { 'Authorization': `Bearer ${token}` };
    }, [router]);

    const fetchProfile = useCallback(() => {
        const headers = getAuthHeaders();
        if (!headers) return;

        setIsLoading(true);
        axios.get(PROFILE_API, { headers })
            .then(res => {
                setBuyer(res.data);
                setFormData({
                    full_name: res.data.full_name || '',
                    address_line_1: res.data.address_line_1 || '',
                    address_line_2: res.data.address_line_2 || '',
                    city: res.data.city || '',
                    pincode: res.data.pincode || '',
                    phone_number: res.data.phone_number || ''
                });
            })
            .catch(err => console.error("Failed to fetch profile", err))
            .finally(() => setIsLoading(false));
    }, [getAuthHeaders]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const headers = getAuthHeaders();
        if (!headers) return;
        setIsSaving(true);
        try {
            await axios.patch(PROFILE_API, formData, { headers });
            alert('Profile updated successfully!');
            fetchProfile(); // Refresh data
        } catch (error) {
            alert('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendOtp = async () => {
        const headers = getAuthHeaders();
        // Use the phone number from the form data
        if (!headers || !formData.phone_number) {
            alert("Please enter a phone number.");
            return;
        }
        try {
            await axios.post(SEND_OTP_API, { phone: formData.phone_number }, { headers });
            setOtpSent(true);
        } catch (error) {
            console.error("Failed to send OTP", error);
            alert("Failed to send OTP. Please try again.");
        }
    };

    const handleVerifyOtp = async () => {
        const headers = getAuthHeaders();
        if (!headers || !otp) {
            alert("Please enter the OTP.");
            return;
        }
        try {
            await axios.post(VERIFY_OTP_API, { otp }, { headers });
            alert('Verification successful!');
            fetchProfile(); // Refresh profile to show the new verified status
        } catch (error) {
            alert('Invalid OTP. Please try again.');
        }
    };

    if (isLoading) {
        return <p style={styles.message}>Loading profile...</p>;
    }
    
    if (!buyer) {
        return <p style={styles.message}>Could not load profile. Please try logging in again.</p>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Your Profile</h2>
                <p>Manage your personal information and shipping address.</p>
                
                <form onSubmit={handleProfileUpdate}>
                    <div style={styles.formGroup}><label>Full Name</label><input type="text" name="full_name" value={formData.full_name} onChange={handleFormChange} style={styles.input} /></div>
                    <div style={styles.formGroup}><label>Address Line 1</label><input type="text" name="address_line_1" value={formData.address_line_1} onChange={handleFormChange} style={styles.input} /></div>
                    <div style={styles.formGroup}><label>Address Line 2</label><input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleFormChange} style={styles.input} /></div>
                    <div style={styles.formGroup}><label>City</label><input type="text" name="city" value={formData.city} onChange={handleFormChange} style={styles.input} /></div>
                    <div style={styles.formGroup}><label>Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={handleFormChange} style={styles.input} /></div>
                    <button type="submit" style={styles.button} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
                
                <hr style={styles.hr} />

                {/* --- Phone Verification Section --- */}
                {buyer.phone_verified ? (
                    <div style={styles.verifiedSection}>
                        <p>✅ Your phone ({buyer.phone_number}) is verified.</p>
                    </div>
                ) : (
                    <div>
                        <h4>Verify Your Phone Number to Shop</h4>
                        {!otpSent ? (
                            <div style={styles.formGroup}>
                                <label>Phone Number</label>
                                <input type="tel" value={formData.phone_number} onChange={handleFormChange} name="phone_number" placeholder="Enter 10-digit phone number" style={styles.input} />
                                <button onClick={handleSendOtp} style={styles.button}>Send OTP</button>
                            </div>
                        ) : (
                            <div style={styles.formGroup}>
                                <p>An OTP has been sent to {formData.phone_number}.</p>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 4-digit OTP" style={styles.input} />
                                <button onClick={handleVerifyOtp} style={styles.button}>Verify</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px' },
    message: { textAlign: 'center', marginTop: '50px' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '450px', maxWidth: '90%' },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '20px 0' },
    verifiedSection: { color: 'green', textAlign: 'center' },
    formGroup: { marginBottom: '15px', textAlign: 'left' },
    input: { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1rem', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
};