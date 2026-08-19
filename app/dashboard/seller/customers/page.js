'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState('');

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/orders/customers/`, { headers: headers() });
      setCustomers(response.data.customers || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Customer list is not available on the current plan.');
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const openHistory = async (phone) => {
    setHistoryError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/user/orders/customers/${phone}/history/`, { headers: headers() });
      setHistory(response.data);
    } catch (err) {
      setHistoryError(err.response?.data?.error || 'Customer history is not on the current plan.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <h1>Customers</h1>
      <p>Rolled up from walk-in bills and online orders. Not a second CRM.</p>
      {error ? <p>{error}</p> : null}
      {customers.map((row) => (
        <button
          key={row.phone}
          type="button"
          onClick={() => openHistory(row.phone)}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: 12, border: 0, borderBottom: '1px solid #e5e7eb', background: 'transparent', cursor: 'pointer' }}
        >
          <strong>{row.name || 'Customer'}</strong> · {row.phone}<br />
          {row.orders} orders · ₹{row.total_purchases}
        </button>
      ))}
      {historyError ? <p style={{ color: '#b91c1c' }}>{historyError}</p> : null}
      {history ? (
        <div style={{ marginTop: 16 }}>
          <h2>History · {history.phone}</h2>
          {(history.orders || []).map((order) => (
            <div key={order.id} style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>
              {order.bill_number || order.id} · {order.order_type} · ₹{order.total_amount}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
