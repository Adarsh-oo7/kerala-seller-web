'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/store/expenses/`, { headers: headers() });
      setExpenses(response.data.expenses || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Expense tracking is not on the current plan.');
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const add = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/user/store/expenses/`, {
        title, amount, category,
      }, { headers: headers() });
      setTitle('');
      setAmount('');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save expense.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <h1>Expenses</h1>
      <p style={{ color: '#64748b' }}>Shop costs used in estimated profit. This is not a full accounting app.</p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      <form onSubmit={add} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" min="0.01" step="0.01" required />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
        <button type="submit">Add</button>
      </form>
      {expenses.map((row) => (
        <div key={row.id} style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
          <strong>{row.title}</strong> · ₹{row.amount} · {row.category}<br />
          {row.spent_on}
        </div>
      ))}
    </div>
  );
}
