'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SEND_OTP_API = 'http://localhost:8000/user/send-otp/';
const REGISTER_API = 'http://localhost:8000/user/register/';

export default function RegisterSellerPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        shop_name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        otp: '',
    });
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await axios.post(SEND_OTP_API, { phone: formData.phone });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteRegistration = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await axios.post(REGISTER_API, {
                name: formData.name,
                shop_name: formData.shop_name,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                otp: formData.otp,
            });
            alert('Registration successful! Please log in.');
            router.push('/login/seller');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.otp?.[0] || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Create a Seller Account</h2>
                {error && <p style={styles.error}>{error}</p>}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <p>Step 1: Enter your details to receive an OTP.</p>
                        <input type="text" name="name" placeholder="Your Full Name" onChange={handleChange} required style={styles.input} />
                        <input type="text" name="shop_name" placeholder="Your Shop Name" onChange={handleChange} required style={styles.input} />
                        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required style={styles.input} />
                        <input type="tel" name="phone" placeholder="10-Digit Phone Number" onChange={handleChange} required style={styles.input} />
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={styles.input} />
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required style={styles.input} />
                        <button type="submit" style={styles.button} disabled={isLoading}>
                            {isLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleCompleteRegistration}>
                        <p>Step 2: An OTP has been sent to <strong>{formData.phone}</strong>. Please enter it below.</p>
                        <input type="text" name="otp" placeholder="6-Digit OTP" onChange={handleChange} required style={styles.input} />
                        <button type="submit" style={styles.button} disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Create Account'}
                        </button>
                    </form>
                )}
                <div style={styles.footerLinks}>
                    <Link href="/login/seller" style={styles.link}>Already have an account? Login</Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center', maxWidth: '90%' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', border: 'none', borderRadius: '5px', backgroundColor: '#0d6efd', color: 'white', cursor: 'pointer', fontSize: '1rem' },
    footerLinks: { marginTop: '20px', fontSize: '0.9rem' },
    link: { color: '#0d6efd', textDecoration: 'none' },
    error: { color: 'red', marginTop: '10px', fontSize: '0.9rem', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '5px' },
};