'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';
const ENTITLEMENTS_URL = `${API_BASE_URL}/api/subscriptions/entitlements/`;
const CREATE_URL = `${API_BASE_URL}/api/subscriptions/addons/create-order/`;
const VERIFY_URL = `${API_BASE_URL}/api/subscriptions/addons/verify-payment/`;
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

export default function AddonsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(null);

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await axios.get(ENTITLEMENTS_URL, { headers: headers() });
      setData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load add-ons.');
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (document.getElementById('razorpay-addon-script')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-addon-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  const purchase = async (addon) => {
    setBuying(addon.id);
    try {
      const order = await axios.post(CREATE_URL, { addon_id: addon.id }, { headers: headers() });
      const rzp = new window.Razorpay({
        key: order.data.key_id || RAZORPAY_KEY_ID,
        amount: order.data.amount,
        currency: order.data.currency || 'INR',
        order_id: order.data.order_id,
        name: 'Kerala Sellers',
        description: addon.name,
        handler: async (response) => {
          await axios.post(VERIFY_URL, {
            addon_id: addon.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }, { headers: headers() });
          await load();
        },
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start add-on purchase.');
    } finally {
      setBuying(null);
    }
  };

  const billing = data?.billing || {};
  const addons = data?.addons || [];
  const active = billing.active_addons || [];

  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <h1>Add-ons</h1>
      <p style={{ color: '#64748b' }}>
        Extra capacity and features billed monthly on top of your current plan. Superuser sets prices in admin — nothing here is hardcoded.
      </p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      <p>Add-on monthly total: ₹{billing.monthly_total ?? 0}</p>
      <p>Base plan ₹{billing.base_plan_price ?? 0} + add-ons ₹{billing.addons_price ?? 0}</p>
      <h2>Active</h2>
      {active.length === 0 ? <p>No add-ons yet.</p> : active.map((item) => (
        <div key={item.id || item.slug} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 8 }}>
          {item.name} · ₹{item.price}/{item.billing_period || 'month'}
        </div>
      ))}
      <h2>Available</h2>
      {addons.map((addon) => (
        <div key={addon.id} style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 12, marginBottom: 12 }}>
          <strong>{addon.name}</strong>
          <p>{addon.description}</p>
          <p>₹{addon.price} / {addon.billing_period}</p>
          <button type="button" disabled={buying === addon.id} onClick={() => purchase(addon)}>
            {buying === addon.id ? 'Opening payment…' : 'Purchase'}
          </button>
        </div>
      ))}
    </div>
  );
}
