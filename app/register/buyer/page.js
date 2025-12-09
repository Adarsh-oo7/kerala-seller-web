'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import "../../../styles/RegisterBuyer.css";

import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Shield,
    ArrowLeft,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL || 'https://api.keralasellers.in';
const SEND_OTP_API = `${API_BASE_URL}/user/buyer/register/send-otp/`;
const REGISTER_API = `${API_BASE_URL}/user/buyer/register/`;

export default function BuyerRegisterPage() {
    const [step, setStep] = useState(1); // 1 for details, 2 for OTP
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        password: '',
        password2: ''
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const router = useRouter();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.full_name.trim()) {
            errors.full_name = 'Full name is required';
        } else if (formData.full_name.trim().length < 2) {
            errors.full_name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (!formData.password2) {
            errors.password2 = 'Please confirm your password';
        } else if (formData.password !== formData.password2) {
            errors.password2 = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear general error
        if (error) setError('');
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            setError('Please fix the errors above');
            return;
        }

        setIsLoading(true);

        try {
            await axios.post(SEND_OTP_API, {
                email: formData.email.trim(),
                full_name: formData.full_name.trim()
            });
            setStep(2); // Move to the OTP step
        } catch (err) {
            console.error('OTP send error:', err);
            const errorMessage = err.response?.data?.error ||
                err.response?.data?.message ||
                err.response?.data?.email?.[0] ||
                'Failed to send OTP. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        const finalData = {
            ...formData,
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            otp: otp.trim()
        };

        try {
            const response = await axios.post(REGISTER_API, finalData);

            // Store token and redirect
            localStorage.setItem('buyerAccessToken', response.data.token);

            // Show success message briefly before redirect
            setError('');
            setTimeout(() => {
                router.push('/profile');
            }, 1000);

        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.otp?.[0] ||
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Registration failed. Please check your OTP and try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setIsLoading(true);

        try {
            await axios.post(SEND_OTP_API, {
                email: formData.email.trim(),
                full_name: formData.full_name.trim()
            });
            setError('OTP has been resent to your email');
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setOtp('');
        setError('');
    };

    return (
        <div style={styles.pageContainer}>
            <Header />
            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div className='buyerregistericoncontainer' style={styles.iconContainer}>
                            <User className='buyerregistericonsize' size={32} color="#1a4845" />
                        </div>
                        <h1 className='buyerregistercardtitle' style={styles.title}>Create Your Account</h1>
                        <p className='buyerregistercardsubtitle' style={styles.subtitle}>
                            {step === 1
                                ? "Join Kerala Sellers and start shopping from local stores"
                                : "We've sent a verification code to your email"}
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

                    {step === 1 ? (
                        /* Step 1: Personal Details */
                        <form onSubmit={handleSendOtp} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <div style={styles.inputWrapper}>
                                    <User size={18} style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                        style={{
                                            ...styles.input,
                                            ...(validationErrors.full_name ? styles.inputError : {})
                                        }}
                                        className='buyerregisterinput'
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.full_name && (
                                    <span style={styles.errorText}>{validationErrors.full_name}</span>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                <div style={styles.inputWrapper}>
                                    <Mail size={18} style={styles.inputIcon} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email address"
                                        required
                                        style={{
                                            ...styles.input,
                                            ...(validationErrors.email ? styles.inputError : {})
                                        }}
                                        className='buyerregisterinput'
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.email && (
                                    <span style={styles.errorText}>{validationErrors.email}</span>
                                )}
                            </div>

                            <div style={styles.inputGroup}>

                                <div style={styles.passwordContainer}>
                                    {/* <div style={styles.inputWrapper}> */}
                                    <Lock size={18} style={styles.inputIcon} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password "
                                        required
                                        style={{
                                            ...styles.passwordInput,
                                            ...(validationErrors.password ? styles.inputError : {})
                                        }}
                                        className='buyerregisterpasswordinput'
                                        disabled={isLoading}
                                    />
                                    {/* </div> */}
                                    <button
                                        type="button"
                                        className='buyerregistereye'
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {validationErrors.password && (
                                    <span style={styles.errorText}>{validationErrors.password}</span>
                                )}
                            </div>

                            <div style={styles.inputGroup}>

                                <div style={styles.passwordContainer}>
                                    {/* <div style={styles.inputWrapper}> */}
                                    <Lock size={18} style={styles.inputIcon} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="password2"
                                        value={formData.password2}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        required
                                        style={{
                                            ...styles.passwordInput,
                                            ...(validationErrors.password2 ? styles.inputError : {})
                                        }}
                                        className='buyerregisterpasswordinput'
                                        disabled={isLoading}
                                    />
                                    {/* </div> */}
                                    <button
                                        type="button"
                                        className='buyerregistereye'
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeButton}
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {validationErrors.password2 && (
                                    <span style={styles.errorText}>{validationErrors.password2}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className='buyerregistersigninbtn'
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
                                        <Shield size={18} />
                                        Send Verification OTP
                                    </span>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Step 2: OTP Verification */
                        <form onSubmit={handleRegister} style={styles.form}>
                            <div style={styles.otpInfo}>
                                <Mail size={20} color='#1a4845' />
                                <div style={styles.otpDetails}>
                                    <p style={styles.otpText}>
                                        Verification code sent to:
                                    </p>
                                    <strong style={styles.otpemail}>{formData.email}</strong>
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Shield size={16} />
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    className='buyerregisterverificationinput'
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit OTP"
                                    required
                                    style={{
                                        ...styles.input,
                                        ...styles.otpInput
                                    }}
                                    maxLength={6}
                                    disabled={isLoading}
                                />
                                <div style={styles.otpActions}>
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        style={styles.resendButton}
                                        disabled={isLoading}
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            </div>

                            <button
                                className='buyerregistersigninbtn'
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
                                        Creating Account...
                                    </span>
                                ) : (
                                    <span style={styles.buttonContent}>
                                        <CheckCircle size={18} />
                                        Create Account
                                    </span>
                                )}
                            </button>

                            <button
                            className='buyerregisterbacktodetailbtn'
                                type="button"
                                onClick={handleBackToStep1}
                                style={styles.backButton}
                                disabled={isLoading}
                            >
                                <ArrowLeft size={16} />
                                Back to Details
                            </button>
                        </form>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div style={styles.errorContainer}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Footer Links */}
                    <div style={styles.footerLinks}>
                        <Link href="/login/buyer" style={styles.link}>
                            Already have an account? Login
                        </Link>
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
        backgroundColor: '#FDFFF0'

    },

    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: '20px'
    },

    card: {
        backgroundImage: 'url("/assets/images/Shoppagebanner.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        backgroundAttachment: 'fixed',
        marginTop: '50px',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        width: '90%',
        maxWidth: '400px',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#fff',
        textAlign: 'center',
        zIndex: 2,
        transition: 'all 0.3s ease',
    },

    header: {
        textAlign: 'center',
        marginBottom: '32px'
    },

    iconContainer: {
        width: '64px',
        height: '64px',
        backgroundColor: '#FDFFF0',
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
        lineHeight: '1.5',
        margin: 0
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
        backgroundColor: '#1a4845',
        borderRadius: '2px',
        transition: 'width 0.3s ease'
    },

    stepIndicator: {
        fontSize: '0.875rem',
        color: '#6b7280',
        textAlign: 'center'
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
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: '#6b7280',
        zIndex: 1
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
        padding: '14px 16px 14px 48px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxSizing: 'border-box',
        fontSize: '15px',
        backgroundColor: '#FDFFF0',
        transition: 'all 0.2s ease',
        outline: 'none'
    },

    passwordInput: {
        width: '100%',
        padding: '14px 48px 14px 48px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxSizing: 'border-box',
        fontSize: '15px',
        backgroundColor: '#FDFFF0',
        transition: 'all 0.2s ease',
        outline: 'none'
    },

    passwordContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },



    eyeButton: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#1a4845',
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

    otpInfo: {
        display: 'flex',
        justifyContent: "center",
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0'
    },

    otpDetails: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center' // centers the text vertically with the icon
    },

    otpText: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        color: '#1a4845'
    },
    otpemail: {
        margin: '0 0 4px 0',
        fontSize: '0.9rem',
        color: '#1a4845'
    },


    otpInput: {
        textAlign: 'center',
        letterSpacing: '0.5em',
        fontSize: '1.2rem',
        fontWeight: '600'
    },

    otpActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '8px'
    },

    resendButton: {
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        cursor: 'pointer',
        fontSize: '0.85rem',
        padding: '4px 0'
    },

    button: {
        width: '100%',
        padding: '16px 24px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#1a4845',
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

    backButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        padding: '12px 16px',
        background: 'none',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        color: '#6b7280',
        cursor: 'pointer',
        fontSize: '0.9rem',
        marginTop: '8px'
    },

    errorContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        color: '#991b1b',
        fontSize: '0.9rem',
        marginTop: '16px'
    },

    footerLinks: {
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '14px'
    },

    link: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontWeight: '500'
    }
};

