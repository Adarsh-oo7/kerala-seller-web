'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function CartsOverviewPage() {
  const { carts } = useCart();
  
  // carts is an object like { sellerPhone1: [items], sellerPhone2: [items] }
  const sellerPhonesWithItems = Object.keys(carts || {}).filter(phone => carts[phone].length > 0);
  const totalItemsInAllCarts = Object.values(carts || {}).flat().reduce((count, item) => count + item.quantity, 0);

  const calculateCartTotal = (cartItems) => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <h1 style={styles.title}>Your Carts ({totalItemsInAllCarts} items)</h1>

        {sellerPhonesWithItems.length === 0 ? (
          <div style={styles.emptyCart}>
            <p>You have no items in any cart.</p>
            <Link href="/shop" style={styles.buttonSecondary}>Start Shopping</Link>
          </div>
        ) : (
          <div>
            <p style={styles.subtitle}>You have items from {sellerPhonesWithItems.length} different store(s).</p>
            <div style={styles.cartList}>
              {sellerPhonesWithItems.map(phone => {
                const cartItems = carts[phone];
                if (!cartItems || cartItems.length === 0) return null;
                
                // Use the store name from the first item in the cart
                const storeName = cartItems[0]?.store?.name || `Store (${phone})`;
                
                return (
                  <div key={phone} style={styles.card}>
                    <div>
                        <h3>{storeName}</h3>
                        <p style={{color: '#6c757d'}}>{cartItems.length} item(s) - Total: ₹{calculateCartTotal(cartItems)}</p>
                    </div>
                    <Link href={`/cart/${phone}`} style={styles.buttonPrimary}>
                      View and Checkout
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '40px 20px' },
    title: { textAlign: 'center', marginBottom: '0.5rem', fontSize: '2.5rem' },
    subtitle: { textAlign: 'center', color: '#6c757d', marginTop: 0, marginBottom: '2rem' },
    emptyCart: { textAlign: 'center', padding: '40px', border: '1px dashed #ccc', borderRadius: '8px' },
    cartList: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '1.5rem' },
    card: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    buttonPrimary: { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' },
    buttonSecondary: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '5px' },
};