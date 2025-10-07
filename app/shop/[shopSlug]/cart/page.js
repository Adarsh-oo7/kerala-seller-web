'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, CreditCard, Store, AlertTriangle, Loader } from 'lucide-react';
import "../../../../styles/Shopslugcart.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function ShopCartPage() {
  const { shopSlug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [urlError, setUrlError] = useState(null);
  const [stockWarnings, setStockWarnings] = useState({});
  const [validatingStock, setValidatingStock] = useState(false);

  // ✅ ENHANCED: Better store ID detection with validation
  const getActualStoreId = () => {
    console.log('🔍 Getting store ID...');
    console.log('- shopSlug from params:', shopSlug);
    console.log('- id from search params:', searchParams.get('id'));
    console.log('- current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');

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

  console.log('🏪 Final store ID:', actualStoreId);

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

  // ✅ ENHANCED: Cart sync across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'multiCarts' && actualStoreId) {
        const newCarts = JSON.parse(e.newValue || '{}');
        const newStoreCart = newCarts[actualStoreId] || [];
        setCartItems(newStoreCart);
        console.log('📦 Cart synced from other tab:', newStoreCart);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [actualStoreId]);

  // ✅ REDIRECT: If we have an invalid URL, try to find the correct cart
  useEffect(() => {
    if (urlError || !actualStoreId) {
      console.log('🔍 Invalid URL detected, checking for available carts...');

      try {
        const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
        const availableStores = Object.keys(multiCarts).filter(storeId =>
          multiCarts[storeId] && multiCarts[storeId].length > 0
        );

        console.log('📦 Available carts:', availableStores);

        if (availableStores.length === 1) {
          // Redirect to the only available cart
          const correctStoreId = availableStores[0];
          console.log('🔄 Redirecting to correct cart:', correctStoreId);
          router.replace(`/shop/${correctStoreId}/cart`);
          return;
        } else if (availableStores.length > 1) {
          // Multiple carts available - redirect to cart selector or home
          console.log('🔄 Multiple carts found, redirecting to home');
          router.replace('/');
          return;
        } else {
          // No carts available
          console.log('📦 No carts found, redirecting to home');
          router.replace('/');
          return;
        }
      } catch (error) {
        console.error('❌ Error checking carts:', error);
        router.replace('/');
        return;
      }
    }
  }, [urlError, actualStoreId, router]);

  // ✅ ENHANCED: Real-time stock validation
  const validateStock = async () => {
    if (!actualStoreId || cartItems.length === 0) return;

    setValidatingStock(true);
    try {
      const warnings = {};

      for (const item of cartItems) {
        try {
          const response = await fetch(`${API_BASE_URL}/shop/${actualStoreId}/products/${item.id}/`);
          if (response.ok) {
            const product = await response.json();
            const availableStock = product.online_stock || product.total_stock || 0;

            if (item.quantity > availableStock) {
              warnings[item.id] = availableStock === 0 ? 'Out of stock' : `Only ${availableStock} available`;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Stock check failed for product ${item.id}:`, error);
        }
      }

      setStockWarnings(warnings);
      console.log('📊 Stock validation complete:', warnings);
    } catch (error) {
      console.warn('⚠️ Stock validation failed:', error);
    } finally {
      setValidatingStock(false);
    }
  };

  useEffect(() => {
    const loadCartAndStore = async () => {
      if (!actualStoreId) {
        console.error('❌ No valid store ID found');
        setLoading(false);
        return;
      }

      console.log('📦 Loading cart for store:', actualStoreId);

      // Load cart using actual store ID
      const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
      const storeCart = multiCarts[actualStoreId] || [];
      setCartItems(storeCart);

      console.log('📦 Cart loaded:', storeCart);
      console.log('📦 Available carts:', Object.keys(multiCarts));

      // Load store data
      try {
        const response = await fetch(`${API_BASE_URL}/shop/${actualStoreId}/`);
        if (response.ok) {
          const data = await response.json();
          setStoreData(data.store || data);
          console.log('✅ Store data loaded:', data);
        } else {
          console.warn('⚠️ Store API failed, using fallback data');
          setStoreData({
            name: `Store ${actualStoreId}`,
            seller_phone: actualStoreId,
            id: actualStoreId
          });
        }
      } catch (error) {
        console.warn('⚠️ Store data error:', error);
        setStoreData({
          name: `Store ${actualStoreId}`,
          seller_phone: actualStoreId,
          id: actualStoreId
        });
      } finally {
        setLoading(false);
      }
    };

    if (actualStoreId && !urlError) {
      loadCartAndStore();
    }
  }, [actualStoreId]);

  // ✅ ENHANCED: Validate stock when cart changes
  useEffect(() => {
    if (cartItems.length > 0 && !loading) {
      const timer = setTimeout(() => {
        validateStock();
      }, 500); // Debounce stock validation

      return () => clearTimeout(timer);
    } else {
      setStockWarnings({});
    }
  }, [cartItems, actualStoreId, loading]);

  const updateCart = (newCart) => {
    if (!actualStoreId) return;

    setCartItems(newCart);
    const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
    if (newCart.length === 0) {
      delete multiCarts[actualStoreId];
    } else {
      multiCarts[actualStoreId] = newCart;
    }
    localStorage.setItem('multiCarts', JSON.stringify(multiCarts));
    console.log('🔄 Cart updated for store:', actualStoreId, newCart);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);
  };

  const removeItem = (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      const updatedCart = cartItems.filter(item => item.id !== productId);
      updateCart(updatedCart);
    }
  };

  const clearCart = () => {
    if (window.confirm('Clear all items from cart?')) {
      updateCart([]);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatPrice = (price) => `₹${parseFloat(price).toFixed(2)}`;

  // ✅ ENHANCED: Checkout validation with stock check
  const handleCheckout = () => {
    console.log('🔄 Checkout clicked');
    console.log('- actualStoreId:', actualStoreId);
    console.log('- cartItems length:', cartItems.length);

    if (!actualStoreId) {
      console.error('❌ Cannot proceed - no store ID');
      alert('Store ID not found. Please refresh the page and try again.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // ✅ ENHANCED: Validate cart items before checkout
    const invalidItems = cartItems.filter(item =>
      !item.id || !item.name || !item.price || item.quantity < 1
    );

    if (invalidItems.length > 0) {
      console.error('❌ Invalid items in cart:', invalidItems);
      alert('Some items in your cart are invalid. Please refresh the page and try again.');
      return;
    }

    // ✅ ENHANCED: Check for stock warnings
    const hasStockIssues = Object.keys(stockWarnings).length > 0;
    if (hasStockIssues) {
      const proceed = window.confirm(
        'Some items in your cart have stock issues. Do you want to continue anyway? You may need to adjust quantities during checkout.'
      );
      if (!proceed) return;
    }

    const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');
    if (!token) {
      console.log('🔐 No token found, redirecting to login');
      const loginUrl = getShopUrl('/login');
      const currentUrl = getShopUrl('/cart');
      const redirectUrl = `${loginUrl}?redirect=${encodeURIComponent(currentUrl)}`;
      console.log('🔄 Redirecting to login:', redirectUrl);
      router.push(redirectUrl);
      return;
    }

    const checkoutUrl = getShopUrl('/checkout');
    console.log('🔄 Proceeding to checkout:', checkoutUrl);
    router.push(checkoutUrl);
  };

  const handleBackClick = () => {
    const backUrl = getShopUrl('');
    console.log('🔙 Back clicked, going to:', backUrl);
    router.push(backUrl);
  };

  const handleContinueShopping = () => {
    const shopUrl = getShopUrl('');
    console.log('🛍️ Continue shopping, going to:', shopUrl);
    router.push(shopUrl);
  };

  // ✅ ENHANCED: Better loading state with progress indication
  if (loading || urlError) {
    return (

      <div style={styles.loadingContainer}>
        {urlError ? (
          <>
            <AlertTriangle size={48} color="#ef4444" />
            <h2>Invalid Cart URL</h2>
            <p>{urlError}</p>
            <p>Checking for available carts...</p>
            <div style={styles.debugInfo}>
              <div><strong>Shop Slug:</strong> {shopSlug}</div>
              <div><strong>Query ID:</strong> {searchParams.get('id')}</div>
              <div><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</div>
            </div>
          </>
        ) : (
          <>
            <div style={styles.spinner}></div>
            <p>Loading your cart...</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Store: {storeData?.name || actualStoreId || 'Detecting...'}
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
        <p>Unable to identify the store. Please check the URL.</p>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'left' }}>
          <div>shopSlug: {shopSlug}</div>
          <div>id parameter: {searchParams.get('id')}</div>
          <div>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</div>
        </div>
        <button onClick={() => router.push('/')} style={styles.homeButton}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={handleBackClick} style={styles.backButton}>
          <ArrowLeft size={20} color='red' />
        </button>
        <h1 className='carttitle' style={styles.title}>
          {storeData?.name || `Store ${actualStoreId}`} Cart
        </h1>
        {cartItems.length > 0 && (
          <button className='shopcartclearbutton' onClick={clearCart} style={styles.clearButton}>
            Clear All
          </button>
        )}
      </div>

      {/* Store Context Indicator */}
      <div className='storeindicator' style={styles.storeIndicator}>
        <Store size={16} color='white' />
        <span>Shopping at {storeData?.name || `Store ${actualStoreId}`} • {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
        {validatingStock && (
          <div style={styles.stockValidating}>
            <Loader size={12} />
            <span>Checking stock...</span>
          </div>
        )}
      </div>

      {/* Stock Issues Alert */}
      {Object.keys(stockWarnings).length > 0 && (
        <div style={styles.stockAlert}>
          <AlertTriangle size={16} />
          <span>Some items have stock issues. Please review quantities below.</span>
        </div>
      )}

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <div style={styles.emptyState}>
          <ShoppingCart size={48} color="#ccc" />
          <h2>Your cart is empty</h2>
          <p>Add some items from {storeData?.name || `Store ${actualStoreId}`} to get started.</p>
          <button onClick={handleContinueShopping} style={styles.shopButton}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className='cart-layout' style={styles.cartLayout}>
            <div style={styles.cartItemsSection}>
              <div className='cart-items' style={styles.cartItems}>
                {cartItems.map(item => (
                  <div className="cart-item" key={item.id} style={{
                    ...styles.cartItem,
                    ...(stockWarnings[item.id] ? styles.cartItemWarning : {})
                  }}>
                    <div className="cart-item-image" style={styles.imageColumn}>
                      <img
                        src={item.main_image_url || item.image_url || '/placeholder.svg'}
                        alt={item.name}
                        style={styles.itemImage}
                        onError={(e) => { e.target.src = '/placeholder.svg'; }}
                      />
                      <div className="total-price-below-image" style={styles.totalPriceBelowImage}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>

                    <div className="item-info" style={styles.itemInfo} data-total-price={`₹${item.price * item.quantity}`}>
                      <h3 className="item-name" style={styles.itemName}>{item.name}</h3>
                      <p className="item-price" style={styles.itemPrice}>{formatPrice(item.price)} each</p>
                      {/* ✅ ENHANCED: Stock warning display */}
                      {stockWarnings[item.id] && (
                        <p style={styles.stockWarning}>
                          ⚠️ {stockWarnings[item.id]}
                        </p>
                      )}


                      <div style={styles.quantityControls}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{
                            ...styles.quantityButton,
                            opacity: item.quantity <= 1 ? 0.5 : 1,
                            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Minus backgroundColor='#FDFFF0' size={16} />
                        </button>
                        <span style={styles.quantity}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={styles.quantityButton}
                        >
                          <Plus backgroundColor='#FDFFF0' size={16} />
                        </button>
                      </div>

                      <button
                        className="remove-button-below-quantity"
                        onClick={() => removeItem(item.id)}
                        style={styles.removeButtonBelowQuantity}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className='cart-summary-section' style={styles.cartSummarySection}>
              <div style={styles.cartSummary}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Items ({cartItems.length})</span>
                  <span style={styles.summaryValue}>{formatPrice(calculateTotal())}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Delivery</span>
                  <span style={styles.summaryValue}>Free</span>
                </div>
                {Object.keys(stockWarnings).length > 0 && (
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Stock Issues</span>
                    <span style={styles.summaryWarning}>{Object.keys(stockWarnings).length} item{Object.keys(stockWarnings).length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div style={styles.totalRow}>
                  <span className='totallabel' style={styles.totalLabel}>Total</span>
                  <span className='totallabel' style={styles.totalValue}>{formatPrice(calculateTotal())}</span>
                </div>

                <button
                className='proceedbtn'
                  onClick={handleCheckout}
                  style={{
                    ...styles.checkoutButton,
                    backgroundColor: cartItems.length === 0 ? '#ccc' : '#10b981',
                    cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                  disabled={cartItems.length === 0}
                >
                  <CreditCard size={18} />
                  Proceed to Checkout 
                </button>

                <button className='continuebtn' onClick={handleContinueShopping} style={styles.continueButton}>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ✅ ENHANCED: Debug info for development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div style={styles.debugPanel}>
          <div style={styles.debugTitle}>🔧 Debug Info</div>
          <div>Store ID: {actualStoreId}</div>
          <div>Cart Items: {cartItems.length}</div>
          <div>Stock Warnings: {Object.keys(stockWarnings).length}</div>
          <div>URL Pattern: {searchParams.get('id') ? 'new+id' : 'direct'}</div>
          <div>Validating Stock: {validatingStock ? 'Yes' : 'No'}</div>
        </div>
      )} */}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#FDFFF0",
    padding: "20px",
    // maxWidth: "1200px",
    margin: "0 auto",
    overflowX: "hidden",
  },
  loadingContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: '20px', textAlign: 'center'
  },
  spinner: {
    width: '32px', height: '32px', border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6', borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  debugInfo: {
    fontSize: '12px', backgroundColor: '#fef2f2', padding: '12px',
    borderRadius: '6px', marginTop: '16px', textAlign: 'left',
    border: '1px solid #fecaca'
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
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '20px', backgroundColor: '#FDFFF0', borderRadius: '12px',
    padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  backButton: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#3b82f6', padding: '8px', borderRadius: '6px'
  },
  title: {
    fontSize: '24px', fontWeight: '700', color: '#1f2937',
    flex: 1, textAlign: 'center'
  },
  clearButton: {
    background: 'none', border: '1px solid #ef4444', color: '#ef4444',
    borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '14px',
    fontWeight: '500', transition: 'all 0.2s'
  },
  storeIndicator: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1a4845', border: '1px solid white',
    borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
    fontSize: '14px', color: 'white', fontWeight: '500'
  },
  stockValidating: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', color: '#6b7280'
  },
  stockAlert: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: '#fef3c7', border: '1px solid #f59e0b',
    borderRadius: '8px', padding: '12px 16px', marginBottom: '16px',
    fontSize: '14px', color: '#92400e', fontWeight: '500'
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', padding: '60px',
    backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  shopButton: {
    padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px',
    fontSize: '16px', fontWeight: '600', transition: 'all 0.2s'
  },

  cartItems: {
    display: 'grid',
    gap: '16px',
    width: '100%',
    justifyContent: 'center',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', // responsive
  },


  cartItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '16px',
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
    flexWrap: 'wrap',      // wrap content on small screens
    width: '100%',          // fills the grid cell
    boxSizing: 'border-box',
  },



  itemInfo: {
    flex: 1,                  // fills horizontal space
    display: 'flex',
    flexDirection: 'column',  // stack name -> price -> quantity vertically
    gap: '8px',
    minWidth: 0,
  },

  imageColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '27px',
    flexShrink: 0,
  },

  totalPriceBelowImage: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937'
  },

  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0px',
    marginTop: '4px',
    borderRadius: '8px',
    padding: '4px',
  },

  itemTotal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '3px'
  },

  cartItemWarning: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb'
  },
  itemImage: {
    width: '100px', height: '100px', objectFit: 'cover',
    borderRadius: '8px', flexShrink: 0, border: '1px solid #e5e7eb'
  },

  itemName: {
    fontSize: '16px', fontWeight: '600', color: '#1f2937',
    margin: '0 0 6px 0', lineHeight: '1.4'
  },
  itemPrice: {
    fontSize: '14px', color: '#059669', margin: '0 0 4px 0', fontWeight: '600'
  },
  stockWarning: {
    fontSize: '12px', color: '#ef4444', fontWeight: '500',
    margin: '4px 0 0 0'
  },


  quantityButton: {
    width: '26px', height: '26px', border: '1px solid #d1d5db',
    backgroundColor: '#FDFFF0', borderRadius: '6px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s', color: '#374151'
  },
  quantity: {
    minWidth: '32px', textAlign: 'center', fontWeight: '700',
    color: '#1f2937', fontSize: '16px'
  },

  totalPrice: {
    fontSize: '18px', fontWeight: '700', color: '#1f2937'
  },
  removeButtonBelowQuantity: {
    marginTop: '8px',
    background: 'rgba(239, 68, 68, 0.75)',  // semi-transparent red
    border: '1px solid #ef4444',
    backdropFilter: 'blur(6px)',           // frosted glass effect
    WebkitBackdropFilter: 'blur(6px)',
    color: 'white',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontWeight: '500',
    alignSelf: 'auto'
  },
  cartSummary: {
    backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'
  },

  cartLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 350px", // desktop: left flexible, right fixed
    gap: "20px",
    alignItems: "start",
  },

  cartItemsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minWidth: 0,   // ✅ prevents flex from overflowing
  },

  cartSummarySection: {
    position: "sticky",
    top: "20px",
    minWidth: 0,
  },

  summaryRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #f3f4f6'
  },
  summaryLabel: { fontSize: '15px', color: '#6b7280', fontWeight: '500' },
  summaryValue: { fontSize: '15px', color: '#1f2937', fontWeight: '600' },
  summaryWarning: { fontSize: '15px', color: '#ef4444', fontWeight: '600' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '16px', marginBottom: '24px', borderTop: '2px solid #e5e7eb'
  },
  totalLabel: { fontSize: '20px', fontWeight: '700', color: '#1f2937' },
  totalValue: { fontSize: '20px', fontWeight: '700', color: '#059669' },
  checkoutButton: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', color: 'white', border: 'none',
    borderRadius: '10px', padding: '16px', cursor: 'pointer', fontSize: '16px',
    fontWeight: '600', marginBottom: '12px', transition: 'all 0.2s'
  },
  continueButton: {
    width: '100%', backgroundColor: '#FDFFF0', color: '#374151',
    border: '1px solid #d1d5db', borderRadius: '10px', padding: '12px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
  },
  debugPanel: {
    backgroundColor: '#f3f4f6', border: '1px solid #d1d5db',
    borderRadius: '8px', padding: '12px', marginTop: '20px',
    fontSize: '12px', fontFamily: 'monospace'
  },
  debugTitle: {
    fontWeight: 'bold', marginBottom: '8px', color: '#374151'
  }
};
