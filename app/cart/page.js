'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
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
  Globe
} from 'lucide-react';
import { useState, useEffect } from 'react';

// ✅ Enhanced API base URL handling
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

export default function CartPage() {
  const { 
    carts, 
    removeFromCart, 
    updateQuantity, 
    validateCartStock, 
    getCartStats,
    clearCartForSeller 
  } = useCart();
  
  const [stockValidations, setStockValidations] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });

  const sellerPhonesWithItems = Object.keys(carts || {}).filter(phone => carts[phone].length > 0);

  // ✅ Get current store info from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
      setCurrentStoreInfo({
        storeId: storeMatch ? storeMatch[1] : null,
        isInStore: !!storeMatch
      });
    }
  }, []);

  // ✅ Validate stock for all cart items
  useEffect(() => {
    const validateAllCarts = () => {
      const validations = {};
      sellerPhonesWithItems.forEach(phone => {
        validations[phone] = validateCartStock(phone);
      });
      setStockValidations(validations);
    };

    if (sellerPhonesWithItems.length > 0) {
      validateAllCarts();
    }
  }, [carts, sellerPhonesWithItems, validateCartStock]);

  const calculateCartTotal = (cartItems) => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (phone, itemId, newQuantity) => {
    if (newQuantity >= 1) {
      const success = updateQuantity(phone, itemId, newQuantity);
      if (!success) {
        // Show error if stock is insufficient
        alert('Insufficient stock for this quantity');
      }
    }
  };

  const handleRemoveItem = (phone, itemId) => {
    const item = carts[phone]?.find(item => item.id === itemId);
    const itemName = item?.name || 'item';
    
    if (window.confirm(`Remove "${itemName}" from your cart?`)) {
      removeFromCart(phone, itemId);
    }
  };

  // ✅ Enhanced clear cart function
  const handleClearCart = (phone) => {
    const cartItems = carts[phone] || [];
    const storeName = cartItems[0]?.store?.name || `Store (${phone})`;
    
    if (window.confirm(`Clear all items from ${storeName}?`)) {
      clearCartForSeller(phone);
    }
  };

  // ✅ Store-aware back navigation
  const handleBackClick = () => {
    if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
      // If in store context, go back to store
      window.location.href = `/store/${currentStoreInfo.storeId}`;
    } else {
      // Go back to previous page or home
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
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
    if (currentStoreInfo.isInStore && currentStoreInfo.storeId) {
      return `/store/${currentStoreInfo.storeId}/product/${item.id}`;
    }
    
    if (item.seller_phone) {
      return `/shop/${item.seller_phone}/product/${item.id}`;
    }
    
    return `/product/${item.id}`;
  };

  // ✅ Calculate grand total across all stores
  const calculateGrandTotal = () => {
    return sellerPhonesWithItems.reduce((total, phone) => 
      total + calculateCartTotal(carts[phone]), 0
    );
  };

  const grandTotal = calculateGrandTotal();
  const totalItems = sellerPhonesWithItems.reduce((total, phone) => 
    total + carts[phone].reduce((sum, item) => sum + item.quantity, 0), 0
  );

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
            <ShoppingCart size={24} />
            <span>Your Cart</span>
          </h1>
          <div style={styles.cartCount}>
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ✅ Store context indicator */}
        {currentStoreInfo.isInStore && (
          <div style={styles.storeIndicator}>
            <Globe size={16} />
            <span>Shopping in store context • Store ID: {currentStoreInfo.storeId}</span>
          </div>
        )}

        {sellerPhonesWithItems.length === 0 ? (
          <div style={styles.emptyCart}>
            <div style={styles.emptyCartIcon}>
              <ShoppingCart size={80} />
            </div>
            <h2>Your cart is empty</h2>
            <p>Discover amazing products from Kerala sellers!</p>
            <Link 
              href={currentStoreInfo.isInStore ? `/store/${currentStoreInfo.storeId}` : "/"} 
              style={styles.startShoppingButton}
            >
              <Package size={20} />
              <span>
                {currentStoreInfo.isInStore ? 'Continue Shopping in Store' : 'Start Shopping'}
              </span>
            </Link>
          </div>
        ) : (
          <>
            {/* ✅ Grand total summary for multiple stores */}
            {sellerPhonesWithItems.length > 1 && (
              <div style={styles.grandTotalCard}>
                <div style={styles.grandTotalContent}>
                  <div style={styles.grandTotalInfo}>
                    <span style={styles.grandTotalLabel}>
                      Total from {sellerPhonesWithItems.length} store{sellerPhonesWithItems.length > 1 ? 's' : ''}
                    </span>
                    <span style={styles.grandTotalAmount}>{formatPrice(grandTotal)}</span>
                  </div>
                  <div style={styles.grandTotalSubtext}>
                    {totalItems} item{totalItems !== 1 ? 's' : ''} • Checkout by store below
                  </div>
                </div>
              </div>
            )}

            <div style={styles.cartList}>
              {sellerPhonesWithItems.map(phone => {
                const cartItems = carts[phone];
                const storeName = cartItems[0]?.store?.name || cartItems[0]?.storeName || `Store (${phone})`;
                const cartTotal = calculateCartTotal(cartItems);
                const validation = stockValidations[phone] || { valid: true, errors: [], warnings: [] };
                const stats = getCartStats(phone);
                
                return (
                  <div key={phone} style={styles.storeCard}>
                    {/* Store Header */}
                    <div style={styles.storeHeader}>
                      <div style={styles.storeInfo}>
                        <Store size={18} />
                        <span style={styles.storeName}>{storeName}</span>
                        {!validation.valid && (
                          <div style={styles.stockWarningIcon}>
                            <AlertCircle size={16} color="#f59e0b" />
                          </div>
                        )}
                      </div>
                      <div style={styles.storeActions}>
                        <span style={styles.itemCount}>
                          {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => handleClearCart(phone)}
                          style={styles.clearCartButton}
                          title="Clear cart"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* ✅ Stock validation warnings */}
                    {(!validation.valid || validation.warnings?.length > 0) && (
                      <div style={styles.validationSection}>
                        {!validation.valid && (
                          <div style={styles.stockErrors}>
                            <AlertCircle size={16} />
                            <div>
                              <strong>Stock Issues:</strong>
                              <ul>
                                {validation.errors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        {validation.warnings?.length > 0 && (
                          <div style={styles.stockWarnings}>
                            {validation.warnings.map((warning, index) => (
                              <div key={index} style={styles.warningItem}>
                                <AlertCircle size={14} />
                                <span>{warning}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cart Items */}
                    <div style={styles.itemsList}>
                      {cartItems.map(item => (
                        <div key={item.id} style={styles.mobileCartItem}>
                          {/* Product Image and Basic Info */}
                          <div style={styles.itemTopSection}>
                            <div style={styles.itemImageContainer}>
                              <img 
                                src={getImageUrl(item.main_image_url || item.image_url)} 
                                alt={item.name} 
                                style={styles.itemImage}
                                onError={(e) => {
                                  e.target.src = 'https://placehold.co/80x80/e9ecef/6c757d?text=No+Image';
                                }}
                              />
                            </div>
                            
                            <div style={styles.itemInfo}>
                              <Link href={getProductUrl(item)} style={styles.itemLink}>
                                <h3 style={styles.itemName}>{item.name}</h3>
                              </Link>
                              {item.model_name && (
                                <p style={styles.itemModel}>{item.model_name}</p>
                              )}
                              <div style={styles.priceSection}>
                                <span style={styles.currentPrice}>{formatPrice(item.price)}</span>
                                {item.mrp && item.mrp > item.price && (
                                  <span style={styles.originalPrice}>{formatPrice(item.mrp)}</span>
                                )}
                              </div>
                              {/* ✅ Stock indicator */}
                              {item.originalStock !== undefined && (
                                <div style={styles.stockInfo}>
                                  {item.originalStock > 0 ? (
                                    <span style={styles.inStock}>
                                      <Check size={12} />
                                      {item.originalStock} in stock
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
                              onClick={() => handleRemoveItem(phone, item.id)}
                              style={styles.mobileRemoveButton}
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
                                  onClick={() => handleQuantityChange(phone, item.id, item.quantity - 1)}
                                  style={{
                                    ...styles.quantityButton,
                                    ...(item.quantity <= 1 ? styles.quantityButtonDisabled : {})
                                  }}
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={16} />
                                </button>
                                
                                <span style={styles.quantityDisplay}>{item.quantity}</span>
                                
                                <button
                                  onClick={() => handleQuantityChange(phone, item.id, item.quantity + 1)}
                                  style={{
                                    ...styles.quantityButton,
                                    ...(item.originalStock && item.quantity >= item.originalStock ? styles.quantityButtonDisabled : {})
                                  }}
                                  disabled={item.originalStock && item.quantity >= item.originalStock}
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                            
                            <div style={styles.itemTotalSection}>
                              <span style={styles.totalLabel}>Total:</span>
                              <span style={styles.itemTotal}>
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Store Summary */}
                    <div style={styles.storeSummary}>
                      <div style={styles.summaryRow}>
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span style={styles.subtotalAmount}>{formatPrice(cartTotal)}</span>
                      </div>
                      <div style={styles.summaryRow}>
                        <span>Delivery</span>
                        <span style={styles.freeDelivery}>Free</span>
                      </div>
                      <hr style={styles.divider} />
                      <div style={{...styles.summaryRow, ...styles.totalRow}}>
                        <span>Total</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      
                      <Link 
                        href={`/checkout/${phone}`} 
                        style={{
                          ...styles.checkoutButton,
                          ...((!validation.valid) ? styles.checkoutButtonDisabled : {})
                        }}
                        onClick={(e) => {
                          if (!validation.valid) {
                            e.preventDefault();
                            alert('Please resolve stock issues before checkout');
                          }
                        }}
                      >
                        {!validation.valid ? 'Resolve Stock Issues' : 'Proceed to Checkout'}
                      </Link>
                    </div>
                  </div>
                );
              })}
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
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },

  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0'
  },

  // ✅ Store context indicator
  storeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#dbeafe',
    borderBottom: '1px solid #3b82f6',
    fontSize: '14px',
    color: '#1e40af',
    fontWeight: '500'
  },

  // Mobile Header
  mobileHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: '0',
    zIndex: 100
  },

  backButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    borderRadius: '8px',
    color: '#64748b',
    transition: 'all 0.2s'
  },

  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },

  cartCount: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '500'
  },

  // ✅ Grand total card for multiple stores
  grandTotalCard: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    margin: '20px',
    padding: '16px 20px'
  },

  grandTotalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  grandTotalInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  grandTotalLabel: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#166534'
  },

  grandTotalAmount: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#166534'
  },

  grandTotalSubtext: {
    fontSize: '0.875rem',
    color: '#16a34a'
  },

  // Empty Cart
  emptyCart: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    margin: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },

  emptyCartIcon: {
    color: '#cbd5e1',
    marginBottom: '20px'
  },

  startShoppingButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },

  // Cart List
  cartList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '0 0 20px 0'
  },

  // Store Card
  storeCard: {
    backgroundColor: 'white',
    borderRadius: '0',
    boxShadow: 'none',
    borderBottom: '8px solid #f1f5f9'
  },

  // Store Header
  storeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px 12px 20px',
    borderBottom: '1px solid #f1f5f9'
  },

  storeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  storeName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b'
  },

  stockWarningIcon: {
    display: 'flex',
    alignItems: 'center'
  },

  storeActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  itemCount: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500'
  },

  clearCartButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },

  // ✅ Validation section
  validationSection: {
    padding: '0 20px 16px 20px'
  },

  stockErrors: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#991b1b',
    fontSize: '0.875rem',
    marginBottom: '8px'
  },

  stockWarnings: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  warningItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: '#92400e'
  },

  // Items List
  itemsList: {
    display: 'flex',
    flexDirection: 'column'
  },

  // Mobile Cart Item
  mobileCartItem: {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    animation: 'fadeIn 0.6s ease-out'
  },

  itemTopSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px'
  },

  itemImageContainer: {
    flexShrink: 0
  },

  itemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
    backgroundColor: '#f8fafc'
  },

  itemInfo: {
    flex: 1,
    minWidth: 0
  },

  itemLink: {
    textDecoration: 'none',
    color: 'inherit'
  },

  itemName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0',
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },

  itemModel: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '0 0 8px 0'
  },

  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '4px'
  },

  currentPrice: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#059669'
  },

  originalPrice: {
    fontSize: '0.9rem',
    color: '#64748b',
    textDecoration: 'line-through'
  },

  // ✅ Stock info
  stockInfo: {
    marginTop: '4px'
  },

  inStock: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: '#059669',
    fontWeight: '500'
  },

  outOfStock: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: '#dc2626',
    fontWeight: '500'
  },

  mobileRemoveButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    flexShrink: 0,
    transition: 'all 0.2s'
  },

  // Bottom Section
  itemBottomSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  },

  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  quantityLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500'
  },

  quantitySection: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden'
  },

  quantityButton: {
    background: 'white',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },

  quantityButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },

  quantityDisplay: {
    padding: '8px 16px',
    fontWeight: '600',
    fontSize: '1rem',
    minWidth: '40px',
    textAlign: 'center',
    borderLeft: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: 'white'
  },

  itemTotalSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },

  totalLabel: {
    fontSize: '0.8rem',
    color: '#64748b'
  },

  itemTotal: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b'
  },

  // Store Summary
  storeSummary: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0'
  },

  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '1rem'
  },

  subtotalAmount: {
    fontWeight: '600',
    color: '#1e293b'
  },

  freeDelivery: {
    color: '#059669',
    fontWeight: '600'
  },

  divider: {
    border: 'none',
    borderTop: '1px solid #e2e8f0',
    margin: '16px 0'
  },

  totalRow: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px'
  },

  checkoutButton: {
    display: 'block',
    width: '100%',
    padding: '16px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
  },

  checkoutButtonDisabled: {
    backgroundColor: '#9ca3af',
    color: '#6b7280',
    cursor: 'not-allowed',
    boxShadow: 'none'
  }
};
