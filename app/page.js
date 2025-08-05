'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Header from "../components/common/Header"; // ✅ Import the Header
import Footer from "../components/common/Footer";

const PRODUCTS_API_URL = 'http://localhost:8000/user/store/products/';
const STORES_API_URL = 'http://localhost:8000/shops/';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(PRODUCTS_API_URL),
      axios.get(STORES_API_URL)
    ]).then(([productsResponse, storesResponse]) => {
      setProducts(productsResponse.data.results.slice(0, 8));
      setStores(storesResponse.data.slice(0, 6));
    }).catch(error => {
      console.error("Failed to fetch homepage data:", error);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <div>
      <Header /> {/* ✅ Add the Header component here */}
      
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Discover the Best of Kerala's Local Shops</h1>
          <p style={styles.heroSubtitle}>Unique products, trusted sellers, delivered to your doorstep.</p>
        </div>
      </div>

      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Featured Stores</h2>
        {isLoading ? <p>Loading...</p> : (
          <div style={styles.storesGrid}>
            {stores.map(store => (
              <Link key={store.name} href={`/shop/${store.seller_phone}`} style={styles.storeCardLink}>
                <div style={styles.storeCard}>
                  <img src={store.logo_url || 'https://placehold.co/100x100/e9ecef/6c757d?text=Logo'} alt={`${store.name} logo`} style={styles.storeLogo} />
                  <h3 style={styles.storeName}>{store.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <hr style={styles.hr} />

        <h2 style={styles.sectionTitle}>New Arrivals</h2>
        {isLoading ? <p>Loading...</p> : (
          <div style={styles.grid}>
            {products.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} style={styles.cardLink}>
                <div style={styles.card}>
                  <img src={product.image_url || 'https://placehold.co/400x300/e9ecef/6c757d?text=No+Image'} alt={product.name} style={styles.image} />
                  <div style={styles.cardContent}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productPrice}>₹{product.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

const styles = {
    hero: { height: '60vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' },
    heroContent: { maxWidth: '800px' },
    heroTitle: { fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '1rem' },
    heroSubtitle: { fontSize: '1.25rem', color: '#6c757d' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    sectionTitle: { textAlign: 'center', fontSize: '2.5rem', marginBottom: '2.5rem' },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '4rem 0' },
    storesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' },
    storeCardLink: { textDecoration: 'none', color: 'inherit' },
    storeCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', border: '1px solid #e9ecef', borderRadius: '8px', transition: 'box-shadow 0.2s' },
    storeLogo: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', backgroundColor: '#fff' },
    storeName: { fontSize: '1.1rem', fontWeight: '600', textAlign: 'center' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    cardLink: { textDecoration: 'none', color: 'inherit' },
    card: { border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' },
    image: { width: '100%', height: '200px', objectFit: 'cover' },
    cardContent: { padding: '15px' },
    productName: { margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '600' },
    productPrice: { margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#212529' },
};