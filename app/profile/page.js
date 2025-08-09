'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/common/Header'; // ✅ Import the Header
import Footer from '../../components/common/Footer'; // ✅ Import the Footer

// ==============================================================================
// CONSTANTS
// ==============================================================================
const PROFILE_API = 'http://localhost:8000/api/buyer/profile/';
const SEND_OTP_API = 'http://localhost:8000/user/buyer/send-otp/';
const VERIFY_OTP_API = 'http://localhost:8000/user/buyer/verify-otp/';

// ==============================================================================
// 1. UI SUB-COMPONENTS
// ==============================================================================

// --- Component for the Profile & Address Form ---
function ProfileForm({ formData, onFormChange, onProfileUpdate, isSaving }) {
  return (
    <form onSubmit={onProfileUpdate}>
      <div style={styles.formGroup}><label>Full Name</label><input type="text" name="full_name" value={formData.full_name} onChange={onFormChange} style={styles.input} /></div>
      <div style={styles.formGroup}><label>Address Line 1</label><input type="text" name="address_line_1" value={formData.address_line_1} onChange={onFormChange} style={styles.input} /></div>
      <div style={styles.formGroup}><label>Address Line 2</label><input type="text" name="address_line_2" value={formData.address_line_2} onChange={onFormChange} style={styles.input} /></div>
      <div style={styles.formGroup}><label>City</label><input type="text" name="city" value={formData.city} onChange={onFormChange} style={styles.input} /></div>
      <div style={styles.formGroup}><label>Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={onFormChange} style={styles.input} /></div>
      <button type="submit" style={styles.button} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}

// --- Component for the Phone Verification Flow ---
function PhoneVerification({ buyer, formData, onFormChange, otp, onOtpChange, onSendOtp, onVerifyOtp, otpSent }) {
  if (buyer?.phone_verified) {
    return (
      <div style={styles.verifiedSection}>
        <p>✅ Your phone ({buyer.phone_number}) is verified.</p>
      </div>
    );
  }

  return (
    <div>
      <h4>Verify Your Phone Number to Shop</h4>
      {!otpSent ? (
        <div style={styles.formGroup}>
          <label>Phone Number</label>
          <input type="tel" name="phone_number" value={formData.phone_number} onChange={onFormChange} placeholder="Enter 10-digit phone number" style={styles.input} />
          <button type="button" onClick={onSendOtp} style={styles.button}>Send OTP</button>
        </div>
      ) : (
        <div style={styles.formGroup}>
          <p>An OTP has been sent to {formData.phone_number}.</p>
          <input type="text" value={otp} onChange={onOtpChange} placeholder="Enter 4-digit OTP" style={styles.input} maxLength="4" />
          <button type="button" onClick={onVerifyOtp} style={styles.button}>Verify</button>
        </div>
      )}
    </div>
  );
}


// ==============================================================================
// 2. MAIN PAGE COMPONENT
// ==============================================================================

export default function ProfilePage() {
    const [buyer, setBuyer] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '', address_line_1: '', address_line_2: '',
        city: '', pincode: '', phone_number: ''
    });
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('buyerAccessToken');
        if (!token) {
            router.push('/login/buyer');
            return null;
        }
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
            .catch(err => {
                console.error("Failed to fetch profile:", err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('buyerAccessToken');
                    router.push('/login/buyer');
                }
            })
            .finally(() => setIsLoading(false));
    }, [getAuthHeaders, router]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const headers = getAuthHeaders();
        if (!headers) return;
        setIsSaving(true);
        try {
            await axios.patch(PROFILE_API, formData, { headers });
            alert('Profile updated successfully!');
            fetchProfile();
        } catch (error) {
            alert('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendOtp = async () => {
        const headers = getAuthHeaders();
        if (!headers || !formData.phone_number) return alert("Please enter a phone number.");
        try {
            await axios.post(SEND_OTP_API, { phone: formData.phone_number }, { headers });
            setOtpSent(true);
        } catch (error) {
            alert("Failed to send OTP. Please try again.");
        }
    };

    const handleVerifyOtp = async () => {
        const headers = getAuthHeaders();
        if (!headers || !otp) return alert("Please enter the OTP.");
        try {
            await axios.post(VERIFY_OTP_API, { otp }, { headers });
            alert('Verification successful!');
            fetchProfile();
            setOtpSent(false);
            setOtp('');
        } catch (error) {
            alert('Invalid OTP. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('buyerAccessToken');
        router.push('/');
    };

    if (isLoading) {
        return <div style={styles.container}><p style={styles.message}>Loading profile...</p></div>;
    }
    
    if (!buyer) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <p style={styles.message}>Could not load profile. Please try logging in again.</p>
                    <button onClick={() => router.push('/login/buyer')} style={styles.button}>Go to Login</button>
                </div>
            </div>
        );
    }

    return (
        <>
        <Header/>
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2>Your Profile</h2>
                    <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                </div>
                <p>Manage your personal information and shipping address.</p>
                
                <ProfileForm 
                    formData={formData}
                    onFormChange={handleFormChange}
                    onProfileUpdate={handleProfileUpdate}
                    isSaving={isSaving}
                />
                
                <hr style={styles.hr} />

                <PhoneVerification
                    buyer={buyer}
                    formData={formData}
                    onFormChange={handleFormChange}
                    otp={otp}
                    onOtpChange={e => setOtp(e.target.value)}
                    otpSent={otpSent}
                    onSendOtp={handleSendOtp}
                    onVerifyOtp={handleVerifyOtp}
                />

                <div style={styles.navigation}>
                    <Link href="/shop" style={styles.link}>← Back to Shop</Link>
                </div>
            </div>
        </div>
                </>

    );
}

// ==============================================================================
// 3. STYLES
// ==============================================================================
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px' },
    message: { textAlign: 'center', fontSize: '1.1rem', padding: '20px' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '450px', maxWidth: '90%' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    logoutButton: { padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '20px 0' },
    verifiedSection: { color: 'green', textAlign: 'center', fontSize: '1.1rem' },
    formGroup: { marginBottom: '15px', textAlign: 'left' },
    input: { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1rem', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', marginTop: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
    navigation: { marginTop: '20px', textAlign: 'center' },
    link: { color: '#0d6efd', textDecoration: 'none' },
};