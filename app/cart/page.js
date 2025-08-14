'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { Trash2 } from 'lucide-react'; // For a nice remove icon

export default function CartPage() {
  const { carts, removeFromCart, updateQuantity } = useCart();
  
  const sellerPhonesWithItems = Object.keys(carts || {}).filter(phone => carts[phone].length > 0);

  const calculateCartTotal = (cartItems) => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <h1 style={styles.title}>Your Shopping Carts</h1>

        {sellerPhonesWithItems.length === 0 ? (
          <div style={styles.card}>
            <p>Your cart is currently empty.</p>
            <Link href="/shop" style={styles.button}>Start Shopping</Link>
          </div>
        ) : (
          <div style={styles.cartList}>
            {sellerPhonesWithItems.map(phone => {
              const cartItems = carts[phone];
              const storeName = cartItems[0]?.store?.name || `Store (${phone})`;
              
              return (
                <div key={phone} style={styles.card}>
                  <h2 style={styles.storeTitle}>Items from {storeName}</h2>
                  {cartItems.map(item => (
                    <div key={item.id} style={styles.item}>
                      <img src={item.image_url || 'https://placehold.co/100x100'} alt={item.name} style={styles.itemImage} />
                      <div style={styles.itemDetails}>
                        <Link href={`/product/${item.id}`}><h3>{item.name}</h3></Link>
                        <p style={styles.itemPrice}>₹{item.price}</p>
                      </div>
                      <div style={styles.itemControls}>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(phone, item.id, parseInt(e.target.value))}
                          style={styles.quantityInput} min="1"
                        />
                      </div>
                      <p style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(phone, item.id)} style={styles.removeButton}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <div style={styles.summary}>
                    <div style={styles.summaryRow}>
                      <strong>Subtotal</strong>
                      <strong>₹{calculateCartTotal(cartItems)}</strong>
                    </div>
                    <Link href={`/checkout/${phone}`} style={styles.checkoutButton}>
                      Proceed to Checkout
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

const styles = {
    container: { maxWidth: '900px', margin: '40px auto', padding: '20px' },
    title: { textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem' },
    cartList: { display: 'flex', flexDirection: 'column', gap: '30px' },
    card: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' },
    storeTitle: { borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' },
    item: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0' },
    itemImage: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' },
    itemDetails: { flexGrow: 1 },
    itemPrice: { color: '#6c757d' },
    itemControls: { display: 'flex', alignItems: 'center' },
    quantityInput: { width: '60px', padding: '5px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' },
    itemTotal: { fontWeight: 'bold', width: '90px', textAlign: 'right', fontSize: '1.1rem' },
    removeButton: { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '5px', marginLeft: '10px' },
    summary: { borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '20px' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '20px' },
    checkoutButton: { display: 'block', width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' },
    button: { display: 'inline-block', marginTop: '1rem', padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', textDecoration: 'none', borderRadius: '5px' },
};