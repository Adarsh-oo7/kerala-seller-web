'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import FilterBar from "../../components/common/FilterBar"
import ProductCard from "../../components/common/ProductCard"

import TopCategory from "../../components/home/TopCategory";



const API_URL = 'http://localhost:8000/user/store/products/';

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
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(API_URL);
      
      let productData = [];
      if (Array.isArray(response.data.results)) {
        productData = response.data.results;
      } else if (Array.isArray(response.data)) {
        productData = response.data;
      } else {
        productData = [];
      }
      
      setProducts(productData);
      setFilteredProducts(productData);
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
    const handler = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, fetchProducts]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.online_stock <= 0) {
      alert('This product is out of stock');
      return;
    }
    
    if (product.store && product.store.seller_phone) {
      addToCart(product.store.seller_phone, product);
    } else {
      alert("Could not add to cart: seller information missing.");
    }
  };

  const formatPrice = (price) => {
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
    <div style={{backgroundColor:'#FDFFF0'}}> 
      <Header />
      <div style={{ width: "100%", margin: 0, padding: 0, marginTop: "20px", marginBottom: '20px' }}>
        <TopCategory />
      </div>
      <div style={styles.container}>
        <h1 className='section-title'>Discover Everything</h1>
        <p className='section-subtitle'>Discover unique items from sellers across Kerala</p>

      <div style={styles.container}>
        {/* Mobile Toolbar */}
        <div style={styles.mobileToolbar}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={styles.toolbarButton}
          >
            {/* <SlidersHorizontal size={18} /> */}
            <span>Filters</span>
          </button>
          
          <button
            onClick={() => setShowMobileSort(!showMobileSort)}
            style={styles.toolbarButton}
          >
            {/* <Filter size={18} /> */}
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
              {/* <Grid size={16} /> */}
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                ...styles.viewButton,
                ...(viewMode === 'list' ? styles.activeView : {})
              }}
            >
              {/* <List size={16} /> */}
            </button>
          </div>
        </div>

        <FilterBar />
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.name}
              price={product.price}
              primaryImage={product.image_url || "/placeholder.svg"}
              hoverImage={product.hover_image_url || product.image_url || "/placeholder.svg"}
              rating={product.rating || 4.5}
              isWishlisted={product.isWishlisted}
              onAddToCart={(e) => handleAddToCart(e, product)}
              onToggleWishlist={() => handleToggleWishlist?.(product)}
              className={product.online_stock === 0 ? "out-of-stock" : ""}
            >
              {/* 👇 You can wrap inside link if you prefer entire card clickable */}
              <Link href={`/product/${product.id}`} className="card-link-overlay" />
            </ProductCard>
          ))}
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
                        {/* <MapPin size={12} /> */}
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
                      ...(product.online_stock === 0 ? styles.mobileDisabledButton : {})
                    }}
                    disabled={product.online_stock === 0}
                  >
                    {/* <ShoppingCart size={14} /> */}
                    <span>{product.online_stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
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

      {/* CSS Animations & Media Queries */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .card:hover {
            transform: none;
          }
          
          .card:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  title: { textAlign: 'center', fontSize: '2.5rem' },
  subtitle: { textAlign: 'center', color: '#6c757d', marginBottom: '2rem' },
  searchContainer: { margin: '2rem auto 2rem auto', maxWidth: '600px' },
  searchInput: { width: '100%', padding: '12px', fontSize: '1rem',color:'#6c757d', border: '1px solid #6c757d', borderRadius: '30px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
  card: { border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  cardLink: { textDecoration: 'none', color: 'inherit' },
  image: { width: '100%', height: '200px', objectFit: 'cover' },
  cardContent: { padding: '15px', flexGrow: 1 },
  productName: { margin: '0 0 10px 0', fontSize: '1.1rem' },
  productPrice: { margin: 0, fontSize: '1.2rem', fontWeight: 'bold' },
  cardActions: { padding: '0 15px 15px 15px' },
  addToCartButton: { width: '100%', padding: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '500' },
};
