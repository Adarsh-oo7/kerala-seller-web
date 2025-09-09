'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import SHeader from '../../../components/common/SHeader';
import Footer from '../../../components/common/Footer';
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Store, Package, Heart } from 'lucide-react';

// ✅ Using environment variables for API URLs
const STORE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/user/store/' || 'http://localhost:8000/user/store/';
const SHOP_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/shop/' || 'http://localhost:8000/shop/';

export default function SellerCartPage() {
    const [store, setStore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [updatingItems, setUpdatingItems] = useState({});
    const params = useParams();
    const router = useRouter();
    const { sellerPhone } = params;
    const { getCartBySeller, removeFromCart, updateQuantity, clearCartForSeller } = useCart();
    
    const cartItems = getCartBySeller(sellerPhone);
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Check login status
    useEffect(() => {
        const token = localStorage.getItem('buyerAccessToken');
        setIsLoggedIn(!!token);
    }, []);

    // ✅ Updated: Fetch store details using environment variable
    useEffect(() => {
        if (!sellerPhone) return;
        setIsLoading(true);
        
        // Try multiple API endpoints for flexibility
        const fetchStore = async () => {
            try {
                // First try the user/store endpoint
                let response;
                try {
                    response = await axios.get(`${STORE_API_URL}${sellerPhone}/`);
                } catch (error) {
                    // Fallback to shop endpoint if user/store fails
                    response = await axios.get(`${SHOP_API_URL}${sellerPhone}/`);
                }
                
                // Handle different response structures
                if (response.data.store) {
                    setStore(response.data.store);
                } else if (response.data.name) {
                    setStore(response.data);
                } else {
                    setStore(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch store details:', error);
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
                {/* Breadcrumb */}
                <nav style={styles.breadcrumb}>
                    <Link href={`/shop/${sellerPhone}`} style={styles.breadcrumbLink}>
                        <Store size={14} />
                        {store?.name || 'Store'}
                    </Link>
                    <span style={styles.breadcrumbSeparator}>›</span>
                    <span style={styles.breadcrumbCurrent}>Cart</span>
                </nav>

                {/* Page Header */}
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
                        <button onClick={handleClearCart} style={styles.clearButton}>
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
                        <Link href={`/shop/${sellerPhone}`} style={styles.continueShoppingButton}>
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div style={styles.cartLayout}>
                        {/* Cart Items List */}
                        <div style={styles.cartItems}>
                            <div style={styles.cartHeader}>
                                <h2>Cart Items ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h2>
                            </div>
                            
                            {cartItems.map(item => (
                                <div key={item.id} style={styles.item}>
                                    <Link href={`/product/${item.id}`} style={styles.itemImageLink}>
                                        <img 
                                            src={item.main_image_url || item.image_url || 'https://placehold.co/100x100/e9ecef/6c757d?text=No+Image'} 
                                            alt={item.name} 
                                            style={styles.itemImage} 
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
                                            <p style={styles.lowStockWarning}>Only {item.online_stock} left in stock</p>
                                        )}
                                    </div>

                                    <div style={styles.itemActions}>
                                        <div style={styles.itemControls}>
                                            <button 
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)} 
                                                style={{...styles.quantityButton, ...(item.quantity <= 1 ? styles.quantityButtonDisabled : {})}}
                                                disabled={item.quantity <= 1 || updatingItems[item.id]}
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
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
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

                            <Link href={`/checkout/${sellerPhone}`} style={styles.checkoutButton}>
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

                {/* Continue Shopping */}
                {cartItems.length > 0 && (
                    <div style={styles.continueShoppingSection}>
                        <Link href={`/shop/${sellerPhone}`} style={styles.continueShoppingLink}>
                            <ArrowLeft size={16} />
                            Continue Shopping at {store?.name}
                        </Link>
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
}

// ✅ Updated styles with mobile responsiveness using JavaScript media queries
const styles = {
    pageContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
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
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        fontSize: '1.1rem',
        color: '#666'
    },
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px',
        fontSize: '14px'
    },
    breadcrumbLink: {
        color: '#007bff',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    breadcrumbSeparator: {
        color: '#6c757d'
    },
    breadcrumbCurrent: {
        color: '#6c757d'
    },
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e9ecef',
        flexWrap: 'wrap',
        gap: '16px'
    },
    headerContent: {
        flex: 1
    },
    title: { 
        fontSize: '2rem',
        fontWeight: 'bold',
        margin: '0 0 8px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#212529'
    },
    titleIcon: {
        color: '#007bff'
    },
    subtitle: { 
        color: '#6c757d', 
        margin: 0,
        fontSize: '1rem'
    },
    clearButton: {
        background: 'transparent',
        border: '1px solid #dc3545',
        color: '#dc3545',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s'
    },
    emptyCart: {
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px'
    },
    emptyCartIcon: {
        color: '#6c757d',
        marginBottom: '20px'
    },
    emptyCartTitle: {
        fontSize: '1.8rem',
        marginBottom: '12px',
        color: '#495057'
    },
    emptyCartText: {
        color: '#6c757d',
        marginBottom: '32px',
        fontSize: '1.1rem'
    },
    continueShoppingButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        backgroundColor: '#007bff',
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
    cartItems: { 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        border: '1px solid #e9ecef',
        overflow: 'hidden'
    },
    cartHeader: {
        padding: '20px',
        borderBottom: '1px solid #e9ecef',
        backgroundColor: '#f8f9fa'
    },
    item: { 
        display: 'flex', 
        gap: '16px', 
        padding: '20px',
        borderBottom: '1px solid #f1f3f5',
        transition: 'background-color 0.2s'
    },
    itemImageLink: {
        flexShrink: 0
    },
    itemImage: { 
        width: '100px', 
        height: '100px', 
        objectFit: 'cover', 
        borderRadius: '8px',
        border: '1px solid #e9ecef'
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
        color: '#212529',
        lineHeight: '1.3'
    },
    itemModel: {
        margin: '0 0 8px 0',
        color: '#6c757d',
        fontSize: '0.9rem'
    },
    itemPrice: { 
        fontWeight: '500', 
        color: '#007bff',
        margin: '0 0 4px 0'
    },
    lowStockWarning: {
        color: '#dc3545',
        fontSize: '0.85rem',
        margin: '4px 0 0 0',
        fontWeight: '500'
    },
    itemActions: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
        flexShrink: 0
    },
    itemControls: { 
        display: 'flex', 
        alignItems: 'center',
        border: '1px solid #dee2e6', 
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
        transition: 'background-color 0.2s'
    },
    quantityButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    quantity: {
        padding: '0 12px',
        fontWeight: '500',
        minWidth: '20px',
        textAlign: 'center'
    },
    itemTotal: {
        textAlign: 'right'
    },
    itemTotalPrice: { 
        fontWeight: 'bold',
        fontSize: '1.1rem',
        margin: 0,
        color: '#212529'
    },
    removeButton: { 
        background: 'none', 
        border: 'none', 
        color: '#dc3545', 
        cursor: 'pointer', 
        padding: '8px',
        borderRadius: '4px',
        transition: 'background-color 0.2s'
    },
    summary: { 
        border: '1px solid #e9ecef', 
        borderRadius: '12px', 
        backgroundColor: '#fff',
        position: 'sticky', 
        top: '20px',
        height: 'fit-content'
    },
    summaryTitle: {
        margin: '0 0 20px 0',
        fontSize: '1.3rem',
        fontWeight: '600',
        padding: '20px 20px 0 20px'
    },
    summaryContent: {
        padding: '0 20px'
    },
    summaryRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '12px',
        fontSize: '1rem'
    },
    freeShipping: {
        color: '#28a745',
        fontWeight: '500'
    },
    summaryDivider: { 
        border: 'none', 
        borderTop: '1px solid #e9ecef', 
        margin: '16px 0' 
    },
    summaryTotal: { 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '20px'
    },
    checkoutButton: { 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%', 
        padding: '16px', 
        backgroundColor: '#28a745', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        fontSize: '1.1rem',
        fontWeight: '500',
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
        color: '#6c757d',
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
        color: '#007bff',
        textDecoration: 'none',
        fontSize: '1rem'
    }
};
