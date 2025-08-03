
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext'; // ✅ Corrected import with {}

const API_URL = 'http://localhost:8000/user/store/products/';
const BUYER_PROFILE_URL = 'http://localhost:8000/api/buyer/profile/'; 

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buyerStatus, setBuyerStatus] = useState({ isLoggedIn: false, isVerified: false });
  
  const { productId } = useParams();
  const router = useRouter();
  const { addToCart } = useCart(); // This line will now work correctly


  // Fetch product details
  useEffect(() => {
    if (!productId) return;
    axios.get(`${API_URL}${productId}/`)
      .then(response => setProduct(response.data))
      .catch(error => console.error("Failed to fetch product:", error))
      .finally(() => setIsLoading(false));
  }, [productId]);

  // ✅ Check buyer's login and verification status
  useEffect(() => {
    const token = localStorage.getItem('buyerAccessToken');
    if (token) {
      // In a real app, you would fetch the profile to check phone_verified status
      // For this example, we'll assume a logged-in user is verified.
      // To implement fully:
      // axios.get(BUYER_PROFILE_URL, { headers: { Authorization: `Token ${token}` }})
      //   .then(res => {
      //     setBuyerStatus({ isLoggedIn: true, isVerified: res.data.phone_verified });
      //   });
      setBuyerStatus({ isLoggedIn: true, isVerified: true }); // Simulating a verified user
    }
  }, []);

  const handleAddToCart = () => {
    if (!product) return;

    // ✅ START: Login and Verification Check
    if (!buyerStatus.isLoggedIn) {
      // If not logged in, redirect to the buyer login page
      router.push('/login/buyer');
      return;
    }

    if (!buyerStatus.isVerified) {
      // If logged in but not verified, send them to their profile to verify
      alert('Please verify your phone number on your profile page before purchasing.');
      router.push('/profile');
      return;
    }
    // ✅ END: Login and Verification Check

    // If all checks pass, add the item to the cart
    addToCart(product);
  };

  if (isLoading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div style={styles.container}>
      <div style={styles.imageContainer}>
        <img src={product.image_url || '/placeholder.png'} alt={product.name} style={styles.image} />
      </div>
      <div style={styles.detailsContainer}>
        <h1 style={styles.name}>{product.name}</h1>
        {product.model_name && <p style={styles.model}>{product.model_name}</p>}
        <p style={styles.description}>{product.description}</p>
        <div style={styles.priceContainer}>
          <span style={styles.price}>₹{product.price}</span>
          {product.mrp && <span style={styles.mrp}>MRP: ₹{product.mrp}</span>}
        </div>
        <p style={styles.stock}>
          {product.online_stock > 0 ? `${product.online_stock} available` : 'Out of Stock'}
        </p>
        <button 
          style={styles.addToCartButton} 
          disabled={product.online_stock === 0}
          onClick={handleAddToCart}
        >
          {product.online_stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}

const styles = {
    container: { display: 'flex', maxWidth: '1000px', margin: '40px auto', padding: '20px', gap: '40px' },
    imageContainer: { flex: 1 },
    image: { width: '100%', borderRadius: '8px' },
    detailsContainer: { flex: 1 },
    name: { fontSize: '2.5rem', margin: '0 0 10px 0' },
    model: { color: '#666', marginTop: 0 },
    description: { lineHeight: '1.6' },
    priceContainer: { display: 'flex', alignItems: 'baseline', gap: '15px', margin: '2rem 0' },
    price: { fontSize: '2rem', fontWeight: 'bold' },
    mrp: { textDecoration: 'line-through', color: '#999' },
    stock: { color: 'green', fontWeight: 'bold' },
    addToCartButton: { width: '100%', padding: '15px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer' },
};