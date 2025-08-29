'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const LOGIN_API_URL = 'http://localhost:8000/user/login/';

export default function LoginSellerPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If a seller is already logged in, redirect them to the dashboard
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.push('/dashboard/seller');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault(); // Use form's onSubmit for better accessibility
    if (!phone || !password) {
      setError('Phone number and password are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(LOGIN_API_URL, { phone, password });
      localStorage.setItem('accessToken', response.data.token);
      router.push('/dashboard/seller');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Seller Login</h2>
        <p style={styles.subtitle}>Welcome back! Please sign in to your dashboard.</p>
        
        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <input
              type="tel"
              placeholder="10-Digit Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          {error && <p style={styles.error}>{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={styles.footerLinks}>
          <Link href="/forgot-password/seller" style={styles.link}>
            Forgot Password?
          </Link>
          <span style={{color: '#ccc'}}>|</span>
          <Link href="/register/seller" style={styles.link}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center', maxWidth: '90%' },
    title: { marginBottom: '10px' },
    subtitle: { color: '#6c757d', marginBottom: '25px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '12px', marginTop: '15px', border: 'none', borderRadius: '5px', backgroundColor: '#0d6efd', color: 'white', cursor: 'pointer', fontSize: '1rem' },
    error: { color: 'red', marginTop: '10px', fontSize: '0.9rem', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '5px' },
    footerLinks: { marginTop: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' },
    link: { color: '#0d6efd', textDecoration: 'none' },
};