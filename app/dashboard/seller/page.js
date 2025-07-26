'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
  const [seller, setSeller] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken'); // ✅ matches login key

    if (!token) {
      router.push('/login/seller');
      return;
    }

    axios
      .get('http://localhost:8000/user/dashboard/', {
        headers: {
  Authorization: `Token ${token}`,  // 🔥 Correct for DRF TokenAuth
},

      })
      .then((response) => {
        setSeller(response.data.seller);
      })
      .catch((error) => {
        console.error('Unauthorized or error', error);
        localStorage.removeItem('accessToken'); // Clear invalid token
        router.push('/login/seller');
      });
  }, []);

  if (!seller) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Welcome, {seller.name || seller.phone}</h2>
      <p><strong>Phone:</strong> {seller.phone}</p>
      <p><strong>Email:</strong> {seller.email}</p>
      <p><strong>Shop Name:</strong> {seller.shop_name}</p>
      <p><strong>Address:</strong> {seller.address}</p>
      <p><strong>Joined:</strong> {new Date(seller.created_at).toLocaleDateString()}</p>

      <button
        onClick={() => {
          localStorage.removeItem('accessToken');
          router.push('/login/seller');
        }}
        style={{
          marginTop: '20px',
          padding: '10px 15px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </div>
  );
}
