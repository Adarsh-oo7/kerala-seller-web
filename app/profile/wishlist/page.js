'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  Heart, 
  ArrowLeft, 
  Trash2, 
  ShoppingCart, 
  Star,
  RefreshCw,
  AlertCircle,
  Package,
  Filter,
  Search,
  Grid,
  List
} from 'lucide-react';

// ✅ Enhanced API base URL function
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  return 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const WISHLIST_API = `${API_BASE_URL}/api/wishlist/`;
const CART_API = `${API_BASE_URL}/api/cart/add/`;

console.log('🔍 Wishlist API URLs:', { API_BASE_URL, WISHLIST_API, CART_API });

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [isUpdating, setIsUpdating] = useState({});
  const router = useRouter();

  // ✅ FIXED: Better token detection
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('buyerAccessToken') ||
                  localStorage.getItem('buyerToken') ||
                  localStorage.getItem('accessToken');
                  
    console.log('🔍 Auth token found:', !!token);
    
    if (!token) {
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  }, []);

  // ✅ FIXED: Proper image URL construction
  const getImageUrl = useCallback((imageUrl) => {
    if (!imageUrl) {
      return 'https://via.placeholder.com/300x300/e9ecef/6c757d?text=No+Image';
    }

    // If it's already a full URL, use it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If it's a relative URL starting with /media/ or /static/
    if (imageUrl.startsWith('/media/') || imageUrl.startsWith('/static/')) {
      const fullUrl = `${API_BASE_URL}${imageUrl}`;
      console.log('🖼️ Constructed image URL:', fullUrl);
      return fullUrl;
    }

    // If it's any other relative path
    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }

    // Fallback - assume it needs the base URL
    return `${API_BASE_URL}/${imageUrl}`;
  }, []);

  const loadWishlistFromAPI = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      console.log('❌ No auth headers, loading from localStorage');
      loadWishlistFromLocalStorage();
      return;
    }

    try {
      console.log('🔍 Loading wishlist from API:', WISHLIST_API);
      const response = await axios.get(WISHLIST_API, { headers });
      
      const wishlistData = response.data;
      console.log('✅ Wishlist API response:', wishlistData);
      
      let items = [];
      
      // ✅ ENHANCED: Better data extraction
      if (wishlistData && wishlistData.items && Array.isArray(wishlistData.items)) {
        items = wishlistData.items.map(item => {
          const product = item.product || item;
          return {
            ...product,
            // ✅ FIXED: Ensure proper image URL construction
            main_image_url: getImageUrl(product.main_image_url || product.image_url || product.image),
            image_url: getImageUrl(product.image_url || product.main_image_url || product.image)
          };
        });
      } else if (Array.isArray(wishlistData)) {
        items = wishlistData.map(item => ({
          ...item,
          main_image_url: getImageUrl(item.main_image_url || item.image_url || item.image),
          image_url: getImageUrl(item.image_url || item.main_image_url || item.image)
        }));
      } else if (wishlistData.results && Array.isArray(wishlistData.results)) {
        items = wishlistData.results.map(item => {
          const product = item.product || item;
          return {
            ...product,
            main_image_url: getImageUrl(product.main_image_url || product.image_url || product.image),
            image_url: getImageUrl(product.image_url || product.main_image_url || product.image)
          };
        });
      }
      
      console.log('✅ Processed wishlist items:', items.length, items);
      setWishlistItems(items);
      
      // Sync with localStorage
      localStorage.setItem('wishlist', JSON.stringify(items));
      
    } catch (error) {
      console.error('❌ API wishlist failed:', error);
      if (error.response?.status === 401) {
        console.log('🔐 Authentication failed, clearing tokens');
        ['access_token', 'buyerAccessToken', 'buyerToken', 'accessToken'].forEach(key => {
          localStorage.removeItem(key);
        });
      }
      loadWishlistFromLocalStorage();
    }
  }, [getAuthHeaders, getImageUrl]);

  const loadWishlistFromLocalStorage = () => {
    try {
      console.log('🔍 Loading wishlist from localStorage');
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        const items = Array.isArray(parsedWishlist) ? parsedWishlist : [];
        
        // ✅ FIXED: Ensure image URLs are properly constructed even from localStorage
        const itemsWithImages = items.map(item => ({
          ...item,
          main_image_url: getImageUrl(item.main_image_url || item.image_url || item.image),
          image_url: getImageUrl(item.image_url || item.main_image_url || item.image)
        }));
        
        setWishlistItems(itemsWithImages);
        console.log('✅ Loaded from localStorage:', itemsWithImages.length, 'items');
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('❌ Error loading wishlist from localStorage:', error);
      setWishlistItems([]);
    }
  };

  const loadWishlist = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await loadWishlistFromAPI();
    } catch (error) {
      console.error('❌ Error loading wishlist:', error);
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [loadWishlistFromAPI]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // ✅ ENHANCED: Better removal with API integration
  const removeFromWishlist = async (productId) => {
    setIsUpdating(prev => ({ ...prev, [productId]: 'removing' }));
    
    try {
      const headers = getAuthHeaders();
      
      if (headers) {
        try {
          console.log('🗑️ Removing from API wishlist:', productId);
          
          // Try different API endpoints for removal
          try {
            await axios.post(`${API_BASE_URL}/api/wishlist/toggle_product/`, {
              product_id: productId
            }, { headers });
            console.log('✅ Removed via toggle API');
          } catch (toggleError) {
            // Fallback to direct removal
            await axios.delete(`${WISHLIST_API}remove_product/`, {
              headers,
              data: { product_id: productId }
            });
            console.log('✅ Removed via remove_product API');
          }
        } catch (apiError) {
          console.warn('⚠️ API removal failed, continuing with local removal:', apiError);
        }
      }
      
      // Update local state and localStorage
      const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
      setWishlistItems(updatedWishlist);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      console.log('✅ Item removed from wishlist');
      
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      setError('Failed to remove item. Please try again.');
    } finally {
      setIsUpdating(prev => ({ ...prev, [productId]: null }));
    }
  };

  const addToCart = async (product) => {
    if (product.online_stock <= 0) return;
    
    setIsUpdating(prev => ({ ...prev, [product.id]: 'adding_to_cart' }));
    
    try {
      const headers = getAuthHeaders();
      
      if (headers) {
        try {
          console.log('🛒 Adding to cart via API:', product.id);
          await axios.post(CART_API, {
            product_id: product.id,
            quantity: 1
          }, { headers });
          
          alert('Added to cart successfully!');
          console.log('✅ Added to cart via API');
        } catch (apiError) {
          console.warn('⚠️ API add to cart failed:', apiError);
          alert('Added to cart locally. Please login to sync with server.');
        }
      } else {
        // Handle cart without authentication (local storage)
        console.log('🛒 Adding to local cart:', product.id);
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cartItems.find(item => item.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cartItems.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cartItems));
        alert('Added to cart successfully!');
      }
      
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      setError('Failed to add to cart. Please try again.');
    } finally {
      setIsUpdating(prev => ({ ...prev, [product.id]: null }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (price, mrp) => {
    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  // Filter and sort wishlist items
  const filteredAndSortedItems = wishlistItems
    .filter(item => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(query) ||
        item.model_name?.toLowerCase().includes(query) ||
        item.store?.name?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        default: // newest
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <button onClick={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} />
            <span style={styles.backText}>Back</span>
          </button>
          <div style={styles.titleSection}>
            <h1 style={styles.headerTitle}>
              <Heart size={24} />
              My Wishlist
            </h1>
          </div>
          <div style={styles.headerActions}>
            <button onClick={loadWishlist} style={styles.refreshButton}>
              <RefreshCw size={18} />
            </button>
            <div style={styles.wishlistCount}>
              {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
      </header>

      <div style={styles.container}>
        {/* Error Message */}
        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError('')} style={styles.closeAlert}>
              ×
            </button>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div style={styles.emptyState}>
            <Heart size={64} style={styles.emptyIcon} />
            <h2 style={styles.emptyTitle}>Your wishlist is empty</h2>
            <p style={styles.emptyDesc}>
              Save products you love to your wishlist and never lose track of them
            </p>
            <div style={styles.emptyActions}>
              <Link href="/" style={styles.browseButton}>
                <Package size={18} />
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div style={styles.controlsSection}>
              <div style={styles.searchContainer}>
                <Search size={18} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search wishlist items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              
              <div style={styles.controlsRow}>
                <div style={styles.sortContainer}>
                  <label style={styles.sortLabel}>Sort by:</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    style={styles.sortSelect}
                  >
                    <option value="newest">Recently Added</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="price_low">Price (Low to High)</option>
                    <option value="price_high">Price (High to Low)</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
                
                <div style={styles.viewToggle}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      ...styles.viewButton,
                      ...(viewMode === 'grid' ? styles.activeViewButton : {})
                    }}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      ...styles.viewButton,
                      ...(viewMode === 'list' ? styles.activeViewButton : {})
                    }}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Wishlist Items */}
            <div style={viewMode === 'grid' ? styles.wishlistGrid : styles.wishlistList}>
              {filteredAndSortedItems.map((product) => {
                const discount = calculateDiscount(product.price, product.mrp);
                const isOutOfStock = (product.online_stock || 0) <= 0;
                const isRemoving = isUpdating[product.id] === 'removing';
                const isAddingToCart = isUpdating[product.id] === 'adding_to_cart';

                // ✅ FIXED: Better image URL handling
                const imageUrl = product.main_image_url || 
                                product.image_url || 
                                product.image || 
                                getImageUrl(null);

                console.log('🖼️ Product image URL for', product.name, ':', imageUrl);

                return (
                  <div 
                    key={product.id} 
                    style={{
                      ...styles.wishlistItem,
                      ...(viewMode === 'list' ? styles.listItem : {}),
                      ...(isRemoving ? styles.itemRemoving : {})
                    }}
                  >
                    <Link href={`/product/${product.id}`} style={styles.productLink}>
                      <div style={styles.imageContainer}>
                        <img 
                          src={imageUrl}
                          alt={product.name || 'Product'}
                          style={styles.productImage}
                          onLoad={() => console.log('✅ Image loaded:', imageUrl)}
                          onError={(e) => {
                            console.warn('❌ Image failed to load:', imageUrl);
                            e.target.src = 'https://via.placeholder.com/300x300/e9ecef/6c757d?text=No+Image';
                          }}
                        />
                        {isOutOfStock && (
                          <div style={styles.outOfStockBadge}>Out of Stock</div>
                        )}
                        {discount > 0 && (
                          <div style={styles.discountBadge}>{discount}% OFF</div>
                        )}
                      </div>
                    </Link>
                    
                    <div style={styles.productInfo}>
                      <Link href={`/product/${product.id}`} style={styles.productLink}>
                        <h3 style={styles.productName}>{product.name}</h3>
                        {product.model_name && (
                          <p style={styles.modelName}>{product.model_name}</p>
                        )}
                        
                        <div style={styles.priceRow}>
                          <span style={styles.currentPrice}>{formatPrice(product.price)}</span>
                          {product.mrp && product.mrp > product.price && (
                            <span style={styles.originalPrice}>{formatPrice(product.mrp)}</span>
                          )}
                        </div>

                        {product.average_rating && (
                          <div style={styles.ratingRow}>
                            <Star size={14} fill="#ffc107" color="#ffc107" />
                            <span style={styles.rating}>
                              {Number(product.average_rating).toFixed(1)} ({product.review_count || 0} reviews)
                            </span>
                          </div>
                        )}
                        
                        {product.store?.name && (
                          <p style={styles.storeName}>by {product.store.name}</p>
                        )}

                        {product.online_stock > 0 && product.online_stock <= 5 && (
                          <p style={styles.lowStock}>Only {product.online_stock} left!</p>
                        )}
                      </Link>

                      <div style={styles.actions}>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          style={styles.removeButton}
                          title="Remove from wishlist"
                          disabled={isRemoving}
                        >
                          {isRemoving ? (
                            <div style={styles.smallSpinner}></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                          <span>Remove</span>
                        </button>
                        
                        {!isOutOfStock && (
                          <button 
                            onClick={() => addToCart(product)}
                            style={styles.addToCartButton}
                            disabled={isAddingToCart}
                          >
                            {isAddingToCart ? (
                              <>
                                <div style={styles.smallSpinner}></div>
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={16} />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Results Summary */}
            {searchQuery && (
              <div style={styles.resultsSummary}>
                <p>
                  {filteredAndSortedItems.length === 0 
                    ? `No items found for "${searchQuery}"`
                    : `Showing ${filteredAndSortedItems.length} of ${wishlistItems.length} items`
                  }
                </p>
              </div>
            )}
          </>
        )}
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
        
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0.5; transform: translateX(-10px); }
        }
        
        /* Responsive grid styles */
        @media (max-width: 640px) {
          .wishlist-grid {
            grid-template-columns: repeat(1, 1fr) !important;
          }
        }
        
        @media (min-width: 641px) and (max-width: 768px) {
          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .wishlist-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        @media (min-width: 1025px) {
          .wishlist-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

// Keep all your existing styles but add responsive grid class
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
    minHeight: '100vh',
    gap: '20px'
  },
  
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #ef4444',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  smallSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Header
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  
  backText: {
    display: 'none',
    '@media (min-width: 640px)': {
      display: 'inline'
    }
  },
  
  titleSection: {
    flex: 1,
    textAlign: 'center'
  },
  
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  
  wishlistCount: {
    fontSize: '14px',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: '600'
  },

  // Container
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px'
  },

  // Error Alert
  errorAlert: {
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
  
  closeAlert: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px 8px'
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    maxWidth: '500px',
    margin: '0 auto'
  },
  
  emptyIcon: {
    color: '#fecaca',
    marginBottom: '24px'
  },
  
  emptyTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '12px'
  },
  
  emptyDesc: {
    color: '#6b7280',
    marginBottom: '32px',
    lineHeight: '1.6',
    fontSize: '16px'
  },
  
  emptyActions: {
    display: 'flex',
    justifyContent: 'center'
  },
  
  browseButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.2s'
  },

  // Controls Section
  controlsSection: {
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  
  searchContainer: {
    position: 'relative',
    marginBottom: '16px'
  },
  
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    zIndex: 1
  },
  
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  
  sortContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  sortLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  
  sortSelect: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    color: '#374151'
  },
  
  viewToggle: {
    display: 'flex',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    padding: '2px'
  },
  
  viewButton: {
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  
  activeViewButton: {
    backgroundColor: 'white',
    color: '#3b82f6',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },

  // ✅ FIXED: Responsive Wishlist Grid
  wishlistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    className: 'wishlist-grid'
  },
  
  wishlistList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  // Wishlist Items
  wishlistItem: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    animation: 'fadeIn 0.6s ease-out'
  },
  
  listItem: {
    display: 'flex',
    alignItems: 'stretch'
  },
  
  itemRemoving: {
    animation: 'slideOut 0.3s ease-out',
    opacity: 0.5
  },

  productLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
  },

  imageContainer: {
    position: 'relative',
    aspectRatio: '1',
    overflow: 'hidden',
    minWidth: '150px'
  },

  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    backgroundColor: '#f3f4f6' // Fallback background while loading
  },

  outOfStockBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  
  discountBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },

  productInfo: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },

  productName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },

  modelName: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },

  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '8px'
  },

  currentPrice: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#059669'
  },

  originalPrice: {
    fontSize: '14px',
    color: '#6b7280',
    textDecoration: 'line-through'
  },

  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  },

  rating: {
    fontSize: '14px',
    color: '#6b7280'
  },

  storeName: {
    fontSize: '14px',
    color: '#059669',
    margin: 0,
    fontWeight: '500'
  },
  
  lowStock: {
    fontSize: '12px',
    color: '#f59e0b',
    margin: 0,
    fontWeight: '600'
  },

  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '12px'
  },

  removeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 1
  },

  addToCartButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: 2
  },

  // Results Summary
  resultsSummary: {
    textAlign: 'center',
    marginTop: '32px',
    padding: '16px',
    color: '#6b7280',
    fontSize: '14px'
  }
};
