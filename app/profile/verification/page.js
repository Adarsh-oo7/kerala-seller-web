'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
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

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const PROFILE_API = `${API_BASE_URL}/api/buyer/profile/`;
const SEND_OTP_API = `${API_BASE_URL}/user/buyer/send-otp/`;
const VERIFY_OTP_API = `${API_BASE_URL}/user/buyer/verify-otp/`;

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
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('buyerAccessToken');
    if (!token) {
      router.push('/login/buyer');
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const fetchProfile = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching profile from:', PROFILE_API);
      const response = await axios.get(PROFILE_API, { headers });
      
      console.log('Profile data received:', response.data);
      setBuyer(response.data);
      const profilePhone = response.data.phone_number || '';
      setPhoneNumber(profilePhone);
      setIsPhoneEditable(!profilePhone);
      
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      if (error.response?.status === 401) {
        router.push('/login/buyer');
      } else {
        setError('Failed to load profile. Please try again.');
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
      console.log('Sending OTP to:', phoneNumber);
      await axios.post(SEND_OTP_API, { phone: phoneNumber }, { headers });
      
      setOtpSent(true);
      setResendTimer(60); // 60 seconds countdown
      setOtpAttempts(0);
      setSuccessMessage(`OTP sent to +91 ${phoneNumber}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('OTP sending failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to send OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('Verifying OTP:', otp);
      await axios.post(VERIFY_OTP_API, { 
        otp, 
        phone: phoneNumber 
      }, { headers });
      
      setSuccessMessage('Phone verified successfully!');
      
      // Refresh profile data
      await fetchProfile();
      
      // Redirect after success
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('OTP verification failed:', error);
      setOtpAttempts(prev => prev + 1);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Invalid OTP. Please try again.';
      setError(errorMessage);
      
      // Clear OTP input on failure
      setOtp('');
      
      // After 3 failed attempts, reset the process
      if (otpAttempts >= 2) {
        setOtpSent(false);
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
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <Link href="/profile" style={styles.backLink}>
            <ArrowLeft size={18} />
            <span>Back to Profile</span>
          </Link>
          <h1 style={styles.headerTitle}>Phone Verification</h1>
          <div style={styles.headerSpacer}></div>
        </div>
      </header>

      <div style={styles.container}>
        {/* Success Message */}
        {successMessage && (
          <div style={styles.successAlert}>
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
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
              <div style={styles.verifiedIcon}>
                <Check size={40} />
              </div>
              <div style={styles.verifiedContent}>
                <h2 style={styles.verifiedTitle}>Phone Number Verified</h2>
                <p style={styles.verifiedText}>
                  Your phone number <strong>+91 {buyer.phone_number}</strong> is verified and secure.
                </p>
                
                <div style={styles.benefits}>
                  <h4 style={styles.benefitsTitle}>
                    <Shield size={20} />
                    Benefits of verified account:
                  </h4>
                  <ul style={styles.benefitsList}>
                    <li>
                      <Lock size={16} />
                      <span>Enhanced account security</span>
                    </li>
                    <li>
                      <MessageCircle size={16} />
                      <span>Order notifications via SMS</span>
                    </li>
                    <li>
                      <Check size={16} />
                      <span>Faster checkout process</span>
                    </li>
                    <li>
                      <Shield size={16} />
                      <span>Account recovery options</span>
                    </li>
                  </ul>
                </div>

                <div style={styles.verifiedActions}>
                  <Link href="/profile" style={styles.backToProfileButton}>
                    Back to Profile
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.verificationSection}>
              <div style={styles.verificationHeader}>
                <div style={styles.headerIcon}>
                  <Shield size={32} />
                </div>
                <div>
                  <h2 style={styles.sectionTitle}>Verify Your Phone Number</h2>
                  <p style={styles.sectionDescription}>
                    Secure your account and enable shopping by verifying your phone number.
                  </p>
                </div>
              </div>

              <div style={styles.warningBox}>
                <AlertCircle size={20} />
                <div>
                  <strong>Account Security Required</strong>
                  <p>Phone verification is required for placing orders and account security.</p>
                </div>
              </div>

              {!otpSent ? (
                <div style={styles.phoneSection}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Phone size={16} />
                      Mobile Number
                    </label>
                    <div style={styles.phoneInputContainer}>
                      <span style={styles.countryCode}>+91</span>
                      <input
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
                          onClick={() => setIsPhoneEditable(true)}
                          style={styles.editPhoneButton}
                          type="button"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    <p style={styles.helpText}>
                      Enter your mobile number to receive verification OTP
                    </p>
                  </div>
                  
                  <button
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
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={16} />
                        Send OTP
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div style={styles.otpSection}>
                  <div style={styles.otpSentInfo}>
                    <MessageCircle size={16} />
                    <span>OTP sent to +91 {phoneNumber}</span>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Enter Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setOtp(value);
                        if (error) setError('');
                      }}
                      placeholder="Enter 4-digit OTP"
                      style={styles.otpInput}
                      maxLength={4}
                      autoFocus
                    />
                    <p style={styles.helpText}>
                      Check your SMS for the 4-digit verification code
                    </p>
                  </div>

                  <div style={styles.otpActions}>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isSubmitting || otp.length !== 4}
                      style={{
                        ...styles.verifyButton,
                        ...(isSubmitting || otp.length !== 4 ? styles.disabledButton : {})
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div style={styles.buttonSpinner}></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Verify OTP
                        </>
                      )}
                    </button>
                  </div>

                  <div style={styles.otpFooter}>
                    <button
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

      {/* CSS Animations */}
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
    backgroundColor: '#f8fafc'
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

  // Header
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  headerContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '6px 8px',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  
  headerSpacer: {
    width: '100px'
  },

  // Container
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '32px 24px'
  },

  // Alert Messages
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

  // Verification Card
  verificationCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    animation: 'fadeIn 0.6s ease-out'
  },

  // Verified Section
  verifiedSection: {
    textAlign: 'center'
  },
  
  verifiedIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#d1fae5',
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
    color: '#1f2937',
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
    border: '1px solid #bbf7d0'
  },
  
  benefitsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#166534',
    marginBottom: '16px'
  },
  
  benefitsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  
  verifiedActions: {
    marginTop: '32px'
  },
  
  backToProfileButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },

  // Verification Section
  verificationSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  
  verificationHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    textAlign: 'left'
  },
  
  headerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#dbeafe',
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
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

  // Form Elements
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
    transition: 'all 0.2s'
  },
  
  countryCode: {
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    border: 'none',
    fontSize: '16px',
    color: '#374151',
    fontWeight: '500',
    borderRight: '1px solid #e5e7eb'
  },
  
  phoneInput: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: 'white'
  },
  
  editPhoneButton: {
    padding: '8px 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500'
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
    backgroundColor: 'white'
  },
  
  helpText: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  },

  // Buttons
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
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6'
  },
  
  changeNumberButton: {
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    color: '#6b7280',
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
    backgroundColor: '#3b82f6',
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
    color: '#6b7280',
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
