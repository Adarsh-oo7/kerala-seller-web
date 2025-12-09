'use client';
import { useCart } from '../../context/CartContext'; // Please adjust path correctly

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import "../../../styles/Keralasellerprofilewishlist.css";
import { toast } from "react-toastify";

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
    return 'process.env.NEXT_PUBLIC_API_BASE_URL';
  }
  return 'https://api.keralasellers.in';
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
  const { addToCart } = useCart();

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
      toast.error("Removed from wishlist");

    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      setError('Failed to remove item. Please try again.');
    } finally {
      setIsUpdating(prev => ({ ...prev, [productId]: null }));
    }
  };

  const handleAddToCart = (product) => {
    if (!product) return;

    if ((product.online_stock || 0) <= 0) {
      toast.error("Out of stock!");
      return;
    }

    addToCart(product.seller_phone, product, 1);
    toast.success("Added to cart!");
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
    <div style={styles.pagecontainer}>
      <Header />
      {/* Header */}
      {/* <header style={styles.header}>
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
      </header> */}

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
              <div style={styles.controlsRow}>
                {/* Left side — Sort */}
                <div style={styles.sortContainer}>
                  {/* <label style={styles.sortLabel}>Sort by:</label> */}
                  <select
                    className='keralasellersprofilewishlistsort'
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

                {/* Right side — Search */}
                <div style={styles.searchContainer}>
                  <Search size={18} style={styles.searchIcon} />
                  <input
                    className='keralasellersprofilewishlistsearch'
                    type="text"
                    placeholder="Search wishlist items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              </div>
            </div>


            {/* Wishlist Items */}
            <div className='profilewishlistgrid' style={viewMode === 'grid' ? styles.wishlistGrid : styles.wishlistList}>
              {filteredAndSortedItems.map((product) => {
                // 🧮 Calculate discount %
                const discount = calculateDiscount(product.price, product.mrp);

                // 🏷️ Stock conditions
                const isOutOfStock = (product.online_stock || 0) <= 0;

                // 🔄 UI loading states (for wishlist/cart updates)
                const isRemoving = isUpdating[product.id] === 'removing';
                const isAddingToCart = isUpdating[product.id] === 'adding_to_cart';

                // 🖼️ Safe image URL fallback
                const imageUrl =
                  product.main_image_url ||
                  product.image_url ||
                  product.image ||
                  getImageUrl(null);

                return (
                  <div
                    key={product.id}
                    className={`shop-product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                    style={styles.shopProductCard}
                    data-product-id={product.id}
                  >
                    {/* ✅ Image section */}
                    <div className="product-image-wrapper" style={styles.productImageWrapper}>
                      <img
                        src={imageUrl}
                        alt={product.name || 'Product'}
                        style={styles.productImageLink}
                        onError={(e) => handleImageError(e, product.name)}
                        onLoad={() =>
                          console.log('✅ Image loaded successfully for:', product.name)
                        }
                      />

                      {/* ⭐ Rating Overlay */}
                      <div style={styles.ratingOverlay}>
                        <div style={styles.ratingLeft}>
                          <Star
                            size={12}
                            fill={product.average_rating > 0 ? '#fbbf24' : 'none'}
                            color="#fbbf24"
                          />
                          <span style={styles.ratingLeftText}>
                            {product.average_rating > 0
                              ? `(${product.average_rating.toFixed(1)})`
                              : ''}
                          </span>
                        </div>

                        {product.review_count > 0 ? (
                          <span style={styles.ratingRight}>
                            {product.review_count} reviews
                          </span>
                        ) : (
                          <span style={styles.ratingRight}>No reviews</span>
                        )}
                      </div>

                      {/* 🏷️ Product badges */}
                      <div className="product-badges" style={styles.productBadges}>
                        {discount > 0 && (
                          <span className="badge discount" style={styles.badgeDiscount}>
                            {discount}% OFF
                          </span>
                        )}
                        {(product.online_stock || 0) <= 5 && (product.online_stock || 0) > 0 && (
                          <span className="badge low-stock" style={styles.badgeLowStock}>
                            Only {product.online_stock} left
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="badge out-of-stock" style={styles.badgeOutOfStock}>
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* ❤️ Quick Actions */}
                      <div className="quick-actions" style={styles.quickActions}>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          style={{
                            ...styles.removeButton,
                            opacity: isRemoving ? 0.5 : 1,
                            pointerEvents: isRemoving ? 'none' : 'auto',
                          }}
                          disabled={isRemoving}
                          title="Remove from wishlist"
                        >
                          {isRemoving ? (
                            <span style={{ fontSize: 12 }}>Removing...</span>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 🧾 Product info */}
                    <div className="product-info" style={styles.productInfo}>
                      <div className="product-header" style={{ ...styles.productHeader, minWidth: 0 }}>
                        <h3
                          className="product-name"
                          style={{
                            ...styles.productName,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            width: '100%',
                          }}
                          title={`${product.name || ''}${product.model_name ? ` (${product.model_name})` : ''}`}
                        >
                          {product.name || 'Unnamed Product'}
                          {product.model_name && (
                            <span
                              className="wishlistproduct-model"
                              style={{
                                ...styles.productModel,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {' '}
                              ({product.model_name})
                            </span>
                          )}
                        </h3>
                      </div>

                      {/* 💰 Pricing */}
                      <div className="product-pricing" style={styles.productPricing}>
                        <div className="price-section" style={styles.priceSection}>
                          <span className="current-price" style={styles.currentPrice}>
                            {formatPrice(product.price)}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="original-price" style={styles.originalPrice}>
                              {formatPrice(product.mrp)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 🛒 Add to Cart Button */}
                      <button
                        className="shopslugprofilewishlistaddtocartbtn"
                        onClick={() => handleAddToCart(product)}
                        style={{
                          ...styles.addToCartButton,
                          opacity: isAddingToCart ? 0.6 : 1,
                        }}
                        disabled={isOutOfStock || isAddingToCart}
                      >
                        {isAddingToCart ? (
                          <span style={{ fontSize: 12 }}>Adding...</span>
                        ) : (
                          <>
                            <ShoppingCart size={16} />
                            Add to Cart
                          </>
                        )}
                      </button>

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

      <Footer />

    </div>
  );
}

// Keep all your existing styles but add responsive grid class
const styles = {
  pagecontainer: { backgroundColor: "#FDFFF0" },
  container: { minHeight: '100vh', backgroundColor: '#FDFFF0', padding: '40px 20px 20px', maxWidth: '1200px', margin: '0 auto', },

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
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },


  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between', // ✅ puts sort left, search right
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap', // ✅ keeps it responsive
  },

  searchContainer: {
    position: 'relative',
    width: '250px',           // ✅ fixed width for desktop
    maxWidth: '100%',         // ✅ responsive on mobile
  },

  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#1a4845',
    zIndex: 1,
  },

  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#1a4845',
    outline: 'none',
    backgroundColor: '#FDFFF0',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },


  sortContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  sortLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a4845'
  },

  sortSelect: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#FDFFF0',
    color: '#1a4845'
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '16px',
    justifyContent: 'center',      // ✅ centers cards
    justifyItems: 'center',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',              // ✅ centers the grid itself
    padding: '10px 0', // ✅ equal side padding responsive
    boxSizing: 'border-box',
  },

  wishlistCard: {
    backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s',
    border: '1px solid #e5e7eb'
  },
  productImage: { position: 'relative', height: '200px', overflow: 'hidden' },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: '#f3f4f6', // ✅ ADDED: Background color while loading
    transition: 'opacity 0.3s ease' // ✅ ADDED: Smooth transition
  },
  removeButton: {
    position: 'absolute', top: '12px', right: '12px',
    backgroundColor: 'rgba(255,255,255,0.95)', border: 'none',
    borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s'
  },
  productInfo: { padding: '16px' },

  productPrice: {
    fontSize: '18px', fontWeight: '700', color: '#059669',
    margin: '0 0 8px 0'
  },
  productDescription: {
    fontSize: '14px', color: '#6b7280', margin: '0', lineHeight: '1.4',
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  productActions: {
    padding: '16px', borderTop: '1px solid #f3f4f6',
    display: 'flex', gap: '8px'
  },
  addToCartButton: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', backgroundColor: '#10b981', color: 'white', border: 'none',
    borderRadius: '6px', padding: '10px 12px', cursor: 'pointer', fontSize: '14px',
    fontWeight: '500', transition: 'all 0.2s', width: "100%",
  },
  viewButton: {
    backgroundColor: '#f3f4f6', color: '#374151', border: 'none',
    borderRadius: '6px', padding: '10px 12px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
  },
  shopProductCard: {
    width: "100%",
    maxWidth: "210px",
    border: "1px solid #eee",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    position: "relative"
  },

  productLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
  },

  productImageWrapper: {
    width: "100%",
    height: "185px",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  productImageLink: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s ease",
  },

  productImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },



  productBadges: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 2
  },




  badgeDiscount: {
    padding: '4px 8px',
    background: 'rgba(40, 167, 69, 0.9)',
    color: 'white',
    fontSize: '10px',
    borderRadius: '6px',
    fontWeight: '600',
    backdropFilter: 'blur(4px)',
  },

  badgeLowStock: {
    padding: '4px 8px',
    backgroundColor: '#be1e237a',
    color: 'white',
    fontSize: '10px',
    borderRadius: '6px',
    fontWeight: '600'
  },

  badgeOutOfStock: {
    padding: '4px 8px',
    backgroundColor: '#6b7280',
    color: 'white',
    fontSize: '0.75rem',
    borderRadius: '4px',
    fontWeight: '600'
  },

  quickActions: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: 10,
  },

  quickActionBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#059669',
    transition: 'all 0.2s',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'relative'
  },

  quickActionBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    boxShadow: '0 2px 12px rgba(239, 68, 68, 0.25)'
  },

  quickActionBtnLoading: {
    cursor: 'not-allowed',
    opacity: 0.7,
    pointerEvents: 'none'
  },

  productInfo: {
    padding: '10px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },


  storeName: {
    fontSize: '0.8rem',
    color: '#059669',
    fontWeight: '500',
    marginBottom: '8px'
  },

  productHeader: {
    marginBottom: '8px',
    flex: 1
  },

  productName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a4845',
    margin: '0',
    lineHeight: '1.3',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },


  productModel: {
    fontSize: '0.85rem',
    fontWeight: '400',
    color: '#6b7280',
    marginLeft: '4px',
    whiteSpace: "nowrap",       // force one line
    overflow: "hidden",         // cut extra text
    textOverflow: "ellipsis",   // add "..."
    maxWidth: "120px",          // width decides how much text is visible
    display: "inline-block",    // required for ellipsis
    verticalAlign: "middle"
  },

  productRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },

  ratingStars: {
    display: 'flex',
    alignItems: 'center',
    gap: '1px'
  },

  ratingNumber: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1f2937'
  },

  reviewCountText: {
    fontSize: '0.8rem',
    color: '#6b7280'
  },

  productPricing: {
    marginBottom: '8px'
  },

  priceSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'nowrap',
  },

  currentPrice: {
    fontWeight: '600',
    color: '#059669'
  },

  originalPrice: {
    fontSize: '0.9rem',
    color: 'rgb(156, 163, 175)',
    textDecoration: 'line-through'
  },

  wishlistIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
    color: '#ef4444',
    fontWeight: '500',
    marginBottom: '8px',
    padding: '4px 6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '12px',
    width: 'fit-content'
  },

  productActions: {
    padding: '16px',
    borderTop: '1px solid #f3f4f6'
  },

  addToCartBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '7px 42px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },



  // ✅ Rating overlay (existing) - on image
  ratingOverlay: {
    position: "absolute",
    bottom: "0px",
    left: "0",
    width: "100%",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    padding: "13px 12px",
    boxSizing: "border-box",
    zIndex: 2,
  },

  ratingLeft: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  ratingLeftText: {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "white",
  },

  ratingRight: {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "white",
    marginLeft: "auto",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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

