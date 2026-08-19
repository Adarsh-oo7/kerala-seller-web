'use client';

import { useCallback, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

export default function LoyaltyPage() {
  const [phone, setPhone] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [points, setPoints] = useState('');

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const lookup = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`${API_BASE_URL}/user/store/loyalty/`, {
        headers: headers(),
        params: { phone },
      });
      setData(response.data);
      setError('');
    } catch (err) {
      setData(null);
      setError(err.response?.data?.error || 'Loyalty is not on the current plan.');
    }
  };

  const adjust = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/user/store/loyalty/adjust/`, {
        phone, points: Number(points), note: 'Manual adjustment',
      }, { headers: headers() });
      setData(response.data);
      setPoints('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not adjust points.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <h1>Loyalty</h1>
      <p style={{ color: '#64748b' }}>Points on the customer phone already used in bills and orders. Not a second CRM.</p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      <form onSubmit={lookup} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Customer phone" maxLength={10} />
        <button type="submit">Look up</button>
      </form>
      {data ? <p>Balance: {data.balance} points</p> : null}
      <form onSubmit={adjust} style={{ display: 'flex', gap: 8 }}>
        <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Adjust (+/-)" />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
