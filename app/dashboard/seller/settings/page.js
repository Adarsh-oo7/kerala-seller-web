'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Upload, 
  Check, 
  AlertCircle, 
  Star, 
  Settings, 
  Building,
  FileText,
  CreditCard,
  Phone,
  Globe,
  Truck,
  Search
} from 'lucide-react';

const API_URL = 'http://localhost:8000/user/store/profile/';

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
  const [verificationProgress, setVerificationProgress] = useState(0);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        router.push('/login/seller');
        return null;
    }
    return { 'Authorization': `Token ${token}` };
  }, [router]);

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers) return;

    axios.get(API_URL, { headers })
      .then(response => {
        setStore(prev => ({ ...prev, ...response.data }));
        setCurrentBannerUrl(response.data.banner_image_url);
        setCurrentLogoUrl(response.data.logo_url);
        setCurrentDocUrl(response.data.verification_doc_url);
        calculateProgress(response.data);
      })
      .catch(error => console.error('Failed to fetch store settings:', error))
      .finally(() => setIsLoading(false));
  }, [getAuthHeaders]);

  const calculateProgress = (storeData) => {
    const mandatoryFields = ['name', 'description', 'whatsapp_number'];
    const mandatoryFiles = [currentLogoUrl];
    const optionalFields = ['gst_number', 'business_license', 'owner_name'];
    
    let completed = 0;
    let total = mandatoryFields.length + mandatoryFiles.length + optionalFields.length;
    
    mandatoryFields.forEach(field => {
      if (storeData[field]) completed++;
    });
    
    if (currentLogoUrl) completed++;
    
    optionalFields.forEach(field => {
      if (storeData[field]) completed++;
    });
    
    setVerificationProgress(Math.round((completed / total) * 100));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setStore(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    
    const headers = getAuthHeaders();
    if (!headers) {
        setIsSaving(false);
        return;
    }
    
    const formData = new FormData();
    for (const key in store) {
        if (store[key] !== null && store[key] !== undefined) {
            formData.append(key, store[key]);
        }
    }
    
    if (bannerImageFile) formData.append('banner_image', bannerImageFile);
    if (logoFile) formData.append('logo', logoFile);
    if (verificationDocFile) formData.append('verification_doc', verificationDocFile);

    try {
      const response = await axios.patch(API_URL, formData, { 
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setCurrentBannerUrl(response.data.banner_image_url);
      setCurrentLogoUrl(response.data.logo_url);
      setCurrentDocUrl(response.data.verification_doc_url);
      setSuccessMessage('Store updated successfully!');
      
      // Reset file inputs
      setBannerImageFile(null);
      setLogoFile(null);
      setVerificationDocFile(null);
      
      calculateProgress(response.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating store.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderVerificationStatus = () => {
    const statusConfig = {
      pending: { icon: AlertCircle, color: '#f59e0b', text: 'Verification Pending' },
      verified: { icon: Check, color: '#10b981', text: 'Verified Seller' },
      rejected: { icon: AlertCircle, color: '#ef4444', text: 'Verification Rejected' }
    };
    
    const config = statusConfig[store.verification_status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <div style={{...styles.verificationStatus, borderColor: config.color}}>
        <Icon size={20} color={config.color} />
        <span style={{color: config.color, fontWeight: '600'}}>{config.text}</span>
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${verificationProgress}%`}}></div>
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
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Store Settings</h1>
          <p style={styles.subtitle}>Manage your store information and verification status</p>
        </div>
        {renderVerificationStatus()}
      </div>

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
                  {currentLogoUrl ? (
                    <img src={currentLogoUrl} alt="Store Logo" style={styles.logoPreview} />
                  ) : (
                    <div style={styles.logoPlaceholder}>
                      <Upload size={24} />
                      <span>No Logo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])} 
                    style={styles.fileInput} 
                  />
                </div>
                
                <div style={styles.bannerSection}>
                  <label style={styles.label}>Store Banner</label>
                  {currentBannerUrl ? (
                    <img src={currentBannerUrl} alt="Store banner" style={styles.bannerPreview} />
                  ) : (
                    <div style={styles.bannerPlaceholder}>
                      <Upload size={24} />
                      <span>No Banner</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setBannerImageFile(e.target.files[0])} 
                    style={styles.fileInput} 
                  />
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
                  />
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
                />
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
                />
              </div>
            </div>

            {/* Contact Information */}
            <div style={styles.sectionCard}>
              <h3 style={styles.sectionTitle}>
                <Phone size={20} />
                Contact & Social Media
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
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Identity Proof Document</label>
                <div style={styles.fileUploadArea}>
                  {currentDocUrl ? (
                    <div style={styles.filePreview}>
                      <FileText size={24} />
                      <span>Document uploaded</span>
                      <a href={currentDocUrl} target="_blank" rel="noopener noreferrer" style={styles.viewLink}>
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
                    onChange={(e) => setVerificationDocFile(e.target.files[0])} 
                    style={styles.fileInput} 
                  />
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
                  placeholder="Shop quality products at great prices..."
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
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Payment Gateway</label>
                <select 
                  name="payment_method" 
                  value={store.payment_method} 
                  onChange={handleInputChange} 
                  style={styles.select}
                >
                  <option value="NONE">None</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="UPI">UPI Link</option>
                </select>
              </div>
              
              {store.payment_method === 'RAZORPAY' && (
                <>
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
                      <input 
                        type="password" 
                        name="razorpay_key_secret" 
                        value={store.razorpay_key_secret || ''} 
                        onChange={handleInputChange} 
                        style={styles.input}
                        placeholder="••••••••••••••••"
                      />
                    </div>
                  </div>
                </>
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
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          {successMessage && (
            <div style={styles.successMessage}>
              <Check size={16} />
              <span>{successMessage}</span>
            </div>
          )}
        </div>
      </form>

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
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px'
  },
  
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0d6efd',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  subtitle: {
    color: '#64748b',
    margin: 0,
    fontSize: '1rem'
  },

  // Verification Status
  verificationStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    border: '2px solid',
    borderRadius: '12px',
    backgroundColor: '#f8fafc'
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  progressBar: {
    width: '100px',
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '12px',
    fontWeight: '500'
  },

  // Tabs
  tabContainer: {
    display: 'flex',
    marginBottom: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  tab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 20px',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#64748b',
    transition: 'all 0.2s'
  },
  activeTab: {
    backgroundColor: '#0d6efd',
    color: 'white'
  },
  tabBadge: {
    padding: '2px 8px',
    backgroundColor: '#dc2626',
    color: 'white',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    marginLeft: 'auto'
  },
  tabBadgeOptional: {
    padding: '2px 8px',
    backgroundColor: '#059669',
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
    gap: '24px'
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #f1f5f9'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #f1f5f9'
  },
  sectionDescription: {
    color: '#64748b',
    marginBottom: '20px',
    fontSize: '0.9rem'
  },

  // Form Elements
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr'
    }
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    backgroundColor: 'white'
  },
  charCount: {
    fontSize: '12px',
    color: '#64748b',
    float: 'right',
    marginTop: '4px'
  },

  // File Uploads
  brandingContainer: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '24px',
    alignItems: 'flex-start'
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
  logoPreview: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '12px',
    border: '2px solid #e5e7eb'
  },
  logoPlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    border: '2px dashed #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: '12px',
    gap: '8px'
  },
  bannerPreview: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #e5e7eb'
  },
  bannerPlaceholder: {
    width: '100%',
    height: '120px',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    border: '2px dashed #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: '14px',
    gap: '8px'
  },
  fileInput: {
    padding: '8px 0',
    fontSize: '14px'
  },
  fileUploadArea: {
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f8fafc'
  },
  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b'
  },
  filePreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#059669'
  },
  viewLink: {
    color: '#0d6efd',
    textDecoration: 'none',
    fontSize: '14px'
  },
  helpText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '8px'
  },

  // Checkbox
  checkboxGroup: {
    marginTop: '16px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    color: '#374151',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px'
  },

  // Submit
  submitSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingTop: '24px',
    marginTop: '24px',
    borderTop: '2px solid #f1f5f9'
  },
  submitButton: {
    padding: '16px 32px',
    backgroundColor: '#0d6efd',
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
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#059669',
    fontWeight: '500'
  }
};
