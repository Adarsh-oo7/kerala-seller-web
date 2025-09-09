'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from './context/CartContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import BannerSlider from "../components/home/BannerSlider";
import TopCategory from "../components/home/TopCategory";
import ProductCard from "../components/common/ProductCard";
import ProductFilters from "../components/products/ProductFilters";
import Skeleton from "../components/common/Skeleton";
import { Search, X } from 'lucide-react';

const bannerImages = [
  { src: "/assets/images/Banner/5.png", alt: "Banner 5" },
  { src: "/assets/images/Banner/4.png", alt: "Banner 4" },
  { src: "/assets/images/Banner/1.png", alt: "Banner 1" },
  { src: "/assets/images/Banner/2.png", alt: "Banner 2" },
  { src: "/assets/images/Banner/3.png", alt: "Banner 3" },
];

const PRODUCTS_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/user/store/products/' || 'http://localhost:8000/user/store/products/';
const CATEGORIES_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api/categories/' || 'http://localhost:8000/api/categories/';

// Custom hook for media queries
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { addToCart } = useCart();

  // Media queries for responsive behavior
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    priceMin: '',
    priceMax: '',
    rating: '',
    sortBy: 'newest',
    search: '',
    inStock: true
  });

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(CATEGORIES_API_URL);
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  const fetchProducts = useCallback(async (page = 1, appliedFilters = filters) => {
    setIsLoading(true);
    try {
      let url = `${PRODUCTS_API_URL}?page=${page}`;
      
      // Add filters to URL
      if (appliedFilters.category) {
        url += `&category=${appliedFilters.category}`;
      }
      if (appliedFilters.search) {
        url += `&search=${encodeURIComponent(appliedFilters.search)}`;
      }
      
      const response = await axios.get(url);
      const data = response.data;
      
      let productList = data.results || data;
      setTotalPages(Math.ceil((data.count || productList.length) / 20));
      setTotalProducts(data.count || productList.length);
      
      // Apply client-side filters
      productList = applyClientFilters(productList, appliedFilters);
      
      if (page === 1) {
        setProducts(productList);
        setFilteredProducts(productList);
      } else {
        setProducts(prev => [...prev, ...productList]);
        setFilteredProducts(prev => [...prev, ...productList]);
      }
      
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyClientFilters = (productList, appliedFilters) => {
    let filtered = [...productList];

    // Price filter
    if (appliedFilters.priceMin || appliedFilters.priceMax) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price) || 0;
        const min = parseFloat(appliedFilters.priceMin) || 0;
        const max = parseFloat(appliedFilters.priceMax) || Infinity;
        return price >= min && price <= max;
      });
    }

    // Rating filter
    if (appliedFilters.rating) {
      const minRating = parseFloat(appliedFilters.rating);
      filtered = filtered.filter(product => 
        (product.average_rating || 0) >= minRating
      );
    }

    // Stock filter
    if (appliedFilters.inStock) {
      filtered = filtered.filter(product => 
        product.online_stock > 0
      );
    }

    // Sort products
    switch (appliedFilters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    return filtered;
  };

  // Responsive grid columns calculation
  const gridColumns = useMemo(() => {
    if (isMobile) return 'repeat(2, 1fr)';
    if (isTablet) return 'repeat(4, 1fr)';
    return 'repeat(6, 1fr)';
  }, [isMobile, isTablet]);

  const gridGap = useMemo(() => {
    if (isMobile) return '16px';
    if (isTablet) return '20px';
    return '24px';
  }, [isMobile, isTablet]);

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      const newFilters = {
        ...filters,
        search: debouncedSearchTerm
      };
      setFilters(newFilters);
      setCurrentPage(1);
      fetchProducts(1, newFilters);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchCategories();
    fetchProducts(1);
  }, []);

  // Handle search input changes (no timeout needed - using debounce hook)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchTerm('');
    const newFilters = {
      ...filters,
      search: ''
    };
    
    setFilters(newFilters);
    setCurrentPage(1);
    fetchProducts(1, newFilters);
  };

  // Handle category click from TopCategory component
  const handleCategoryClick = (categoryId, categoryName) => {
    const newFilters = {
      ...filters,
      category: categoryId.toString(),
      search: ''
    };
    
    setFilters(newFilters);
    setSearchTerm('');
    setCurrentPage(1);
    fetchProducts(1, newFilters);
    
    // Scroll to products section
    const productsSection = document.querySelector('[data-products-section]');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchProducts(1, newFilters);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.store && product.store.seller_phone) {
      addToCart(product.store.seller_phone, product);
      
      // Show success feedback
      const button = e.target.closest('button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.style.backgroundColor = '#10b981';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '#007bff';
        }, 1500);
      }
    } else {
      alert("Could not add to cart: seller information is missing.");
    }
  };

  const handleToggleWishlist = (productId) => {
    console.log('Toggle wishlist for product:', productId);
  };

  const loadMoreProducts = () => {
    if (currentPage < totalPages && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  // Dynamic styles based on media queries
  const dynamicStyles = {
    ...styles,
    productsGrid: {
      ...styles.productsGrid,
      gridTemplateColumns: gridColumns,
      gap: gridGap
    },
    loadingGrid: {
      ...styles.loadingGrid,
      gridTemplateColumns: gridColumns,
      gap: gridGap
    }
  };

  return (
    <div style={{ backgroundColor: "#FDFFF0" }}>
      <Header />
      
      {/* Reduced height TopCategory */}
      <div style={dynamicStyles.topCategorySection}>
        <TopCategory onCategoryClick={handleCategoryClick} />
      </div>

      <div style={dynamicStyles.bannerSection}>
        <BannerSlider images={bannerImages} autoPlay={true} interval={4000} />
      </div>

      <div style={dynamicStyles.container} data-products-section>
        {/* Search Bar Section */}
        <div style={dynamicStyles.searchSection}>
          <div style={dynamicStyles.searchContainer}>
            <div style={dynamicStyles.searchInputWrapper}>
              <Search size={20} style={dynamicStyles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={dynamicStyles.searchInput}
              />
              {searchTerm && (
                <button onClick={handleClearSearch} style={dynamicStyles.clearSearchButton}>
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Section Header */}
        <div style={dynamicStyles.productsHeader}>
          <div style={dynamicStyles.headerLeft}>
            <h2 style={dynamicStyles.sectionTitle}>All Products</h2>
            <span style={dynamicStyles.productCount}>
              {totalProducts} products found
            </span>
            {searchTerm && (
              <span style={dynamicStyles.searchIndicator}>
                for "{searchTerm}"
              </span>
            )}
            {filters.category && (
              <span style={dynamicStyles.categoryIndicator}>
                in {categories.find(cat => cat.id.toString() === filters.category)?.name || 'Category'}
              </span>
            )}
          </div>
          <div style={dynamicStyles.headerRight}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={dynamicStyles.filterToggle}
            >
              🔍 Filters {showFilters ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <ProductFilters
            filters={{...filters, search: ''}}
            categories={categories}
            onFilterChange={(newFilters) => {
              handleFilterChange({...newFilters, search: filters.search});
            }}
            productCount={filteredProducts.length}
            hideSearch={true}
          />
        )}

        {/* Products Grid */}
        {isLoading && currentPage === 1 ? (
          <div style={dynamicStyles.loadingGrid}>
            {Array.from({ length: isMobile ? 4 : 8 }).map((_, index) => (
              <div key={index} style={dynamicStyles.skeletonWrapper}>
                <Skeleton width="100%" height="320px" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={dynamicStyles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  price={product.price}
                  mrp={product.mrp}
                  rating={product.average_rating}
                  reviewCount={product.review_count}
                  primaryImage={product.main_image_url || "/placeholder.svg"}
                  hoverImage={product.sub_images?.[0]?.image_url || product.main_image_url || "/placeholder.svg"}
                  onlineStock={product.online_stock}
                  storeName={product.store?.name}
                  modelName={product.model_name}
                  isWishlisted={product.isWishlisted || false}
                  onAddToCart={(e) => handleAddToCart(e, product)}
                  onToggleWishlist={() => handleToggleWishlist(product.id)}
                  className={product.online_stock === 0 ? "out-of-stock" : ""}
                />
              ))}
            </div>

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div style={dynamicStyles.loadMoreContainer}>
                <button 
                  onClick={loadMoreProducts}
                  disabled={isLoading}
                  style={dynamicStyles.loadMoreButton}
                >
                  {isLoading ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}

            {/* No Products Message */}
            {filteredProducts.length === 0 && !isLoading && (
              <div style={dynamicStyles.noProducts}>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    handleFilterChange({
                      category: '',
                      priceMin: '',
                      priceMax: '',
                      rating: '',
                      sortBy: 'newest',
                      search: '',
                      inStock: true
                    });
                  }}
                  style={dynamicStyles.clearFiltersButton}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Static styles (without media queries to avoid warnings)
const styles = {
  topCategorySection: {
    width: "100%", 
    margin: 0, 
    padding: "8px 0",
    marginTop: "15px"
  },

  bannerSection: { 
    width: "100%", 
    margin: 0, 
    padding: 0, 
    marginTop: "12px",
    justifyContent: "center", 
    display: "flex" 
  },

  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '15px'
  },
  
  searchSection: {
    marginBottom: '20px',
    padding: '0 5px'
  },
  
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },
  
  searchInputWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '600px',
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
    padding: '12px 16px 12px 50px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: 'white',
    color: '#1e293b',
    transition: 'border-color 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  
  clearSearchButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#64748b',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  productsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  
  sectionTitle: { 
    fontSize: '1.8rem',
    margin: 0,
    fontWeight: '700'
  },
  
  productCount: {
    fontSize: '14px',
    color: '#666',
    backgroundColor: '#f0f0f0',
    padding: '4px 8px',
    borderRadius: '12px'
  },
  
  searchIndicator: {
    fontSize: '14px',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '500'
  },
  
  categoryIndicator: {
    fontSize: '14px',
    color: '#059669',
    backgroundColor: '#ecfdf5',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '500'
  },
  
  headerRight: {
    display: 'flex',
    gap: '10px'
  },
  
  filterToggle: {
    padding: '8px 16px',
    backgroundColor: '#0d6efd',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  // Base grid (dynamically updated with responsive columns)
  productsGrid: { 
    display: 'grid',
    marginBottom: '30px',
    // gridTemplateColumns and gap will be set dynamically
  },
  
  loadingGrid: {
    display: 'grid',
    // gridTemplateColumns and gap will be set dynamically
  },
  
  skeletonWrapper: {
    borderRadius: '8px',
    overflow: 'hidden'
  },
  
  loadMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '30px'
  },
  
  loadMoreButton: {
    padding: '12px 30px',
    backgroundColor: '#0d6efd',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  
  noProducts: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    marginTop: '20px'
  },
  
  clearFiltersButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '15px'
  }
};
