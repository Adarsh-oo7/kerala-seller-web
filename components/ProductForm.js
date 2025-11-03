'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package2, Edit, Cloud, Box, Globe, Folder, File, ArrowLeft, CheckCircle, X, Home, Trash2, Loader2, CloudUpload, Rocket } from "lucide-react";

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
  fallback_presets: ['ml_default', 'kerala_sellers_unsigned', 'unsigned_preset'],
  getUploadUrl: function () {
    return `https://api.cloudinary.com/v1_1/${this.cloud_name}/image/upload`;
  }
};

// ✅ VALIDATION FUNCTIONS
const validatePositiveNumber = (value, fieldName = 'Value') => {
  if (value === '' || value === null || value === undefined) {
    return { isValid: true, error: null };
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

// ✅ Enhanced Cloudinary Upload Function
const uploadToCloudinary = async (file, options = {}) => {
  console.log('🔄 Starting Cloudinary upload for:', file.name);

  const presetsToTry = [
    CLOUDINARY_CONFIG.upload_preset,
    ...CLOUDINARY_CONFIG.fallback_presets
  ].filter(Boolean);

  let lastError = null;

  for (let i = 0; i < presetsToTry.length; i++) {
    const preset = presetsToTry[i];
    console.log(`🔧 Trying preset ${i + 1}/${presetsToTry.length}: ${preset}`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      formData.append('folder', `kerala-sellers/products/${options.type || 'images'}`);

      const tags = ['kerala_sellers', options.type || 'product'];
      if (options.type === 'main') {
        tags.push('main_image');
      } else {
        tags.push('sub_image');
      }
      formData.append('tags', tags.join(','));
      formData.append('timestamp', Math.floor(Date.now() / 1000));
      formData.append('quality', 'auto:good');
      formData.append('fetch_format', 'auto');

      const response = await axios.post(CLOUDINARY_CONFIG.getUploadUrl(), formData, {
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

      console.log('✅ Upload successful with preset:', preset);

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

      if (i < presetsToTry.length - 1) {
        console.log(`🔄 Trying next preset...`);
        continue;
      }
    }
  }

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

// ✅ Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

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

// ✅ FIXED: Cloudinary Image Upload Component
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
  helpText = '',
  onRemoveImage // ✅ NEW: Callback for removing images
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [uploadResults, setUploadResults] = useState([]);

  useEffect(() => {
    if (currentImages.length > 0) {
      setPreviews(currentImages.map((img, index) => ({
        id: img.id || index, // ✅ Use database ID if available
        url: typeof img === 'string' ? img : img.url || img.image_url,
        public_id: typeof img === 'object' ? img.public_id : null,
        isUploaded: true,
        isFromDatabase: img.isFromDatabase || false // ✅ Track if from database
      })));
    }
  }, [currentImages]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (multiple && files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    const validFiles = [];
    const errors = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Only image files are allowed`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
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

    const newPreviews = validFiles.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      file: file,
      uploading: true,
      progress: 0
    }));

    setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);

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

            setPreviews(currentPreviews =>
              currentPreviews.map(preview =>
                preview.id === previewId
                  ? { ...preview, progress: progress }
                  : preview
              )
            );
          }
        });

        return {
          ...result,
          previewId,
          originalFile: file
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      const successfulUploads = uploadResults.filter(result => result.success);
      const failedUploads = uploadResults.filter(result => !result.success);

      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} upload(s) failed: ${failedUploads[0].error}`);
      }

      if (successfulUploads.length > 0) {
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
        onUploadComplete && onUploadComplete(uploadData);
      } else {
        setPreviews(prev => prev.filter(preview => preview.isUploaded));
        setError('All uploads failed. Please try again.');
      }

    } catch (error) {
      console.error('❌ Upload error:', error);
      setError('Upload failed. Please try again.');
      setPreviews(prev => prev.filter(preview => preview.isUploaded));
    } finally {
      setUploading(false);
      setUploadProgress({});
      e.target.value = '';
    }
  };

  // ✅ FIXED: Remove image function
  const removeImage = async (previewId) => {
    const imageToRemove = previews.find(p => p.id === previewId);
    if (!imageToRemove) return;

    // ✅ Call parent's removal handler if image is from database
    if (imageToRemove.isFromDatabase && onRemoveImage) {
      await onRemoveImage(imageToRemove.id);
    }

    // Update local state
    setPreviews(prev => prev.filter(preview => preview.id !== previewId));
    const updatedResults = uploadResults.filter(result => result.public_id !== imageToRemove.public_id);
    setUploadResults(updatedResults);
    onUploadComplete && onUploadComplete(updatedResults);
  };

  return (
    <div style={styles.imageUploadContainer}>
      <label className='dashboardproductmodalsectionlabel' style={styles.label}>
        {label} {required && '*'}
      </label>

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

      <div
        className='dashboardproductmodaluploadarea'
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
              <div style={styles.uploadingIcon}>⏳</div>
              <div ><strong className='dashboardproductmodaluploadareatext'>Uploading to Cloudinary...</strong></div>
              <div className='dashboardproductmodaluploadareasubtext' style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Please wait while we optimize and store your images
              </div>
            </div>
          ) : (
            <div>
              <div className='dashboardproductmodaluploadareaicon' style={styles.uploadIcon}>📷</div>
              <div><strong className='dashboardproductmodaluploadareatext'>Click to upload {multiple ? 'images' : 'image'}</strong></div>
              <div className='dashboardproductmodaluploadareasubtext' style={styles.uploadHint}>
                Supports: JPG, PNG, GIF, WEBP (Max 10MB each)
                <br />
                ☁️ Powered by Cloudinary ({CLOUDINARY_CONFIG.cloud_name})
              </div>
            </div>
          )}
        </div>
      </div>

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
            <div className='dashboardproductmodaluploadareapreviewimggrid' style={styles.previewGrid}>
              {previews.map((preview) => (
                <div key={preview.id} style={styles.previewItem}>
                  <img
                    src={preview.url}
                    alt="Preview"
                    style={styles.previewImage}
                    className='dashboardproductmodaluploadareapreviewimg'
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
                          style={{
                            ...styles.removeButton,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                          disabled={uploading}
                        >
                          <Trash2 size={14} />
                        </button>
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
                  className='dashboardproductmodaluploadareapreviewimg'
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
                        style={{
                          ...styles.removeButton,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                        disabled={uploading}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <small style={styles.helpText}>
        {helpText || (
          <span>
            📸 Images are automatically optimized and stored securely on Cloudinary
            {multiple && ` (${previews.filter(p => p.isUploaded).length}/${maxFiles} images)`}
          </span>
        )}
      </small>
    </div>
  );
}

// ✅ COMPREHENSIVE STYLES
const styles = {
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem',
    boxSizing: 'border-box',
  },
  modalContent: {
    background: '#FDFFF0', padding: '2rem', borderRadius: '16px',
    width: '700px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)', boxSizing: 'border-box',
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
    color: '#1a4845'
  },
  connectionStatus: {
    fontSize: '12px',
    color: '#65bef2ff',
    display: 'inline-block'
  },
  sectionContainer: {
    marginBottom: '2rem',
    padding: '20px',
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    border: '1px solid #0d6efd',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a4845',
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
    border: '1px solid #1a4845',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    backgroundColor: '#FDFFF0'
  },
  selectInput: {
    width: '100%',
    padding: '12px 16px',
    boxSizing: 'border-box',
    border: '1px solid #1a4845',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    backgroundColor: '#FDFFF0',
    cursor: 'pointer',
    color: '#6c757d'

  },
  textArea: {
    width: '100%',
    padding: '12px 16px',
    boxSizing: 'border-box',
    border: '1px solid #1a4845',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '100px',
    backgroundColor: '#FDFFF0'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    fontSize: '16px',
    color: '#6c757d'
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
  stockContainer: {
    border: '1px solid #0d6efd',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '2rem',
    backgroundColor: '#FDFFF0'
  },
  imageUploadContainer: {
    marginBottom: '24px'
  },
  uploadArea: {
    position: 'relative',
    border: '1px dashed #0d6efd',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '12px'
  },
  previewItem: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #28a745',
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
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '12px',
    border: '1px solid #28a745'
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
    padding: '4px 6px',
    cursor: 'pointer',
    fontSize: '11px',
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
  attributesSection: {
    border: '1px solid #0d6efd',
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
    padding: '5px 18px',
    height: '35px',
    backgroundColor: '#448d52ff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  buttonSecondary: {
    padding: '5px 18px',
    height: '35px',
    backgroundColor: '#9fa4a9ff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },

};

const categoryStyles = {
  container: {
    marginBottom: '1.5rem',
    border: '1px solid #0d6efd',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#FDFFF0'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #0d6efd',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    color: '#721c24'
  },
  retryButton: {
    marginTop: '12px',
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  selectedCategory: {
    color: '#28a745',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#d4edda',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #c3e6cb',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  clearButton: {
    background: 'none',
    border: 'none',
    color: '#28a745',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '0 4px',
    marginLeft: '8px'
  },
  breadcrumbs: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#e9ecef',
    borderRadius: '8px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  breadcrumbButton: {
    background: 'none',
    border: 'none',
    color: '#0d6efd',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '2px 4px'
  },
  separator: {
    color: '#6c757d',
    margin: '0 4px'
  },
  navigationButtons: {
    marginBottom: '16px'
  },
  backButton: {
    padding: '7px 6px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  levelInfo: {
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '16px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px'
  },
  categoryCard: {
    background: 'white',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    padding: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    minHeight: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  folderCard: {
    borderColor: '#ffc107',
    backgroundColor: '#fff8e1'
  },
  fileCard: {
    borderColor: '#89f2a2ff',
    backgroundColor: '#f8fff8'
  },
  selectedCard: {
    borderColor: '#0d6efd',
    backgroundColor: '#e3f2fd',
    transform: 'scale(1.02)',
    boxShadow: '0 4px 8px rgba(13, 110, 253, 0.2)'
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  categoryIcon: {
    fontSize: '20px'
  },
  categoryName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    lineHeight: '1.3'
  },
  categoryDescription: {
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '8px',
    lineHeight: '1.4'
  },
  categoryFooter: {
    fontSize: '11px',
    color: '#6c757d',
    textAlign: 'right'
  },
  childrenCount: {
    fontStyle: 'italic'
  },
  selectHint: {
    color: '#28a745',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6c757d'
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
};

// ✅ Category Selector Component (unchanged from original)
const CategorySelector = ({ selectedCategoryId, onCategorySelect, onAttributesChange }) => {
  const [allCategories, setAllCategories] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentCategories, setCurrentCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (allCategories.length > 0) {
      updateCurrentCategories();
    }
  }, [currentPath, allCategories]);

  useEffect(() => {
    if (selectedCategoryId && allCategories.length > 0) {
      const category = allCategories.find(cat => cat.id === parseInt(selectedCategoryId));
      if (category) {
        setSelectedCategory(category);
        buildPathToCategory(category);
      }
    }
  }, [selectedCategoryId, allCategories]);

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
      setError(`Failed to load categories: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  const updateCurrentCategories = () => {
    let categories;

    if (currentPath.length === 0) {
      categories = allCategories.filter(cat => !cat.parent);
    } else {
      const parentId = currentPath[currentPath.length - 1].id;
      categories = allCategories.filter(cat => cat.parent === parentId);
    }

    setCurrentCategories(categories);
  };

  const handleCategoryClick = (category) => {
    const hasChildren = allCategories.some(cat => cat.parent === category.id);

    if (hasChildren) {
      setCurrentPath([...currentPath, category]);
      setSelectedCategory(null);
      onCategorySelect('');
    } else {
      setSelectedCategory(category);
      onCategorySelect(category.id);

      const newAttributes = {};
      if (category.default_attributes && Array.isArray(category.default_attributes)) {
        category.default_attributes.forEach(attr => {
          if (typeof attr === 'object' && attr.name) {
            newAttributes[attr.name] = '';
          } else if (typeof attr === 'string') {
            newAttributes[attr] = '';
          }
        });
      }
      onAttributesChange(newAttributes);
    }
  };

  const handleBackClick = () => {
    if (currentPath.length > 0) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);

      if (selectedCategory) {
        setSelectedCategory(null);
        onCategorySelect('');
        onAttributesChange({});
      }
    }
  };

  const handleBreadcrumbClick = (index) => {
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);

    if (selectedCategory) {
      setSelectedCategory(null);
      onCategorySelect('');
      onAttributesChange({});
    }
  };

  if (loading) {
    return (
      <div style={categoryStyles.container}>
        <h3 className='dashboardproductmodalsectiontitle'>Select Product Category</h3>
        <div style={categoryStyles.loadingContainer}>
          <div style={categoryStyles.spinner}></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className='dashboardproductmodalsectiontitle'>Select Product Category</h3>
        <div style={categoryStyles.container}>
          <div style={categoryStyles.errorContainer}>
            <p>❌ {error}</p>
            <button onClick={fetchCategories} style={categoryStyles.retryButton}>
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className='dashboardproductmodalsectiontitle'>Select Product Category *</h3>
      <div style={categoryStyles.container}>
        {selectedCategory && (
          <div style={categoryStyles.selectedCategory}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} color="#28a745" /> Selected: {selectedCategory.name}
            </span>
            <button
              onClick={() => {
                setSelectedCategory(null);
                onCategorySelect('');
                onAttributesChange({});
              }}
              style={categoryStyles.clearButton}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {currentPath.length > 0 && (
          <div style={categoryStyles.breadcrumbs}>
            <button
              onClick={() => {
                setCurrentPath([]);
                setSelectedCategory(null);
                onCategorySelect('');
                onAttributesChange({});
              }}
              style={{
                ...categoryStyles.breadcrumbButton,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Home size={14} /> Home
            </button>
            {currentPath.map((pathCategory, index) => (
              <span key={pathCategory.id}>
                <span style={categoryStyles.separator}> → </span>
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  style={categoryStyles.breadcrumbButton}
                >
                  {pathCategory.name}
                </button>
              </span>
            ))}
          </div>
        )}

        {currentPath.length > 0 && (
          <div style={categoryStyles.navigationButtons}>
            <button
              onClick={handleBackClick}
              style={{ ...categoryStyles.backButton, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={14} /> Go Back
            </button>
          </div>
        )}

        <div style={categoryStyles.levelInfo}>
          {currentPath.length === 0 ? (
            <span className='dashboardproductmodalsectionlabel'>📂 Browse Categories ({currentCategories.length})</span>
          ) : (
            <span>📂 {currentPath[currentPath.length - 1].name} → Subcategories ({currentCategories.length})</span>
          )}
        </div>

        {currentCategories.length > 0 ? (
          <div className='dashboardproductmodalcategoriesgrid' style={categoryStyles.categoriesGrid}>
            {currentCategories.map(category => {
              const hasChildren = allCategories.some(cat => cat.parent === category.id);
              const isSelected = selectedCategory && selectedCategory.id === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryClick(category)}
                  style={{
                    ...categoryStyles.categoryCard,
                    ...(isSelected ? categoryStyles.selectedCard : {}),
                    ...(hasChildren ? categoryStyles.folderCard : categoryStyles.fileCard)
                  }}
                >
                  <div style={categoryStyles.categoryHeader}>
                    <span style={categoryStyles.categoryIcon}>
                      {hasChildren ? <Folder size={14} color='#ffc107' /> : <File size={14} color='#2fa64bff' />}
                    </span>
                    <span className='dashboardproductmodalcategoryname' style={categoryStyles.categoryName}>{category.name}</span>
                  </div>
                  {category.description && (
                    <div style={categoryStyles.categoryDescription}>
                      {category.description}
                    </div>
                  )}
                  <div style={categoryStyles.categoryFooter}>
                    {hasChildren ? (
                      <span style={categoryStyles.childrenCount}>
                        {allCategories.filter(cat => cat.parent === category.id).length} subcategories
                      </span>
                    ) : (
                      <span style={categoryStyles.selectHint}>Click to select</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={categoryStyles.emptyState}>
            <p>📭 No categories available at this level</p>
            {currentPath.length > 0 && (
              <button
                onClick={handleBackClick}
                style={{ ...categoryStyles.backButton, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Go Back
              </button>
            )}
          </div>
        )}
      </div>
    </div >
  );
};

// ✅ Smart Stock Input Component
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
    <div className="">
      <h3 className='dashboardproductmodalsectiontitle'>Stock Management *</h3>
      <div className='dashboardproductmodalsectioncontainer' style={styles.stockContainer}>
        {stockError && <div style={styles.stockError}>⚠️ {stockError}</div>}

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label className='dashboardproductmodalsectionlabel' style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Box size={14} /> Total Stock
            </label>
            <input
              type="number"
              value={formData.total_stock}
              onChange={handleTotalStockChange}
              required
              style={styles.input}
              className='dashboardproductmodalselectinput'
              min="0"
              step="1"
            />
          </div>

          <div style={styles.formGroup}>
            <label className='dashboardproductmodalsectionlabel' style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} /> Online Stock
            </label>
            <input
              type="number"
              value={formData.online_stock}
              onChange={handleOnlineStockChange}
              required
              style={styles.input}
              className='dashboardproductmodalselectinput'
              min="0"
              max={formData.total_stock}
              step="1"
            />
          </div>
        </div>
      </div>
    </div>

  );
};

// ✅ MAIN PRODUCT FORM - FULLY FIXED
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

  // ✅ FIXED: Load product data with proper sub-image structure
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
      setMainImageUrl(product.main_image_url || product.cloudinary_image_url || '');

      // ✅ FIXED: Properly structure sub-images with database IDs
      setSubImageUrls(product.sub_images?.map((img) => ({
        id: img.id, // ✅ CRITICAL: Include database ID for deletion
        url: img.cloudinary_image_url || img.image_url,
        public_id: img.cloudinary_public_id || img.public_id,
        isFromDatabase: true // ✅ CRITICAL: Mark as from database
      })) || []);
    }
  }, [product]);

  // ✅ FIXED: Handle deletion of sub-images from database with correct URL
  const handleDeleteOldSubImage = async (subImageId) => {
    if (!subImageId) return;

    console.log('🗑️ Deleting sub-image ID:', subImageId);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    try {
      // ✅ FIXED: Add /api/ prefix to match Django URL configuration
      const response = await axios.delete(
        `${API_BASE_URL}/api/products/sub-images/${subImageId}/delete/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Sub-image deleted from database:', response.data);

      // Remove from local state
      setSubImageUrls(prev => prev.filter(img => img.id !== subImageId));
      setError('');

    } catch (error) {
      console.error('❌ Error deleting sub-image:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Failed to delete image';
      setError(errorMessage);
    }
  };

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

  // ✅ FIXED: Handle sub-image uploads properly
  const handleSubImagesUpload = (uploadedImages) => {
    console.log('📸 Sub-images uploaded:', uploadedImages);

    setSubImageUrls(prevUrls => {
      // Combine existing database images + new Cloudinary uploads
      const allImages = [...prevUrls, ...uploadedImages.map(img => ({
        id: Date.now() + Math.random(), // Temporary ID for new uploads
        url: img.url,
        public_id: img.public_id,
        isFromDatabase: false
      }))];

      // Remove duplicates based on URL
      const uniqueImages = allImages.filter((img, index, self) =>
        index === self.findIndex((t) => t.url === img.url)
      );

      // Limit to maximum 4 sub-images
      const limitedImages = uniqueImages.slice(0, 4);

      console.log(`📊 Total sub-images: ${limitedImages.length}/4`);
      return limitedImages;
    });

    setUploadingImages(false);
  };

  const handleAttributeChange = (attributeName, value) => {
    setDynamicAttributes(prev => ({ ...prev, [attributeName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mainImageUrl && !product) {
      setError('Please upload a main product image');
      return;
    }

    if (uploadingImages) {
      setError('Please wait for image uploads to complete');
      return;
    }

    if (!selectedCategoryId) {
      setError('Please select a product category');
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

    console.log('🚀 Submitting product data:', submissionData);

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

      console.error('❌ Product save error:', err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 className='dashboardproductmodaltitle' style={{ ...styles.modalTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {product ? (
              <>
                <Edit size={22} className='dashboardproductmodaltitleicon' /> Edit Product
              </>
            ) : (
              <>
                <Package2 size={22} className='dashboardproductmodaltitleicon' /> Add New Product
              </>
            )}
          </h2>
          <div style={{ ...styles.connectionStatus, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cloud size={14} /> Images powered by Cloudinary
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Basic Product Information */}
          <h3 className='dashboardproductmodalsectiontitle' style={styles.sectionTitle}>Basic Product Information *</h3>
          <div className='dashboardproductmodalsectioncontainer' style={styles.sectionContainer}>
            <div style={styles.formGroup}>
              <label className='dashboardproductmodalsectionlabel' style={styles.label}>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
                className='dashboardproductmodalselectinput'
                placeholder="eg, Cotton T-Shirt, iPhone 13, Shoes..."
              />
              <small style={styles.helpText}>Give your product a clear, descriptive name</small>
            </div>

            <div style={styles.formGroup}>
              <label className='dashboardproductmodalsectionlabel' style={styles.label}>Model/Variation</label>
              <input
                type="text"
                name="model_name"
                value={formData.model_name}
                onChange={handleChange}
                style={styles.input}
                className='dashboardproductmodalselectinput'
                placeholder="e.g., Red XL, 128GB Black, Size 42..."
              />
              <small style={styles.helpText}>Specify color, size, model year, or any variations</small>
            </div>

            <div style={styles.formGroup}>
              <label className='dashboardproductmodalsectionlabel' style={styles.label}>Product Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={styles.textArea}
                className='dashboardproductmodalselectinput'
                placeholder="Describe your product: features, benefits, materials..."
                rows="4"
              />
              <small style={styles.helpText}>Help customers understand why they should buy your product</small>
            </div>
          </div>

          {/* Pricing */}
          <h3 className='dashboardproductmodalsectiontitle' style={styles.sectionTitle}>Pricing Information *</h3>
          <div className='dashboardproductmodalsectioncontainer' style={styles.sectionContainer}>

            {priceError && (
              <div style={styles.priceError}>
                ⚠️ {priceError}
              </div>
            )}

            <div className='dashboardproductmodalpriceinputgap' style={styles.formRow}>
              <div style={styles.formGroup}>
                <label className='dashboardproductmodalsectionlabel' style={styles.label}>Your Selling Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  className='dashboardproductmodalselectinput'
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
                <label className='dashboardproductmodalsectionlabel' style={styles.label}>MRP - Maximum Retail Price (₹)</label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  style={styles.input}
                  className='dashboardproductmodalselectinput'
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

            {formData.price && formData.mrp && parseFloat(formData.mrp) > parseFloat(formData.price) && (
              <div className='dashboardproductmodaldiscountlabel' style={styles.discountDisplay}>
                🎉 Great! You're offering a discount of ₹{(parseFloat(formData.mrp) - parseFloat(formData.price)).toFixed(2)}
                ({Math.round(((parseFloat(formData.mrp) - parseFloat(formData.price)) / parseFloat(formData.mrp)) * 100)}% off)
              </div>
            )}
          </div>

          {/* Stock Management */}
          <SmartStockInput formData={formData} setFormData={setFormData} />

          {/* Sales Channels */}
          <h3 className='dashboardproductmodalsectiontitle' style={styles.sectionTitle}>Where Do You Want to Sell ?</h3>
          <div className='dashboardproductmodalsectioncontainer' style={styles.sectionContainer}>
            <select
              name="sale_type"
              value={formData.sale_type}
              onChange={handleChange}
              style={styles.selectInput}
              className='dashboardproductmodalselectinput'
            >
              <option className='dashboardproductmodalselectinput'
                value="BOTH">🌐 Both Online & In-Store (Recommended)</option>
              <option className='dashboardproductmodalselectinput'
                value="OFFLINE">🏪 Only In My Physical Store</option>
              <option className='dashboardproductmodalselectinput'
                value="ONLINE">🌐 Only Online Sales</option>
            </select>
            <small style={styles.helpText}>Choose where customers can buy this product</small>
          </div>

          <hr style={styles.hr} />

          {/* Category Section */}
          <CategorySelector
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
            onAttributesChange={setDynamicAttributes}
          />

          {/* Dynamic Attributes */}
          {Object.keys(dynamicAttributes).length > 0 && (
            <div style={styles.attributesSection}>
              <h3 style={styles.sectionTitle}>Category-Specific Details</h3>
              <div style={styles.attributesGrid}>
                {Object.keys(dynamicAttributes).map(name => (
                  <div key={name} style={styles.formGroup}>
                    <label style={styles.label}>📝 {name}</label>
                    <input
                      type="text"
                      value={dynamicAttributes[name] || ''}
                      onChange={e => handleAttributeChange(name, e.target.value)}
                      style={styles.input}
                      className='dashboardproductmodalselectinput'
                      placeholder={`Enter ${name.toLowerCase()}...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr style={styles.hr} />

          {/* ✅ FIXED: Image Uploads with proper delete handlers */}
          <h3 className='dashboardproductmodalsectiontitle' style={styles.sectionTitle}>Product Images *</h3>

          <div className='dashboardproductmodalsectioncontainer' style={styles.sectionContainer}>

            <CloudinaryImageUpload
              label="Main Product Image"
              required={!product}
              type="main"
              onUploadComplete={handleMainImageUpload}
              onUploadStart={() => setUploadingImages(true)}
              currentImages={mainImageUrl ? [mainImageUrl] : []}
              helpText="📸 This is the first image customers will see. Make it count!"
            />

            <CloudinaryImageUpload
              label="Additional Images"
              multiple={true}
              maxFiles={4}
              type="sub"
              onUploadComplete={handleSubImagesUpload}
              onUploadStart={() => setUploadingImages(true)}
              onRemoveImage={handleDeleteOldSubImage} // ✅ FIXED: Pass delete handler
              currentImages={subImageUrls}
              helpText="📷 Add more angles, close-ups, or usage photos (max 4 images)"
            />
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <strong>⚠️ Oops! Something went wrong:</strong>
              <br />
              {error}
            </div>
          )}

          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || uploadingImages}
              className='dashboardproductcreatebtn'
              style={{
                ...styles.buttonSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <X size={18} className='dashboardproductcreatebtnicon' color='white' /> Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImages || !selectedCategoryId || priceError}
              className='dashboardproductcreatebtn'
              style={{
                ...styles.buttonPrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spin" /> {product ? 'Updating...' : 'Creating...'}
                </>
              ) : uploadingImages ? (
                <>
                  <CloudUpload size={18} className='dashboardproductcreatebtnicon' /> Uploading Images...
                </>
              ) : (
                <>
                  {product ? <CheckCircle size={18} className='dashboardproductcreatebtnicon' /> : <Rocket size={18} className='dashboardproductcreatebtnicon' />}
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}