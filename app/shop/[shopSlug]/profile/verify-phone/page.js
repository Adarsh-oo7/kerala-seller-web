'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../../../../firebase'; // ✅ Adjust path to your firebase config
import axios from 'axios';
import Link from 'next/link';
import SHeader from '../../../../../components/common/SHeader';
import "../../../../../styles/Kerelasellerprofileverification.css";
import ShopFooter from '../../../../../components/common/ShopFooter'; // ✅ Your footer

import {
  Check,
  Phone,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  X,
  ArrowLeft,
  Shield,
  Lock
} from 'lucide-react';

const getApiBaseUrl = () => {
  const envUrl = 'https://api.keralasellers.in';
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  if (process.env.NODE_ENV === 'development') {
    return 'https://api.keralasellers.in';
  }
  return 'https://api.keralasellers.in';
};

const API_BASE_URL = 'https://api.keralasellers.in';
const SEND_OTP_API = `${API_BASE_URL}/user/buyer/send-otp/`;
const VERIFY_FIREBASE_API = `${API_BASE_URL}/user/buyer/verify-phone-firebase/`;
const PROFILE_API = `${API_BASE_URL}/api/buyer/profile/`;

export default function VerifyPhonePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [verificationId, setVerificationId] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ ADDED for SHeader

  // ✅ Store context from URL
  const shopSlug = params.shopSlug;
  const actualStoreId =
    searchParams.get('id') ||
    (shopSlug && shopSlug !== 'new' ? shopSlug : null);

  // ✅ Check login status
  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.warn('localStorage access error:', error);
      setIsLoggedIn(false);
    }
  }, [buyer]);

  // ✅ Auth headers
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('buyerAccessToken');
    if (!token) {
      const loginUrl = actualStoreId && actualStoreId !== 'new'
        ? `/shop/${actualStoreId}/login`
        : '/login/buyer';
      router.push(loginUrl);
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  // ✅ Setup reCAPTCHA
  const setupRecaptcha = useCallback(() => {
    if (!recaptchaVerifier && typeof window !== 'undefined') {
      try {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('✅ reCAPTCHA verified');
          },
        });
        setRecaptchaVerifier(verifier);
        return verifier;
      } catch (error) {
        console.error('❌ reCAPTCHA initialization failed:', error);
        setError('Failed to initialize reCAPTCHA');
        return null;
      }
    }
    return recaptchaVerifier;
  }, [recaptchaVerifier]);

  // ✅ Countdown timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => interval && clearInterval(interval);
  }, [resendTimer]);

  // ✅ Fetch profile and store data
  const fetchProfile = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsLoading(true);
    try {
      // Fetch buyer profile
      const profileRes = await axios.get(PROFILE_API, { headers });
      setBuyer(profileRes.data);
      if (profileRes.data?.phone_number) {
        setPhoneNumber(profileRes.data.phone_number);
      }

      // Fetch store data if in store context
      if (actualStoreId) {
        try {
          const storeRes = await axios.get(`${API_BASE_URL}/shop/${actualStoreId}/`);
          setStoreData(storeRes.data.store || storeRes.data);
        } catch (storeError) {
          console.warn('⚠️ Store data not found');
          setStoreData({ name: `Store ${actualStoreId}`, id: actualStoreId });
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('buyerAccessToken');
        const loginUrl = actualStoreId && actualStoreId !== 'new'
          ? `/shop/${actualStoreId}/login`
          : '/login/buyer';
        router.push(loginUrl);
      }
    } finally {
      setIsLoading(false);
    }
  }, [actualStoreId, router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ✅ Validate
  const validatePhoneNumber = (phone) =>
    /^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ''));

  const validateOTP = (code) =>
    code.length === 6 && /^\d{6}$/.test(code);

  // ✅ SEND OTP
  const handleSendOtp = async () => {
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number starting with 6-9');
      return;
    }
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsSubmitting(true);
    setError('');

    try {
      console.log('🔄 Step 1: Preparing backend for phone:', phoneNumber);
      await axios.post(SEND_OTP_API, { phone: phoneNumber }, { headers });

      console.log('🔄 Step 2: Sending Firebase SMS OTP...');
      const formattedPhone = `+91${phoneNumber}`;
      const verifier = setupRecaptcha();

      if (!verifier) {
        throw new Error('Failed to initialize reCAPTCHA');
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        verifier
      );

      console.log('✅ Firebase OTP sent successfully!');
      setVerificationId(confirmationResult);
      setOtpSent(true);
      setResendTimer(60);
      setOtpAttempts(0);
      setSuccessMessage(`SMS OTP sent to ${formattedPhone}`);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ OTP sending failed:', error);

      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    if (!verificationId) {
      setError('Verification session expired. Please request a new OTP.');
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setIsSubmitting(true);
    setError('');

    try {
      console.log('🔄 Step 1: Verifying Firebase OTP...');
      const result = await verificationId.confirm(otp);
      const idToken = await result.user.getIdToken();

      console.log('🔄 Step 2: Verifying with backend...');
      await axios.post(
        VERIFY_FIREBASE_API,
        { firebase_id_token: idToken },
        { headers }
      );

      console.log('✅ Backend verification successful!');
      setSuccessMessage('Phone verified successfully! 🎉');

      await fetchProfile();

      setTimeout(() => {
        const profileBack =
          actualStoreId && actualStoreId !== 'new'
            ? `/shop/${actualStoreId}/profile`
            : '/profile';
        router.push(profileBack);
      }, 2000);
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      setOtpAttempts((prev) => prev + 1);

      let errorMessage = 'Invalid OTP. Please try again.';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new one.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setError(errorMessage);
      setOtp('');

      if (otpAttempts >= 2) {
        setOtpSent(false);
        setVerificationId(null);
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
    setVerificationId(null);
    await handleSendOtp();
  };

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
    setSuccessMessage('');
    setResendTimer(0);
    setOtpAttempts(0);
    setVerificationId(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ Loading state
  if (isLoading || !buyer) {
    return (
      <div style={styles.pageContainer}>
        <SHeader store={storeData} isLoggedIn={isLoggedIn} />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading verification...</p>
        </div>
        {/* ✅ Footer for loading state */}
        <ShopFooter store={storeData} />
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div className='shopverificationpagecontainer' style={styles.pageContainer}>
      <SHeader store={storeData} isLoggedIn={isLoggedIn} />

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
            <button onClick={() => setError('')} style={styles.closeButton}>
              <X size={14} />
            </button>
          </div>
        )}

        <div style={styles.card}>
          {buyer.phone_verified ? (
            <div style={styles.verifiedSection}>
              <div className='keralasellerprofileverificationiconcontainer' style={styles.verifiedIcon}>
                <Check size={40} className='keralasellerprofileverificationpageicon' color="#10b981" />
              </div>
              <h2 className='keralasellerprofileverificationconftitle' style={styles.verifiedTitle}>Phone Number Verified</h2>
              <p className='keralasellerprofileverificationconftext' style={styles.verifiedText}>
                Your phone number <strong className='keralasellerprofileverificationnoclr'>+91 {buyer.phone_number}</strong> is verified!
              </p>

              <div className="benefits" style={styles.benefits}>
                <div className="keralasellerprofileverificationbenefitsTitle" style={styles.benefitsTitle}>
                  <Shield size={18} />
                  <span>Benefits of verified account:</span>
                </div>
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

              <Link
                style={styles.backButton}
                className='keralasellerprofileverificationbtn'
                href={actualStoreId && actualStoreId !== 'new' ? `/shop/${actualStoreId}/profile` : '/profile'}
              >
                Back to Profile
              </Link>
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
              <div style={styles.formSection}>
                {!otpSent ? (
                  <>
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
                          onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter 10-digit number"
                          style={styles.phoneInput}
                          maxLength={10}
                        />
                      </div>
                      <p style={styles.helpText}>
                        You will receive an SMS with a 6-digit verification code
                      </p>
                    </div>

                    <button
                      className='keralasellerprofileverificationbtn'
                      onClick={handleSendOtp}
                      disabled={isSubmitting || !validatePhoneNumber(phoneNumber)}
                      style={{
                        ...styles.sendButton,
                        ...(isSubmitting || !validatePhoneNumber(phoneNumber) ? styles.disabledButton : {})
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div style={styles.buttonSpinner}></div>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <MessageCircle size={17} />
                          Send SMS OTP
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className='keralasellerprofileverificationotpbadgeinfo' style={styles.otpSentBadge}>
                      <MessageCircle className='keralasellerprofileverificationotpbadgeinfoicon' size={16} />
                      <span className='keralasellerprofileverificationotpbadgetext'>SMS OTP sent to +91 {phoneNumber}</span>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Enter 6-digit Verification Code</label>
                      <input
                        className='keralasellerprofileverificationinput'
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        style={styles.otpInput}
                        autoFocus
                      />
                      <p style={styles.helpText}>
                        Check your SMS for the 6-digit verification code
                      </p>
                    </div>

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
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Check size={17} />
                          Verify OTP
                        </>
                      )}
                    </button>

                    <div className='keralasellerprofileverificationotpfooter' style={styles.otpFooter}>
                      <button className='keralasellerprofileverificationresendbtn' onClick={handleChangeNumber} style={styles.changeButton}>
                        Change Number
                      </button>
                      {resendTimer > 0 ? (
                        <span style={styles.timerText}>
                          <Clock size={15} />
                          Resend OTP in {formatTime(resendTimer)}
                        </span>
                      ) : (
                        <button className='keralasellerprofileverificationresendbtn' onClick={handleResendOtp} style={styles.resendButton}>
                          <RefreshCw size={15} />
                          Resend OTP
                        </button>
                      )}
                    </div>

                    {otpAttempts > 0 && (
                      <div style={styles.attemptsWarning}>
                        <AlertCircle size={14} />
                        {3 - otpAttempts} attempts remaining
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div id="recaptcha-container"></div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* ✅ FOOTER - Pass store prop */}
      <ShopFooter store={storeData} />
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: '#FDFFF0',
    paddingTop: '140px',
    minHeight: '100vh', // ✅ ADDED
    display: 'flex',    // ✅ ADDED
    flexDirection: 'column' // ✅ ADDED
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 300px)', // ✅ CHANGED
    gap: '20px',
    flex: 1 // ✅ ADDED
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
    padding: '24px',
    flex: 1, // ✅ ADDED to push footer down
    marginBottom: '40px' // ✅ ADDED space before footer
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
  },
  backIcon: {
    cursor: 'pointer',
    color: '#1a4845'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a4845',
    margin: 0
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #10b981',
    borderRadius: '12px',
    color: '#065f46',
    marginBottom: '20px'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '12px',
    color: '#991b1b',
    marginBottom: '20px'
  },
  closeButton: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer'
  },
  card: {
    backgroundColor: '#fffbe9',
    borderRadius: '18px',
    padding: '32px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #1a4845'
  },
  verifiedSection: {
    textAlign: 'center'
  },
  verifiedIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    border: '3px solid #10b981'
  },
  verifiedTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a4845',
    marginBottom: '12px'
  },
  verifiedText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px'
  },
  benefits: {
    textAlign: 'left',
    backgroundColor: '#f0fdf4',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  benefitsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#166534',
    marginBottom: '12px'
  },
  benefitsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '14px',
    color: '#166534'
  },
  backButton: {
    display: 'inline-block',
    padding: '12px 32px',
    backgroundColor: '#1a4845',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600'
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
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
    overflow: 'hidden'
  },
  countryCode: {
    padding: '14px 16px',
    fontWeight: '600',
    color: '#374151'
  },
  phoneInput: {
    flex: 1,
    padding: '14px 16px',
    border: 'none',
    fontSize: '16px',
    backgroundColor: '#fffbe9',
    outline: 'none'
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
    width: '100%',
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  verifyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  verificationSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
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
  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.7
  },
  otpSentBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#ecfdf5',
    borderRadius: '8px',
    color: '#065f46',
    fontSize: '14px',
    fontWeight: '500'
  },
  otpInput: {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '24px',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: '6px',
    backgroundColor: '#fff',
    outline: 'none'
  },
  otpFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  changeButton: {
    background: 'none',
    border: 'none',
    color: '#e93434ff',
    fontWeight: '500',
    cursor: 'pointer'
  },
  resendButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#1a4845',
    fontWeight: '500',
    cursor: 'pointer'
  },
  timerText: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6b7280',
    fontSize: '13px'
  },
  attemptsWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    color: '#92400e',
    fontSize: '14px'
  }
};
