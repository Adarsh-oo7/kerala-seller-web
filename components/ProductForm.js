'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ Enhanced environment variable handling for your hosted backend
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl && envUrl !== 'undefined') {
    return envUrl;
  }
  
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const CATEGORIES_API_URL = `${API_BASE_URL}/api/categories/`;
const PRODUCTS_API_URL = `${API_BASE_URL}/user/store/products/`;

// ✅ WORKING CLOUDINARY CONFIGURATION WITH FALLBACK PRESETS
const CLOUDINARY_CONFIG = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnmbfeckd',
  upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kerala_sellers_preset',
  // ✅ Fallback presets if main one fails
  fallback_presets: ['ml_default', 'kerala_sellers_unsigned', 'unsigned_preset'],
  // ✅ Proper URL construction
  getUploadUrl: function() {
    return `https://api.cloudinary.com/v1_1/${this.cloud_name}/image/upload`;
  }
};

// ✅ VALIDATION FUNCTIONS - Prevent negative numbers and validate properly
const validatePositiveNumber = (value, fieldName = 'Value') => {
  if (value === '' || value === null || value === undefined) {
    return { isValid: true, error: null }; // Allow empty for optional fields
  }
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  if (numValue < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` };
  }
  if (numValue > 9999999) {
    return { isValid: false, error: `${fieldName} is too large` };
  }
  return { isValid: true, error: null };
};

const validatePositiveInteger = (value, fieldName = 'Value') => {
  if (value === '' || value === null || value === undefined) {
    return { isValid: true, error: null };
  }
  
  const numValue = parseInt(value);
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  if (numValue < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` };
  }
  if (!Number.isInteger(parseFloat(value))) {
    return { isValid: false, error: `${fieldName} must be a whole number` };
  }
  if (numValue > 999999) {
    return { isValid: false, error: `${fieldName} is too large` };
  }
  return { isValid: true, error: null };
};

// ✅ FIXED: Enhanced Cloudinary Upload Function with multiple preset fallback
const uploadToCloudinary = async (file, options = {}) => {
  console.log('🔄 Starting Cloudinary upload for:', file.name);
  
  // List of presets to try in order
  const presetsToTry = [
    CLOUDINARY_CONFIG.upload_preset,
    ...CLOUDINARY_CONFIG.fallback_presets
  ].filter(Boolean); // Remove any undefined presets
  
  let lastError = null;
  
  for (let i = 0; i < presetsToTry.length; i++) {
    const preset = presetsToTry[i];
    console.log(`🔧 Trying preset ${i + 1}/${presetsToTry.length}: ${preset}`);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      
      // ✅ Proper folder structure
      formData.append('folder', `kerala-sellers/products/${options.type || 'images'}`);
      
      // ✅ Add tags for organization
      const tags = ['kerala_sellers', options.type || 'product'];
      if (options.type === 'main') {
        tags.push('main_image');
      } else {
        tags.push('sub_image');
      }
      formData.append('tags', tags.join(','));
      
      // ✅ Add timestamp for uniqueness
      formData.append('timestamp', Math.floor(Date.now() / 1000));
      
      // ✅ Quality settings (allowed for unsigned uploads)
      formData.append('quality', 'auto:good');
      formData.append('fetch_format', 'auto');
      
      // ✅ Use axios with proper configuration
      const response = await axios.post(CLOUDINARY_CONFIG.getUploadUrl(), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds
        onUploadProgress: (progressEvent) => {
          if (options.onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            options.onProgress(percentCompleted);
          }
        },
      });
      
      console.log('✅ Upload successful with preset:', preset);
      console.log('📄 Response data:', response.data);
      
      return {
        success: true,
        url: response.data.secure_url,
        public_id: response.data.public_id,
        width: response.data.width,
        height: response.data.height,
        bytes: response.data.bytes,
        format: response.data.format,
        created_at: response.data.created_at,
        preset_used: preset,
        tags: response.data.tags || []
      };
      
    } catch (error) {
      console.error(`❌ Upload failed with preset ${preset}:`, error);
      lastError = error;
      
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // If this isn't the last preset, continue to next one
      if (i < presetsToTry.length - 1) {
        console.log(`🔄 Trying next preset...`);
        continue;
      }
    }
  }
  
  // All presets failed
  console.error('❌ All upload presets failed. Last error:', lastError);
  
  let errorMessage = 'Upload failed';
  if (lastError?.response?.data?.error?.message) {
    errorMessage = lastError.response.data.error.message;
  } else if (lastError?.response?.data?.message) {
    errorMessage = lastError.response.data.message;
  } else if (lastError?.message) {
    errorMessage = lastError.message;
  }
  
  return {
    success: false,
    error: errorMessage,
    details: lastError?.response?.data || lastError?.message
  };
};

// ✅ Create Axios instance with proper configuration for hosted backend
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor with Bearer authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login/seller';
    }
    return Promise.reject(error);
  }
);

// ✅ ENHANCED Cloudinary Image Upload Component
const CloudinaryImageUpload = ({ 
  label, 
  required = false, 
  multiple = false, 
  onUploadComplete, 
  onUploadStart,
  onUploadProgress,
  maxFiles = 5,
  currentImages = [],
  type = 'main',
  helpText = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [uploadResults, setUploadResults] = useState([]);

  useEffect(() => {
    if (currentImages.length > 0) {
      setPreviews(currentImages.map((img, index) => ({
        id: index,
        url: typeof img === 'string' ? img : img.url || img.image_url,
        public_id: typeof img === 'object' ? img.public_id : null,
        isUploaded: true
      })));
    }
  }, [currentImages]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // ✅ Validate file count
    if (multiple && files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // ✅ Validate file types and sizes
    const validFiles = [];
    const errors = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Only image files are allowed`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        errors.push(`${file.name}: File too large (max 10MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    if (!validFiles.length) return;

    setError('');
    setUploading(true);
    onUploadStart && onUploadStart();

    console.log(`🚀 Starting upload of ${validFiles.length} files to Cloudinary`);

    // ✅ Create preview URLs immediately
    const newPreviews = validFiles.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      file: file,
      uploading: true,
      progress: 0
    }));

    setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);

    // ✅ Upload files to Cloudinary with detailed logging
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const previewId = Date.now() + index;
        
        console.log(`🔄 Uploading file ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        const result = await uploadToCloudinary(file, {
          type: type,
          onProgress: (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [previewId]: progress
            }));
            onUploadProgress && onUploadProgress(progress);
            
            // Update preview progress
            setPreviews(currentPreviews => 
              currentPreviews.map(preview => 
                preview.id === previewId 
                  ? { ...preview, progress: progress }
                  : preview
              )
            );
          }
        });

        console.log(`📊 Upload result for ${file.name}:`, result.success ? '✅ Success' : '❌ Failed');
        
        return {
          ...result,
          previewId,
          originalFile: file
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // ✅ Separate successful and failed uploads
      const successfulUploads = uploadResults.filter(result => result.success);
      const failedUploads = uploadResults.filter(result => !result.success);
      
      console.log(`📈 Upload summary: ${successfulUploads.length} successful, ${failedUploads.length} failed`);
      
      if (failedUploads.length > 0) {
        console.error('❌ Failed uploads:', failedUploads.map(f => f.error).join(', '));
        setError(`${failedUploads.length} upload(s) failed: ${failedUploads[0].error}`);
      }

      if (successfulUploads.length > 0) {
        console.log('✅ Successful uploads:', successfulUploads.map(u => u.url));
        
        // ✅ Update previews with uploaded URLs
        setPreviews(prev => prev.map(preview => {
          const uploadResult = successfulUploads.find(result => result.previewId === preview.id);
          if (uploadResult) {
            return {
              ...preview,
              url: uploadResult.url,
              public_id: uploadResult.public_id,
              uploading: false,
              isUploaded: true,
              progress: 100
            };
          }
          return preview;
        }));

        // ✅ Store upload results for form submission
        const uploadData = successfulUploads.map(result => ({
          url: result.url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format,
          preset_used: result.preset_used
        }));
        
        setUploadResults(uploadData);
        
        // ✅ Call completion callback with proper data structure
        onUploadComplete && onUploadComplete(uploadData);
        
        console.log('🎉 Upload completed successfully, data sent to parent:', uploadData);
      } else {
        // Remove failed uploads from previews
        setPreviews(prev => prev.filter(preview => preview.isUploaded));
        setError('All uploads failed. Please try again.');
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      setError('Upload failed. Please try again.');
      
      // Remove failed uploads from previews
      setPreviews(prev => prev.filter(preview => preview.isUploaded));
    } finally {
      setUploading(false);
      setUploadProgress({});
      
      // Clear file input
      e.target.value = '';
    }
  };

  const removeImage = (previewId) => {
    console.log('🗑️ Removing image with ID:', previewId);
    
    setPreviews(prev => prev.filter(preview => preview.id !== previewId));
    
    // ✅ Update upload results and notify parent
    const updatedResults = uploadResults.filter(result => {
      const preview = previews.find(p => p.id === previewId);
      return result.url !== preview?.url;
    });
    
    setUploadResults(updatedResults);
    onUploadComplete && onUploadComplete(updatedResults);
  };

  return (
    <div style={styles.imageUploadContainer}>
      <label style={styles.label}>
        {label} {required && '*'}
      </label>
      
      {/* ✅ Enhanced error display */}
      {error && (
        <div style={styles.uploadError}>
          ⚠️ {error}
          <button 
            type="button" 
            onClick={() => setError('')}
            style={styles.errorCloseButton}
          >
            ✕
          </button>
        </div>
      )}

      {/* ✅ Upload Area with better visual feedback */}
      <div 
        style={{
          ...styles.uploadArea,
          borderColor: error ? '#dc3545' : uploading ? '#28a745' : '#0d6efd',
          backgroundColor: error ? '#fff5f5' : uploading ? '#f8fff8' : '#f8f9ff'
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          disabled={uploading}
          style={styles.fileInput}
          required={required && previews.filter(p => p.isUploaded).length === 0}
        />
        
        <div style={styles.uploadPrompt}>
          {uploading ? (
            <div>
              <div style={styles.uploadingIcon}>☁️⏳</div>
              <div><strong>Uploading to Cloudinary...</strong></div>
              <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                Please wait while we optimize and store your images
              </div>
            </div>
          ) : (
            <div>
              <div style={styles.uploadIcon}>☁️📷</div>
              <div><strong>Click to upload {multiple ? 'images' : 'image'}</strong></div>
              <div style={styles.uploadHint}>
                Supports: JPG, PNG, GIF, WEBP (Max 10MB each)
                <br />
                ☁️ Powered by Cloudinary ({CLOUDINARY_CONFIG.cloud_name})
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Enhanced Image Previews */}
      {previews.length > 0 && (
        <div style={styles.previewContainer}>
          <div style={styles.previewHeader}>
            <span>
              {multiple 
                ? `${previews.filter(p => p.isUploaded).length} of ${previews.length} images uploaded`
                : 'Image uploaded'
              }
            </span>
          </div>
          
          {multiple ? (
            <div style={styles.previewGrid}>
              {previews.map((preview) => (
                <div key={preview.id} style={styles.previewItem}>
                  <img
                    src={preview.url}
                    alt="Preview"
                    style={styles.previewImage}
                  />
                  
                  {preview.uploading && (
                    <div style={styles.uploadOverlay}>
                      <div style={styles.uploadProgress}>
                        {uploadProgress[preview.id] || 0}%
                        <div style={styles.progressSpinner}>⟳</div>
                      </div>
                    </div>
                  )}
                  
                  {preview.isUploaded && (
                    <>
                      <div style={styles.imageActions}>
                        <button
                          type="button"
                          onClick={() => removeImage(preview.id)}
                          style={styles.removeButton}
                          disabled={uploading}
                        >
                          🗑️
                        </button>
                      </div>
                      
                      <div style={styles.cloudinaryBadge}>
                        ☁️ Cloudinary
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            previews.map((preview) => (
              <div key={preview.id} style={styles.singlePreview}>
                <img
                  src={preview.url}
                  alt="Main product image"
                  style={styles.mainPreviewImage}
                />
                
                {preview.uploading && (
                  <div style={styles.uploadOverlay}>
                    <div style={styles.uploadProgress}>
                      Uploading: {uploadProgress[preview.id] || 0}%
                      <div style={styles.progressSpinner}>⟳</div>
                    </div>
                  </div>
                )}
                
                {preview.isUploaded && (
                  <>
                    <div style={styles.imageActions}>
                      <button
                        type="button"
                        onClick={() => removeImage(preview.id)}
                        style={styles.removeButton}
                        disabled={uploading}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                    
                    <div style={styles.cloudinaryBadge}>
                      ☁️ Optimized by Cloudinary
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ✅ Enhanced Help Text */}
      <small style={styles.helpText}>
        {helpText || (
          <span>
            📸 Images are automatically optimized and stored securely on Cloudinary
            {multiple && ` (${previews.filter(p => p.isUploaded).length}/${maxFiles} images)`}
            <br />
            🌟 Upload presets: {CLOUDINARY_CONFIG.upload_preset}
          </span>
        )}
      </small>
      
      {/* ✅ Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && uploadResults.length > 0 && (
        <details style={styles.debugInfo}>
          <summary>🔍 Debug Info</summary>
          <pre>{JSON.stringify(uploadResults, null, 2)}</pre>
        </details>
      )}
    </div>
  );
};

// ✅ Enhanced Category Selector Component (simplified for space)
const CategorySelector = ({ selectedCategoryId, onCategorySelect, onAttributesChange }) => {
  const [allCategories, setAllCategories] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentCategories, setCurrentCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load all categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/api/categories/');
      const categories = response.data.results || response.data || [];
      setAllCategories(categories);
      const rootCategories = categories.filter(cat => !cat.parent);
      setCurrentCategories(rootCategories);
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    const hasChildren = allCategories.some(cat => cat.parent === category.id);
    
    if (hasChildren) {
      setCurrentPath([...currentPath, category]);
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      onCategorySelect(category.id);
      
      const newAttributes = {};
      if (category.default_attributes) {
        category.default_attributes.forEach(attr => {
          newAttributes[attr.name] = '';
        });
      }
      onAttributesChange(newAttributes);
    }
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={categoryStyles.container}>
      <h3>🏷️ Select Product Category</h3>
      {selectedCategory && (
        <div style={categoryStyles.selectedCategory}>
          ✅ {selectedCategory.name}
        </div>
      )}
      <div style={categoryStyles.categoriesGrid}>
        {currentCategories.map(category => {
          const hasChildren = allCategories.some(cat => cat.parent === category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category)}
              style={categoryStyles.categoryCard}
            >
              <div>{category.name} {hasChildren ? '📁' : '📄'}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ✅ Smart Stock Input Component (simplified)
const SmartStockInput = ({ formData, setFormData }) => {
  const [stockError, setStockError] = useState('');
  
  const handleTotalStockChange = (e) => {
    let value = e.target.value.replace('-', '');
    const validation = validatePositiveInteger(value, 'Total Stock');
    if (validation.isValid) {
      const newTotal = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        total_stock: newTotal,
        online_stock: prev.online_stock > newTotal ? newTotal : prev.online_stock
      }));
      setStockError('');
    } else {
      setStockError(validation.error);
    }
  };

  const handleOnlineStockChange = (e) => {
    let value = e.target.value.replace('-', '');
    const validation = validatePositiveInteger(value, 'Online Stock');
    if (validation.isValid) {
      const newOnline = parseInt(value) || 0;
      if (newOnline > formData.total_stock) {
        setStockError('Online stock cannot be more than total stock');
      } else {
        setFormData(prev => ({ ...prev, online_stock: newOnline }));
        setStockError('');
      }
    } else {
      setStockError(validation.error);
    }
  };

  return (
    <div style={styles.stockContainer}>
      <h3>📦 Stock Management</h3>
      {stockError && <div style={styles.stockError}>⚠️ {stockError}</div>}
      
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>📦 Total Stock *</label>
          <input 
            type="number" 
            value={formData.total_stock} 
            onChange={handleTotalStockChange}
            required 
            style={styles.input}
            min="0"
            step="1"
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>🌐 Online Stock *</label>
          <input 
            type="number" 
            value={formData.online_stock} 
            onChange={handleOnlineStockChange}
            required 
            style={styles.input}
            min="0"
            max={formData.total_stock}
            step="1"
          />
        </div>
      </div>
    </div>
  );
};

// ✅ MAIN PRODUCT FORM WITH ENHANCED VALIDATION
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

  const [mainImageUrl, setMainImageUrl] = useState('');
  const [subImageUrls, setSubImageUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [dynamicAttributes, setDynamicAttributes] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [priceError, setPriceError] = useState('');

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
      setMainImageUrl(product.main_image_url || '');
      setSubImageUrls(product.sub_images?.map(img => ({
        url: img.image_url || img.url,
        public_id: img.public_id
      })) || []);
    }
  }, [product]);

  // ✅ Handle form changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'mrp') {
      let cleanValue = value.replace('-', '');
      const validation = validatePositiveNumber(cleanValue, name === 'price' ? 'Selling Price' : 'MRP');
      if (validation.isValid) {
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
        setPriceError('');
        
        if (name === 'price' && formData.mrp && parseFloat(cleanValue) > parseFloat(formData.mrp)) {
          setPriceError('Selling price cannot be higher than MRP');
        } else if (name === 'mrp' && formData.price && parseFloat(formData.price) > parseFloat(cleanValue)) {
          setPriceError('MRP cannot be lower than selling price');
        }
      } else if (cleanValue !== '') {
        setPriceError(validation.error);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMainImageUpload = (uploadedImages) => {
    if (uploadedImages.length > 0) {
      setMainImageUrl(uploadedImages[0].url);
    } else {
      setMainImageUrl('');
    }
    setUploadingImages(false);
  };

  const handleSubImagesUpload = (uploadedImages) => {
    setSubImageUrls(uploadedImages);
    setUploadingImages(false);
  };

  const handleAttributeChange = (attributeName, value) => {
    setDynamicAttributes(prev => ({ ...prev, [attributeName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Comprehensive validation
    if (!mainImageUrl && !product) {
      setError('Please upload a main product image');
      return;
    }
    
    if (uploadingImages) {
      setError('Please wait for image uploads to complete');
      return;
    }

    const priceValidation = validatePositiveNumber(formData.price, 'Selling Price');
    if (!priceValidation.isValid) {
      setError(priceValidation.error);
      return;
    }

    if (formData.mrp) {
      const mrpValidation = validatePositiveNumber(formData.mrp, 'MRP');
      if (!mrpValidation.isValid) {
        setError(mrpValidation.error);
        return;
      }

      if (parseFloat(formData.price) > parseFloat(formData.mrp)) {
        setError('Selling price cannot be higher than MRP');
        return;
      }
    }

    const totalStockValidation = validatePositiveInteger(formData.total_stock, 'Total Stock');
    if (!totalStockValidation.isValid) {
      setError(totalStockValidation.error);
      return;
    }

    const onlineStockValidation = validatePositiveInteger(formData.online_stock, 'Online Stock');
    if (!onlineStockValidation.isValid) {
      setError(onlineStockValidation.error);
      return;
    }

    if (formData.online_stock > formData.total_stock) {
      setError('Online stock cannot be more than total stock');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    // ✅ Prepare submission data (JSON format since images are already on Cloudinary)
    const submissionData = {
      ...formData,
      category: selectedCategoryId ? parseInt(selectedCategoryId) : null,
      attributes: dynamicAttributes,
      main_image_url: mainImageUrl,
      sub_image_urls: subImageUrls.map(img => ({
        url: img.url,
        public_id: img.public_id
      }))
    };

    const url = product 
      ? `${PRODUCTS_API_URL}${product.id}/` 
      : PRODUCTS_API_URL;
    const method = product ? 'PATCH' : 'POST';

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios({
        method,
        url,
        data: submissionData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      console.log('✅ Product saved successfully:', response.data);
      onSuccess();
    } catch (err) {
      let errorMessage = 'Something went wrong. Please check your details and try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          window.location.href = '/login/seller';
        }, 2000);
      } else if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.category) {
          errorMessage = 'Please select a valid category';
        } else if (err.response.data.main_image_url) {
          errorMessage = 'Main image is required';
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request is taking too long. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {product ? '✏️ Edit Product' : '🆕 Add New Product'}
          </h2>
          <div style={styles.connectionStatus}>
            ☁️ Images powered by Cloudinary | 🌐 API: {API_BASE_URL.replace('https://', '').replace('http://', '')}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* === BASIC PRODUCT INFORMATION === */}
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>📝 Basic Product Information</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>🏷️ Product Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                style={styles.input}
                placeholder="e.g., Premium Cotton T-Shirt, iPhone 13, Running Shoes..."
              />
              <small style={styles.helpText}>Give your product a clear, descriptive name</small>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>🔧 Model/Variation (Optional)</label>
              <input 
                type="text" 
                name="model_name" 
                value={formData.model_name} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="e.g., Red XL, 128GB Black, Size 42..."
              />
              <small style={styles.helpText}>Specify color, size, model year, or any variations</small>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>📄 Product Description (Optional)</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                style={styles.textArea}
                placeholder="Describe your product: features, benefits, materials..."
                rows="4"
              />
              <small style={styles.helpText}>Help customers understand why they should buy your product</small>
            </div>
          </div>

          {/* === PRICING WITH VALIDATION === */}
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>💰 Pricing Information</h3>
            
            {priceError && (
              <div style={styles.priceError}>
                ⚠️ {priceError}
              </div>
            )}
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>💵 Your Selling Price (₹) *</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                  style={styles.input} 
                  step="0.01"
                  min="0"
                  placeholder="299.99"
                  onKeyPress={(e) => {
                    if (e.key === '-') e.preventDefault();
                  }}
                />
                <small style={styles.helpText}>The price you want to charge customers</small>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>🏷️ MRP - Maximum Retail Price (₹)</label>
                <input 
                  type="number" 
                  name="mrp" 
                  value={formData.mrp} 
                  onChange={handleChange} 
                  style={styles.input} 
                  step="0.01"
                  min="0"
                  placeholder="399.99"
                  onKeyPress={(e) => {
                    if (e.key === '-') e.preventDefault();
                  }}
                />
                <small style={styles.helpText}>Original price (must be higher than or equal to selling price)</small>
              </div>
            </div>

            {/* Show discount calculation */}
            {formData.price && formData.mrp && parseFloat(formData.mrp) > parseFloat(formData.price) && (
              <div style={styles.discountDisplay}>
                🎉 Great! You're offering a discount of ₹{(parseFloat(formData.mrp) - parseFloat(formData.price)).toFixed(2)} 
                ({Math.round(((parseFloat(formData.mrp) - parseFloat(formData.price)) / parseFloat(formData.mrp)) * 100)}% off)
              </div>
            )}
          </div>

          {/* === STOCK MANAGEMENT === */}
          <SmartStockInput formData={formData} setFormData={setFormData} />
          
          {/* === SALES CHANNELS === */}
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>🛍️ Where Do You Want to Sell?</h3>
            <select 
              name="sale_type" 
              value={formData.sale_type} 
              onChange={handleChange} 
              style={styles.selectInput}
            >
              <option value="BOTH">🌐 Both Online & In-Store (Recommended)</option>
              <option value="OFFLINE">🏪 Only In My Physical Store</option>
              <option value="ONLINE">🌐 Only Online Sales</option>
            </select>
            <small style={styles.helpText}>Choose where customers can buy this product</small>
          </div>

          <hr style={styles.hr} />

          {/* === CATEGORY SECTION === */}
          <CategorySelector
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
            onAttributesChange={setDynamicAttributes}
          />
          
          {/* Dynamic Attributes Section */}
          {Object.keys(dynamicAttributes).length > 0 && (
            <div style={styles.attributesSection}>
              <h3 style={styles.sectionTitle}>🔧 Category-Specific Details</h3>
              <div style={styles.attributesGrid}>
                {Object.keys(dynamicAttributes).map(name => (
                  <div key={name} style={styles.formGroup}>
                    <label style={styles.label}>📝 {name}</label>
                    <input 
                      type="text" 
                      value={dynamicAttributes[name] || ''} 
                      onChange={e => handleAttributeChange(name, e.target.value)} 
                      style={styles.input}
                      placeholder={`Enter ${name.toLowerCase()}...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr style={styles.hr} />

          {/* === CLOUDINARY IMAGE UPLOADS === */}
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>☁️ Product Images (Cloudinary)</h3>
            
            {/* Main Image Upload */}
            <CloudinaryImageUpload
              label="📷 Main Product Image"
              required={!product}
              type="main"
              onUploadComplete={handleMainImageUpload}
              onUploadStart={() => setUploadingImages(true)}
              currentImages={mainImageUrl ? [mainImageUrl] : []}
              helpText="📸 This is the first image customers will see. Make it count!"
            />

            {/* Additional Images Upload */}
            <CloudinaryImageUpload
              label="🖼️ Additional Images"
              multiple={true}
              maxFiles={5}
              type="sub"
              onUploadComplete={handleSubImagesUpload}
              onUploadStart={() => setUploadingImages(true)}
              currentImages={subImageUrls}
              helpText="📷 Add more angles, close-ups, or usage photos"
            />
          </div>
          
          {/* === ERROR DISPLAY === */}
          {error && (
            <div style={styles.errorAlert}>
              <strong>⚠️ Oops! Something went wrong:</strong>
              <br />
              {error}
            </div>
          )}
          
          {/* === ACTION BUTTONS === */}
          <div style={styles.buttonContainer}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting || uploadingImages} 
              style={styles.buttonSecondary}
            >
              ❌ Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || uploadingImages || !selectedCategoryId || priceError} 
              style={styles.buttonPrimary}
            >
              {isSubmitting ? (
                <>⏳ {product ? 'Updating...' : 'Creating...'}</>
              ) : uploadingImages ? (
                <>☁️ Uploading Images...</>
              ) : (
                <>{product ? '✅ Update Product' : '🚀 Create Product'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ✅ COMPREHENSIVE STYLES
const styles = {
  modalOverlay: { 
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', 
    justifyContent: 'center', alignItems: 'center', zIndex: 1000 
  },
  modalContent: { 
    background: 'white', padding: '2rem', borderRadius: '16px', 
    width: '900px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f8f9fa'
  },
  modalTitle: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#333'
  },
  connectionStatus: {
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: '6px 12px',
    borderRadius: '16px',
    display: 'inline-block'
  },
  sectionContainer: {
    marginBottom: '2rem',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '2px solid #e9ecef'
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formGroup: { 
    marginBottom: '1.5rem' 
  },
  formRow: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '1.5rem', 
    marginBottom: '1rem' 
  },
  input: { 
    width: '100%', 
    padding: '12px 16px', 
    boxSizing: 'border-box', 
    border: '2px solid #e9ecef', 
    borderRadius: '8px', 
    fontSize: '16px',
    transition: 'all 0.2s',
    backgroundColor: 'white'
  },
  selectInput: {
    width: '100%', 
    padding: '12px 16px', 
    boxSizing: 'border-box', 
    border: '2px solid #e9ecef', 
    borderRadius: '8px', 
    fontSize: '16px',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  textArea: {
    width: '100%', 
    padding: '12px 16px', 
    boxSizing: 'border-box', 
    border: '2px solid #e9ecef', 
    borderRadius: '8px', 
    fontSize: '16px',
    resize: 'vertical', 
    minHeight: '100px',
    backgroundColor: 'white'
  },
  label: {
    display: 'block', 
    marginBottom: '6px', 
    fontWeight: '600', 
    fontSize: '16px', 
    color: '#333'
  },
  helpText: {
    fontSize: '13px', 
    color: '#6c757d', 
    marginTop: '4px', 
    display: 'block',
    lineHeight: '1.4'
  },
  hr: { 
    border: 'none', 
    borderTop: '3px solid #f8f9fa', 
    margin: '32px 0' 
  },
  
  // Error message styles
  priceError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #f5c6cb',
    fontSize: '14px'
  },
  stockError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '1px solid #f5c6cb',
    fontSize: '14px'
  },
  
  // Stock Management Styles
  stockContainer: {
    border: '2px solid #0d6efd', 
    borderRadius: '16px', 
    padding: '24px', 
    marginBottom: '2rem', 
    backgroundColor: '#f0f8ff'
  },
  
  // Image Upload Styles
  imageUploadContainer: {
    marginBottom: '24px'
  },
  
  uploadArea: {
    position: 'relative',
    border: '3px dashed #0d6efd',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f8f9ff',
    transition: 'all 0.2s',
    marginBottom: '16px'
  },
  
  uploadPrompt: {
    pointerEvents: 'none'
  },
  
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  
  uploadingIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  
  uploadHint: {
    fontSize: '12px',
    color: '#6c757d',
    marginTop: '8px'
  },
  
  uploadError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
    border: '1px solid #f5c6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  errorCloseButton: {
    background: 'none',
    border: 'none',
    color: '#721c24',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '0 8px'
  },
  
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer'
  },
  
  previewContainer: {
    marginTop: '16px'
  },
  
  previewHeader: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#28a745',
    marginBottom: '12px',
    textAlign: 'center'
  },
  
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px'
  },
  
  previewItem: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #28a745'
  },
  
  previewImage: {
    width: '100%',
    height: '120px',
    objectFit: 'cover'
  },
  
  singlePreview: {
    position: 'relative',
    display: 'inline-block',
    marginRight: '12px'
  },
  
  mainPreviewImage: {
    width: '200px',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '12px',
    border: '3px solid #28a745'
  },
  
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    flexDirection: 'column'
  },
  
  uploadProgress: {
    textAlign: 'center'
  },
  
  progressSpinner: {
    fontSize: '20px',
    marginTop: '8px',
    animation: 'spin 1s linear infinite'
  },
  
  imageActions: {
    position: 'absolute',
    top: '8px',
    right: '8px'
  },
  
  removeButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },
  
  cloudinaryBadge: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    right: '4px',
    backgroundColor: 'rgba(74, 144, 226, 0.9)',
    color: 'white',
    padding: '4px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    textAlign: 'center',
    fontWeight: '600'
  },
  
  debugInfo: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '11px'
  },
  
  // Other Styles
  attributesSection: { 
    border: '2px solid #0d6efd', 
    borderRadius: '16px', 
    padding: '20px', 
    marginTop: '20px', 
    backgroundColor: '#f0f8ff' 
  },
  attributesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  discountDisplay: {
    backgroundColor: '#d4edda',
    border: '2px solid #c3e6cb',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '12px',
    color: '#155724',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center'
  },
  errorAlert: {
    color: '#721c24',
    fontSize: '16px',
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f8d7da',
    border: '2px solid #f5c6cb',
    borderRadius: '8px',
    lineHeight: '1.5'
  },
  buttonContainer: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '16px', 
    marginTop: '32px', 
    paddingTop: '20px', 
    borderTop: '2px solid #e9ecef'
  },
  buttonPrimary: { 
    padding: '14px 28px', 
    backgroundColor: '#0d6efd', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '16px',
    fontWeight: '600', 
    transition: 'all 0.2s'
  },
  buttonSecondary: { 
    padding: '14px 28px', 
    backgroundColor: '#6c757d', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '16px',
    fontWeight: '600', 
    transition: 'all 0.2s'
  }
};

// Category Styles (simplified)
const categoryStyles = {
  container: {
    marginBottom: '1.5rem',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#f8f9fa'
  },
  selectedCategory: {
    color: '#28a745',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#d4edda',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '2px solid #c3e6cb',
    marginBottom: '16px'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px'
  },
  categoryCard: {
    background: 'white',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textAlign: 'left',
    minHeight: '60px'
  }
};

// ✅ Add CSS animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
