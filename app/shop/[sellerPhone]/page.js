'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, User } from 'lucide-react';

// --- Store-Specific Header Component ---
function StoreHeader({ store }) {
  // ✅ Use getCartBySeller to get the specific cart for this store
  const { getCartBySeller } = useCart();
  const cartItems = getCartBySeller(store.seller_phone); // Get cart for THIS seller
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('buyerAccessToken'));
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.headerContainer}>
        <Link href={`/shop/${store.seller_phone}`} style={styles.storeBrand}>
          <img src={store.logo_url || 'https://placehold.co/60x60/ffffff/6c757d?text=Logo'} alt={`${store.name} logo`} style={styles.headerLogo}/>
          <span style={styles.headerStoreName}>{store.name}</span>
        </Link>
        <div style={styles.headerActions}>
          {/* ✅ Link to the seller-specific cart page */}
          <Link href={`/cart/${store.seller_phone}`} style={styles.actionButton}>
            <ShoppingCart size={20} />
            {cartItemCount > 0 && <span style={styles.cartBadge}>{cartItemCount}</span>}
          </Link>
          {isLoggedIn ? (
            <Link href="/profile" style={styles.actionButton}><User size={20} /></Link>
          ) : (
            <Link href="/login/buyer" style={styles.loginButton}>Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}

// --- Main Storefront Page Component ---
export default function SellerStorefrontPage() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const { sellerPhone } = params;
  const { addToCart } = useCart();

  useEffect(() => {
    if (!sellerPhone) return;
    axios.get(`http://localhost:8000/shop/${sellerPhone}/`)
      .then(response => {
        setStore(response.data.store);
        setProducts(response.data.products);
      })
      .catch(error => console.error("Store not found:", error))
      .finally(() => setIsLoading(false));
  }, [sellerPhone]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    // ✅ Pass the sellerPhone to the addToCart function
    addToCart(sellerPhone, product);
  };

  if (isLoading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Loading store...</p>;
  if (!store) return <p style={{textAlign: 'center', marginTop: '50px'}}>This store could not be found.</p>;

  return (
    <div>
      <StoreHeader store={store} />
      
      <div>
        <img src={store.banner_image_url || 'https://placehold.co/1200x250/e9ecef/6c757d?text=No+Banner'} alt={`${store.name} banner`} style={styles.banner} />
      </div>

      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Our Products</h2>
        {products.length > 0 ? (
          <div style={styles.grid}>
            {products.map(product => (
              <div key={product.id} style={styles.card}>
                <Link href={`/product/${product.id}`} style={styles.cardLink}>
                  <img src={product.image_url || 'https://placehold.co/400x300/e9ecef/6c757d?text=No+Image'} alt={product.name} style={styles.image} />
                  <div style={styles.cardContent}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productPrice}>₹{product.price}</p>
                  </div>
                </Link>
                <div style={styles.cardActions}>
                  <button onClick={(e) => handleAddToCart(e, product)} style={styles.addToCartButton} disabled={product.online_stock === 0}>
                    {product.online_stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{textAlign: 'center'}}>This seller has no products available online yet.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
    // Header Styles
    header: { backgroundColor: '#fff', borderBottom: '1px solid #e9ecef', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100 },
    headerContainer: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    storeBrand: { display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' },
    headerLogo: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' },
    headerStoreName: { fontSize: '1.5rem', fontWeight: 'bold' },
    headerActions: { display: 'flex', alignItems: 'center', gap: '15px' },
    actionButton: { position: 'relative', color: '#212529' },
    cartBadge: { position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#dc3545', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center'},
    loginButton: { padding: '8px 15px', backgroundColor: '#0d6efd', color: 'white', textDecoration: 'none', borderRadius: '5px' },
    
    // Page Styles
    banner: { width: '100%', height: '200px', objectFit: 'cover', backgroundColor: '#e9ecef' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    sectionTitle: { textAlign: 'center', fontSize: '2.5rem', marginBottom: '2.5rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    card: { border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
    cardLink: { textDecoration: 'none', color: 'inherit' },
    image: { width: '100%', height: '200px', objectFit: 'cover', backgroundColor: '#e9ecef' },
    cardContent: { padding: '15px', flexGrow: 1 },
    productName: { margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '600' },
    productPrice: { margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#212529' },
    cardActions: { padding: '0 15px 15px 15px' },
    addToCartButton: { width: '100%', padding: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500'},
};