'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import '../../styles/Keralasellerscart.css'
import { Trash2 } from 'lucide-react';

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
        <div style={{ backgroundColor: '#FDFFF0', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />

            <div style={{ flex: 1 }}>
                <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px' }}>

                    {sellersWithItems.length === 0 ? (
                        <div style={{
                            backgroundColor: '#FDFFF0',
                            borderRadius: '12px',
                            padding: '60px',
                            textAlign: 'center',
                            marginTop: '80px'
                        }}>
                            <h2 className='keralasellerscartemptytitle'>Your cart is empty</h2>
                            <button
                                className='keralasellerscartemptybtn'
                                onClick={() => router.push('/')}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#1a4845',
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
                                    backgroundColor: '#FDFFF0',
                                    // border:'1px solid #1a4845',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    padding: '20px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', border: "1px solid #1a4845", borderRadius: "10px", padding: '10px 20px' }}>
                                        <h3 className='keralasellerscartstore'>Store {sellerPhone}</h3>
                                        <button
                                        className='keralasellerscartclearbtn'
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
                                        <div key={item.id} className="keralasellerscartitem">
                                            <img
                                            className='keralasellerscartimage'
                                                src={item.main_image_url || item.image_url || '/placeholder.svg'}
                                                alt={item.name}
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                                            />

                                            <div className="keralasellerscartitem-details">
                                                <div>
                                                    <h4 className='keralasellerscartitemname' style={{ margin: '0 0 8px 0' }}>{item.name}</h4>
                                                    <p className="keralasellerscartitem-priceeach" style={{ margin: '0', color: '#666' }}>
                                                        {formatPrice(item.price)} each
                                                    </p>
                                                </div>

                                                <div className="keralasellerscartitem-qty-price">
                                                    <div className="keralasellerscartitem-total">
                                                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                                                    </div>
                                                    <div className="keralasellerscartitem-quantity">
                                                        <button
                                                            className='keralasellerscartqntyicon'
                                                            style={{
                                                                width: '32px', height: '32px',
                                                                border: '1px solid #afafafff',
                                                                background: '#FDFFF0',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => updateQuantity(sellerPhone, item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >-</button>
                                                        <span>{item.quantity}</span>
                                                        <button
                                                            className='keralasellerscartqntyicon'
                                                            style={{
                                                                width: '32px', height: '32px',
                                                                border: '1px solid #afafafff',
                                                                background: '#FDFFF0',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => updateQuantity(sellerPhone, item.id, item.quantity + 1)}
                                                        >+</button>
                                                    </div>


                                                </div>

                                            </div>

                                            <button
                                                onClick={() => removeFromCart(sellerPhone, item.id)}
                                                style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '8px' }}
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                    ))}

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: '20px',
                                        paddingTop: '20px',
                                        borderTop: '1px solid #eee',

                                    }}>
                                        <strong className='keralasellerscartstore' style={{ fontSize: '1.2rem', }}>
                                            Total: {formatPrice(total)}
                                        </strong>
                                        <button
                                            className='keralasellerscartstorebtn'
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
            </div>

            <Footer />
        </div>
    );
}
