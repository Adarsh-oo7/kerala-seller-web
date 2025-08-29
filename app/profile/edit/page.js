'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Phone, MapPin, AlertCircle } from 'lucide-react';

const PROFILE_API = 'http://localhost:8000/api/buyer/profile/';

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    full_name: '', 
    address_line_1: '', 
    address_line_2: '',
    city: '', 
    pincode: '', 
    phone_number: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
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
        const data = response.data;
        setFormData({
          full_name: data.full_name || '',
          address_line_1: data.address_line_1 || '',
          address_line_2: data.address_line_2 || '',
          city: data.city || '',
          pincode: data.pincode || '',
          phone_number: data.phone_number || ''
        });
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (formData.phone_number && !/^[6-9]\d{9}$/.test(formData.phone_number.trim())) {
      newErrors.phone_number = 'Please enter a valid 10-digit phone number';
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const headers = getAuthHeaders();
    if (!headers) return;
    
    setIsSaving(true);
    try {
      await axios.patch(PROFILE_API, formData, { headers });
      alert('Profile updated successfully!');
      router.push('/profile');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <Link href="/profile" style={styles.backButton}>
            <ArrowLeft size={20} />
            <span style={styles.backText}>Back to Profile</span>
          </Link>
          <h1 style={styles.headerTitle}>Edit Profile</h1>
          <div style={styles.headerSpacer}></div>
        </div>
      </header>

      <div style={styles.container}>
        <div style={styles.formWrapper}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Personal Information Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <User size={24} />
                <h3 style={styles.sectionTitle}>Personal Information</h3>
              </div>
              
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    style={{...styles.input, ...(errors.full_name ? styles.inputError : {})}}
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && (
                    <div style={styles.errorMessage}>
                      <AlertCircle size={14} />
                      <span>{errors.full_name}</span>
                    </div>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    style={{...styles.input, ...(errors.phone_number ? styles.inputError : {})}}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
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
                <MapPin size={24} />
                <h3 style={styles.sectionTitle}>Address Information</h3>
              </div>
              
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Address Line 1</label>
                  <input
                    type="text"
                    value={formData.address_line_1}
                    onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                    style={styles.input}
                    placeholder="House number, street name"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={formData.address_line_2}
                    onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                    style={styles.input}
                    placeholder="Area, landmark"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    style={styles.input}
                    placeholder="Enter city name"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    style={{...styles.input, ...(errors.pincode ? styles.inputError : {})}}
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
              <Link href="/profile" style={styles.cancelButton}>
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={isSaving}
                style={{...styles.saveButton, ...(isSaving ? styles.disabledButton : {})}}
              >
                <Save size={18} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
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
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
    padding: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Header
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '8px'
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
    color: '#1e293b',
    margin: 0,
    '@media (max-width: 640px)': {
      fontSize: '18px'
    }
  },
  headerSpacer: {
    width: '120px',
    '@media (max-width: 640px)': {
      width: '40px'
    }
  },

  // Container
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    '@media (min-width: 768px)': {
      padding: '40px 20px'
    }
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
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    '@media (min-width: 768px)': {
      padding: '32px'
    }
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },

  // Form Grid
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '20px',
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
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '2px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
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
    justifyContent: 'flex-end',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
    '@media (max-width: 640px)': {
      flexDirection: 'column-reverse'
    }
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 24px',
    backgroundColor: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    color: '#475569',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s',
    minWidth: '120px',
    ':hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#cbd5e1'
    }
  },
  saveButton: {
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
    minWidth: '140px',
    ':hover': {
      backgroundColor: '#059669'
    }
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: '#9ca3af'
    }
  }
};
