'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState('');

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    try {
      const [stock, catalog] = await Promise.all([
        axios.get(`${API_BASE_URL}/user/store/purchases/`, { headers: headers() }),
        axios.get(`${API_BASE_URL}/api/products/`, { headers: headers() }),
      ]);
      setPurchases(stock.data.purchases || []);
      const list = catalog.data.results || catalog.data || [];
      setProducts(Array.isArray(list) ? list : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Purchases are not on the current plan.');
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const add = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/user/store/purchases/`, {
        items: [{ product_id: Number(productId), quantity: Number(quantity), unit_cost: unitCost || 0 }],
      }, { headers: headers() });
      setQuantity('1');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not receive stock.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <h1>Purchases</h1>
      <p style={{ color: '#64748b' }}>Receive stock into the same product rows used by POS and online orders.</p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      <form onSubmit={add} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">Product</option>
          {products.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
        </select>
        <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <input type="number" min="0" step="0.01" placeholder="Unit cost" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
        <button type="submit">Receive</button>
      </form>
      {purchases.map((row) => (
        <div key={row.id} style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
          #{row.id} · {row.status} · {(row.items || []).map((item) => `${item.name} x${item.quantity}`).join(', ')}
        </div>
      ))}
    </div>
  );
}
