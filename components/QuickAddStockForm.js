'use client';

import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/user/store/products/';

export default function QuickAddStockForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    model_name: '',
    mrp: '',
    total_stock: '',
    // Price and online_stock are no longer in this form
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    // Set price equal to MRP by default for this simplified form
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('model_name', formData.model_name);
    submissionData.append('mrp', formData.mrp);
    submissionData.append('price', formData.mrp); // Price defaults to MRP
    submissionData.append('total_stock', formData.total_stock);
    submissionData.append('online_stock', 0); // Defaults to 0 for online stock

    if (imageFile) {
      submissionData.append('image', imageFile);
    }
    
    const token = localStorage.getItem('accessToken');
    try {
      await axios.post(API_URL, submissionData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Token ${token}` }
      });
      onSuccess();
    } catch (err) {
      setError('Failed to add product. Please check your input.');
      console.error('Submission error:', err.response?.data || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2>Quick Add Product</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}><label>Product Name*</label><input type="text" name="name" value={formData.name} onChange={handleChange} required style={styles.input} /></div>
          <div style={styles.formGroup}>
            <label>Model (Optional)</label>
            <input type="text" name="model_name" value={formData.model_name} onChange={handleChange} placeholder="e.g., Red XL, 250g" style={styles.input} />
          </div>
          <div style={styles.formGroup}><label>MRP (₹)*</label><input type="number" name="mrp" value={formData.mrp} onChange={handleChange} required style={styles.input} step="0.01" /></div>
          <div style={styles.formGroup}><label>Total Stock*</label><input type="number" name="total_stock" value={formData.total_stock} onChange={handleChange} required style={styles.input} /></div>
          <div style={styles.formGroup}>
            <label>Image (Optional)</label>
            <input type="file" name="image" onChange={handleImageChange} accept="image/*" style={styles.input} />
          </div>

          {error && <p style={{color: 'red'}}>{error}</p>}
          <div style={styles.buttonContainer}>
            <button type="button" onClick={onClose} disabled={isSaving} style={styles.buttonSecondary}>Cancel</button>
            <button type="submit" disabled={isSaving} style={styles.buttonPrimary}>{isSaving ? 'Saving...' : 'Add Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '450px', maxWidth: '90%' },
    formGroup: { marginBottom: '1rem' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' },
    buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' },
    buttonPrimary: { padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    buttonSecondary: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};