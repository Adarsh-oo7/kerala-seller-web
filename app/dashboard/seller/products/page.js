'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ProductForm from '../../../../components/ProductForm';

const API_URL = 'http://localhost:8000/user/store/products/';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setError('No access token found. Please login again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching products...'); // Debug log
      
      const response = await axios.get(API_URL, { 
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        } 
      });

      console.log('✅ API Response:', response.data); // Debug log
      
      // Handle different response structures
      let productsData = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        productsData = response.data.results;
      } else if (response.data.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else {
        console.warn('Unexpected response structure:', response.data);
        productsData = [];
      }

      setProducts(productsData);
      console.log(`📦 Found ${productsData.length} products`); // Debug log

    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        setError(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        // Something else happened
        console.error('Request error:', error.message);
        setError(`Request failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    const token = localStorage.getItem('accessToken');
    
    try {
      await axios.delete(`${API_URL}${productId}/`, {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log(`✅ Product ${productId} deleted successfully`);
      fetchProducts(); // Refresh the list after deleting
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      alert(`Error deleting product: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };
  
  const handleFormSubmit = () => {
    handleCloseModal();
    fetchProducts();
  };
  
  // Helper to display the sale type nicely
  const formatSaleType = (type) => {
    const types = {
      'BOTH': 'Online & In-Store',
      'OFFLINE': 'In-Store Only',
      'ONLINE': 'Online Only'
    };
    return types[type] || type;
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error Loading Products</h2>
        <p style={styles.errorText}>{error}</p>
        <button onClick={fetchProducts} style={styles.buttonPrimary}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.h1}>My Products ({products.length})</h1>
        <button onClick={() => handleOpenModal()} style={styles.buttonPrimary}>
          + Add Product
        </button>
      </div>

      {isModalOpen && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseModal}
          onSuccess={handleFormSubmit}
        />
      )}

      {products.length > 0 ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock (Online / Total)</th>
                <th style={styles.th}>Sale Type</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.productInfo}>
                      <img 
                        src={product.image_url || product.main_image_url || '/placeholder.png'} 
                        alt={product.name} 
                        style={styles.image}
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                      <div style={styles.productDetails}>
                        <strong style={styles.productName}>{product.name || 'Unnamed Product'}</strong>
                        {product.model_name && (
                          <small style={styles.modelName}>{product.model_name}</small>
                        )}
                        {product.sku && (
                          <small style={styles.sku}>SKU: {product.sku}</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.priceInfo}>
                      <strong>₹{product.price || 0}</strong>
                      {product.mrp && product.mrp > product.price && (
                        <small style={styles.mrp}>₹{product.mrp}</small>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.stockInfo}>
                      <span style={styles.stockNumbers}>
                        {product.online_stock || 0} / {product.total_stock || 0}
                      </span>
                      {product.online_stock <= 5 && product.online_stock > 0 && (
                        <span style={styles.lowStock}>Low Stock!</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.saleType}>
                      {formatSaleType(product.sale_type)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button 
                        onClick={() => handleOpenModal(product)} 
                        style={styles.buttonSecondary}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)} 
                        style={styles.buttonDanger}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📦</div>
          <h3>No Products Found</h3>
          <p>You haven't added any products yet. Start by adding your first product!</p>
          <button onClick={() => handleOpenModal()} style={styles.buttonPrimary}>
            Add Your First Product
          </button>
        </div>
      )}

      {/* Debug Information (remove in production) */}
      <div style={styles.debugInfo}>
        <details>
          <summary>Debug Info (click to expand)</summary>
          <pre>{JSON.stringify({
            productsCount: products.length,
            isLoading,
            error,
            hasToken: !!localStorage.getItem('accessToken'),
            apiUrl: API_URL
          }, null, 2)}</pre>
        </details>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  
  // Loading State
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0d6efd',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Error State
  errorContainer: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '8px',
    margin: '20px'
  },
  errorText: {
    color: '#856404',
    marginBottom: '16px'
  },

  // Header
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e9ecef'
  },
  h1: { 
    color: '#333', 
    fontSize: '2rem', 
    marginBottom: '0',
    fontWeight: '700'
  },

  // Buttons
  buttonPrimary: { 
    padding: '12px 20px', 
    backgroundColor: '#0d6efd', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  buttonSecondary: { 
    padding: '8px 12px', 
    marginRight: '8px', 
    backgroundColor: '#6c757d', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '12px'
  },
  buttonDanger: { 
    padding: '8px 12px', 
    backgroundColor: '#dc3545', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '12px'
  },

  // Table
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef'
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse'
  },
  th: { 
    borderBottom: '2px solid #dee2e6', 
    padding: '16px 12px', 
    textAlign: 'left', 
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    color: '#495057',
    fontSize: '14px'
  },
  td: { 
    borderBottom: '1px solid #e9ecef', 
    padding: '16px 12px', 
    verticalAlign: 'middle'
  },
  tr: {
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f8f9fa'
    }
  },

  // Product Info
  productInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  image: { 
    width: '60px',
    height: '60px',
    objectFit: 'cover', 
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  productDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  productName: {
    fontSize: '16px',
    color: '#212529',
    lineHeight: '1.3'
  },
  modelName: {
    color: '#6c757d',
    fontSize: '12px'
  },
  sku: {
    color: '#868e96',
    fontSize: '11px'
  },

  // Price Info
  priceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  mrp: {
    color: '#6c757d',
    textDecoration: 'line-through',
    fontSize: '12px'
  },

  // Stock Info
  stockInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  stockNumbers: {
    fontWeight: '500',
    fontSize: '14px'
  },
  lowStock: {
    color: '#dc3545',
    fontSize: '11px',
    fontWeight: '500'
  },

  // Sale Type
  saleType: {
    padding: '4px 8px',
    backgroundColor: '#e7f3ff',
    color: '#0366d6',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },

  // Actions
  actions: {
    display: 'flex',
    gap: '4px'
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px dashed #dee2e6'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },

  // Debug Info
  debugInfo: {
    marginTop: '40px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '12px'
  }
};
