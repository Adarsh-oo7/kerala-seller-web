'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import "../styles/Keralasellershomepage.css";
import "../styles/AboutPage.css";
import { useCart } from './context/CartContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import BannerSlider from "../components/home/BannerSlider";
import SellerLanding from "../components/home/SellerLanding";
import TopCategory from "../components/home/TopCategory";
import ProductCard from "../components/common/ProductCard";
import ProductFilters from "../components/products/ProductFilters";
import Skeleton from "../components/common/Skeleton";
import { toast } from "react-toastify";
import { Search, X, Filter, Grid, AlertCircle, Package, Heart } from 'lucide-react';
import { useRouter } from "next/navigation";
import { getBuyerAuthHeaders } from './lib/buyerAuth';


const bannerImages = [
  { src: "/assets/images/Banner/5.png", alt: "Kerala Sellers - Local Products" },
  { src: "/assets/images/Banner/4.png", alt: "Quality Products from Kerala" },
  { src: "/assets/images/Banner/1.png", alt: "Shop Local, Support Kerala" },
  { src: "/assets/images/Banner/2.png", alt: "Zero Commission Platform" },
  { src: "/assets/images/Banner/3.png", alt: "Trusted Kerala Sellers" },
];

// âœ… Enhanced API base URL handling with environment variables
// âœ… BULLETPROOF - Works everywhere

// âœ… Second check fallback env var
// âœ… HARDCODED - NO FUNCTIONS, NO ERRORS
// const API_BASE_URL = 'https://api.keralasellers.in';

// âœ… Works local + production automatically
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     'https://api.keralasellers.in';

const PRODUCTS_API_URL = `${API_BASE_URL}/api/products/`;
const CATEGORIES_API_URL = `${API_BASE_URL}/api/categories/`;
const WISHLIST_TOGGLE_API = `${API_BASE_URL}/api/wishlist/toggle_product/`;
const WISHLIST_CHECK_API = `${API_BASE_URL}/api/wishlist/check_product/`;

console.log(' API URLs configured:', {
  API_BASE_URL,
  PRODUCTS_API_URL,
  CATEGORIES_API_URL,
  WISHLIST_TOGGLE_API,
  WISHLIST_CHECK_API
});

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

// âœ… NEW: Infinite scroll hook
function useInfiniteScroll(callback, hasMore, isLoading) {
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;

      const nearBottom = scrollHeight - scrollTop - clientHeight < 200;

      if (nearBottom && hasMore && !isLoading) {
        console.log(' Near bottom - loading more products...');
        callback();
      }
    };

    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [callback, hasMore, isLoading]);
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const [wishlistLoading, setWishlistLoading] = useState(new Set());
  const router = useRouter();

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
      console.log('Fetching categories from:', CATEGORIES_API_URL);
      const response = await axios.get(CATEGORIES_API_URL);
      console.log('Categories response:', response.data);
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setError('Failed to load categories');
    }
  }, []);

  // ==========================================
  // ðŸ”½ OLD PRODUCT FETCHING CODE - COMMENTED OUT
  // ==========================================
  
  const fetchProducts = useCallback(async (page = 1, appliedFilters = filters) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError('');

    try {
      let url = `${PRODUCTS_API_URL}?page=${page}`;

      // Add filters to URL
      if (appliedFilters.category) {
        url += `&category=${appliedFilters.category}`;
      }
      if (appliedFilters.search) {
        url += `&search=${encodeURIComponent(appliedFilters.search)}`;
      }

      console.log('Fetching products from:', url);
      const response = await axios.get(url);
      const data = response.data;
      console.log('Products API response:', data);

      let productList = [];

      // âœ… Enhanced response structure handling
      if (Array.isArray(data.results)) {
        productList = data.results;
      } else if (Array.isArray(data.data)) {
        productList = data.data;
      } else if (Array.isArray(data)) {
        productList = data;
      } else if (data.products && Array.isArray(data.products)) {
        productList = data.products;
      } else {
        console.warn('Unexpected API response structure:', data);
        productList = [];
      }

      console.log('Processed product list:', productList.length, 'products');

      // Set pagination info
      const count = data.count || data.total || productList.length;
      setTotalPages(Math.ceil(count / (data.page_size || 20)));
      setTotalProducts(count);

      // Apply client-side filters
      const filteredList = applyClientFilters(productList, appliedFilters);

      if (page === 1) {
        setProducts(filteredList);
        setFilteredProducts(filteredList);
      } else {
        setProducts(prev => [...prev, ...filteredList]);
        setFilteredProducts(prev => [...prev, ...filteredList]);
      }

    } catch (error) {
      console.error("Failed to fetch products:", error);
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setError('Network error: Unable to connect to server');
      } else {
        setError('Failed to load products. Please try again.');
      }

      // Set empty arrays to prevent crashes
      if (page === 1) {
        setProducts([]);
        setFilteredProducts([]);
      }
    } finally {
      if (page === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [filters]);

  const applyClientFilters = (productList, appliedFilters) => {
    if (!Array.isArray(productList)) {
      console.warn('Product list is not an array:', productList);
      return [];
    }

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
        (product.online_stock || 0) > 0
      );
    }

    // Sort products
    switch (appliedFilters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
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

  const handleToggleWishlist = async (productId) => {
    console.log(' Toggle wishlist for product:', productId);

    const headers = getBuyerAuthHeaders();
    if (!headers) {
      router.push("/login/buyer");
      return;
    }

    if (wishlistLoading.has(productId)) {
      console.log(' Wishlist request already in progress for product:', productId);
      return;
    }

    setWishlistLoading(prev => new Set([...prev, productId]));

    try {
      console.log(' Sending wishlist toggle request...');
      const response = await axios.post(WISHLIST_TOGGLE_API, {
        product_id: productId
      }, {
        headers,
        timeout: 10000
      });

      console.log(' Wishlist toggle response:', response.data);

      const updateProducts = (prevProducts) =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, isWishlisted: response.data.is_wishlisted }
            : product
        );

      setProducts(updateProducts);
      setFilteredProducts(updateProducts);

      const action = response.data.is_wishlisted ? 'added to' : 'removed from';
      const productName = response.data.product_name || 'Product';
      console.log(` ${productName} ${action} wishlist`);

      showWishlistFeedback(productId, response.data.is_wishlisted, productName);

    } catch (error) {
      console.error(' Wishlist toggle error:', error);

      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('buyerAccessToken');
        alert('Session expired. Please login again.');
      } else if (error.code === 'ECONNABORTED') {
        alert('Request timeout. Please check your connection and try again.');
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to update wishlist. Please try again.';
        alert(errorMessage);
      }
    } finally {
      setWishlistLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const showWishlistFeedback = (productId, isWishlisted, productName) => {
    const heartButton = document.querySelector(`[data-product-id="${productId}"] .wishlist-heart`);
    if (heartButton) {
      const originalColor = heartButton.style.color;
      heartButton.style.color = isWishlisted ? '#dc2626' : '#6b7280';
      heartButton.style.transform = 'scale(1.2)';

      setTimeout(() => {
        heartButton.style.transform = 'scale(1)';
      }, 200);
    }

    const action = isWishlisted ? 'added to' : 'removed from';

    toast.success(`Item ${action} wishlist`, {
      position: "top-right",
      autoClose: 1500,
      theme: "colored",
    });
    console.log(` ${productName} ${action} wishlist!`);
  };

  const checkWishlistStatus = async (productIds) => {
    const headers = getBuyerAuthHeaders();
    if (!headers || productIds.length === 0) return;

    try {
      const results = [];
      for (const id of productIds.slice(0, 10)) {
        try {
          const response = await axios.get(`${WISHLIST_CHECK_API}?product_id=${id}`, { headers, timeout: 5000 });
          results.push({ id, isWishlisted: response.data.is_wishlisted });
        } catch (error) {
          if (error.response?.status === 401) return;
          results.push({ id, isWishlisted: false });
        }
      }

      const updateProductsWithWishlist = (prevProducts) =>
        prevProducts.map(product => {
          const wishlistInfo = results.find(r => r.id === product.id);
          return wishlistInfo
            ? { ...product, isWishlisted: wishlistInfo.isWishlisted }
            : product;
        });

      setProducts(updateProductsWithWishlist);
      setFilteredProducts(updateProductsWithWishlist);

    } catch (error) {
      console.warn('Error checking wishlist status:', error);
    }
  };

  // âœ… Improved responsive grid
  const gridColumns = useMemo(() => {
    if (isMobile) return 'repeat(2, 1fr)';
    if (isTablet) return 'repeat(3, 1fr)';
    return 'repeat(4, 1fr)';
  }, [isMobile, isTablet]);

  const gridGap = useMemo(() => {
    if (isMobile) return '10px';
    if (isTablet) return '15px';
    return '20px';
  }, [isMobile, isTablet]);

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
    if (filteredProducts.length > 0 && currentPage === 1) {
      const productIds = filteredProducts.map(p => p.id);
      checkWishlistStatus(productIds);
    }
  }, [filteredProducts.length, currentPage]);

  useEffect(() => {
    fetchCategories();
    fetchProducts(1);
  }, [fetchCategories]);

  const loadMoreProducts = useCallback(() => {
    if (currentPage < totalPages && !isLoading && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [currentPage, totalPages, isLoading, isLoadingMore, fetchProducts]);

  useInfiniteScroll(
    loadMoreProducts,
    currentPage < totalPages,
    isLoading || isLoadingMore
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

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

    if (!product) {
      alert("Product information is missing.");
      return;
    }

    const sellerPhone = product.store?.seller_phone ||
      product.seller_phone ||
      product.store?.phone ||
      product.phone;

    if (sellerPhone) {
      addToCart(sellerPhone, product);
      toast.success("Added to cart!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } else {
      alert("Could not add to cart: seller information is missing.");
      console.log('Product data:', product);
    }
  };

  const handleRetry = () => {
    setError('');
    fetchCategories();
    fetchProducts(1);
  };

  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showFilters]);

  // ==========================================
  // ðŸ”¼ END OF COMMENTED OLD CODE
  // ==========================================

  // Dynamic styles based on media queries
  const dynamicStyles = {
    ...styles,
    productsGrid: {
      ...styles.productsGrid,
    },
    loadingGrid: {
      ...styles.loadingGrid,
      gridTemplateColumns: gridColumns,
      gap: gridGap
    }
  };

  return (
    <div style={{ backgroundColor: "#FDFFF0", minHeight: '100vh' }}>
      <Header />
      <div className="page-container" style={{ backgroundColor: '#FDFFF0' }}>
        <SellerLanding />
      </div>
      {/* Top Category Section */}
      <div style={dynamicStyles.topCategorySection}>
        <TopCategory 
          // onCategoryClick={handleCategoryClick} // âŒ COMMENTED OUT
        />
      </div>

      {/* Banner Section */}
      <div className='bannersectionstyle' style={dynamicStyles.bannerSection}>
        <BannerSlider images={bannerImages} autoPlay={true} interval={4000} />
      </div>

      {/* Main Content */}
      <div style={dynamicStyles.container} data-products-section>
        
        {/* ==========================================
            ðŸ”½ OLD SEARCH AND FILTERS - COMMENTED OUT
            ========================================== */}
        
        <div style={dynamicStyles.searchSection}>
          <div style={dynamicStyles.searchContainer}>
            <div className='keralasellershomepagesearchwrapper' style={dynamicStyles.searchInputWrapper}>
              <Search size={20} className='keralasellershomepagesearchicon' style={dynamicStyles.searchIcon} />
              <input
                className='keralasellershomepagesearchsize'
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

         <div style={dynamicStyles.productsHeader}>
          <div style={dynamicStyles.headerLeft}>
            <h2 className='keralasellershomepagetitle' style={dynamicStyles.sectionTitle}>All Products</h2>
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
              className='keralasellershomepagefiltericoncontainer'
              onClick={() => setShowFilters(!showFilters)}
              style={dynamicStyles.filterToggle}
            >
              <Filter size={16} className='keralasellershomepagefiltericon' />
              Filters {showFilters ? 'â–²' : 'â–¼'}
            </button>
          </div>
        </div> 

         {error && (
          <div style={dynamicStyles.errorContainer}>
            <AlertCircle size={24} />
            <div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button onClick={handleRetry} style={dynamicStyles.retryButton}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {showFilters && (
          <div
            className="filter-sidebar-overlay"
            onClick={() => setShowFilters(false)}
          >
            <div
              className="filter-sidebar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="filter-header">
                <h3>Filters</h3>
                <button onClick={() => setShowFilters(false)} className="close-btn">âœ•</button>
              </div>

              <ProductFilters
                filters={{ ...filters, search: '' }}
                categories={categories}
                onFilterChange={(newFilters) => {
                  handleFilterChange({ ...newFilters, search: filters.search });
                }}
                productCount={filteredProducts.length}
                hideSearch={true}
              />
            </div>
          </div>
        )}

        {/* ==========================================
            ðŸ”½ OLD PRODUCTS GRID - COMMENTED OUT
            ========================================== */}


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
            {filteredProducts.length > 0 ? (
              <div
                className='products-container'
                style={{
                  justifyItems: "center",
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  maxWidth: '1200px',
                  margin: '0 auto',
                  padding: '10px 0',
                }}
              >
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    data-product-id={product.id}
                    style={{ flex: '1 0 210px', maxWidth: '220px' }}
                  >
                    
                    <ProductCard
                      id={product.id}
                      title={product.name || 'Product Name'}
                      price={product.price || 0}
                      mrp={product.mrp || null}
                      rating={product.average_rating || 0}
                      reviewCount={product.review_count || 0}
                      primaryImage={product.main_image_url || product.image_url}
                      thumbnailUrl={product.thumbnail_url}
                      largeImageUrl={product.large_image_url}
                      cloudinaryUrl={product.cloudinary_url}
                      subImages={product.sub_images}
                      hoverImage={
                        product.sub_images?.[0]?.image_url ||
                        product.images?.[1]?.url ||
                        product.main_image_url ||
                        product.image_url ||
                        "/placeholder.svg"
                      }
                      onlineStock={product.online_stock || 0}
                      storeName={
                        product.store?.name ||
                        product.seller_name ||
                        product.shop_name ||
                        'Store'
                      }
                      modelName={product.model_name || ''}
                      isWishlisted={product.isWishlisted || false}
                      isWishlistLoading={wishlistLoading.has(product.id)}
                      onAddToCart={(e) => handleAddToCart(e, product)}
                      onToggleWishlist={() => handleToggleWishlist(product.id)}
                      className={product.online_stock === 0 ? "out-of-stock" : ""}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={dynamicStyles.noProducts}>
                <Package size={48} color='#1a4845' />
                <h3 className='keralasellershomepagetitle'>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button
                  className='keralasellershomepagefiltericoncontainer'
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

            {isLoadingMore && (
              <div style={dynamicStyles.loadingIndicator}>
                <div style={dynamicStyles.spinner}></div>
                <span>Loading more products...</span>
              </div>
            )}
          </>
        )}
        {/* ==========================================
            âœ… NEW COMING SOON SECTION
            ========================================== */}


        {/* <div style={dynamicStyles.comingSoonContainer}>
          <div style={dynamicStyles.comingSoonContent}>
            <div style={dynamicStyles.iconWrapper}>
              <Package size={80} color='#1a4845' strokeWidth={1.5} />
            </div>

            <h1 style={dynamicStyles.comingSoonTitle}>
              Products Coming Soon!
            </h1>

            <p style={dynamicStyles.comingSoonSubtitle}>
              We're building Kerala's largest marketplace for local sellers.
              Be among the first to showcase your products to thousands of customers!
            </p>

            <div style={dynamicStyles.featuresGrid}>
              <div style={dynamicStyles.featureCard}>
                <div style={dynamicStyles.featureIcon}>ðŸª</div>
                <h3 style={dynamicStyles.featureTitle}>Zero Commission</h3>
                <p style={dynamicStyles.featureText}>Sell without any commission fees</p>
              </div>
              
              <div style={dynamicStyles.featureCard}>
                <div style={dynamicStyles.featureIcon}>ðŸš€</div>
                <h3 style={dynamicStyles.featureTitle}>Easy Setup</h3>
                <p style={dynamicStyles.featureText}>Start selling in just minutes</p>
              </div>
              
              <div style={dynamicStyles.featureCard}>
                <div style={dynamicStyles.featureIcon}>ðŸ’°</div>
                <h3 style={dynamicStyles.featureTitle}>Direct Payments</h3>
                <p style={dynamicStyles.featureText}>Get paid directly to your account</p>
              </div>
            </div>

            <div style={dynamicStyles.ctaContainer}>
              <Link href="/register/seller" style={{ textDecoration: 'none' }}>
                <button style={dynamicStyles.primaryButton}>
                  <span style={dynamicStyles.buttonIcon}>ðŸ›ï¸</span>
                  Start Your Own Shop
                </button>
              </Link>
              
              <Link href="/about" style={{ textDecoration: 'none' }}>
                <button style={dynamicStyles.secondaryButton}>
                  Learn More
                </button>
              </Link>
            </div>
            <div style={dynamicStyles.statsContainer}>
              <div style={dynamicStyles.statItem}>
                <div style={dynamicStyles.statNumber}>500+</div>
                <div style={dynamicStyles.statLabel}>Sellers Waiting</div>
              </div>
              <div style={dynamicStyles.statDivider}></div>
              <div style={dynamicStyles.statItem}>
                <div style={dynamicStyles.statNumber}>10,000+</div>
                <div style={dynamicStyles.statLabel}>Products Ready</div>
              </div>
              <div style={dynamicStyles.statDivider}></div>
              <div style={dynamicStyles.statItem}>
                <div style={dynamicStyles.statNumber}>₹0</div>
                <div style={dynamicStyles.statLabel}>Commission Fee</div>
              </div>
            </div>

            <div style={dynamicStyles.notifyContainer}>
              <p style={dynamicStyles.notifyText}>Get notified when we launch:</p>
              <div style={dynamicStyles.notifyInputWrapper}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  style={dynamicStyles.notifyInput}
                />
                <button style={dynamicStyles.notifyButton}>
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        </div> */}

      </div>

      <Footer />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes heartBeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .wishlist-heart {
          transition: all 0.2s ease;
        }

        .wishlist-heart:hover {
          transform: scale(1.1);
        }

        .wishlist-loading {
          animation: pulse 1s infinite;
        }

        /* Hover effects for buttons */
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26, 72, 69, 0.4) !important;
        }

        /* Feature card hover effect */
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
        }

        @media (max-width: 768px) {
          .stats-container {
            flex-direction: column;
          }
          
          .stat-divider {
            width: 80%;
            height: 2px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Static styles (enhanced for better product display)
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
    marginBottom: '20px',
    justifyContent: "center",
    display: "flex"
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0px 20px',
    animation: 'fadeIn 0.6s ease-out'
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
    color: '#1a4845',
    zIndex: 1
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 50px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: '#FDFFF0',
    color: '#1a4845',
    transition: 'border-color 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
    fontWeight: '700',
    color: '#1e293b'
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
    backgroundColor: '#1a4845',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s'
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginBottom: '20px',
    color: '#991b1b'
  },
  retryButton: {
    padding: '8px 16px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '8px'
  },
  loadingGrid: {
    display: 'grid',
  },
  skeletonWrapper: {
    borderRadius: '8px',
    overflow: 'hidden'
  },
  noProducts: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    color: '#6b7280'
  },
  clearFiltersButton: {
    padding: '10px 20px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  loadingIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px 20px',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f4f6',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  // âœ… NEW: Coming Soon Styles
  comingSoonContainer: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #FDFFF0 0%, #f0fdf4 100%)',
    borderRadius: '20px',
    marginTop: '30px',
  },
  comingSoonContent: {
    maxWidth: '900px',
    textAlign: 'center',
    animation: 'fadeIn 0.8s ease-out',
  },
  iconWrapper: {
    marginBottom: '24px',
    animation: 'float 3s ease-in-out infinite',
  },
  comingSoonTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: '800',
    color: '#1a4845',
    marginBottom: '16px',
    lineHeight: '1.2',
  },
  comingSoonSubtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    color: '#64748b',
    marginBottom: '48px',
    lineHeight: '1.6',
    maxWidth: '700px',
    margin: '0 auto 48px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  },
  featureCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '12px',
  },
  featureTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a4845',
    marginBottom: '8px',
  },
  featureText: {
    fontSize: '0.875rem',
    color: '#64748b',
    lineHeight: '1.5',
  },

  ctaContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '48px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #1a4845 0%, #2d7a6e 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(26, 72, 69, 0.3)',
  },
  buttonIcon: {
    fontSize: '1.5rem',
  },
  secondaryButton: {
    padding: '16px 32px',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1a4845',
    background: 'white',
    border: '2px solid #1a4845',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '32px',
    padding: '32px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  statItem: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1a4845',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500',
  },
  statDivider: {
    width: '2px',
    height: '40px',
    background: '#e5e7eb',
  },
  notifyContainer: {
    marginTop: '32px',
  },
  notifyText: {
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '12px',
    fontWeight: '500',
  },
  notifyInputWrapper: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '500px',
    margin: '0 auto',
  },
  notifyInput: {
    flex: '1',
    minWidth: '250px',
    padding: '12px 16px',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  notifyButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    background: '#1a4845',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    whiteSpace: 'nowrap',
  },
};

