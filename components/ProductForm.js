'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/user/store/products/';

export default function ProductForm({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    model_name: '',
    description: '',
    price: '',
    mrp: '',
    total_stock: 0,
    online_stock: 0,
    sale_type: 'BOTH', // Default value
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        model_name: product.model_name || '',
        description: product.description || '',
        price: product.price || '',
        mrp: product.mrp || '',
        total_stock: product.total_stock || 0,
        online_stock: product.online_stock || 0,
        sale_type: product.sale_type || 'BOTH',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const token = localStorage.getItem('accessToken');
    
    const submissionData = new FormData();
    // Append all form data fields
    Object.keys(formData).forEach(key => {
      submissionData.append(key, formData[key]);
    });
    
    if (imageFile) {
      submissionData.append('image', imageFile);
    }
    
    const url = product ? `${API_URL}${product.id}/` : API_URL;
    const method = product ? 'patch' : 'post';

    try {
      await axios({ method, url, data: submissionData, headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Token ${token}`
      }});
      onSuccess();
    } catch (err) {
      setError('Failed to save product. Please check your input.');
      console.error('Submission error:', err.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}><label>Product Name*</label><input type="text" name="name" value={formData.name} onChange={handleChange} required style={styles.input} /></div>
          <div style={styles.formGroup}><label>Model/Variation</label><input type="text" name="model_name" value={formData.model_name} onChange={handleChange} style={styles.input} placeholder="e.g., Red XL"/></div>
          <div style={styles.formGroup}><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} style={styles.input}></textarea></div>
          <div style={styles.formGroup}><label>Price (₹)*</label><input type="number" name="price" value={formData.price} onChange={handleChange} required style={styles.input} step="0.01" /></div>
          <div style={styles.formGroup}><label>MRP (₹)</label><input type="number" name="mrp" value={formData.mrp} onChange={handleChange} style={styles.input} step="0.01" /></div>
          <div style={styles.formGroup}><label>Total Stock*</label><input type="number" name="total_stock" value={formData.total_stock} onChange={handleChange} required style={styles.input} /></div>
          <div style={styles.formGroup}><label>Online Stock*</label><input type="number" name="online_stock" value={formData.online_stock} onChange={handleChange} required style={styles.input} /></div>
          
          <div style={styles.formGroup}>
            <label>Where to sell this product?*</label>
            <select name="sale_type" value={formData.sale_type} onChange={handleChange} style={styles.input}>
              <option value="BOTH">Online & In-Store</option>
              <option value="OFFLINE">In-Store Only</option>
              <option value="ONLINE">Online Only</option>
            </select>
          </div>
          
          {product && product.image_url && (
            <div style={styles.formGroup}>
              <label>Current Image</label>
              <img src={product.image_url} alt="Current product" style={styles.imagePreview} />
            </div>
          )}
          
          <div style={styles.formGroup}>
            <label>{product ? 'Upload New Image' : 'Image (Optional)'}</label>
            <input type="file" name="image" onChange={handleImageChange} accept="image/*" style={styles.input} />
          </div>
          
          {error && <p style={{color: 'red'}}>{error}</p>}
          <div style={styles.buttonContainer}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={styles.buttonSecondary}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={styles.buttonPrimary}>{isSubmitting ? 'Saving...' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' },
    formGroup: { marginBottom: '1rem' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' },
    imagePreview: { width: '100px', height: '100px', objectFit: 'cover', display: 'block', borderRadius: '4px', border: '1px solid #ccc' },
    buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' },
    buttonPrimary: { padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    buttonSecondary: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};