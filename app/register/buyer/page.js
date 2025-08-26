'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';

const SEND_OTP_API = 'http://localhost:8000/user/buyer/register/send-otp/';
const REGISTER_API = 'http://localhost:8000/user/buyer/register/';

export default function BuyerRegisterPage() {
    const [step, setStep] = useState(1); // 1 for details, 2 for OTP
    const [formData, setFormData] = useState({ email: '', full_name: '', password: '', password2: '' });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        if (formData.password !== formData.password2) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }
        try {
            await axios.post(SEND_OTP_API, { email: formData.email });
            setStep(2); // Move to the OTP step
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const finalData = { ...formData, otp };
        try {
            const response = await axios.post(REGISTER_API, finalData);
            localStorage.setItem('buyerAccessToken', response.data.token);
            router.push('/profile');
        } catch (err) {
            setError(err.response?.data?.otp?.[0] || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2>Create Your Account</h2>
                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <p>Step 1: Enter your details</p>
                            <input type="text" name="full_name" onChange={handleChange} placeholder="Full Name" required style={styles.input} />
                            <input type="email" name="email" onChange={handleChange} placeholder="Email Address" required style={styles.input} />
                            <input type="password" name="password" onChange={handleChange} placeholder="Password" required style={styles.input} />
                            <input type="password" name="password2" onChange={handleChange} placeholder="Confirm Password" required style={styles.input} />
                            <button type="submit" style={styles.button} disabled={isLoading}>
                                {isLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            <p>Step 2: Enter the OTP sent to {formData.email}</p>
                            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-Digit OTP" required style={styles.input} />
                            <button type="submit" style={styles.button} disabled={isLoading}>
                                {isLoading ? 'Verifying...' : 'Create Account'}
                            </button>
                        </form>
                    )}
                    {error && <p style={styles.error}>{error}</p>}
                    <div style={styles.footerLinks}>
                        <Link href="/login/buyer" style={styles.link}>Already have an account? Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center', maxWidth: '90%' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', border: 'none', borderRadius: '5px', backgroundColor: '#0d6efd', color: 'white', cursor: 'pointer', fontSize: '1rem' },
    footerLinks: { marginTop: '20px', fontSize: '0.9rem' },
    link: { color: '#0d6efd', textDecoration: 'none' },
    error: { color: 'red', marginTop: '10px', fontSize: '0.9rem' },
};
