'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Wallet } from 'lucide-react';
import { asList } from '../../../lib/storeAccess';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

async function storeRequest(method, headers, body) {
  try {
    return await axios({
      method,
      url: `${API_BASE_URL}/user/store/expenses/`,
      headers,
      data: body,
    });
  } catch (err) {
    if (err.response?.status !== 404) throw err;
    return axios({
      method,
      url: `${API_BASE_URL}/api/store/expenses/`,
      headers,
      data: body,
    });
  }
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await storeRequest('get', headers());
      setExpenses(asList(response.data));
      setError('');
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError(err.response?.data?.error || 'Expense tracking is not on the current plan.');
      } else if (status === 404) {
        setError('Expense tracking is not available on this server yet.');
      } else if (!err.response) {
        setError('Could not load expenses. Check the connection and try again.');
      } else {
        setError(err.response?.data?.error || 'Could not load expenses.');
      }
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const add = async (event) => {
    event.preventDefault();
    const name = title.trim();
    const value = Number(amount);
    if (!name || !Number.isFinite(value) || value <= 0) {
      setError('Enter what you paid for and a positive amount.');
      return;
    }
    setSaving(true);
    try {
      await storeRequest('post', headers(), { title: name, amount: value, category: 'general' });
      setTitle('');
      setAmount('');
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save expense.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 880 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#175E54' }}>
        <Wallet size={22} /> Expenses
      </h1>
      <p style={{ color: '#64748b' }}>
        Record rent, petrol, and other shop costs. These are used in estimated profit. This is not a full accounting app.
      </p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      <form onSubmit={add} style={cardStyle}>
        <label style={labelStyle}>
          What did you pay for?
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Rent, petrol…"
            required
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          Amount
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="₹"
            type="number"
            min="0.01"
            step="0.01"
            required
            style={inputStyle}
          />
        </label>
        <button type="submit" disabled={saving || !title.trim() || !amount} style={buttonStyle}>
          {saving ? 'Saving…' : 'Add expense'}
        </button>
      </form>
      {expenses.length === 0 ? (
        <div style={cardStyle}>
          <strong>No expenses yet.</strong>
          <p style={{ color: '#64748b', margin: '8px 0 0' }}>Add rent, petrol, or other shop costs here.</p>
        </div>
      ) : expenses.map((row) => (
        <div key={row.id} style={cardStyle}>
          <strong>{row.title}</strong>
          <div style={{ color: '#175E54', fontWeight: 700, marginTop: 4 }}>₹{row.amount}</div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            {row.category}{row.spent_on ? ` · ${row.spent_on}` : ''}
          </div>
        </div>
      ))}
    </div>
  );
}

const cardStyle = {
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  marginBottom: 12,
  background: '#fff',
};
const labelStyle = { display: 'block', marginBottom: 12, color: '#334155', fontSize: 14 };
const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
};
const buttonStyle = {
  padding: '10px 14px',
  border: 0,
  borderRadius: 8,
  background: '#175E54',
  color: '#fff',
  cursor: 'pointer',
};
