'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import FilterBar from "../../components/common/FilterBar"
import ProductCard from "../../components/common/ProductCard"

import TopCategory from "../../components/home/TopCategory";



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
    <div style={{backgroundColor:'#FDFFF0'}}> 
      <Header />
      <div style={{ width: "100%", margin: 0, padding: 0, marginTop: "20px", marginBottom: '20px' }}>
        <TopCategory />
      </div>
      <div style={styles.container}>
        <h1 className='section-title'>Discover Everything</h1>
        <p className='section-subtitle'>Discover unique items from sellers across Kerala</p>

        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <FilterBar />
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.name}
              price={product.price}
              primaryImage={product.image_url || "/placeholder.svg"}
              hoverImage={product.hover_image_url || product.image_url || "/placeholder.svg"}
              rating={product.rating || 4.5}
              isWishlisted={product.isWishlisted}
              onAddToCart={(e) => handleAddToCart(e, product)}
              onToggleWishlist={() => handleToggleWishlist?.(product)}
              className={product.online_stock === 0 ? "out-of-stock" : ""}
            >
              {/* 👇 You can wrap inside link if you prefer entire card clickable */}
              <Link href={`/product/${product.id}`} className="card-link-overlay" />
            </ProductCard>
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
  searchContainer: { margin: '2rem auto 2rem auto', maxWidth: '600px' },
  searchInput: { width: '100%', padding: '12px', fontSize: '1rem',color:'#6c757d', border: '1px solid #6c757d', borderRadius: '30px' },
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