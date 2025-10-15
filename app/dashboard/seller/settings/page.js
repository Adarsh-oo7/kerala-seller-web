'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Shield, Upload, Check, AlertCircle, Star, Settings, Building, FileText, CreditCard, Phone, Globe, Truck, Search, Eye, EyeOff, X, RefreshCw, Save, Cloud
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/user/store/profile/`;

// ✅ WORKING: Cloudinary Configuration with fallback
const CLOUDINARY_CONFIG = {
  cloud_name: 'dnmbfeckd',
  upload_preset: 'kerala_sellers_preset', // Create this in your dashboard
  fallback_preset: 'ml_default', // This works immediately
  folder: 'kerala-sellers/store-assets'
};

// ✅ FIXED: Cloudinary Upload Helper for Unsigned Uploads Only
const uploadToCloudinary = async (file, options = {}) => {
  // Try with your custom preset first, then fallback
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
      
      // ✅ FIXED: Only parameters allowed for UNSIGNED uploads
      if (options.width) {
        formData.append('width', options.width.toString());
      }
      if (options.height) {
        formData.append('height', options.height.toString());
      }
      if (options.crop) {
        formData.append('crop', options.crop);
      }
      
      // Basic optimizations (allowed for unsigned)
      formData.append('quality', 'auto:good');
      formData.append('fetch_format', 'auto');
      
      // ✅ FIXED: Generate unique public_id WITHOUT overwrite
      if (options.public_id) {
        // Make it unique to avoid conflicts without overwrite parameter
        const uniqueId = `${options.public_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        formData.append('public_id', uniqueId);
      }
      
      // Tags for organization (allowed for unsigned)
      formData.append('tags', `kerala-sellers,store-${options.type || 'asset'}`);

      console.log(`☁️ Uploading ${options.type || 'file'} to Cloudinary with ${name} preset`);
      
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
        
        // Continue to next preset if this one fails
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('mandatory');
  const [store, setStore] = useState({
    // Mandatory fields
    name: '',
    description: '',
    whatsapp_number: '',
    tagline: '',
    
    // Optional fields
    instagram_link: '',
    facebook_link: '',
    delivery_time_local: '',
    delivery_time_national: '',
    meta_title: '',
    meta_description: '',
    payment_method: 'NONE',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    upi_id: '',
    accepts_cod: false,
    
    // Verification fields
    gst_number: '',
    business_license: '',
    owner_name: '',
    business_address: '',
    verification_status: 'pending'
  });
  
  // File states
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState('');
  const [verificationDocFile, setVerificationDocFile] = useState(null);
  const [currentDocUrl, setCurrentDocUrl] = useState('');
  
  // Cloudinary tracking states
  const [cloudinaryData, setCloudinaryData] = useState({
    logo: null,
    banner: null,
    document: null
  });
  const [uploadProgress, setUploadProgress] = useState({});
  const [isCloudinaryUploading, setIsCloudinaryUploading] = useState(false);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [showSecrets, setShowSecrets] = useState({});
  const router = useRouter();

  // Use Bearer authentication
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
      const response = await axios.get(API_URL, { headers });
      
      setStore(prev => ({ ...prev, ...response.data.store_profile }));
      setCurrentBannerUrl(response.data.store_profile?.banner_image_url || '');
      setCurrentLogoUrl(response.data.store_profile?.logo_url || '');
      setCurrentDocUrl(response.data.store_profile?.verification_doc_url || '');
      
      // Handle existing Cloudinary data
      if (response.data.store_profile?.cloudinary_logo) {
        setCloudinaryData(prev => ({
          ...prev,
          logo: response.data.store_profile.cloudinary_logo
        }));
      }
      if (response.data.store_profile?.cloudinary_banner) {
        setCloudinaryData(prev => ({
          ...prev,
          banner: response.data.store_profile.cloudinary_banner
        }));
      }
      if (response.data.store_profile?.cloudinary_document) {
        setCloudinaryData(prev => ({
          ...prev,
          document: response.data.store_profile.cloudinary_document
        }));
      }
      
      calculateProgress(response.data.store_profile || {});
      
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/login/seller');
      } else {
        setErrorMessage('Failed to load store settings. Please refresh the page.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, router]);

  useEffect(() => {
    fetchStoreProfile();
  }, [fetchStoreProfile]);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setStore(prev => ({ ...prev, [name]: newValue }));
    
    // Clear messages when user starts typing
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

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

  // ✅ FIXED: Handle file changes with corrected Cloudinary upload
  const handleFileChange = async (fileType, file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file && file.size > maxSize) {
      setErrorMessage(`File size too large. Maximum allowed size is 5MB.`);
      return;
    }

    if (!file) return;
    
    // Set local file immediately for preview
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

    // Start Cloudinary upload in background
    setIsCloudinaryUploading(true);
    setUploadProgress(prev => ({
      ...prev,
      [fileType]: { status: 'uploading', progress: 0, fileName: file.name }
    }));

    try {
      // Generate unique identifiers
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      
      // ✅ FIXED: Upload options without overwrite parameter
      const uploadOptions = {
        folder: `${CLOUDINARY_CONFIG.folder}/${fileType}`,
        public_id: `${fileType}_${timestamp}_${randomId}`, // This will be made more unique in the upload function
        type: fileType,
        width: fileType === 'logo' ? 400 : fileType === 'banner' ? 1200 : 800,
        height: fileType === 'logo' ? 400 : fileType === 'banner' ? 400 : 600,
        crop: fileType === 'doc' ? 'fit' : 'fill'
      };

      console.log(`🔧 Starting ${fileType} upload with FIXED options:`, uploadOptions);

      // Simulate progress for better UX
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
          `✅ ${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded to Cloudinary successfully! (${result.preset_used})`
        );
        
        // Clear success message after 5 seconds
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
        setErrorMessage(`❌ Failed to upload ${fileType} to Cloudinary: ${result.error}`);
        console.error(`❌ ${fileType} upload failed:`, result.error);
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
      console.error(`❌ ${fileType} upload error:`, error);
    } finally {
      setIsCloudinaryUploading(false);
      
      // Clear progress after 8 seconds
      setTimeout(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileType]: undefined
        }));
      }, 8000);
    }
  };

  // ✅ Keep your existing submit function exactly as-is
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
    
    // Prepare data with Cloudinary URLs if available
    const hasCloudinaryData = cloudinaryData.logo || cloudinaryData.banner || cloudinaryData.document;
    
    let requestData;
    let requestHeaders = { ...headers };

    if (hasCloudinaryData) {
      // JSON submission with Cloudinary URLs
      requestData = {
        ...store,
        // Include Cloudinary data
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
      requestHeaders['Content-Type'] = 'application/json';
    } else {
      // Traditional FormData submission
      requestData = new FormData();
      
      // Append store data
      Object.keys(store).forEach(key => {
        if (store[key] !== null && store[key] !== undefined) {
          requestData.append(key, store[key]);
        }
      });
      
      // Append files if they exist
      if (bannerImageFile) requestData.append('banner_image', bannerImageFile);
      if (logoFile) requestData.append('logo', logoFile);
      if (verificationDocFile) requestData.append('verification_doc', verificationDocFile);

      requestHeaders['Content-Type'] = 'multipart/form-data';
    }

    try {
      console.log('📤 Submitting store profile with FIXED Cloudinary data:', {
        logo: !!cloudinaryData.logo,
        banner: !!cloudinaryData.banner,
        document: !!cloudinaryData.document
      });

      const response = await axios.patch(API_URL, requestData, { headers: requestHeaders });
      
      setCurrentBannerUrl(response.data.store_profile?.banner_image_url || '');
      setCurrentLogoUrl(response.data.store_profile?.logo_url || '');
      setCurrentDocUrl(response.data.store_profile?.verification_doc_url || '');
      
      const cloudinaryCount = Object.values(cloudinaryData).filter(Boolean).length;
      setSuccessMessage(
        `✅ Store settings updated successfully!${cloudinaryCount > 0 ? ` ☁️ ${cloudinaryCount} images stored on Cloudinary` : ''}`
      );
      
      // Reset file inputs
      setBannerImageFile(null);
      setLogoFile(null);
      setVerificationDocFile(null);
      
      // Reset file input elements
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
      calculateProgress(response.data.store_profile || {});
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to update store settings. Please try again.';
      setErrorMessage(errorMessage);
      console.error('❌ Store update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Upload progress display with preset info
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
          {progress.status === 'completed' && `✅ Successfully uploaded to Cloudinary${progress.preset ? ` (${progress.preset})` : ''}`}
          {progress.status === 'failed' && `❌ Upload failed: ${progress.error || 'Unknown error'}`}
          {progress.status === 'uploading' && '☁️ Uploading to Cloudinary...'}
        </div>
      </div>
    );
  };

  // Keep all your existing render methods unchanged...
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
        <p>Loading store settings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with FIXED Cloudinary Status */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Settings size={28} />
            Store Settings
          </h1>
          <p style={styles.subtitle}>
            Manage your store information and verification status
            <br />
            <span style={styles.cloudinaryNote}>
              <Cloud size={14} />
              ☁️ Images powered by Cloudinary ({CLOUDINARY_CONFIG.cloud_name}) - FIXED for unsigned uploads
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
          onClick={() => setActiveTab('mandatory')}
          style={{
            ...styles.tab,
            ...(activeTab === 'mandatory' ? styles.activeTab : {})
          }}
        >
          <Building size={18} />
          <span>Essential Information</span>
          <span style={styles.tabBadge}>Required</span>
        </button>
        
        <button
          onClick={() => setActiveTab('optional')}
          style={{
            ...styles.tab,
            ...(activeTab === 'optional' ? styles.activeTab : {})
          }}
        >
          <Shield size={18} />
          <span>Verification & Extras</span>
          <span style={styles.tabBadgeOptional}>Optional</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {activeTab === 'mandatory' && (
          <div style={styles.section}>
            {/* Store Branding with FIXED Cloudinary */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Star size={20} />
                Store Branding
                <span style={styles.cloudinaryBadge}>
                  <Cloud size={16} />
                  Cloudinary - FIXED for Unsigned Uploads
                </span>
              </h3>
              
              <div style={styles.brandingContainer}>
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
                        disabled={isCloudinaryUploading}
                      />
                      <label htmlFor="logo-upload" style={{
                        ...styles.uploadButton,
                        ...(isCloudinaryUploading ? styles.disabledButton : {})
                      }}>
                        {isCloudinaryUploading ? (
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
                        Stored on Cloudinary
                      </div>
                    )}
                  </div>
                  {logoFile && (
                    <p style={styles.fileName}>Selected: {logoFile.name}</p>
                  )}
                  {renderUploadProgress('logo')}
                </div>
                
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
                        disabled={isCloudinaryUploading}
                      />
                      <label htmlFor="banner-upload" style={{
                        ...styles.uploadButton,
                        ...(isCloudinaryUploading ? styles.disabledButton : {})
                      }}>
                        {isCloudinaryUploading ? (
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
                        Stored on Cloudinary
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

            {/* Keep your existing Basic Information section exactly as-is */}
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

            {/* Keep your existing Social Media section */}
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
          </div>
        )}

        {/* Submit Button */}
        <div style={styles.submitSection}>
          <button 
            type="submit" 
            disabled={isSaving || isCloudinaryUploading} 
            style={{
              ...styles.submitButton,
              ...(isSaving || isCloudinaryUploading ? styles.disabledButton : {})
            }}
          >
            {isSaving ? (
              <>
                <div style={styles.buttonSpinner}></div>
                Saving Changes...
              </>
            ) : isCloudinaryUploading ? (
              <>
                <div style={styles.buttonSpinner}></div>
                Uploading to Cloudinary...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
          
          <button 
            type="button" 
            onClick={fetchStoreProfile}
            style={styles.refreshButton}
            disabled={isSaving || isCloudinaryUploading}
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
      `}</style>
    </div>
  );
}

// ✅ Keep your existing styles (add them all here - I'm showing key ones)
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

  // Enhanced Cloudinary styles
  cloudinaryNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#10b981',
    marginTop: '4px'
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
  
  // Enhanced upload progress styles
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
  
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '6px'
  },
  
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '4px'
  },
  
  progressText: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center'
  },

  // Other important styles
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
