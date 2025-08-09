'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const API_URL = 'http://localhost:8000/user/store/products/';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  const fetchProducts = useCallback((searchQuery = '') => {
    setIsLoading(true);
    const url = searchQuery ? `${API_URL}?search=${searchQuery}` : API_URL;
    axios.get(url)
      .then(response => {
        // ✅ START: Robust data handling
        // This checks if the API returned a paginated response or a simple list.
        const productData = Array.isArray(response.data.results)
          ? response.data.results
          : Array.isArray(response.data)
            ? response.data
            : []; // Default to an empty array if the format is unexpected
        setProducts(productData);
        // ✅ END: Robust data handling
      })
      .catch(error => {
        console.error("Failed to fetch products:", error);
        setProducts([]); // Set to empty array on error to prevent crash
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
        fetchProducts(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, fetchProducts]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.store && product.store.seller_phone) {
        addToCart(product.store.seller_phone, product);
    } else {
        alert("Could not add to cart: seller information missing.");
    }
  };

  if (isLoading && products.length === 0) return <p>Loading...</p>;

  return (
    <div>
      <Header />
      <div style={styles.container}>
        <h1 style={styles.title}>Shop All Products</h1>
        <p style={styles.subtitle}>Discover unique items from sellers across Kerala</p>

        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.grid}>
          {products.map(product => (
            <div key={product.id} style={styles.card}>
              <Link href={`/product/${product.id}`} style={styles.cardLink}>
                <img src={product.image_url || '...'} alt={product.name} style={styles.image} />
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
      </div>
      <Footer />
    </div>
  );
}

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    title: { textAlign: 'center', fontSize: '2.5rem' },
    subtitle: { textAlign: 'center', color: '#6c757d', marginBottom: '2rem' },
    searchContainer: { margin: '0 auto 2rem auto', maxWidth: '600px' },
    searchInput: { width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '5px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' },
    card: { border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
    cardLink: { textDecoration: 'none', color: 'inherit' },
    image: { width: '100%', height: '200px', objectFit: 'cover' },
    cardContent: { padding: '15px', flexGrow: 1 },
    productName: { margin: '0 0 10px 0', fontSize: '1.1rem' },
    productPrice: { margin: 0, fontSize: '1.2rem', fontWeight: 'bold' },
    cardActions: { padding: '0 15px 15px 15px' },
    addToCartButton: { width: '100%', padding: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '500' },
};