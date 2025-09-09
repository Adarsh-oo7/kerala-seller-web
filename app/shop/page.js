'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  MapPin,
  Phone,
  Star,
  Store,
  AlertCircle,
  X,
  SlidersHorizontal
} from 'lucide-react';

// ✅ Enhanced environment variable handling
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  
  console.log('Shop API Environment check:', {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    resolved: envUrl || 'http://localhost:8000'
  });
  
  if (envUrl && envUrl !== 'undefined') {
    return envUrl;
  }
  
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();
const API_URL = `${API_BASE_URL}/user/store/shops/`;

console.log('Shop API URL configured:', API_URL);

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

export default function ShopPage() {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  const [showMobileSort, setShowMobileSort] = useState(false);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching shops from:', API_URL);
      const response = await axios.get(API_URL);
      
      let shopData = [];
      if (Array.isArray(response.data.results)) {
        shopData = response.data.results;
      } else if (Array.isArray(response.data)) {
        shopData = response.data;
      } else {
        console.warn('Unexpected shop API response structure:', response.data);
        shopData = [];
      }
      
      // ✅ DEBUG: Log shop data structure
      console.log('🔍 Shop data structure:', shopData.length > 0 ? shopData[0] : 'No data');
      console.log('🔍 Available fields:', shopData.length > 0 ? Object.keys(shopData[0]) : 'No data');
      
      setShops(shopData);
      setFilteredShops(shopData);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setError('Network error: Unable to connect to server. Make sure your backend is running.');
      } else {
        setError('Failed to load shops. Please try again.');
      }
      setShops([]);
      setFilteredShops([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let filtered = [...shops];

    if (searchTerm) {
      filtered = filtered.filter(shop =>
        shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'products':
          return (b.products_count || 0) - (a.products_count || 0);
        default:
          return 0;
      }
    });

    setFilteredShops(filtered);
  }, [shops, searchTerm, sortBy]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSortBy('name');
  };

  if (isLoading && shops.length === 0) {
    return (
      <div style={styles.pageContainer}>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading amazing shops for you...</p>
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
          <button onClick={fetchShops} style={styles.retryButton}>
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
      
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Discover Local Shops</h1>
          <p style={styles.heroSubtitle}>Shop from trusted sellers across Kerala</p>
          
          <div style={styles.searchContainer}>
            <div style={styles.searchBox}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={styles.clearSearchButton}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Mobile Toolbar */}
        <div style={styles.mobileToolbar}>
          <button
            onClick={() => setShowMobileSort(!showMobileSort)}
            style={styles.toolbarButton}
          >
            <SlidersHorizontal size={18} />
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
                { value: 'newest', label: 'Newest First' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'products', label: 'Most Products' }
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

        {/* Results Count */}
        <div style={styles.resultsHeader}>
          <span style={styles.resultsCount}>
            {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
          </span>
          {searchTerm && (
            <span style={styles.searchIndicator}>
              for "{searchTerm}"
            </span>
          )}
        </div>

        {/* ✅ ENHANCED: Mobile-optimized Grid with better field mapping */}
        {filteredShops.length > 0 ? (
          <div style={{
            ...styles.shopsContainer,
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 
                               isTablet ? 'repeat(3, 1fr)' : 
                               'repeat(4, 1fr)'
          }}>
            {filteredShops.map((shop, index) => {
              // ✅ Enhanced seller phone detection with multiple fallbacks
              const sellerPhone = shop.seller_phone || 
                                 shop.seller?.phone || 
                                 shop.phone ||
                                 shop.contact_phone ||
                                 shop.whatsapp_number;
              
              return (
                <div key={`shop-${shop.id}-${index}`} style={styles.shopCard}>
                  {/* ✅ Logo and basic info always shown */}
                  <div style={styles.logoContainer}>
                    <img 
                      src={
                        shop.logo_url || 
                        shop.logo || 
                        shop.image ||
                        'https://via.placeholder.com/80x80/3b82f6/ffffff?text=' + encodeURIComponent(shop.name?.charAt(0) || 'S')
                      }
                      alt={shop.name || 'Shop'} 
                      style={styles.shopLogo}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80/3b82f6/ffffff?text=' + 
                                      encodeURIComponent(shop.name?.charAt(0) || 'S');
                      }}
                      loading="lazy"
                    />
                  </div>
                  
                  <div style={styles.shopCardContent}>
                    <h3 style={styles.shopName}>{shop.name || 'Shop Name'}</h3>
                    
                    {shop.tagline && (
                      <p style={styles.shopTagline}>{shop.tagline}</p>
                    )}
                    
                    {shop.description && (
                      <p style={styles.shopDescription}>
                        {shop.description.length > 50 
                          ? shop.description.substring(0, 50) + '...' 
                          : shop.description}
                      </p>
                    )}

                    {/* Compact Shop Info */}
                    <div style={styles.shopInfoContainer}>
                      {(shop.seller_address || shop.seller?.address || shop.address) && (
                        <div style={styles.shopInfoItem}>
                          <MapPin size={12} />
                          <span>
                            {(() => {
                              const address = shop.seller_address || shop.seller?.address || shop.address;
                              return address.length > 20 
                                ? address.substring(0, 20) + '...' 
                                : address;
                            })()}
                          </span>
                        </div>
                      )}
                      
                      {(shop.products_count || shop.product_count) && (
                        <div style={styles.shopInfoItem}>
                          <Store size={12} />
                          <span>{shop.products_count || shop.product_count} Products</span>
                        </div>
                      )}

                      {shop.average_rating && shop.average_rating > 0 && (
                        <div style={styles.shopInfoItem}>
                          <Star size={12} fill="#ffc107" color="#ffc107" />
                          <span>{Number(shop.average_rating).toFixed(1)}</span>
                        </div>
                      )}

                      {sellerPhone && (
                        <div style={styles.shopInfoItem}>
                          <Phone size={12} />
                          <span>{sellerPhone.substring(0, 4)}****{sellerPhone.substring(8)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div style={styles.shopActions}>
                    {sellerPhone ? (
                      <Link href={`/shop/${sellerPhone}`} style={styles.linkButton}>
                        <button style={styles.viewShopButton}>
                          <Store size={14} />
                          <span>View Shop</span>
                        </button>
                      </Link>
                    ) : (
                      <button style={styles.disabledButton} disabled>
                        <AlertCircle size={14} />
                        <span>Contact Info Missing</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <Search size={48} />
            <h3>No shops found</h3>
            <p>
              {searchTerm 
                ? `No shops match "${searchTerm}". Try different search terms.`
                : "No shops available at the moment."}
            </p>
            <button onClick={clearAllFilters} style={styles.clearFiltersButton}>
              {searchTerm ? 'Clear Search' : 'Refresh'}
            </button>
          </div>
        )}
      </div>

      <Footer />

      {/* CSS Animations */}
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
      `}</style>
    </div>
  );
}

// ✅ ENHANCED: Improved styles with better mobile optimization
const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  
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
  
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px',
    textAlign: 'center',
    padding: '20px',
    color: '#ef4444'
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
  
  clearSearchButton: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px'
  },
  
  searchInput: {
    width: '100%',
    padding: '14px 48px 14px 44px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '12px',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    color: '#1e293b'
  },

  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '20px 16px',
    animation: 'fadeIn 0.6s ease-out'
  },

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

  mobileDropdown: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease-out'
  },
  
  dropdownContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: '16px 16px 0 0',
    padding: '20px',
    animation: 'slideUp 0.3s ease-out'
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

  resultsHeader: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  
  resultsCount: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },

  searchIndicator: {
    fontSize: '14px',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '500'
  },

  // ✅ Responsive grid that adapts to screen size
  shopsContainer: {
    display: 'grid',
    gap: '16px',
    marginBottom: '40px'
  },

  // ✅ Enhanced Mobile-Optimized Shop Card
  shopCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    animation: 'fadeIn 0.6s ease-out',
    border: '1px solid #e5e7eb',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
    }
  },

  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f8fafc'
  },

  // ✅ Perfect Round Shop Logo with better sizing
  shopLogo: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },

  shopCardContent: {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center'
  },

  shopName: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: '1.2'
  },

  shopTagline: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '500'
  },

  shopDescription: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.4',
    flex: 1
  },

  shopInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: 'auto'
  },

  shopInfoItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#64748b'
  },

  shopActions: {
    padding: '12px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f8fafc'
  },

  linkButton: {
    textDecoration: 'none',
    display: 'block'
  },

  viewShopButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },

  disabledButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'not-allowed'
  },

  emptyState: {
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
  }
};
