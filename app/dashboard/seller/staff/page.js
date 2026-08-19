'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Plus, Shield } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';
const STAFF_URL = `${API_BASE_URL}/user/staff/`;

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [catalog, setCatalog] = useState({ roles: [], max_staff: null, staff_used: 0 });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', password: '', role: 'cashier',
  });

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await axios.get(STAFF_URL, { headers: headers() });
      setStaff(response.data.staff || []);
      setCatalog({
        roles: response.data.catalog?.roles || [],
        max_staff: response.data.max_staff,
        staff_used: response.data.staff_used,
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load staff.');
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const addStaff = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await axios.post(STAFF_URL, form, { headers: headers() });
      setForm({ name: '', phone: '', password: '', role: 'cashier' });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add staff.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (member) => {
    if (member.is_store_owner) return;
    try {
      await axios.patch(`${STAFF_URL}${member.id}/`, { is_active: !member.is_active }, { headers: headers() });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update staff.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 920 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 24 }}>
        <Users size={22} /> Staff
      </h1>
      <p style={{ color: '#64748b' }}>
        {catalog.staff_used} of {catalog.max_staff ?? 'unlimited'} additional staff used
      </p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

      <form onSubmit={addStaff} style={{ display: 'grid', gap: 10, maxWidth: 420, margin: '20px 0', padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> Add staff</strong>
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        <input required placeholder="10-digit phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
        <input required type="password" placeholder="Login password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle}>
          {(catalog.roles || []).filter((role) => role.code !== 'owner').map((role) => (
            <option key={role.code} value={role.code}>{role.name}</option>
          ))}
        </select>
        <button type="submit" disabled={saving} style={buttonStyle}>{saving ? 'Saving…' : 'Create login'}</button>
      </form>

      <div style={{ display: 'grid', gap: 12 }}>
        {staff.map((member) => (
          <div key={member.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <strong>{member.name}</strong>
                <div style={{ color: '#64748b', fontSize: 14 }}>{member.phone} · {member.role}</div>
                <div style={{ marginTop: 8, color: '#475569', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14} /> {member.permissions?.length || 0} permissions
                </div>
              </div>
              {member.is_store_owner ? (
                <span>Owner</span>
              ) : (
                <button type="button" onClick={() => toggleActive(member)} style={buttonStyle}>
                  {member.is_active ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
};

const buttonStyle = {
  padding: '10px 14px',
  borderRadius: 8,
  border: 'none',
  background: '#0f766e',
  color: '#fff',
  cursor: 'pointer',
};
