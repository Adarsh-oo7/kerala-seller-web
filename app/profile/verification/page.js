'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../../firebase';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import "../../../styles/Kerelasellerprofileverification.css";

import {
  Shield,
  Check,
  Phone,
  AlertCircle,
  RefreshCw,
  Clock,
  Lock,
  MessageCircle,
  X
} from 'lucide-react';

// âœ… API URLs
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
// const PROFILE_API = `${API_BASE_URL}/api/buyer/profile/`;
// const SEND_OTP_API = `${API_BASE_URL}/user/buyer/send-otp/`;
// const VERIFY_FIREBASE_API = `${API_BASE_URL}/user/buyer/verify-phone-firebase/`;

// console.log('ðŸŒ Verification API URLs configured:', {
//   API_BASE_URL,
//   PROFILE_API,
//   SEND_OTP_API,
//   VERIFY_FIREBASE_API,
//   ENVIRONMENT: process.env.NODE_ENV
// });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     'https://api.keralasellers.in';

const PROFILE_API = `${API_BASE_URL}/api/buyer/profile/`;
const SEND_OTP_API = `${API_BASE_URL}/user/buyer/send-otp/`;
const VERIFY_FIREBASE_API = `${API_BASE_URL}/user/buyer/verify-phone-firebase/`;

console.log('ðŸŒ Verification APIs:', {
  API_BASE_URL,
  LOCAL: process.env.NEXT_PUBLIC_API_BASE_URL,
  ENVIRONMENT: process.env.NODE_ENV
});


export default function VerificationPage() {
  const [buyer, setBuyer] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isPhoneEditable, setIsPhoneEditable] = useState(true);
  
  // âœ… Firebase state
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const router = useRouter();

  // âœ… Enhanced token handling
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');
    if (!token) {
      console.error('âŒ No authentication token found');
      router.push('/login/buyer');
      return null;
    }
    console.log('ðŸ” Using token:', token.substring(0, 30) + '...');
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

  // âœ… Setup reCAPTCHA with setTimeout to ensure DOM is ready
  useEffect(() => {
    const setupRecaptcha = () => {
      if (typeof window === 'undefined') return;
      
      // Wait for DOM to be fully ready
      setTimeout(() => {
        try {
          // Check if container exists
          const container = document.getElementById('recaptcha-container');
          if (!container) {
            console.error('âŒ reCAPTCHA container not found');
            return;
          }

          // Clear any existing verifier
          if (window.recaptchaVerifier) {
            try {
              window.recaptchaVerifier.clear();
            } catch (e) {
              console.log('Clearing old verifier:', e);
            }
          }

          // Create new verifier with correct parameters
          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            'recaptcha-container',
            {
              size: 'invisible',
              callback: (response) => {
                console.log('âœ… reCAPTCHA solved:', response);
              },
              'expired-callback': () => {
                console.log('âš ï¸ reCAPTCHA expired');
              }
            }
          );

          console.log('âœ… reCAPTCHA initialized successfully');
        } catch (error) {
          console.error('âŒ reCAPTCHA initialization error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
        }
      }, 1000); // Wait 1 second for DOM
    };

    setupRecaptcha();

    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const fetchProfile = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('ðŸ”„ Fetching profile from:', PROFILE_API);
      const response = await axios.get(PROFILE_API, {
        headers,
        timeout: 15000
      });

      console.log('âœ… Profile data received:', response.data);
      setBuyer(response.data);
      const profilePhone = response.data.phone_number || '';
      setPhoneNumber(profilePhone);
      setIsPhoneEditable(!profilePhone);

    } catch (error) {
      console.error("âŒ Failed to fetch profile:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('buyerAccessToken');
        router.push('/login/buyer');
      } else {
        const errorMessage = error.code === 'ECONNABORTED'
          ? 'Server timeout - please check your connection'
          : 'Failed to load profile from server. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  // âœ… Enhanced 6-digit OTP validation
  const validateOTP = (otpValue) => {
    const isValid = otpValue.length === 6 && /^\d{6}$/.test(otpValue);
    if (!isValid) {
      setError('Please enter a valid 6-digit numeric OTP');
      return false;
    }
    return true;
  };

  // âœ… FIREBASE: Send OTP via Firebase Phone Auth
  const handleSendOtp = async () => {
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number starting with 6-9');
      return;
    }

    if (!window.recaptchaVerifier) {
      setError('Verification system not ready. Please wait a moment or refresh the page.');
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Step 1: Prepare backend
      console.log('ðŸ”„ Step 1: Preparing backend for phone:', phoneNumber);
      await axios.post(SEND_OTP_API, { phone: phoneNumber }, {
        headers,
        timeout: 15000
      });

      console.log('âœ… Backend prepared');

      // Step 2: Send OTP via Firebase
      console.log('ðŸ”„ Step 2: Sending Firebase SMS OTP...');
      const formattedPhone = `+91${phoneNumber}`;
      
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);

      console.log('âœ… Firebase OTP sent successfully!');
      setConfirmationResult(result);
      setOtpSent(true);
      setResendTimer(60);
      setOtpAttempts(0);
      setSuccessMessage(`SMS OTP sent to ${formattedPhone}`);

      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('âŒ OTP sending failed:', error);

      let errorMessage = 'Failed to send OTP. Please try again.';
      
      // Firebase-specific errors
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'Verification failed. Please refresh the page.';
      } else if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('buyerAccessToken');
        router.push('/login/buyer');
        return;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // âœ… FIREBASE: Verify OTP with Firebase
  const handleVerifyOtp = async () => {
    if (!validateOTP(otp)) {
      return;
    }

    if (!confirmationResult) {
      setError('Verification session expired. Please request a new OTP.');
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setIsSubmitting(true);
    setError('');

    try {
      console.log('ðŸ”„ Step 1: Verifying Firebase OTP...');
      
      // Confirm OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      console.log('âœ… Firebase OTP verified! ID Token received.');
      console.log('ðŸ”„ Step 2: Verifying with backend...');

      // Send Firebase ID token to backend
      await axios.post(
        VERIFY_FIREBASE_API,
        { firebase_id_token: idToken },
        { headers, timeout: 15000 }
      );

      console.log('âœ… Backend verification successful!');
      setSuccessMessage('Phone verified successfully! ðŸŽ‰');

      // Refresh profile
      await fetchProfile();

      // Redirect
      setTimeout(() => {
        router.push('/profile');
      }, 2000);

    } catch (error) {
      console.error('âŒ OTP verification failed:', error);
      setOtpAttempts(prev => prev + 1);

      let errorMessage = 'Invalid OTP. Please try again.';
      
      // Firebase-specific errors
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new one.';
      } else if (error.code === 'auth/session-expired') {
        errorMessage = 'Session expired. Please request a new OTP.';
      } else if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('buyerAccessToken');
        router.push('/login/buyer');
        return;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setError(errorMessage);
      setOtp('');

      // After 3 failed attempts, reset
      if (otpAttempts >= 2) {
        setOtpSent(false);
        setConfirmationResult(null);
        setResendTimer(0);
        setOtpAttempts(0);
        setError('Too many failed attempts. Please request a new OTP.');
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtp('');
    setConfirmationResult(null);
    await handleSendOtp();
  };

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
    setSuccessMessage('');
    setResendTimer(0);
    setOtpAttempts(0);
    setIsPhoneEditable(true);
    setConfirmationResult(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading verification details...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Header />
      
      {/* âœ… IMPORTANT: reCAPTCHA container (invisible) */}
      <div id="recaptcha-container"></div>

      <div style={styles.container}>
        {successMessage && (
          <div style={styles.successAlert}>
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError('')} style={styles.closeAlert}>
              <X size={14} />
            </button>
          </div>
        )}

        <div style={styles.verificationCard}>
          {buyer?.phone_verified ? (
            <div style={styles.verifiedSection}>
              <div className='keralasellerprofileverificationiconcontainer' style={styles.verifiedIcon}>
                <Check size={40} className='keralasellerprofileverificationpageicon' />
              </div>
              <div style={styles.verifiedContent}>
                <h2 className='keralasellerprofileverificationconftitle' style={styles.verifiedTitle}>Phone Number Verified</h2>
                <p className='keralasellerprofileverificationconftext' style={styles.verifiedText}>
                  Your phone number <strong className='keralasellerprofileverificationnoclr'>+91 {buyer.phone_number}</strong> is verified and secure.
                </p>

                <div className="benefits" style={styles.benefits}>
                  <h4 className="keralasellerprofileverificationbenefitsTitle" style={styles.benefitsTitle}>
                    <Shield size={20} />
                    Benefits of verified account:
                  </h4>
                  <ul style={styles.benefitsList}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Lock size={16} />
                      <span className='keralasellerprofileverificationbenefitslist'>Enhanced account security</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MessageCircle size={16} />
                      <span className='keralasellerprofileverificationbenefitslist'>Order notifications via SMS</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} />
                      <span className='keralasellerprofileverificationbenefitslist'>Faster checkout process</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Shield size={16} />
                      <span className='keralasellerprofileverificationbenefitslist'>Account recovery options</span>
                    </li>
                  </ul>
                </div>

                <div style={styles.verifiedActions}>
                  <Link href="/profile" className='keralasellerprofileverificationbtn' style={styles.backToProfileButton}>
                    Back to Profile
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.verificationSection}>
              <div style={{ ...styles.verificationHeader, flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={styles.headerIcon}>
                  <Shield className='keralasellerprofileverificationpageicon' size={35} />
                </div>
                <div>
                  <h2 className='keralasellerprofileverificationpagetitle' style={styles.sectionTitle}>
                    Verify Your Phone Number
                  </h2>
                  <p className='keralasellerprofileverificationpagetext' style={styles.sectionDescription}>
                    Secure your account and enable shopping by verifying your phone number with SMS OTP.
                  </p>
                </div>
              </div>

              <div style={styles.warningBox}>
                <AlertCircle size={20} />
                <div>
                  <strong className='keralasellerprofileverificationpagetext'>Account Security Required</strong>
                  <p className='keralasellerprofileverificationpagetext'>Phone verification is required for placing orders and account security.</p>
                </div>
              </div>

              {!otpSent ? (
                <div style={styles.phoneSection}>
                  <div style={styles.formGroup}>
                    <label className='keralasellerprofileverificationpagetext' style={styles.label}>
                      <Phone size={16} />
                      Mobile Number
                    </label>
                    <div style={styles.phoneInputContainer}>
                      <span className='keralasellerprofileverificationcountrycode' style={styles.countryCode}>+91</span>
                      <input
                        className='keralasellerprofileverificationinput'
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setPhoneNumber(value);
                          if (error) setError('');
                        }}
                        placeholder="Enter 10-digit mobile number"
                        style={styles.phoneInput}
                        maxLength={10}
                        disabled={!isPhoneEditable}
                      />
                      {!isPhoneEditable && (
                        <button
                          className='keralasellerprofileverificationeditbtn'
                          onClick={() => setIsPhoneEditable(true)}
                          style={styles.editPhoneButton}
                          type="button"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    <p style={styles.helpText}>
                      You will receive an SMS with a 6-digit verification code
                    </p>
                  </div>

                  <button
                    className='keralasellerprofileverificationbtn'
                    onClick={handleSendOtp}
                    disabled={isSubmitting || !phoneNumber}
                    style={{
                      ...styles.sendButton,
                      ...(isSubmitting || !phoneNumber ? styles.disabledButton : {})
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div style={styles.buttonSpinner}></div>
                        Sending SMS OTP...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={16} />
                        Send SMS OTP
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div style={styles.otpSection}>
                  <div className='keralasellerprofileverificationotpbadgeinfo' style={styles.otpSentInfo}>
                    <MessageCircle className='keralasellerprofileverificationotpbadgeinfoicon' size={16} />
                    <span className='keralasellerprofileverificationotpbadgetext'>SMS OTP sent to +91 {phoneNumber}</span>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Enter 6-digit Verification Code</label>
                    <input
                      className='keralasellerprofileverificationinput'
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 6) {
                          setOtp(value);
                          if (error) setError('');
                        }
                      }}
                      placeholder="000000"
                      style={styles.otpInput}
                      maxLength={6}
                      autoFocus
                    />
                    <p style={styles.helpText}>
                      Check your SMS for the 6-digit verification code
                    </p>
                  </div>

                  <div style={styles.otpActions}>
                    <button
                      className='keralasellerprofileverificationbtn'
                      onClick={handleVerifyOtp}
                      disabled={isSubmitting || otp.length !== 6}
                      style={{
                        ...styles.verifyButton,
                        ...(isSubmitting || otp.length !== 6 ? styles.disabledButton : {})
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div style={styles.buttonSpinner}></div>
                          Verifying OTP...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Verify OTP
                        </>
                      )}
                    </button>
                  </div>

                  <div className='keralasellerprofileverificationotpfooter' style={styles.otpFooter}>
                    <button
                      className='keralasellerprofileverificationresendbtn'
                      onClick={handleChangeNumber}
                      style={styles.changeNumberButton}
                      disabled={isSubmitting}
                    >
                      Change Number
                    </button>

                    {resendTimer > 0 ? (
                      <div style={styles.timerInfo}>
                        <Clock size={14} />
                        <span>Resend OTP in {formatTime(resendTimer)}</span>
                      </div>
                    ) : (
                      <button
                        className='keralasellerprofileverificationresendbtn'
                        onClick={handleResendOtp}
                        style={styles.resendButton}
                        disabled={isSubmitting}
                      >
                        <RefreshCw size={14} />
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {otpAttempts > 0 && (
                    <div style={styles.attemptsWarning}>
                      <AlertCircle size={14} />
                      <span>
                        {3 - otpAttempts} attempts remaining
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  buttonSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #10b981',
    borderRadius: '12px',
    color: '#065f46',
    marginBottom: '24px',
    animation: 'slideIn 0.3s ease-out'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '12px',
    color: '#991b1b',
    marginBottom: '24px',
    animation: 'slideIn 0.3s ease-out'
  },
  closeAlert: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: '4px'
  },
  verificationCard: {
    backgroundColor: '#FDFFF0',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    border: '1px solid #1a4845',
    animation: 'fadeIn 0.6s ease-out'
  },
  verifiedSection: {
    textAlign: 'center'
  },
  verifiedIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px auto',
    border: '3px solid #bbf7d0'
  },
  verifiedContent: {
    textAlign: 'center'
  },
  verifiedTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a4845',
    marginBottom: '12px'
  },
  verifiedText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  benefits: {
    textAlign: 'left',
    marginTop: '24px',
    padding: '24px',
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    border: '1px solid #1a4845'
  },
  benefitsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '17px',
    fontWeight: '600',
    color: '#166534',
    marginBottom: '16px'
  },
  benefitsList: {
    listStyle: 'none',
    padding: '3px',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  verifiedActions: {
    marginTop: '32px'
  },
  backToProfileButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#1a4845',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  verificationSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    backgroundColor: '#FDFFF0',
  },
  verificationHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    textAlign: 'left'
  },
  headerIcon: {
    color: '#f63b3bff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionDescription: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: 0
  },
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    border: '1px solid #f59e0b'
  },
  phoneSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  otpSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  otpSentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px',
    backgroundColor: '#ecfdf5',
    borderRadius: '8px',
    border: '1px solid #bbf7d0'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  phoneInputContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.2s',
    position: 'relative',
  },
  countryCode: {
    padding: '12px 16px',
    backgroundColor: '#FDFFF0',
    border: 'none',
    fontSize: '16px',
    color: '#374151',
    fontWeight: '500',
    borderRight: '1px solid #e5e7eb'
  },
  phoneInput: {
    flex: 1,
    padding: '12px 16px',
    paddingRight: '60px',
    border: 'none',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: '#FDFFF0'
  },
  editPhoneButton: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '8px 12px',
    backgroundColor: 'rgb(26, 72, 69)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  otpInput: {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '24px',
    textAlign: 'center',
    letterSpacing: '8px',
    fontWeight: '700',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#FDFFF0'
  },
  helpText: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  },
  sendButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  verifyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s',
    width: '100%'
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.7
  },
  otpActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  otpFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  changeNumberButton: {
    padding: '8px 16px',
    backgroundColor: '#FDFFF0',
    border: '1px solid #e93434ff',
    borderRadius: '6px',
    color: '#f43131ff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  resendButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#1a4845',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  timerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#1a4845',
    fontSize: '14px'
  },
  attemptsWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    color: '#92400e',
    fontSize: '14px',
    fontWeight: '500'
  }
};



