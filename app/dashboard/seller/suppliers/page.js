'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

export default function SuppliersPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/store/suppliers/`, { headers: headers() });
      setRows(response.data.suppliers || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Suppliers are not on the current plan.');
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const add = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/user/store/suppliers/`, { name, phone }, { headers: headers() });
      setName('');
      setPhone('');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save supplier.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <h1>Suppliers</h1>
      <p style={{ color: '#64748b' }}>Who you buy stock from. Receiving uses the existing product inventory.</p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      <form onSubmit={add} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        <button type="submit">Add</button>
      </form>
      {rows.map((row) => (
        <div key={row.id} style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
          <strong>{row.name}</strong> · {row.phone || 'No phone'}
        </div>
      ))}
    </div>
  );
}
