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
  Package
} from 'lucide-react';

export default function CartPage() {
  const { carts, removeFromCart, updateQuantity } = useCart();
  
  const sellerPhonesWithItems = Object.keys(carts || {}).filter(phone => carts[phone].length > 0);

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
      updateQuantity(phone, itemId, newQuantity);
    }
  };

  const handleRemoveItem = (phone, itemId) => {
    if (window.confirm('Remove this item from your cart?')) {
      removeFromCart(phone, itemId);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Header />
      
      <div style={styles.container}>
        {/* Mobile Header */}
        <div style={styles.mobileHeader}>
          <button 
            onClick={() => window.history.back()} 
            style={styles.backButton}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={styles.title}>
            <ShoppingCart size={24} />
            <span>Your Cart</span>
          </h1>
          <div style={styles.cartCount}>
            {sellerPhonesWithItems.reduce((total, phone) => 
              total + carts[phone].reduce((sum, item) => sum + item.quantity, 0), 0
            )} items
          </div>
        </div>

        {sellerPhonesWithItems.length === 0 ? (
          <div style={styles.emptyCart}>
            <div style={styles.emptyCartIcon}>
              <ShoppingCart size={80} />
            </div>
            <h2>Your cart is empty</h2>
            <p>Discover amazing products from Kerala sellers!</p>
            <Link href="/shop" style={styles.startShoppingButton}>
              <Package size={20} />
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div style={styles.cartList}>
            {sellerPhonesWithItems.map(phone => {
              const cartItems = carts[phone];
              const storeName = cartItems[0]?.store?.name || `Store (${phone})`;
              const cartTotal = calculateCartTotal(cartItems);
              
              return (
                <div key={phone} style={styles.storeCard}>
                  {/* Store Header */}
                  <div style={styles.storeHeader}>
                    <div style={styles.storeInfo}>
                      <Store size={18} />
                      <span style={styles.storeName}>{storeName}</span>
                    </div>
                    <span style={styles.itemCount}>
                      {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Cart Items */}
                  <div style={styles.itemsList}>
                    {cartItems.map(item => (
                      <div key={item.id} style={styles.mobileCartItem}>
                        {/* Product Image and Basic Info */}
                        <div style={styles.itemTopSection}>
                          <div style={styles.itemImageContainer}>
                            <img 
                              src={item.main_image_url || item.image_url || 'https://placehold.co/80x80'} 
                              alt={item.name} 
                              style={styles.itemImage}
                            />
                          </div>
                          
                          <div style={styles.itemInfo}>
                            <Link href={`/product/${item.id}`} style={styles.itemLink}>
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
                          </div>

                          <button 
                            onClick={() => handleRemoveItem(phone, item.id)}
                            style={styles.mobileRemoveButton}
                            aria-label="Remove item"
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
                                style={styles.quantityButton}
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={16} />
                              </button>
                              
                              <span style={styles.quantityDisplay}>{item.quantity}</span>
                              
                              <button
                                onClick={() => handleQuantityChange(phone, item.id, item.quantity + 1)}
                                style={styles.quantityButton}
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
                    
                    <Link href={`/checkout/${phone}`} style={styles.checkoutButton}>
                      Proceed to Checkout
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
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
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0',
    '@media (min-width: 768px)': {
      maxWidth: '900px',
      padding: '20px'
    }
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
    zIndex: 100,
    '@media (min-width: 768px)': {
      position: 'static',
      backgroundColor: 'transparent',
      border: 'none',
      padding: '20px 0'
    }
  },

  backButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    borderRadius: '8px',
    color: '#64748b',
    transition: 'all 0.2s',
    '@media (min-width: 768px)': {
      display: 'none'
    }
  },

  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    '@media (min-width: 768px)': {
      fontSize: '2rem',
      justifyContent: 'center',
      marginBottom: '2rem'
    }
  },

  cartCount: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '500',
    '@media (min-width: 768px)': {
      display: 'none'
    }
  },

  // Empty Cart
  emptyCart: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    margin: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    '@media (min-width: 768px)': {
      margin: '0',
      borderRadius: '8px'
    }
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
    padding: '0 0 20px 0',
    '@media (min-width: 768px)': {
      gap: '30px',
      padding: '0'
    }
  },

  // Store Card
  storeCard: {
    backgroundColor: 'white',
    borderRadius: '0',
    boxShadow: 'none',
    borderBottom: '8px solid #f1f5f9',
    '@media (min-width: 768px)': {
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  },

  // Store Header
  storeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px 12px 20px',
    borderBottom: '1px solid #f1f5f9',
    '@media (min-width: 768px)': {
      padding: '0 0 16px 0',
      marginBottom: '16px'
    }
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

  itemCount: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500'
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
    animation: 'fadeIn 0.6s ease-out',
    '@media (min-width: 768px)': {
      padding: '20px 0'
    }
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
    flexWrap: 'wrap'
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
    gap: '16px',
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: '12px'
    }
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
    transition: 'all 0.2s',
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
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
    gap: '4px',
    '@media (max-width: 480px)': {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
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
    borderTop: '1px solid #e2e8f0',
    '@media (min-width: 768px)': {
      backgroundColor: 'transparent',
      borderTop: '1px solid #e2e8f0',
      marginTop: '20px',
      paddingTop: '20px',
      padding: '20px 0 0 0'
    }
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
    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
    ':hover': {
      backgroundColor: '#047857',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)'
    }
  }
};
