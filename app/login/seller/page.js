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
     <div className="login-container">
      <div className="login-bg" />
      <div className="login-overlay" />
      <div className="login-box">
        <div className="login-card">
          <h2 className="login-title">Login</h2>

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError('');
            }}
            className="login-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="login-input"
          />

          {error && <p className="login-error">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="login-footer-text">
            Don't have an account? <a href="/register/seller">Register</a>
          </p>
        </div>
      </div>
    </div>
  
  );
}
