'use client';

import { useState } from 'react';
import axios from 'axios';
import { Trash2 } from "lucide-react";

// ✅ Enhanced environment variable handling for your hosted backend
// const getApiBaseUrl = () => {
//   const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
  
//   console.log('Environment check:', {
//     NEXT_PUBLIC_API_BASE_URL: 'https://api.keralasellers.in',
//     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
//     NODE_ENV: process.env.NODE_ENV
//   });
  
//   if (envUrl && envUrl !== 'undefined') {
//     return envUrl;
//   }
  
//   // Updated fallback with your hosted backend URL
//   return process.env.NODE_ENV === 'development' 
//     ? 'https://api.keralasellers.in' 
//     : 'https://keralaseller-backend.onrender.com';  // ✅ Your hosted backend
// };

// const API_BASE_URL = 'https://api.keralasellers.in';
// const API_URL = `${API_BASE_URL}/user/store/products/`;

// ✅ Simple and clean API configuration


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'https://api.keralasellers.in' 
    : 'https://api.keralasellers.in');

const API_URL = `${API_BASE_URL}/user/store/products/`;

console.log('🌐 Quick Add API configured:', {
  API_BASE_URL,
  API_URL,
  ENVIRONMENT: process.env.NODE_ENV,
  FROM_ENV: !!process.env.NEXT_PUBLIC_API_BASE_URL
});


export default function QuickAddStockForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    model_name: '',
    mrp: '',
    price: '', // ✅ ADDED: Separate price field
    total_stock: '',
    online_stock: '', // ✅ ADDED: Online stock field
    description: '' // ✅ ADDED: Description field
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // ✅ ADDED: Success message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // ✅ ENHANCED: Auto-set price to MRP if price field is empty
      ...(name === 'mrp' && !prev.price ? { price: value } : {})
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ✅ ENHANCED: File size validation (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      // ✅ ENHANCED: File type validation
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, or WEBP)');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(''); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    // ✅ ENHANCED: Form validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      setIsSaving(false);
      return;
    }

    if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
      setError('Please enter a valid MRP');
      setIsSaving(false);
      return;
    }

    if (!formData.total_stock || parseInt(formData.total_stock) < 0) {
      setError('Please enter a valid total stock quantity');
      setIsSaving(false);
      return;
    }

    const submissionData = new FormData();
    submissionData.append('name', formData.name.trim());
    submissionData.append('model_name', formData.model_name.trim());
    submissionData.append('mrp', formData.mrp);
    submissionData.append('price', formData.price || formData.mrp); // ✅ Use price or fallback to MRP
    submissionData.append('total_stock', formData.total_stock);
    submissionData.append('online_stock', formData.online_stock || '0'); // ✅ Default to 0 if not specified

    if (formData.description.trim()) {
      submissionData.append('description', formData.description.trim());
    }

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
          Authorization: `Bearer ${token}` // ✅ FIXED: Changed from Token to Bearer
        },
        timeout: 30000  // ✅ Increased timeout for hosted backend
      });

      console.log('✅ Product added successfully:', response.data);
      setSuccess('Product added successfully!');

      // ✅ ENHANCED: Auto-close after 1.5 seconds on success
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      console.error('❌ Submission error:', err.response?.data || err.message);

      let errorMessage = 'Failed to add product. Please check your input.';

      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        setTimeout(() => {
          window.location.href = '/login/seller';
        }, 2000);
      } else if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          // ✅ ENHANCED: Better error field handling
          const fieldErrors = [];
          Object.keys(err.response.data).forEach(field => {
            if (Array.isArray(err.response.data[field])) {
              fieldErrors.push(`${field}: ${err.response.data[field][0]}`);
            }
          });

          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join(', ');
          }
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
        <div style={styles.modalHeader}>
          <h2 className='dashboardproductmodaltitle' style={styles.modalTitle}>Add Stock Product</h2>
          <button onClick={onClose} style={styles.closeButton} disabled={isSaving}>
            ×
          </button>
        </div>

        <p style={styles.apiInfo}>
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Product Name*</label>
            < input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={styles.input}
              placeholder="Enter product name"
              disabled={isSaving}
            />
          </div>

          <div style={styles.formGroup}>
            <label className='dashboardproductmodalsectionlabel' style={styles.label}>Model/Variation</label>
            <input
              className='dashboardproductmodalselectinput'
              type="text"
              name="model_name"
              value={formData.model_name}
              onChange={handleChange}
              placeholder="e.g., Red XL, 250g, Cotton Blend"
              style={styles.input}
              disabled={isSaving}
            />
            <small style={styles.charCount}>{formData.model_name.length}/100 characters</small>
          </div>

          {/* ✅ NEW: Description field */}
          <div style={styles.formGroup}>
            <label className='dashboardproductmodalsectionlabel' style={styles.label}>Description</label>
            <textarea
              className='dashboardproductmodalselectinput'
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              placeholder="Brief product description..."
              disabled={isSaving}
              maxLength={500}
            />
            <small style={styles.charCount}>{formData.description.length}/500 characters</small>
          </div>

          {/* ✅ ENHANCED: Separate MRP and Price fields */}
          <div className='dashboardproductmodalgrid' style={styles.formRow}>
            <div style={styles.formGroup}>
              <label className='dashboardproductmodalsectionlabel' style={styles.label}>MRP (₹)*</label>
              <input
                className='dashboardproductmodalselectinput'
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                required
                style={styles.input}
                step="0.01"
                min="0"
                placeholder="Max retail price"
                disabled={isSaving}
              />
            </div>
            <div style={styles.formGroup}>
              <label className='dashboardproductmodalsectionlabel' style={styles.label}>Selling Price (₹)</label>
              <input
                className='dashboardproductmodalselectinput'
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                style={styles.input}
                step="0.01"
                min="0"
                placeholder="Auto-fills from MRP"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* ✅ ENHANCED: Separate Total and Online stock fields */}
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label className='dashboardproductmodalsectionlabel' style={styles.label}>Total Stock*</label>
              <input
                className='dashboardproductmodalselectinput'
                type="number"
                name="total_stock"
                value={formData.total_stock}
                onChange={handleChange}
                required
                style={styles.input}
                min="0"
                placeholder="Total quantity"
                disabled={isSaving}
              />
            </div>
            <div style={styles.formGroup}>
              <label className='dashboardproductmodalsectionlabel' style={styles.label}>Online Stock</label>
              <input
                className='dashboardproductmodalselectinput'
                type="number"
                name="online_stock"
                value={formData.online_stock}
                onChange={handleChange}
                style={styles.input}
                min="0"
                placeholder="0 (can update later)"
                disabled={isSaving}
              />
            </div>
          </div>



          <div style={styles.formGroup}>
            <label className='dashboardproductmodalsectionlabel' style={styles.label}>Product Image</label>
            {imagePreview && (
              <div style={styles.imagePreviewContainer}>
                <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  style={styles.removeImageButton}
                  disabled={isSaving}
                >
                  <Trash2 size={14} />

                </button>
              </div>
            )}
            <input
              className='dashboardproductmodalselectinput'
              type="file"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              style={styles.input}
              disabled={isSaving}
            />
            <small style={styles.helpText}>
              📸 JPG, PNG, or WEBP format. Max 5MB.
            </small>
          </div>

          {/* ✅ ENHANCED: Success message */}
          {success && (
            <div style={styles.successContainer}>
              ✅ {success}
            </div>
          )}

          {error && (
            <div style={styles.errorContainer}>
              ⚠️ {error}
            </div>
          )}

          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>ℹ️ Quick Add Features:</h4>
            <ul style={styles.infoList}>
              <li>Selling price auto-fills from MRP</li>
              <li>Online stock defaults to 0 (update later)</li>
              <li>Category can be set after creation</li>
              <li>All fields can be edited later</li>
            </ul>
          </div>

          <div style={styles.buttonContainer}>
            <button
              className='dashboardproductcreatebtn'
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={styles.buttonSecondary}
            >
              Cancel
            </button>
            <button
              className='dashboardproductcreatebtn'
              type="submit"
              disabled={isSaving || !formData.name.trim() || !formData.mrp || !formData.total_stock}
              style={{
                ...styles.buttonPrimary,
                opacity: (isSaving || !formData.name.trim() || !formData.mrp || !formData.total_stock) ? 0.6 : 1
              }}
            >
              {isSaving ? (
                <>
                  <span style={styles.spinner}></span>
                  Adding to server...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ✅ CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
    zIndex: 1000,
    padding: '20px',
    animation: 'fadeIn 0.3s ease-out'
  },

  modalContent: {
    background: 'rgb(253, 255, 240)',
    borderRadius: '12px',
    width: '500px',
    maxWidth: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    animation: 'slideIn 0.3s ease-out'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 16px 24px',
    borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },

  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  apiInfo: {
    fontSize: '12px',
    color: '#6b7280',
    padding: '0 24px',
    marginBottom: '16px',
    fontFamily: 'monospace'
  },
  formGroup: { 
    marginBottom: '16px',
    padding: '0 24px'
  },
  // ✅ NEW: Form row for side-by-side fields
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    // padding: '0 24px',
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },
  input: { 
    width: '100%', 
    padding: '10px 12px', 
    boxSizing: 'border-box', 
    border: '1px solid #d1d5db', 
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'rgb(253, 255, 240)',
    transition: 'border-color 0.2s'
  },
  helpText: {
    fontSize: '12px',
    color: '#6b7280',
    display: 'block',
    marginTop: '4px'
  },

  charCount: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    textAlign: 'right',
    display: 'block'
  },

  imagePreviewContainer: {
    position: 'relative',   // IMPORTANT
    display: 'inline-block',
  },

  imagePreview: {
    width: '160px',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },

  removeImageButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(227, 30, 30, 0.6)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2,
  },

  successContainer: {
    color: '#065f46',
    fontSize: '14px',
    padding: '12px 24px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #10b981',
    borderRadius: '8px',
    margin: '0 24px 16px 24px'
  },

  errorContainer: {
    color: '#dc2626',
    fontSize: '14px',
    padding: '12px 24px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    margin: '0 24px 16px 24px'
  },

  infoBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '16px',
    margin: '0 24px 20px 24px'
  },

  infoTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#1d4ed8',
    fontWeight: '600'
  },

  infoList: {
    margin: 0,
    paddingLeft: '16px',
    fontSize: '12px',
    color: '#374151'
  },

  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #e5e7eb'
  },

  buttonPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'rgb(68, 141, 82)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },

  buttonSecondary: {
    padding: '12px 20px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },

  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  }
};
