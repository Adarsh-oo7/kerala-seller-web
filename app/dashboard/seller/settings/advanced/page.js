'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, Upload, Check, AlertCircle, Save, ArrowLeft, FileText, Globe
} from 'lucide-react';

// API configuration
// const getApiBaseUrl = () => {
//   const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
//   if (envUrl && envUrl !== 'undefined') return envUrl;
//   return process.env.NODE_ENV === 'development'
//     ? 'https://api.keralasellers.in'
//     : 'https://api.keralasellers.in';
// };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

const API_URL = `${API_BASE_URL}/user/store/profile/`;




// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
  cloudname: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnmbfeckd',
  uploadpreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'keralasellers_preset',
  fallbackpreset: 'ml_default',
  folder: 'kerala-sellers/store-profiles',
};

// Cloudinary Upload
const uploadToCloudinary = async (file, options = {}) => {
  const presetsToTry = [
    { preset: CLOUDINARY_CONFIG.uploadpreset, name: 'custom' },
    { preset: CLOUDINARY_CONFIG.fallbackpreset, name: 'fallback' },
  ];

  for (const { preset, name } of presetsToTry) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      formData.append('folder', options.folder || CLOUDINARY_CONFIG.folder);
      formData.append('quality', 'auto:good');
      formData.append('fetch_format', 'auto');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudname}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        if (name === 'fallback') throw new Error('Upload failed');
        continue;
      }

      const result = await response.json();
      return { success: true, url: result.secure_url, publicid: result.public_id };
    } catch (error) {
      if (name === 'fallback') return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'All upload presets failed' };
};

export default function AdvancedSettingsPage() {
  const [store, setStore] = useState({
    instagramlink: '',
    facebooklink: '',
    gstnumber: '',
    businesslicense: '',
    ownername: '',
    businessaddress: '',
    metatitle: '',
    metadescription: '',
  });

  const [currentDocUrl, setCurrentDocUrl] = useState('');
  const [cloudinaryData, setCloudinaryData] = useState({ document: null });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  const fetchStoreProfile = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setIsLoading(true);
      const response = await axios.get(API_URL, { headers });
      
      if (response.data.store_profile) {
        setStore((prev) => ({ ...prev, ...response.data.store_profile }));
        setCurrentDocUrl(response.data.store_profile.verification_doc_url);
      }
    } catch (error) {
      console.error('Error fetching store profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchStoreProfile();
  }, [fetchStoreProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStore((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size too large. Maximum 5MB.');
      return;
    }

    setIsUploading(true);
    const result = await uploadToCloudinary(file, {
      folder: `${CLOUDINARY_CONFIG.folder}/documents`,
    });

    if (result.success) {
      setCloudinaryData({ document: result });
      setCurrentDocUrl(result.url);
      setSuccessMessage('Document uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage('Failed to upload document');
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSaving(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setIsSaving(false);
      return;
    }

    try {
      const requestData = {
        ...store,
        cloudinary_document: cloudinaryData.document ? { 
          public_id: cloudinaryData.document.publicid, 
          url: cloudinaryData.document.url 
        } : null,
      };

      const response = await axios.patch(API_URL, requestData, { headers });

      if (response.data.store_profile) {
        setStore((prev) => ({ ...prev, ...response.data.store_profile }));
      }

      setSuccessMessage('Advanced settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setIsSaving(false);
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
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <Link href="/dashboard/seller/settings" style={styles.backLink}>
            <ArrowLeft size={18} />
            Back to Settings
          </Link>
          <h1 style={styles.title}>Advanced Settings</h1>
          <p style={styles.subtitle}>Optional business verification and SEO settings</p>
        </div>
      </div>

      {successMessage && (
        <div style={styles.successAlert}>
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={styles.errorAlert}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Verification Document */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <FileText size={20} />
            Business Verification
          </h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Verification Document (GST/License)</label>
            <div style={styles.imageUploadContainer}>
              {currentDocUrl ? (
                <img src={currentDocUrl} alt="Document" style={styles.docPreview} />
              ) : (
                <div style={styles.placeholder}>
                  <Upload size={24} />
                  <span>No Document Uploaded</span>
                </div>
              )}
              <div style={styles.imageOverlay}>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  style={styles.hiddenInput}
                  id="doc-upload"
                  disabled={isUploading}
                />
                <label htmlFor="doc-upload" style={styles.uploadButton}>
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </label>
              </div>
            </div>
            <p style={styles.helpText}>Upload GST certificate, business license, or verification document</p>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>GST Number</label>
              <input
                type="text"
                name="gstnumber"
                value={store.gstnumber}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Business License Number</label>
              <input
                type="text"
                name="businesslicense"
                value={store.businesslicense}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="License number"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Business Owner Name</label>
            <input
              type="text"
              name="ownername"
              value={store.ownername}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Full name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Business Address</label>
            <textarea
              name="businessaddress"
              value={store.businessaddress}
              onChange={handleInputChange}
              rows={3}
              style={styles.textarea}
              placeholder="Complete business address..."
            />
          </div>
        </div>

        {/* Social Media */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Globe size={20} />
            Social Media Links
          </h3>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Instagram Link</label>
              <input
                type="url"
                name="instagramlink"
                value={store.instagramlink}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="https://instagram.com/yourstore"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Facebook Link</label>
              <input
                type="url"
                name="facebooklink"
                value={store.facebooklink}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="https://facebook.com/yourstore"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Globe size={20} />
            SEO Settings
          </h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Meta Title</label>
            <input
              type="text"
              name="metatitle"
              value={store.metatitle}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Your Store - Best Products in Kerala"
              maxLength={60}
            />
            <span style={styles.charCount}>{store.metatitle?.length || 0}/60</span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Meta Description</label>
            <textarea
              name="metadescription"
              value={store.metadescription}
              onChange={handleInputChange}
              rows={3}
              style={styles.textarea}
              placeholder="Shop the best products at great prices..."
              maxLength={160}
            />
            <span style={styles.charCount}>{store.metadescription?.length || 0}/160</span>
          </div>
        </div>

        {/* Submit */}
        <div style={styles.submitSection}>
          <button type="submit" disabled={isSaving} style={styles.submitButton}>
            {isSaving ? 'Saving...' : (
              <>
                <Save size={18} />
                Save Advanced Settings
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// STYLES (same as main settings)
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '20px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    marginBottom: '32px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px',
    marginTop: '4px',
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
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f3f4f6',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  charCount: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'right',
  },
  helpText: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  imageUploadContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px dashed #d1d5db',
    backgroundColor: '#f9fafb',
  },
  docPreview: {
    width: '100%',
    height: '250px',
    objectFit: 'contain',
    backgroundColor: 'white',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '250px',
    color: '#6b7280',
    gap: '8px',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  hiddenInput: {
    display: 'none',
  },
  uploadButton: {
    display: 'inline-block',
    padding: '12px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  submitSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '24px',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
  },
};



