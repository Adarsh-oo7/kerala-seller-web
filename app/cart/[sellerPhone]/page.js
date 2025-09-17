'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SHeader from '../../../components/common/SHeader';
import Footer from '../../../components/common/Footer';
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Store, Package, Heart, AlertCircle } from 'lucide-react';

// ✅ Enhanced environment variable handling
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

// ✅ SEO-friendly URL generator (same as in shop listing)
const generateShopSlug = (shop) => {
  if (!shop) return 'shop';
  
  const shopName = (shop.name || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  const location = (shop.seller_address || shop.address || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
    .split('-')[0];
  
  const slug = location ? `${shopName}-${location}` : shopName;
  return slug.length >= 3 ? slug : `shop-${shop.seller_phone || 'store'}`;
};

export default function SellerCartPage() {
    const [store, setStore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [updatingItems, setUpdatingItems] = useState({});
    const [isMobile, setIsMobile] = useState(false);
    
    const params = useParams();
    const router = useRouter();
    const { sellerPhone } = params;
    const { getCartBySeller, removeFromCart, updateQuantity, clearCartForSeller } = useCart();
    
    const cartItems = getCartBySeller(sellerPhone);
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // ✅ Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Check login status
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

    // ✅ Enhanced: Fetch store details using consistent API endpoint
    useEffect(() => {
        if (!sellerPhone) return;
        setIsLoading(true);
        
        const fetchStore = async () => {
            try {
                console.log('🔍 Fetching store for cart page:', sellerPhone);
                
                // Use the same /shop/ endpoint as the main shop page
                const response = await axios.get(`${getApiBaseUrl()}/shop/${sellerPhone}/`);
                
                console.log('✅ Store data received for cart:', response.data);
                
                // Handle the response structure
                if (response.data.store) {
                    setStore(response.data.store);
                } else {
                    // Fallback if no store object
                    setStore({
                        name: 'Store',
                        seller_phone: sellerPhone,
                        ...response.data
                    });
                }
            } catch (error) {
                console.error('❌ Failed to fetch store details:', error);
                // Set a fallback store object to prevent crashes
                setStore({
                    name: 'Store',
                    seller_phone: sellerPhone
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchStore();
    }, [sellerPhone]);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity >= 1) {
            setUpdatingItems(prev => ({ ...prev, [productId]: true }));
            try {
                await new Promise(resolve => setTimeout(resolve, 300)); // Smooth animation
                updateQuantity(sellerPhone, productId, newQuantity);
            } finally {
                setUpdatingItems(prev => ({ ...prev, [productId]: false }));
            }
        }
    };

    const handleRemoveItem = (productId) => {
        if (window.confirm('Are you sure you want to remove this item from your cart?')) {
            removeFromCart(sellerPhone, productId);
        }
    };

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to clear your entire cart?')) {
            clearCartForSeller(sellerPhone);
        }
    };
    
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    // ✅ Enhanced: Generate SEO-friendly shop URL for navigation
    const getShopUrl = () => {
        if (!store || !sellerPhone) return `/shop`;
        const shopSlug = generateShopSlug(store);
        return `/shop/${shopSlug}?id=${sellerPhone}`;
    };

    if (isLoading) {
        return (
            <div>
                <SHeader store={store} isLoggedIn={isLoggedIn} />
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <p style={styles.loadingText}>Loading your cart...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <SHeader store={store} isLoggedIn={isLoggedIn} />
            
            <div style={styles.container}>
                {/* ✅ Enhanced Breadcrumb with SEO-friendly URLs */}
                <nav style={styles.breadcrumb}>
                    <Link href="/" style={styles.breadcrumbLink}>
                        Kerala Sellers
                    </Link>
                    <span style={styles.breadcrumbSeparator}>›</span>
                    <Link href="/shop" style={styles.breadcrumbLink}>
                        Shops
                    </Link>
                    <span style={styles.breadcrumbSeparator}>›</span>
                    <Link href={getShopUrl()} style={styles.breadcrumbLink}>
                        <Store size={14} />
                        {store?.name || 'Store'}
                    </Link>
                    <span style={styles.breadcrumbSeparator}>›</span>
                    <span style={styles.breadcrumbCurrent}>Cart</span>
                </nav>

                {/* ✅ Enhanced Page Header */}
                <div style={styles.pageHeader}>
                    <div style={styles.headerContent}>
                        <h1 style={styles.title}>
                            <ShoppingCart size={32} style={styles.titleIcon} />
                            Your Cart
                        </h1>
                        <p style={styles.subtitle}>
                            Review your items from <strong>{store?.name || 'this store'}</strong> before checkout
                        </p>
                    </div>
                    {cartItems.length > 0 && (
                        <button 
                            onClick={handleClearCart} 
                            style={styles.clearButton}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#dc3545';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#dc3545';
                            }}
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div style={styles.emptyCart}>
                        <div style={styles.emptyCartIcon}>
                            <ShoppingCart size={64} />
                        </div>
                        <h2 style={styles.emptyCartTitle}>Your cart is empty</h2>
                        <p style={styles.emptyCartText}>
                            Looks like you haven't added any items from {store?.name || 'this store'} yet.
                        </p>
                        <Link href={getShopUrl()} style={styles.continueShoppingButton}>
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div style={isMobile ? styles.cartLayoutMobile : styles.cartLayout}>
                        {/* Cart Items List */}
                        <div style={styles.cartItems}>
                            <div style={styles.cartHeader}>
                                <h2>Cart Items ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h2>
                            </div>
                            
                            {cartItems.map(item => (
                                <div key={item.id} style={isMobile ? styles.itemMobile : styles.item}>
                                    <Link href={`/product/${item.id}`} style={styles.itemImageLink}>
                                        <img 
                                            src={item.main_image_url || item.image_url || 'https://placehold.co/100x100/e9ecef/6c757d?text=No+Image'} 
                                            alt={item.name} 
                                            style={isMobile ? styles.itemImageMobile : styles.itemImage}
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/100x100/e9ecef/6c757d?text=No+Image';
                                            }}
                                        />
                                    </Link>
                                    
                                    <div style={styles.itemDetails}>
                                        <Link href={`/product/${item.id}`} style={styles.itemNameLink}>
                                            <h3 style={styles.itemName}>{item.name}</h3>
                                        </Link>
                                        {item.model_name && (
                                            <p style={styles.itemModel}>{item.model_name}</p>
                                        )}
                                        <p style={styles.itemPrice}>{formatPrice(item.price)} each</p>
                                        {item.online_stock <= 5 && item.online_stock > 0 && (
                                            <p style={styles.lowStockWarning}>
                                                <AlertCircle size={14} />
                                                Only {item.online_stock} left in stock
                                            </p>
                                        )}
                                        {item.online_stock === 0 && (
                                            <p style={styles.outOfStockWarning}>
                                                <AlertCircle size={14} />
                                                Out of stock
                                            </p>
                                        )}
                                    </div>

                                    <div style={isMobile ? styles.itemActionsMobile : styles.itemActions}>
                                        <div style={styles.itemControls}>
                                            <button 
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)} 
                                                style={{
                                                    ...styles.quantityButton, 
                                                    ...(item.quantity <= 1 ? styles.quantityButtonDisabled : {})
                                                }}
                                                disabled={item.quantity <= 1 || updatingItems[item.id]}
                                                onMouseEnter={(e) => {
                                                    if (item.quantity > 1) {
                                                        e.target.style.backgroundColor = '#f8f9fa';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span style={styles.quantity}>
                                                {updatingItems[item.id] ? '...' : item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)} 
                                                style={styles.quantityButton}
                                                disabled={updatingItems[item.id]}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#f8f9fa';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        
                                        <div style={styles.itemTotal}>
                                            <p style={styles.itemTotalPrice}>{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleRemoveItem(item.id)} 
                                            style={styles.removeButton}
                                            title="Remove item"
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#f8d7da';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ✅ Enhanced Order Summary */}
                        <div style={styles.summary}>
                            <h2 style={styles.summaryTitle}>Order Summary</h2>
                            
                            <div style={styles.summaryContent}>
                                <div style={styles.summaryRow}>
                                    <span>Items ({itemCount})</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <div style={styles.summaryRow}>
                                    <span>Shipping</span>
                                    <span style={styles.freeShipping}>FREE</span>
                                </div>
                                <div style={styles.summaryRow}>
                                    <span>Tax</span>
                                    <span>Calculated at checkout</span>
                                </div>
                                
                                <hr style={styles.summaryDivider} />
                                
                                <div style={styles.summaryTotal}>
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>

                            <Link 
                                href={`/checkout/${sellerPhone}`} 
                                style={styles.checkoutButton}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#218838';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#28a745';
                                }}
                            >
                                <ShoppingCart size={18} />
                                Proceed to Checkout
                            </Link>

                            <div style={styles.trustBadges}>
                                <div style={styles.trustBadge}>
                                    <Package size={16} />
                                    <span>Secure Checkout</span>
                                </div>
                                <div style={styles.trustBadge}>
                                    <Heart size={16} />
                                    <span>Money Back Guarantee</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ Enhanced Continue Shopping with SEO URLs */}
                {cartItems.length > 0 && (
                    <div style={styles.continueShoppingSection}>
                        <Link href={getShopUrl()} style={styles.continueShoppingLink}>
                            <ArrowLeft size={16} />
                            Continue Shopping at {store?.name}
                        </Link>
                    </div>
                )}
            </div>
            
            <Footer />

            {/* ✅ CSS Animations */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .cart-item:hover {
                    background-color: #f8f9fa;
                }
                
                .quantity-button:hover:not(:disabled) {
                    background-color: #f8f9fa;
                }
                
                .remove-button:hover {
                    background-color: #f8d7da;
                }
            `}</style>
        </div>
    );
}

// ✅ Enhanced styles with mobile responsiveness
const styles = {
    pageContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc'
    },
    container: { 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        flex: '1'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '20px'
    },
    loadingSpinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        fontSize: '1.1rem',
        color: '#6b7280'
    },
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px',
        fontSize: '14px',
        flexWrap: 'wrap'
    },
    breadcrumbLink: {
        color: '#3b82f6',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'color 0.2s'
    },
    breadcrumbSeparator: {
        color: '#9ca3af'
    },
    breadcrumbCurrent: {
        color: '#6b7280',
        fontWeight: '500'
    },
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        gap: '16px'
    },
    headerContent: {
        flex: 1
    },
    title: { 
        fontSize: '2rem',
        fontWeight: '700',
        margin: '0 0 8px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#1f2937'
    },
    titleIcon: {
        color: '#3b82f6'
    },
    subtitle: { 
        color: '#6b7280', 
        margin: 0,
        fontSize: '1rem',
        lineHeight: '1.5'
    },
    clearButton: {
        background: 'transparent',
        border: '1px solid #ef4444',
        color: '#ef4444',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    emptyCart: {
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
    },
    emptyCartIcon: {
        color: '#9ca3af',
        marginBottom: '20px'
    },
    emptyCartTitle: {
        fontSize: '1.8rem',
        marginBottom: '12px',
        color: '#1f2937',
        fontWeight: '600'
    },
    emptyCartText: {
        color: '#6b7280',
        marginBottom: '32px',
        fontSize: '1.1rem',
        lineHeight: '1.6'
    },
    continueShoppingButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: '500',
        transition: 'background-color 0.2s'
    },
    cartLayout: { 
        display: 'grid', 
        gridTemplateColumns: '1fr 380px', 
        gap: '32px',
        alignItems: 'start'
    },
    cartLayoutMobile: { 
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    cartItems: { 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
    },
    cartHeader: {
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc'
    },
    item: { 
        display: 'flex', 
        gap: '16px', 
        padding: '20px',
        borderBottom: '1px solid #f1f5f9',
        transition: 'background-color 0.2s'
    },
    itemMobile: { 
        display: 'flex', 
        flexDirection: 'column',
        gap: '12px', 
        padding: '16px',
        borderBottom: '1px solid #f1f5f9'
    },
    itemImageLink: {
        flexShrink: 0
    },
    itemImage: { 
        width: '100px', 
        height: '100px', 
        objectFit: 'cover', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
    },
    itemImageMobile: { 
        width: '80px', 
        height: '80px', 
        objectFit: 'cover', 
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
    },
    itemDetails: { 
        flex: 1,
        minWidth: 0
    },
    itemNameLink: {
        textDecoration: 'none'
    },
    itemName: {
        margin: '0 0 4px 0',
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#1f2937',
        lineHeight: '1.3'
    },
    itemModel: {
        margin: '0 0 8px 0',
        color: '#6b7280',
        fontSize: '0.9rem'
    },
    itemPrice: { 
        fontWeight: '500', 
        color: '#3b82f6',
        margin: '0 0 4px 0'
    },
    lowStockWarning: {
        color: '#f59e0b',
        fontSize: '0.85rem',
        margin: '4px 0 0 0',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    outOfStockWarning: {
        color: '#ef4444',
        fontSize: '0.85rem',
        margin: '4px 0 0 0',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    itemActions: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
        flexShrink: 0
    },
    itemActionsMobile: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
    },
    itemControls: { 
        display: 'flex', 
        alignItems: 'center',
        border: '1px solid #d1d5db', 
        borderRadius: '6px',
        backgroundColor: 'white'
    },
    quantityButton: { 
        background: 'none', 
        border: 'none', 
        padding: '8px 10px', 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
        color: '#374151'
    },
    quantityButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    quantity: {
        padding: '0 12px',
        fontWeight: '500',
        minWidth: '20px',
        textAlign: 'center',
        color: '#1f2937'
    },
    itemTotal: {
        textAlign: 'right'
    },
    itemTotalPrice: { 
        fontWeight: '700',
        fontSize: '1.1rem',
        margin: 0,
        color: '#1f2937'
    },
    removeButton: { 
        background: 'none', 
        border: 'none', 
        color: '#ef4444', 
        cursor: 'pointer', 
        padding: '8px',
        borderRadius: '4px',
        transition: 'background-color 0.2s'
    },
    summary: { 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        backgroundColor: 'white',
        position: 'sticky', 
        top: '20px',
        height: 'fit-content'
    },
    summaryTitle: {
        margin: '0 0 20px 0',
        fontSize: '1.3rem',
        fontWeight: '600',
        padding: '20px 20px 0 20px',
        color: '#1f2937'
    },
    summaryContent: {
        padding: '0 20px'
    },
    summaryRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '12px',
        fontSize: '1rem',
        color: '#374151'
    },
    freeShipping: {
        color: '#059669',
        fontWeight: '600'
    },
    summaryDivider: { 
        border: 'none', 
        borderTop: '1px solid #e5e7eb', 
        margin: '16px 0' 
    },
    summaryTotal: { 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '1.2rem',
        fontWeight: '700',
        marginBottom: '20px',
        color: '#1f2937'
    },
    checkoutButton: { 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
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
        margin: '0 20px 20px 20px',
        transition: 'background-color 0.2s'
    },
    trustBadges: {
        padding: '0 20px 20px 20px'
    },
    trustBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#6b7280',
        fontSize: '0.9rem',
        marginBottom: '8px'
    },
    continueShoppingSection: {
        marginTop: '32px',
        textAlign: 'center'
    },
    continueShoppingLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#3b82f6',
        textDecoration: 'none',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'color 0.2s'
    }
};
