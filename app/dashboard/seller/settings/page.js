'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/user/store/profile/';

export default function SettingsPage() {
  const [store, setStore] = useState({
    name: '',
    description: '',
    tagline: '',
    whatsapp_number: '',
    instagram_link: '',
    facebook_link: '',
    payment_method: 'NONE',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    upi_id: '',
    accepts_cod: false,
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    axios.get(API_URL, { headers: { Authorization: `Token ${token}` } })
      .then(response => {
        setStore(prev => ({
          ...prev,
          name: response.data.name || '',
          description: response.data.description || '',
          tagline: response.data.tagline || '',
          whatsapp_number: response.data.whatsapp_number || '',
          instagram_link: response.data.instagram_link || '',
          facebook_link: response.data.facebook_link || '',
          payment_method: response.data.payment_method || 'NONE',
          razorpay_key_id: response.data.razorpay_key_id || '',
          upi_id: response.data.upi_id || '',
          accepts_cod: response.data.accepts_cod || false,
        }));
        setCurrentBannerUrl(response.data.banner_image_url);
        setCurrentLogoUrl(response.data.logo_url);
      })
      .catch(error => console.error('Failed to fetch store settings:', error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStore(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    const token = localStorage.getItem('accessToken');
    
    const formData = new FormData();
    for (const key in store) {
        formData.append(key, store[key]);
    }
    if (bannerImageFile) {
      formData.append('banner_image', bannerImageFile);
    }
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const response = await axios.patch(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Token ${token}` },
      });
      setCurrentBannerUrl(response.data.banner_image_url);
      setCurrentLogoUrl(response.data.logo_url);
      setSuccessMessage('Store updated successfully!');
      setBannerImageFile(null);
      setLogoFile(null);
    } catch (error) {
      console.error('Failed to update store:', error);
      const errorMessage = error.response?.data?.error || 'Error updating store. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading store settings...</p>;

  return (
    <div>
      <h1>Store Settings</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* --- Store Branding Section --- */}
        <h2 style={styles.sectionHeader}>Store Branding</h2>
        <div style={styles.brandingContainer}>
            <div style={{flex: 1}}>
                <label>Store Logo</label>
                {currentLogoUrl ? (
                    <img src={currentLogoUrl} alt="Store Logo" style={styles.logoPreview} />
                ) : <div style={styles.logoPreviewPlaceholder}>No Logo</div>}
                <input type="file" id="logo" name="logo" onChange={(e) => setLogoFile(e.target.files[0])} accept="image/*" style={styles.input} />
            </div>
            <div style={{flex: 2, marginLeft: '20px'}}>
                <label>Store Banner</label>
                {currentBannerUrl ? (
                    <img src={currentBannerUrl} alt="Store banner" style={styles.bannerPreview} />
                ) : <div style={styles.bannerPreviewPlaceholder}>No Banner</div>}
                <input type="file" id="banner_image" name="banner_image" onChange={(e) => setBannerImageFile(e.target.files[0])} accept="image/*" style={styles.input} />
            </div>
        </div>
        <div style={styles.formGroup}><label htmlFor="name">Store Name</label><input type="text" id="name" name="name" value={store.name} onChange={handleInputChange} required style={styles.input} /></div>
        <div style={styles.formGroup}><label htmlFor="tagline">Store Tagline</label><input type="text" id="tagline" name="tagline" value={store.tagline} onChange={handleInputChange} style={styles.input} placeholder="e.g., Quality Products, Delivered Fast"/></div>
        <div style={styles.formGroup}><label htmlFor="description">Store Description</label><textarea id="description" name="description" value={store.description} onChange={handleInputChange} rows="4" style={styles.input} /></div>
        
        <hr style={styles.hr} />

        {/* --- Contact & Socials Section --- */}
        <h2 style={styles.sectionHeader}>Contact & Social Media</h2>
        <div style={styles.formGroup}><label htmlFor="whatsapp_number">WhatsApp Business Number</label><input type="text" id="whatsapp_number" name="whatsapp_number" value={store.whatsapp_number} onChange={handleInputChange} style={styles.input} placeholder="+91..."/></div>
        <div style={styles.formGroup}><label htmlFor="instagram_link">Instagram Profile URL</label><input type="url" id="instagram_link" name="instagram_link" value={store.instagram_link} onChange={handleInputChange} style={styles.input} placeholder="https://instagram.com/your-profile"/></div>
        <div style={styles.formGroup}><label htmlFor="facebook_link">Facebook Page URL</label><input type="url" id="facebook_link" name="facebook_link" value={store.facebook_link} onChange={handleInputChange} style={styles.input} placeholder="https://facebook.com/your-page"/></div>
        
        <hr style={styles.hr} />

        {/* --- Payment Settings Section --- */}
        <h2 style={styles.sectionHeader}>Payment Settings</h2>
        <div style={styles.formGroup}>
          <label htmlFor="payment_method">Online Payment Gateway</label>
          <select name="payment_method" id="payment_method" value={store.payment_method} onChange={handleInputChange} style={styles.input}>
            <option value="NONE">None</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="UPI">UPI Link</option>
          </select>
        </div>
        {store.payment_method === 'RAZORPAY' && (
          <>
            <div style={styles.formGroup}><label htmlFor="razorpay_key_id">Razorpay Key ID</label><input type="text" id="razorpay_key_id" name="razorpay_key_id" value={store.razorpay_key_id} onChange={handleInputChange} style={styles.input} /></div>
            <div style={styles.formGroup}><label htmlFor="razorpay_key_secret">Razorpay Key Secret</label><input type="password" id="razorpay_key_secret" name="razorpay_key_secret" value={store.razorpay_key_secret} onChange={handleInputChange} style={styles.input} /></div>
            <div style={styles.helpBox}>
              <h4 style={styles.helpBoxTitle}>How to find your Razorpay Keys</h4>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                <li>Log in to your <a href="https://dashboard.razorpay.com/" target="_blank" rel="noopener noreferrer">Razorpay Dashboard</a>.</li>
                <li>Navigate to <strong>Settings</strong> → <strong>API Keys</strong>.</li>
                <li>Click <strong>Generate Key</strong> to get a new set of keys.</li>
                <li>Copy the <strong>Key ID</strong> and <strong>Key Secret</strong> into the fields above.</li>
              </ol>
            </div>
          </>
        )}
        {store.payment_method === 'UPI' && (
          <div style={styles.formGroup}><label htmlFor="upi_id">Your UPI ID</label><input type="text" id="upi_id" name="upi_id" value={store.upi_id} onChange={handleInputChange} style={styles.input} /></div>
        )}
        <div style={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" name="accepts_cod" checked={store.accepts_cod} onChange={handleInputChange} style={{ marginRight: '10px' }} />
                Accept Cash on Delivery (COD)
            </label>
        </div>
        
        <button type="submit" disabled={isSaving} style={styles.button}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
        {successMessage && <p style={{ color: 'green', marginTop: '1rem' }}>{successMessage}</p>}
      </form>
    </div>
  );
}

const styles = {
    form: { maxWidth: '700px', marginTop: '1rem' },
    formGroup: { marginBottom: '1.5rem' },
    input: { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', marginTop: '5px' },
    brandingContainer: { display: 'flex', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '20px' },
    logoPreview: { width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #ddd' },
    logoPreviewPlaceholder: { width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' },
    bannerPreview: { width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' },
    bannerPreviewPlaceholder: { width: '100%', height: '120px', borderRadius: '8px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' },
    button: { padding: '12px 25px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' },
    sectionHeader: { marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' },
    helpBox: { backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '5px', padding: '15px', marginTop: '1rem', fontSize: '0.9rem' },
    helpBoxTitle: { marginTop: 0, marginBottom: '10px' },
};