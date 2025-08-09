'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:8000/user/store/profile/';

export default function SettingsPage() {
  const [store, setStore] = useState({
    name: '',
    description: '',
    tagline: '',
    whatsapp_number: '',
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
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
      })
      .catch(error => console.error('Failed to fetch store settings:', error))
      .finally(() => setIsLoading(false));
  }, [getAuthHeaders]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStore(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        formData.append(key, store[key]);
    }
    if (bannerImageFile) formData.append('banner_image', bannerImageFile);
    if (logoFile) formData.append('logo', logoFile);

    try {
      const response = await axios.patch(API_URL, formData, { headers });
      setCurrentBannerUrl(response.data.banner_image_url);
      setCurrentLogoUrl(response.data.logo_url);
      setSuccessMessage('Store updated successfully!');
      setBannerImageFile(null);
      setLogoFile(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating store.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading store settings...</p>;

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>Store Settings</h1>
        <button onClick={() => alert('Advanced features coming soon!')} style={styles.buttonSecondary}>
            Advanced Features
        </button>
      </div>
    <form onSubmit={handleSubmit} style={styles.form}>
        {/* --- Store Branding Section --- */}
        <h2 style={styles.sectionHeader}>Store Branding</h2>
        <div style={styles.brandingContainer}>
            <div style={{flex: 1}}><label>Store Logo</label>{currentLogoUrl ? <img src={currentLogoUrl} alt="Store Logo" style={styles.logoPreview} /> : <div style={styles.logoPreviewPlaceholder}>No Logo</div>}<input type="file" onChange={(e) => setLogoFile(e.target.files[0])} style={styles.input} /></div>
            <div style={{flex: 2}}><label>Store Banner</label>{currentBannerUrl ? <img src={currentBannerUrl} alt="Store banner" style={styles.bannerPreview} /> : <div style={styles.bannerPreviewPlaceholder}>No Banner</div>}<input type="file" onChange={(e) => setBannerImageFile(e.target.files[0])} style={styles.input} /></div>
        </div>
        <div style={styles.formGroup}><label htmlFor="name">Store Name</label><input type="text" id="name" name="name" value={store.name || ''} onChange={handleInputChange} required style={styles.input} /></div>
        <div style={styles.formGroup}><label htmlFor="tagline">Store Tagline</label><input type="text" id="tagline" name="tagline" value={store.tagline || ''} onChange={handleInputChange} style={styles.input} placeholder="e.g., Quality Products, Delivered Fast"/></div>
        <div style={styles.formGroup}><label htmlFor="description">Store Description</label><textarea id="description" name="description" value={store.description || ''} onChange={handleInputChange} rows="4" style={styles.input} /></div>
        
        <hr style={styles.hr} />

        {/* --- Contact & Socials Section --- */}
        <h2 style={styles.sectionHeader}>Contact & Social Media</h2>
        <div style={styles.formGroup}><label htmlFor="whatsapp_number">WhatsApp Business Number</label><input type="text" id="whatsapp_number" name="whatsapp_number" value={store.whatsapp_number || ''} onChange={handleInputChange} style={styles.input} placeholder="+91..."/></div>
        <div style={styles.formGroup}><label htmlFor="instagram_link">Instagram Profile URL</label><input type="url" id="instagram_link" name="instagram_link" value={store.instagram_link || ''} onChange={handleInputChange} style={styles.input} placeholder="https://instagram.com/your-profile"/></div>
        <div style={styles.formGroup}><label htmlFor="facebook_link">Facebook Page URL</label><input type="url" id="facebook_link" name="facebook_link" value={store.facebook_link || ''} onChange={handleInputChange} style={styles.input} placeholder="https://facebook.com/your-page"/></div>
        
        <hr style={styles.hr} />
        
        {/* --- Delivery Settings Section --- */}
        <h2 style={styles.sectionHeader}>Delivery Estimates</h2>
        <p style={{color: '#6c757d', marginBottom: '1.5rem'}}>Set your own delivery estimates. If blank, an automatic estimate will be shown.</p>
        <div style={styles.formGroup}><label htmlFor="delivery_time_local">Local Delivery Time (Within Kerala)</label><input type="text" id="delivery_time_local" name="delivery_time_local" value={store.delivery_time_local || ''} onChange={handleInputChange} style={styles.input} placeholder="e.g., 2-3 business days"/></div>
        <div style={styles.formGroup}><label htmlFor="delivery_time_national">National Delivery Time (Outside Kerala)</label><input type="text" id="delivery_time_national" name="delivery_time_national" value={store.delivery_time_national || ''} onChange={handleInputChange} style={styles.input} placeholder="e.g., 5-7 business days"/></div>

        <hr style={styles.hr} />

        {/* --- SEO Settings Section --- */}
        <h2 style={styles.sectionHeader}>Search Engine Optimization (SEO)</h2>
        <p style={{color: '#6c757d', marginBottom: '1.5rem'}}>This helps customers find your shop on Google.</p>
        <div style={styles.formGroup}><label htmlFor="meta_title">SEO Title</label><input type="text" id="meta_title" name="meta_title" value={store.meta_title || ''} onChange={handleInputChange} style={styles.input} maxLength="100" placeholder="e.g., Authentic Kerala Spices - Your Store"/></div>
        <div style={styles.formGroup}><label htmlFor="meta_description">SEO Description</label><textarea id="meta_description" name="meta_description" value={store.meta_description || ''} onChange={handleInputChange} rows="3" style={styles.input} maxLength="255" placeholder="e.g., Buy the best, hand-picked spices..."/></div>

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
    buttonSecondary: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    sectionHeader: { marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' },
    helpBox: { backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '5px', padding: '15px', marginTop: '1rem', fontSize: '0.9rem' },
    helpBoxTitle: { marginTop: 0, marginBottom: '10px' },
};
