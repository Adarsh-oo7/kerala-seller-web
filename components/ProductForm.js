'use client';

import { useState, useEffect } from 'react';
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
  
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const CATEGORIES_API_URL = `${API_BASE_URL}/api/categories/`;
const PRODUCTS_API_URL = `${API_BASE_URL}/user/store/products/`;

console.log('🌐 API URLs configured:', { 
  API_BASE_URL, 
  CATEGORIES_API_URL, 
  PRODUCTS_API_URL,
  ENVIRONMENT: process.env.NODE_ENV 
});

// ✅ Create Axios instance with proper configuration for hosted backend
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// ✅ FIXED: Request interceptor with Bearer authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔄 Making API request to:', `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('❌ API error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('🔓 Authentication failed, redirecting to login...');
      localStorage.removeItem('accessToken');
      window.location.href = '/login/seller';
    }
    
    return Promise.reject(error);
  }
);

// CategorySelector Component (keeping your existing implementation)
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

  // Load all categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Fetching categories from:', CATEGORIES_API_URL);
      
      const response = await apiClient.get('/api/categories/');
      const categories = response.data.results || response.data;
      
      console.log('📊 Categories loaded:', categories.length);
      
      setAllCategories(categories);
      
      const rootCategories = categories.filter(cat => !cat.parent);
      setCurrentCategories(rootCategories);
    } catch (err) {
      console.error('❌ Failed to load categories:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load categories from server');
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

  const handleCustomCategorySubmit = async (e) => {
    e.preventDefault();
    if (!customCategoryName.trim()) return;

    setIsSubmittingCustom(true);
    
    const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
    
    try {
      console.log('🔄 Creating custom category:', {
        name: customCategoryName.trim(),
        parent: parentId
      });
      
      const response = await apiClient.post('/api/categories/', {
        name: customCategoryName.trim(),
        description: customCategoryDesc.trim(),
        parent: parentId
      });

      const newCategory = response.data;
      
      console.log('✅ Custom category created:', newCategory);
      
      await fetchCategories();
      
      setSelectedCategory(newCategory);
      onCategorySelect(newCategory.id);
      onAttributesChange({});
      
      setCustomCategoryName('');
      setCustomCategoryDesc('');
      setShowCustomForm(false);
      
      alert('Custom category created successfully!');
    } catch (err) {
      console.error('❌ Failed to create custom category:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
      } else {
        const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to create category. Please try again.';
        alert(errorMessage);
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
      marginBottom: '1rem',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#fafafa'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    label: {
      fontWeight: '600',
      fontSize: '14px',
      color: '#333'
    },
    selectedCategory: {
      color: '#28a745',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: '#d4edda',
      padding: '4px 8px',
      borderRadius: '4px'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '20px',
      color: '#666'
    },
    errorContainer: {
      textAlign: 'center',
      padding: '20px',
      color: '#dc3545',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px'
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '4px',
      marginBottom: '12px',
      padding: '8px 12px',
      backgroundColor: '#fff',
      borderRadius: '6px',
      border: '1px solid #e9ecef'
    },
    breadcrumbItem: {
      background: 'none',
      border: 'none',
      color: '#0d6efd',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    breadcrumbActive: {
      backgroundColor: '#0d6efd',
      color: 'white'
    },
    breadcrumbSeparator: {
      color: '#6c757d',
      margin: '0 4px',
      fontSize: '12px'
    },
    searchContainer: {
      marginBottom: '12px'
    },
    searchInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '6px',
      fontSize: '14px'
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '8px',
      marginBottom: '12px'
    },
    categoryCard: {
      background: 'white',
      border: '2px solid #e9ecef',
      borderRadius: '6px',
      padding: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'left',
      minHeight: '70px',
      position: 'relative'
    },
    categoryCardParent: {
      borderColor: '#0d6efd',
      backgroundColor: '#f8f9ff'
    },
    categoryCardLeaf: {
      borderColor: '#28a745',
      backgroundColor: '#f8fff8'
    },
    categoryCardSelected: {
      borderColor: '#ffc107',
      backgroundColor: '#fffdf0',
      boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)'
    },
    categoryCardContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      height: '100%'
    },
    categoryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    categoryName: {
      fontWeight: '600',
      fontSize: '12px',
      color: '#212529',
      lineHeight: '1.2'
    },
    categoryIcon: {
      fontSize: '14px'
    },
    categoryDescription: {
      fontSize: '10px',
      color: '#6c757d',
      lineHeight: '1.2',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 1,
      WebkitBoxOrient: 'vertical'
    },
    categoryMeta: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    childrenCount: {
      fontSize: '9px',
      color: '#0d6efd',
      fontWeight: '500'
    },
    selectableText: {
      fontSize: '9px',
      color: '#28a745',
      fontWeight: '500'
    },
    attributesCount: {
      fontSize: '9px',
      color: '#6c757d',
      marginLeft: '6px'
    },
    addCustomButton: {
      background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
      border: '2px dashed #ffc107',
      borderRadius: '6px',
      padding: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      minHeight: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    addCustomContent: {
      textAlign: 'center'
    },
    addCustomIcon: {
      fontSize: '16px',
      marginBottom: '2px'
    },
    addCustomText: {
      fontSize: '10px',
      fontWeight: '600',
      color: '#856404',
      marginBottom: '1px'
    },
    addCustomSubtext: {
      fontSize: '9px',
      color: '#6c757d'
    },
    emptyState: {
      textAlign: 'center',
      padding: '20px',
      color: '#6c757d'
    },
    clearSearchButton: {
      padding: '6px 12px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      marginTop: '8px'
    },
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
      zIndex: 2500
    },
    modalContent: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      width: '400px',
      maxWidth: '90%'
    },
    modalInput: {
      width: '100%',
      padding: '8px 10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      marginTop: '4px',
      boxSizing: 'border-box'
    },
    modalButtons: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '16px'
    },
    cancelButton: {
      padding: '8px 14px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    submitButton: {
      padding: '8px 14px',
      background: '#0d6efd',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    helpText: {
      fontSize: '10px',
      color: '#6c757d',
      fontStyle: 'italic',
      textAlign: 'center',
      padding: '6px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      border: '1px solid #e9ecef'
    }
  };

  if (loading) {
    return (
      <div style={categoryStyles.container}>
        <div style={categoryStyles.header}>
          <label style={categoryStyles.label}>Product Category*</label>
        </div>
        <div style={categoryStyles.loadingContainer}>
          <p>Loading categories from server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={categoryStyles.container}>
        <div style={categoryStyles.header}>
          <label style={categoryStyles.label}>Product Category*</label>
        </div>
        <div style={categoryStyles.errorContainer}>
          <p>⚠️ {error}</p>
          <button onClick={fetchCategories} style={categoryStyles.clearSearchButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={categoryStyles.container}>
      {/* Header */}
      <div style={categoryStyles.header}>
        <label style={categoryStyles.label}>Product Category*</label>
        {selectedCategory && (
          <div style={categoryStyles.selectedCategory}>
            ✅ {selectedCategory.name}
          </div>
        )}
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
          🏠 Categories
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
      {currentCategories.length > 6 && (
        <div style={categoryStyles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search categories..."
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
                      {allCategories.filter(cat => cat.parent === category.id).length} subcategories
                    </span>
                  ) : (
                    <div>
                      <span style={categoryStyles.selectableText}>✓ Selectable</span>
                      {category.default_attributes?.length > 0 && (
                        <span style={categoryStyles.attributesCount}>
                          {category.default_attributes.length} attributes
                        </span>
                      )}
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
          onClick={() => setShowCustomForm(true)}
          style={categoryStyles.addCustomButton}
        >
          <div style={categoryStyles.addCustomContent}>
            <div style={categoryStyles.addCustomIcon}>➕</div>
            <div style={categoryStyles.addCustomText}>Add New</div>
            <div style={categoryStyles.addCustomSubtext}>
              {currentPath.length > 0 
                ? `Under "${currentPath[currentPath.length - 1].name}"` 
                : "Main category"
              }
            </div>
          </div>
        </button>
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && searchTerm && (
        <div style={categoryStyles.emptyState}>
          <p>No categories found for "{searchTerm}"</p>
          <button 
            type="button"
            onClick={() => setSearchTerm('')}
            style={categoryStyles.clearSearchButton}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Custom Category Modal */}
      {showCustomForm && (
        <div style={categoryStyles.modalOverlay}>
          <div style={categoryStyles.modalContent}>
            <h3>Create New Category</h3>
            <p style={{fontSize: '12px', color: '#666', marginBottom: '12px'}}>
              {currentPath.length > 0 
                ? `Will be created under "${currentPath[currentPath.length - 1].name}"` 
                : "Will be created as a main category"
              }
            </p>
            
            <form onSubmit={handleCustomCategorySubmit}>
              <div style={{marginBottom: '12px'}}>
                <label style={{fontSize: '12px', fontWeight: '500'}}>Category Name*</label>
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  required
                  style={categoryStyles.modalInput}
                  autoFocus
                />
              </div>
              
              <div style={{marginBottom: '12px'}}>
                <label style={{fontSize: '12px', fontWeight: '500'}}>Description</label>
                <textarea
                  value={customCategoryDesc}
                  onChange={(e) => setCustomCategoryDesc(e.target.value)}
                  placeholder="Brief description (optional)"
                  style={{...categoryStyles.modalInput, minHeight: '50px'}}
                  rows="2"
                />
              </div>
              
              <div style={categoryStyles.modalButtons}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomCategoryName('');
                    setCustomCategoryDesc('');
                  }}
                  style={categoryStyles.cancelButton}
                  disabled={isSubmittingCustom}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={categoryStyles.submitButton}
                  disabled={isSubmittingCustom || !customCategoryName.trim()}
                >
                  {isSubmittingCustom ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div style={categoryStyles.helpText}>
        💡 Click folders (📁) to explore, or select files (📄) to choose a category
      </div>
    </div>
  );
};

// ✅ ENHANCED: Smart Stock Input Component with Quick Actions
const SmartStockInput = ({ formData, setFormData }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // ✅ Quick stock allocation functions
  const setAllOnline = () => {
    setFormData(prev => ({
      ...prev,
      online_stock: prev.total_stock
    }));
  };

  const setHalfOnline = () => {
    const half = Math.floor(formData.total_stock / 2);
    setFormData(prev => ({
      ...prev,
      online_stock: half
    }));
  };

  const setNoneOnline = () => {
    setFormData(prev => ({
      ...prev,
      online_stock: 0
    }));
  };

  const handleTotalStockChange = (e) => {
    const newTotal = parseInt(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      total_stock: newTotal,
      // ✅ Smart adjustment: if online stock exceeds new total, adjust it
      online_stock: prev.online_stock > newTotal ? newTotal : prev.online_stock
    }));
  };

  const handleOnlineStockChange = (e) => {
    const newOnline = parseInt(e.target.value) || 0;
    const maxOnline = formData.total_stock;
    
    setFormData(prev => ({
      ...prev,
      online_stock: newOnline > maxOnline ? maxOnline : newOnline
    }));
  };

  const stockPercentage = formData.total_stock > 0 
    ? Math.round((formData.online_stock / formData.total_stock) * 100) 
    : 0;

  const availableForOnline = formData.total_stock - formData.online_stock;

  return (
    <div style={styles.stockContainer}>
      {/* Stock Header */}
      <div style={styles.stockHeader}>
        <h3 style={styles.stockTitle}>📦 Stock Management</h3>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={styles.toggleButton}
        >
          {showAdvanced ? '📋 Simple' : '⚙️ Advanced'}
        </button>
      </div>

      {/* Stock Summary Card */}
      <div style={styles.stockSummary}>
        <div style={styles.stockSummaryItem}>
          <span style={styles.stockLabel}>Total Stock</span>
          <span style={styles.stockValue}>{formData.total_stock}</span>
        </div>
        <div style={styles.stockSummaryItem}>
          <span style={styles.stockLabel}>Online</span>
          <span style={styles.stockValue}>{formData.online_stock}</span>
        </div>
        <div style={styles.stockSummaryItem}>
          <span style={styles.stockLabel}>Available</span>
          <span style={styles.stockValue}>{availableForOnline}</span>
        </div>
        <div style={styles.stockSummaryItem}>
          <span style={styles.stockLabel}>Online %</span>
          <span style={{
            ...styles.stockValue,
            color: stockPercentage === 100 ? '#28a745' : stockPercentage > 50 ? '#ffc107' : '#6c757d'
          }}>
            {stockPercentage}%
          </span>
        </div>
      </div>

      {/* Stock Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressLabel}>
          Online Stock Allocation: {formData.online_stock}/{formData.total_stock}
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
        /* ✅ SIMPLE MODE: Quick Actions */
        <div style={styles.simpleMode}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Total Stock*</label>
            <input 
              type="number" 
              name="total_stock" 
              value={formData.total_stock} 
              onChange={handleTotalStockChange}
              required 
              style={styles.input}
              min="0"
              placeholder="How many items do you have?"
            />
          </div>

          <div style={styles.quickActionsContainer}>
            <div style={styles.quickActionsHeader}>
              <label style={styles.label}>Online Stock Allocation</label>
              <span style={styles.helpText}>Choose how many to sell online:</span>
            </div>
            
            <div style={styles.quickActions}>
              <button
                type="button"
                onClick={setAllOnline}
                disabled={formData.total_stock === 0}
                style={{
                  ...styles.quickActionButton,
                  ...(formData.online_stock === formData.total_stock ? styles.quickActionActive : {})
                }}
              >
                🌐 All Online<br/>
                <small>({formData.total_stock})</small>
              </button>
              
              <button
                type="button"
                onClick={setHalfOnline}
                disabled={formData.total_stock === 0}
                style={{
                  ...styles.quickActionButton,
                  ...(formData.online_stock === Math.floor(formData.total_stock / 2) ? styles.quickActionActive : {})
                }}
              >
                ⚖️ Half Online<br/>
                <small>({Math.floor(formData.total_stock / 2)})</small>
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
                <small>(0 online)</small>
              </button>
            </div>

            {/* Custom Online Amount */}
            <div style={styles.customAmountContainer}>
              <label style={styles.customAmountLabel}>Or set custom amount:</label>
              <div style={styles.customAmountInput}>
                <input
                  type="number"
                  value={formData.online_stock}
                  onChange={handleOnlineStockChange}
                  min="0"
                  max={formData.total_stock}
                  style={styles.input}
                  placeholder="Custom amount"
                />
                <span style={styles.maxIndicator}>max: {formData.total_stock}</span>
              </div>
            </div>
          </div>

          {/* Smart Suggestions */}
          {formData.total_stock > 0 && (
            <div style={styles.suggestions}>
              {formData.online_stock === 0 && (
                <div style={styles.suggestion}>
                  💡 <strong>Tip:</strong> Setting some items online can increase sales reach!
                </div>
              )}
              {formData.online_stock === formData.total_stock && formData.total_stock > 10 && (
                <div style={styles.suggestion}>
                  💡 <strong>Suggestion:</strong> Consider keeping some stock for in-store customers.
                </div>
              )}
              {availableForOnline > 0 && formData.online_stock > 0 && (
                <div style={styles.suggestion}>
                  📈 <strong>Opportunity:</strong> You can still add {availableForOnline} more items online!
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ✅ ADVANCED MODE: Manual Inputs */
        <div style={styles.advancedMode}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Total Stock*</label>
              <input 
                type="number" 
                name="total_stock" 
                value={formData.total_stock} 
                onChange={handleTotalStockChange}
                required 
                style={styles.input}
                min="0"
              />
              <small style={styles.helpText}>Total items you have</small>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Online Stock*</label>
              <input 
                type="number" 
                name="online_stock" 
                value={formData.online_stock} 
                onChange={handleOnlineStockChange}
                required 
                style={styles.input}
                min="0"
                max={formData.total_stock}
              />
              <small style={styles.helpText}>Items for online sales</small>
            </div>
          </div>

          {/* Quick Action Buttons in Advanced Mode */}
          <div style={styles.advancedQuickActions}>
            <button type="button" onClick={setAllOnline} style={styles.miniButton}>
              All Online
            </button>
            <button type="button" onClick={setHalfOnline} style={styles.miniButton}>
              Half
            </button>
            <button type="button" onClick={setNoneOnline} style={styles.miniButton}>
              None
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [dynamicAttributes, setDynamicAttributes] = useState({});

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
  
  const handleAttributeChange = (attributeName, value) => {
    setDynamicAttributes(prev => ({ ...prev, [attributeName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const submissionData = new FormData();
    
    Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));
    
    if (selectedCategoryId) {
      submissionData.append('category', parseInt(selectedCategoryId));
    }
    
    submissionData.append('attributes', JSON.stringify(dynamicAttributes));
    
    if (mainImageFile) {
      submissionData.append('main_image', mainImageFile);
      console.log('📸 Main image file being sent:', mainImageFile.name);
    } else if (product && !mainImagePreview) {
      console.log('⚠️ No new main image selected for update');
    }
    
    subImageFiles.forEach((file, index) => {
      submissionData.append('sub_images', file);
      console.log(`📸 Sub image ${index + 1}:`, file.name);
    });
    
    const url = product ? `${PRODUCTS_API_URL}${product.id}/` : PRODUCTS_API_URL;
    const method = product ? 'patch' : 'post';

    console.log('=== DEBUG: Form submission ===');
    console.log('API URL:', url);
    console.log('Method:', method);
    console.log('Selected category ID:', selectedCategoryId);
    console.log('Main image file:', mainImageFile);
    console.log('Sub image files:', subImageFiles);
    console.log('Form data keys:', Array.from(submissionData.keys()));
    console.log('Environment:', process.env.NODE_ENV);
    console.log('===============================');

    try {
      const response = await axios({ 
        method, 
        url, 
        data: submissionData, 
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        timeout: 30000
      });
      
      console.log('✅ Product saved successfully:', response.data);
      onSuccess();
    } catch (err) {
      console.error('❌ Error saving product:', err.response?.data || err);
      
      let errorMessage = 'Failed to save product to server. Please check your input.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          window.location.href = '/login/seller';
        }, 2000);
      } else if (err.response?.data) {
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
        } else if (err.response.data.category) {
          errorMessage = `Category error: ${err.response.data.category[0]}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - the server took too long to respond. Please try again.';
      } else if (err.request) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
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
        <p style={{fontSize: '12px', color: '#666', marginBottom: '16px'}}>
          🌐 Connected to: {API_BASE_URL}
        </p>
        
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
              placeholder="e.g., Premium Cotton T-Shirt"
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
              placeholder="e.g., Red XL, Size 42"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              style={styles.textArea}
              placeholder="Describe your product features, benefits, and specifications..."
              rows="3"
            />
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label>Selling Price (₹)*</label>
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
                min="0"
                placeholder="399.99"
              />
              <small style={styles.helpText}>Maximum Retail Price (for discount calculation)</small>
            </div>
          </div>
          
          {/* ✅ ENHANCED: Smart Stock Management */}
          <SmartStockInput formData={formData} setFormData={setFormData} />
          
          <div style={styles.formGroup}>
            <label>Where to sell?*</label>
            <select name="sale_type" value={formData.sale_type} onChange={handleChange} style={styles.input}>
              <option value="BOTH">🌐 Online & 🏪 In-Store</option>
              <option value="OFFLINE">🏪 In-Store Only</option>
              <option value="ONLINE">🌐 Online Only</option>
            </select>
          </div>

          <hr style={styles.hr} />

          {/* --- Enhanced Category Section --- */}
          <CategorySelector
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
            onAttributesChange={setDynamicAttributes}
          />
          
          {/* Dynamic Attributes Section */}
          {Object.keys(dynamicAttributes).length > 0 && (
            <div style={styles.dynamicSection}>
              <h4>Category Specifics</h4>
              {Object.keys(dynamicAttributes).map(name => (
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
            <small style={styles.helpText}>
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
            <small style={styles.helpText}>
              Select new images to replace all sub-images
            </small>
          </div>
          
          {error && (
            <div style={styles.errorAlert}>
              ⚠️ {error}
            </div>
          )}
          
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
              disabled={isSubmitting || !selectedCategoryId} 
              style={styles.buttonPrimary}
            >
              {isSubmitting ? 'Saving to server...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: { 
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
    justifyContent: 'center', alignItems: 'center', zIndex: 1000 
  },
  modalContent: { 
    background: 'white', padding: '2rem', borderRadius: '12px', 
    width: '700px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
  },
  formGroup: { marginBottom: '1rem' },
  formRow: { 
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', 
    marginBottom: '1rem' 
  },
  input: { 
    width: '100%', padding: '10px 12px', boxSizing: 'border-box', 
    border: '2px solid #e9ecef', borderRadius: '6px', fontSize: '14px',
    transition: 'border-color 0.2s'
  },
  textArea: {
    width: '100%', padding: '10px 12px', boxSizing: 'border-box', 
    border: '2px solid #e9ecef', borderRadius: '6px', fontSize: '14px',
    resize: 'vertical', minHeight: '80px'
  },
  label: {
    display: 'block', marginBottom: '4px', fontWeight: '600', 
    fontSize: '14px', color: '#333'
  },
  helpText: {
    fontSize: '12px', color: '#6c757d', marginTop: '2px', display: 'block'
  },
  hr: { 
    border: 'none', borderTop: '2px solid #f8f9fa', margin: '24px 0' 
  },
  
  // ✅ ENHANCED: Stock Management Styles
  stockContainer: {
    border: '2px solid #e9ecef', borderRadius: '12px', 
    padding: '20px', marginBottom: '1rem', backgroundColor: '#f8f9fa'
  },
  stockHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px'
  },
  stockTitle: {
    margin: 0, fontSize: '16px', fontWeight: '700', color: '#333'
  },
  toggleButton: {
    padding: '6px 12px', background: '#6c757d', color: 'white',
    border: 'none', borderRadius: '6px', fontSize: '12px',
    cursor: 'pointer', transition: 'all 0.2s'
  },
  stockSummary: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
    marginBottom: '16px', padding: '12px', backgroundColor: 'white',
    borderRadius: '8px', border: '1px solid #e9ecef'
  },
  stockSummaryItem: {
    textAlign: 'center'
  },
  stockLabel: {
    display: 'block', fontSize: '11px', color: '#6c757d',
    fontWeight: '500', marginBottom: '2px'
  },
  stockValue: {
    display: 'block', fontSize: '16px', fontWeight: '700', color: '#333'
  },
  progressContainer: {
    marginBottom: '20px'
  },
  progressLabel: {
    fontSize: '12px', color: '#6c757d', marginBottom: '4px', fontWeight: '500'
  },
  progressBar: {
    width: '100%', height: '8px', backgroundColor: '#e9ecef',
    borderRadius: '4px', overflow: 'hidden'
  },
  progressFill: {
    height: '100%', transition: 'width 0.3s ease, background-color 0.3s ease'
  },
  
  // Simple Mode Styles
  simpleMode: {
    backgroundColor: 'white', padding: '16px', borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  quickActionsContainer: {
    marginTop: '16px'
  },
  quickActionsHeader: {
    marginBottom: '12px'
  },
  quickActions: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
    marginBottom: '16px'
  },
  quickActionButton: {
    padding: '12px 8px', border: '2px solid #e9ecef', borderRadius: '8px',
    backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.2s',
    fontSize: '12px', fontWeight: '600', textAlign: 'center',
    minHeight: '60px', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center'
  },
  quickActionActive: {
    borderColor: '#0d6efd', backgroundColor: '#f0f8ff', color: '#0d6efd'
  },
  customAmountContainer: {
    border: '1px dashed #ccc', borderRadius: '6px', padding: '12px',
    backgroundColor: '#fefefe'
  },
  customAmountLabel: {
    fontSize: '12px', fontWeight: '500', color: '#666', marginBottom: '6px',
    display: 'block'
  },
  customAmountInput: {
    display: 'flex', alignItems: 'center', gap: '8px'
  },
  maxIndicator: {
    fontSize: '11px', color: '#6c757d', fontStyle: 'italic'
  },
  suggestions: {
    marginTop: '12px', padding: '10px', backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7', borderRadius: '6px'
  },
  suggestion: {
    fontSize: '12px', color: '#856404', lineHeight: '1.4'
  },
  
  // Advanced Mode Styles
  advancedMode: {
    backgroundColor: 'white', padding: '16px', borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  advancedQuickActions: {
    display: 'flex', gap: '6px', marginTop: '8px'
  },
  miniButton: {
    padding: '4px 8px', background: '#f8f9fa', border: '1px solid #dee2e6',
    borderRadius: '4px', fontSize: '11px', cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  // Other Styles
  dynamicSection: { 
    border: '2px solid #0d6efd', borderRadius: '12px', padding: '16px', 
    marginTop: '16px', backgroundColor: '#f0f8ff' 
  },
  imagePreview: { 
    width: '100px', height: '100px', objectFit: 'cover', 
    borderRadius: '6px', border: '2px solid #e9ecef', marginBottom: '10px' 
  },
  subImageGrid: { 
    display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' 
  },
  errorAlert: {
    color: '#dc3545', fontSize: '14px', marginTop: '12px',
    padding: '12px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb',
    borderRadius: '6px'
  },
  buttonContainer: { 
    display: 'flex', justifyContent: 'flex-end', gap: '12px', 
    marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e9ecef'
  },
  buttonPrimary: { 
    padding: '12px 24px', backgroundColor: '#0d6efd', color: 'white', 
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
    fontWeight: '600', transition: 'all 0.2s'
  },
  buttonSecondary: { 
    padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', 
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
    fontWeight: '600', transition: 'all 0.2s'
  }
};
