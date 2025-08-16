'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES_API_URL = 'http://localhost:8000/api/categories/';
const PRODUCTS_API_URL = 'http://localhost:8000/user/store/products/';

export default function ProductForm({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    model_name: '',
    description: '',
    price: '',
    mrp: '',
    total_stock: 0,
    online_stock: 0,
    sale_type: 'BOTH',
  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [subImageFiles, setSubImageFiles] = useState([]);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [subImagePreviews, setSubImagePreviews] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [dynamicAttributes, setDynamicAttributes] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios.get(CATEGORIES_API_URL, { headers: { Authorization: `Token ${token}` } })
      .then(res => setCategories(res.data.results || res.data))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);
  
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
      setSelectedCategoryId(product.category);
      setDynamicAttributes(product.attributes || {});
      setMainImagePreview(product.main_image_url || '');
      setSubImagePreviews(product.sub_images?.map(img => img.image_url) || []);
    }
  }, [product]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubImageChange = (e) => {
    if (e.target.files.length > 5) {
      alert("You can only upload a maximum of 5 sub-images.");
      e.target.value = null;
      return;
    }
    const files = Array.from(e.target.files);
    setSubImageFiles(files);
    setSubImagePreviews(files.map(file => URL.createObjectURL(file)));
  };
  
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    const selectedCategoryObject = categories.find(c => c.id == categoryId);
    const newAttributes = {};
    if (selectedCategoryObject?.default_attributes) {
      selectedCategoryObject.default_attributes.forEach(attrName => {
        newAttributes[attrName] = '';
      });
    }
    setDynamicAttributes(newAttributes);
  };
  
  const handleAttributeChange = (attributeName, value) => {
    setDynamicAttributes(prev => ({ ...prev, [attributeName]: value }));
  };

  const attributeFields = selectedCategoryId ? Object.keys(dynamicAttributes) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const token = localStorage.getItem('accessToken');
    
    const submissionData = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));
    
    // Ensure category is sent as integer
    if (selectedCategoryId) {
      submissionData.append('category', parseInt(selectedCategoryId));
    }
    
    submissionData.append('attributes', JSON.stringify(dynamicAttributes));
    
    // ✅ FIX: Always append main image if a new file is selected
    if (mainImageFile) {
      submissionData.append('main_image', mainImageFile);
      console.log('📸 Main image file being sent:', mainImageFile.name);
    } else if (product && !mainImagePreview) {
      // If editing and no preview, we might want to keep the existing image
      console.log('⚠️ No new main image selected for update');
    }
    
    // Add sub images
    subImageFiles.forEach((file, index) => {
      submissionData.append('sub_images', file);
      console.log(`📸 Sub image ${index + 1}:`, file.name);
    });
    
    const url = product ? `${PRODUCTS_API_URL}${product.id}/` : PRODUCTS_API_URL;
    const method = product ? 'patch' : 'post';

    console.log('=== DEBUG: Form submission ===');
    console.log('Selected category ID:', selectedCategoryId);
    console.log('Main image file:', mainImageFile);
    console.log('Sub image files:', subImageFiles);
    console.log('Form data keys:', Array.from(submissionData.keys()));
    
    // ✅ FIX: Log FormData contents properly
    for (let [key, value] of submissionData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, `File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    }
    console.log('===============================');

    try {
      const response = await axios({ 
        method, 
        url, 
        data: submissionData, 
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Token ${token}`
        }
      });
      console.log('✅ Product saved successfully:', response.data);
      onSuccess();
    } catch (err) {
      console.error('❌ Error saving product:', err.response?.data || err);
      
      // ✅ FIX: Better error handling for file uploads
      let errorMessage = 'Failed to save product. Please check your input.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.main_image) {
          errorMessage = `Main image error: ${err.response.data.main_image[0]}`;
        } else if (err.response.data.sub_images) {
          errorMessage = `Sub images error: ${err.response.data.sub_images[0]}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit}>
          {/* --- Standard Fields --- */}
          <div style={styles.formGroup}>
            <label>Product Name*</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Model/Variation</label>
            <input 
              type="text" 
              name="model_name" 
              value={formData.model_name} 
              onChange={handleChange} 
              style={styles.input} 
              placeholder="e.g., Red XL"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Price (₹)*</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              required 
              style={styles.input} 
              step="0.01" 
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>MRP (₹)</label>
            <input 
              type="number" 
              name="mrp" 
              value={formData.mrp} 
              onChange={handleChange} 
              style={styles.input} 
              step="0.01" 
            />
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
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Online Stock*</label>
            <input 
              type="number" 
              name="online_stock" 
              value={formData.online_stock} 
              onChange={handleChange} 
              required 
              style={styles.input} 
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Where to sell?*</label>
            <select name="sale_type" value={formData.sale_type} onChange={handleChange} style={styles.input}>
              <option value="BOTH">Online & In-Store</option>
              <option value="OFFLINE">In-Store Only</option>
              <option value="ONLINE">Online Only</option>
            </select>
          </div>

          <hr style={styles.hr} />

          {/* --- Category & Attributes Section --- */}
          <div style={styles.formGroup}>
            <label>Product Category*</label>
            <select value={selectedCategoryId} onChange={handleCategoryChange} required style={styles.input}>
              <option value="">-- Select --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          {attributeFields.length > 0 && (
            <div style={styles.dynamicSection}>
              <h4>Category Specifics</h4>
              {attributeFields.map(name => (
                <div key={name} style={styles.formGroup}>
                  <label>{name}</label>
                  <input 
                    type="text" 
                    value={dynamicAttributes[name] || ''} 
                    onChange={e => handleAttributeChange(name, e.target.value)} 
                    style={styles.input}
                  />
                </div>
              ))}
            </div>
          )}

          <hr style={styles.hr} />

          {/* --- Image Upload Section --- */}
          <div style={styles.formGroup}>
            <label>Main Image*</label>
            {mainImagePreview && (
              <img src={mainImagePreview} alt="Main preview" style={styles.imagePreview}/>
            )}
            <input 
              type="file" 
              name="main_image" 
              onChange={handleMainImageChange} 
              accept="image/*" 
              required={!product || !mainImagePreview} 
              style={styles.input} 
            />
            {/* ✅ FIX: Add helpful text */}
            <small style={{color: '#666', fontSize: '12px'}}>
              {product ? 'Select a new image to replace the current one' : 'Please select a main image'}
            </small>
          </div>
          
          <div style={styles.formGroup}>
            <label>Sub Images (Up to 5)</label>
            <div style={styles.subImageGrid}>
              {subImagePreviews.map((previewUrl, index) => (
                <img 
                  key={index} 
                  src={previewUrl} 
                  alt={`Sub preview ${index+1}`} 
                  style={styles.imagePreview}
                />
              ))}
            </div>
            <input 
              type="file" 
              name="sub_images" 
              onChange={handleSubImageChange} 
              accept="image/*" 
              multiple 
              style={styles.input} 
            />
            <small style={{color: '#666', fontSize: '12px'}}>
              Select new images to replace all sub-images
            </small>
          </div>
          
          {error && <p style={{color: 'red', fontSize: '14px', marginTop: '10px'}}>{error}</p>}
          
          <div style={styles.buttonContainer}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting} 
              style={styles.buttonSecondary}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              style={styles.buttonPrimary}
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
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
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '20px 0' },
    dynamicSection: { border: '1px solid #0d6efd', borderRadius: '8px', padding: '15px', marginTop: '15px', backgroundColor: '#f0f8ff' },
    imagePreview: { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' },
    subImageGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' },
    buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' },
    buttonPrimary: { padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    buttonSecondary: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};