'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import "../../../../styles/RegisterBuyer.css";

import {
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Store,
  RefreshCw,
  Shield
} from 'lucide-react';
import SHeader from '../../../../components/common/SHeader';

// ✅ API Configuration
// const getApiBaseUrl = () => {
//   const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
//   if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
//     return envUrl.trim();
//   }
//   if (process.env.NODE_ENV === 'development') {
//     return 'https://api.keralasellers.in';
//   }
//   return 'https://api.keralasellers.in';
// };

// const API_BASE_URL = 'https://api.keralasellers.in';
// const SEND_RESET_OTP_API = `${API_BASE_URL}/user/buyer/password-reset/send-otp/`;
// const VERIFY_RESET_OTP_API = `${API_BASE_URL}/user/buyer/password-reset/verify/`;

// console.log('🌐 Shop Forgot Password API:', { API_BASE_URL });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? 'https://api.keralasellers.in' : 'http://localhost:8000/api');

const SEND_RESET_OTP_API = `${API_BASE_URL}/user/buyer/password-reset/send-otp/`;
const VERIFY_RESET_OTP_API = `${API_BASE_URL}/user/buyer/password-reset/verify/`;

console.log('🔑 Shop Password Reset:', API_BASE_URL);


// ✅ Loading Fallback
function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FDFFF0'
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
          borderTop: '4px solid #1a4845',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
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

// ✅ Main Content Component
function ShopForgotPasswordContent() {
  const { shopSlug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [storeInfo, setStoreInfo] = useState({
    actualStoreId: null,
    storeData: null,
    loading: true,
    error: null
  });
  const [hasCheckedToken, setHasCheckedToken] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password
  const [email, setEmail] = useState('');
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

  // Check login status
  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken') || localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    } catch (error) {
      setIsLoggedIn(false);
    }
  }, []);

  // Get store ID from URL
  const getActualStoreId = () => {
    if (shopSlug === 'undefined' || shopSlug === undefined) {
      return { error: 'Invalid shop slug', storeId: null };
    }

    const queryId = searchParams.get('id');
    if (queryId && queryId !== 'undefined' && queryId.trim() !== '') {
      return { error: null, storeId: queryId.trim() };
    }

    if (shopSlug && shopSlug !== 'new' && shopSlug !== 'undefined') {
      return { error: null, storeId: shopSlug };
    }

    return { error: 'No valid store ID', storeId: null };
  };

  // Generate shop URLs
  const getShopUrl = (path = '') => {
    if (!storeInfo.actualStoreId) return '/';
    if (searchParams.get('id') && shopSlug === 'new') {
      return `/shop/new${path}?id=${storeInfo.actualStoreId}`;
    }
    return `/shop/${storeInfo.actualStoreId}${path}`;
  };

  // Initialize store info
  useEffect(() => {
    const { error, storeId } = getActualStoreId();
    if (error || !storeId) {
      router.replace('/');
      return;
    }

    setStoreInfo(prev => ({ ...prev, actualStoreId: storeId }));

    const fetchStoreData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/shop/${storeId}/`);
        if (response.ok) {
          const storeResData = await response.json();
          const storeData = storeResData.store || storeResData;
          setStoreInfo(prev => ({ ...prev, storeData, loading: false }));
        } else {
          setStoreInfo(prev => ({
            ...prev,
            storeData: { name: `Store ${storeId}`, id: storeId },
            loading: false
          }));
        }
      } catch (error) {
        setStoreInfo(prev => ({
          ...prev,
          storeData: { name: `Store ${storeId}`, id: storeId },
          loading: false
        }));
      }
    };

    fetchStoreData();

    // Pre-fill email from URL
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [shopSlug, searchParams, router]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!hasCheckedToken && storeInfo.actualStoreId && !storeInfo.loading) {
      setHasCheckedToken(true);
    }
  }, [hasCheckedToken, storeInfo.actualStoreId, storeInfo.loading]);

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

  // Step 1: Send OTP
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
      console.log('📧 Sending password reset OTP for shop:', storeInfo.actualStoreId);

      await axios.post(SEND_RESET_OTP_API, {
        email: email.trim().toLowerCase(),
        store_context: storeInfo.actualStoreId
      }, {
        timeout: 15000
      });

      setOtpSentTime(new Date());
      setResendCooldown(60);
      showMessage(`An OTP has been sent to ${email.trim()}. Please check your inbox.`, 'success');
      setStep(2);

    } catch (err) {
      console.error('❌ OTP send error:', err);

      let errorMessage = 'Could not send OTP. Please try again.';

      if (err.response?.status === 404) {
        errorMessage = 'No account found with this email. Please check or create an account.';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait before trying again.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.response?.data) {
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
      }

      showMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
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
      newErrors.password = 'Password must be at least 8 characters';
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
      console.log('🔐 Resetting password for shop buyer');

      await axios.post(VERIFY_RESET_OTP_API, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password: password,
        store_context: storeInfo.actualStoreId
      }, {
        timeout: 15000
      });

      showMessage('Password reset successfully! Redirecting to login...', 'success');

      setTimeout(() => {
        router.push(getShopUrl('/login'));
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
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
      }

      showMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);

    try {
      await axios.post(SEND_RESET_OTP_API, {
        email: email.trim().toLowerCase(),
        store_context: storeInfo.actualStoreId
      }, {
        timeout: 15000
      });

      setOtpSentTime(new Date());
      setResendCooldown(60);
      showMessage('OTP has been resent to your email.', 'success');

    } catch (err) {
      showMessage('Failed to resend OTP. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  // Loading state
  if (storeInfo.loading || !hasCheckedToken) {
    return (
      <div style={styles.pageContainer}>
        <SHeader store={storeInfo.storeData} isLoggedIn={isLoggedIn} />
        <LoadingFallback />
      </div>
    );
  }

  // Error state
  if (!storeInfo.actualStoreId) {
    return (
      <div style={styles.pageContainer}>
        <SHeader store={null} isLoggedIn={isLoggedIn} />
        <div style={styles.container}>
          <div style={styles.card}>
            <h2>Store Not Found</h2>
            <button onClick={() => router.push('/')} style={styles.button}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <SHeader store={storeInfo.storeData} isLoggedIn={isLoggedIn} />

      <div style={styles.container}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div className='buyerregistericoncontainer' style={styles.iconContainer}>
              <KeyRound className='buyerregistericonsize' size={32} color="#1a4845" />
            </div>
            <h1 className='buyerregistercardtitle' style={styles.title}>
              Reset Your Password
            </h1>
            <p className='buyerregistercardsubtitle' style={styles.subtitle}>
              {step === 1
                ? `Reset your password for ${storeInfo.storeData?.name || 'this store'}`
                : "Enter the verification code and create a new password"
              }
            </p>
          </div>

          {/* Progress Bar */}
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
              {messageType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message}</span>
            </div>
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} style={styles.form}>
              <div style={styles.inputGroup}>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    className='buyerforgotpasswordinput'
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    placeholder="Enter your registered email"
                    style={{
                      ...styles.input,
                      ...(errors.email ? styles.inputError : {})
                    }}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                {errors.email && (
                  <span style={styles.errorText}>{errors.email}</span>
                )}
                <div style={styles.inputHint}>
                  We'll send a 6-digit verification code to this email
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

              {/* OTP Input */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <KeyRound size={16} />
                  Verification Code
                </label>
                <input
                  className='buyerregisterverificationinput'
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

              {/* New Password */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Lock size={16} />
                  New Password
                </label>
                <div style={styles.passwordContainer}>
                  <input
                    className='buyerforgotpasswordspet2input'
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
                    className='buyerregistereye'
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

                {/* Password Strength */}
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

              {/* Confirm Password */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Shield size={16} />
                  Confirm New Password
                </label>
                <div style={styles.passwordContainer}>
                  <input
                    className='buyerforgotpasswordspet2input'
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
                    className='buyerregistereye'
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

                {/* Password Match Indicator */}
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
            <Link href={getShopUrl('/login')} style={styles.backLink}>
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ✅ Main Export with Suspense
export default function ShopForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ShopForgotPasswordContent />
    </Suspense>
  );
}

// ✅ Styles (matching buyer forgot password)
const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#FDFFF0',
    paddingTop: '90px'
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
    backgroundAttachment: 'fixed',
    marginTop: '50px',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    width: '90%',
    maxWidth: '500px',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: '#fff',
    textAlign: 'center'
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
  emailDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: "center",
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
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
    padding: '14px 48px 14px 48px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    backgroundColor: '#FDFFF0',
    outline: 'none'
  },
  inputHint: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginTop: '6px'
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
    backgroundColor: '#FDFFF0',
    outline: 'none'
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#1a4845',
    padding: '4px'
  },
  inputError: {
    borderColor: '#ef4444'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.875rem',
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
    fontSize: '0.8rem',
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
