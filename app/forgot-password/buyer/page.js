'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { Mail, Lock, KeyRound, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const SEND_RESET_OTP_API = `${API_BASE_URL}/user/buyer/password-reset/send-otp/`;
const VERIFY_RESET_OTP_API = `${API_BASE_URL}/user/buyer/password-reset/verify/`;

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const showMessage = (msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setErrors({});
        
        if (!email) {
            setErrors({ email: 'Email is required' });
            return;
        }
        
        if (!validateEmail(email)) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(SEND_RESET_OTP_API, { email });
            showMessage(`An OTP has been sent to ${email}. Please check your inbox.`, 'success');
            setStep(2);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 
                               err.response?.data?.message || 
                               'Could not send OTP. Please check the email and try again.';
            showMessage(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrors({});
        
        const newErrors = {};
        
        if (!otp) {
            newErrors.otp = 'OTP is required';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(password)) {
            newErrors.password = 'Password must be at least 8 characters long';
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(VERIFY_RESET_OTP_API, { 
                email, 
                otp: otp.trim(), 
                password 
            });
            showMessage('Password has been reset successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                router.push('/login/buyer');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 
                               err.response?.data?.message || 
                               'Invalid OTP or failed to reset password. Please try again.';
            showMessage(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            await axios.post(SEND_RESET_OTP_API, { email });
            showMessage('OTP has been resent to your email.', 'success');
        } catch (err) {
            showMessage('Failed to resend OTP. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <Header />
            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.iconContainer}>
                            <KeyRound size={32} color="#3b82f6" />
                        </div>
                        <h1 style={styles.title}>Reset Your Password</h1>
                        <p style={styles.subtitle}>
                            {step === 1 
                                ? "Enter your email to receive a password reset OTP" 
                                : "Enter the OTP sent to your email and create a new password"
                            }
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div style={styles.progressContainer}>
                        <div style={styles.progressBar}>
                            <div 
                                style={{
                                    ...styles.progressFill,
                                    width: step === 1 ? '50%' : '100%'
                                }}
                            ></div>
                        </div>
                        <div style={styles.stepIndicator}>
                            Step {step} of 2
                        </div>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div style={{
                            ...styles.messageContainer,
                            ...(messageType === 'success' ? styles.successMessage : {}),
                            ...(messageType === 'error' ? styles.errorMessage : {})
                        }}>
                            {messageType === 'success' ? (
                                <CheckCircle size={20} />
                            ) : (
                                <AlertCircle size={20} />
                            )}
                            <span>{message}</span>
                        </div>
                    )}

                    {/* Step 1: Enter Email */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Mail size={16} />
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address" 
                                    style={{
                                        ...styles.input,
                                        ...(errors.email ? styles.inputError : {})
                                    }}
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <span style={styles.errorText}>{errors.email}</span>
                                )}
                            </div>
                            
                            <button 
                                type="submit" 
                                style={{
                                    ...styles.button,
                                    ...(isLoading ? styles.buttonLoading : {})
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span style={styles.buttonContent}>
                                        <div style={styles.spinner}></div>
                                        Sending OTP...
                                    </span>
                                ) : (
                                    <span style={styles.buttonContent}>
                                        <Mail size={18} />
                                        Send OTP
                                    </span>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Enter OTP & New Password */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <KeyRound size={16} />
                                    Verification Code (OTP)
                                </label>
                                <input 
                                    type="text" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit OTP" 
                                    style={{
                                        ...styles.input,
                                        ...(errors.otp ? styles.inputError : {})
                                    }}
                                    maxLength={6}
                                    disabled={isLoading}
                                />
                                {errors.otp && (
                                    <span style={styles.errorText}>{errors.otp}</span>
                                )}
                                <button 
                                    type="button" 
                                    onClick={handleResendOtp}
                                    style={styles.resendButton}
                                    disabled={isLoading}
                                >
                                    Resend OTP
                                </button>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Lock size={16} />
                                    New Password
                                </label>
                                <div style={styles.passwordContainer}>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password (min 8 characters)" 
                                        style={{
                                            ...styles.passwordInput,
                                            ...(errors.password ? styles.inputError : {})
                                        }}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span style={styles.errorText}>{errors.password}</span>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Lock size={16} />
                                    Confirm New Password
                                </label>
                                <div style={styles.passwordContainer}>
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your new password" 
                                        style={{
                                            ...styles.passwordInput,
                                            ...(errors.confirmPassword ? styles.inputError : {})
                                        }}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeButton}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <span style={styles.errorText}>{errors.confirmPassword}</span>
                                )}
                            </div>
                            
                            <button 
                                type="submit" 
                                style={{
                                    ...styles.button,
                                    ...(isLoading ? styles.buttonLoading : {})
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span style={styles.buttonContent}>
                                        <div style={styles.spinner}></div>
                                        Resetting Password...
                                    </span>
                                ) : (
                                    <span style={styles.buttonContent}>
                                        <Lock size={18} />
                                        Reset Password
                                    </span>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer Links */}
                    <div style={styles.footerLinks}>
                        <Link href="/login/buyer" style={styles.backLink}>
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                        {step === 2 && (
                            <button 
                                onClick={() => setStep(1)} 
                                style={styles.changeEmailButton}
                            >
                                Change Email
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <Footer />

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideProgress {
                    from { width: 0%; }
                    to { width: var(--target-width); }
                }
            `}</style>
        </div>
    );
}

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
    },
    
    container: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh', 
        padding: '20px' 
    },
    
    card: { 
        backgroundColor: 'white', 
        padding: '32px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
        width: '100%',
        maxWidth: '450px',
        border: '1px solid #e5e7eb',
        animation: 'fadeIn 0.6s ease-out'
    },
    
    header: {
        textAlign: 'center',
        marginBottom: '32px'
    },
    
    iconContainer: {
        width: '64px',
        height: '64px',
        backgroundColor: '#eff6ff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto'
    },
    
    title: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '8px'
    },
    
    subtitle: {
        fontSize: '0.95rem',
        color: '#6b7280',
        lineHeight: '1.5'
    },
    
    progressContainer: {
        marginBottom: '24px'
    },
    
    progressBar: {
        width: '100%',
        height: '4px',
        backgroundColor: '#e5e7eb',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '8px'
    },
    
    progressFill: {
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: '2px',
        transition: 'width 0.3s ease'
    },
    
    stepIndicator: {
        fontSize: '0.875rem',
        color: '#6b7280',
        textAlign: 'center'
    },
    
    messageContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '0.9rem',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        color: '#374151'
    },
    
    successMessage: {
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
        color: '#065f46'
    },
    
    errorMessage: {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
        color: '#991b1b'
    },
    
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    
    inputGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
    },
    
    input: { 
        width: '100%', 
        padding: '14px 16px', 
        border: '1px solid #d1d5db', 
        borderRadius: '8px', 
        fontSize: '1rem',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        outline: 'none',
        ':focus': {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
        }
    },
    
    passwordContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    
    passwordInput: {
        width: '100%', 
        padding: '14px 48px 14px 16px', 
        border: '1px solid #d1d5db', 
        borderRadius: '8px', 
        fontSize: '1rem',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        outline: 'none'
    },
    
    eyeButton: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#6b7280',
        padding: '4px',
        borderRadius: '4px'
    },
    
    inputError: {
        borderColor: '#ef4444'
    },
    
    errorText: {
        color: '#ef4444',
        fontSize: '0.875rem',
        marginTop: '6px'
    },
    
    resendButton: {
        alignSelf: 'flex-end',
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        cursor: 'pointer',
        fontSize: '0.875rem',
        marginTop: '8px',
        padding: '4px 0',
        textDecoration: 'underline'
    },
    
    button: { 
        width: '100%', 
        padding: '16px 24px', 
        border: 'none', 
        borderRadius: '8px', 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        cursor: 'pointer', 
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '52px'
    },
    
    buttonLoading: {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed'
    },
    
    buttonContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTop: '2px solid #ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    
    footerLinks: { 
        marginTop: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
    },
    
    backLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#3b82f6',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500'
    },
    
    changeEmailButton: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        fontSize: '0.9rem',
        textDecoration: 'underline'
    }
};
