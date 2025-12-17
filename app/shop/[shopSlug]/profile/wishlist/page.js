'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Plus, Store, AlertTriangle, Star, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import "../../../../../styles/ShopProfileWishlist.css";
import SHeader from '../../../../../components/common/SHeader';
import { toast } from "react-toastify";
import ShopFooter from '../../../../../components/common/ShopFooter';


const API_BASE_URL = 'https://api.keralasellers.in' || 'https://api.keralasellers.in';

export default function ShopWishlistPage() {
  const { shopSlug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [urlError, setUrlError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ ADD: Login state for SHeader


  // ✅ ADD: Check login status for SHeader
  useEffect(() => {
    try {
      const token = localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.warn('localStorage access error:', error);
      setIsLoggedIn(false);
    }
  }, []);

  // ✅ FIXED: Enhanced image URL builder
  const buildImageUrl = (imagePath) => {
    if (!imagePath) {
      console.log('🖼️ No image path provided, using placeholder');
      return '/placeholder.svg';
    }

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('🖼️ Using full URL:', imagePath);
      return imagePath;
    }

    // If it starts with a slash, it's already a proper path
    if (imagePath.startsWith('/')) {
      const fullUrl = `${API_BASE_URL}${imagePath}`;
      console.log('🖼️ Built image URL from path:', fullUrl);
      return fullUrl;
    }

    // If it doesn't start with slash, add one
    const fullUrl = `${API_BASE_URL}/${imagePath}`;
    console.log('🖼️ Built image URL with added slash:', fullUrl);
    return fullUrl;
  };

  // ✅ CRITICAL FIX: Get the actual store ID from query parameter or shopSlug
  const getActualStoreId = () => {
    console.log('🔍 Getting store ID for wishlist...');
    console.log('- shopSlug from params:', shopSlug);
    console.log('- id from search params:', searchParams.get('id'));

    // Check for undefined values
    if (shopSlug === 'undefined' || shopSlug === undefined) {
      setUrlError('Invalid shop slug in URL');
      return null;
    }

    // Get store ID from query parameter or slug
    const queryId = searchParams.get('id');
    if (queryId && queryId !== 'undefined' && queryId.trim() !== '') {
      return queryId.trim();
    }

    if (shopSlug && shopSlug !== 'new' && shopSlug !== 'undefined') {
      return shopSlug;
    }

    setUrlError('No valid store ID found');
    return null;
  };

  const actualStoreId = getActualStoreId();

  console.log('❤️ Wishlist store ID:', actualStoreId);

  // ✅ ENHANCED: URL generation with validation
  const getShopUrl = (path = '') => {
    if (!actualStoreId) {
      console.error('❌ Cannot generate URL - no store ID available');
      return '/';
    }

    if (searchParams.get('id') && shopSlug === 'new') {
      // Pattern: /shop/new/path?id=123
      const basePath = `/shop/new${path}`;
      return `${basePath}?id=${actualStoreId}`;
    } else {
      // Pattern: /shop/123/path
      return `/shop/${actualStoreId}${path}`;
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');
    if (!token) {
      const loginUrl = getShopUrl('/login');
      const currentUrl = getShopUrl('/profile/wishlist');
      const redirectUrl = `${loginUrl}?redirect=${encodeURIComponent(currentUrl)}`;
      console.log('🔐 No token, redirecting to login:', redirectUrl);
      router.push(redirectUrl);
      return null;
    }
    return { 'Authorization': `Bearer ${token}` };
  };

  // ✅ REDIRECT: If we have an invalid URL, redirect appropriately
  useEffect(() => {
    if (urlError || !actualStoreId) {
      console.log('🔍 Invalid wishlist URL, redirecting...');
      router.replace('/profile'); // Redirect to global profile
      return;
    }
  }, [urlError, actualStoreId, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!actualStoreId) return;

      const headers = checkAuth();
      if (!headers) return;

      console.log('❤️ Loading wishlist for store:', actualStoreId);

      try {
        // ✅ ENHANCED: Use store_id parameter for better filtering
        const [wishlistRes, storeRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/wishlist/?store_id=${actualStoreId}`, { headers }),
          fetch(`${API_BASE_URL}/shop/${actualStoreId}/`)
        ]);

        if (wishlistRes.status === 'fulfilled' && wishlistRes.value.ok) {
          const wishlistData = await wishlistRes.value.json();
          const wishlistItems = Array.isArray(wishlistData) ? wishlistData :
            wishlistData.results || wishlistData.items || [];

          // ✅ FIXED: Process wishlist items to ensure proper image URLs
          const processedWishlist = wishlistItems.map(item => {
            const product = item.product || item;
            const imageUrl = product?.main_image_url || product?.image_url || product?.main_image || item?.main_image_url;

            return {
              ...item,
              processedImageUrl: buildImageUrl(imageUrl),
              product: {
                ...product,
                processedImageUrl: buildImageUrl(imageUrl)
              }
            };
          });

          setWishlist(processedWishlist);
          console.log('✅ Wishlist loaded and processed:', processedWishlist.length, 'items');
        } else {
          console.warn('⚠️ Wishlist API failed');
          setWishlist([]);
        }

        if (storeRes.status === 'fulfilled' && storeRes.value.ok) {
          const storeResData = await storeRes.value.json();
          setStoreData(storeResData.store || storeResData);
          console.log('✅ Store data loaded for wishlist');
        } else {
          console.warn('⚠️ Store API failed, using fallback');
          setStoreData({
            name: `Store ${actualStoreId}`,
            seller_phone: actualStoreId,
            id: actualStoreId
          });
        }
      } catch (error) {
        console.error('❌ Failed to fetch wishlist:', error);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    if (actualStoreId && !urlError) {
      fetchData();
    }
  }, [actualStoreId]);

  const removeFromWishlist = async (productId) => {
    const headers = checkAuth();
    if (!headers) return;

    console.log('🗑️ Removing from wishlist:', productId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/${productId}/`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.id !== productId));
        console.log('✅ Item removed from wishlist');
        toast.success('Item removed from wishlist', {
          position: 'top-right',
          autoClose: 3000,      // stays until user dismisses
          closeOnClick: true,    // allows click to dismiss
          draggable: true,
          theme: "colored",
        });
      } else {
        console.error('❌ Failed to remove from wishlist');
        alert('Failed to remove item from wishlist. Please try again.');
      }
    } catch (error) {
      console.error('❌ Failed to remove from wishlist:', error);
      alert('Network error. Please try again.');
    }
  };

  // ✅ FIXED: Use actualStoreId for cart operations
  const addToCart = async (product) => {
    console.log('🛒 Adding to cart:', product.name, 'for store:', actualStoreId);

    try {
      // ✅ FIXED: Use actualStoreId instead of sellerPhone
      const cartData = JSON.parse(localStorage.getItem('multiCarts') || '{}');
      const storeCart = cartData[actualStoreId] || [];

      const existingItem = storeCart.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
        console.log('🔄 Updated quantity in cart:', existingItem.quantity);
      } else {
        storeCart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          seller_phone: actualStoreId,
          main_image_url: product.processedImageUrl || product.main_image_url || product.image_url,
          description: product.description
        });
        console.log('➕ Added new item to cart');
      }

      cartData[actualStoreId] = storeCart;
      localStorage.setItem('multiCarts', JSON.stringify(cartData));

      // alert(`${product.name} added to cart! 🛒`);
      toast.success(`${product.name} added to cart!`, {
        position: 'top-center',
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleBackClick = () => {
    const profileUrl = getShopUrl('/profile');
    console.log('🔙 Back to profile:', profileUrl);
    router.push(profileUrl);
  };

  const handleBrowseStore = () => {
    const shopUrl = getShopUrl('');
    console.log('🛍️ Browse store:', shopUrl);
    router.push(shopUrl);
  };

  const handleViewProduct = (productId) => {
    const productUrl = getShopUrl(`/product/${productId}`);
    console.log('👁️ View product:', productUrl);
    router.push(productUrl);
  };

  const formatPrice = (price) => `₹${parseFloat(price).toFixed(2)}`;

  // ✅ ENHANCED: Image error handler with logging
  const handleImageError = (e, productName) => {
    console.warn('🖼️ Image failed to load for:', productName);
    console.warn('🖼️ Failed URL:', e.target.src);
    e.target.src = '/placeholder.svg';
  };

  // Show loading while redirecting or loading
  if (loading || urlError) {
    return (
      <div style={styles.loadingContainer}>
        {urlError ? (
          <>
            <AlertTriangle size={48} color="#ef4444" />
            <h2>Invalid Wishlist URL</h2>
            <p>{urlError}</p>
            <p>Redirecting to profile...</p>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <p>Loading your wishlist...</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Store: {actualStoreId || 'Not found'}
            </p>
          </>
        )}
      </div>
    );
  }

  // Show error if no store ID found (shouldn't reach here due to redirect)
  if (!actualStoreId) {
    return (
      <div style={styles.errorContainer}>
        <Store size={48} color="#ef4444" />
        <h2>Store Not Found</h2>
        <p>Unable to load wishlist for this store.</p>
        <button onClick={() => router.push('/profile')} style={styles.homeButton}>
          Go to Profile
        </button>
      </div>
    );
  }

  return (

    <div className='profilwishlistpagecont' style={styles.pagecontainer}>
      <SHeader
        store={storeData}
        isLoggedIn={isLoggedIn}
      />

      <div
        style={{
          ...styles.container,
          paddingTop: wishlist.length > 0 ? '100px' : '0px',
        }}
      >

        {/* Store Context */}
        {/* <div style={styles.storeInfo}>
        <Heart size={18} color="#ef4444" />
        <span>Items you've saved from {storeData?.name || `Store ${actualStoreId}`} • {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</span>
      </div> */}

        {/* Debug Info (remove in production) */}
        {/* <div style={{
        backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px',
        marginBottom: '20px', fontSize: '12px', color: '#666'
      }}>
        <strong>Debug:</strong> Store: {actualStoreId} | Wishlist: {wishlist.length} items | 
        Store Name: {storeData?.name || 'Loading...'} | API Base: {API_BASE_URL}
      </div> */}

        {/* Wishlist Items */}
        {wishlist.length === 0 ? (
          <div style={styles.emptyState}>
            <Heart size={48} color="#ccc" />
            <h2>No items in wishlist</h2>
            <p>You haven't saved any items from {storeData?.name || 'this store'} yet.</p>
            <button onClick={handleBrowseStore} style={styles.shopButton}>
              Browse Store
            </button>
          </div>
        ) : (
          <div className='profilewishlistgrid' style={styles.wishlistGrid}>

            {wishlist.map(item => {
              // Handle different API response structures
              const product = item.product || item;
              const productId = product.id || item.product_id;
              const productName = product.name || item.name;
              const productPrice = product.price || item.price;
              const productmrp = product.mrp || item.mrp;
              const productModel = product.model_name || item.model_name;
              const productReview = product.review_count || item.review_count;
              const ProductRating = product.average_rating || item.average_rating;

              // ✅ FIXED: Use processed image URL with multiple fallbacks
              const productImage = item.processedImageUrl ||
                product.processedImageUrl ||
                buildImageUrl(product.main_image_url) ||
                buildImageUrl(product.image_url) ||
                buildImageUrl(product.main_image) ||
                buildImageUrl(item.main_image_url) ||
                '/placeholder.svg';

              const productDescription = product.description || item.description;

              console.log('🖼️ Rendering product image:', productName, '→', productImage);

              const getStockStatus = () => {
                const stock = product.online_stock || 0;
                if (stock === 0) return 'out-of-stock';
                if (stock <= 5) return 'low-stock';
                return 'in-stock';
              };

              const getDiscountPercentage = () => {
                if (product.mrp && product.mrp > product.price && product.price) {
                  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
                }
                return 0;
              };

              return (

                <div
                  className={`shop-product-card ${getStockStatus()}`}
                  style={styles.shopProductCard}
                  data-product-id={product.id}
                >
                  {/* ✅ FIXED: Image section without Link wrapper for wishlist button */}
                  <div className="product-image-wrapper" style={styles.productImageWrapper}>
                    {/* ✅ Link only wraps the image itself */}

                    <img
                      src={productImage}
                      alt={productName}
                      style={styles.productImageLink}
                      onError={(e) => handleImageError(e, productName)}
                      onLoad={() => console.log('✅ Image loaded successfully for:', productName)}
                    />


                    {/* ✅ Rating overlay (existing) - shows on image hover */}
                    {/* {product.average_rating > 0 && ( */}
                    <div style={styles.ratingOverlay}>
                      <div style={styles.ratingLeft}>
                        <Star
                          size={12}
                          fill={product.average_rating > 0 ? "#fbbf24" : "none"}
                          color="#fbbf24"
                        />
                        <span style={styles.ratingLeftText}>
                          {product.average_rating > 0 ? `(${product.average_rating.toFixed(1)})` : ""}
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
                    {/* )} */}

                    {/* Product badges */}
                    <div className="product-badges" style={styles.productBadges}>
                      {getDiscountPercentage() > 0 && (
                        <span className="badge discount" style={styles.badgeDiscount}>
                          {getDiscountPercentage()}% OFF
                        </span>
                      )}
                      {(product.online_stock || 0) <= 5 && (product.online_stock || 0) > 0 && (
                        <span className="badge low-stock" style={styles.badgeLowStock}>
                          Only {product.online_stock} left
                        </span>
                      )}
                      {(product.online_stock || 0) === 0 && (
                        <span className="badge out-of-stock" style={styles.badgeOutOfStock}>
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* ✅ FIXED: Wishlist button outside Link - this is the key fix */}
                    <div className="quick-actions" style={styles.quickActions}>

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        style={styles.removeButton}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </div>

                  {/* ✅ Product info section wrapped in Link */}
                  <div className="product-info" style={styles.productInfo}>

                    {/* Product details */}
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


                    {/* Pricing */}
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
                    <button
                      className='shopslugprofilewishlistaddtocartbtn'
                      onClick={() => addToCart(product)}
                      style={styles.addToCartButton}
                      disabled={!productPrice}
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>

                  </div>
                </div>

              );
            })}
          </div>
        )
        }
      </div >
      <ShopFooter />
    </div>
  );
}

const styles = {
  pagecontainer: { backgroundColor: "#FDFFF0", paddingTop: "100px", },
  container: { minHeight: '100vh', backgroundColor: '#FDFFF0', padding: '20px', maxWidth: '1200px', margin: '0 auto', },
  loadingContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: '20px', textAlign: 'center'
  },
  spinner: {
    width: '32px', height: '32px', border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6', borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: '20px',
    textAlign: 'center', padding: '40px'
  },
  homeButton: {
    padding: '12px 24px', backgroundColor: '#6b7280', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px',
    backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  backButton: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#3b82f6', padding: '8px', borderRadius: '6px'
  },
  title: {
    fontSize: '24px', fontWeight: '700', color: '#1f2937', flex: 1
  },
  storeInfo: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '8px', padding: '12px', marginBottom: '16px',
    color: '#991b1b', fontSize: '14px', fontWeight: '500'
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', padding: '60px', marginTop: "120px",
    backgroundColor: '#FDFFF0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
  },
  shopButton: {
    padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px',
    fontSize: '16px', fontWeight: '600', transition: 'all 0.2s'
  },
  wishlistGrid: {
    display: 'grid',
    gap: '16px',
    justifyContent: 'center', // centers grid items horizontally
    width: '100%',
    margin: '0 auto',
    padding: '10px 0',
    boxSizing: 'border-box',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
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
    fontWeight: '500', transition: 'all 0.2s'
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
};
