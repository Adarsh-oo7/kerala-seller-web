'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Shield, Upload, Check, AlertCircle, Star, Settings, Building, FileText, 
  CreditCard, Phone, Globe, Truck, Search, Eye, EyeOff, X, RefreshCw, Save, Cloud
} from 'lucide-react';

// ✅ FIXED: Enhanced API configuration
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl !== 'undefined') {
    return envUrl;
  }
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const API_URL = `${API_BASE_URL}/user/store/profile/`;

// ✅ WORKING: Cloudinary Configuration
const CLOUDINARY_CONFIG = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnmbfeckd',
  upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kerala_sellers_preset',
  fallback_preset: 'ml_default',
  folder: 'kerala-sellers/store-profiles'
};

// ✅ ENHANCED: Cloudinary Upload Function
const uploadToCloudinary = async (file, options = {}) => {
  const presetsToTry = [
    { preset: CLOUDINARY_CONFIG.upload_preset, name: 'custom' },
    { preset: CLOUDINARY_CONFIG.fallback_preset, name: 'fallback' }
  ];

  for (const { preset, name } of presetsToTry) {
    console.log(`🔄 Trying ${name} preset: ${preset}`);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      formData.append('folder', options.folder || CLOUDINARY_CONFIG.folder);
      
      // Basic optimizations allowed for unsigned uploads
      if (options.width) formData.append('width', options.width.toString());
      if (options.height) formData.append('height', options.height.toString());
      if (options.crop) formData.append('crop', options.crop);
      
      formData.append('quality', 'auto:good');
      formData.append('fetch_format', 'auto');
      
      // Generate unique public_id
      if (options.public_id) {
        const uniqueId = `${options.public_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        formData.append('public_id', uniqueId);
      }
      
      formData.append('tags', `kerala-sellers,store-${options.type || 'asset'}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ ${name} preset failed:`, errorData);
        if (name === 'fallback') {
          throw new Error(`All presets failed. Last error: ${errorData.error?.message || response.statusText}`);
        }
        continue;
      }

      const result = await response.json();
      console.log(`✅ Upload successful with ${name} preset:`, result.secure_url);
      
      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at,
        preset_used: preset
      };
      
    } catch (error) {
      console.error(`❌ Error with ${name} preset:`, error);
      if (name === 'fallback') {
        return {
          success: false,
          error: error.message
        };
      }
    }
  }

  return {
    success: false,
    error: 'All upload presets failed'
  };
};

export default function ShopProfileForm() {
  const [activeTab, setActiveTab] = useState('basic');
  
  // ✅ Store state matching your Django StoreProfile model
  const [store, setStore] = useState({
    // Basic Information (matches your model fields)
    name: '',
    description: '',
    tagline: '',
    whatsapp_number: '',
    
    // Social Media
    instagram_link: '',
    facebook_link: '',
    
    // Delivery Information
    delivery_time_local: '',
    delivery_time_national: '',
    
    // SEO
    meta_title: '',
    meta_description: '',
    
    // Payment Methods
    payment_method: 'NONE',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    upi_id: '',
    accepts_cod: false,
    
    // Business Verification
    gst_number: '',
    business_license: '',
    owner_name: '',
    business_address: '',
    verification_status: 'pending'
  });
  
  // File handling states
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState('');
  const [verificationDocFile, setVerificationDocFile] = useState(null);
  const [currentDocUrl, setCurrentDocUrl] = useState('');
  
  // Cloudinary tracking
  const [cloudinaryData, setCloudinaryData] = useState({
    logo: null,
    banner: null,
    document: null
  });
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [showSecrets, setShowSecrets] = useState({});
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  
  const router = useRouter();

  // ✅ FIXED: Authentication helper
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  // ✅ FIXED: Fetch store profile with proper error handling
  const fetchStoreProfile = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setIsLoading(true); // ✅ FIXED: setLoading -> setIsLoading
      console.log('🔍 Fetching store profile from:', API_URL);
      
      const response = await axios.get(API_URL, { headers });
      console.log('✅ Store profile response:', response.data);
      
      if (response.data.store_profile) {
        // Update store state with existing data
        setStore(prev => ({ 
          ...prev, 
          ...response.data.store_profile 
        }));
        
        // Update image URLs
        setCurrentLogoUrl(response.data.store_profile.logo_url || '');
        setCurrentBannerUrl(response.data.store_profile.banner_image_url || '');
        setCurrentDocUrl(response.data.store_profile.verification_doc_url || '');
        
        // Update Cloudinary data if exists
        if (response.data.store_profile.cloudinary_logo) {
          setCloudinaryData(prev => ({
            ...prev,
            logo: response.data.store_profile.cloudinary_logo
          }));
        }
        if (response.data.store_profile.cloudinary_banner) {
          setCloudinaryData(prev => ({
            ...prev,
            banner: response.data.store_profile.cloudinary_banner
          }));
        }
        if (response.data.store_profile.cloudinary_document) {
          setCloudinaryData(prev => ({
            ...prev,
            document: response.data.store_profile.cloudinary_document
          }));
        }
        
        setIsProfileComplete(response.data.is_profile_complete || false);
        calculateProgress(response.data.store_profile);
      } else {
        setIsProfileComplete(false);
        calculateProgress({});
      }
      
    } catch (error) {
      console.error('❌ Error fetching store profile:', error);
      if (error.response?.status === 401) {
        router.push('/login/seller');
      } else {
        setErrorMessage('Failed to load store profile. Please refresh the page.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, router]);

  // Load profile on component mount
  useEffect(() => {
    fetchStoreProfile();
  }, [fetchStoreProfile]);

  // ✅ Calculate verification progress
  const calculateProgress = (storeData) => {
    const mandatoryFields = ['name', 'description', 'whatsapp_number'];
    const optionalFields = ['gst_number', 'business_license', 'owner_name', 'business_address'];
    
    let completed = 0;
    let total = mandatoryFields.length + optionalFields.length + 1; // +1 for logo
    
    mandatoryFields.forEach(field => {
      if (storeData[field]?.trim()) completed++;
    });
    
    if (storeData.logo_url) completed++;
    
    optionalFields.forEach(field => {
      if (storeData[field]?.trim()) completed++;
    });
    
    setVerificationProgress(Math.round((completed / total) * 100));
  };

  // ✅ Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setStore(prev => ({ ...prev, [name]: newValue }));
    
    // Clear messages when user starts typing
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  // ✅ Form validation
  const validateForm = () => {
    const errors = [];
    
    if (!store.name?.trim()) errors.push('Store name is required');
    if (!store.description?.trim()) errors.push('Store description is required');
    if (!store.whatsapp_number?.trim()) errors.push('WhatsApp number is required');
    
    if (store.whatsapp_number && !/^(\+91|91)?[6-9]\d{9}$/.test(store.whatsapp_number.replace(/\s+/g, ''))) {
      errors.push('Please enter a valid Indian mobile number');
    }
    
    if (store.payment_method === 'RAZORPAY') {
      if (!store.razorpay_key_id?.trim()) errors.push('Razorpay Key ID is required');
      if (!store.razorpay_key_secret?.trim()) errors.push('Razorpay Key Secret is required');
    }
    
    if (store.payment_method === 'UPI' && !store.upi_id?.trim()) {
      errors.push('UPI ID is required when UPI payment is selected');
    }
    
    return errors;
  };

  // ✅ Handle file changes with Cloudinary upload
  const handleFileChange = async (fileType, file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file && file.size > maxSize) {
      setErrorMessage(`File size too large. Maximum allowed size is 5MB.`);
      return;
    }

    if (!file) return;
    
    // Set local file for preview
    switch (fileType) {
      case 'logo':
        setLogoFile(file);
        break;
      case 'banner':
        setBannerImageFile(file);
        break;
      case 'doc':
        setVerificationDocFile(file);
        break;
    }
    
    setErrorMessage('');
    setIsUploading(true);
    
    // Update progress
    setUploadProgress(prev => ({
      ...prev,
      [fileType]: { status: 'uploading', progress: 0, fileName: file.name }
    }));

    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      
      const uploadOptions = {
        folder: `${CLOUDINARY_CONFIG.folder}/${fileType}`,
        public_id: `${fileType}_${timestamp}_${randomId}`,
        type: fileType,
        width: fileType === 'logo' ? 400 : fileType === 'banner' ? 1200 : 800,
        height: fileType === 'logo' ? 400 : fileType === 'banner' ? 400 : 600,
        crop: fileType === 'doc' ? 'fit' : 'fill'
      };

      console.log(`🔧 Starting ${fileType} upload:`, uploadOptions);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileType]: { 
            ...prev[fileType], 
            progress: Math.min(prev[fileType].progress + 10, 90) 
          }
        }));
      }, 300);

      const result = await uploadToCloudinary(file, uploadOptions);
      clearInterval(progressInterval);
      
      if (result.success) {
        setCloudinaryData(prev => ({
          ...prev,
          [fileType]: result
        }));
        
        setUploadProgress(prev => ({
          ...prev,
          [fileType]: { 
            status: 'completed', 
            progress: 100, 
            url: result.url,
            fileName: file.name,
            preset: result.preset_used
          }
        }));
        
        console.log(`✅ ${fileType} uploaded successfully:`, result.url);
        setSuccessMessage(
          `✅ ${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully!`
        );
        
        setTimeout(() => setSuccessMessage(''), 5000);
        
      } else {
        setUploadProgress(prev => ({
          ...prev,
          [fileType]: { 
            status: 'failed', 
            progress: 0, 
            error: result.error,
            fileName: file.name
          }
        }));
        setErrorMessage(`❌ Failed to upload ${fileType}: ${result.error}`);
      }
      
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [fileType]: { 
          status: 'failed', 
          progress: 0, 
          error: error.message,
          fileName: file.name
        }
      }));
      setErrorMessage(`❌ Error uploading ${fileType}: ${error.message}`);
    } finally {
      setIsUploading(false);
      
      // Clear progress after 8 seconds
      setTimeout(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileType]: undefined
        }));
      }, 8000);
    }
  };

  // ✅ FIXED: Handle form submission with proper data preparation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors.join('. '));
      return;
    }
    
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    const headers = getAuthHeaders();
    if (!headers) {
      setIsSaving(false);
      return;
    }
    
    try {
      console.log('🚀 Submitting store profile...');
      
      // ✅ FIXED: Always use JSON submission for cleaner data handling
      const requestData = {
        ...store,
        // Include Cloudinary data if available
        cloudinary_logo: cloudinaryData.logo ? {
          public_id: cloudinaryData.logo.public_id,
          url: cloudinaryData.logo.url
        } : null,
        cloudinary_banner: cloudinaryData.banner ? {
          public_id: cloudinaryData.banner.public_id,
          url: cloudinaryData.banner.url
        } : null,
        cloudinary_document: cloudinaryData.document ? {
          public_id: cloudinaryData.document.public_id,
          url: cloudinaryData.document.url
        } : null
      };
      
      console.log('📤 Sending JSON data:', requestData);

      // Choose method based on whether profile exists
      const method = isProfileComplete ? 'patch' : 'post';
      const response = await axios[method](API_URL, requestData, { 
        headers: { 
          ...headers,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('✅ Store profile saved:', response.data);
      
      // Update state with response data
      if (response.data.store_profile) {
        setStore(prev => ({ ...prev, ...response.data.store_profile }));
        setCurrentLogoUrl(response.data.store_profile.logo_url || '');
        setCurrentBannerUrl(response.data.store_profile.banner_image_url || '');
        setCurrentDocUrl(response.data.store_profile.verification_doc_url || '');
        setIsProfileComplete(true);
        calculateProgress(response.data.store_profile);
      }
      
      const cloudinaryCount = Object.values(cloudinaryData).filter(Boolean).length;
      setSuccessMessage(
        `✅ Store profile ${isProfileComplete ? 'updated' : 'created'} successfully!${cloudinaryCount > 0 ? ` ☁️ ${cloudinaryCount} images stored on Cloudinary` : ''}`
      );
      
      // Reset file inputs
      setBannerImageFile(null);
      setLogoFile(null);
      setVerificationDocFile(null);
      
      // Reset file input elements
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (error) {
      console.error('❌ Store profile save error:', error);
      
      let errorMessage = 'Failed to save store profile. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          router.push('/login/seller');
        }, 2000);
      } else if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          // Handle field-specific errors
          const fieldErrors = [];
          Object.keys(error.response.data).forEach(field => {
            const fieldError = error.response.data[field];
            if (Array.isArray(fieldError)) {
              fieldErrors.push(`${field}: ${fieldError.join(', ')}`);
            } else if (typeof fieldError === 'string') {
              fieldErrors.push(`${field}: ${fieldError}`);
            }
          });
          
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('; ');
          }
        }
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Upload progress renderer
  const renderUploadProgress = (fileType) => {
    const progress = uploadProgress[fileType];
    if (!progress) return null;

    return (
      <div style={styles.uploadProgress}>
        <div style={styles.progressInfo}>
          <span style={styles.progressFileName}>{progress.fileName}</span>
          <span style={styles.progressPercentage}>{progress.progress}%</span>
        </div>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${progress.progress}%`,
              backgroundColor: progress.status === 'completed' ? '#10b981' : 
                             progress.status === 'failed' ? '#ef4444' : '#3b82f6'
            }}
          />
        </div>
        <div style={styles.progressText}>
          {progress.status === 'completed' && `✅ Successfully uploaded${progress.preset ? ` (${progress.preset})` : ''}`}
          {progress.status === 'failed' && `❌ Upload failed: ${progress.error || 'Unknown error'}`}
          {progress.status === 'uploading' && '☁️ Uploading to Cloudinary...'}
        </div>
      </div>
    );
  };

  // ✅ Verification status renderer
  const renderVerificationStatus = () => {
    const statusConfig = {
      pending: { 
        icon: AlertCircle, 
        color: '#f59e0b', 
        bgColor: '#fef3c7',
        text: 'Verification Pending' 
      },
      verified: { 
        icon: Check, 
        color: '#10b981', 
        bgColor: '#d1fae5',
        text: 'Verified Seller' 
      },
      rejected: { 
        icon: X, 
        color: '#ef4444', 
        bgColor: '#fee2e2',
        text: 'Verification Rejected' 
      }
    };
    
    const config = statusConfig[store.verification_status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <div style={{
        ...styles.verificationStatus, 
        borderColor: config.color,
        backgroundColor: config.bgColor
      }}>
        <Icon size={20} color={config.color} />
        <span style={{color: config.color, fontWeight: '600'}}>{config.text}</span>
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill, 
              width: `${verificationProgress}%`,
              backgroundColor: config.color
            }}></div>
          </div>
          <span style={styles.progressText}>{verificationProgress}% Complete</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading store profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Building size={28} />
            {isProfileComplete ? 'Edit Store Profile' : 'Create Store Profile'}
          </h1>
          <p style={styles.subtitle}>
            Set up your store information to start selling on Kerala Sellers
            <br />
            <span style={styles.cloudinaryNote}>
              <Cloud size={14} />
              ☁️ Images powered by Cloudinary ({CLOUDINARY_CONFIG.cloud_name})
            </span>
          </p>
        </div>
        {renderVerificationStatus()}
      </div>

      {/* Status Messages */}
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
          <button onClick={() => setErrorMessage('')} style={styles.closeAlert}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('basic')}
          style={{
            ...styles.tab,
            ...(activeTab === 'basic' ? styles.activeTab : {})
          }}
        >
          <Building size={18} />
          <span>Basic Information</span>
          <span style={styles.tabBadge}>Required</span>
        </button>
        
        <button
          onClick={() => setActiveTab('verification')}
          style={{
            ...styles.tab,
            ...(activeTab === 'verification' ? styles.activeTab : {})
          }}
        >
          <Shield size={18} />
          <span>Verification & Extras</span>
          <span style={styles.tabBadgeOptional}>Optional</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {activeTab === 'basic' && (
          <div style={styles.section}>
            {/* Store Branding */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Star size={20} />
                Store Branding
                <span style={styles.cloudinaryBadge}>
                  <Cloud size={16} />
                  Cloudinary
                </span>
              </h3>
              
              <div style={styles.brandingContainer}>
                {/* Logo Upload */}
                <div style={styles.logoSection}>
                  <label style={styles.label}>Store Logo *</label>
                  <div style={styles.imageUploadContainer}>
                    {currentLogoUrl ? (
                      <img src={currentLogoUrl} alt="Store Logo" style={styles.logoPreview} />
                    ) : (
                      <div style={styles.logoPlaceholder}>
                        <Upload size={24} />
                        <span>No Logo</span>
                      </div>
                    )}
                    <div style={styles.imageOverlay}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange('logo', e.target.files[0])} 
                        style={styles.hiddenFileInput} 
                        id="logo-upload"
                        disabled={isUploading}
                      />
                      <label htmlFor="logo-upload" style={{
                        ...styles.uploadButton,
                        ...(isUploading ? styles.disabledButton : {})
                      }}>
                        {isUploading ? (
                          <>
                            <div style={styles.buttonSpinner}></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            {logoFile ? 'Change Logo' : 'Upload Logo'}
                          </>
                        )}
                      </label>
                    </div>
                    {cloudinaryData.logo && (
                      <div style={styles.cloudinaryIndicator}>
                        <Cloud size={14} />
                        Cloudinary
                      </div>
                    )}
                  </div>
                  {logoFile && (
                    <p style={styles.fileName}>Selected: {logoFile.name}</p>
                  )}
                  {renderUploadProgress('logo')}
                </div>
                
                {/* Banner Upload */}
                <div style={styles.bannerSection}>
                  <label style={styles.label}>Store Banner</label>
                  <div style={styles.imageUploadContainer}>
                    {currentBannerUrl ? (
                      <img src={currentBannerUrl} alt="Store banner" style={styles.bannerPreview} />
                    ) : (
                      <div style={styles.bannerPlaceholder}>
                        <Upload size={24} />
                        <span>No Banner</span>
                      </div>
                    )}
                    <div style={styles.imageOverlay}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange('banner', e.target.files[0])} 
                        style={styles.hiddenFileInput} 
                        id="banner-upload"
                        disabled={isUploading}
                      />
                      <label htmlFor="banner-upload" style={{
                        ...styles.uploadButton,
                        ...(isUploading ? styles.disabledButton : {})
                      }}>
                        {isUploading ? (
                          <>
                            <div style={styles.buttonSpinner}></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            {bannerImageFile ? 'Change Banner' : 'Upload Banner'}
                          </>
                        )}
                      </label>
                    </div>
                    {cloudinaryData.banner && (
                      <div style={styles.cloudinaryIndicator}>
                        <Cloud size={14} />
                        Cloudinary
                      </div>
                    )}
                  </div>
                  {bannerImageFile && (
                    <p style={styles.fileName}>Selected: {bannerImageFile.name}</p>
                  )}
                  {renderUploadProgress('banner')}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Building size={20} />
                Basic Information
              </h3>
              
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Store Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={store.name || ''} 
                    onChange={handleInputChange} 
                    required 
                    style={styles.input}
                    placeholder="Enter your store name"
                    maxLength={100}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>WhatsApp Business Number *</label>
                  <input 
                    type="text" 
                    name="whatsapp_number" 
                    value={store.whatsapp_number || ''} 
                    onChange={handleInputChange} 
                    required
                    style={styles.input}
                    placeholder="+91 9876543210"
                    maxLength={15}
                  />
                  <p style={styles.helpText}>
                    Enter your WhatsApp Business number for customer support
                  </p>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Store Tagline</label>
                <input 
                  type="text" 
                  name="tagline" 
                  value={store.tagline || ''} 
                  onChange={handleInputChange} 
                  style={styles.input}
                  placeholder="Quality Products, Delivered Fast"
                  maxLength={150}
                />
                <span style={styles.charCount}>
                  {(store.tagline || '').length}/150
                </span>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Store Description *</label>
                <textarea 
                  name="description" 
                  value={store.description || ''} 
                  onChange={handleInputChange} 
                  required
                  rows="4" 
                  style={styles.textarea}
                  placeholder="Describe your store and what you sell..."
                  maxLength={500}
                />
                <span style={styles.charCount}>
                  {(store.description || '').length}/500
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Globe size={20} />
                Social Media & Online Presence
              </h3>
              
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Instagram Profile</label>
                  <input 
                    type="url" 
                    name="instagram_link" 
                    value={store.instagram_link || ''} 
                    onChange={handleInputChange} 
                    style={styles.input}
                    placeholder="https://instagram.com/yourstore"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Facebook Page</label>
                  <input 
                    type="url" 
                    name="facebook_link" 
                    value={store.facebook_link || ''} 
                    onChange={handleInputChange} 
                    style={styles.input}
                    placeholder="https://facebook.com/yourstore"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Truck size={20} />
                Delivery Information
              </h3>
              
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Local Delivery Time</label>
                  <input 
                    type="text" 
                    name="delivery_time_local" 
                    value={store.delivery_time_local || ''} 
                    onChange={handleInputChange} 
                    style={styles.input}
                    placeholder="1-2 days"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>National Delivery Time</label>
                  <input 
                    type="text" 
                    name="delivery_time_national" 
                    value={store.delivery_time_national || ''} 
                    onChange={handleInputChange} 
                    style={styles.input}
                    placeholder="3-7 days"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div style={styles.section}>
            {/* Business Verification */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Shield size={20} />
                Business Verification
              </h3>
              
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Business Owner Name</label>
                  <input 
                    type="text" 
                    name="owner_name" 
                    value={store.owner_name || ''} 
                    onChange={handleInputChange} 
                    style={styles.input}
                    placeholder="Full name of business owner"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>GST Number (Optional)</label>
                  <input 
                    type="text" 
                    name="gst_number" 
                    value={store.gst_number || ''} 
                    onChange={handleInputChange} 
                    style={styles.input}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Business Address</label>
                <textarea 
                  name="business_address" 
                  value={store.business_address || ''} 
                  onChange={handleInputChange} 
                  rows="3" 
                  style={styles.textarea}
                  placeholder="Complete business address..."
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Business License Number (Optional)</label>
                <input 
                  type="text" 
                  name="business_license" 
                  value={store.business_license || ''} 
                  onChange={handleInputChange} 
                  style={styles.input}
                  placeholder="Business license or registration number"
                />
              </div>

              {/* Verification Document Upload */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Verification Document (Optional)</label>
                <div style={styles.imageUploadContainer}>
                  {currentDocUrl ? (
                    <img src={currentDocUrl} alt="Verification document" style={styles.docPreview} />
                  ) : (
                    <div style={styles.docPlaceholder}>
                      <FileText size={24} />
                      <span>No Document</span>
                    </div>
                  )}
                  <div style={styles.imageOverlay}>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange('doc', e.target.files[0])} 
                      style={styles.hiddenFileInput} 
                      id="doc-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="doc-upload" style={{
                      ...styles.uploadButton,
                      ...(isUploading ? styles.disabledButton : {})
                    }}>
                      {isUploading ? (
                        <>
                          <div style={styles.buttonSpinner}></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          {verificationDocFile ? 'Change Document' : 'Upload Document'}
                        </>
                      )}
                    </label>
                  </div>
                  {cloudinaryData.document && (
                    <div style={styles.cloudinaryIndicator}>
                      <Cloud size={14} />
                      Cloudinary
                    </div>
                  )}
                </div>
                {verificationDocFile && (
                  <p style={styles.fileName}>Selected: {verificationDocFile.name}</p>
                )}
                {renderUploadProgress('doc')}
                <p style={styles.helpText}>
                  Upload GST certificate, business license, or other verification documents
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <CreditCard size={20} />
                Payment Methods
              </h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Primary Payment Method</label>
                <select 
                  name="payment_method" 
                  value={store.payment_method || 'NONE'} 
                  onChange={handleInputChange} 
                  style={styles.select}
                >
                  <option value="NONE">No Online Payment</option>
                  <option value="UPI">UPI Only</option>
                  <option value="RAZORPAY">Razorpay Gateway</option>
                </select>
              </div>

              {store.payment_method === 'UPI' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>UPI ID *</label>
                  <input 
                    type="text" 
                    name="upi_id" 
                    value={store.upi_id || ''} 
                    onChange={handleInputChange} 
                    required
                    style={styles.input}
                    placeholder="yourname@paytm"
                  />
                </div>
              )}

              {store.payment_method === 'RAZORPAY' && (
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Razorpay Key ID *</label>
                    <input 
                      type="text" 
                      name="razorpay_key_id" 
                      value={store.razorpay_key_id || ''} 
                      onChange={handleInputChange} 
                      required
                      style={styles.input}
                      placeholder="rzp_test_..."
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Razorpay Key Secret *</label>
                    <div style={styles.passwordContainer}>
                      <input 
                        type={showSecrets.razorpay ? "text" : "password"}
                        name="razorpay_key_secret" 
                        value={store.razorpay_key_secret || ''} 
                        onChange={handleInputChange} 
                        required
                        style={styles.input}
                        placeholder="Your secret key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets(prev => ({
                          ...prev,
                          razorpay: !prev.razorpay
                        }))}
                        style={styles.eyeButton}
                      >
                        {showSecrets.razorpay ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="accepts_cod" 
                    checked={store.accepts_cod || false} 
                    onChange={handleInputChange} 
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>Accept Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>

            {/* SEO Settings */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Search size={20} />
                SEO & Marketing
              </h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Meta Title (Optional)</label>
                <input 
                  type="text" 
                  name="meta_title" 
                  value={store.meta_title || ''} 
                  onChange={handleInputChange} 
                  style={styles.input}
                  placeholder="Best Electronics Store in Kerala | Your Store"
                  maxLength={60}
                />
                <span style={styles.charCount}>
                  {(store.meta_title || '').length}/60
                </span>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Meta Description (Optional)</label>
                <textarea 
                  name="meta_description" 
                  value={store.meta_description || ''} 
                  onChange={handleInputChange} 
                  rows="3" 
                  style={styles.textarea}
                  placeholder="Describe your store for search engines..."
                  maxLength={160}
                />
                <span style={styles.charCount}>
                  {(store.meta_description || '').length}/160
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div style={styles.submitSection}>
          <button 
            type="submit" 
            disabled={isSaving || isUploading} 
            style={{
              ...styles.submitButton,
              ...(isSaving || isUploading ? styles.disabledButton : {})
            }}
          >
            {isSaving ? (
              <>
                <div style={styles.buttonSpinner}></div>
                {isProfileComplete ? 'Updating Profile...' : 'Creating Profile...'}
              </>
            ) : isUploading ? (
              <>
                <div style={styles.buttonSpinner}></div>
                Uploading to Cloudinary...
              </>
            ) : (
              <>
                <Save size={18} />
                {isProfileComplete ? 'Update Profile' : 'Create Profile'}
              </>
            )}
          </button>
          
          <button 
            type="button" 
            onClick={fetchStoreProfile}
            style={styles.refreshButton}
            disabled={isSaving || isUploading}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </form>

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
        
        .imageUploadContainer:hover .imageOverlay {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

// ✅ COMPLETE STYLES
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px',
    animation: 'fadeIn 0.6s ease-out'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
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
    animation: 'spin 1s linear infinite',
    marginRight: '8px'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '20px'
  },
  
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  
  subtitle: {
    color: '#6b7280',
    margin: 0,
    fontSize: '1rem'
  },

  cloudinaryNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#10b981',
    marginTop: '4px'
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

  verificationStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    border: '2px solid',
    borderRadius: '12px',
    minWidth: '250px'
  },
  
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto'
  },

  progressBar: {
    width: '100px',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden'
  },

  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '4px'
  },

  progressText: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500'
  },

  tabContainer: {
    display: 'flex',
    marginBottom: '32px',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 20px',
    background: 'none',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  
  activeTab: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  
  tabBadge: {
    padding: '3px 8px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    marginLeft: 'auto'
  },
  
  tabBadgeOptional: {
    padding: '3px 8px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    marginLeft: 'auto'
  },
  
  form: {
    animation: 'fadeIn 0.6s ease-out'
  },
  
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f3f4f6'
  },

  cloudinaryBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginLeft: 'auto',
    padding: '4px 12px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600'
  },
  
  brandingContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px'
  },

  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  bannerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  imageUploadContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px dashed #d1d5db',
    backgroundColor: '#f9fafb'
  },

  logoPreview: {
    width: '100%',
    height: '200px',
    objectFit: 'contain',
    backgroundColor: 'white'
  },

  bannerPreview: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },

  docPreview: {
    width: '100%',
    height: '200px',
    objectFit: 'contain',
    backgroundColor: 'white'
  },

  logoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#6b7280',
    gap: '8px'
  },

  bannerPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#6b7280',
    gap: '8px'
  },

  docPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#6b7280',
    gap: '8px'
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
    transition: 'opacity 0.2s'
  },

  hiddenFileInput: {
    display: 'none'
  },

  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.2s'
  },

  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.7
  },

  cloudinaryIndicator: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  },

  uploadProgress: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '2px solid #e2e8f0'
  },
  
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  
  progressFileName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '200px'
  },
  
  progressPercentage: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280'
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  
  input: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: 'white'
  },

  select: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  
  textarea: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    resize: 'vertical',
    fontFamily: 'inherit',
    backgroundColor: 'white'
  },
  
  charCount: {
    fontSize: '12px',
    color: '#9ca3af',
    alignSelf: 'flex-end'
  },
  
  helpText: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.4'
  },
  
  fileName: {
    fontSize: '12px',
    color: '#059669',
    fontWeight: '500'
  },

  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px'
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },

  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },

  checkboxText: {
    fontSize: '14px',
    color: '#374151'
  },

  submitSection: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: '32px',
    borderTop: '2px solid #f3f4f6',
    marginTop: '32px'
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
    fontWeight: '600',
    transition: 'all 0.2s'
  },

  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  }
};
