'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginSeller() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Phone number and password are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ CORRECTED API URL
      const response = await axios.post('http://localhost:8000/user/login/', {
        phone,
        password,
      });

      localStorage.setItem('accessToken', response.data.token);

      // ✅ CORRECTED REDIRECT PATH
      router.push('/dashboard/seller');

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMessage);
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
          <h2 className="login-title">Seller Login</h2>
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="login-input"
          />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <span
            className="toggle-password-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
          {error && <p className="login-error">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="login-footer-text">
            Don't have an account?{' '}
            <Link href="/register/seller" className="login-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}