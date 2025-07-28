'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/user/store/products/';

export default function ProductForm({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
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
    Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));
    
    // Only append the image if a new one was selected
    if (imageFile) {
      submissionData.append('image', imageFile);
    }
    
    const url = product ? `${API_URL}${product.id}/` : API_URL;
    const method = product ? 'patch' : 'post'; // Use PATCH for partial update

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
          {/* Form fields for name, description, price, stock are unchanged */}
          <div style={styles.formGroup}>
            <label htmlFor="name">Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} style={styles.input}></textarea>
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="price">Price (₹)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required style={styles.input} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="stock">Stock</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required style={styles.input} />
          </div>

          {/* ✅ START: NEW IMAGE PREVIEW SECTION */}
          {product && product.image_url && (
            <div style={styles.formGroup}>
              <label>Current Image</label>
              <img 
                src={product.image_url} 
                alt="Current product" 
                style={{ width: '100px', height: '100px', objectFit: 'cover', display: 'block', borderRadius: '4px', border: '1px solid #ccc' }} 
              />
            </div>
          )}
          {/* ✅ END: NEW IMAGE PREVIEW SECTION */}

          <div style={styles.formGroup}>
            <label htmlFor="image">{product ? 'Upload New Image (Optional)' : 'Image'}</label>
            <input type="file" name="image" onChange={handleImageChange} accept="image/*" style={styles.input} />
          </div>
          
          {error && <p style={{color: 'red'}}>{error}</p>}
          <div style={styles.buttonContainer}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={styles.buttonSecondary}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={styles.buttonPrimary}>
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ... your styles object is unchanged
const styles = {
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90%' },
    formGroup: { marginBottom: '1rem' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' },
    buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' },
    buttonPrimary: { padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    buttonSecondary: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};