'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import '../../../styles/Registerseller.css'
import {
  Phone,
  Lock,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  MessageSquare,
  Store,
  RefreshCw,
  Shield,
  Globe
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
// ✅ UPDATED: Use the new seller-specific phone-based endpoints
const SEND_RESET_OTP_API = `${API_BASE_URL}/user/seller/password-reset/send-otp/`;
const VERIFY_RESET_OTP_API = `${API_BASE_URL}/user/seller/password-reset/verify/`;

// ✅ Only log in development and after component mounts
const logApiUrls = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🌐 Seller Forgot Password API URLs configured:', {
      API_BASE_URL,
      SEND_RESET_OTP_API,
      VERIFY_RESET_OTP_API
    });
  }
};

// ✅ Loading fallback component
function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: '500'
        }}>Loading seller password reset...</p>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ✅ Main component wrapped for Suspense
function SellerForgotPasswordContent() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });

  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Get current store info and phone from URL parameters
  useEffect(() => {
    // Only log API URLs after component mounts
    logApiUrls();

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
      setCurrentStoreInfo({
        storeId: storeMatch ? storeMatch[1] : null,
        isInStore: !!storeMatch
      });

      // Pre-fill phone if provided in URL params or store context
      const phoneParam = searchParams.get('phone') || storeMatch?.[1];
      if (phoneParam && /^[6-9]\d{9}$/.test(phoneParam)) {
        setPhone(phoneParam);
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

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
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

  // ✅ Enhanced phone submission with better error handling
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!phone) {
      setErrors({ phone: 'Phone number is required' });
      return;
    }

    if (!validatePhone(phone)) {
      setErrors({ phone: 'Please enter a valid 10-digit phone number starting with 6-9' });
      return;
    }

    setIsLoading(true);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 Sending OTP to seller phone:', phone);
        console.log('🔗 Using endpoint:', SEND_RESET_OTP_API);
      }

      const response = await axios.post(SEND_RESET_OTP_API, {
        phone: phone.trim()
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ OTP sent successfully:', response.data);
      }

      setOtpSentTime(new Date());
      setResendCooldown(60);
      showMessage(`An OTP has been sent to +91 ${phone}. Please check your messages.`, 'success');
      setStep(2);

    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ OTP send error:', err);
        console.error('❌ Error response:', err.response?.data);
        console.error('❌ Error status:', err.response?.status);
      }

      let errorMessage = 'Could not send OTP. Please try again.';

      if (err.response?.status === 404) {
        errorMessage = 'No seller account found with this phone number. Please check your number and try registering first.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || 'Invalid phone number format. Please enter a valid 10-digit number.';
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
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Resetting password for seller:', phone);
        console.log('🔗 Using endpoint:', VERIFY_RESET_OTP_API);
      }

      const response = await axios.post(VERIFY_RESET_OTP_API, {
        phone: phone.trim(),
        otp: otp.trim(),
        password: password
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Password reset successful:', response.data);
      }

      showMessage('Password has been reset successfully! You can now login to your seller account.', 'success');

      // ✅ Store-aware redirect
      setTimeout(() => {
        const redirectUrl = searchParams.get('redirect');
        if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
          router.push(`/store/${currentStoreInfo.storeId}/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`);
        } else {
          router.push(`/login/seller${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`);
        }
      }, 2500);

    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Password reset error:', err);
        console.error('❌ Error response:', err.response?.data);
      }

      let errorMessage = 'Failed to reset password. Please try again.';

      if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || 'Invalid or expired OTP. Please request a new OTP.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Seller account not found. Please check your phone number.';
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
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Resending OTP to seller phone:', phone);
      }

      await axios.post(SEND_RESET_OTP_API, {
        phone: phone.trim()
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setOtpSentTime(new Date());
      setResendCooldown(60);
      showMessage('OTP has been resent to your phone. Please check your messages.', 'success');

    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ OTP resend error:', err);
      }
      showMessage('Failed to resend OTP. Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  // ✅ Store-aware back link
  const getBackLink = () => {
    const redirectUrl = searchParams.get('redirect');
    if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
      return `/store/${currentStoreInfo.storeId}/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`;
    }
    return `/login/seller${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`;
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
              <span>Store seller context: {currentStoreInfo.storeId}</span>
            </div>
          )}

          {/* Header */}
          <div style={styles.header}>
            <div className='sellerregistericoncontainer' style={styles.iconContainer}>
              <KeyRound className='sellerregistericonsize' size={32} color="#1a4845" />
            </div>
            <h1 className='sellerregistercardtitle' style={styles.title}>Reset Seller Password</h1>
            <p className='sellerregistercardsubtitle' style={styles.subtitle}>
              {step === 1
                ? "Enter your registered phone number to receive a password reset code"
                : "Enter the verification code and create a new secure password for your seller account"
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
              Step {step} of 2 - Seller Account Recovery
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

          {/* Step 1: Enter Phone */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} style={styles.form}>
              <div style={styles.inputGroup}>

                <div style={styles.phoneInputContainer}>
                  <span className='sellerregistercountryocde' style={styles.countryCode}>+91</span>
                  <input
                    type="tel"
                    className='sellerregistertelinput'
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="Enter 10-digit phone number"
                    style={{
                      ...styles.phoneInput,
                      ...(errors.phone ? styles.inputError : {})
                    }}
                    maxLength={10}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                {errors.phone && (
                  <span style={styles.errorText}>{errors.phone}</span>
                )}
                <div style={styles.helpText}>
                  <Phone size={14} />
                  Enter the phone number you used to register your seller account
                </div>
              </div>

              <button
                type="submit"
                className='sellerregistersigninbtn'
                style={{
                  ...styles.button,
                  ...(isLoading ? styles.buttonLoading : {})
                }}
                disabled={isLoading || !phone}
              >
                {isLoading ? (
                  <span style={styles.buttonContent}>
                    <div style={styles.spinner}></div>
                    Sending OTP...
                  </span>
                ) : (
                  <span style={styles.buttonContent}>
                    <MessageSquare size={18} />
                    Send Verification Code
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP & New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} style={styles.form}>
              <div style={styles.phoneDisplay}>
                <Phone size={16} />
                <span>Code sent to: <strong>+91 {phone}</strong></span>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <KeyRound size={16} />
                  Verification Code
                </label>
                <input
                  type="text"
                  className='sellerregisterverificationinput'
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
                    ...styles.otpInput
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
                  <Lock className='sellerregistericons' size={18} style={styles.inputIcon} />
                  <input
                    className='sellerregisterpasswordinput'
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    placeholder="Create a strong password"
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
                  <Lock className='sellerregistericons' size={18} style={styles.inputIcon} />
                  <input
                    className='sellerregisterpasswordinput'
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
                    Resetting Password...
                  </span>
                ) : (
                  <span style={styles.buttonContent}>
                    <Lock size={18} />
                    Reset Seller Password
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Footer Links */}
          <div style={styles.footer}>
            <Link className='sellerregisterbacktodetailbtn' href={getBackLink()} style={styles.backLink}>
              <ArrowLeft size={16} />
              Back to Seller Login
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
                style={styles.changePhoneButton}
                disabled={isLoading}
              >
                Change Phone
              </button>
            )}
          </div>

          {/* Support Section */}
          <div style={styles.supportSection}>
            <div style={styles.supportCard}>
              <h4 style={styles.supportTitle}>Need Help?</h4>
              <p style={styles.supportText}>
                If you're having trouble accessing your seller account, our support team is here to help.
              </p>
              <div style={styles.supportLinks}>
                <a href="mailto:keralasellers.in@gmail.com" style={styles.supportLink}>
                  Email Support
                </a>
                <a href="https://wa.me/919400355185" target="_blank" rel="noopener noreferrer" style={styles.supportLink}>
                  WhatsApp Support
                </a>
              </div>
            </div>
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
      `}</style>
    </div>
  );
}

// ✅ Main export wrapped in Suspense
export default function SellerForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SellerForgotPasswordContent />
    </Suspense>
  );
}

// All your existing styles remain exactly the same
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
    backgroundColor: '#FDFFF0',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '480px',
    border: '1px solid #e5e7eb',
    animation: 'fadeIn 0.6s ease-out'
  },

  storeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#FDFFF0',
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
    backgroundColor: '#FDFFF0',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto'
  },

  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
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
    backgroundColor: '#1a4845',
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

  phoneDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#FDFFF0',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '0.9rem',
    color: '#374151',
    border: '1px solid #e2e8f0'
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

  phoneInputContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#FDFFF0',
    overflow: 'hidden'
  },

  countryCode: {
    padding: '14px 12px',
    backgroundColor: '#FDFFF0',
    border: 'none',
    borderRight: '1px solid #d1d5db',
    fontSize: '1rem',
    color: '#374151',
    fontWeight: '500'
  },

  phoneInput: {
    width: '100%',
    padding: '14px 16px',
    border: 'none',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    outline: 'none'
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: '#FDFFF0',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    outline: 'none'
  },

  otpInput: {
    textAlign: 'center',
    letterSpacing: '0.5em',
    fontSize: '1.2rem',
    fontWeight: '600'
  },

  passwordContainer: {
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

  passwordInput: {
    width: '100%',
    padding: '14px 48px 14px 60px',
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

  helpText: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: '#6b7280',
    marginTop: '6px'
  },

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
    fontSize: '14px',
    padding: '4px 0',
  },

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

  footer: {
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

  changePhoneButton: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '0.9rem',
    textDecoration: 'underline'
  },

  supportSection: {
    marginTop: '32px'
  },

  supportCard: {
    padding: '20px',
    backgroundColor: '#f1f7d4ff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
  },

  supportTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 8px 0'
  },

  supportText: {
    fontSize: '0.9rem',
    color: '#6b7280',
    margin: '0 0 16px 0',
    lineHeight: '1.4'
  },

  supportLinks: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },

  supportLink: {
    color: '#1a4845',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    padding: '6px 12px',
    border: '1px solid #1a4845',
    borderRadius: '6px',
    transition: 'all 0.2s'
  }
};
