'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
// You would typically have shared Header and Footer components here
// import Header from '../../../components/common/Header';
// import Footer from '../../../components/common/Footer';

export default function SellerStorefrontPage() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const { sellerPhone } = params; // This gets the phone number from the URL

  useEffect(() => {
    if (!sellerPhone) return;

    axios.get(`http://localhost:8000/shop/${sellerPhone}/`)
      .then(response => {
        setStore(response.data.store);
        setProducts(response.data.products);
      })
      .catch(error => {
        console.error("Store not found:", error);
      })
      .finally(() => setIsLoading(false));
  }, [sellerPhone]);

  if (isLoading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Loading store...</p>;
  if (!store) return <p style={{textAlign: 'center', marginTop: '50px'}}>This store could not be found.</p>;

  return (
    <div>
      {/* <Header /> */}
      
      {/* --- Store Header Section --- */}
      <div style={styles.storeHeader}>
        <img 
          src={store.banner_image_url || 'https://placehold.co/1200x250/e9ecef/6c757d?text=No+Banner'} 
          alt={`${store.name} banner`} 
          style={styles.banner} 
        />
        <div style={styles.storeInfoContainer}>
          <div style={styles.storeInfo}>
            <img 
              src={store.logo_url || 'https://placehold.co/120x120/ffffff/6c757d?text=Logo'} 
              alt={`${store.name} logo`} 
              style={styles.logo} 
            />
            <div>
              <h1 style={styles.storeName}>{store.name}</h1>
              <p style={styles.storeTagline}>{store.tagline}</p>
            </div>
          </div>
        </div>
        <p style={styles.storeDescription}>{store.description}</p>
      </div>

      {/* --- Products Section --- */}
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Our Products</h2>
        {products.length > 0 ? (
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
        ) : (
          <p style={{textAlign: 'center'}}>This seller has no products available online yet.</p>
        )}
      </div>
      
      {/* <Footer /> */}
    </div>
  );
}

const styles = {
    // Store Header Styles
    storeHeader: { backgroundColor: '#f8f9fa', paddingBottom: '2rem' },
    banner: { width: '100%', height: '250px', objectFit: 'cover', backgroundColor: '#e9ecef' },
    storeInfoContainer: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
    storeInfo: { display: 'flex', alignItems: 'center', transform: 'translateY(-60px)' },
    logo: { width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white', backgroundColor: 'white', objectFit: 'cover', marginRight: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
    storeName: { margin: 0, fontSize: '2.5rem', fontWeight: 'bold' },
    storeTagline: { margin: '5px 0 0', color: '#6c757d', fontSize: '1.1rem' },
    storeDescription: { maxWidth: '1200px', margin: '-40px auto 0', padding: '0 20px' },

    // Product Grid Styles
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    sectionTitle: { textAlign: 'center', fontSize: '2.5rem', marginBottom: '2.5rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    cardLink: { textDecoration: 'none', color: 'inherit' },
    card: { border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', cursor: 'pointer' },
    image: { width: '100%', height: '200px', objectFit: 'cover', backgroundColor: '#e9ecef' },
    cardContent: { padding: '15px' },
    productName: { margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '600' },
    productPrice: { margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#212529' },
};