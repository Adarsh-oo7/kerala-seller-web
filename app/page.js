'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Header from "../components/common/Header"; // Assuming these exist
import Footer from "../components/common/Footer"; // Assuming these exist

const PRODUCTS_API_URL = 'http://localhost:8000/user/store/products/';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get(PRODUCTS_API_URL)
      .then(response => {
        setProducts(response.data.slice(0, 8)); // Get the latest 8 products
      })
      .catch(error => console.error("Failed to fetch products:", error))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <Header />
      
      {/* --- Hero Section --- */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Find Unique Products from Local Sellers</h1>
          <p style={styles.heroSubtitle}>Your one-stop marketplace for quality goods.</p>
        </div>
      </div>

      {/* --- Featured Products Section --- */}
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Featured Products</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div style={styles.grid}>
            {products.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} style={styles.cardLink}>
                <div style={styles.card}>
                  <img src={product.image_url || '/placeholder.png'} alt={product.name} style={styles.image} />
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
    hero: {
        height: '60vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
    },
    heroContent: {
        maxWidth: '800px',
    },
    heroTitle: {
        fontSize: '3.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
    },
    heroSubtitle: {
        fontSize: '1.25rem',
        color: '#6c757d',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    sectionTitle: {
        textAlign: 'center',
        fontSize: '2.5rem',
        marginBottom: '2.5rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
    },
    cardLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
    card: {
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        cursor: 'pointer',
    },
    image: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
    },
    cardContent: {
        padding: '15px',
    },
    productName: {
        margin: '0 0 10px 0',
        fontSize: '1.1rem',
        fontWeight: '600',
    },
    productPrice: {
        margin: 0,
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#212529',
    },
};