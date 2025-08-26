'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../app/context/CartContext';

export default function StoreHeader({ store }) {
  const { getCartBySeller } = useCart();
  const cartItems = getCartBySeller(store.seller_phone);
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('buyerAccessToken'));
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.headerContainer}>
        <Link href={`/shop/${store.seller_phone}`} style={styles.storeBrand}>
          <img 
            src={store.logo_url || 'https://placehold.co/60x60/ffffff/6c757d?text=Logo'} 
            alt={`${store.name} logo`} 
            style={styles.headerLogo}
            onError={(e) => {
              e.target.src = 'https://placehold.co/60x60/ffffff/6c757d?text=Logo';
            }}
          />
          <span style={styles.headerStoreName}>{store.name}</span>
        </Link>
        
        <div style={styles.headerActions}>
          <Link href={`/cart/${store.seller_phone}`} style={styles.actionButton}>
            <ShoppingCart size={20} />
            {cartItemCount > 0 && <span style={styles.cartBadge}>{cartItemCount}</span>}
          </Link>
          {isLoggedIn ? (
            <Link href="/profile" style={styles.actionButton}>
              <User size={20} />
            </Link>
          ) : (
            <Link href="/login/buyer" style={styles.loginButton}>Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: { 
    backgroundColor: '#fff', 
    borderBottom: '1px solid #e9ecef', 
    padding: '15px 20px', 
    position: 'sticky', 
    top: 0, 
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  headerContainer: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  storeBrand: { 
    display: 'flex', 
    alignItems: 'center', 
    textDecoration: 'none', 
    color: 'inherit' 
  },
  headerLogo: { 
    width: '50px', 
    height: '50px', 
    borderRadius: '50%', 
    objectFit: 'cover', 
    marginRight: '15px',
    border: '2px solid #e9ecef'
  },
  headerStoreName: { 
    fontSize: '1.5rem', 
    fontWeight: 'bold',
    color: '#212529'
  },
  headerActions: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px' 
  },
  actionButton: { 
    position: 'relative', 
    color: '#212529',
    padding: '8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  cartBadge: { 
    position: 'absolute', 
    top: '-8px', 
    right: '-8px', 
    backgroundColor: '#dc3545', 
    color: 'white', 
    borderRadius: '50%', 
    width: '18px', 
    height: '18px', 
    fontSize: '0.75rem', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  loginButton: { 
    padding: '8px 15px', 
    backgroundColor: '#0d6efd', 
    color: 'white', 
    textDecoration: 'none', 
    borderRadius: '5px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  }
};

