'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, Upload, Check, AlertCircle, Star, Building,
  CreditCard, Save, ExternalLink, Eye, EyeOff, Image as ImageIcon
} from 'lucide-react';

// API configuration
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl !== 'undefined') return envUrl;
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const API_URL = `${API_BASE_URL}/user/store/profile/`;

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
  cloudname: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnmbfeckd',
  uploadpreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'keralasellers_preset',
  fallbackpreset: 'ml_default',
  folder: 'kerala-sellers/store-profiles',
};

// Cloudinary Upload Function
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
      if (options.width) formData.append('width', options.width.toString());
      if (options.height) formData.append('height', options.height.toString());
      if (options.crop) formData.append('crop', options.crop);
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

export default function SettingsPage() {
  const [store, setStore] = useState({
    name: '',
    description: '',
    tagline: '',
    whatsappnumber: '',
    deliverytimelocal: '',
    deliverytimenational: '',
    paymentmethod: 'CASHFREE',
    acceptscod: false,
    cashfree_bank_account: '',
    cashfree_ifsc: '',
    cashfree_account_holder: '',
    razorpaykeyid: '',
    razorpaykeysecret: '',
    upiid: '',
  });

  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  const [currentBannerUrl, setCurrentBannerUrl] = useState('');
  const [cloudinaryData, setCloudinaryData] = useState({ logo: null, banner: null });
  const [predefinedBanners, setPredefinedBanners] = useState([]);
const [selectedPredefinedBanners, setSelectedPredefinedBanners] = useState([]);
const [currentBannerUrls, setCurrentBannerUrls] = useState([]);
  const [showBannerGallery, setShowBannerGallery] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConnectingCashfree, setIsConnectingCashfree] = useState(false);
  const [cashfreeConnected, setCashfreeConnected] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSecrets, setShowSecrets] = useState({});

  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  const fetchPredefinedBanners = useCallback(async () => {
    try {
      console.log('🎨 Fetching banners from:', `${API_BASE_URL}/api/predefined-banners/`);
      const response = await axios.get(`${API_BASE_URL}/api/predefined-banners/`);
      console.log('🎨 Banners response:', response.data);
      setPredefinedBanners(response.data.filter(b => b.is_active));
    } catch (error) {
      console.error('❌ Error fetching predefined banners:', error);
    }
  }, []);

  const fetchStoreProfile = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setIsLoading(true);
      const response = await axios.get(API_URL, { headers });
      
      if (response.data.store_profile) {
        setStore((prev) => ({ ...prev, ...response.data.store_profile }));
        setCurrentLogoUrl(response.data.store_profile.logo_url);
        setCurrentBannerUrl(response.data.store_profile.banner_1_url || response.data.store_profile.banner_image_url);
        
        const banners = [];
const bannerUrls = [];
if (response.data.store_profile.predefined_banner_1) {
  banners.push(response.data.store_profile.predefined_banner_1);
  bannerUrls.push(response.data.store_profile.banner_1_url);
}
if (response.data.store_profile.predefined_banner_2) {
  banners.push(response.data.store_profile.predefined_banner_2);
  bannerUrls.push(response.data.store_profile.banner_2_url);
}
if (response.data.store_profile.predefined_banner_3) {
  banners.push(response.data.store_profile.predefined_banner_3);
  bannerUrls.push(response.data.store_profile.banner_3_url);
}
setSelectedPredefinedBanners(banners);
setCurrentBannerUrls(bannerUrls);

      }

      await checkCashfreeStatus();
    } catch (error) {
      console.error('Error fetching store profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  const checkCashfreeStatus = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/payments/cashfree/vendor/status/`,
        { headers }
      );
      if (response.data.registered) {
        setCashfreeConnected(true);
      }
    } catch (error) {
      console.log('No Cashfree vendor found');
    }
  };

  useEffect(() => {
    fetchStoreProfile();
    fetchPredefinedBanners();
  }, [fetchStoreProfile, fetchPredefinedBanners]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStore((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    if (name === 'paymentmethod' && value !== 'CASHFREE') {
      setCashfreeConnected(false);
    }
  };

  const handleFileChange = async (fileType, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size too large. Maximum 5MB.');
      return;
    }

    setIsUploading(true);
    const result = await uploadToCloudinary(file, {
      folder: `${CLOUDINARY_CONFIG.folder}/${fileType}`,
      width: fileType === 'logo' ? 400 : 1200,
      height: fileType === 'logo' ? 400 : 400,
      crop: 'fill',
    });

    if (result.success) {
      setCloudinaryData((prev) => ({ ...prev, [fileType]: result }));
      if (fileType === 'logo') setCurrentLogoUrl(result.url);
      if (fileType === 'banner') {
  setCurrentBannerUrls([result.url]);
  setSelectedPredefinedBanners([]);
}

      setSuccessMessage(`${fileType} uploaded successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(`Failed to upload ${fileType}`);
    }
    setIsUploading(false);
  };

  const handleCashfreeConnect = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    if (!store.cashfree_bank_account?.trim()) {
      setErrorMessage('Bank account number is required');
      return;
    }
    if (!store.cashfree_ifsc?.trim()) {
      setErrorMessage('IFSC code is required');
      return;
    }
    if (!store.cashfree_account_holder?.trim()) {
      setErrorMessage('Account holder name is required');
      return;
    }

    try {
      setIsConnectingCashfree(true);
      setErrorMessage('');

      const response = await axios.post(
        `${API_BASE_URL}/api/payments/cashfree/vendor/register/`,
        {
          bank_account: store.cashfree_bank_account,
          ifsc: store.cashfree_ifsc,
          account_holder_name: store.cashfree_account_holder,
          email: `${store.whatsappnumber}@keralasellers.com`,
        },
        { headers }
      );

      if (response.data.vendor_id) {
        setCashfreeConnected(true);
        setSuccessMessage('Bank account registered! You will receive 100% of sales directly.');
      }
    } catch (error) {
      console.error('Cashfree error:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to register bank account');
    } finally {
      setIsConnectingCashfree(false);
    }
  };
const handleBannerSelect = (bannerId, bannerUrl) => {
  if (selectedPredefinedBanners.includes(bannerId)) {
    // Deselect
    setSelectedPredefinedBanners(prev => prev.filter(id => id !== bannerId));
    setCurrentBannerUrls(prev => prev.filter(url => url !== bannerUrl));
  } else if (selectedPredefinedBanners.length < 3) {
    // Select (max 3)
    setSelectedPredefinedBanners(prev => [...prev, bannerId]);
    setCurrentBannerUrls(prev => [...prev, bannerUrl]);
  } else {
    setErrorMessage('⚠️ Maximum 3 banners allowed');
    setTimeout(() => setErrorMessage(''), 3000);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Form submitted!');
    console.log('📦 Store data:', store);
    console.log('🎨 Cloudinary data:', cloudinaryData);
    console.log('🖼️ Selected banners:', selectedPredefinedBanners);


    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    if (!store.name?.trim() || !store.description?.trim() || !store.whatsappnumber?.trim()) {
      setErrorMessage('Please fill all required fields');
      console.log('❌ Validation failed: Missing required fields');
      return;
    }

    if (store.paymentmethod === 'CASHFREE' && !cashfreeConnected) {
      setErrorMessage('Please register your bank account first');
      console.log('❌ Validation failed: Cashfree not connected');
      return;
    }
    if (store.paymentmethod === 'RAZORPAY' && (!store.razorpaykeyid?.trim() || !store.razorpaykeysecret?.trim())) {
      setErrorMessage('Please fill Razorpay credentials');
      console.log('❌ Validation failed: Razorpay credentials missing');
      return;
    }
    if (store.paymentmethod === 'UPI' && !store.upiid?.trim()) {
      setErrorMessage('Please fill UPI ID');
      console.log('❌ Validation failed: UPI ID missing');
      return;
    }

    setIsSaving(true);
    const headers = getAuthHeaders();
    if (!headers) {
      setIsSaving(false);
      return;
    }

    try {
      const requestData = {
  ...store,
  predefined_banner_1: selectedPredefinedBanners[0] || null,
  predefined_banner_2: selectedPredefinedBanners[1] || null,
  predefined_banner_3: selectedPredefinedBanners[2] || null,
  cloudinary_logo: cloudinaryData.logo ? { 
    public_id: cloudinaryData.logo.publicid, 
    url: cloudinaryData.logo.url 
  } : null,
  cloudinary_banner_1: cloudinaryData.banner ? { 
    public_id: cloudinaryData.banner.publicid, 
    url: cloudinaryData.banner.url 
  } : null,
};


      console.log('📤 Sending request:', requestData);

      const response = await axios.patch(API_URL, requestData, { headers });

      console.log('✅ Response received:', response.data);

      if (response.data.store_profile) {
        setStore((prev) => ({ ...prev, ...response.data.store_profile }));
      }

      setSuccessMessage('✅ Settings updated successfully!');
      console.log('✅ SUCCESS: Settings saved!');
      
      // Keep message visible for 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('❌ Error saving:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.detail ||
                       'Failed to update settings';
      setErrorMessage(errorMsg);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <h1 style={styles.title}>Store Settings</h1>
          <p style={styles.subtitle}>Manage your store information and preferences</p>
        </div>
        <Link href="/seller/settings/advanced" style={styles.advancedLink}>
          <Shield size={18} />
          Advanced Settings
          <ExternalLink size={16} />
        </Link>
      </div>

      {successMessage && (
        <div style={styles.successAlert}>
          <Check size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={styles.errorAlert}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Store Images */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Star size={20} />
            Store Images
          </h3>

          <div style={styles.imageGrid}>
            {/* Logo */}
            <div>
              <label style={styles.label}>Store Logo</label>
              <div style={styles.imageUploadContainer}>
                {currentLogoUrl ? (
                  <img src={currentLogoUrl} alt="Logo" style={styles.logoPreview} />
                ) : (
                  <div style={styles.placeholder}>
                    <Upload size={24} />
                    <span>No Logo</span>
                  </div>
                )}
                <div style={styles.imageOverlay}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('logo', e.target.files[0])}
                    style={styles.hiddenInput}
                    id="logo-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="logo-upload" style={styles.uploadButton}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </label>
                </div>
              </div>
            </div>

            {/* Banner with Gallery Selection */}
            <div>
              <label style={styles.label}>Store Banner</label>
              
              {/* Gallery Button */}
              <button
                type="button"
                onClick={() => setShowBannerGallery(!showBannerGallery)}
                style={{
                  ...styles.galleryButton,
                 backgroundColor: selectedPredefinedBanners.length > 0 ? '#10b981' : '#8b5cf6'

                }}
              >
                <ImageIcon size={16} />
{selectedPredefinedBanners.length > 0 
  ? `✅ ${selectedPredefinedBanners.length} Banner${selectedPredefinedBanners.length > 1 ? 's' : ''} Selected` 
  : '🎨 Choose Banners (Max 3)'}
              </button>

              {/* Banner Gallery */}
              {showBannerGallery && (
                <div style={styles.bannerGallery}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
{predefinedBanners.length > 0 
  ? `Select Banners (${selectedPredefinedBanners.length}/3 selected)` 
  : 'No banners available'}                  </h4>
                  {predefinedBanners.length > 0 ? (
                    <div style={styles.galleryGrid}>
                      {predefinedBanners.map((banner) => (
                        <div
                          key={banner.id}
                          onClick={() => handleBannerSelect(banner.id, banner.image_url)}

                          style={{
                            ...styles.galleryItem,
                           ...(selectedPredefinedBanners.includes(banner.id) ? styles.galleryItemSelected : {})

                          }}
                        >
                          <img 
                            src={banner.image_url} 
                            alt={banner.name} 
                            style={styles.galleryImage} 
                          />
                          {selectedPredefinedBanners.includes(banner.id) && (
  <div style={styles.selectedBadge}>
    <Check size={14} />
    #{selectedPredefinedBanners.indexOf(banner.id) + 1}
  </div>
)}

                          <div style={styles.bannerName}>{banner.name}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                      No banners uploaded yet. Contact admin to add banners.
                    </p>
                  )}
                </div>
              )}
{/* Selected Banners Preview */}
{currentBannerUrls.length > 0 && (
  <div style={{ marginTop: '12px', marginBottom: '12px' }}>
    <label style={styles.label}>Selected Banners ({currentBannerUrls.length})</label>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', marginTop: '8px' }}>
      {currentBannerUrls.map((url, index) => (
        <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px solid #10b981' }}>
          <img src={url} alt={`Banner ${index + 1}`} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: '4px', left: '4px', backgroundColor: '#10b981', color: 'white', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontWeight: 600 }}>
            #{index + 1}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

              {/* Custom Upload */}
              <div style={styles.imageUploadContainer}>
                {currentBannerUrl ? (
                  <img src={currentBannerUrl} alt="Banner" style={styles.bannerPreview} />
                ) : (
                  <div style={styles.placeholder}>
                    <Upload size={24} />
                    <span>No Banner</span>
                  </div>
                )}
                <div style={styles.imageOverlay}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('banner', e.target.files[0])}
                    style={styles.hiddenInput}
                    id="banner-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="banner-upload" style={styles.uploadButton}>
                    {isUploading ? 'Uploading...' : 'Upload Custom'}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Building size={20} />
            Basic Information
          </h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Store Name *</label>
            <input
              type="text"
              name="name"
              value={store.name}
              onChange={handleInputChange}
              required
              style={styles.input}
              placeholder="My Awesome Store"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Store Tagline</label>
            <input
              type="text"
              name="tagline"
              value={store.tagline}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Quality Products, Delivered Fast"
              maxLength={150}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              name="description"
              value={store.description}
              onChange={handleInputChange}
              required
              rows={4}
              style={styles.textarea}
              placeholder="Tell customers about your store..."
              maxLength={500}
            />
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>WhatsApp Number *</label>
              <input
                type="text"
                name="whatsappnumber"
                value={store.whatsappnumber}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="+91 9876543210"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Local Delivery Time</label>
              <input
                type="text"
                name="deliverytimelocal"
                value={store.deliverytimelocal}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="1-2 days"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>National Delivery Time</label>
            <input
              type="text"
              name="deliverytimenational"
              value={store.deliverytimenational}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="3-7 days"
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <CreditCard size={20} />
            Payment Methods
          </h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Primary Payment Method *</label>
            <select
              name="paymentmethod"
              value={store.paymentmethod}
              onChange={handleInputChange}
              required
              style={styles.select}
            >
              <option value="CASHFREE">Cashfree (0% Commission - Recommended)</option>
              <option value="UPI">UPI Link</option>
              <option value="RAZORPAY">Razorpay</option>
            </select>
          </div>

          {/* CASHFREE SECTION */}
          {store.paymentmethod === 'CASHFREE' && (
            <div style={styles.cashfreeSection}>
              {!cashfreeConnected ? (
                <>
                  <div style={styles.cashfreeInfo}>
                    <AlertCircle size={16} />
                    <span>
                      <strong>0% Commission!</strong> Enter your bank details to receive 100% of sales directly.
                    </span>
                  </div>

                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Bank Account Number *</label>
                      <input
                        type="text"
                        name="cashfree_bank_account"
                        value={store.cashfree_bank_account}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                        placeholder="Enter your bank account number"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>IFSC Code *</label>
                      <input
                        type="text"
                        name="cashfree_ifsc"
                        value={store.cashfree_ifsc}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                        placeholder="SBIN0001234"
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Account Holder Name *</label>
                    <input
                      type="text"
                      name="cashfree_account_holder"
                      value={store.cashfree_account_holder}
                      onChange={handleInputChange}
                      required
                      style={styles.input}
                      placeholder="Name as per bank account"
                    />
                  </div>

                  <div style={styles.benefitBox}>
                    <Check size={18} color="#10b981" />
                    <div>
                      <strong>Kerala Sellers Benefits:</strong>
                      <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '14px' }}>
                        <li>0% Platform Commission</li>
                        <li>100% of sale amount goes to you</li>
                        <li>Direct bank transfers</li>
                        <li>No hidden charges</li>
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCashfreeConnect}
                    disabled={isConnectingCashfree}
                    style={styles.cashfreeButton}
                  >
                    {isConnectingCashfree ? 'Registering...' : 'Register Bank Account (0% Commission)'}
                  </button>
                </>
              ) : (
                <div style={styles.cashfreeConnected}>
                  <Check size={20} color="#10b981" />
                  <span>Bank account registered! You'll receive <strong>100% of your sales</strong> directly.</span>
                </div>
              )}
            </div>
          )}

          {/* UPI SECTION */}
          {store.paymentmethod === 'UPI' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>UPI ID *</label>
              <input
                type="text"
                name="upiid"
                value={store.upiid}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="yourname@paytm"
              />
            </div>
          )}

          {/* RAZORPAY SECTION */}
          {store.paymentmethod === 'RAZORPAY' && (
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Razorpay Key ID *</label>
                <input
                  type="text"
                  name="razorpaykeyid"
                  value={store.razorpaykeyid}
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
                    type={showSecrets.razorpay ? 'text' : 'password'}
                    name="razorpaykeysecret"
                    value={store.razorpaykeysecret}
                    onChange={handleInputChange}
                    required
                    style={styles.input}
                    placeholder="Your secret key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets((prev) => ({ ...prev, razorpay: !prev.razorpay }))}
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
                name="acceptscod"
                checked={store.acceptscod}
                onChange={handleInputChange}
                style={styles.checkbox}
              />
              Accept Cash on Delivery (COD)
            </label>
          </div>
        </div>

        {/* Submit */}
        <div style={styles.submitSection}>
          <button type="submit" disabled={isSaving} style={styles.submitButton}>
            {isSaving ? 'Saving...' : (
              <>
                <Save size={18} />
                Save Changes
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
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .imageUploadContainer:hover .imageOverlay {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

// STYLES
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
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
  advancedLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    backgroundColor: '#ecfdf5',
    border: '2px solid #10b981',
    borderRadius: '12px',
    color: '#065f46',
    marginBottom: '24px',
    fontSize: '16px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
    animation: 'slideDown 0.3s ease-out',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    backgroundColor: '#fef2f2',
    border: '2px solid #ef4444',
    borderRadius: '12px',
    color: '#991b1b',
    marginBottom: '24px',
    fontSize: '16px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
    animation: 'slideDown 0.3s ease-out',
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
  select: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
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
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  galleryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '12px',
    transition: 'all 0.2s',
  },
  bannerGallery: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    marginBottom: '12px',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
  },
  galleryItem: {
    position: 'relative',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  galleryItemSelected: {
    border: '3px solid #10b981',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  galleryImage: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
  },
  selectedBadge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
  },
  bannerName: {
    padding: '8px',
    backgroundColor: 'white',
    fontSize: '12px',
    fontWeight: 500,
    color: '#374151',
    textAlign: 'center',
  },
  imageUploadContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px dashed #d1d5db',
    backgroundColor: '#f9fafb',
  },
  logoPreview: {
    width: '100%',
    height: '200px',
    objectFit: 'contain',
    backgroundColor: 'white',
  },
  bannerPreview: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
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
  cashfreeSection: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cashfreeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#eff6ff',
    border: '1px solid #3b82f6',
    borderRadius: '12px',
    color: '#1e40af',
  },
  benefitBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#ecfdf5',
    border: '2px solid #10b981',
    borderRadius: '12px',
  },
  cashfreeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '14px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 600,
    width: '100%',
  },
  cashfreeConnected: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #10b981',
    borderRadius: '12px',
    color: '#065f46',
    fontWeight: 600,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
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
