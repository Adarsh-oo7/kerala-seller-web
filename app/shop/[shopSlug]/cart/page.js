'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Store,
  AlertTriangle,
  Loader,
  Truck,
  Weight
} from 'lucide-react';
import "../../../../styles/Shopslugcart.css";
import SHeader from '../../../../components/common/SHeader';
import { toast } from "react-toastify";
import { useCart } from '../../../../app/context/CartContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? 'https://api.keralasellers.in' : 'http://localhost:8000/api');

export default function ShopCartPage() {
  const { shopSlug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ Cart context
  const {
    carts,
    getCartBySeller,
    updateQuantity: ctxUpdateQuantity,
    removeFromCart,
    clearCartForSeller
  } = useCart();

  const [cartItems, setCartItems] = useState([]);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [urlError, setUrlError] = useState(null);
  const [stockWarnings, setStockWarnings] = useState({});
  const [stockLimits, setStockLimits] = useState({});
  const [validatingStock, setValidatingStock] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ NEW: Delivery calculation state
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);

  useEffect(() => {
    try {
      const token =
        localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.warn('localStorage access error:', error);
      setIsLoggedIn(false);
    }
  }, []);

  const getActualStoreId = () => {
    if (shopSlug === 'undefined' || shopSlug === undefined) {
      setUrlError('Invalid shop slug in URL');
      return null;
    }

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

  const getShopUrl = (path = '') => {
    if (!actualStoreId) {
      console.error('❌ Cannot generate URL - no store ID available');
      return '/';
    }

    if (searchParams.get('id') && shopSlug === 'new') {
      const basePath = `/shop/new${path}`;
      return `${basePath}?id=${actualStoreId}`;
    } else {
      return `/shop/${actualStoreId}${path}`;
    }
  };

  useEffect(() => {
    if (urlError || !actualStoreId) {
      try {
        const multiCarts = JSON.parse(localStorage.getItem('multiCarts') || '{}');
        const availableStores = Object.keys(multiCarts).filter(
          storeId => multiCarts[storeId] && multiCarts[storeId].length > 0
        );

        if (availableStores.length === 1) {
          router.replace(`/shop/${availableStores[0]}/cart`);
          return;
        } else {
          router.replace('/');
          return;
        }
      } catch (error) {
        router.replace('/');
        return;
      }
    }
  }, [urlError, actualStoreId, router]);

  // ✅ Load cart from context + store data
  useEffect(() => {
    const loadCartAndStore = async () => {
      if (!actualStoreId) {
        setLoading(false);
        return;
      }

      const storeCart =
        (getCartBySeller && getCartBySeller(actualStoreId)) ||
        carts[actualStoreId] ||
        [];
      setCartItems(storeCart);

      try {
        const response = await fetch(`${API_BASE_URL}/shop/${actualStoreId}/`);
        if (response.ok) {
          const data = await response.json();
          setStoreData(data.store || data);
        } else {
          setStoreData({
            name: `Store ${actualStoreId}`,
            seller_phone: actualStoreId,
            id: actualStoreId,
          });
        }
      } catch (error) {
        setStoreData({
          name: `Store ${actualStoreId}`,
          seller_phone: actualStoreId,
          id: actualStoreId,
        });
      } finally {
        setLoading(false);
      }
    };

    if (actualStoreId && !urlError) {
      loadCartAndStore();
    }
  }, [actualStoreId, urlError, carts, getCartBySeller]);

  // ✅ Keep local cartItems in sync with context
  useEffect(() => {
    if (!actualStoreId) return;
    const storeCart = carts[actualStoreId] || [];
    setCartItems(storeCart);
  }, [actualStoreId, carts]);

  // ✅ NEW: Calculate delivery charge when cart items change
  useEffect(() => {
    if (cartItems.length === 0) {
      setDeliveryCharge(0);
      setTotalWeight(0);
      setIsFreeDelivery(false);
      return;
    }

    // Calculate total weight
    const weight = cartItems.reduce((sum, item) => {
      const itemWeight = parseFloat(item.weight_kg || 0);
      return sum + (itemWeight * item.quantity);
    }, 0);

    setTotalWeight(weight);

    // Calculate subtotal
    const subtotal = calculateTotal();

    // Delivery logic
    let charge = 0;
    let isFree = true;

    if (weight > 0) {
      // Base charge: ₹50 + ₹10 per kg
      charge = 50 + (weight * 10);
      isFree = false;

      // Free delivery conditions
      if (subtotal >= 500 || weight < 1) {
        charge = 0;
        isFree = true;
      }
    } else {
      // No weight data = Free delivery
      charge = 0;
      isFree = true;
    }

    setDeliveryCharge(charge);
    setIsFreeDelivery(isFree);

    console.log('📦 Cart delivery calculation:', { weight, subtotal, charge, isFree });
  }, [cartItems]);

  // ✅ Validate stock using backend's online_stock field
  // ✅ UPDATED: Validate stock with fallback for missing endpoint
const validateStock = async () => {
  if (!actualStoreId || cartItems.length === 0) return;

  setValidatingStock(true);
  try {
    const warnings = {};
    const limits = {};

    for (const item of cartItems) {
      try {
        // ✅ Try the product endpoint first
        let response = await fetch(
          `${API_BASE_URL}/shop/${actualStoreId}/products/${item.id}/`
        );

        // ✅ If 404, try the main product API instead
        if (!response.ok && response.status === 404) {
          console.log(`⚠️ Shop product endpoint not found for ${item.id}, trying main API`);
          response = await fetch(`${API_BASE_URL}/api/products/${item.id}/`);
        }

        if (response.ok) {
          const product = await response.json();

          const availableStock =
            product.online_stock ?? product.total_stock ?? 0;

          limits[item.id] = availableStock;

          if (item.quantity > availableStock) {
            warnings[item.id] =
              availableStock === 0
                ? 'Out of stock'
                : `Only ${availableStock} available`;
          }
        } else {
          // ✅ If both endpoints fail, assume stock is OK
          console.warn(`⚠️ Could not validate stock for product ${item.id}`);
        }
      } catch (error) {
        console.warn(`⚠️ Stock check failed for product ${item.id}:`, error);
      }
    }

    setStockLimits(limits);
    setStockWarnings(warnings);
  } catch (error) {
    console.warn('⚠️ Stock validation failed:', error);
  } finally {
    setValidatingStock(false);
  }
};


  // ✅ Stock validation
  useEffect(() => {
    if (cartItems.length > 0 && !loading) {
      validateStock();
    } else {
      setStockWarnings({});
      setStockLimits({});
    }
  }, [cartItems, actualStoreId, loading]);

  // ✅ Quantity update with stock validation
// ✅ UPDATED: Quantity update with fallback endpoint
const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity < 1) return;

  const item = cartItems.find(item => item.id === productId);
  if (!item) return;

  if (newQuantity > item.quantity) {
    try {
      // ✅ Try shop endpoint first
      let response = await fetch(
        `${API_BASE_URL}/shop/${actualStoreId}/products/${productId}/`
      );

      // ✅ Fallback to main API if shop endpoint fails
      if (!response.ok && response.status === 404) {
        console.log(`⚠️ Shop product endpoint not found, trying main API`);
        response = await fetch(`${API_BASE_URL}/api/products/${productId}/`);
      }

      if (response.ok) {
        const product = await response.json();

        const availableStock =
          product.online_stock ?? product.total_stock ?? 0;

        if (newQuantity > availableStock) {
          toast.error(
            availableStock === 0
              ? 'This item is out of stock'
              : `Only ${availableStock} ${
                  availableStock === 1 ? 'item' : 'items'
                } available in stock`,
            {
              position: 'bottom-center',
              autoClose: 3000,
              theme: 'colored',
            }
          );

          setStockLimits(prev => ({ ...prev, [productId]: availableStock }));
          return;
        }

        setStockLimits(prev => ({ ...prev, [productId]: availableStock }));
      } else {
        // ✅ If validation fails, allow the update
        console.warn(`⚠️ Could not validate stock for product ${productId}, allowing update`);
      }
    } catch (error) {
      console.error('❌ Stock check failed:', error);
      // ✅ Allow update if validation fails
      console.warn('⚠️ Stock validation failed, allowing quantity update');
    }
  }

  // ✅ Update via context
  if (ctxUpdateQuantity && actualStoreId) {
    ctxUpdateQuantity(actualStoreId, productId, newQuantity);
  }
};


  const isPlusButtonDisabled = (productId, currentQuantity) => {
    const maxStock = stockLimits[productId];
    if (maxStock === undefined) return false;
    return maxStock === 0 || currentQuantity >= maxStock;
  };

  const removeItem = (productId) => {
    toast.error(
      ({ closeToast }) => (
        <div className="cart-remove-toast">
          <p className="cart-remove-text">Remove this item from cart?</p>
          <div className="cart-remove-actions">
            <button
              className="cart-remove-btn danger"
              onClick={() => {
                if (removeFromCart && actualStoreId) {
                  removeFromCart(actualStoreId, productId);
                }
                toast.success('Item removed from cart');
                closeToast();
              }}
            >
              Remove
            </button>
            <button className="cart-remove-btn cancel" onClick={closeToast}>
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        theme: 'colored',
        className: 'cart-remove-toast-wrapper',
      }
    );
  };

  const clearCart = () => {
    toast.error(
      ({ closeToast }) => (
        <div className="cart-remove-toast">
          <p className="cart-remove-text">Clear all items from cart?</p>
          <div className="cart-remove-actions">
            <button
              className="cart-remove-btn danger"
              onClick={() => {
                if (clearCartForSeller && actualStoreId) {
                  clearCartForSeller(actualStoreId);
                }
                toast.success('Cart cleared');
                closeToast();
              }}
            >
              Clear
            </button>
            <button className="cart-remove-btn cancel" onClick={closeToast}>
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        theme: 'colored',
        className: 'cart-remove-toast-wrapper',
      }
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  // ✅ UPDATED: Calculate grand total with delivery
  const calculateGrandTotal = () => {
    return calculateTotal() + deliveryCharge;
  };

  const formatPrice = (price) => `₹${parseFloat(price).toFixed(2)}`;

  const handleCheckout = () => {
    if (!actualStoreId) {
      alert('Store ID not found. Please refresh the page and try again.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const invalidItems = cartItems.filter(
      item => !item.id || !item.name || !item.price || item.quantity < 1
    );

    if (invalidItems.length > 0) {
      alert(
        'Some items in your cart are invalid. Please refresh the page and try again.'
      );
      return;
    }

    const hasStockIssues = Object.keys(stockWarnings).length > 0;
    if (hasStockIssues) {
      const proceed = window.confirm(
        'Some items in your cart have stock issues. Do you want to continue anyway? You may need to adjust quantities during checkout.'
      );
      if (!proceed) return;
    }

    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('buyerAccessToken');
    if (!token) {
      const loginUrl = getShopUrl('/login');
      const currentUrl = getShopUrl('/cart');
      router.push(`${loginUrl}?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    router.push(getShopUrl('/checkout'));
  };

  const handleBackClick = () => router.push(getShopUrl(''));
  const handleContinueShopping = () => router.push(getShopUrl(''));

  if (loading || urlError) {
    return (
      <div className="shopslugcartpagecontainer" style={styles.pageContainer}>
        <SHeader store={storeData} isLoggedIn={isLoggedIn} />
        <div style={styles.loadingContainer}>
          {urlError ? (
            <>
              <AlertTriangle size={48} color="#ef4444" />
              <h2>Invalid Cart URL</h2>
              <p>Redirecting...</p>
            </>
          ) : (
            <>
              <div style={styles.spinner}></div>
              <p>Loading your cart...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!actualStoreId) {
    return (
      <div className="shopslugcartpagecontainer" style={styles.pageContainer}>
        <SHeader store={null} isLoggedIn={isLoggedIn} />
        <div style={styles.errorContainer}>
          <Store size={48} color="#ef4444" />
          <h2>Store Not Found</h2>
          <button
            onClick={() => router.push('/')}
            style={styles.homeButton}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shopslugcartpagecontainer" style={styles.pageContainer}>
      <SHeader store={storeData} isLoggedIn={isLoggedIn} />

      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={handleBackClick} style={styles.backButton}>
            <ArrowLeft size={20} color="red" />
          </button>
          <h1 className="carttitle" style={styles.title}>
            {storeData?.name || `Store ${actualStoreId}`} Cart
          </h1>
          {cartItems.length > 0 && (
            <button
              className="shopcartclearbutton"
              onClick={clearCart}
              style={styles.clearButton}
            >
              Clear All
            </button>
          )}
        </div>

        <div className="storeindicator" style={styles.storeIndicator}>
          <Store size={16} color="white" />
          <span>
            Shopping at {storeData?.name || `Store ${actualStoreId}`} •{' '}
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </span>
          {validatingStock && (
            <div style={styles.stockValidating}>
              <Loader size={12} />
              <span>Checking stock...</span>
            </div>
          )}
        </div>

        {Object.keys(stockWarnings).length > 0 && (
          <div style={styles.stockAlert}>
            <AlertTriangle size={16} />
            <span>
              Some items have stock issues. Please review quantities below.
            </span>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div style={styles.emptyState}>
            <ShoppingCart
              className="shopslugcartemptyicon"
              size={48}
              color="#ccc"
            />
            <h2 className="shopslugcartemptytitle">Your cart is empty</h2>
            <p className="shopslugcartemptytext">
              Add some items from {storeData?.name || `Store ${actualStoreId}`}{' '}
              to get started.
            </p>
            <button
              className="shopslugcartemptybtn"
              onClick={handleContinueShopping}
              style={styles.shopButton}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout" style={styles.cartLayout}>
            <div style={styles.cartItemsSection}>
              <div className="cart-items" style={styles.cartItems}>
                {cartItems.map(item => {
                  const plusDisabled = isPlusButtonDisabled(
                    item.id,
                    item.quantity
                  );

                  return (
                    <div
                      className="cart-item"
                      key={item.id}
                      style={{
                        ...styles.cartItem,
                        ...(stockWarnings[item.id]
                          ? styles.cartItemWarning
                          : {}),
                      }}
                    >
                      <div
                        className="cart-item-image"
                        style={styles.imageColumn}
                      >
                        <img
                          src={
                            item.main_image_url ||
                            item.image_url ||
                            '/placeholder.svg'
                          }
                          alt={item.name}
                          style={styles.itemImage}
                          onError={e => {
                            e.target.src = '/placeholder.svg';
                          }}
                        />
                        <div
                          className="total-price-below-image"
                          style={styles.totalPriceBelowImage}
                        >
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>

                      <div className="item-info" style={styles.itemInfo}>
                        <h3 className="item-name" style={styles.itemName}>
                          {item.name}
                        </h3>
                        <p className="item-price" style={styles.itemPrice}>
                          {formatPrice(item.price)} each
                        </p>
                        
                        {/* ✅ NEW: Weight display */}
                        {item.weight_kg && item.weight_kg > 0 && (
                          <p style={styles.weightInfo}>
                            <Weight size={14} />
                            {item.weight_kg} kg × {item.quantity} = {(item.weight_kg * item.quantity).toFixed(2)} kg
                          </p>
                        )}

                        {stockWarnings[item.id] && (
                          <p style={styles.stockWarning}>
                            ⚠️ {stockWarnings[item.id]}
                          </p>
                        )}

                        <div style={styles.quantityControls}>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            style={{
                              ...styles.quantityButton,
                              opacity: item.quantity <= 1 ? 0.5 : 1,
                              cursor:
                                item.quantity <= 1
                                  ? 'not-allowed'
                                  : 'pointer',
                            }}
                          >
                            <Minus backgroundColor="#FDFFF0" size={16} />
                          </button>
                          <span style={styles.quantity}>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={plusDisabled}
                            style={{
                              ...styles.quantityButton,
                              opacity: plusDisabled ? 0.5 : 1,
                              cursor: plusDisabled
                                ? 'not-allowed'
                                : 'pointer',
                            }}
                            title={
                              plusDisabled
                                ? `Max stock: ${stockLimits[item.id]}`
                                : 'Increase quantity'
                            }
                          >
                            <Plus backgroundColor="#FDFFF0" size={16} />
                          </button>
                        </div>

                        <button
                          className="remove-button-below-quantity"
                          onClick={() => removeItem(item.id)}
                          style={styles.removeButtonBelowQuantity}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="cart-summary-section"
              style={styles.cartSummarySection}
            >
              <div style={styles.cartSummary}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>
                    Items ({cartItems.length})
                  </span>
                  <span style={styles.summaryValue}>
                    {formatPrice(calculateTotal())}
                  </span>
                </div>

                {/* ✅ NEW: Delivery Charge Row with Weight */}
                <div style={styles.summaryRow}>
                  <span style={{ ...styles.summaryLabel, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={16} />
                    Delivery
                    {totalWeight > 0 && (
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        ({totalWeight.toFixed(2)} kg)
                      </span>
                    )}
                  </span>
                  {isFreeDelivery ? (
                    <span style={{ ...styles.summaryValue, color: '#10b981', fontWeight: '700' }}>
                      FREE 🎉
                    </span>
                  ) : (
                    <span style={styles.summaryValue}>
                      {formatPrice(deliveryCharge)}
                    </span>
                  )}
                </div>

                {Object.keys(stockWarnings).length > 0 && (
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Stock Issues</span>
                    <span style={styles.summaryWarning}>
                      {Object.keys(stockWarnings).length} item
                      {Object.keys(stockWarnings).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div style={styles.totalRow}>
                  <span className="totallabel" style={styles.totalLabel}>
                    Total
                  </span>
                  <span className="totallabel" style={styles.totalValue}>
                    {formatPrice(calculateGrandTotal())}
                  </span>
                </div>

                <button
                  className="proceedbtn"
                  onClick={handleCheckout}
                  style={{
                    ...styles.checkoutButton,
                    backgroundColor:
                      cartItems.length === 0 ? '#ccc' : '#10b981',
                    cursor:
                      cartItems.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                  disabled={cartItems.length === 0}
                >
                  <CreditCard size={18} />
                  Proceed to Checkout
                </button>

                <button
                  className="continuebtn"
                  onClick={handleContinueShopping}
                  style={styles.continueButton}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { minHeight: '100vh', backgroundColor: '#FDFFF0', paddingTop: '130px' },
  container: { backgroundColor: "#FDFFF0", padding: "20px", margin: "0 auto", overflowX: "hidden" },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 90px)', gap: '20px', textAlign: 'center' },
  spinner: { width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  errorContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 90px)', gap: '20px', textAlign: 'center', padding: '40px' },
  homeButton: { padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '16px', boxShadow: '0px 2px 3px rgba(0,0,0,0.3)' },
  backButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '8px', borderRadius: '6px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1f2937', flex: 1, textAlign: 'center' },
  clearButton: { background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' },
  storeIndicator: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1a4845', border: '1px solid white', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: 'white', fontWeight: '500' },
  stockValidating: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' },
  stockAlert: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#92400e', fontWeight: '500' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px', backgroundColor: '#FDFFF0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  shopButton: { padding: '12px 24px', backgroundColor: '#1a4845', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px', fontSize: '16px', fontWeight: '600', transition: 'all 0.2s' },
  cartItems: { display: 'grid', gap: '16px', width: '100%', justifyContent: 'center', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' },
  cartItem: { display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '16px', backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', transition: 'all 0.2s', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box', maxWidth: '420px', justifyContent: 'center' },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 },
  imageColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '27px', flexShrink: 0 },
  totalPriceBelowImage: { fontSize: '16px', fontWeight: '700', color: '#1f2937' },
  quantityControls: { display: 'flex', alignItems: 'center', gap: '0px', marginTop: '4px', borderRadius: '8px', padding: '4px' },
  cartItemWarning: { borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
  itemImage: { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid #e5e7eb' },
  itemName: { fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 6px 0', lineHeight: '1.4' },
  itemPrice: { fontSize: '14px', color: '#059669', margin: '0 0 4px 0', fontWeight: '600' },
  weightInfo: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' },
  stockWarning: { fontSize: '12px', color: '#ef4444', fontWeight: '500', margin: '4px 0 0 0' },
  quantityButton: { width: '26px', height: '26px', border: '1px solid #d1d5db', backgroundColor: '#FDFFF0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: '#374151' },
  quantity: { minWidth: '32px', textAlign: 'center', fontWeight: '700', color: '#1f2937', fontSize: '16px' },
  removeButtonBelowQuantity: { marginTop: '8px', background: 'rgba(239, 68, 68, 0.75)', border: '1px solid #ef4444', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: 'white', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: '500', alignSelf: 'auto' },
  cartSummary: { backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
  cartLayout: { display: "grid", gridTemplateColumns: "1fr 350px", gap: "20px", alignItems: "start" },
  cartItemsSection: { display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 },
  cartSummarySection: { position: "sticky", top: "110px", minWidth: 0 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #f3f4f6' },
  summaryLabel: { fontSize: '15px', color: '#6b7280', fontWeight: '500' },
  summaryValue: { fontSize: '15px', color: '#1f2937', fontWeight: '600' },
  summaryWarning: { fontSize: '15px', color: '#ef4444', fontWeight: '600' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', marginBottom: '24px', borderTop: '2px solid #e5e7eb' },
  totalLabel: { fontSize: '20px', fontWeight: '700', color: '#1f2937' },
  totalValue: { fontSize: '20px', fontWeight: '700', color: '#059669' },
  checkoutButton: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'white', border: 'none', borderRadius: '10px', padding: '16px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginBottom: '12px', transition: 'all 0.2s' },
  continueButton: { width: '100%', backgroundColor: '#FDFFF0', color: '#374151', border: '1px solid #d1d5db', borderRadius: '10px', padding: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' }
};
