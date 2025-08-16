'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useCart } from './context/CartContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import BannerSlider from "../components/home/BannerSlider";
import TopCategory from "../components/home/TopCategory";


const bannerImages = [
  { src: "/assets/images/3.png", alt: "Banner 3" },
  { src: "/assets/images/3.png", alt: "Banner 3" },
  { src: "/assets/images/3.png", alt: "Banner 3" },
];

const PRODUCTS_API_URL = 'http://localhost:8000/user/store/products/';
const STORES_API_URL = 'http://localhost:8000/shops/';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchData = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      axios.get(PRODUCTS_API_URL),
      axios.get(STORES_API_URL)
    ]).then(([productsResponse, storesResponse]) => {
      setProducts((productsResponse.data.results || []).slice(0, 8));
      setStores((storesResponse.data.results || []).slice(0, 6));
    }).catch(error => {
      console.error("Failed to fetch homepage data:", error);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.store && product.store.seller_phone) {
      addToCart(product.store.seller_phone, product);
    } else {
      alert("Could not add to cart: seller information is missing.");
    }
  };

  return (
    <div className='' style={{ backgroundColor: "#FDFFF0 " }}>
      {/* #FDFFF0 */}
      <Header />
      <div style={{ width: "100%", margin: 0, padding: 0, marginTop:"20px" }}>
        <TopCategory />
      </div>

      <div style={{ width: "100%", margin: 0, padding: 0, marginTop:"20px" , justifyContent: "center", display:"flex"}}>

        <BannerSlider images={bannerImages} autoPlay={true} interval={4000} />
      </div>

      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Featured Stores</h2>
        {isLoading ? <p>Loading...</p> : (
          <div style={styles.storesGrid}>
            {stores.map(store => (
              <Link key={store.name} href={`/shop/${store.seller_phone}`} style={styles.storeCardLink}>
                <div style={styles.storeCard}>
                  <img src={store.logo_url || 'https://placehold.co/100x100'} alt={`${store.name} logo`} style={styles.storeLogo} />
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
              <div key={product.id} style={styles.card}>
                <Link href={`/product/${product.id}`} style={styles.cardLink}>
                  <img src={product.image_url || 'https://placehold.co/400x300'} alt={product.name} style={styles.image} />
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
  card: { border: '1px solid #e9ecef', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  cardLink: { textDecoration: 'none', color: 'inherit' },
  image: { width: '100%', height: '200px', objectFit: 'cover', backgroundColor: '#e9ecef' },
  cardContent: { padding: '15px', flexGrow: 1 },
  productName: { margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '600' },
  productPrice: { margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#212529' },
  cardActions: { padding: '0 15px 15px 15px' },
  addToCartButton: { width: '100%', padding: '10px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '500' },
};