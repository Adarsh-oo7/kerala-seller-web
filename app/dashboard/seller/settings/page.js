'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Shield, Upload, Check, AlertCircle, Star, Settings, Building, FileText, CreditCard, Phone, Globe, Truck, Search, Eye, EyeOff, X, RefreshCw, Save
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/user/store/profile/`;

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
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [showSecrets, setShowSecrets] = useState({});
  const router = useRouter();

  // ✅ FIXED: Use Bearer authentication instead of Token
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
    
    const formData = new FormData();
    
    // Append store data
    Object.keys(store).forEach(key => {
      if (store[key] !== null && store[key] !== undefined) {
        formData.append(key, store[key]);
      }
    });
    
    // Append files if they exist
    if (bannerImageFile) formData.append('banner_image', bannerImageFile);
    if (logoFile) formData.append('logo', logoFile);
    if (verificationDocFile) formData.append('verification_doc', verificationDocFile);

    try {
      // ✅ FIXED: Use headers correctly without overriding Content-Type
      const response = await axios.patch(API_URL, formData, { 
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setCurrentBannerUrl(response.data.store_profile?.banner_image_url || '');
      setCurrentLogoUrl(response.data.store_profile?.logo_url || '');
      setCurrentDocUrl(response.data.store_profile?.verification_doc_url || '');
      setSuccessMessage('Store settings updated successfully!');
      
      // Reset file inputs
      setBannerImageFile(null);
      setLogoFile(null);
      setVerificationDocFile(null);
      
      // Reset file input elements
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
      calculateProgress(response.data.store_profile || {});
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          'Failed to update store settings. Please try again.';
      setErrorMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (fileType, file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file && file.size > maxSize) {
      setErrorMessage(`File size too large. Maximum allowed size is 5MB.`);
      return;
    }
    
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
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

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
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Settings size={28} />
            Store Settings
          </h1>
          <p style={styles.subtitle}>Manage your store information and verification status</p>
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
        {/* Mandatory Section */}
        {activeTab === 'mandatory' && (
          <div style={styles.section}>
            {/* Store Branding */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Star size={20} />
                Store Branding
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
                      />
                      <label htmlFor="logo-upload" style={styles.uploadButton}>
                        <Upload size={16} />
                        {logoFile ? 'Change Logo' : 'Upload Logo'}
                      </label>
                    </div>
                  </div>
                  {logoFile && (
                    <p style={styles.fileName}>Selected: {logoFile.name}</p>
                  )}
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
                      />
                      <label htmlFor="banner-upload" style={styles.uploadButton}>
                        <Upload size={16} />
                        {bannerImageFile ? 'Change Banner' : 'Upload Banner'}
                      </label>
                    </div>
                  </div>
                  {bannerImageFile && (
                    <p style={styles.fileName}>Selected: {bannerImageFile.name}</p>
                  )}
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

            {/* Contact Information */}
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

        {/* Optional Section */}
        {activeTab === 'optional' && (
          <div style={styles.section}>
            {/* Verification Documents */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Shield size={20} />
                Business Verification
              </h3>
              <p style={styles.sectionDescription}>
                Upload your business documents to get verified and build customer trust
              </p>
              
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Business Owner Name</label>
                  <input 
                    type="text" 
                    name="owner_name" 
                    value={store.owner_name || ''} 
                    onChange={handleInputChange} 
                    style={styles.input}
                    placeholder="Full name as per documents"
                    maxLength={100}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>GST Number</label>
                  <input 
                    type="text" 
                    name="gst_number" 
                    value={store.gst_number || ''} 
                    onChange={handleInputChange} 
                    style={styles.input}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
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
                  placeholder="Complete business address with pincode"
                  maxLength={300}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Business License Number</label>
                <input 
                  type="text" 
                  name="business_license" 
                  value={store.business_license || ''} 
                  onChange={handleInputChange} 
                  style={styles.input}
                  placeholder="Trade license or registration number"
                  maxLength={50}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Identity Proof Document</label>
                <div style={styles.fileUploadArea}>
                  {currentDocUrl ? (
                    <div style={styles.filePreview}>
                      <FileText size={24} />
                      <span>Document uploaded successfully</span>
                      <a href={currentDocUrl} target="_blank" rel="noopener noreferrer" style={styles.viewLink}>
                        <Eye size={16} />
                        View Document
                      </a>
                    </div>
                  ) : (
                    <div style={styles.uploadPlaceholder}>
                      <Upload size={32} />
                      <span>Upload Aadhaar, PAN, or Business License</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('doc', e.target.files[0])} 
                    style={styles.hiddenFileInput}
                    id="doc-upload"
                  />
                  <label htmlFor="doc-upload" style={styles.uploadButton}>
                    <Upload size={16} />
                    {verificationDocFile ? `Change Document (${verificationDocFile.name})` : 'Choose Document'}
                  </label>
                </div>
                <p style={styles.helpText}>
                  Supported formats: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>
            </div>

            {/* Delivery Settings */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Truck size={20} />
                Delivery Settings
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
                    placeholder="2-3 business days"
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
                    placeholder="5-7 business days"
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Search size={20} />
                SEO Settings
              </h3>
              <p style={styles.sectionDescription}>
                Optimize your store for search engines to improve visibility
              </p>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>SEO Title</label>
                <input 
                  type="text" 
                  name="meta_title" 
                  value={store.meta_title || ''} 
                  onChange={handleInputChange} 
                  style={styles.input}
                  maxLength="60"
                  placeholder="Your Store - Quality Products Online"
                />
                <span style={styles.charCount}>{(store.meta_title || '').length}/60</span>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>SEO Description</label>
                <textarea 
                  name="meta_description" 
                  value={store.meta_description || ''} 
                  onChange={handleInputChange} 
                  rows="3" 
                  style={styles.textarea}
                  maxLength="160"
                  placeholder="Shop quality products at great prices. Fast delivery across Kerala."
                />
                <span style={styles.charCount}>{(store.meta_description || '').length}/160</span>
              </div>
            </div>

            {/* Payment Settings */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <CreditCard size={20} />
                Payment Settings
              </h3>
              <p style={styles.sectionDescription}>
                Configure payment methods for your online store
              </p>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Payment Gateway</label>
                <select 
                  name="payment_method" 
                  value={store.payment_method} 
                  onChange={handleInputChange} 
                  style={styles.select}
                >
                  <option value="NONE">None (COD Only)</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="UPI">UPI Link</option>
                </select>
              </div>
              
              {store.payment_method === 'RAZORPAY' && (
                <div style={styles.paymentConfig}>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Razorpay Key ID</label>
                      <input 
                        type="text" 
                        name="razorpay_key_id" 
                        value={store.razorpay_key_id || ''} 
                        onChange={handleInputChange} 
                        style={styles.input}
                        placeholder="rzp_test_..."
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Razorpay Key Secret</label>
                      <div style={styles.passwordContainer}>
                        <input 
                          type={showSecrets.razorpay ? "text" : "password"}
                          name="razorpay_key_secret" 
                          value={store.razorpay_key_secret || ''} 
                          onChange={handleInputChange} 
                          style={styles.passwordInput}
                          placeholder="••••••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility('razorpay')}
                          style={styles.passwordToggle}
                        >
                          {showSecrets.razorpay ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {store.payment_method === 'UPI' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>UPI ID</label>
                  <input 
                    type="text" 
                    name="upi_id" 
                    value={store.upi_id || ''} 
                    onChange={handleInputChange} 
                    style={styles.input}
                    placeholder="yourstore@paytm"
                  />
                </div>
              )}
              
              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="accepts_cod" 
                    checked={store.accepts_cod} 
                    onChange={handleInputChange} 
                    style={styles.checkbox}
                  />
                  <span>Accept Cash on Delivery (COD)</span>
                </label>
                <p style={styles.helpText}>
                  Enable COD for local deliveries and better customer reach
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div style={styles.submitSection}>
          <button 
            type="submit" 
            disabled={isSaving} 
            style={{
              ...styles.submitButton,
              ...(isSaving ? styles.disabledButton : {})
            }}
          >
            {isSaving ? (
              <>
                <div style={styles.buttonSpinner}></div>
                Saving Changes...
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
            disabled={isSaving}
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
    transition: 'width 0.5s ease',
    borderRadius: '4px'
  },
  
  progressText: {
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '65px'
  },

  // Tabs
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

  // Form
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
  
  sectionDescription: {
    color: '#6b7280',
    marginBottom: '24px',
    fontSize: '14px',
    lineHeight: '1.5'
  },

  // Branding
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
    textDecoration: 'none'
  },

  // Form Elements
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
  
  select: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
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

  // File Upload
  fileUploadArea: {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '24px',
    backgroundColor: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },

  filePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#059669'
  },

  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
    textAlign: 'center'
  },

  viewLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500'
  },

  // Password Input
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  passwordInput: {
    padding: '12px 48px 12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    width: '100%'
  },

  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px'
  },

  // Payment Config
  paymentConfig: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },

  // Checkbox
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151'
  },

  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#3b82f6'
  },

  // Submit Section
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

  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
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
