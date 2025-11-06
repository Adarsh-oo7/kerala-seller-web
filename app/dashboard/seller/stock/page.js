'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import QuickAddStockForm from '../../../../components/QuickAddStockForm';
import Link from 'next/link';
import '../../../../styles/DashboardStock.css'
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  History, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Edit3,
  X
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/user/store/products/`;

// Enhanced Confirmation Modal Component
function ConfirmationModal({ message, onConfirm, onCancel, isLoading }) {
  const [note, setNote] = useState('');
  
  const handleConfirmClick = () => { 
    onConfirm(note); 
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={handleOverlayClick}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h4 style={styles.modalTitle}>Confirm Stock Change</h4>
          <button onClick={onCancel} style={styles.closeButton} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>
        
        <p style={styles.modalMessage}>{message}</p>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Reason for change (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., weekly restock, sale, correction, damage"
            style={styles.textarea}
            rows={3}
            disabled={isLoading}
          />
        </div>
        
        <div style={styles.buttonContainer}>
          <button 
            onClick={onCancel} 
            style={styles.buttonSecondary}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirmClick} 
            style={styles.buttonPrimary}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div style={styles.spinner}></div>
                Updating...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Confirm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StockManagementPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [isUpdatingStock, setIsUpdatingStock] = useState(null);
  const [error, setError] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, in_stock, low_stock, out_of_stock, overstocked

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      console.log('Fetching products from:', API_URL);
      const response = await axios.get(API_URL, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      const productData = response.data.results || response.data || [];
      console.log('Products fetched for stock management:', productData.length);
      
      setProducts(productData);
      setFilteredProducts(productData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login/seller';
        }, 2000);
      } else {
        setError('Failed to load products. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ FIXED: Apply search and filter
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

    // ✅ FIXED: Apply stock filter
    switch (stockFilter) {
      case 'in_stock':
        filtered = filtered.filter(product => 
          product.online_stock > 5
        );
        break;
      case 'low_stock':
        filtered = filtered.filter(product => 
          product.online_stock > 0 && product.online_stock <= 5
        );
        break;
      case 'out_of_stock':
        filtered = filtered.filter(product => 
          !product.online_stock || product.online_stock === 0
        );
        break;
      case 'overstocked':
        filtered = filtered.filter(product => 
          product.total_stock > 0 && product.online_stock > product.total_stock
        );
        break;
      default:
        // 'all' - no additional filtering, show ALL products
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, stockFilter]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const handleStockChange = (productId, stockType, newStock) => {
    const stockValue = Math.max(0, parseInt(newStock, 10));
    if (isNaN(stockValue)) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentStock = product[stockType];
    const difference = stockValue - currentStock;
    const stockTypeLabel = stockType.replace('_', ' ');

    setConfirmation({
      message: `Update ${product.name}'s ${stockTypeLabel} from ${currentStock} to ${stockValue}? ${
        difference > 0 ? `(+${difference})` : difference < 0 ? `(${difference})` : '(no change)'
      }`,
      onConfirm: async (note) => {
        setIsUpdatingStock(productId);
        const token = localStorage.getItem('accessToken');
        const data = { 
          [stockType]: stockValue, 
          note: note || `${stockTypeLabel} updated via stock management`
        };

        try {
          await axios.patch(`${API_URL}${productId}/update-stock/`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await fetchData();
          setError('');
        } catch (error) {
          console.error('Stock update failed:', error);
          if (error.response?.status === 401) {
            setError('Session expired. Please log in again.');
            setTimeout(() => {
              window.location.href = '/login/seller';
            }, 2000);
          } else {
            const errorMessage = error.response?.data?.error || 
                                error.response?.data?.message ||
                                'Could not update stock. Please try again.';
            setError(errorMessage);
          }
          await fetchData();
        } finally {
          setConfirmation(null);
          setIsUpdatingStock(null);
        }
      },
      onCancel: () => {
        setConfirmation(null);
        fetchData();
      }
    });
  };

  const getStockStatus = (product) => {
    const { online_stock, total_stock } = product;
    
    if (!online_stock || online_stock <= 0) {
      return { label: 'Out of Stock', color: '#ef4444', bgColor: '#fee2e2' };
    } else if (online_stock <= 5) {
      return { label: 'Low Stock', color: '#f59e0b', bgColor: '#fef3c7' };
    } else if (online_stock > total_stock) {
      return { label: 'Overstocked', color: '#8b5cf6', bgColor: '#f3e8ff' };
    } else {
      return { label: 'In Stock', color: '#10b981', bgColor: '#d1fae5' };
    }
  };

  // ✅ FIXED: Get filter counts
  const getFilterCounts = () => {
    return {
      all: products.length,
      in_stock: products.filter(p => p.online_stock > 5).length,
      low_stock: products.filter(p => p.online_stock > 0 && p.online_stock <= 5).length,
      out_of_stock: products.filter(p => !p.online_stock || p.online_stock === 0).length,
      overstocked: products.filter(p => p.total_stock > 0 && p.online_stock > p.total_stock).length
    };
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleFormSubmit = () => { 
    handleCloseModal(); 
    fetchData(); 
  };

  const filterCounts = getFilterCounts();

  return (
    <div style={styles.container}>
      {confirmation && (
        <ConfirmationModal 
          {...confirmation} 
          isLoading={isUpdatingStock !== null}
        />
      )}
      
      {/* Header */}
      <div className='dashboardstockheader' style={styles.header}>
        <div>
          <h1 className='dashboardstocktitle' style={styles.title}>
            <Package size={28} className='dashboardstockpackageicon' />
            Stock Management
          </h1>
          <p className='dashboardstocksubtitle' style={styles.subtitle}>
            Manage inventory levels and track stock changes for your store
          </p>
        </div>
        <div style={styles.headerActions}>
          <Link href="/dashboard/seller/history" className='dashboardstockhistorybtn' style={styles.buttonSecondary}>
            <History size={18} />
            View History
          </Link>
          <button className='dashboardstockaddbtn' onClick={handleOpenModal} style={styles.buttonPrimary}>
            <Plus size={18} />
            Quick Add Product
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')} style={styles.closeError}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.searchContainer}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by product name, model, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        {/* ✅ FIXED: Filter Tabs */}
        <div style={styles.filterTabs}>
          <button
            onClick={() => setStockFilter('all')}
            style={{
              ...styles.filterTab,
              ...(stockFilter === 'all' ? styles.activeFilterTab : {})
            }}
          >
            All Products ({filterCounts.all})
          </button>
          <button
            onClick={() => setStockFilter('in_stock')}
            style={{
              ...styles.filterTab,
              ...(stockFilter === 'in_stock' ? styles.activeFilterTab : {})
            }}
          >
            In Stock ({filterCounts.in_stock})
          </button>
          <button
            onClick={() => setStockFilter('low_stock')}
            style={{
              ...styles.filterTab,
              ...(stockFilter === 'low_stock' ? styles.activeFilterTab : {})
            }}
          >
            Low Stock ({filterCounts.low_stock})
          </button>
          <button
            onClick={() => setStockFilter('out_of_stock')}
            style={{
              ...styles.filterTab,
              ...(stockFilter === 'out_of_stock' ? styles.activeFilterTab : {})
            }}
          >
            Out of Stock ({filterCounts.out_of_stock})
          </button>
          <button
            onClick={() => setStockFilter('overstocked')}
            style={{
              ...styles.filterTab,
              ...(stockFilter === 'overstocked' ? styles.activeFilterTab : {})
            }}
          >
            Overstocked ({filterCounts.overstocked})
          </button>
        </div>
      </div>

      {isModalOpen && (
        <QuickAddStockForm 
          onClose={handleCloseModal} 
          onSuccess={handleFormSubmit} 
        />
      )}

      {/* Stock Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Product</th>
              <th style={{...styles.th, textAlign: 'center'}}>Status</th>
              <th style={{...styles.th, textAlign: 'center'}}>Total Stock</th>
              <th style={{...styles.th, textAlign: 'center'}}>Online Stock</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" style={{...styles.td, textAlign: 'center', padding: '3rem'}}>
                  <div style={styles.loadingState}>
                    <div style={styles.spinner}></div>
                    <span>Loading your inventory...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => {
                const stockStatus = getStockStatus(product);
                const isUpdating = isUpdatingStock === product.id;
                
                return (
                  <tr key={product.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.productInfo}>
                        <img 
                          src={product.image_url || product.main_image_url || 'https://via.placeholder.com/50x50/e9ecef/6c757d?text=No+Image'} 
                          alt={product.name} 
                          style={styles.productImage}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50x50/e9ecef/6c757d?text=No+Image';
                          }}
                        />
                        <div style={styles.productDetails}>
                          <strong style={styles.productName}>{product.name}</strong>
                          {product.model_name && (
                            <small style={styles.productModel}>Model: {product.model_name}</small>
                          )}
                          {product.sku && (
                            <small style={styles.productSku}>SKU: {product.sku}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: stockStatus.bgColor,
                        color: stockStatus.color
                      }}>
                        {stockStatus.label}
                      </span>
                    </td>
                    
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <div style={styles.stockControl}>
                        <button 
                          onClick={() => handleStockChange(product.id, 'total_stock', product.total_stock - 1)} 
                          style={styles.stockButton}
                          disabled={isUpdating}
                          title="Decrease total stock"
                        >
                          <Minus size={14} />
                        </button>
                        <input 
                          type="number" 
                          value={product.total_stock || 0} 
                          onChange={(e) => handleStockChange(product.id, 'total_stock', e.target.value)} 
                          style={styles.stockInput}
                          min="0"
                          disabled={isUpdating}
                        />
                        <button 
                          onClick={() => handleStockChange(product.id, 'total_stock', product.total_stock + 1)} 
                          style={styles.stockButton}
                          disabled={isUpdating}
                          title="Increase total stock"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <div style={styles.stockControl}>
                        <button 
                          onClick={() => handleStockChange(product.id, 'online_stock', product.online_stock - 1)} 
                          style={styles.stockButton}
                          disabled={isUpdating}
                          title="Decrease online stock"
                        >
                          <Minus size={14} />
                        </button>
                        <input 
                          type="number" 
                          value={product.online_stock || 0} 
                          onChange={(e) => handleStockChange(product.id, 'online_stock', e.target.value)} 
                          style={styles.stockInput}
                          min="0"
                          max={product.total_stock}
                          disabled={isUpdating}
                        />
                        <button 
                          onClick={() => handleStockChange(product.id, 'online_stock', Math.min(product.online_stock + 1, product.total_stock))} 
                          style={styles.stockButton}
                          disabled={isUpdating || product.online_stock >= product.total_stock}
                          title="Increase online stock"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {isUpdating && (
                        <div style={styles.updatingIndicator}>
                          <div style={styles.smallSpinner}></div>
                          <span>Updating...</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{...styles.td, textAlign: 'center', padding: '3rem'}}>
                  <div style={styles.emptyState}>
                    <Package size={48} />
                    <h3>No products found</h3>
                    <p>
                      {searchTerm || stockFilter !== 'all'
                        ? 'No products match your current filters.'
                        : 'You haven\'t added any products to your store yet.'}
                    </p>
                    {searchTerm || stockFilter !== 'all' ? (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStockFilter('all');
                        }}
                        style={styles.clearFiltersButton}
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <button onClick={handleOpenModal} style={styles.buttonPrimary}>
                        <Plus size={18} />
                        Add Your First Product
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Styles
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    animation: 'fadeIn 0.6s ease-out'
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },

  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },

  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0
  },

  headerActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },

  // Error Message
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '12px',
    color: '#991b1b',
    marginBottom: '24px'
  },

  closeError: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: '4px'
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
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.2s'
  },

  buttonSecondary: { 
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px', 
    backgroundColor: '#6b7280', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.2s'
  },

  clearFiltersButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
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

  tableHeader: {
    backgroundColor: '#f8fafc'
  },

  th: { 
    padding: '16px 12px', 
    textAlign: 'left', 
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e5e7eb'
  },

  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s'
  },

  td: { 
    padding: '16px 12px', 
    verticalAlign: 'middle'
  },

  // Product Info
  productInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  productImage: { 
    width: '50px',
    height: '50px',
    objectFit: 'cover', 
    borderRadius: '6px',
    border: '1px solid #e5e7eb'
  },

  productDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  productName: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '600'
  },

  productModel: {
    fontSize: '12px',
    color: '#6b7280'
  },

  productSku: {
    fontSize: '11px',
    color: '#9ca3af'
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

  // Stock Controls
  stockControl: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '8px'
  },

  stockInput: { 
    width: '70px', 
    textAlign: 'center',
    padding: '8px 4px', 
    border: '1px solid #d1d5db', 
    borderRadius: '6px', 
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none'
  },

  stockButton: { 
    width: '32px', 
    height: '32px', 
    border: '1px solid #d1d5db', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    backgroundColor: 'white', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    color: '#374151'
  },

  updatingIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '8px',
    fontSize: '11px',
    color: '#6b7280'
  },

  // Loading and Empty States
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    color: '#6b7280'
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    color: '#6b7280',
    textAlign: 'center'
  },

  // Spinners
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  smallSpinner: {
    width: '12px',
    height: '12px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #6b7280',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Modal Styles
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
    padding: '20px'
  },

  modalContent: { 
    background: 'white', 
    borderRadius: '16px', 
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 0 24px',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px'
  },

  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },

  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '4px'
  },

  modalMessage: {
    fontSize: '16px',
    color: '#374151',
    marginBottom: '20px',
    padding: '0 24px'
  },

  formGroup: {
    padding: '0 24px',
    marginBottom: '24px'
  },

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },

  textarea: { 
    width: '100%', 
    padding: '12px 16px',
    border: '1px solid #d1d5db', 
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },

  buttonContainer: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '12px',
    padding: '24px',
    borderTop: '1px solid #e5e7eb'
  }
};
