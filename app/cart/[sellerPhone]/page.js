'use client';

import { useCart } from '../../context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header'; // Assuming a shared header

export default function SellerCartPage() {
  const params = useParams();
  const router = useRouter();
  const { sellerPhone } = params;
  const { getCartBySeller, removeFromCart, updateQuantity } = useCart();
  
  const cartItems = getCartBySeller(sellerPhone);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // You can fetch store details here to show the store name, if needed

  const handleCheckout = () => {
    // Before proceeding, check if the buyer is logged in and verified
    const token = localStorage.getItem('buyerAccessToken');
    if (!token) {
      router.push('/login/buyer');
      return;
    }
    // You would also fetch their profile to check for phone verification here
    
    // If checks pass:
    router.push(`/checkout/${sellerPhone}`);
  };

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <h1 style={styles.title}>Your Cart</h1>
        <p style={styles.subtitle}>Items from [Store Name Here]</p>

        {cartItems.length === 0 ? (
          <div style={styles.emptyCart}>
            <p>This cart is empty.</p>
            <Link href={`/shop/${sellerPhone}`} style={styles.buttonSecondary}>
              Continue Shopping at this Store
            </Link>
          </div>
        ) : (
          <div style={styles.cartLayout}>
            {/* Cart Items Section */}
            <div style={styles.cartItems}>
              {cartItems.map(item => (
                <div key={item.id} style={styles.item}>
                  <img src={item.image_url || 'https://placehold.co/100x100'} alt={item.name} style={styles.itemImage} />
                  <div style={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    <p style={styles.itemPrice}>₹{item.price}</p>
                  </div>
                  <div style={styles.itemControls}>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(sellerPhone, item.id, parseInt(e.target.value))}
                      style={styles.quantityInput} min="1"
                    />
                    <button onClick={() => removeFromCart(sellerPhone, item.id)} style={styles.removeButton}>Remove</button>
                  </div>
                  <p style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Order Summary Section */}
            <div style={styles.summary}>
              <h2>Order Summary</h2>
              <div style={styles.summaryRow}>
                <strong>Total</strong>
                <strong>₹{total.toFixed(2)}</strong>
              </div>
              <button onClick={handleCheckout} style={styles.buttonPrimary}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    title: { textAlign: 'center', marginBottom: '0.5rem', fontSize: '2.5rem' },
    subtitle: { textAlign: 'center', color: '#6c757d', marginTop: 0, marginBottom: '2rem' },
    emptyCart: { textAlign: 'center', padding: '40px', border: '1px dashed #ccc', borderRadius: '8px' },
    cartLayout: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' },
    cartItems: {},
    item: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 0', borderBottom: '1px solid #eee' },
    itemImage: { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' },
    itemDetails: { flexGrow: 1 },
    itemPrice: { fontWeight: 'bold' },
    itemControls: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' },
    quantityInput: { width: '60px', padding: '5px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' },
    removeButton: { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.9rem' },
    itemTotal: { fontWeight: 'bold', width: '80px', textAlign: 'right' },
    summary: { border: '1px solid #e9ecef', borderRadius: '8px', padding: '20px', backgroundColor: '#f8f9fa', height: 'fit-content' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.2rem' },
    buttonPrimary: { display: 'block', width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer', textAlign: 'center', textDecoration: 'none' },
    buttonSecondary: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '5px' },
};