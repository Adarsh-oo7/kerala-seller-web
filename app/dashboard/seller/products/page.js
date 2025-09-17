'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ProductForm from '../../../../components/ProductForm';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Eye,
  ExternalLink
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/user/store/products/`;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, low_stock, out_of_stock
  const [isDeleting, setIsDeleting] = useState(null);

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
      console.log('🔄 Fetching products from:', API_URL);
      
      // ✅ FIXED: Use Bearer instead of Token
      const response = await axios.get(API_URL, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });

      console.log('✅ API Response:', response.data);
      
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
      setFilteredProducts(productsData);
      console.log(`📦 Found ${productsData.length} products for your store`);

    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError(`Request failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply stock filter
    switch (filterType) {
      case 'low_stock':
        filtered = filtered.filter(product => 
          product.online_stock > 0 && product.online_stock <= 5
        );
        break;
      case 'out_of_stock':
        filtered = filtered.filter(product => 
          product.online_stock <= 0
        );
        break;
      case 'in_stock':
        filtered = filtered.filter(product => 
          product.online_stock > 5
        );
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterType]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    const token = localStorage.getItem('accessToken');
    setIsDeleting(productId);
    
    try {
      // ✅ FIXED: Use Bearer instead of Token
      await axios.delete(`${API_URL}${productId}/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log(`✅ Product ${productId} deleted successfully`);
      fetchProducts(); // Refresh the list after deleting
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message;
      alert(`Error deleting product: ${errorMessage}`);
    } finally {
      setIsDeleting(null);
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
      'ONLINE_AND_OFFLINE': 'Online & In-Store',
      'OFFLINE_ONLY': 'In-Store Only',
      'ONLINE_ONLY': 'Online Only',
      'BOTH': 'Online & In-Store',
      'OFFLINE': 'In-Store Only',
      'ONLINE': 'Online Only'
    };
    return types[type] || type;
  };

  const getStockStatus = (onlineStock) => {
    if (onlineStock <= 0) return { label: 'Out of Stock', color: '#dc3545', bgColor: '#f8d7da' };
    if (onlineStock <= 5) return { label: 'Low Stock', color: '#fd7e14', bgColor: '#fff3cd' };
    return { label: 'In Stock', color: '#198754', bgColor: '#d1e7dd' };
  };

  const getFilterCounts = () => {
    return {
      all: products.length,
      low_stock: products.filter(p => p.online_stock > 0 && p.online_stock <= 5).length,
      out_of_stock: products.filter(p => p.online_stock <= 0).length,
      in_stock: products.filter(p => p.online_stock > 5).length
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your products...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} />
        <h2>Error Loading Products</h2>
        <p style={styles.errorText}>{error}</p>
        <button onClick={fetchProducts} style={styles.buttonPrimary}>
          <RefreshCw size={18} />
          Retry
        </button>
      </div>
    );
  }

  const filterCounts = getFilterCounts();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>
            <Package size={28} />
            My Products ({filteredProducts.length})
          </h1>
          <p style={styles.subtitle}>Manage your product inventory and listings</p>
        </div>
        <button onClick={() => handleOpenModal()} style={styles.buttonPrimary}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.searchContainer}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products by name, model, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.filterTabs}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              ...styles.filterTab,
              ...(filterType === 'all' ? styles.activeFilterTab : {})
            }}
          >
            All ({filterCounts.all})
          </button>
          <button
            onClick={() => setFilterType('in_stock')}
            style={{
              ...styles.filterTab,
              ...(filterType === 'in_stock' ? styles.activeFilterTab : {})
            }}
          >
            In Stock ({filterCounts.in_stock})
          </button>
          <button
            onClick={() => setFilterType('low_stock')}
            style={{
              ...styles.filterTab,
              ...(filterType === 'low_stock' ? styles.activeFilterTab : {})
            }}
          >
            Low Stock ({filterCounts.low_stock})
          </button>
          <button
            onClick={() => setFilterType('out_of_stock')}
            style={{
              ...styles.filterTab,
              ...(filterType === 'out_of_stock' ? styles.activeFilterTab : {})
            }}
          >
            Out of Stock ({filterCounts.out_of_stock})
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseModal}
          onSuccess={handleFormSubmit}
        />
      )}

      {filteredProducts.length > 0 ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock (Online/Total)</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Sale Type</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product.online_stock);
                
                return (
                  <tr key={product.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.productInfo}>
                        <img 
                          src={product.image_url || product.main_image_url || 'https://via.placeholder.com/60x60/e9ecef/6c757d?text=No+Image'} 
                          alt={product.name} 
                          style={styles.image}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60x60/e9ecef/6c757d?text=No+Image';
                          }}
                        />
                        <div style={styles.productDetails}>
                          <strong style={styles.productName}>
                            {product.name || 'Unnamed Product'}
                          </strong>
                          {product.model_name && (
                            <small style={styles.modelName}>
                              Model: {product.model_name}
                            </small>
                          )}
                          {product.sku && (
                            <small style={styles.sku}>SKU: {product.sku}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.priceInfo}>
                        <strong style={styles.price}>₹{parseFloat(product.price || 0).toLocaleString('en-IN')}</strong>
                        {product.mrp && parseFloat(product.mrp) > parseFloat(product.price) && (
                          <small style={styles.mrp}>₹{parseFloat(product.mrp).toLocaleString('en-IN')}</small>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.stockInfo}>
                        <span style={styles.stockNumbers}>
                          {product.online_stock || 0} / {product.total_stock || 0}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: stockStatus.bgColor,
                        color: stockStatus.color
                      }}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.saleTypeBadge}>
                        {formatSaleType(product.sale_type)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button 
                          onClick={() => handleOpenModal(product)} 
                          style={styles.buttonSecondary}
                          title="Edit product"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          style={styles.buttonDanger}
                          disabled={isDeleting === product.id}
                          title="Delete product"
                        >
                          {isDeleting === product.id ? (
                            <div style={styles.smallSpinner}></div>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <Package size={64} />
          <h3>
            {searchTerm || filterType !== 'all' 
              ? 'No products match your filters' 
              : 'No Products Found'}
          </h3>
          <p>
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search terms or filters to find products.'
              : 'You haven\'t added any products to your store yet. Start by adding your first product!'}
          </p>
          {searchTerm || filterType !== 'all' ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }} 
              style={styles.buttonSecondary}
            >
              Clear Filters
            </button>
          ) : (
            <button onClick={() => handleOpenModal()} style={styles.buttonPrimary}>
              <Plus size={18} />
              Add Your First Product
            </button>
          )}
        </div>
      )}

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

// ... (styles remain the same)
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    animation: 'fadeIn 0.6s ease-out'
  },
  
  // Loading State
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '20px'
  },
  
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  smallSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Error State
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '12px',
    margin: '20px',
    color: '#991b1b'
  },
  
  errorText: {
    color: '#991b1b',
    marginBottom: '20px',
    fontSize: '16px'
  },

  // Header
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '16px'
  },
  
  h1: { 
    color: '#1f2937', 
    fontSize: '2rem', 
    margin: '0 0 8px 0',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  subtitle: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0
  },

  // Filters
  filtersContainer: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  
  searchContainer: {
    position: 'relative',
    maxWidth: '400px'
  },
  
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    zIndex: 1
  },
  
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  
  filterTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  
  filterTab: {
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.2s'
  },
  
  activeFilterTab: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    color: 'white'
  },

  // Buttons
  buttonPrimary: { 
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px', 
    backgroundColor: '#3b82f6', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  
  buttonSecondary: { 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    marginRight: '8px', 
    backgroundColor: '#6b7280', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  buttonDanger: { 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // Table
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  
  table: { 
    width: '100%', 
    borderCollapse: 'collapse'
  },
  
  th: { 
    padding: '16px 12px', 
    textAlign: 'left', 
    backgroundColor: '#f8fafc',
    fontWeight: '600',
    color: '#374151',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e5e7eb'
  },
  
  td: { 
    borderBottom: '1px solid #f3f4f6', 
    padding: '16px 12px', 
    verticalAlign: 'middle'
  },
  
  tr: {
    transition: 'background-color 0.2s'
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
    border: '1px solid #e5e7eb'
  },
  
  productDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  
  productName: {
    fontSize: '14px',
    color: '#1f2937',
    lineHeight: '1.3',
    fontWeight: '600'
  },
  
  modelName: {
    color: '#6b7280',
    fontSize: '12px'
  },
  
  sku: {
    color: '#9ca3af',
    fontSize: '11px'
  },

  // Price Info
  priceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  
  price: {
    fontSize: '14px',
    color: '#059669',
    fontWeight: '600'
  },
  
  mrp: {
    color: '#6b7280',
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
    fontSize: '14px',
    color: '#374151'
  },

  // Status Badge
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  // Sale Type Badge
  saleTypeBadge: {
    padding: '4px 8px',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '11px',
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
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px dashed #d1d5db',
    color: '#6b7280'
  }
};
