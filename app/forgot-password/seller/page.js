'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SEND_RESET_OTP_API = 'http://localhost:8000/user/password-reset/send-otp/';
const VERIFY_RESET_OTP_API = 'http://localhost:8000/user/password-reset/verify/';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            await axios.post(SEND_RESET_OTP_API, { phone });
            setMessage(`An OTP has been sent to ${phone}.`);
            setStep(2);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Could not send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            await axios.post(VERIFY_RESET_OTP_API, { phone, otp, password });
            alert('Password has been reset successfully! Please log in.');
            router.push('/login/seller');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Reset Your Password</h2>
                {message && <p style={styles.message}>{message}</p>}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <p style={styles.instructions}>Enter your phone number to receive a password reset OTP.</p>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-Digit Phone Number" required style={styles.input} />
                        <button type="submit" style={styles.button} disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" required style={styles.input} />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter New Password" required style={styles.input} />
                        <button type="submit" style={styles.button} disabled={isLoading}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
                <div style={styles.footer}>
                    <Link href="/login/seller" style={styles.link}>← Back to Login</Link>
                    <a href="mailto:support@keralasellers.com" style={styles.link}>Contact Support</a>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center', maxWidth: '90%' },
    instructions: { color: '#6c757d', marginBottom: '20px' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', border: 'none', borderRadius: '5px', backgroundColor: '#0d6efd', color: 'white', cursor: 'pointer', fontSize: '1rem' },
    footer: { marginTop: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' },
    link: { color: '#0d6efd', textDecoration: 'none' },
    message: { marginBottom: '15px', padding: '10px', borderRadius: '5px', backgroundColor: '#e9ecef', border: '1px solid #dee2e6' },
};