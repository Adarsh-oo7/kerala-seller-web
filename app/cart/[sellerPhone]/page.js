'use client';

import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Store, 
  Phone,
  MapPin,
  MessageCircle,
  Star,
  Shield,
  Heart,
  Share2
} from 'lucide-react';
import axios from 'axios';

// Store Header Component
function StoreHeader({ store }) {
  if (!store) return null;

  return (
    <div style={styles.storeHeader}>
      <div style={styles.storeHeaderContent}>
        <div style={styles.storeLogoSection}>
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} style={styles.storeLogo} />
          ) : (
            <div style={styles.storeLogoPlaceholder}>
              {store.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
          )}
        </div>
        <div style={styles.storeInfo}>
          <h2 style={styles.storeName}>{store.name}</h2>
          {store.tagline && (
            <p style={styles.storeTagline}>{store.tagline}</p>
          )}
          <div style={styles.storeLocation}>
            <MapPin size={14} />
            <span>Kerala, India</span>
          </div>
        </div>
        <div style={styles.storeActions}>
          <button style={styles.storeActionButton}>
            <Heart size={16} />
          </button>
          <button style={styles.storeActionButton}>
            <Share2 size={16} />
          </button>
          <a href={`tel:${store.seller_phone}`} style={styles.storeActionButton}>
            <Phone size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

// Enhanced Cart Item Component
function CartItemCard({ item, onQuantityChange, onRemove, formatPrice }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    setIsUpdating(true);
    await onQuantityChange(item.id, newQuantity);
    setTimeout(() => setIsUpdating(false), 300);
  };

  return (
    <div style={styles.cartItemCard}>
      <div style={styles.itemImageSection}>
        <img 
          src={item.main_image_url || 'https://placehold.co/120x120/e9ecef/6c757d?text=No+Image'} 
          alt={item.name} 
          style={styles.itemImage}
          onError={(e) => {
            e.target.src = 'https://placehold.co/120x120/e9ecef/6c757d?text=No+Image';
          }}
        />
        {item.online_stock <= 5 && (
          <div style={styles.stockWarning}>
            <span>Only {item.online_stock} left!</span>
          </div>
        )}
      </div>

      <div style={styles.itemDetails}>
        <h3 style={styles.itemName}>{item.name}</h3>
        {item.model_name && (
          <p style={styles.itemModel}>{item.model_name}</p>
        )}
        <div style={styles.priceSection}>
          <span style={styles.currentPrice}>{formatPrice(item.price)}</span>
          {item.mrp && item.mrp > item.price && (
            <>
              <span style={styles.originalPrice}>{formatPrice(item.mrp)}</span>
              <span style={styles.discountBadge}>
                {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
              </span>
            </>
          )}
        </div>
      </div>

      <div style={styles.quantityControls}>
        <div style={styles.quantitySection}>
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            style={styles.quantityButton}
            disabled={item.quantity <= 1 || isUpdating}
          >
            <Minus size={14} />
          </button>
          
          <span style={styles.quantityDisplay}>{item.quantity}</span>
          
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            style={styles.quantityButton}
            disabled={isUpdating}
          >
            <Plus size={14} />
          </button>
        </div>
        
        <button 
          onClick={() => onRemove(item.id)}
          style={styles.removeButton}
          title="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div style={styles.itemTotal}>
        <div style={styles.itemTotalPrice}>
          {formatPrice(item.price * item.quantity)}
        </div>
        <div style={styles.itemSubtotal}>
          {item.quantity} × {formatPrice(item.price)}
        </div>
      </div>
    </div>
  );
}

// WhatsApp Order Button
function WhatsAppOrderButton({ store, cartItems, total, formatPrice }) {
  const createWhatsAppOrder = () => {
    const orderText = `Hi ${store.name}! I'd like to place an order:\n\n` +
      cartItems.map(item => 
        `• ${item.name}${item.model_name ? ` (${item.model_name})` : ''}\n  Qty: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`
      ).join('\n\n') +
      `\n\n*Total: ${formatPrice(total)}*\n\nPlease confirm availability and delivery details. Thank you!`;
    
    const phoneNumber = (store.whatsapp_number || store.seller_phone).replace(/\D/g, '');
    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
    
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(orderText)}`;
  };

  return (
    <a
      href={createWhatsAppOrder()}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.whatsappOrderButton}
    >
      <MessageCircle size={20} />
      <span>Order via WhatsApp</span>
    </a>
  );
}

export default function SellerCartPage() {
  const [store, setStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { sellerPhone } = params;
  const { getCartBySeller, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  
  const cartItems = getCartBySeller(sellerPhone);
  const total = getCartTotal(sellerPhone);

  // Fetch store details
  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/shop/${sellerPhone}/`);
        setStore(response.data.store);
      } catch (error) {
        console.error('Failed to fetch store details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (sellerPhone) {
      fetchStoreDetails();
    }
  }, [sellerPhone]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(sellerPhone, productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    if (window.confirm('Remove this item from your cart?')) {
      removeFromCart(sellerPhone, productId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart(sellerPhone);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Navigation Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <button 
            onClick={() => router.push(`/shop/${sellerPhone}`)} 
            style={styles.backButton}
          >
            <ArrowLeft size={20} />
            <span>Back to Shop</span>
          </button>
          
          <div style={styles.headerTitle}>
            <ShoppingCart size={24} />
            <h1>Shopping Cart</h1>
          </div>

          {cartItems.length > 0 && (
            <button 
              onClick={handleClearCart}
              style={styles.clearCartButton}
            >
              Clear Cart
            </button>
          )}
        </div>
      </header>

      {/* Store Header */}
      <StoreHeader store={store} />

      <div style={styles.container}>
        {cartItems.length === 0 ? (
          <div style={styles.emptyCart}>
            <div style={styles.emptyCartIcon}>
              <ShoppingCart size={80} />
            </div>
            <h2>Your cart is empty</h2>
            <p>Discover amazing products from {store?.name || 'our store'}!</p>
            <Link href={`/shop/${sellerPhone}`} style={styles.shopButton}>
              <Store size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        ) : (
          <div style={styles.cartLayout}>
            {/* Cart Items Section */}
            <div style={styles.cartItemsSection}>
              <div style={styles.cartHeader}>
                <h2>Your Items ({cartItems.length})</h2>
                <div style={styles.cartInfo}>
                  <Shield size={16} />
                  <span>Secure Shopping</span>
                </div>
              </div>
              
              <div style={styles.cartItemsList}>
                {cartItems.map(item => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary Section */}
            <div style={styles.orderSummary}>
              <div style={styles.summaryCard}>
                <h3 style={styles.summaryTitle}>Order Summary</h3>
                
                <div style={styles.summaryDetails}>
                  <div style={styles.summaryRow}>
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  
                  <div style={styles.summaryRow}>
                    <span>Delivery</span>
                    <span style={styles.freeDelivery}>Free</span>
                  </div>
                  
                  <div style={styles.summaryRow}>
                    <span>Service</span>
                    <span style={styles.freeDelivery}>Free</span>
                  </div>
                  
                  <hr style={styles.divider} />
                  
                  <div style={{...styles.summaryRow, ...styles.totalRow}}>
                    <span>Total Amount</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* WhatsApp Order Button */}
                <WhatsAppOrderButton 
                  store={store}
                  cartItems={cartItems}
                  total={total}
                  formatPrice={formatPrice}
                />

                <div style={styles.orderNote}>
                  <p>💬 Order will be confirmed via WhatsApp</p>
                  <p>🚚 Delivery details will be discussed</p>
                </div>
              </div>

              {/* Store Actions */}
              <div style={styles.storeActions}>
                <Link href={`/shop/${sellerPhone}`} style={styles.continueShoppingLink}>
                  <ArrowLeft size={16} />
                  <span>Continue Shopping</span>
                </Link>
                
                {store?.instagram_link && (
                  <a href={store.instagram_link} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                    Follow us on Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#fafafa'
  },
  
  // Header
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f1f5f9'
    }
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b'
  },
  clearCartButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#ef4444',
      color: 'white'
    }
  },

  // Store Header
  storeHeader: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '20px 0'
  },
  storeHeaderContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  storeLogoSection: {
    flexShrink: 0
  },
  storeLogo: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #e2e8f0'
  },
  storeLogoPlaceholder: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '20px'
  },
  storeInfo: {
    flex: 1
  },
  storeName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  storeTagline: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0 0 6px 0'
  },
  storeLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    color: '#64748b'
  },
  storeActions: {
    display: 'flex',
    gap: '8px'
  },
  storeActionButton: {
    padding: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#64748b',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e2e8f0'
    }
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f1f5f9',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Container
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '24px 20px',
    animation: 'fadeIn 0.6s ease-out'
  },

  // Empty Cart
  emptyCart: { 
    textAlign: 'center', 
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  emptyCartIcon: {
    color: '#cbd5e1',
    marginBottom: '24px'
  },
  shopButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    marginTop: '24px',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#1d4ed8',
      transform: 'translateY(-2px)'
    }
  },

  // Cart Layout
  cartLayout: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 380px', 
    gap: '32px',
    alignItems: 'start',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '24px'
    }
  },

  // Cart Items Section
  cartItemsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9'
  },
  cartInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#059669',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  cartItemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  // Enhanced Cart Item Card
  cartItemCard: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr auto auto',
    gap: '16px',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
    ':hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
  },
  itemImageSection: {
    position: 'relative'
  },
  itemImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    backgroundColor: 'white'
  },
  stockWarning: {
    position: 'absolute',
    bottom: '4px',
    left: '0',
    right: '0',
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '0 0 8px 8px',
    fontSize: '10px',
    fontWeight: '600',
    textAlign: 'center'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    lineHeight: '1.4'
  },
  itemModel: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0
  },
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  currentPrice: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#059669'
  },
  originalPrice: {
    fontSize: '1rem',
    color: '#64748b',
    textDecoration: 'line-through'
  },
  discountBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },

  // Quantity Controls
  quantityControls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  quantitySection: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
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
    ':hover': {
      backgroundColor: '#f8fafc'
    },
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
    borderRight: '1px solid #e2e8f0'
  },
  removeButton: { 
    background: 'none', 
    border: 'none', 
    color: '#ef4444', 
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#fef2f2'
    }
  },

  // Item Total
  itemTotal: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  itemTotalPrice: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1e293b'
  },
  itemSubtotal: {
    fontSize: '0.8rem',
    color: '#64748b'
  },

  // Order Summary
  orderSummary: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: '120px'
  },
  summaryTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#1e293b'
  },
  summaryDetails: {
    marginBottom: '24px'
  },
  summaryRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '1rem'
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
    color: '#1e293b'
  },

  // WhatsApp Order Button
  whatsappOrderButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px',
    backgroundColor: '#25D366',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
    ':hover': {
      backgroundColor: '#22c55e',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(37, 211, 102, 0.4)'
    }
  },

  orderNote: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: '1.4'
  },

  continueShoppingLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '1rem',
    transition: 'color 0.2s',
    ':hover': {
      color: '#1d4ed8'
    }
  },
  socialLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s',
    ':hover': {
      color: '#1e293b'
    }
  }
};
