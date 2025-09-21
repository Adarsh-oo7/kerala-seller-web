'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function CartPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { carts, removeFromCart, updateQuantity, clearCartForSeller } = useCart();

    useEffect(() => {
        setLoading(false);
    }, []);

    const sellersWithItems = Object.keys(carts).filter(phone => 
        carts[phone] && carts[phone].length > 0
    );

    const formatPrice = (price) => `₹${parseFloat(price).toFixed(2)}`;
    const calculateTotal = (items) => items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (loading) {
        return (
            <div>
                <Header />
                <div style={{ padding: '50px', textAlign: 'center' }}>Loading cart...</div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Header />
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <h1>Your Cart</h1>

                {sellersWithItems.length === 0 ? (
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '12px', 
                        padding: '60px', 
                        textAlign: 'center'
                    }}>
                        <h2>Your cart is empty</h2>
                        <button
                            onClick={() => router.push('/')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    sellersWithItems.map(sellerPhone => {
                        const items = carts[sellerPhone];
                        const total = calculateTotal(items);

                        return (
                            <div key={sellerPhone} style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                padding: '20px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3>Store {sellerPhone}</h3>
                                    <button
                                        onClick={() => clearCartForSeller(sellerPhone)}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #dc3545',
                                            color: '#dc3545',
                                            padding: '6px 12px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {items.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px 0',
                                        borderBottom: '1px solid #eee'
                                    }}>
                                        <img 
                                            src={item.main_image_url || item.image_url || '/placeholder.svg'}
                                            alt={item.name}
                                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                                        />
                                        
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 8px 0' }}>{item.name}</h4>
                                            <p style={{ margin: '0', color: '#666' }}>{formatPrice(item.price)} each</p>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                onClick={() => updateQuantity(sellerPhone, item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                style={{
                                                    width: '32px', height: '32px',
                                                    border: '1px solid #ddd',
                                                    background: 'white',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                -
                                            </button>
                                            
                                            <span style={{ minWidth: '30px', textAlign: 'center' }}>
                                                {item.quantity}
                                            </span>
                                            
                                            <button
                                                onClick={() => updateQuantity(sellerPhone, item.id, item.quantity + 1)}
                                                style={{
                                                    width: '32px', height: '32px',
                                                    border: '1px solid #ddd',
                                                    background: 'white',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div style={{ minWidth: '80px', textAlign: 'right' }}>
                                            <strong>{formatPrice(item.price * item.quantity)}</strong>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(sellerPhone, item.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#dc3545',
                                                cursor: 'pointer',
                                                padding: '8px'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '20px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid #eee'
                                }}>
                                    <strong style={{ fontSize: '1.2rem' }}>
                                        Total: {formatPrice(total)}
                                    </strong>
                                    <button
                                        onClick={() => router.push(`/checkout/${sellerPhone}`)}
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Checkout
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <Footer />
        </div>
    );
}
