'use client';

import { useState } from 'react';
import axios from 'axios';

// ✅ Enhanced environment variable handling for your hosted backend
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  
  console.log('Environment check:', {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV
  });
  
  if (envUrl && envUrl !== 'undefined') {
    return envUrl;
  }
  
  // Updated fallback with your hosted backend URL
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : 'https://keralaseller-backend.onrender.com';  // ✅ Your hosted backend
};

const API_BASE_URL = getApiBaseUrl();
const API_URL = `${API_BASE_URL}/user/store/products/`;

console.log('🌐 Quick Add API configured:', { 
  API_BASE_URL, 
  API_URL,
  ENVIRONMENT: process.env.NODE_ENV 
});

export default function QuickAddStockForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    model_name: '',
    mrp: '',
    total_stock: '',
    // Price and online_stock are no longer in this form
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
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
      submissionData.append('main_image', imageFile); // ✅ Fixed field name to match your backend
      console.log('📸 Image file being sent:', imageFile.name);
    }
    
    const token = localStorage.getItem('accessToken');
    
    console.log('=== DEBUG: Quick Add Submission ===');
    console.log('API URL:', API_URL);
    console.log('Form data:', Object.fromEntries(submissionData.entries()));
    console.log('Has image:', !!imageFile);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('==================================');
    
    try {
      const response = await axios.post(API_URL, submissionData, {
        headers: { 
          'Content-Type': 'multipart/form-data', 
          Authorization: `Token ${token}` 
        },
        timeout: 20000  // ✅ Increased timeout for hosted backend
      });
      
      console.log('✅ Product added successfully:', response.data);
      onSuccess();
    } catch (err) {
      console.error('❌ Submission error:', err.response?.data || err.message);
      
      let errorMessage = 'Failed to add product. Please check your input.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.name) {
          errorMessage = `Name error: ${err.response.data.name[0]}`;
        } else if (err.response.data.mrp) {
          errorMessage = `Price error: ${err.response.data.mrp[0]}`;
        } else if (err.response.data.main_image) {
          errorMessage = `Image error: ${err.response.data.main_image[0]}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - the server took too long to respond. Please try again.';
      } else if (err.request) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2>Quick Add Product</h2>
        <p style={{fontSize: '12px', color: '#666', marginBottom: '16px'}}>
          🌐 Connected to: {API_BASE_URL}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Product Name*</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={styles.input}
              placeholder="Enter product name"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Model/Variation (Optional)</label>
            <input 
              type="text" 
              name="model_name" 
              value={formData.model_name} 
              onChange={handleChange} 
              placeholder="e.g., Red XL, 250g, Cotton Blend" 
              style={styles.input} 
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>MRP (₹)*</label>
            <input 
              type="number" 
              name="mrp" 
              value={formData.mrp} 
              onChange={handleChange} 
              required 
              style={styles.input} 
              step="0.01"
              placeholder="Enter maximum retail price"
            />
            <small style={{color: '#666', fontSize: '11px'}}>
              💡 Selling price will be set to same as MRP by default
            </small>
          </div>
          
          <div style={styles.formGroup}>
            <label>Total Stock*</label>
            <input 
              type="number" 
              name="total_stock" 
              value={formData.total_stock} 
              onChange={handleChange} 
              required 
              style={styles.input}
              min="0"
              placeholder="Enter total quantity"
            />
            <small style={{color: '#666', fontSize: '11px'}}>
              💡 Online stock will be set to 0 (you can update later)
            </small>
          </div>
          
          <div style={styles.formGroup}>
            <label>Product Image (Optional)</label>
            {imagePreview && (
              <div style={styles.imagePreviewContainer}>
                <img src={imagePreview} alt="Preview" style={styles.imagePreview}/>
              </div>
            )}
            <input 
              type="file" 
              name="image" 
              onChange={handleImageChange} 
              accept="image/*" 
              style={styles.input} 
            />
            <small style={{color: '#666', fontSize: '11px'}}>
              📸 JPG, PNG, or WEBP format recommended
            </small>
          </div>

          {error && (
            <div style={styles.errorContainer}>
              ⚠️ {error}
            </div>
          )}
          
          <div style={styles.infoBox}>
            <h4 style={{margin: '0 0 8px 0', fontSize: '12px', color: '#0d6efd'}}>ℹ️ Quick Add Defaults:</h4>
            <ul style={{margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#666'}}>
              <li>Selling price = MRP</li>
              <li>Online stock = 0</li>
              <li>Sale type = Online & In-Store</li>
              <li>Category = Uncategorized (edit later)</li>
            </ul>
          </div>
          
          <div style={styles.buttonContainer}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSaving} 
              style={styles.buttonSecondary}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving || !formData.name || !formData.mrp || !formData.total_stock} 
              style={styles.buttonPrimary}
            >
              {isSaving ? 'Adding to server...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
    modalOverlay: { 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 1000 
    },
    modalContent: { 
      background: 'white', 
      padding: '2rem', 
      borderRadius: '8px', 
      width: '450px', 
      maxWidth: '90%',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    formGroup: { 
      marginBottom: '1rem' 
    },
    input: { 
      width: '100%', 
      padding: '8px', 
      boxSizing: 'border-box', 
      border: '1px solid #ccc', 
      borderRadius: '4px',
      fontSize: '14px'
    },
    imagePreviewContainer: {
      marginBottom: '10px'
    },
    imagePreview: {
      width: '100px',
      height: '100px',
      objectFit: 'cover',
      borderRadius: '4px',
      border: '1px solid #ddd'
    },
    errorContainer: {
      color: '#dc3545',
      fontSize: '14px',
      marginBottom: '16px',
      padding: '10px',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px'
    },
    infoBox: {
      backgroundColor: '#e7f3ff',
      border: '1px solid #b8daff',
      borderRadius: '4px',
      padding: '12px',
      marginBottom: '16px'
    },
    buttonContainer: { 
      display: 'flex', 
      justifyContent: 'flex-end', 
      gap: '10px', 
      marginTop: '1.5rem' 
    },
    buttonPrimary: { 
      padding: '10px 20px', 
      backgroundColor: '#0d6efd', 
      color: 'white', 
      border: 'none', 
      borderRadius: '5px', 
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    buttonSecondary: { 
      padding: '10px 20px', 
      backgroundColor: '#6c757d', 
      color: 'white', 
      border: 'none', 
      borderRadius: '5px', 
      cursor: 'pointer',
      fontSize: '14px'
    }
};
