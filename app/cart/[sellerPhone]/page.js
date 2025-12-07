'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Store,
  ArrowLeft,
  Package,
  AlertCircle,
  Check,
  RefreshCw,
  Globe,
  CreditCard,
  MapPin,
  Phone,
  User,
  Heart,
  Star,
  Truck,
  Wallet,
  ExternalLink,
  Home
} from 'lucide-react';

// ✅ Enhanced API base URL handling
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  return 'https://api.keralasellers.in';
};

const API_BASE_URL = getApiBaseUrl();

export default function SellerSpecificCartPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockValidation, setStockValidation] = useState({ valid: true, errors: [], warnings: [] });
  const [storeData, setStoreData] = useState(null);
  const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });

  const params = useParams();
  const router = useRouter();
  const { sellerPhone } = params;

  // ✅ Enhanced cart hook with error handling
  let cartData = null;
  let cartError = null;
  
  try {
    cartData = useCart();
  } catch (err) {
    console.error('❌ Cart hook error:', err);
    cartError = err;
  }

  // ✅ Fallback cart state if hook fails
  const [fallbackCarts, setFallbackCarts] = useState({});
  
  const {
    carts = fallbackCarts,
    getCartBySeller,
    removeFromCart = (phone, id) => {
      console.warn('⚠️ Using fallback removeFromCart');
      setFallbackCarts(prev => ({
        ...prev,
        [phone]: (prev[phone] || []).filter(item => item.id !== id)
      }));
    },
    updateQuantity = (phone, id, quantity) => {
      console.warn('⚠️ Using fallback updateQuantity');
      setFallbackCarts(prev => ({
        ...prev,
        [phone]: (prev[phone] || []).map(item => 
          item.id === id ? { ...item, quantity } : item
        )
      }));
      return true;
    },
    validateCartStock = () => ({ valid: true, errors: [], warnings: [] }),
    clearCartForSeller = (phone) => {
      console.warn('⚠️ Using fallback clearCartForSeller');
      setFallbackCarts(prev => ({ ...prev, [phone]: [] }));
    }
  } = cartData || {};

  // ✅ Enhanced shop context detection
  const getShopContext = () => {
    if (typeof window === 'undefined') return { shopId: null, isInShop: false };
    
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    let shopMatch = currentPath.match(/\/shop\/([^\/]+)/);
    let storeMatch = currentPath.match(/\/store\/([^\/]+)/);
    
    if (shopMatch) {
      return { shopId: shopMatch[1], isInShop: true, pattern: 'shop' };
    }
    
    if (storeMatch) {
      return { shopId: storeMatch[1], isInShop: true, pattern: 'store' };
    }
    
    const shopId = searchParams.get('id') || searchParams.get('shop_id');
    if (shopId) {
      return { shopId, isInShop: true, pattern: 'query' };
    }
    
    try {
      const savedContext = sessionStorage.getItem('currentShopContext');
      if (savedContext) {
        const parsed = JSON.parse(savedContext);
        if (parsed.shopId) {
          return { shopId: parsed.shopId, isInShop: true, pattern: 'session' };
        }
      }
    } catch (e) {
      console.warn('Failed to parse shop context from session');
    }
    
    return { shopId: null, isInShop: false, pattern: 'none' };
  };

  // ✅ Load seller-specific cart data and store info
  useEffect(() => {
    const loadSellerCartData = async () => {
      try {
        console.log(`📱 Loading seller-specific cart for: ${sellerPhone}`);
        
        // Load from localStorage if cart context is not available
        if (cartError || !cartData) {
          console.log('📱 Loading cart from localStorage (context failed)...');
          const savedCart = localStorage.getItem('cart');
          const savedMultiCarts = localStorage.getItem('multiCarts');
          
          if (savedMultiCarts) {
            const parsed = JSON.parse(savedMultiCarts);
            setFallbackCarts(parsed);
            console.log('✅ Loaded multiCarts from localStorage for seller:', sellerPhone);
          } else if (savedCart) {
            const parsed = JSON.parse(savedCart);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const cartSellerPhone = parsed[0].seller_phone || 'unknown';
              setFallbackCarts({ [cartSellerPhone]: parsed });
            }
          }
        }
        
        // Set shop context
        const shopContext = getShopContext();
        setCurrentStoreInfo({
          storeId: shopContext.shopId,
          isInStore: shopContext.isInShop,
          pattern: shopContext.pattern
        });
        
        // Load store data for this specific seller
        await loadStoreData();
        
      } catch (error) {
        console.error('❌ Error loading seller cart:', error);
        setError('Failed to load cart data for this seller');
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(loadSellerCartData, 100);
    return () => clearTimeout(timer);
  }, [sellerPhone, cartError, cartData]);

  // ✅ Load store data for this specific seller
  const loadStoreData = async () => {
    try {
      console.log(`🏪 Loading store data for seller: ${sellerPhone}`);
      
      const response = await fetch(`${API_BASE_URL}/shop/${sellerPhone}/`, {
        timeout: 8000
      });
      
      if (response.ok) {
        const data = await response.json();
        setStoreData(data.store || data);
        console.log('✅ Store data loaded:', data.store?.name || 'Unknown Store');
      } else {
        console.warn(`⚠️ Store not found for seller: ${sellerPhone}`);
        setStoreData({ name: `Store ${sellerPhone}`, phone: sellerPhone });
      }
    } catch (error) {
      console.warn(`⚠️ Failed to load store data for ${sellerPhone}:`, error);
      setStoreData({ name: `Store ${sellerPhone}`, phone: sellerPhone });
    }
  };

  // ✅ Get cart items for this specific seller only
  const cartItems = getCartBySeller ? getCartBySeller(sellerPhone) : (carts[sellerPhone] || fallbackCarts[sellerPhone] || []);

  console.log('🛒 Seller Cart Debug:', {
    sellerPhone,
    cartData: !!cartData,
    cartError: !!cartError,
    itemsCount: cartItems?.length || 0,
    storeData: !!storeData,
    currentStoreInfo
  });

  // ✅ Validate stock for this seller
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      try {
        const validation = validateCartStock(sellerPhone);
        setStockValidation(validation);
        console.log('📊 Seller cart validation:', validation);
      } catch (error) {
        console.warn(`Validation failed for ${sellerPhone}:`, error);
        setStockValidation({ valid: true, errors: [], warnings: [] });
      }
    }
  }, [cartItems, sellerPhone, validateCartStock]);

  const calculateCartTotal = (items = cartItems) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      try {
        const success = updateQuantity(sellerPhone, itemId, newQuantity);
        if (!success) {
          alert('Insufficient stock for this quantity');
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Failed to update quantity');
      }
    }
  };

  const handleRemoveItem = (itemId) => {
    try {
      const item = cartItems?.find(item => item.id === itemId);
      const itemName = item?.name || 'item';
      
      if (window.confirm(`Remove "${itemName}" from your cart?`)) {
        removeFromCart(sellerPhone, itemId);
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const handleClearCart = () => {
    try {
      const storeName = storeData?.name || `Store ${sellerPhone}`;
      
      if (window.confirm(`Clear all items from ${storeName}?`)) {
        clearCartForSeller(sellerPhone);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
  };

  // ✅ Enhanced back navigation with seller context
  const handleBackClick = () => {
    try {
      const shopContext = getShopContext();
      
      // First try to go back to the seller's shop
      if (shopContext.isInShop && shopContext.shopId === sellerPhone) {
        if (shopContext.pattern === 'shop') {
          router.push(`/shop/${sellerPhone}`);
        } else if (shopContext.pattern === 'query') {
          router.push(`/shop/new?id=${sellerPhone}`);
        } else {
          router.push(`/store/${sellerPhone}`);
        }
        return;
      }
      
      // If we're in a different shop context, go to that shop
      if (shopContext.isInShop && shopContext.shopId) {
        if (shopContext.pattern === 'shop') {
          router.push(`/shop/${shopContext.shopId}`);
        } else if (shopContext.pattern === 'query') {
          router.push(`/shop/new?id=${shopContext.shopId}`);
        } else {
          router.push(`/store/${shopContext.shopId}`);
        }
        return;
      }
      
      // Default: go to seller's shop
      router.push(`/shop/${sellerPhone}`);
      
    } catch (error) {
      console.error('Navigation error:', error);
      router.push(`/shop/${sellerPhone}`);
    }
  };

  // ✅ Checkout navigation for this specific seller
  const handleCheckout = () => {
    try {
      console.log(`🔍 Navigating to checkout for seller: ${sellerPhone}`);
      
      if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      // Check for authentication
      const token = localStorage.getItem('access_token') || localStorage.getItem('buyerAccessToken');
      if (!token) {
        const shopContext = getShopContext();
        let loginUrl = `/login/buyer?redirect=/checkout/${sellerPhone}`;
        
        if (shopContext.isInShop && shopContext.shopId) {
          if (shopContext.pattern === 'shop') {
            loginUrl = `/shop/${shopContext.shopId}/login?redirect=/checkout/${sellerPhone}`;
          } else if (shopContext.pattern === 'query') {
            loginUrl = `/shop/new/login?id=${shopContext.shopId}&redirect=/checkout/${sellerPhone}`;
          } else {
            loginUrl = `/store/${shopContext.shopId}/login?redirect=/checkout/${sellerPhone}`;
          }
        }
        
        console.log('🔐 No auth token, redirecting to:', loginUrl);
        router.push(loginUrl);
        return;
      }

      const checkoutUrl = `/checkout/${sellerPhone}`;
      console.log('✅ Navigating to checkout:', checkoutUrl);
      router.push(checkoutUrl);
      
    } catch (error) {
      console.error('❌ Checkout navigation error:', error);
      alert('Failed to proceed to checkout. Please try again.');
    }
  };

  // ✅ Enhanced image URL handling
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/80x80/e9ecef/6c757d?text=No+Image';
    
    if (imageUrl.startsWith('/media/') || imageUrl.startsWith('/static/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    return imageUrl;
  };

  // ✅ Enhanced product URL with store context awareness
  const getProductUrl = (item) => {
    const shopContext = getShopContext();
    
    if (shopContext.isInShop && shopContext.shopId) {
      if (shopContext.pattern === 'shop') {
        return `/shop/${shopContext.shopId}/product/${item.id}`;
      } else if (shopContext.pattern === 'query') {
        return `/shop/new/product/${item.id}?id=${shopContext.shopId}`;
      } else {
        return `/store/${shopContext.shopId}/product/${item.id}`;
      }
    }
    
    return `/shop/${sellerPhone}/product/${item.id}`;
  };

  const cartTotal = calculateCartTotal();
  const totalItems = cartItems?.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0) || 0;

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.pageContainer}>
        <Header />
        <div style={styles.loadingContainer}>
          <RefreshCw size={40} style={{animation: 'spin 1s linear infinite'}} />
          <p>Loading cart for seller {sellerPhone}...</p>
          <p style={styles.loadingSubtext}>Fetching store data from {API_BASE_URL}</p>
        </div>
        <Footer />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.pageContainer}>
        <Header />
        <div style={styles.errorContainer}>
          <AlertCircle size={48} color="#ef4444" />
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={styles.retryButton}
          >
            <RefreshCw size={18} />
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Header />
      
      <div style={styles.container}>
        {/* Mobile Header */}
        <div style={styles.mobileHeader}>
          <button onClick={handleBackClick} style={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={styles.title}>
            <Store size={24} />
            <span>{storeData?.name || `Store ${sellerPhone}`}</span>
          </h1>
          <div style={styles.cartCount}>
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Store context indicator */}
        {currentStoreInfo.isInStore && (
          <div style={styles.storeIndicator}>
            <Globe size={16} />
            <span>Shopping in store context • Store ID: {currentStoreInfo.storeId}</span>
          </div>
        )}

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={styles.debugInfo}>
            <details>
              <summary>Seller Cart Debug</summary>
              <pre>{JSON.stringify({ 
                sellerPhone,
                cartError: !!cartError,
                itemsCount: cartItems?.length || 0,
                totalItems,
                cartTotal: formatPrice(cartTotal),
                storeData: storeData?.name || 'No store data'
              }, null, 2)}</pre>
            </details>
          </div>
        )}

        {!cartItems || cartItems.length === 0 ? (
          <div style={styles.emptyCart}>
            <div style={styles.emptyCartIcon}>
              <ShoppingCart size={80} />
            </div>
            <h2>Your cart is empty</h2>
            <p>No items from {storeData?.name || `seller ${sellerPhone}`} in your cart yet.</p>
            <div style={styles.emptyCartActions}>
              <button
                onClick={handleBackClick}
                style={styles.continueShoppingButton}
              >
                <Package size={20} />
                <span>Continue Shopping</span>
              </button>
              <Link href="/cart" style={styles.viewAllCartsButton}>
                <ShoppingCart size={20} />
                <span>View All Carts</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ✅ Enhanced Store Header */}
            <div style={styles.storeHeaderCard}>
              <div style={styles.storeHeaderContent}>
                <div style={styles.storeIconSection}>
                  <div style={styles.storeLogo}>
                    <Store size={32} />
                  </div>
                </div>
                <div style={styles.storeInfoSection}>
                  <h2 style={styles.storeName}>
                    {storeData?.name || `Store ${sellerPhone}`}
                  </h2>
                  <div style={styles.storeDetails}>
                    <div style={styles.storeDetailItem}>
                      <Phone size={16} />
                      <span>+91 {sellerPhone}</span>
                    </div>
                    {storeData?.address && (
                      <div style={styles.storeDetailItem}>
                        <MapPin size={16} />
                        <span>{storeData.address}</span>
                      </div>
                    )}
                    {storeData?.rating && (
                      <div style={styles.storeDetailItem}>
                        <Star size={16} />
                        <span>{storeData.rating} ({storeData.review_count || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.paymentMethods}>
                    {storeData?.accepts_cod && (
                      <span style={styles.paymentBadge}>
                        <Wallet size={14} />
                        Cash on Delivery
                      </span>
                    )}
                    {storeData?.payment_method !== 'NONE' && (
                      <span style={styles.paymentBadge}>
                        <CreditCard size={14} />
                        Online Payment
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.storeActions}>
                  <Link 
                    href={`/shop/${sellerPhone}`}
                    style={styles.visitStoreButton}
                  >
                    <ExternalLink size={16} />
                    Visit Store
                  </Link>
                  <button
                    onClick={handleClearCart}
                    style={styles.clearAllButton}
                    title="Clear all items from this seller"
                  >
                    <Trash2 size={16} />
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Stock validation warnings */}
            {(!stockValidation.valid || stockValidation.warnings?.length > 0) && (
              <div style={styles.validationSection}>
                {!stockValidation.valid && (
                  <div style={styles.stockErrors}>
                    <AlertCircle size={16} />
                    <div>
                      <strong>Stock Issues:</strong>
                      <ul>
                        {stockValidation.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {stockValidation.warnings?.length > 0 && (
                  <div style={styles.stockWarnings}>
                    {stockValidation.warnings.map((warning, index) => (
                      <div key={index} style={styles.warningItem}>
                        <AlertCircle size={14} />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ✅ Single Seller Cart Items */}
            <div style={styles.cartCard}>
              <div style={styles.cartHeader}>
                <h3 style={styles.cartTitle}>
                  <ShoppingCart size={20} />
                  Your Items ({cartItems.length})
                </h3>
                <span style={styles.cartSubtitle}>
                  From {storeData?.name || `Store ${sellerPhone}`}
                </span>
              </div>

              <div style={styles.itemsList}>
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${sellerPhone}-${index}`} style={styles.cartItem}>
                    <div style={styles.itemTopSection}>
                      <div style={styles.itemImageContainer}>
                        <img 
                          src={getImageUrl(item.main_image_url || item.image_url)} 
                          alt={item.name || 'Product'} 
                          style={styles.itemImage}
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/80x80/e9ecef/6c757d?text=No+Image';
                          }}
                        />
                      </div>
                      
                      <div style={styles.itemInfo}>
                        <Link href={getProductUrl(item)} style={styles.itemLink}>
                          <h4 style={styles.itemName}>{item.name || 'Product'}</h4>
                        </Link>
                        {item.model_name && (
                          <p style={styles.itemModel}>{item.model_name}</p>
                        )}
                        <div style={styles.priceSection}>
                          <span style={styles.currentPrice}>{formatPrice(item.price)}</span>
                          {item.mrp && parseFloat(item.mrp) > parseFloat(item.price) && (
                            <span style={styles.originalPrice}>{formatPrice(item.mrp)}</span>
                          )}
                        </div>
                        {item.online_stock !== undefined && (
                          <div style={styles.stockInfo}>
                            {item.online_stock > 0 ? (
                              <span style={styles.inStock}>
                                <Check size={12} />
                                {item.online_stock} in stock
                              </span>
                            ) : (
                              <span style={styles.outOfStock}>
                                <AlertCircle size={12} />
                                Out of stock
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        style={styles.removeButton}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Quantity Controls and Total */}
                    <div style={styles.itemBottomSection}>
                      <div style={styles.quantityControls}>
                        <span style={styles.quantityLabel}>Quantity:</span>
                        <div style={styles.quantitySection}>
                          <button
                            onClick={() => handleQuantityChange(item.id, (parseInt(item.quantity) || 1) - 1)}
                            style={{
                              ...styles.quantityButton,
                              ...((parseInt(item.quantity) || 1) <= 1 ? styles.quantityButtonDisabled : {})
                            }}
                            disabled={(parseInt(item.quantity) || 1) <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          
                          <span style={styles.quantityDisplay}>{parseInt(item.quantity) || 1}</span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, (parseInt(item.quantity) || 1) + 1)}
                            style={{
                              ...styles.quantityButton,
                              ...(item.online_stock && (parseInt(item.quantity) || 1) >= item.online_stock ? styles.quantityButtonDisabled : {})
                            }}
                            disabled={item.online_stock && (parseInt(item.quantity) || 1) >= item.online_stock}
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div style={styles.itemTotalSection}>
                        <span style={styles.totalLabel}>Total:</span>
                        <span style={styles.itemTotal}>
                          {formatPrice((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Enhanced Seller Checkout Summary */}
            <div style={styles.checkoutCard}>
              <div style={styles.checkoutHeader}>
                <h3 style={styles.checkoutTitle}>
                  <CreditCard size={20} />
                  Order Summary
                </h3>
                <span style={styles.checkoutSubtitle}>
                  Ready to checkout from {storeData?.name || `Store ${sellerPhone}`}
                </span>
              </div>
              
              <div style={styles.summaryDetails}>
                <div style={styles.summaryRow}>
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span style={styles.subtotalAmount}>{formatPrice(cartTotal)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Delivery</span>
                  <span style={styles.freeDelivery}>Free</span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Taxes</span>
                  <span>Included</span>
                </div>
                <hr style={styles.divider} />
                <div style={{...styles.summaryRow, ...styles.totalRow}}>
                  <strong>Total Amount</strong>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>
              </div>

              <div style={styles.checkoutActions}>
                <button
                  onClick={handleCheckout}
                  style={{
                    ...styles.checkoutButton,
                    ...((!stockValidation.valid) ? styles.checkoutButtonDisabled : {})
                  }}
                  disabled={!stockValidation.valid}
                >
                  {!stockValidation.valid ? (
                    <>
                      <AlertCircle size={18} />
                      Resolve Stock Issues
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Proceed to Checkout
                    </>
                  )}
                </button>

                <div style={styles.checkoutNote}>
                  <Truck size={16} />
                  <span>Free delivery • Secure checkout • Easy returns</span>
                </div>
              </div>
            </div>

            {/* ✅ Related Actions */}
            <div style={styles.relatedActions}>
              <Link href="/cart" style={styles.actionButton}>
                <ShoppingCart size={18} />
                View All Carts
              </Link>
              <Link href={`/shop/${sellerPhone}`} style={styles.actionButton}>
                <Package size={18} />
                Continue Shopping
              </Link>
              <Link href={`/shop/${sellerPhone}/wishlist`} style={styles.actionButton}>
                <Heart size={18} />
                View Wishlist
              </Link>
            </div>
          </>
        )}
      </div>
      
      <Footer />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ✅ Enhanced styles for seller-specific cart
const styles = {
  pageContainer: { minHeight: '100vh', backgroundColor: '#f8fafc' },
  
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '20px', padding: '40px' },
  loadingSubtext: { fontSize: '0.9rem', color: '#666', margin: 0 },
  
  errorContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '20px', padding: '40px', textAlign: 'center' },
  retryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' },
  
  debugInfo: { margin: '10px 20px', padding: '10px', backgroundColor: '#fef3c7', border: '1px solid #d97706', borderRadius: '8px', fontSize: '12px' },
  
  container: { maxWidth: '900px', margin: '0 auto', padding: '0' },
  
  // Store context indicator
  storeIndicator: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#dbeafe', borderBottom: '1px solid #3b82f6', fontSize: '14px', color: '#1e40af', fontWeight: '500' },
  
  // Mobile Header
  mobileHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: '0', zIndex: 100 },
  backButton: { background: 'none', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '8px', color: '#64748b', transition: 'all 0.2s' },
  title: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', margin: 0, flex: 1, textAlign: 'center' },
  cartCount: { fontSize: '0.8rem', color: '#64748b', fontWeight: '500' },
  
  // Empty Cart
  emptyCart: { textAlign: 'center', padding: '80px 20px', backgroundColor: 'white', margin: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  emptyCartIcon: { color: '#cbd5e1', marginBottom: '20px' },
  emptyCartActions: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '24px' },
  continueShoppingButton: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' },
  viewAllCartsButton: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#f8fafc', color: '#64748b', textDecoration: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '500', transition: 'all 0.3s ease' },
  
  // ✅ Enhanced Store Header Card
  storeHeaderCard: { backgroundColor: 'white', margin: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' },
  storeHeaderContent: { display: 'flex', alignItems: 'flex-start', padding: '24px', gap: '20px' },
  storeIconSection: { flexShrink: 0 },
  storeLogo: { width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' },
  storeInfoSection: { flex: 1 },
  storeName: { fontSize: '1.4rem', fontWeight: '700', color: '#1e293b', margin: '0 0 12px 0' },
  storeDetails: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' },
  storeDetailItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b' },
  paymentMethods: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  paymentBadge: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '500' },
  storeActions: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' },
  visitStoreButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s' },
  clearAllButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' },
  
  // Validation section
  validationSection: { margin: '0 20px', marginBottom: '20px' },
  stockErrors: { display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.875rem', marginBottom: '8px' },
  stockWarnings: { display: 'flex', flexDirection: 'column', gap: '4px' },
  warningItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#92400e' },
  
  // ✅ Enhanced Cart Card
  cartCard: { backgroundColor: 'white', margin: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', overflow: 'hidden' },
  cartHeader: { padding: '20px 24px 16px 24px', borderBottom: '2px solid #f1f5f9', backgroundColor: '#fafbfc' },
  cartTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' },
  cartSubtitle: { fontSize: '0.9rem', color: '#64748b' },
  
  // Items List
  itemsList: { padding: '0 24px' },
  
  // Cart Item
  cartItem: { padding: '20px 0', borderBottom: '1px solid #f1f5f9', animation: 'fadeIn 0.6s ease-out' },
  itemTopSection: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' },
  itemImageContainer: { flexShrink: 0 },
  itemImage: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' },
  itemInfo: { flex: 1, minWidth: 0 },
  itemLink: { textDecoration: 'none', color: 'inherit' },
  itemName: { fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: '0 0 6px 0', lineHeight: '1.4' },
  itemModel: { fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px 0' },
  priceSection: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' },
  currentPrice: { fontSize: '1.1rem', fontWeight: '700', color: '#059669' },
  originalPrice: { fontSize: '0.9rem', color: '#64748b', textDecoration: 'line-through' },
  stockInfo: { marginTop: '4px' },
  inStock: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#059669', fontWeight: '500' },
  outOfStock: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#dc2626', fontWeight: '500' },
  removeButton: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '6px', flexShrink: 0, transition: 'all 0.2s' },
  
  // Bottom Section
  itemBottomSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  quantityControls: { display: 'flex', alignItems: 'center', gap: '12px' },
  quantityLabel: { fontSize: '0.9rem', color: '#64748b', fontWeight: '500' },
  quantitySection: { display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' },
  quantityButton: { background: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  quantityButtonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  quantityDisplay: { padding: '8px 16px', fontWeight: '600', fontSize: '1rem', minWidth: '40px', textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', backgroundColor: 'white' },
  itemTotalSection: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  totalLabel: { fontSize: '0.8rem', color: '#64748b' },
  itemTotal: { fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' },
  
  // ✅ Enhanced Checkout Card
  checkoutCard: { backgroundColor: 'white', margin: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '2px solid #10b981', overflow: 'hidden' },
  checkoutHeader: { padding: '20px 24px 16px 24px', borderBottom: '2px solid #f0fdf4', backgroundColor: '#f0fdf4' },
  checkoutTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: '700', color: '#047857', margin: '0 0 4px 0' },
  checkoutSubtitle: { fontSize: '0.9rem', color: '#059669' },
  
  summaryDetails: { padding: '24px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '1rem' },
  subtotalAmount: { fontWeight: '600', color: '#1e293b' },
  freeDelivery: { color: '#059669', fontWeight: '600' },
  divider: { border: 'none', borderTop: '2px solid #e2e8f0', margin: '16px 0' },
  totalRow: { fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0' },
  
  checkoutActions: { padding: '0 24px 24px 24px' },
  checkoutButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)', marginBottom: '12px' },
  checkoutButtonDisabled: { backgroundColor: '#9ca3af', color: '#6b7280', cursor: 'not-allowed', boxShadow: 'none' },
  checkoutNote: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' },
  
  // ✅ Related Actions
  relatedActions: { display: 'flex', gap: '12px', padding: '20px', justifyContent: 'center', flexWrap: 'wrap' },
  actionButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#f8fafc', color: '#64748b', textDecoration: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.2s' }
};
