'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Check, Phone, AlertCircle } from 'lucide-react';

const PROFILE_API = 'http://localhost:8000/api/buyer/profile/';
const SEND_OTP_API = 'http://localhost:8000/user/buyer/send-otp/';
const VERIFY_OTP_API = 'http://localhost:8000/user/buyer/verify-otp/';

export default function VerificationPage() {
  const [buyer, setBuyer] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('buyerAccessToken');
    if (!token) {
      router.push('/login/buyer');
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      try {
        const response = await axios.get(PROFILE_API, { headers });
        setBuyer(response.data);
        setPhoneNumber(response.data.phone_number || '');
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        if (error.response?.status === 401) {
          router.push('/login/buyer');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [getAuthHeaders, router]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setIsSubmitting(true);
    try {
      await axios.post(SEND_OTP_API, { phone: phoneNumber }, { headers });
      setOtpSent(true);
      alert('OTP sent successfully!');
    } catch (error) {
      alert('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      alert('Please enter a valid 4-digit OTP');
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setIsSubmitting(true);
    try {
      await axios.post(VERIFY_OTP_API, { otp }, { headers });
      alert('Phone verified successfully!');
      router.push('/profile');
    } catch (error) {
      alert('Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <Link href="/profile" style={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Profile
          </Link>
          <h1>Phone Verification</h1>
          <div></div>
        </div>
      </header>

      <div style={styles.container}>
        <div style={styles.verificationCard}>
          {buyer?.phone_verified ? (
            <div style={styles.verifiedSection}>
              <div style={styles.verifiedIcon}>
                <Check size={32} />
              </div>
              <div style={styles.verifiedContent}>
                <h2>Phone Number Verified</h2>
                <p>Your phone number <strong>{buyer.phone_number}</strong> is verified and secure.</p>
                <div style={styles.benefits}>
                  <h4>Benefits of verified account:</h4>
                  <ul>
                    <li>Secure account access</li>
                    <li>Order notifications via SMS</li>
                    <li>Enhanced account security</li>
                    <li>Faster checkout process</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.verificationSection}>
              <div style={styles.verificationHeader}>
                <Shield size={32} />
                <div>
                  <h2>Verify Your Phone Number</h2>
                  <p>Secure your account and enable shopping by verifying your phone number.</p>
                </div>
              </div>

              <div style={styles.warningBox}>
                <AlertCircle size={20} />
                <div>
                  <strong>Account Security</strong>
                  <p>Phone verification is required for placing orders and account security.</p>
                </div>
              </div>

              {!otpSent ? (
                <div style={styles.phoneSection}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Phone size={16} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter 10-digit phone number"
                      style={styles.input}
                      maxLength={10}
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={isSubmitting}
                    style={styles.sendButton}
                  >
                    {isSubmitting ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              ) : (
                <div style={styles.otpSection}>
                  <div style={styles.otpSentInfo}>
                    <Check size={16} />
                    <span>OTP sent to {phoneNumber}</span>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 4-digit OTP"
                      style={styles.otpInput}
                      maxLength={4}
                    />
                  </div>

                  <div style={styles.otpActions}>
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                      }}
                      style={styles.changeNumberButton}
                    >
                      Change Number
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isSubmitting}
                      style={styles.verifyButton}
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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
    gap: '16px'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Header
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  headerContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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

  // Container
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '32px 24px'
  },

  // Verification Card
  verificationCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },

  // Verified Section
  verifiedSection: {
    textAlign: 'center'
  },
  verifiedIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#dcfce7',
    color: '#059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px auto'
  },
  verifiedContent: {
    textAlign: 'center'
  },
  benefits: {
    textAlign: 'left',
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px'
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
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    border: '1px solid #fcd34d'
  },

  // Form Elements
  phoneSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  otpSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  otpSentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#059669',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  otpInput: {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1.5rem',
    textAlign: 'center',
    letterSpacing: '8px',
    fontWeight: '600',
    outline: 'none',
    transition: 'border-color 0.2s'
  },

  // Buttons
  sendButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  otpActions: {
    display: 'flex',
    gap: '12px'
  },
  changeNumberButton: {
    padding: '10px 16px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    color: '#475569',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  verifyButton: {
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    flex: 1
  }
};
