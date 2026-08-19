'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

export default function LocationsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/store/branches/`, { headers: headers() });
      setRows(response.data.branches || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Extra locations are not on the current plan.');
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const add = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/user/store/branches/`, { name, address }, { headers: headers() });
      setName('');
      setAddress('');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add location.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <h1>Locations</h1>
      <p style={{ color: '#64748b' }}>Extra counters on this seller account. Stock stays on the existing product inventory.</p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      <form onSubmit={add} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Location name" required />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
        <button type="submit">Add location</button>
      </form>
      {rows.map((row) => (
        <div key={row.id} style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
          <strong>{row.name}</strong>{row.is_primary ? ' · Main' : ''} · {row.address || 'No address'}
        </div>
      ))}
    </div>
  );
}
