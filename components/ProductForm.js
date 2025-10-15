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

// ✅ CLOUDINARY CONFIGURATION
const CLOUDINARY_CONFIG = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnmbfeckd',
  upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kerala_sellers_preset',
  upload_url: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnmbfeckd'}/image/upload`
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

// ✅ FIXED: Enhanced Cloudinary Upload Function (no transformation parameter)
const uploadToCloudinary = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
  formData.append('folder', 'kerala-sellers/products');
  
  if (options.type === 'main') {
    formData.append('tags', 'main_image,kerala_sellers');
  } else {
    formData.append('tags', 'sub_image,kerala_sellers');
  }
  
  formData.append('timestamp', Date.now());
  
  try {
    const response = await axios.post(CLOUDINARY_CONFIG.upload_url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        if (options.onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onProgress(percentCompleted);
        }
      },
    });
    
    return {
      success: true,
      url: response.data.secure_url,
      public_id: response.data.public_id,
      width: response.data.width,
      height: response.data.height,
      bytes: response.data.bytes,
      format: response.data.format
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Upload failed'
    };
  }
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

// ✅ FIXED: Enhanced Cloudinary Image Upload Component
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

  useEffect(() => {
    if (currentImages.length > 0) {
      setPreviews(currentImages.map((img, index) => ({
        id: index,
        url: typeof img === 'string' ? img : img.url || img.image_url,
        isUploaded: true
      })));
    }
  }, [currentImages]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate file count
    if (multiple && files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size should be less than 10MB');
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setError('');
    setUploading(true);
    onUploadStart && onUploadStart();

    // Create preview URLs immediately
    const newPreviews = validFiles.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      file: file,
      uploading: true,
      progress: 0
    }));

    setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);

    // Upload files to Cloudinary
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const previewId = Date.now() + index;
        
        const result = await uploadToCloudinary(file, {
          type: type,
          onProgress: (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [previewId]: progress
            }));
            onUploadProgress && onUploadProgress(progress);
          }
        });

        return {
          ...result,
          previewId,
          originalFile: file
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Check for any failed uploads
      const failedUploads = uploadResults.filter(result => !result.success);
      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} image(s) failed to upload: ${failedUploads[0].error}`);
      }

      // Get successful uploads
      const successfulUploads = uploadResults.filter(result => result.success);
      
      if (successfulUploads.length > 0) {
        // Update previews with uploaded URLs
        setPreviews(prev => prev.map(preview => {
          const uploadResult = successfulUploads.find(result => result.previewId === preview.id);
          if (uploadResult) {
            return {
              ...preview,
              url: uploadResult.url,
              public_id: uploadResult.public_id,
              uploading: false,
              isUploaded: true
            };
          }
          return preview;
        }));

        // Call completion callback
        onUploadComplete && onUploadComplete(successfulUploads.map(result => ({
          url: result.url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format
        })));
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
      
      // Remove failed uploads from previews
      setPreviews(prev => prev.filter(preview => preview.isUploaded));
    } finally {
      setUploading(false);
      setUploadProgress({});
    }

    // Clear the file input
    e.target.value = '';
  };

  const removeImage = (previewId) => {
    setPreviews(prev => prev.filter(preview => preview.id !== previewId));
    
    // If it's a single image upload, notify parent
    if (!multiple) {
      onUploadComplete && onUploadComplete([]);
    } else {
      // For multiple uploads, send remaining uploaded images
      const remainingUploaded = previews
        .filter(p => p.id !== previewId && p.isUploaded)
        .map(p => ({
          url: p.url,
          public_id: p.public_id
        }));
      onUploadComplete && onUploadComplete(remainingUploaded);
    }
  };

  return (
    <div style={styles.imageUploadContainer}>
      <label style={styles.label}>
        {label} {required && '*'}
      </label>
      
      {error && (
        <div style={styles.uploadError}>
          ⚠️ {error}
        </div>
      )}

      {/* Upload Area */}
      <div style={styles.uploadArea}>
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
              <div>Uploading to Cloudinary...</div>
              <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                Optimizing and storing securely
              </div>
            </div>
          ) : (
            <div>
              <div style={styles.uploadIcon}>☁️📷</div>
              <div>Click to upload {multiple ? 'images' : 'image'}</div>
              <div style={styles.uploadHint}>
                Supports: JPG, PNG, GIF, WEBP (Max 10MB each)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div style={styles.previewContainer}>
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
                      </div>
                    </div>
                  )}
                  
                  {preview.isUploaded && (
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
                  )}
                  
                  {preview.isUploaded && (
                    <div style={styles.cloudinaryBadge}>
                      ☁️ Cloudinary
                    </div>
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
                    </div>
                  </div>
                )}
                
                {preview.isUploaded && (
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
                )}
                
                {preview.isUploaded && (
                  <div style={styles.cloudinaryBadge}>
                    ☁️ Optimized by Cloudinary
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <small style={styles.helpText}>
        {helpText || `📸 Images are automatically optimized and stored securely on Cloudinary${multiple ? ` (${previews.filter(p => p.isUploaded).length}/${maxFiles} images)` : ''}`}
      </small>
    </div>
  );
};

// ✅ FIXED: CategorySelector - COMPLETELY PREVENT MAIN FORM FROM CLOSING
const CategorySelector = ({ selectedCategoryId, onCategorySelect, onAttributesChange }) => {
  const [allCategories, setAllCategories] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentCategories, setCurrentCategories] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryDesc, setCustomCategoryDesc] = useState('');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createCategoryError, setCreateCategoryError] = useState('');
  const [createCategorySuccess, setCreateCategorySuccess] = useState('');

  // Load all categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching categories from:', CATEGORIES_API_URL);
      const response = await apiClient.get('/api/categories/');
      const categories = response.data.results || response.data || [];
      
      console.log('✅ Fetched categories:', categories.length);
      setAllCategories(categories);
      
      const rootCategories = categories.filter(cat => !cat.parent);
      setCurrentCategories(rootCategories);
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load categories. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update current categories when path changes
  useEffect(() => {
    if (currentPath.length === 0) {
      const rootCategories = allCategories.filter(cat => !cat.parent);
      setCurrentCategories(rootCategories);
    } else {
      const lastCategory = currentPath[currentPath.length - 1];
      const children = allCategories.filter(cat => cat.parent === lastCategory.id);
      setCurrentCategories(children);
    }
  }, [currentPath, allCategories]);

  // Initialize with selected category
  useEffect(() => {
    if (selectedCategoryId && allCategories.length > 0) {
      const category = allCategories.find(cat => cat.id == selectedCategoryId);
      if (category) {
        setSelectedCategory(category);
        buildPathToCategory(category);
      }
    }
  }, [selectedCategoryId, allCategories]);

  const buildPathToCategory = (category) => {
    const path = [];
    let current = category;
    
    while (current && current.parent) {
      const parent = allCategories.find(cat => cat.id === current.parent);
      if (parent) {
        path.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    
    setCurrentPath(path);
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

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
    setSelectedCategory(null);
  };

  // ✅ COMPLETELY FIXED: This will not close the main form
  const handleCustomCategorySubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!customCategoryName.trim()) {
      setCreateCategoryError('Category name is required');
      return;
    }

    setIsSubmittingCustom(true);
    setCreateCategoryError('');
    setCreateCategorySuccess('');
    
    const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
    
    const categoryData = {
      name: customCategoryName.trim(),
      description: customCategoryDesc.trim() || '',
      parent: parentId
    };

    console.log('🚀 Creating category:', categoryData);
    
    try {
      const response = await apiClient.post('/api/categories/', categoryData);
      const newCategory = response.data;
      
      console.log('✅ Category created successfully:', newCategory);
      
      // Show success message
      setCreateCategorySuccess(`Category "${newCategory.name}" created successfully! 🎉`);
      
      // Refresh categories list
      await fetchCategories();
      
      // Auto-select the new category if it's a leaf node
      setSelectedCategory(newCategory);
      onCategorySelect(newCategory.id);
      onAttributesChange({});
      
      // Clear form and close modal after 1.5 second
      setTimeout(() => {
        setCustomCategoryName('');
        setCustomCategoryDesc('');
        setCreateCategorySuccess('');
        setShowCustomForm(false);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Error creating category:', err);
      if (err.response?.status === 401) {
        setCreateCategoryError('Session expired. Please log in again.');
      } else if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          setCreateCategoryError(errorData);
        } else if (errorData.detail) {
          setCreateCategoryError(errorData.detail);
        } else if (errorData.name) {
          setCreateCategoryError(`Category name error: ${errorData.name[0]}`);
        } else {
          setCreateCategoryError('Failed to create category. Please try again.');
        }
      } else {
        setCreateCategoryError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const filteredCategories = searchTerm 
    ? currentCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentCategories;

  const categoryStyles = {
    container: {
      marginBottom: '1.5rem',
      border: '2px solid #e9ecef',
      borderRadius: '12px',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    title: {
      fontWeight: '700',
      fontSize: '16px',
      color: '#333',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    selectedCategory: {
      color: '#28a745',
      fontSize: '14px',
      fontWeight: '600',
      backgroundColor: '#d4edda',
      padding: '6px 12px',
      borderRadius: '20px',
      border: '2px solid #c3e6cb'
    },
    stepGuide: {
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '16px',
      fontSize: '13px',
      color: '#856404'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '30px',
      color: '#666'
    },
    errorContainer: {
      textAlign: 'center',
      padding: '20px',
      color: '#dc3545',
      backgroundColor: '#f8d7da',
      border: '2px solid #f5c6cb',
      borderRadius: '8px'
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '6px',
      marginBottom: '16px',
      padding: '12px 16px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '2px solid #e9ecef'
    },
    breadcrumbItem: {
      background: 'none',
      border: 'none',
      color: '#0d6efd',
      cursor: 'pointer',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.2s'
    },
    breadcrumbActive: {
      backgroundColor: '#0d6efd',
      color: 'white'
    },
    breadcrumbSeparator: {
      color: '#6c757d',
      margin: '0 6px',
      fontSize: '14px'
    },
    searchContainer: {
      marginBottom: '16px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #ccc',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '12px',
      marginBottom: '16px'
    },
    categoryCard: {
      background: 'white',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      textAlign: 'left',
      minHeight: '90px',
      position: 'relative',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    categoryCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    },
    categoryCardParent: {
      borderColor: '#0d6efd',
      backgroundColor: '#f0f8ff'
    },
    categoryCardLeaf: {
      borderColor: '#28a745',
      backgroundColor: '#f8fff8'
    },
    categoryCardSelected: {
      borderColor: '#ffc107',
      backgroundColor: '#fffdf0',
      boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)'
    },
    categoryCardContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      height: '100%'
    },
    categoryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    categoryName: {
      fontWeight: '600',
      fontSize: '14px',
      color: '#212529',
      lineHeight: '1.3'
    },
    categoryIcon: {
      fontSize: '18px'
    },
    categoryDescription: {
      fontSize: '11px',
      color: '#6c757d',
      lineHeight: '1.3',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    },
    categoryMeta: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '3px'
    },
    childrenCount: {
      fontSize: '11px',
      color: '#0d6efd',
      fontWeight: '600'
    },
    selectableText: {
      fontSize: '11px',
      color: '#28a745',
      fontWeight: '600'
    },
    addCustomButton: {
      background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
      border: '2px dashed #ffc107',
      borderRadius: '8px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      minHeight: '90px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    addCustomContent: {
      textAlign: 'center'
    },
    addCustomIcon: {
      fontSize: '20px',
      marginBottom: '4px'
    },
    addCustomText: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#856404',
      marginBottom: '2px'
    },
    addCustomSubtext: {
      fontSize: '10px',
      color: '#6c757d'
    },
    emptyState: {
      textAlign: 'center',
      padding: '30px',
      color: '#6c757d'
    },
    clearSearchButton: {
      padding: '8px 16px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      marginTop: '10px'
    },
    // ✅ COMPLETELY ISOLATED MODAL - NO EVENT BUBBLING
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999, // Very high z-index
      cursor: 'pointer'
    },
    modalContent: {
      background: 'white',
      padding: '24px',
      borderRadius: '12px',
      width: '450px',
      maxWidth: '95%',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      cursor: 'default',
      position: 'relative'
    },
    modalInput: {
      width: '100%',
      padding: '10px 12px',
      border: '2px solid #ccc',
      borderRadius: '6px',
      fontSize: '14px',
      marginTop: '6px',
      boxSizing: 'border-box'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    cancelButton: {
      padding: '10px 20px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    submitButton: {
      padding: '10px 20px',
      background: '#0d6efd',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    helpText: {
      fontSize: '12px',
      color: '#6c757d',
      fontStyle: 'italic',
      textAlign: 'center',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #e9ecef',
      marginTop: '12px'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px',
      border: '1px solid #f5c6cb',
      fontSize: '14px'
    },
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px',
      border: '1px solid #c3e6cb',
      fontSize: '14px'
    }
  };

  if (loading) {
    return (
      <div style={categoryStyles.container}>
        <div style={categoryStyles.header}>
          <h3 style={categoryStyles.title}>🏷️ Select Product Category</h3>
        </div>
        <div style={categoryStyles.loadingContainer}>
          <div>🔄 Loading categories...</div>
          <div style={{fontSize: '12px', color: '#999', marginTop: '8px'}}>Please wait while we fetch available categories</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={categoryStyles.container}>
        <div style={categoryStyles.header}>
          <h3 style={categoryStyles.title}>🏷️ Select Product Category</h3>
        </div>
        <div style={categoryStyles.errorContainer}>
          <div>⚠️ {error}</div>
          <button onClick={fetchCategories} style={categoryStyles.clearSearchButton}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={categoryStyles.container}>
      {/* Header */}
      <div style={categoryStyles.header}>
        <h3 style={categoryStyles.title}>🏷️ Select Product Category</h3>
        {selectedCategory && (
          <div style={categoryStyles.selectedCategory}>
            ✅ {selectedCategory.name}
          </div>
        )}
      </div>

      {/* Step-by-Step Guide */}
      <div style={categoryStyles.stepGuide}>
        <strong>📋 How to select a category:</strong>
        <br />
        1️⃣ Click folder icons (📁) to explore subcategories
        <br />
        2️⃣ Click document icons (📄) to select final category
        <br />
        3️⃣ Can't find your category? Click "➕ Create New" to add it
      </div>

      {/* Breadcrumb Navigation */}
      <div style={categoryStyles.breadcrumb}>
        <button 
          type="button"
          onClick={() => handleBreadcrumbClick(-1)}
          style={{
            ...categoryStyles.breadcrumbItem, 
            ...(currentPath.length === 0 ? categoryStyles.breadcrumbActive : {})
          }}
        >
          🏠 All Categories
        </button>
        
        {currentPath.map((category, index) => (
          <span key={category.id}>
            <span style={categoryStyles.breadcrumbSeparator}>›</span>
            <button 
              type="button"
              onClick={() => handleBreadcrumbClick(index)}
              style={{
                ...categoryStyles.breadcrumbItem, 
                ...(index === currentPath.length - 1 ? categoryStyles.breadcrumbActive : {})
              }}
            >
              {category.name}
            </button>
          </span>
        ))}
      </div>

      {/* Search Box */}
      {currentCategories.length > 8 && (
        <div style={categoryStyles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search categories by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={categoryStyles.searchInput}
          />
        </div>
      )}

      {/* Categories Grid */}
      <div style={categoryStyles.categoriesGrid}>
        {filteredCategories.map(category => {
          const hasChildren = allCategories.some(cat => cat.parent === category.id);
          const isSelected = selectedCategory?.id === category.id;
          
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  Object.assign(e.target.style, categoryStyles.categoryCardHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
              }}
              style={{
                ...categoryStyles.categoryCard,
                ...(isSelected ? categoryStyles.categoryCardSelected : {}),
                ...(hasChildren ? categoryStyles.categoryCardParent : categoryStyles.categoryCardLeaf)
              }}
            >
              <div style={categoryStyles.categoryCardContent}>
                <div style={categoryStyles.categoryHeader}>
                  <span style={categoryStyles.categoryName}>{category.name}</span>
                  <span style={categoryStyles.categoryIcon}>
                    {hasChildren ? '📁' : '📄'}
                  </span>
                </div>
                
                {category.description && (
                  <div style={categoryStyles.categoryDescription}>
                    {category.description}
                  </div>
                )}
                
                <div style={categoryStyles.categoryMeta}>
                  {hasChildren ? (
                    <span style={categoryStyles.childrenCount}>
                      👆 Click to explore {allCategories.filter(cat => cat.parent === category.id).length} subcategories
                    </span>
                  ) : (
                    <div>
                      <span style={categoryStyles.selectableText}>✅ Click to select this category</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* Add Custom Category Card */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowCustomForm(true);
          }}
          style={categoryStyles.addCustomButton}
        >
          <div style={categoryStyles.addCustomContent}>
            <div style={categoryStyles.addCustomIcon}>➕</div>
            <div style={categoryStyles.addCustomText}>Create New Category</div>
            <div style={categoryStyles.addCustomSubtext}>
              {currentPath.length > 0 
                ? `Under "${currentPath[currentPath.length - 1].name}"` 
                : "As main category"
              }
            </div>
          </div>
        </button>
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && searchTerm && (
        <div style={categoryStyles.emptyState}>
          <div>🔍 No categories found for "{searchTerm}"</div>
          <button 
            type="button"
            onClick={() => setSearchTerm('')}
            style={categoryStyles.clearSearchButton}
          >
            ❌ Clear Search
          </button>
        </div>
      )}

      {/* ✅ COMPLETELY FIXED: Custom Category Modal - ISOLATED FROM MAIN FORM */}
      {showCustomForm && (
        <div 
          style={categoryStyles.modalOverlay}
          onClick={(e) => {
            // ✅ ONLY close if clicking directly on overlay, not on modal content
            if (e.target === e.currentTarget) {
              setShowCustomForm(false);
              setCustomCategoryName('');
              setCustomCategoryDesc('');
              setCreateCategoryError('');
              setCreateCategorySuccess('');
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div 
            style={categoryStyles.modalContent}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h3>🆕 Create New Category</h3>
            <p style={{fontSize: '14px', color: '#666', marginBottom: '16px'}}>
              {currentPath.length > 0 
                ? `✨ This will be created under "${currentPath[currentPath.length - 1].name}"` 
                : "✨ This will be created as a main category"
              }
            </p>

            {/* ✅ Error Message */}
            {createCategoryError && (
              <div style={categoryStyles.errorMessage}>
                ⚠️ {createCategoryError}
              </div>
            )}

            {/* ✅ Success Message */}
            {createCategorySuccess && (
              <div style={categoryStyles.successMessage}>
                {createCategorySuccess}
              </div>
            )}
            
            <form 
              onSubmit={handleCustomCategorySubmit}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div style={{marginBottom: '16px'}}>
                <label style={{fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '4px'}}>
                  📝 Category Name *
                </label>
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="e.g., Electronics, Clothing, Books..."
                  required
                  style={categoryStyles.modalInput}
                  autoFocus
                  disabled={isSubmittingCustom}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
              
              <div style={{marginBottom: '16px'}}>
                <label style={{fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '4px'}}>
                  📄 Description (optional)
                </label>
                <textarea
                  value={customCategoryDesc}
                  onChange={(e) => setCustomCategoryDesc(e.target.value)}
                  placeholder="Brief description of what products go in this category..."
                  style={{...categoryStyles.modalInput, minHeight: '60px', resize: 'vertical'}}
                  rows="2"
                  disabled={isSubmittingCustom}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
              
              <div style={categoryStyles.modalButtons}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCustomForm(false);
                    setCustomCategoryName('');
                    setCustomCategoryDesc('');
                    setCreateCategoryError('');
                    setCreateCategorySuccess('');
                  }}
                  style={categoryStyles.cancelButton}
                  disabled={isSubmittingCustom}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  style={categoryStyles.submitButton}
                  disabled={isSubmittingCustom || !customCategoryName.trim()}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {isSubmittingCustom ? '⏳ Creating...' : '✅ Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div style={categoryStyles.helpText}>
        💡 <strong>Tip:</strong> Choose the most specific category that matches your product for better visibility to customers
      </div>
    </div>
  );
};

// ✅ ENHANCED SmartStockInput with proper validation
const SmartStockInput = ({ formData, setFormData }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stockError, setStockError] = useState('');
  
  // ✅ ENHANCED: Validate and handle total stock change
  const handleTotalStockChange = (e) => {
    let value = e.target.value;
    
    // Remove negative signs and validate
    value = value.replace('-', '');
    
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

  // ✅ ENHANCED: Validate and handle online stock change
  const handleOnlineStockChange = (e) => {
    let value = e.target.value;
    
    // Remove negative signs and validate
    value = value.replace('-', '');
    
    const validation = validatePositiveInteger(value, 'Online Stock');
    if (validation.isValid) {
      const newOnline = parseInt(value) || 0;
      const maxOnline = formData.total_stock;
      
      if (newOnline > maxOnline) {
        setStockError('Online stock cannot be more than total stock');
      } else {
        setFormData(prev => ({
          ...prev,
          online_stock: newOnline
        }));
        setStockError('');
      }
    } else {
      setStockError(validation.error);
    }
  };

  // Quick stock allocation functions
  const setAllOnline = () => {
    setFormData(prev => ({
      ...prev,
      online_stock: prev.total_stock
    }));
    setStockError('');
  };

  const setHalfOnline = () => {
    const half = Math.floor(formData.total_stock / 2);
    setFormData(prev => ({
      ...prev,
      online_stock: half
    }));
    setStockError('');
  };

  const setNoneOnline = () => {
    setFormData(prev => ({
      ...prev,
      online_stock: 0
    }));
    setStockError('');
  };

  const stockPercentage = formData.total_stock > 0 
    ? Math.round((formData.online_stock / formData.total_stock) * 100) 
    : 0;

  const availableForOnline = formData.total_stock - formData.online_stock;

  return (
    <div style={styles.stockContainer}>
      {/* Stock Header with Clear Explanation */}
      <div style={styles.stockHeader}>
        <h3 style={styles.stockTitle}>📦 How Many Items Do You Have?</h3>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={styles.toggleButton}
        >
          {showAdvanced ? '📋 Simple View' : '⚙️ Advanced Settings'}
        </button>
      </div>

      {/* ✅ Stock Error Display */}
      {stockError && (
        <div style={styles.stockError}>
          ⚠️ {stockError}
        </div>
      )}

      {/* Clear Explanation */}
      <div style={styles.stockExplanation}>
        <strong>🤔 What does this mean?</strong>
        <br />
        • <strong>Total Stock:</strong> How many items you have in total (cannot be negative)
        <br />
        • <strong>Online Stock:</strong> How many you want to sell online (rest stays for in-store sales)
      </div>

      {/* Visual Stock Summary */}
      <div style={styles.stockSummary}>
        <div style={styles.stockSummaryItem}>
          <span style={styles.stockLabel}>📦 Total Items</span>
          <span style={styles.stockValue}>{formData.total_stock}</span>
        </div>
        <div style={styles.stockSummaryItem}>
          <span style={styles.stockLabel}>🌐 Online Sale</span>
          <span style={styles.stockValue}>{formData.online_stock}</span>
        </div>
        <div style={styles.stockSummaryItem}>
          <span style={styles.stockLabel}>🏪 Store Only</span>
          <span style={styles.stockValue}>{availableForOnline}</span>
        </div>
        <div style={styles.stockSummaryItem}>
          <span style={styles.stockLabel}>📊 Online %</span>
          <span style={{
            ...styles.stockValue,
            color: stockPercentage === 100 ? '#28a745' : stockPercentage > 50 ? '#ffc107' : '#6c757d'
          }}>
            {stockPercentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar with Clear Labels */}
      <div style={styles.progressContainer}>
        <div style={styles.progressLabel}>
          📊 Stock Allocation: {formData.online_stock} online + {availableForOnline} in-store = {formData.total_stock} total
        </div>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${stockPercentage}%`,
              backgroundColor: stockPercentage === 100 ? '#28a745' : stockPercentage > 50 ? '#ffc107' : '#0d6efd'
            }}
          />
        </div>
      </div>

      {!showAdvanced ? (
        /* ✅ SUPER SIMPLE MODE: Step by Step with validation */
        <div style={styles.simpleMode}>
          {/* Step 1: Total Stock */}
          <div style={styles.stepContainer}>
            <div style={styles.stepHeader}>
              <span style={styles.stepNumber}>1️⃣</span>
              <span style={styles.stepTitle}>First, tell us how many items you have in total</span>
            </div>
            <input 
              type="number" 
              name="total_stock" 
              value={formData.total_stock} 
              onChange={handleTotalStockChange}
              required 
              style={styles.bigInput}
              min="0"
              step="1"
              placeholder="Enter total quantity (e.g., 50)"
              onKeyPress={(e) => {
                // Prevent negative sign and decimal point
                if (e.key === '-' || e.key === '.' || e.key === 'e' || e.key === '+') {
                  e.preventDefault();
                }
              }}
            />
            <div style={styles.stepHelp}>
              💡 Count all items you have - both for online and in-store sales (whole numbers only, no negatives)
            </div>
          </div>

          {/* Step 2: Online Allocation (only show if total > 0) */}
          {formData.total_stock > 0 && (
            <div style={styles.stepContainer}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>2️⃣</span>
                <span style={styles.stepTitle}>How many do you want to sell online?</span>
              </div>
              
              <div style={styles.quickActionsContainer}>
                <div style={styles.quickActions}>
                  <button
                    type="button"
                    onClick={setAllOnline}
                    style={{
                      ...styles.quickActionButton,
                      ...(formData.online_stock === formData.total_stock ? styles.quickActionActive : {})
                    }}
                  >
                    🌐 All Online<br/>
                    <small>All {formData.total_stock} items</small>
                    <div style={styles.quickActionDesc}>Best for online-only business</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={setHalfOnline}
                    style={{
                      ...styles.quickActionButton,
                      ...(formData.online_stock === Math.floor(formData.total_stock / 2) ? styles.quickActionActive : {})
                    }}
                  >
                    ⚖️ Split Equally<br/>
                    <small>{Math.floor(formData.total_stock / 2)} online</small>
                    <div style={styles.quickActionDesc}>Good for both online & store</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={setNoneOnline}
                    style={{
                      ...styles.quickActionButton,
                      ...(formData.online_stock === 0 ? styles.quickActionActive : {})
                    }}
                  >
                    🏪 Store Only<br/>
                    <small>0 online</small>
                    <div style={styles.quickActionDesc}>Only in-store sales</div>
                  </button>
                </div>

                {/* Custom Amount Option */}
                <div style={styles.customAmountContainer}>
                  <label style={styles.customAmountLabel}>
                    🎯 Or choose your own amount:
                  </label>
                  <div style={styles.customAmountInput}>
                    <input
                      type="number"
                      value={formData.online_stock}
                      onChange={handleOnlineStockChange}
                      min="0"
                      max={formData.total_stock}
                      step="1"
                      style={styles.input}
                      placeholder={`0 to ${formData.total_stock}`}
                      onKeyPress={(e) => {
                        // Prevent negative sign and decimal point
                        if (e.key === '-' || e.key === '.' || e.key === 'e' || e.key === '+') {
                          e.preventDefault();
                        }
                      }}
                    />
                    <span style={styles.maxIndicator}>out of {formData.total_stock}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smart Suggestions */}
          {formData.total_stock > 0 && (
            <div style={styles.suggestions}>
              {formData.online_stock === 0 && (
                <div style={styles.suggestionGood}>
                  💡 <strong>Suggestion:</strong> Try putting some items online to reach more customers!
                </div>
              )}
              {formData.online_stock === formData.total_stock && formData.total_stock > 5 && (
                <div style={styles.suggestionWarning}>
                  ⚠️ <strong>Consider:</strong> Keeping some stock for walk-in customers might be good too.
                </div>
              )}
              {availableForOnline > 0 && formData.online_stock > 0 && (
                <div style={styles.suggestionGood}>
                  ✨ <strong>Perfect!</strong> You have {formData.online_stock} for online and {availableForOnline} for store.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ✅ ADVANCED MODE: For experienced users with validation */
        <div style={styles.advancedMode}>
          <div style={styles.advancedHeader}>
            <span>🎛️ Advanced Stock Settings</span>
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>📦 Total Stock *</label>
              <input 
                type="number" 
                name="total_stock" 
                value={formData.total_stock} 
                onChange={handleTotalStockChange}
                required 
                style={styles.input}
                min="0"
                step="1"
                onKeyPress={(e) => {
                  if (e.key === '-' || e.key === '.' || e.key === 'e' || e.key === '+') {
                    e.preventDefault();
                  }
                }}
              />
              <small style={styles.helpText}>Total items you have (whole numbers only, no negatives)</small>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>🌐 Online Stock *</label>
              <input 
                type="number" 
                name="online_stock" 
                value={formData.online_stock} 
                onChange={handleOnlineStockChange}
                required 
                style={styles.input}
                min="0"
                max={formData.total_stock}
                step="1"
                onKeyPress={(e) => {
                  if (e.key === '-' || e.key === '.' || e.key === 'e' || e.key === '+') {
                    e.preventDefault();
                  }
                }}
              />
              <small style={styles.helpText}>Items for online sales (cannot exceed total stock)</small>
            </div>
          </div>

          {/* Quick Action Buttons in Advanced Mode */}
          <div style={styles.advancedQuickActions}>
            <button type="button" onClick={setAllOnline} style={styles.miniButton}>
              🌐 All Online
            </button>
            <button type="button" onClick={setHalfOnline} style={styles.miniButton}>
              ⚖️ Half & Half
            </button>
            <button type="button" onClick={setNoneOnline} style={styles.miniButton}>
              🏪 Store Only
            </button>
          </div>
        </div>
      )}
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

  // ✅ ENHANCED: Handle form changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle price and MRP with validation
    if (name === 'price' || name === 'mrp') {
      // Remove negative signs
      let cleanValue = value.replace('-', '');
      
      const validation = validatePositiveNumber(cleanValue, name === 'price' ? 'Selling Price' : 'MRP');
      if (validation.isValid) {
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
        setPriceError('');
        
        // Additional validation for price vs MRP
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
    
    // ✅ ENHANCED: Comprehensive validation before submit
    if (!mainImageUrl && !product) {
      setError('Please upload a main product image');
      return;
    }
    
    if (uploadingImages) {
      setError('Please wait for image uploads to complete');
      return;
    }

    // Validate pricing
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

    // Validate stock
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
    
    // Prepare submission data (JSON format since images are already on Cloudinary)
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
              <small style={styles.helpText}>Give your product a clear, descriptive name that customers will search for</small>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>🔧 Model/Variation (Optional)</label>
              <input 
                type="text" 
                name="model_name" 
                value={formData.model_name} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="e.g., Red XL, 128GB Black, Size 42, Model 2023..."
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
                placeholder="Describe your product: features, benefits, materials, care instructions, warranty details..."
                rows="4"
              />
              <small style={styles.helpText}>Help customers understand why they should buy your product</small>
            </div>
          </div>

          {/* === ENHANCED PRICING WITH VALIDATION === */}
          <div style={styles.sectionContainer}>
            <h3 style={styles.sectionTitle}>💰 Pricing Information</h3>

            {/* ✅ Price Error Display */}
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
                    // Prevent negative sign
                    if (e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                />
                <small style={styles.helpText}>The price you want to charge customers (cannot be negative)</small>
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
                    // Prevent negative sign
                    if (e.key === '-') {
                      e.preventDefault();
                    }
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

          {/* === ENHANCED STOCK MANAGEMENT === */}
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

          {/* === ENHANCED CATEGORY SECTION === */}
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

          {/* === FIXED CLOUDINARY IMAGE UPLOADS === */}
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
              helpText="📷 Add more angles, close-ups, or usage photos to help customers see your product better"
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

// ✅ ENHANCED STYLES WITH VALIDATION FEEDBACK
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
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6,9 12,15 18,9\'></polyline></svg>")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '20px'
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
  
  // ✅ NEW: Error message styles
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
  stockHeader: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '20px'
  },
  stockTitle: {
    margin: 0, 
    fontSize: '20px', 
    fontWeight: '700', 
    color: '#333'
  },
  toggleButton: {
    padding: '8px 16px', 
    background: '#6c757d', 
    color: 'white',
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '13px',
    cursor: 'pointer', 
    transition: 'all 0.2s',
    fontWeight: '500'
  },
  stockExplanation: {
    backgroundColor: '#fff3cd',
    border: '2px solid #ffeaa7',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#856404',
    lineHeight: '1.5'
  },
  stockSummary: {
    display: 'grid', 
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: '16px',
    marginBottom: '20px', 
    padding: '16px', 
    backgroundColor: 'white',
    borderRadius: '12px', 
    border: '2px solid #e9ecef'
  },
  stockSummaryItem: {
    textAlign: 'center'
  },
  stockLabel: {
    display: 'block', 
    fontSize: '12px', 
    color: '#6c757d',
    fontWeight: '600', 
    marginBottom: '4px'
  },
  stockValue: {
    display: 'block', 
    fontSize: '20px', 
    fontWeight: '700', 
    color: '#333'
  },
  progressContainer: {
    marginBottom: '24px'
  },
  progressLabel: {
    fontSize: '14px', 
    color: '#6c757d', 
    marginBottom: '6px', 
    fontWeight: '500'
  },
  progressBar: {
    width: '100%', 
    height: '12px', 
    backgroundColor: '#e9ecef',
    borderRadius: '6px', 
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%', 
    transition: 'width 0.3s ease, background-color 0.3s ease'
  },
  
  // Simple Mode Styles
  simpleMode: {
    backgroundColor: 'white', 
    padding: '20px', 
    borderRadius: '12px',
    border: '2px solid #e9ecef'
  },
  stepContainer: {
    marginBottom: '32px',
    padding: '20px',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    backgroundColor: '#fefefe'
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  stepNumber: {
    fontSize: '24px',
    fontWeight: '700'
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333'
  },
  bigInput: {
    width: '100%', 
    padding: '16px 20px', 
    boxSizing: 'border-box', 
    border: '3px solid #0d6efd', 
    borderRadius: '12px', 
    fontSize: '18px',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'white'
  },
  stepHelp: {
    fontSize: '14px',
    color: '#6c757d',
    marginTop: '8px',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  quickActionsContainer: {
    marginTop: '20px'
  },
  quickActions: {
    display: 'grid', 
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '12px',
    marginBottom: '20px'
  },
  quickActionButton: {
    padding: '16px 12px', 
    border: '2px solid #e9ecef', 
    borderRadius: '12px',
    backgroundColor: 'white', 
    cursor: 'pointer', 
    transition: 'all 0.2s',
    fontSize: '14px', 
    fontWeight: '600', 
    textAlign: 'center',
    minHeight: '100px', 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center',
    gap: '4px'
  },
  quickActionActive: {
    borderColor: '#0d6efd', 
    backgroundColor: '#f0f8ff', 
    color: '#0d6efd',
    boxShadow: '0 4px 8px rgba(13, 110, 253, 0.2)'
  },
  quickActionDesc: {
    fontSize: '11px',
    color: '#6c757d',
    fontWeight: '400',
    marginTop: '4px'
  },
  customAmountContainer: {
    border: '2px dashed #ccc', 
    borderRadius: '8px', 
    padding: '16px',
    backgroundColor: '#fefefe'
  },
  customAmountLabel: {
    fontSize: '14px', 
    fontWeight: '600', 
    color: '#666', 
    marginBottom: '8px',
    display: 'block'
  },
  customAmountInput: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px'
  },
  maxIndicator: {
    fontSize: '12px', 
    color: '#6c757d', 
    fontStyle: 'italic'
  },
  suggestions: {
    marginTop: '16px', 
    padding: '12px', 
    borderRadius: '8px'
  },
  suggestionGood: {
    fontSize: '14px', 
    color: '#155724',
    backgroundColor: '#d4edda',
    border: '2px solid #c3e6cb',
    borderRadius: '6px',
    padding: '12px',
    lineHeight: '1.4'
  },
  suggestionWarning: {
    fontSize: '14px', 
    color: '#856404',
    backgroundColor: '#fff3cd',
    border: '2px solid #ffeaa7',
    borderRadius: '6px',
    padding: '12px',
    lineHeight: '1.4'
  },
  
  // Advanced Mode Styles
  advancedMode: {
    backgroundColor: 'white', 
    padding: '20px', 
    borderRadius: '12px',
    border: '2px solid #e9ecef'
  },
  advancedHeader: {
    marginBottom: '16px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  advancedQuickActions: {
    display: 'flex', 
    gap: '8px', 
    marginTop: '12px'
  },
  miniButton: {
    padding: '6px 12px', 
    background: '#f8f9fa', 
    border: '2px solid #dee2e6',
    borderRadius: '6px', 
    fontSize: '12px', 
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500'
  },
  
  // Cloudinary Image Upload Styles
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
    border: '1px solid #f5c6cb'
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
  
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px'
  },
  
  previewItem: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #e9ecef'
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
    fontWeight: '600'
  },
  
  uploadProgress: {
    textAlign: 'center'
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
    fontSize: '12px'
  },
  
  cloudinaryBadge: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    right: '4px',
    backgroundColor: 'rgba(74, 144, 226, 0.9)',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    textAlign: 'center',
    fontWeight: '500'
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
