'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginSeller() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Phone number and password are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/user/login/', {
        phone,
        password,
      });

      const { token, shop_url } = response.data;

      // ✅ Store token using correct key
      localStorage.setItem('accessToken', token);

      // ✅ Redirect to dashboard
      router.push('/dashboard/seller');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Seller Login</h2>

      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          setError('');
        }}
        style={{
          display: 'block',
          width: '100%',
          marginBottom: '15px',
          padding: '8px',
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError('');
        }}
        style={{
          display: 'block',
          width: '100%',
          marginBottom: '15px',
          padding: '8px',
        }}
      />

      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          padding: '10px 20px',
          width: '100%',
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}
