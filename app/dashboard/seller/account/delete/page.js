'use client';

import { useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';
const DELETE_URL = `${API_BASE_URL}/user/seller/delete-account/`;
const PRIVACY_URL = 'https://www.keralasellers.in/privacy-policy';
const SUPPORT_EMAIL = 'keralasellers.in@gmail.com';

export default function DeleteAccountPage() {
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (confirm.trim().toUpperCase() !== 'DELETE') {
      setError('Type DELETE to permanently close this seller account.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(DELETE_URL, {}, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('sellerInfo');
      setDone(true);
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 404
          ? `The live server does not have account deletion yet. Email ${SUPPORT_EMAIL} from this seller phone to close the account.`
          : (err.response?.data?.error || err.response?.data?.message || `Could not delete yet. You can also email ${SUPPORT_EMAIL}.`),
      );
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div style={{ maxWidth: 640 }}>
        <h1>Account deleted</h1>
        <p>This seller account is closed. Shop login will no longer work.</p>
        <a href="/login/seller">Back to seller login</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b91c1c' }}>
        <Trash2 size={22} /> Delete account
      </h1>
      <p style={{ color: '#64748b' }}>
        This signs you out, disables login for this shop, and hides the public storefront. Order history
        needed for GST or disputes may be kept. This cannot be undone from the dashboard.
      </p>
      <p><a href={PRIVACY_URL} target="_blank" rel="noreferrer">Read the privacy policy</a></p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <label>
          Type DELETE to confirm
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
          />
        </label>
        <button
          type="submit"
          disabled={saving || confirm.trim().toUpperCase() !== 'DELETE'}
          style={{
            padding: '12px 16px',
            border: 0,
            borderRadius: 8,
            background: '#b91c1c',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {saving ? 'Deleting…' : 'Delete my account'}
        </button>
      </form>
    </div>
  );
}
