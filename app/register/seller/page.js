// 'use client' directive is important for Next.js to treat this as a client-side component
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import "../../../styles/Registerseller.css";
import { requestError } from '../../../lib/requestError';

// Import Firebase Authentication modules
import { auth } from '../../../firebase';
import {
    PhoneAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "firebase/auth";

// Import Lucide icons
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

// Enhanced API configuration
// const getApiBaseUrl = () => {
//     const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
//     if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
//         return envUrl.trim();
//     }
//     if (process.env.NODE_ENV === 'development') {
//         return 'https://api.keralasellers.in';
//     }
//     return 'https://api.keralasellers.in';
// };

// const API_BASE_URL = 'https://api.keralasellers.in';
// const REGISTER_API = `${API_BASE_URL}/user/register/`;
// const CHECK_EXISTS_API = `${API_BASE_URL}/user/check-exists/`; // âœ… NEW

// console.log(' Registration API URLs:', { API_BASE_URL, REGISTER_API, CHECK_EXISTS_API });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     'https://api.keralasellers.in';

const REGISTER_API = `${API_BASE_URL}/user/register/`;
const CHECK_EXISTS_API = `${API_BASE_URL}/user/check-exists/`;

console.log(' Seller Register:', { 
  API_BASE_URL, 
  LOCAL: process.env.NEXT_PUBLIC_API_BASE_URL,
  REGISTER_API 
});



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

    // Firebase specific states
    const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Initialize reCAPTCHA Verifier
    useEffect(() => {
        if (typeof window !== 'undefined' && !recaptchaVerifier) {
            try {
                // Check if container exists and is empty
                const container = document.getElementById('recaptcha-container');
                if (container && container.innerHTML === '' && auth) {
                    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                        'size': 'invisible',
                        'callback': (response) => {
                            console.log("reCAPTCHA callback fired!");
                        },
                        'expired-callback': () => {
                            console.log("reCAPTCHA expired!");
                            setError('Security check expired. Please try sending OTP again.');
                        }
                    });
                    
                    verifier.render().then((widgetId) => {
                        console.log("reCAPTCHA rendered with widget ID:", widgetId);
                        setRecaptchaVerifier(verifier);
                    }).catch(err => {
                        console.warn("reCAPTCHA render skipped or failed:", err);
                    });
                }
            } catch (e) {
                console.error("Error initializing reCAPTCHA:", e);
            }
        }
        
        return () => {
            // Clean up on unmount
            if (recaptchaVerifier) {
                try {
                    recaptchaVerifier.clear();
                } catch (e) {}
            }
        };
    }, [recaptchaVerifier]);

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
        } else if (/^\d+$/.test(formData.password)) {
            errors.password = 'Password cannot be only numbers. Add letters too.';
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

        if (name === 'phone') {
            const formattedValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: formattedValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        if (error) setError('');
    };

    // âœ… NEW: Check if seller exists before sending OTP
    const checkSellerExists = async () => {
        try {
            console.log(' Checking if seller exists...');
            
            const response = await axios.post(CHECK_EXISTS_API, {
                phone: formData.phone.trim(),
                email: formData.email.trim()
            }, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(' Check result:', response.data);
            return response.data;

        } catch (err) {
            console.error(' Check seller exists failed:', err);
            throw new Error('Failed to verify availability. Please try again.');
        }
    };

    // ðŸ”¥ UPDATED: Check first, then send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            setError('Please fix the errors above');
            return;
        }

        if (!recaptchaVerifier) {
            setError('Security check (reCAPTCHA) not initialized. Please refresh the page and try again.');
            return;
        }

        setIsLoading(true);

        try {
            // âœ… STEP 1: Check if phone/email already exists
            console.log(' Step 1: Checking if seller already exists...');
            
            const checkResult = await checkSellerExists();
            
            if (checkResult.exists) {
                // âŒ Phone or email already exists
                console.log(' Seller already exists:', checkResult.field);
                
                if (checkResult.field === 'phone') {
                    setValidationErrors(prev => ({
                        ...prev,
                        phone: checkResult.message || 'This phone number is already registered'
                    }));
                    setError('This phone number is already registered. Please login instead.');
                } else if (checkResult.field === 'email') {
                    setValidationErrors(prev => ({
                        ...prev,
                        email: checkResult.message || 'This email is already registered'
                    }));
                    setError('This email is already registered. Please use a different email.');
                }
                
                setIsLoading(false);
                return;
            }

            // âœ… STEP 2: Phone and email are available - Send Firebase OTP
            console.log(' Phone and email available. Sending Firebase OTP...');
            
            const phoneNumber = `+91${formData.phone.trim()}`;
            console.log(' Sending OTP via Firebase for phone:', phoneNumber);

            const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
            setConfirmationResult(result);
            console.log(' OTP sent successfully via Firebase');
            setStep(2);

        } catch (err) {
            console.error(' Error:', err);
            let errorMessage = 'Failed to send OTP. Please try again.';

            if (err.code === 'auth/invalid-phone-number') {
                errorMessage = 'The phone number provided is invalid. Please check the format.';
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Too many OTP requests. Please try again later.';
                if (recaptchaVerifier) recaptchaVerifier.clear();
            } else if (err.code === 'auth/captcha-check-failed' || err.code === 'auth/web-storage-unsupported') {
                errorMessage = 'Security verification failed. Please ensure cookies are enabled or try in a regular browser window.';
                if (recaptchaVerifier) recaptchaVerifier.clear();
            } else if (err.code === 'auth/internal-error') {
                errorMessage = 'Firebase internal error. Please try again.';
            } else {
                errorMessage = requestError(err, 'Failed to send OTP. Check your internet and try again.');
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteRegistration = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        if (!confirmationResult) {
            setError('OTP verification flow was not initiated. Please go back and send OTP.');
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await confirmationResult.confirm(formData.otp.trim());
            const user = userCredential.user;

            const firebaseIdToken = await user.getIdToken();
            console.log(' Firebase OTP verified successfully. User UID:', user.uid);
            console.log(' Firebase ID Token obtained.');

            const registrationData = {
                phone: formData.phone.trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                name: formData.name.trim(),
                shop_name: formData.shop_name.trim(),
                email: formData.email.trim(),
                firebase_id_token: firebaseIdToken,
            };

            console.log(' Sending registration data to Django:', {
                ...registrationData,
                password: '***hidden***',
                firebase_id_token: '***hidden***'
            });

            const response = await axios.post(REGISTER_API, registrationData, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(' Registration successful (Django response):', response.data);

            const token = response.data.access_token || response.data.token || response.data.access;
            if (token) {
              localStorage.setItem('accessToken', token);
              localStorage.setItem('access_token', token);
              if (response.data.seller) {
                localStorage.setItem('sellerInfo', JSON.stringify(response.data.seller));
              }
              setError('');
              router.push('/dashboard/seller/settings');
              return;
            }

            setError('');
            router.push('/login/seller?message=Shop created. Sign in with your phone and password.');

        } catch (err) {
            console.error(' Firebase OTP or Django registration error:', err);
            let errorMessage = 'Registration failed. Please try again.';

            if (err.code === 'auth/invalid-verification-code') {
                errorMessage = 'The OTP you entered is incorrect or expired.';
            } else if (err.code === 'auth/code-expired') {
                errorMessage = 'The verification code has expired. Please resend OTP.';
            } else if (err.response?.data?.error) {
                const errorData = err.response?.data;
                if (errorData.error.includes('seller account already exists')) {
                    errorMessage = 'A seller account with this phone number already exists. Please try logging in instead.';
                } else if (errorData.error.includes('UNIQUE constraint')) {
                    errorMessage = 'An account with this information already exists. Please check your details or try logging in.';
                } else {
                    errorMessage = errorData.error;
                }
            } else if (err.response?.status === 400) {
                errorMessage = requestError(err, 'Check the shop details. Password must be 8+ characters and not a common word.');
                const data = err.response?.data || {};
                const next = {};
                ['name', 'shop_name', 'email', 'phone', 'password'].forEach((key) => {
                  if (Array.isArray(data[key]) && data[key][0]) next[key] = String(data[key][0]);
                  else if (typeof data[key] === 'string') next[key] = data[key];
                });
                if (Object.keys(next).length) setValidationErrors((prev) => ({ ...prev, ...next }));
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please check your connection and try again.';
            } else {
                errorMessage = requestError(err, 'Registration failed. Check your internet and try again.');
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setIsLoading(true);

        if (!recaptchaVerifier) {
            setError('Security check (reCAPTCHA) not initialized. Please refresh the page and try again.');
            setIsLoading(false);
            return;
        }

        try {
            const phoneNumber = `+91${formData.phone.trim()}`;
            const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
            setConfirmationResult(result);
            console.log(' New OTP sent successfully via Firebase');
            setError('OTP has been resent to your phone');
        } catch (err) {
            console.error(' Firebase Resend OTP error:', err);
            let errorMessage = 'Failed to resend OTP. Please try again.';
            if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Too many OTP resend attempts. Please wait before trying again.';
            } else if (err.code === 'auth/captcha-check-failed' || err.code === 'auth/web-storage-unsupported') {
                errorMessage = 'Security verification failed. Please ensure cookies are enabled or try in a regular browser window.';
                if (recaptchaVerifier) recaptchaVerifier.clear();
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // const handleBackToStep1 = () => {
    //     setStep(1);
    //     setFormData(prev => ({ ...prev, otp: '' }));
    //     setError('');
    //     if (recaptchaVerifier) {
    //         recaptchaVerifier.clear();
    //         setRecaptchaVerifier(null);
    //     }
    // };

    return (
        <div style={styles.pageContainer}>
            <Header />

            <div id="recaptcha-container" style={{ display: 'none' }}></div>

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
                                disabled={isLoading || !recaptchaVerifier}
                            >
                                {isLoading ? (
                                    <span style={styles.buttonContent}>
                                        <div style={styles.spinner}></div>
                                        Checking availability...
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
                        /* Step 2: OTP Verification - SAME AS BEFORE */
                        <form onSubmit={handleCompleteRegistration} style={styles.form}>
                            <div className='regsellerotpinfo' style={styles.otpInfo}>
                                <Phone size={20} color='#1a4845' />
                                <div>
                                    <p className='regsellerotptext' style={styles.otpText}>
                                        Verification code sent to:
                                    </p>
                                    <strong className='regsellerotptext' style={styles.otpPhone}>+91 {formData.phone}</strong>
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    <Shield size={16} />
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    className='sellerregisterverificationinput'
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
                                        Creating Account...
                                    </span>
                                ) : (
                                    <span style={styles.buttonContent}>
                                        <CheckCircle size={18} />
                                        Create Seller Account
                                    </span>
                                )}
                            </button>

                            {/* <button
                                type="button"
                                className='sellerregisterbacktodetailbtn'
                                onClick={handleBackToStep1}
                                style={styles.backButton}
                                disabled={isLoading}
                            >
                                <ArrowLeft size={16} />
                                Back to Details
                            </button> */}
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

            {/* Spinner keyframe animation */}
            <style jsx global>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// Your CSS-in-JS styles
const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#FDFFF0'
    },
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
        border: '1px solid #ef4444'
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
    otpPhone: {
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
        fontSize: '13px',
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



