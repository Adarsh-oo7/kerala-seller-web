'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import "../../../styles/Keralasellersprofileedit.css";
import { toast } from "react-toastify";


import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
  Globe
} from 'lucide-react';


// ✅ Enhanced API base URL handling with environment variables
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  if (process.env.NODE_ENV === 'development') {
    return 'process.env.NEXT_PUBLIC_API_BASE_URL';
  }
  return 'https://api.keralasellers.in';
};

const API_BASE_URL = getApiBaseUrl();
const PROFILE_API = `${API_BASE_URL}/api/buyer/profile/`;

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    full_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    pincode: '',
    phone_number: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });
  const router = useRouter();

  // ✅ Enhanced token handling - supports both Google login and regular login
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token') ||
      localStorage.getItem('buyerAccessToken');

    if (!token) {
      console.error('❌ No authentication token found');
      router.push('/login/buyer');
      return null;
    }

    console.log('🔍 Using token:', token.substring(0, 30) + '...');
    return { 'Authorization': `Bearer ${token}` };
  }, [router]);

  // ✅ Get current store info from URL
  const getCurrentStoreInfo = useCallback(() => {
    if (typeof window === 'undefined') return { storeId: null, isInStore: false };

    const currentPath = window.location.pathname;
    const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
    return {
      storeId: storeMatch ? storeMatch[1] : null,
      isInStore: !!storeMatch
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsLoading(true);
    try {
      console.log('Fetching profile from:', PROFILE_API);
      const response = await axios.get(PROFILE_API, { headers });

      console.log('Profile data received:', response.data);
      const data = response.data;
      const profileData = {
        full_name: data.full_name || '',
        address_line_1: data.address_line_1 || '',
        address_line_2: data.address_line_2 || '',
        city: data.city || '',
        pincode: data.pincode || '',
        phone_number: data.phone_number || ''
      };

      setFormData(profileData);
      setOriginalData(profileData);
      setHasChanges(false);

      // ✅ Update current store info
      setCurrentStoreInfo(getCurrentStoreInfo());

    } catch (error) {
      console.error("Failed to fetch profile:", error);
      if (error.response?.status === 401) {
        // Clear tokens and redirect
        localStorage.removeItem('access_token');
        localStorage.removeItem('buyerAccessToken');
        router.push('/login/buyer');
      } else {
        setErrors({ general: 'Failed to load profile. Please refresh the page.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, router, getCurrentStoreInfo]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Check for unsaved changes
  useEffect(() => {
    const hasDataChanged = Object.keys(formData).some(
      key => formData[key] !== originalData[key]
    );
    setHasChanges(hasDataChanged);
  }, [formData, originalData]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    // Phone validation
    if (formData.phone_number && formData.phone_number.trim()) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone_number.trim())) {
        newErrors.phone_number = 'Please enter a valid 10-digit mobile number starting with 6-9';
      }
    }

    // Pincode validation
    if (formData.pincode && formData.pincode.trim()) {
      const pincodeRegex = /^\d{6}$/;
      if (!pincodeRegex.test(formData.pincode.trim())) {
        newErrors.pincode = 'Please enter a valid 6-digit pincode';
      }
    }

    // City validation
    if (formData.city && formData.city.trim()) {
      if (formData.city.trim().length < 2) {
        newErrors.city = 'City name must be at least 2 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }

    // Clear success message
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!hasChanges) {
      setSuccessMessage('No changes to save.');
      toast.error("No changes to save.", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setIsSaving(true);
    setErrors({});

    try {
      console.log('Updating profile with data:', formData);
      await axios.patch(PROFILE_API, formData, { headers });

      setOriginalData(formData);
      setHasChanges(false);
      setSuccessMessage('Profile updated successfully!');
      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      if (currentStoreInfo?.isInStore && currentStoreInfo?.storeId) {
        router.push(`/store/${currentStoreInfo.storeId}/profile`);
      } else {
        router.push('/profile');
      }


      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Profile update failed:', error);
      if (error.response?.status === 401) {
        // Clear tokens and redirect
        localStorage.removeItem('access_token');
        localStorage.removeItem('buyerAccessToken');
        router.push('/login/buyer');
      } else if (error.response?.status === 400) {
        // Handle validation errors from server
        const serverErrors = error.response.data;
        setErrors({ general: serverErrors.message || 'Please check your input and try again.' });
      } else {
        setErrors({ general: 'Failed to update profile. Please try again.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Store-aware back navigation
  const handleCancel = () => {
    if (hasChanges) {
      setShowUnsavedWarning(true);
    } else {
      navigateBack();
    }
  };

  const navigateBack = () => {
    const { storeId, isInStore } = currentStoreInfo;

    if (isInStore && storeId) {
      // If we're in a store, go back to that store's profile page
      router.push(`/store/${storeId}/profile`);
    } else {
      // Go to main profile page
      router.push('/profile');
    }
  };

  const confirmCancel = () => {
    setFormData(originalData);
    setHasChanges(false);
    setShowUnsavedWarning(false);
    navigateBack();
  };

  const handleReset = () => {
    setFormData(originalData);
    setErrors({});
    setSuccessMessage('');
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Header />
      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Unsaved Changes</h3>
              <button
                onClick={() => setShowUnsavedWarning(false)}
                style={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
            <p>You have unsaved changes. Are you sure you want to leave without saving?</p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowUnsavedWarning(false)}
                style={styles.stayButton}
              >
                Stay and Edit
              </button>
              <button
                onClick={confirmCancel}
                style={styles.leaveButton}
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {/* <header style={styles.header}>
        <div style={styles.headerContainer}>
          <button onClick={handleCancel} style={styles.backButton}>
            <ArrowLeft size={20} />
            <span style={styles.backText}>
              {currentStoreInfo.isInStore ? 'Back to Store Profile' : 'Back to Profile'}
            </span>
          </button>
          <h1 style={styles.headerTitle}>Edit Profile</h1>
          <div style={styles.headerActions}>
            {hasChanges && (
              <button onClick={handleReset} style={styles.resetButton}>
                <RefreshCw size={16} />
                Reset
              </button>
            )}
          </div>
        </div>
      </header> */}

      <div style={styles.container}>
        <div style={styles.formWrapper}>
          {/* ✅ Show store context indicator */}
          {currentStoreInfo.isInStore && (
            <div style={styles.storeIndicator}>
              <Globe size={16} />
              <span>Editing profile from store context • Store ID: {currentStoreInfo.storeId}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div style={styles.successAlert}>
              <CheckCircle size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div style={styles.errorAlert}>
              <AlertCircle size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Personal Information Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <User size={20} color="red" />
                <h3 className='keralasellersprofiledittitle' style={styles.sectionTitle}>Personal Information</h3>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  {/* <label style={styles.label}>
                    Full Name *
                    <span style={styles.required}>Required</span>
                  </label> */}
                  <input
                    className='keralasellersprofileditinput'
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(errors.full_name ? styles.inputError : {})
                    }}
                    placeholder="Enter your full name"
                    maxLength={100}
                  />
                  {errors.full_name && (
                    <div style={styles.errorMessage}>
                      <AlertCircle size={14} />
                      <span>{errors.full_name}</span>
                    </div>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  {/* <label style={styles.label}>Phone Number</label> */}
                  <div style={styles.phoneInputContainer}>
                    <span className='keralasellersprofileditinput' style={styles.phonePrefix}>+91</span>
                    <input
                      className='keralasellersprofileditinput'
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleInputChange('phone_number', value);
                      }}
                      style={{
                        ...styles.phoneInput,
                        ...(errors.phone_number ? styles.inputError : {})
                      }}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                  {errors.phone_number && (
                    <div style={styles.errorMessage}>
                      <AlertCircle size={14} />
                      <span>{errors.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <MapPin size={20} color="red" />
                <h3 className='keralasellersprofiledittitle' style={styles.sectionTitle}>Address Information</h3>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  {/* <label style={styles.label}>Address Line 1</label> */}
                  <input
                    className='keralasellersprofileditinput'
                    type="text"
                    value={formData.address_line_1}
                    onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                    style={styles.input}
                    placeholder="House number, street name"
                    maxLength={100}
                  />
                </div>

                <div style={styles.inputGroup}>
                  {/* <label style={styles.label}>Address Line 2 (Optional)</label> */}
                  <input
                    type="text"
                    className='keralasellersprofileditinput'
                    value={formData.address_line_2}
                    onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                    style={styles.input}
                    placeholder="Area, landmark"
                    maxLength={100}
                  />
                </div>

                <div style={styles.inputGroup}>
                  {/* <label style={styles.label}>City</label> */}
                  <input
                    type="text"
                    className='keralasellersprofileditinput'
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    style={{
                      ...styles.input,
                      ...(errors.city ? styles.inputError : {})
                    }}
                    placeholder="Enter city name"
                    maxLength={50}
                  />
                  {errors.city && (
                    <div style={styles.errorMessage}>
                      <AlertCircle size={14} />
                      <span>{errors.city}</span>
                    </div>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  {/* <label style={styles.label}>Pincode</label> */}
                  <input
                    type="text"
                    className='keralasellersprofileditinput'
                    value={formData.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      handleInputChange('pincode', value);
                    }}
                    style={{
                      ...styles.input,
                      ...(errors.pincode ? styles.inputError : {})
                    }}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <div style={styles.errorMessage}>
                      <AlertCircle size={14} />
                      <span>{errors.pincode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actions}>
              <button
                className='keralasellersprofilesavebtn'
                type="button"
                onClick={handleCancel}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                className='keralasellersprofilesavebtn'
                type="submit"
                disabled={isSaving || !hasChanges}
                style={{
                  ...styles.saveButton,
                  ...(isSaving || !hasChanges ? styles.disabledButton : {})
                }}
              >
                {isSaving ? (
                  <>
                    <div style={styles.buttonSpinner}></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  // ✅ NEW: Store context indicator
  storeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#dbeafe',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e40af',
    fontWeight: '500',
    marginBottom: '24px'
  },

  pageContainer: { backgroundColor: "#FDFFF0" },
  container: { minHeight: '100vh', backgroundColor: '#FDFFF0', padding: '40px 20px', maxWidth: '800px', margin: '0 auto', },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '20px',
    padding: '20px'
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

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },

  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    animation: 'slideIn 0.2s ease-out'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px'
  },

  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
  },

  stayButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },

  leaveButton: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },

  // Header
  // Header
  header: {
    backgroundColor: '#FDFFF0',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '1px 3px 10px rgba(0,0,0,0.3)',
  },

  headerContainer: {
    margin: '0 auto', // center horizontally
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '8px',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },

  backText: {
    display: 'none',
    '@media (min-width: 640px)': {
      display: 'inline'
    }
  },

  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  resetButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b7280',
    transition: 'all 0.2s'
  },



  // Alerts
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #10b981',
    borderRadius: '12px',
    color: '#065f46',
    marginBottom: '24px'
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
    marginBottom: '24px'
  },

  // Form
  formWrapper: {
    animation: 'fadeIn 0.6s ease-out'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },

  // Sections
  section: {
    backgroundColor: '#FDFFF0',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    border: '1px solid #e5e7eb'
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f3f4f6'
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },

  // Form Grid
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
  },

  // Form Elements
  inputGroup: {
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
    color: '#374151',
    marginBottom: '6px'
  },

  required: {
    fontSize: '12px',
    color: '#ef4444',
    fontWeight: '400'
  },

  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#FDFFF0',
    boxSizing: 'border-box'
  },

  phoneInputContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'all 0.2s'
  },

  phonePrefix: {
    padding: '12px 16px',
    backgroundColor: '#FDFFF0',
    border: 'none',
    fontSize: '16px',
    color: '#374151',
    fontWeight: '500'
  },

  phoneInput: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: '#FDFFF0'
  },

  inputError: {
    borderColor: '#ef4444'
  },

  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ef4444',
    fontSize: '14px',
    marginTop: '4px'
  },

  // Actions
  actions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    // paddingTop: '32px',
  },

  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 20px',
    backgroundColor: '#f63c3cff',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '120px'
  },

  saveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s',
    minWidth: '140px'
  },

  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.7
  }
};

