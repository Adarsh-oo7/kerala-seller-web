'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Globe,
  RefreshCw,
  Shield
} from 'lucide-react';

// ✅ Enhanced API base URL handling
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  return 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const SEND_RESET_OTP_API = `${API_BASE_URL}/user/buyer/password-reset/send-otp/`;
const VERIFY_RESET_OTP_API = `${API_BASE_URL}/user/buyer/password-reset/verify/`;

console.log('🌐 Forgot Password API URLs configured:', { 
  API_BASE_URL, 
  SEND_RESET_OTP_API, 
  VERIFY_RESET_OTP_API 
});

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
    const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });
    const [otpSentTime, setOtpSentTime] = useState(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    
    const router = useRouter();
    const searchParams = useSearchParams();

    // ✅ Get current store info and redirect URL from URL parameters
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
            setCurrentStoreInfo({
                storeId: storeMatch ? storeMatch[1] : null,
                isInStore: !!storeMatch
            });

            // Pre-fill email if provided in URL params
            const emailParam = searchParams.get('email');
            if (emailParam) {
                setEmail(emailParam);
            }
        }
    }, [searchParams]);

    // ✅ Resend cooldown timer
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const getPasswordStrength = (password) => {
        if (password.length < 8) return { level: 0, text: 'Too short' };
        
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        if (score <= 2) return { level: 1, text: 'Weak' };
        if (score <= 3) return { level: 2, text: 'Medium' };
        return { level: 3, text: 'Strong' };
    };

    const showMessage = (msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 6000);
    };

    // ✅ Enhanced email submission with better error handling
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setErrors({});
        
        if (!email.trim()) {
            setErrors({ email: 'Email is required' });
            return;
        }
        
        if (!validateEmail(email.trim())) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        setIsLoading(true);
        
        try {
            console.log('📧 Sending OTP to:', email.trim());
            
            const response = await axios.post(SEND_RESET_OTP_API, { 
                email: email.trim().toLowerCase() 
            }, {
                timeout: 15000
            });
            
            console.log('✅ OTP sent successfully:', response.data);
            
            setOtpSentTime(new Date());
            setResendCooldown(60); // 60 second cooldown
            showMessage(`An OTP has been sent to ${email.trim()}. Please check your inbox and spam folder.`, 'success');
            setStep(2);
            
        } catch (err) {
            console.error('❌ OTP send error:', err);
            
            let errorMessage = 'Could not send OTP. Please try again.';
            
            if (err.response?.status === 404) {
                errorMessage = 'No account found with this email address. Please check your email or create a new account.';
            } else if (err.response?.status === 429) {
                errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please check your connection and try again.';
            } else if (err.response?.data) {
                errorMessage = err.response.data.error || 
                             err.response.data.message || 
                             err.response.data.detail || 
                             errorMessage;
            }
            
            showMessage(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Enhanced password reset with comprehensive validation
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrors({});
        
        const newErrors = {};
        
        if (!otp.trim()) {
            newErrors.otp = 'OTP is required';
        } else if (otp.trim().length !== 6) {
            newErrors.otp = 'OTP must be exactly 6 digits';
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
            console.log('🔐 Resetting password for:', email.trim());
            
            const response = await axios.post(VERIFY_RESET_OTP_API, { 
                email: email.trim().toLowerCase(), 
                otp: otp.trim(), 
                password: password
            }, {
                timeout: 15000
            });
            
            console.log('✅ Password reset successful:', response.data);
            
            showMessage('Password has been reset successfully! Redirecting to login...', 'success');
            
            // ✅ Store-aware redirect
            setTimeout(() => {
                const redirectUrl = searchParams.get('redirect');
                if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
                    router.push(`/store/${currentStoreInfo.storeId}/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`);
                } else {
                    router.push(`/login/buyer${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`);
                }
            }, 2500);
            
        } catch (err) {
            console.error('❌ Password reset error:', err);
            
            let errorMessage = 'Failed to reset password. Please try again.';
            
            if (err.response?.status === 400) {
                errorMessage = 'Invalid or expired OTP. Please request a new OTP.';
            } else if (err.response?.status === 429) {
                errorMessage = 'Too many attempts. Please wait before trying again.';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please try again.';
            } else if (err.response?.data) {
                errorMessage = err.response.data.error || 
                             err.response.data.message || 
                             err.response.data.detail || 
                             errorMessage;
            }
            
            showMessage(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Enhanced resend OTP with cooldown
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        
        setIsLoading(true);
        
        try {
            console.log('🔄 Resending OTP to:', email.trim());
            
            await axios.post(SEND_RESET_OTP_API, { 
                email: email.trim().toLowerCase() 
            }, {
                timeout: 15000
            });
            
            setOtpSentTime(new Date());
            setResendCooldown(60);
            showMessage('OTP has been resent to your email. Please check your inbox.', 'success');
            
        } catch (err) {
            console.error('❌ OTP resend error:', err);
            showMessage('Failed to resend OTP. Please try again later.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Store-aware back link
    const getBackLink = () => {
        const redirectUrl = searchParams.get('redirect');
        if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
            return `/store/${currentStoreInfo.storeId}/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`;
        }
        return `/login/buyer${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`;
    };

    const passwordStrength = password ? getPasswordStrength(password) : null;

    return (
        <div style={styles.pageContainer}>
            <Header />
            
            <div style={styles.container}>
                <div style={styles.card}>
                    {/* ✅ Store context indicator */}
                    {currentStoreInfo.isInStore && (
                        <div style={styles.storeIndicator}>
                            <Globe size={16} />
                            <span>Store context: {currentStoreInfo.storeId}</span>
                        </div>
                    )}

                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.iconContainer}>
                            <KeyRound size={32} color="#3b82f6" />
                        </div>
                        <h1 style={styles.title}>Reset Your Password</h1>
                        <p style={styles.subtitle}>
                            {step === 1 
                                ? "Enter your email to receive a secure password reset code" 
                                : "Enter the verification code and create a new secure password"
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
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errors.email) {
                                            setErrors(prev => ({ ...prev, email: '' }));
                                        }
                                    }}
                                    placeholder="Enter your registered email address" 
                                    style={{
                                        ...styles.input,
                                        ...(errors.email ? styles.inputError : {})
                                    }}
                                    disabled={isLoading}
                                    autoFocus
                                />
                                {errors.email && (
                                    <span style={styles.errorText}>{errors.email}</span>
                                )}
                                <div style={styles.inputHint}>
                                    We'll send a 6-digit verification code to this email
                                </div>
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
                                        Send Verification Code
                                    </span>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Enter OTP & New Password */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} style={styles.form}>
                            <div style={styles.emailDisplay}>
                                <Mail size={16} />
                                <span>Code sent to: <strong>{email}</strong></span>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <KeyRound size={16} />
                                    Verification Code
                                </label>
                                <input 
                                    type="text" 
                                    value={otp} 
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        setOtp(value);
                                        if (errors.otp) {
                                            setErrors(prev => ({ ...prev, otp: '' }));
                                        }
                                    }}
                                    placeholder="Enter 6-digit code" 
                                    style={{
                                        ...styles.input,
                                        ...(errors.otp ? styles.inputError : {}),
                                        textAlign: 'center',
                                        letterSpacing: '0.1em',
                                        fontSize: '1.2rem'
                                    }}
                                    maxLength={6}
                                    disabled={isLoading}
                                    autoFocus
                                />
                                {errors.otp && (
                                    <span style={styles.errorText}>{errors.otp}</span>
                                )}
                                
                                <div style={styles.resendContainer}>
                                    {resendCooldown > 0 ? (
                                        <span style={styles.cooldownText}>
                                            Resend in {resendCooldown}s
                                        </span>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={handleResendOtp}
                                            style={styles.resendButton}
                                            disabled={isLoading}
                                        >
                                            <RefreshCw size={14} />
                                            Resend Code
                                        </button>
                                    )}
                                </div>
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
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) {
                                                setErrors(prev => ({ ...prev, password: '' }));
                                            }
                                        }}
                                        placeholder="Create a strong password (min 8 chars)" 
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
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span style={styles.errorText}>{errors.password}</span>
                                )}
                                
                                {/* ✅ Password strength indicator */}
                                {password && (
                                    <div style={styles.passwordStrength}>
                                        <div style={styles.strengthBar}>
                                            <div 
                                                style={{
                                                    ...styles.strengthFill,
                                                    width: `${(passwordStrength?.level || 0) * 33.33}%`,
                                                    backgroundColor: 
                                                        passwordStrength?.level === 1 ? '#ef4444' :
                                                        passwordStrength?.level === 2 ? '#f59e0b' :
                                                        passwordStrength?.level === 3 ? '#10b981' : '#e5e7eb'
                                                }}
                                            ></div>
                                        </div>
                                        <span style={styles.strengthText}>
                                            {passwordStrength?.text}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Shield size={16} />
                                    Confirm New Password
                                </label>
                                <div style={styles.passwordContainer}>
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword} 
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (errors.confirmPassword) {
                                                setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                            }
                                        }}
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
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <span style={styles.errorText}>{errors.confirmPassword}</span>
                                )}
                                
                                {/* ✅ Password match indicator */}
                                {confirmPassword && password && (
                                    <div style={styles.passwordMatch}>
                                        {password === confirmPassword ? (
                                            <span style={styles.matchSuccess}>
                                                <CheckCircle size={14} />
                                                Passwords match
                                            </span>
                                        ) : (
                                            <span style={styles.matchError}>
                                                <AlertCircle size={14} />
                                                Passwords don't match
                                            </span>
                                        )}
                                    </div>
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
                        <Link href={getBackLink()} style={styles.backLink}>
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                        {step === 2 && (
                            <button 
                                onClick={() => {
                                    setStep(1);
                                    setOtp('');
                                    setPassword('');
                                    setConfirmPassword('');
                                    setErrors({});
                                    setMessage('');
                                }} 
                                style={styles.changeEmailButton}
                                disabled={isLoading}
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
        maxWidth: '480px',
        border: '1px solid #e5e7eb',
        animation: 'fadeIn 0.6s ease-out'
    },

    // ✅ Store context indicator
    storeIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#dbeafe',
        border: '1px solid #3b82f6',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#1e40af',
        fontWeight: '500',
        marginBottom: '20px'
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

    // ✅ Email display in step 2
    emailDisplay: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '0.9rem',
        color: '#475569'
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
        outline: 'none'
    },

    inputHint: {
        fontSize: '0.8rem',
        color: '#6b7280',
        marginTop: '6px'
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

    // ✅ Resend container with cooldown
    resendContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '8px'
    },

    cooldownText: {
        fontSize: '0.875rem',
        color: '#9ca3af'
    },
    
    resendButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        cursor: 'pointer',
        fontSize: '0.875rem',
        padding: '4px 0',
        textDecoration: 'underline'
    },

    // ✅ Password strength indicator
    passwordStrength: {
        marginTop: '8px'
    },

    strengthBar: {
        width: '100%',
        height: '3px',
        backgroundColor: '#e5e7eb',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '4px'
    },

    strengthFill: {
        height: '100%',
        borderRadius: '2px',
        transition: 'all 0.3s ease'
    },

    strengthText: {
        fontSize: '0.8rem',
        color: '#6b7280'
    },

    // ✅ Password match indicator
    passwordMatch: {
        marginTop: '6px'
    },

    matchSuccess: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.8rem',
        color: '#059669'
    },

    matchError: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.8rem',
        color: '#dc2626'
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
