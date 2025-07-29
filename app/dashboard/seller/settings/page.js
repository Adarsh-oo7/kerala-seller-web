// app/dashboard/seller/settings/page.js
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/user/store/profile/';

export default function SettingsPage() {
  const [store, setStore] = useState({
    name: '',
    description: '',
    payment_method: 'NONE',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    upi_id: '',
    accepts_cod: false,
  });
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
          payment_method: response.data.payment_method || 'NONE',
          razorpay_key_id: response.data.razorpay_key_id || '',
          upi_id: response.data.upi_id || '',
          accepts_cod: response.data.accepts_cod || false,
        }));
        setCurrentBannerUrl(response.data.banner_image_url);
      })
      .catch(error => console.error('Failed to fetch store settings:', error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStore(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    setBannerImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    const token = localStorage.getItem('accessToken');
    
    const formData = new FormData();
    // Append all store fields to formData
    for (const key in store) {
        formData.append(key, store[key]);
    }
    if (bannerImageFile) {
      formData.append('banner_image', bannerImageFile);
    }

    try {
      const response = await axios.patch(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Token ${token}` },
      });
      setCurrentBannerUrl(response.data.banner_image_url);
      setSuccessMessage('Store updated successfully!');
      setBannerImageFile(null);
    } catch (error) {
      console.error('Failed to update store:', error);
      alert('Error updating store.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p>Loading store settings...</p>;

  return (
    <div>
      <h1>Store Settings</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* --- Store Info Section --- */}
        <h2 style={styles.sectionHeader}>Store Information</h2>
        {currentBannerUrl && (
          <div style={styles.formGroup}>
            <label>Current Banner</label>
            <img src={currentBannerUrl} alt="Store banner" style={styles.bannerPreview} />
          </div>
        )}
        <div style={styles.formGroup}><label htmlFor="banner_image">Upload New Banner</label><input type="file" id="banner_image" name="banner_image" onChange={handleFileChange} style={styles.input} /></div>
        <div style={styles.formGroup}><label htmlFor="name">Store Name</label><input type="text" id="name" name="name" value={store.name} onChange={handleInputChange} required style={styles.input} /></div>
        <div style={styles.formGroup}><label htmlFor="description">Store Description</label><textarea id="description" name="description" value={store.description} onChange={handleInputChange} rows="4" style={styles.input} /></div>

        <hr style={styles.hr} />

        {/* --- START: Payment Settings Section --- */}
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
        {/* --- END: Payment Settings Section --- */}

        <button type="submit" disabled={isSaving} style={styles.button}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
        {successMessage && <p style={{ color: 'green', marginTop: '1rem' }}>{successMessage}</p>}
      </form>
    </div>
  );
}

const styles = {
    form: { maxWidth: '600px', marginTop: '1rem' },
    formGroup: { marginBottom: '1.5rem' },
    input: { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' },
    bannerPreview: { width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' },
    button: { padding: '12px 25px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' },
    sectionHeader: { marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' },
};