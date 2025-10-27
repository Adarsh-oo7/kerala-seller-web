'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import "../../../styles/Registerseller.css";

import {
    Store,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Shield,
    ArrowLeft,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

// ✅ Enhanced API configuration
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
const SEND_OTP_API = `${API_BASE_URL}/user/send-otp/`;
const REGISTER_API = `${API_BASE_URL}/user/register/`;

console.log('🌐 Registration API URLs:', { API_BASE_URL, SEND_OTP_API, REGISTER_API });

export default function RegisterSellerPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
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

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        if (!formData.shop_name.trim()) {
            errors.shop_name = 'Shop name is required';
        } else if (formData.shop_name.trim().length < 2) {
            errors.shop_name = 'Shop name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            errors.phone = 'Please enter a valid 10-digit phone number (6-9xxxxxxxxx)';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Format phone number to remove non-digits
        if (name === 'phone') {
            const formattedValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: formattedValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }

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
            console.log('🔍 Sending OTP for phone:', formData.phone);

            const response = await axios.post(SEND_OTP_API, {
                phone: formData.phone.trim()
            }, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ OTP sent successfully');
            setStep(2);

        } catch (err) {
            console.error('❌ OTP send error:', err);
            console.error('❌ Error response:', err.response?.data);

            let errorMessage = 'Failed to send OTP. Please try again.';

            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.phone) {
                errorMessage = Array.isArray(err.response.data.phone)
                    ? err.response.data.phone[0]
                    : err.response.data.phone;
            } else if (err.response?.status === 400) {
                errorMessage = 'Invalid phone number format. Please check and try again.';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please check your connection and try again.';
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ FINAL FIX: Send exact fields that backend serializer expects
    const handleCompleteRegistration = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);

        try {
            // ✅ FIXED: Send exact fields that backend serializer expects
            const registrationData = {
                phone: formData.phone.trim(),
                password: formData.password,
                name: formData.name.trim(),  // ✅ 'name' not 'full_name'
                shop_name: formData.shop_name.trim(),
                email: formData.email.trim(),
                confirmPassword: formData.confirmPassword, // ✅ Include this field
                otp: formData.otp.trim(),
            };

            console.log('🔍 Sending registration data:', {
                ...registrationData,
                password: '***hidden***',
                confirmPassword: '***hidden***'
            });

            const response = await axios.post(REGISTER_API, registrationData, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Registration successful:', response.data);

            // Show success message and redirect
            setError(''); // Clear any errors
            setTimeout(() => {
                router.push('/login/seller?message=Registration successful! Please log in with your credentials.');
            }, 1500);

        } catch (err) {
            console.error('❌ Registration error:', err);
            console.error('❌ Error response:', err.response?.data);

            // ✅ Enhanced error handling for backend constraint errors
            const errorData = err.response?.data;
            let errorMessage = 'Registration failed. Please try again.';

            if (errorData?.error) {
                if (errorData.error.includes('seller account already exists')) {
                    errorMessage = 'A seller account with this phone number already exists. Please try logging in instead.';
                } else if (errorData.error.includes('UNIQUE constraint')) {
                    errorMessage = 'An account with this information already exists. Please check your details or try logging in.';
                } else {
                    errorMessage = errorData.error;
                }
            } else if (errorData?.phone?.[0]) {
                errorMessage = errorData.phone[0];
            } else if (errorData?.email?.[0]) {
                errorMessage = errorData.email[0];
            } else if (errorData?.otp?.[0]) {
                errorMessage = errorData.otp[0];
            } else if (errorData?.name?.[0]) {  // ✅ Handle 'name' field errors
                errorMessage = errorData.name[0];
            } else if (errorData?.shop_name?.[0]) {
                errorMessage = errorData.shop_name[0];
            } else if (errorData?.password?.[0]) {
                errorMessage = errorData.password[0];
            } else if (errorData?.confirmPassword?.[0]) {  // ✅ Handle confirmPassword errors
                errorMessage = errorData.confirmPassword[0];
            } else if (err.response?.status === 400) {
                errorMessage = 'Invalid registration data. Please check all fields and try again.';
            } else if (err.response?.status === 409) {
                errorMessage = 'An account with this phone number or email already exists.';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please check your connection and try again.';
            }

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
                phone: formData.phone.trim()
            }, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            setError(''); // Clear error first, then show success
            setTimeout(() => {
                setError('OTP has been resent to your phone');
            }, 100);

        } catch (err) {
            console.error('❌ Resend OTP error:', err);
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToStep1 = () => {
        setStep(1);
        setFormData(prev => ({ ...prev, otp: '' }));
        setError('');
    };

    return (
        <div style={styles.pageContainer}>
            <Header />

            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div className='sellerregistericoncontainer' style={styles.iconContainer}>
                            <Store className='sellerregistericonsize' size={32} color="#1a4845" />
                        </div>
                        <h1 className='sellerregistercardtitle' style={styles.title}>Create Seller Account</h1>
                        <p className='sellerregistercardsubtitle' style={styles.subtitle}>
                            {step === 1
                                ? "Join Kerala Sellers and start selling your products online"
                                : "We've sent a verification code to your phone"}
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
                        /* Step 1: Business Details */
                        <form onSubmit={handleSendOtp} style={styles.form}>
                            <div style={styles.inputGroup}>
                                {/* <label style={styles.label}>
                                    <User size={16} />
                                    Your Full Name
                                </label> */}
                                <div style={styles.inputWrapper}>
                                    <User className='sellerregistericons' size={18} style={styles.inputIcon} />
                                    <input
                                        className='sellerregisterinput'
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                        style={{
                                            ...styles.input,
                                            ...(validationErrors.name ? styles.inputError : {})
                                        }}
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.name && (
                                    <span style={styles.errorText}>{validationErrors.name}</span>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                {/* <label style={styles.label}>
                                    <Store size={16} />
                                    Shop Name
                                </label> */}
                                <div style={styles.inputWrapper}>
                                    <Store className='sellerregistericons' size={18} style={styles.inputIcon} />
                                    <input
                                        className='sellerregisterinput'
                                        type="text"
                                        name="shop_name"
                                        value={formData.shop_name}
                                        onChange={handleChange}
                                        placeholder="Enter your shop/business name"
                                        required
                                        style={{
                                            ...styles.input,
                                            ...(validationErrors.shop_name ? styles.inputError : {})
                                        }}
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.shop_name && (
                                    <span style={styles.errorText}>{validationErrors.shop_name}</span>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                {/* <label style={styles.label}>
                                    <Mail size={16} />
                                    Email Address
                                </label> */}
                                <div style={styles.inputWrapper}>
                                    <Mail className='sellerregistericons' size={18} style={styles.inputIcon} />
                                    <input
                                        className='sellerregisterinput'
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
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.email && (
                                    <span style={styles.errorText}>{validationErrors.email}</span>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                {/* <label style={styles.label}>
                                    <Phone size={16} />
                                    Phone Number
                                </label> */}
                                <div style={styles.phoneInputContainer}>
                                    <span className='sellerregistercountryocde' style={styles.countryCode}>+91</span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter 10-digit phone number"
                                        required
                                        className='sellerregistertelinput'
                                        style={{
                                            ...styles.phoneInput,
                                            ...(validationErrors.phone ? styles.inputError : {})
                                        }}
                                        maxLength={10}
                                        disabled={isLoading}
                                    />
                                </div>
                                {validationErrors.phone && (
                                    <span style={styles.errorText}>{validationErrors.phone}</span>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                {/* <label style={styles.label}>
                                    <Lock size={16} />
                                    Password
                                </label> */}
                                <div style={styles.passwordContainer}>
                                    <Lock className='sellerregistericons' size={18} style={styles.inputIcon} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a strong password"
                                        required
                                        className='sellerregisterpasswordinput'
                                        style={{
                                            ...styles.passwordInput,
                                            ...(validationErrors.password ? styles.inputError : {})
                                        }}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className='sellerregistereye'
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
                                {/* <label style={styles.label}>
                                    <Lock size={16} />
                                    Confirm Password
                                </label> */}
                                <div style={styles.passwordContainer}>
                                    <Lock className='sellerregistericons' size={18} style={styles.inputIcon} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        required
                                        className='sellerregisterpasswordinput'
                                        style={{
                                            ...styles.passwordInput,
                                            ...(validationErrors.confirmPassword ? styles.inputError : {})
                                        }}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className='sellerregistereye'
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeButton}
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {validationErrors.confirmPassword && (
                                    <span style={styles.errorText}>{validationErrors.confirmPassword}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className='sellerregistersigninbtn'
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
                        <form onSubmit={handleCompleteRegistration} style={styles.form}>
                            <div style={styles.otpInfo}>
                                <Phone size={20} />
                                <div>
                                    <p style={styles.otpText}>
                                        Verification code sent to:
                                    </p>
                                    <strong>+91 {formData.phone}</strong>
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Shield size={16} />
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        otp: e.target.value.replace(/\D/g, '').slice(0, 6)
                                    }))}
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
                                        Create Seller Account
                                    </span>
                                )}
                            </button>

                            <button
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
                        <Link href="/login/seller" style={styles.link}>
                            Already have an account? Login
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />

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
        minHeight: '100vh',
        padding: '20px'
    },

    card: {
        backgroundImage: 'url("/assets/images/T Shirts (1400 x 400 px) (7423 x 2810 px).jpg")',
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
        maxWidth: '480px',
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
        color: '#1a4845',
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
        padding: '14px 14px 14px 48px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '1rem',
        backgroundColor: '#FDFFF0',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        outline: 'none'
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

    // ✅ Enhanced phone input styling
    phoneInputContainer: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#FDFFF0',
        overflow: 'hidden'
    },

    countryCode: {
        padding: '14px 8px',
        backgroundColor: '#FDFFF0',
        borderRight: '1px solid #d1d5db',
        fontSize: '1rem',
        color: '#374151',
        fontWeight: '500'
    },

    phoneInput: {
        width: '100%',
        padding: '14px 14px 14px 8px',
        border: 'none',
        fontSize: '1rem',
        backgroundColor: '#FDFFF0',
        outline: 'none'
    },

    passwordContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    },

    passwordInput: {
        width: '100%',
        padding: '14px 14px 14px 48px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '1rem',
        backgroundColor: '#FDFFF0',
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

    otpInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0'
    },

    otpText: {
        margin: '0 0 4px 0',
        fontSize: '0.9rem',
        color: '#6b7280'
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
        fontSize: '0.875rem',
        textDecoration: 'underline',
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
        fontSize: '0.9rem'
    },

    link: {
        color: '#3b82f6',
        textDecoration: 'none',
        fontWeight: '500'
    }
};
