'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ShoppingCart, 
  Star, 
  MapPin,
  Truck,
  AlertCircle,
  X,
  SlidersHorizontal
} from 'lucide-react';

// Mock cart context for demo
const useCart = () => ({
  addToCart: (sellerId, product) => {
    console.log('Adding to cart:', { sellerId, product });
    return Promise.resolve();
  }
});

// Mock Header and Footer components
const Header = () => <div style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>Header</div>;
const Footer = () => <div style={{ padding: '2rem', background: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>Footer</div>;

// Mock API data
const mockProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    model_name: "WH-1000XM4",
    price: 15999,
    mrp: 19999,
    online_stock: 10,
    category: "Electronics",
    description: "High-quality wireless headphones with noise cancellation",
    main_image_url: "https://placehold.co/300x200/3b82f6/ffffff?text=Headphones",
    average_rating: 4.5,
    review_count: 128,
    created_at: "2024-01-15T10:00:00Z",
    store: {
      id: 1,
      name: "TechMart Kerala",
      seller_phone: "+919876543210",
      delivery_available: true
    }
  },
  {
    id: 2,
    name: "Organic Kerala Spices Set",
    price: 899,
    mrp: 1299,
    online_stock: 0,
    category: "Food",
    description: "Authentic Kerala spices collection",
    main_image_url: "https://placehold.co/300x200/059669/ffffff?text=Spices",
    average_rating: 4.8,
    review_count: 89,
    created_at: "2024-02-10T12:00:00Z",
    store: {
      id: 2,
      name: "Kerala Spice Co",
      seller_phone: "+919876543211",
      delivery_available: true
    }
  },
  {
    id: 3,
    name: "Handwoven Cotton Saree",
    price: 2499,
    mrp: 3499,
    online_stock: 3,
    category: "Clothing",
    description: "Beautiful handwoven cotton saree from Kerala",
    main_image_url: "https://placehold.co/300x200/dc2626/ffffff?text=Saree",
    average_rating: 4.7,
    review_count: 45,
    created_at: "2024-02-20T14:00:00Z",
    store: {
      id: 3,
      name: "Kerala Handlooms",
      seller_phone: "+919876543212",
      delivery_available: false
    }
  }
];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [cartActionLoading, setCartActionLoading] = useState({});
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter and search products
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.store?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate product data first
    if (!product) {
      alert('Product data is missing');
      return;
    }

    if (!product.id) {
      alert('Product ID is missing');
      return;
    }
    
    if (product.online_stock <= 0) {
      alert('This product is out of stock');
      return;
    }
    
    // Validate store and seller info
    if (!product.store) {
      alert('Store information is missing');
      return;
    }

    if (!product.store.seller_phone) {
      alert('Seller contact information is missing');
      return;
    }

    // Set loading state for this specific product
    setCartActionLoading(prev => ({ ...prev, [product.id]: true }));
    
    try {
      await addToCart(product.store.seller_phone, product);
      
      // Show success feedback
      const button = e.target.closest('button');
      if (button) {
        const originalText = button.querySelector('span')?.textContent || button.textContent;
        const span = button.querySelector('span');
        if (span) {
          span.textContent = 'Added!';
        } else {
          button.textContent = 'Added!';
        }
        button.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
          if (span) {
            span.textContent = originalText;
          } else {
            button.textContent = originalText;
          }
          button.style.backgroundColor = '#3b82f6';
        }, 1500);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setCartActionLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getUniqueCategories = () => {
    const categories = products.map(product => product.category).filter(Boolean);
    return [...new Set(categories)];
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
  };

  if (isLoading && products.length === 0) {
    return (
      <div style={styles.pageContainer}>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading amazing products for you...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <Header />
        <div style={styles.errorContainer}>
          <AlertCircle size={48} />
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchProducts} style={styles.retryButton}>
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Header />
      
      {/* Mobile-First Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Discover Amazing Products</h1>
          <p style={styles.heroSubtitle}>Shop from trusted sellers across Kerala</p>
          
          {/* Enhanced Mobile Search */}
          <div style={styles.searchContainer}>
            <div style={styles.searchBox}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Mobile Toolbar */}
        <div style={styles.mobileToolbar}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={styles.toolbarButton}
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
          </button>
          
          <button
            onClick={() => setShowMobileSort(!showMobileSort)}
            style={styles.toolbarButton}
          >
            <Filter size={18} />
            <span>Sort</span>
          </button>
          
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'grid' ? styles.activeView : {})
              }}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'list' ? styles.activeView : {})
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Sort Dropdown */}
        {showMobileSort && (
          <div style={styles.mobileDropdown}>
            <div style={styles.dropdownContent}>
              <div style={styles.dropdownHeader}>
                <h3>Sort By</h3>
                <button onClick={() => setShowMobileSort(false)} style={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>
              {[
                { value: 'name', label: 'Name A-Z' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'newest', label: 'Newest First' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowMobileSort(false);
                  }}
                  style={{
                    ...styles.dropdownOption,
                    ...(sortBy === option.value ? styles.activeOption : {})
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div style={styles.mobileFilters}>
            <div style={styles.filtersContent}>
              <div style={styles.filtersHeader}>
                <h3>Filters</h3>
                <button onClick={() => setShowFilters(false)} style={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>
              
              <div style={styles.filterSection}>
                <h4>Category</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={styles.mobileSelect}
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div style={styles.filterSection}>
                <h4>Price Range</h4>
                <div style={styles.priceInputs}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    style={styles.priceInput}
                  />
                  <span style={styles.priceSeparator}>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    style={styles.priceInput}
                  />
                </div>
              </div>
              
              <div style={styles.filterActions}>
                <button onClick={clearAllFilters} style={styles.clearButton}>
                  Clear All
                </button>
                <button onClick={() => setShowFilters(false)} style={styles.applyButton}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div style={styles.resultsHeader}>
          <span style={styles.resultsCount}>
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Products Grid/List - Mobile Optimized */}
        {filteredProducts.length > 0 ? (
          <div style={viewMode === 'grid' ? styles.mobileGrid : styles.mobileList}>
            {filteredProducts.map(product => (
              <div key={product.id} style={viewMode === 'grid' ? styles.mobileCard : styles.mobileListCard}>
                <Link href={`/product/${product.id}`} style={styles.cardLink}>
                  <div style={styles.imageContainer}>
                    <img 
                      src={product.main_image_url || product.image_url || 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image'} 
                      alt={product.name} 
                      style={viewMode === 'grid' ? styles.mobileImage : styles.listImage}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/300x200/e9ecef/6c757d?text=No+Image';
                      }}
                      loading="lazy"
                    />
                    {product.online_stock <= 5 && product.online_stock > 0 && (
                      <span style={styles.stockBadge}>Only {product.online_stock} left!</span>
                    )}
                    {product.online_stock === 0 && (
                      <span style={styles.outOfStockBadge}>Out of Stock</span>
                    )}
                  </div>
                  
                  <div style={styles.mobileCardContent}>
                    <h3 style={styles.mobileProductName}>{product.name}</h3>
                    {product.model_name && (
                      <p style={styles.mobileModelName}>{product.model_name}</p>
                    )}
                    
                    <div style={styles.mobilePriceContainer}>
                      <span style={styles.mobileCurrentPrice}>{formatPrice(product.price)}</span>
                      {product.mrp && product.mrp > product.price && (
                        <>
                          <span style={styles.mobileOriginalPrice}>{formatPrice(product.mrp)}</span>
                          <span style={styles.mobileDiscount}>
                            {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    {/* Mobile Store Info */}
                    {product.store && (
                      <div style={styles.mobileStoreInfo}>
                        <MapPin size={12} />
                        <span>{product.store.name}</span>
                      </div>
                    )}

                    {/* Mobile Rating */}
                    {product.average_rating && (
                      <div style={styles.mobileRating}>
                        <Star size={12} fill="#ffc107" color="#ffc107" />
                        <span>{product.average_rating.toFixed(1)}</span>
                        <span>({product.review_count || 0})</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Mobile Action Button */}
                <div style={styles.mobileActions}>
                  <button 
                    onClick={(e) => handleAddToCart(e, product)} 
                    style={{
                      ...styles.mobileAddToCartButton,
                      ...(product.online_stock === 0 ? styles.mobileDisabledButton : {}),
                      ...(cartActionLoading[product.id] ? styles.loadingButton : {})
                    }}
                    disabled={product.online_stock === 0 || cartActionLoading[product.id]}
                  >
                    {cartActionLoading[product.id] ? (
                      <>
                        <div style={styles.buttonSpinner}></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} />
                        <span>{product.online_stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                      </>
                    )}
                  </button>
                  
                  {product.store?.delivery_available && (
                    <div style={styles.mobileDeliveryInfo}>
                      <Truck size={12} />
                      <span>Free Delivery</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.mobileEmptyState}>
            <Search size={48} />
            <h3>No products found</h3>
            <p>Try different search terms or filters</p>
            <button onClick={clearAllFilters} style={styles.clearFiltersButton}>
              Clear All Filters
            </button>
          </div>
        )}

        {/* Mobile Load More (if needed) */}
        {filteredProducts.length > 0 && (
          <div style={styles.mobileLoadMore}>
            <span style={styles.loadMoreText}>
              Showing all {filteredProducts.length} products
            </span>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  
  // Loading & Error - Mobile Optimized
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px',
    padding: '20px',
    textAlign: 'center'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  buttonSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px',
    textAlign: 'center',
    padding: '20px'
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500'
  },

  // Hero Section - Mobile First
  heroSection: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    padding: '40px 20px 30px 20px',
    textAlign: 'center',
    color: 'white'
  },
  heroContent: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '12px',
    lineHeight: '1.2'
  },
  heroSubtitle: {
    fontSize: '1rem',
    marginBottom: '24px',
    opacity: 0.9
  },

  // Mobile-First Search
  searchContainer: {
    maxWidth: '100%',
    margin: '0 auto'
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: '#64748b',
    zIndex: 1
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 44px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '12px',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    color: '#1e293b'
  },

  // Main Container - Mobile Optimized
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '20px 16px'
  },

  // Mobile Toolbar
  mobileToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    padding: '0 4px'
  },
  toolbarButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.2s'
  },
  viewToggle: {
    display: 'flex',
    marginLeft: 'auto',
    gap: '4px'
  },
  viewButton: {
    padding: '8px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  },
  activeView: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    color: 'white'
  },

  // Mobile Dropdowns
  mobileDropdown: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000
  },
  dropdownContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: '16px 16px 0 0',
    padding: '20px'
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#64748b'
  },
  dropdownOption: {
    display: 'block',
    width: '100%',
    padding: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '8px',
    marginBottom: '4px'
  },
  activeOption: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    fontWeight: '600'
  },

  // Mobile Filters Panel
  mobileFilters: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000
  },
  filtersContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: '16px 16px 0 0',
    padding: '20px',
    maxHeight: '80vh',
    overflowY: 'auto'
  },
  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  },
  filterSection: {
    marginBottom: '24px'
  },
  mobileSelect: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: 'white',
    marginTop: '8px'
  },
  priceInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px'
  },
  priceInput: {
    flex: 1,
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none'
  },
  priceSeparator: {
    color: '#64748b',
    fontWeight: '500'
  },
  filterActions: {
    display: 'flex',
    gap: '12px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  clearButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#f8fafc',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#374151'
  },
  applyButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  },

  // Results Header
  resultsHeader: {
    marginBottom: '20px'
  },
  resultsCount: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },

  // Mobile Grid Layout
  mobileGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  mobileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  // Mobile Product Cards
  mobileCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease'
  },
  mobileListCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    display: 'grid',
    gridTemplateColumns: '80px 1fr',
    gap: '12px',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
  },

  // Mobile Images
  imageContainer: {
    position: 'relative'
  },
  mobileImage: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    backgroundColor: '#f3f4f6'
  },
  listImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  stockBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: '#f59e0b',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600'
  },
  outOfStockBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: '#ef4444',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600'
  },

  // Mobile Content
  mobileCardContent: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  mobileProductName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  mobileModelName: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b'
  },

  // Mobile Price
  mobilePriceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap'
  },
  mobileCurrentPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#059669'
  },
  mobileOriginalPrice: {
    fontSize: '12px',
    color: '#64748b',
    textDecoration: 'line-through'
  },
  mobileDiscount: {
    fontSize: '10px',
    background: '#dcfce7',
    color: '#166534',
    padding: '2px 4px',
    borderRadius: '3px',
    fontWeight: '600'
  },

  // Mobile Store & Rating
  mobileStoreInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#64748b'
  },
  mobileRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '12px',
    color: '#64748b'
  },

  // Mobile Actions
  mobileActions: {
    padding: '0 12px 12px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  mobileAddToCartButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  mobileDisabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  loadingButton: {
    backgroundColor: '#6366f1',
    cursor: 'not-allowed'
  },
  mobileDeliveryInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#059669'
  },

  // Mobile Empty State
  mobileEmptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b'
  },
  clearFiltersButton: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },

  // Mobile Load More
  mobileLoadMore: {
    textAlign: 'center',
    padding: '20px',
    marginTop: '20px'
  },
  loadMoreText: {
    fontSize: '14px',
    color: '#64748b'
  }
};