'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // ✅ Add this import
import ProductForm from '../../../../components/ProductForm';
import '../../../../styles/DashboardProduct.css'
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
  ExternalLink,
  Grid,
  List,
  Download,
  Upload,
  BarChart3,
  ShoppingCart,
  IndianRupee,
  Layers
} from 'lucide-react';

// ✅ Add the subscription API URL
const API_BASE_URL = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL || ''https://api.keralasellers.in'';
const API_URL = `${API_BASE_URL}/api/products/`;
const SUBSCRIPTION_API_URL = `${API_BASE_URL}/api/subscriptions/current/`; // ✅ Add this

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subscription, setSubscription] = useState(null); // ✅ Add this state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isDeleting, setIsDeleting] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const router = useRouter(); // ✅ Add this

  // ✅ Add this function to fetch subscription
  const fetchSubscription = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await axios.get(SUBSCRIPTION_API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSubscription(response.data);
      console.log('✅ Subscription loaded:', response.data);
    } catch (err) {
      console.log('⚠️ No active subscription found');
      setSubscription(null);
    }
  }, []);

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

    useEffect(() => {
    fetchSubscription();
    fetchProducts();
  }, [fetchSubscription, fetchProducts]);


  // ✅ Enhanced filtering and sorting
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'high_value':
        filtered = filtered.filter(product =>
          parseFloat(product.price || 0) > 1000
        );
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'price':
          aValue = parseFloat(a.price || 0);
          bValue = parseFloat(b.price || 0);
          break;
        case 'stock':
          aValue = parseInt(a.online_stock || 0);
          bValue = parseInt(b.online_stock || 0);
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        default: // name
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterType, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // Function to handle auto-switching view
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("grid"); // ✅ Auto switch to grid
      } else {
        setViewMode("table"); // ✅ Back to table on larger screens
      }
    };

    // Run once on mount and whenever the window resizes
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    const token = localStorage.getItem('accessToken');
    setIsDeleting(productId);

    try {
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
  // Check subscription before allowing add (but allow edit of existing products)
  if (!subscription?.is_active && !product) {
    // Show confirmation dialog asking user to subscribe
    if (window.confirm('You need an active subscription to add products.\n\nWould you like to subscribe now?')) {
      router.push('/dashboard/seller/subscription');
    }
    return;
  }
  
  // If subscription is active or editing existing product, open modal
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

  // ✅ Enhanced sort handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
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
      in_stock: products.filter(p => p.online_stock > 5).length,
      high_value: products.filter(p => parseFloat(p.price || 0) > 1000).length
    };
  };

  // ✅ Analytics calculations
  const getAnalytics = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price || 0) * parseInt(p.online_stock || 0)), 0);
    const averagePrice = totalProducts > 0 ? products.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / totalProducts : 0;
    const lowStockCount = products.filter(p => p.online_stock > 0 && p.online_stock <= 5).length;

    return {
      totalProducts,
      totalValue,
      averagePrice,
      lowStockCount
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
  const analytics = getAnalytics();


  // ✅ Enhanced Grid View Component
  const GridView = () => (
    <div className='dashboardproductgridcontainer' style={styles.gridContainer}>
      {filteredProducts.map(product => {
        const stockStatus = getStockStatus(product.online_stock);

        return (
          <div key={product.id} style={styles.gridCard}>
            <div className='dashboardproductcardimgcontainer' style={styles.cardImageContainer}>
              <img
                src={product.image_url || product.main_image_url || 'https://via.placeholder.com/200x200/e9ecef/6c757d?text=No+Image'}
                alt={product.name}
                style={styles.cardImage}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x200/e9ecef/6c757d?text=No+Image';
                }}
              />
              <div style={styles.cardImageOverlay}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: stockStatus.bgColor,
                  color: stockStatus.color
                }}>
                  {stockStatus.label}
                </span>
              </div>
            </div>

            <div style={styles.cardContent}>
              <h3 className='dashboardproductcardimgtitle' style={styles.cardTitle}>{product.name || 'Unnamed Product'}</h3>
              {product.model_name && (
                <p style={styles.cardModel}>Model: {product.model_name}</p>
              )}

              <div style={styles.cardPriceContainer}>
                <span className='dashboardproductcardimgprice' style={styles.cardPrice}>₹{parseFloat(product.price || 0).toLocaleString('en-IN')}</span>
                {product.mrp && parseFloat(product.mrp) > parseFloat(product.price) && (
                  <span style={styles.cardMrp}>₹{parseFloat(product.mrp).toLocaleString('en-IN')}</span>
                )}
              </div>

              <div style={styles.cardStock}>
                <span>Stock: {product.online_stock || 0}</span>
                <span style={styles.cardSaleType}>{formatSaleType(product.sale_type)}</span>
              </div>
            </div>

            <div style={styles.cardActions}>
              <button
                className='dashboardproductcardimgbtn'
                onClick={() => handleOpenModal(product)}
                style={styles.cardButton}
                title="Edit product"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                style={{ ...styles.cardButton, ...styles.cardButtonDanger }}
                disabled={isDeleting === product.id}
                title="Delete product"
              >
                {isDeleting === product.id ? (
                  <div style={styles.smallSpinner}></div>
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className='dashboardproductpagecontainer' style={styles.container}>
      {/* ✅ Enhanced Header with Analytics */}
      <div className='dashboardproductheader' style={styles.header}>
        <div>
          <h1 className='dashboardproducttitle' style={styles.h1}>
            <Package size={28} className='dashboardproductpackageicon' />
            My Products ({filteredProducts.length})
          </h1>
          <p className='dashboardproductsubtitle' style={styles.subtitle}>Manage your product inventory and listings</p>
        </div>
        <div style={styles.headerActions}>
          <button className='dashboardproductaddprodbtn' onClick={() => handleOpenModal()} style={styles.buttonPrimary}>
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* ✅ Analytics Cards */}
      <div className='dashboardproductanalyticscontainer' style={styles.analyticsContainer}>
        <div style={styles.analyticsCard}>
          <div className='dashboardproductanalyticsiconcontainer' style={styles.analyticsIcon}>
            <Package size={24} className='dashboardproductanalyticsicon' />
          </div>
          <div>
            <p className='dashboardproductanalyticslabel' style={styles.analyticsLabel}>Total Products</p>
            <p className='dashboardproductanalyticsvalue' style={styles.analyticsValue}>{analytics.totalProducts}</p>
          </div>
        </div>

        <div style={styles.analyticsCard}>
          <div className='dashboardproductanalyticsiconcontainer' style={styles.analyticsIcon}>
            <IndianRupee size={24} className='dashboardproductanalyticsicon' />
          </div>
          <div>
            <p className='dashboardproductanalyticslabel' style={styles.analyticsLabel}>Inventory Value</p>
            <p className='dashboardproductanalyticsvalue' style={styles.analyticsValue}>₹{analytics.totalValue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className='dashboardproductanalyticscard' style={styles.analyticsCard}>
          <div className='dashboardproductanalyticsiconcontainer' style={styles.analyticsIcon}>
            <BarChart3 size={24} className='dashboardproductanalyticsicon' />
          </div>
          <div>
            <p className='dashboardproductanalyticslabel' style={styles.analyticsLabel}>Average Price</p>
            <p className='dashboardproductanalyticsvalue' style={styles.analyticsValue}>₹{Math.round(analytics.averagePrice).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div style={styles.analyticsCard}>
          <div className='dashboardproductanalyticsiconcontainer' style={styles.analyticsIcon}>
            <AlertCircle size={24} className='dashboardproductanalyticsicon' />
          </div>
          <div>
            <p className='dashboardproductanalyticslabel' style={styles.analyticsLabel}>Low Stock Items</p>
            <p className='dashboardproductanalyticsvalue' style={styles.analyticsValue}>{analytics.lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* ✅ Enhanced Search and Filters */}
      <div style={styles.filtersContainer}>
        <div className="dashboard-search-sort" style={styles.searchAndSort}>
          <div className='dashboardproductsearchcontainer' style={styles.searchContainer}>
            <Search size={18} style={styles.searchIcon} />
            <input
              className='dashboardproductsearchinputtext'
              type="text"
              placeholder="Search products by name, model, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div className="dashboard-sort-view-row">
            <div style={styles.sortContainer}>
              <select
                className='dashboardproductsearchcontainer'
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                style={styles.sortSelect}
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
                <option value="stock-asc">Stock Low to High</option>
                <option value="stock-desc">Stock High to Low</option>
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
              </select>
            </div>

            <div style={styles.viewToggle}>

              <button
                className='dashboardproducttogglebtn'
                onClick={() => setViewMode('table')}
                disabled={window.innerWidth < 768} // disable on small screens
                style={{
                  ...styles.viewButton,
                  opacity: window.innerWidth < 768 ? 0.4 : 1, // fade when disabled
                  cursor: window.innerWidth < 768 ? 'not-allowed' : 'pointer',
                  ...(viewMode === 'table' ? styles.activeViewButton : {}),
                }}
              >
                <List size={16} />
              </button>

              <button
                onClick={() => setViewMode('grid')}
                style={{
                  ...styles.viewButton,
                  ...(viewMode === 'grid' ? styles.activeViewButton : {})
                }}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="filter-tabs" style={styles.filterTabs}>
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
        <button
          onClick={() => setFilterType('high_value')}
          style={{
            ...styles.filterTab,
            ...(filterType === 'high_value' ? styles.activeFilterTab : {})
          }}
        >
          High Value ({filterCounts.high_value})
        </button>
      </div>

      {
        isModalOpen && (
          <ProductForm
            product={editingProduct}
            onClose={handleCloseModal}
            onSuccess={handleFormSubmit}
          />
        )
      }

      {
        filteredProducts.length > 0 ? (
          viewMode === 'grid' ? <GridView /> : (
            <div style={styles.tableContainer}>
              <div className="custom-scroll" style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th} onClick={() => handleSort('name')}>
                        Product {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => handleSort('price')}>
                        Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={styles.th} onClick={() => handleSort('stock')}>
                        Stock (Online/Total) {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
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
            </div>
          )
        ) : (
          <div style={styles.emptyState}>
            <Package size={64} className='dashboardproductemptyicon' />
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
              <button className='dashboardproductaddfirstprodbtn' onClick={() => handleOpenModal()} style={styles.buttonPrimary}>
                <Plus size={18} />
                Add Your First Product
              </button>
            )}
          </div>
        )
      }

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

        /* Target your tableWrapper scroll area */
  .custom-scroll::-webkit-scrollbar {
    height: 2px;   /* for horizontal scrollbar */
    width: 2px;    /* for vertical scrollbar */
  }

  .custom-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;  /* track background */
    border-radius: 6px;
  }

  .custom-scroll::-webkit-scrollbar-thumb {
    background: #f1f1f1;  /* thumb (scroll handle) color */
    border-radius: 6px;
  }

  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: #f1f1f1;  /* darker on hover */
  }

  /* Firefox support */
  .custom-scroll {
    scrollbar-width: thin;
    scrollbar-color: #175E54 #f1f1f1;
  }
      `}</style>
    </div >
  );
}

// ✅ Enhanced styles with better mobile support
const styles = {
  container: {
    padding: '0px 0px 0px 24px',
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
    color: '#175E54',
    fontSize: '29px',
    margin: '0 0 8px 0',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  subtitle: {
    color: '#6b7280',
    fontSize: '15px',
    margin: 0
  },

  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },

  // ✅ Analytics Cards
  analyticsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '10px',
    marginBottom: '50px'
  },

  analyticsCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '16px',
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    border: '1px solid rgba(42, 108, 72, 0.3)',
    boxShadow: '0 4px 12px rgba(42, 108, 72, 0.3)',
    transition: 'all 0.2s'
  },

  analyticsIcon: {
    width: '56px',
    height: '56px',
    backgroundColor: 'rgba(255, 238, 175, 1)',
    color: '#3e7572ff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  analyticsLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  analyticsValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },

  // Filters
  filtersContainer: {
    width: "100%",
    marginBottom: "20px",
  },
  searchAndSort: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // spreads them across the row
    gap: "20px",
    width: "100%",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    flex: 1, // searchbar takes remaining space
    backgroundColor: '#FDFFF0',
    borderRadius: "8px",
    padding: "8px 6px",
    maxWidth: "920px", // optional: limit width
    border: '1px solid rgba(42, 108, 72, 0.3)',
  },
  searchIcon: {
    color: "#175E54",
    marginRight: "8px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    backgroundColor: '#FDFFF0',
    width: "100%",
    fontSize: "14px",
  },
  sortContainer: {
    flexShrink: 0, // don't stretch
  },
  sortSelect: {
    padding: "8px 6px",
    width: '110px',
    color: '#6b7280',
    borderRadius: "8px",
    border: '1px solid rgba(42, 108, 72, 0.3)',
    outline: "none",
    fontSize: "13px",
    backgroundColor: "#FDFFF0",
  },
  viewToggle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  viewButton: {
    border: '1px solid rgba(42, 108, 72, 0.3)',
    borderRadius: "6px",
    padding: "6px 10px",
    backgroundColor: "#FDFFF0",
    cursor: "pointer",
    transition: "0.2s",
    display: "flex",
  },

  activeViewButton: {
    backgroundColor: '#FDFFF0',
    color: '#175E54',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },

  filterTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '50px'
  },

  filterTab: {
    padding: '8px 16px',
    backgroundColor: '#FDFFF0',
    border: '1px solid #175E54',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s'
  },

  activeFilterTab: {
    backgroundColor: '#175E54',
    borderColor: '#3b82f6',
    color: 'white'
  },

  // ✅ Grid View Styles
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '20px'
  },

  gridCard: {
    backgroundColor: '#FDFFF0',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    transition: 'all 0.2s ease',
  },

  cardImageContainer: {
    position: 'relative',
    height: '160px', // 🟢 reduced from 215px
    overflow: 'hidden',
  },

  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  cardImageOverlay: {
    position: 'absolute',
    top: '8px',
    right: '8px',
  },

  cardContent: {
    padding: '8px 10px', // 🟢 smaller padding
  },

  cardTitle: {
    fontSize: '14px', // 🟢 reduced
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 6px 0',
    lineHeight: '1.3',
  },

  cardModel: {
    fontSize: '11px',
    color: '#6b7280',
    margin: '0 0 8px 0',
  },

  cardPriceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },

  cardPrice: {
    fontSize: '15px', // 🟢 smaller
    fontWeight: '700',
    color: '#059669',
  },

  cardMrp: {
    fontSize: '12px',
    color: '#9ca3af',
    textDecoration: 'line-through',
  },

  cardStock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    color: '#6b7280',
  },

  cardSaleType: {
    padding: '2px 6px',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '9px', // 🟢 reduced
    fontWeight: '500',
  },

  cardActions: {
    padding: '6px 10px',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    gap: '6px',
  },

  cardButton: {
    flex: 1,
    padding: '6px 8px', // 🟢 smaller
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    fontSize: '12px',
  },

  cardButtonDanger: {
    backgroundColor: '#ef4444',
  },


  // Buttons
  buttonPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#175E54',
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
    width: "100%",
    marginTop: "20px",
    marginBottom: "50px",
  },
  tableWrapper: {
    backgroundColor: '#FDFFF0',
    width: "100%",
    overflowX: "auto",  // ✅ Enables horizontal scroll
    overflowY: "auto",  // ✅ Enables vertical scroll
    maxHeight: "67vh",  // ✅ Limits height and adds vertical scroll if needed
    borderRadius: "12px",
    border: '1px solid #175E54',
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px", // ✅ Ensures scroll when screen is smaller
  },
  th: {
    position: "sticky",
    top: 0,
    backgroundColor: '#175E54',
    textAlign: "left",
    padding: "12px",
    cursor: "pointer",
    borderBottom: "1px solid #dee2e6",
    fontWeight: "600",
    whiteSpace: "nowrap",
    userSelect: 'none',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    fontSize: '12px',
    color: 'white',
    zIndex: 2,
    transition: "box-shadow 0.2s ease",
  },


  tr: {
    borderBottom: "1px solid #f1f1f1",
  },
  td: {
    padding: "12px",
    verticalAlign: "middle",
    borderTop: '1px solid #175E54',
    whiteSpace: "nowrap", // ✅ Prevents long text wrapping (makes scroll work better)
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

