'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { AlertCircle, BadgeCheck, Check, Truck } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

const EASY_BANDS = [
  { key: 'light', title: 'Light', hint: 'Up to 1 kg', min: 0, max: 1, defaultPrice: 50 },
  { key: 'medium', title: 'Medium', hint: '1 kg to 3 kg', min: 1, max: 3, defaultPrice: 80 },
  { key: 'heavy', title: 'Heavy', hint: 'Above 3 kg', min: 3, max: null, defaultPrice: 120 },
];

function toNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isOpenEnded(slab) {
  return slab?.max_weight_kg == null || slab.max_weight_kg === '';
}

function detectMode(slabs) {
  if (
    slabs.length === 1 &&
    toNum(slabs[0].min_weight_kg) === 0 &&
    isOpenEnded(slabs[0]) &&
    slabs[0].pricing_type === 'FIXED'
  ) {
    return 'flat';
  }
  return 'weight';
}

function authHeaders() {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('sellerAccessToken');
  return token ? { Authorization: `Bearer ${token}` } : null;
}

function previewCharge(weightKg, subtotal, config, slabs) {
  if (!config.enabled || slabs.length === 0) return 0;
  const freeAbove = toNum(config.free_delivery_above);
  if (freeAbove > 0 && subtotal >= freeAbove) return 0;
  const match = [...slabs]
    .sort((a, b) => toNum(a.min_weight_kg) - toNum(b.min_weight_kg))
    .find((slab) => {
      const min = toNum(slab.min_weight_kg);
      const max = isOpenEnded(slab) ? null : toNum(slab.max_weight_kg);
      return weightKg >= min && (max == null || weightKg <= max);
    });
  if (!match) return toNum(config.fallback_flat_charge);
  return toNum(match.fixed_price);
}

export default function DeliverySettingsPage() {
  const [config, setConfig] = useState({
    enabled: false,
    fallback_flat_charge: 50,
    cod_extra_charge: 0,
    free_delivery_above: 0,
  });
  const [mode, setMode] = useState('weight');
  const [flatPrice, setFlatPrice] = useState('50');
  const [bandPrices, setBandPrices] = useState(['50', '80', '120']);
  const [savedSlabs, setSavedSlabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const freeDelivery = !config.enabled;

  const slabs = useMemo(() => {
    if (freeDelivery) return [];
    if (mode === 'flat') {
      const existing = savedSlabs[0];
      return [{
        id: typeof existing?.id === 'number' ? existing.id : `temp_flat`,
        min_weight_kg: 0,
        max_weight_kg: null,
        pricing_type: 'FIXED',
        fixed_price: toNum(flatPrice, 50),
        is_new: typeof existing?.id !== 'number',
      }];
    }
    return EASY_BANDS.map((band, index) => {
      const match = savedSlabs.find((slab) => toNum(slab.min_weight_kg) === band.min) || savedSlabs[index];
      return {
        id: typeof match?.id === 'number' ? match.id : `temp_${band.key}`,
        min_weight_kg: band.min,
        max_weight_kg: band.max,
        pricing_type: 'FIXED',
        fixed_price: toNum(bandPrices[index], band.defaultPrice),
        is_new: typeof match?.id !== 'number',
      };
    });
  }, [bandPrices, flatPrice, freeDelivery, mode, savedSlabs]);

  const load = async () => {
    const headers = authHeaders();
    if (!headers) {
      setError('Please login to manage delivery settings.');
      setLoading(false);
      return;
    }
    try {
      const [configRes, slabsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/user/store/delivery-slabs/config/`, { headers }),
        axios.get(`${API_BASE_URL}/user/store/delivery-slabs/slabs/`, { headers }),
      ]);
      const nextSlabs = Array.isArray(slabsRes.data) ? slabsRes.data : [];
      const enabled = Boolean(configRes.data.enabled);
      setConfig({
        enabled,
        fallback_flat_charge: configRes.data.fallback_flat_charge ?? 50,
        cod_extra_charge: configRes.data.cod_extra_charge ?? 0,
        free_delivery_above: configRes.data.free_delivery_above ?? 0,
      });
      setSavedSlabs(nextSlabs);
      if (enabled) {
        const nextMode = detectMode(nextSlabs);
        setMode(nextMode);
        if (nextMode === 'flat') {
          setFlatPrice(String(toNum(nextSlabs[0]?.fixed_price, 50)));
        } else {
          setBandPrices(
            EASY_BANDS.map((band, index) => {
              const match = nextSlabs.find((slab) => toNum(slab.min_weight_kg) === band.min) || nextSlabs[index];
              const price = toNum(match?.fixed_price, band.defaultPrice);
              return String(price > 0 ? price : band.defaultPrice);
            }),
          );
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load delivery settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const previews = [
    { label: 'One light item (0.5 kg)', weight: 0.5, subtotal: 400 },
    { label: 'Two items together (1.5 kg)', weight: 1.5, subtotal: 800 },
    { label: 'A heavy order (4 kg)', weight: 4, subtotal: 1500 },
  ].map((row) => ({
    ...row,
    charge: previewCharge(row.weight, row.subtotal, { ...config, enabled: true }, slabs),
  }));

  const persistSlabs = async (nextSlabs, headers) => {
    const keepIds = new Set(
      nextSlabs.map((slab) => slab.id).filter((id) => typeof id === 'number'),
    );
    const existingRes = await axios.get(`${API_BASE_URL}/user/store/delivery-slabs/slabs/`, { headers });
    const existing = Array.isArray(existingRes.data) ? existingRes.data : [];
    for (const slab of existing) {
      if (slab.id && !keepIds.has(Number(slab.id))) {
        await axios.delete(`${API_BASE_URL}/user/store/delivery-slabs/${slab.id}/delete_slab/`, { headers });
      }
    }
    for (let index = 0; index < nextSlabs.length; index += 1) {
      const slab = nextSlabs[index];
      const payload = {
        min_weight_kg: toNum(slab.min_weight_kg),
        max_weight_kg: slab.max_weight_kg == null ? null : toNum(slab.max_weight_kg),
        pricing_type: 'FIXED',
        fixed_price: toNum(slab.fixed_price),
        price_per_kg: 0,
        base_fee: 0,
        sort_order: index,
      };
      if (slab.is_new || String(slab.id).startsWith('temp_')) {
        await axios.post(`${API_BASE_URL}/user/store/delivery-slabs/create_slab/`, payload, { headers });
      } else {
        await axios.patch(`${API_BASE_URL}/user/store/delivery-slabs/${slab.id}/update_slab/`, payload, { headers });
      }
    }
  };

  const save = async () => {
    const headers = authHeaders();
    if (!headers) {
      setError('Please login to save.');
      return;
    }
    if (!freeDelivery) {
      if (mode === 'flat' && toNum(flatPrice) <= 0) {
        setError('Enter the amount buyers should pay for delivery.');
        return;
      }
      if (mode === 'weight' && bandPrices.some((price) => toNum(price) <= 0)) {
        setError('Enter a delivery charge for light, medium, and heavy orders.');
        return;
      }
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const fallback = mode === 'flat' ? toNum(flatPrice, 50) : toNum(bandPrices[2], 120);
      await axios.post(`${API_BASE_URL}/user/store/delivery-slabs/update_config/`, {
        enabled: !freeDelivery,
        fallback_flat_charge: fallback,
        cod_extra_charge: toNum(config.cod_extra_charge, 0),
        free_delivery_above: toNum(config.free_delivery_above, 0),
      }, { headers });
      if (!freeDelivery) await persistSlabs(slabs, headers);
      setSuccess(
        freeDelivery
          ? 'Buyers are not charged extra delivery.'
          : mode === 'flat'
            ? `Every order adds ₹${toNum(flatPrice)} delivery. Several products still pay this once.`
            : 'Checkout adds every product’s packed weight, then uses light, medium, or heavy.',
      );
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save delivery settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.wrap}><p>Loading delivery settings…</p></div>;
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}><Truck size={22} /> Delivery settings</h1>
      <p style={styles.lead}>
        Same as the seller app. Start with free delivery. Add a charge only if you need it.
      </p>

      <label style={styles.switchRow}>
        <span>
          <strong>Free delivery</strong>
          <span style={styles.hint}>Recommended. Buyers pay only for products.</span>
        </span>
        <input
          type="checkbox"
          checked={freeDelivery}
          onChange={(event) => setConfig((current) => ({ ...current, enabled: !event.target.checked }))}
        />
      </label>

      {freeDelivery ? (
        <p style={styles.ok}><BadgeCheck size={16} /> No extra delivery charge. One item or many items, delivery stays free.</p>
      ) : (
        <>
          <p style={styles.section}>How should buyers be charged?</p>
          <div style={styles.modes}>
            <button type="button" style={mode === 'flat' ? styles.modeOn : styles.modeOff} onClick={() => setMode('flat')}>
              One charge for all orders
            </button>
            <button type="button" style={mode === 'weight' ? styles.modeOn : styles.modeOff} onClick={() => setMode('weight')}>
              Charge by total weight
            </button>
          </div>

          {mode === 'flat' ? (
            <>
              <p style={styles.info}>If a buyer buys 3 products, they still pay this delivery amount once — not 3 times.</p>
              <label style={styles.label}>Delivery charge
                <input value={flatPrice} onChange={(e) => setFlatPrice(e.target.value)} style={styles.input} type="number" min="1" />
              </label>
            </>
          ) : (
            <>
              <p style={styles.info}>
                Two 0.6 kg products become 1.2 kg, so the medium charge is used. Add packed weight on each product.
              </p>
              {EASY_BANDS.map((band, index) => (
                <label key={band.key} style={styles.label}>
                  {band.title} · {band.hint}
                  <input
                    value={bandPrices[index]}
                    onChange={(event) => setBandPrices((current) => current.map((price, i) => (i === index ? event.target.value : price)))}
                    style={styles.input}
                    type="number"
                    min="1"
                  />
                </label>
              ))}
            </>
          )}

          <label style={styles.label}>Free delivery if order is above (optional)
            <input
              value={config.free_delivery_above || ''}
              onChange={(e) => setConfig((current) => ({ ...current, free_delivery_above: e.target.value }))}
              style={styles.input}
              type="number"
              min="0"
            />
          </label>
          <label style={styles.label}>Extra for cash on delivery (optional)
            <input
              value={config.cod_extra_charge || ''}
              onChange={(e) => setConfig((current) => ({ ...current, cod_extra_charge: e.target.value }))}
              style={styles.input}
              type="number"
              min="0"
            />
          </label>

          <div style={styles.preview}>
            <p style={styles.section}>Example</p>
            {previews.map((row) => (
              <p key={row.label} style={styles.previewRow}>
                <span>{row.label}</span>
                <strong>₹{row.charge}</strong>
              </p>
            ))}
          </div>
        </>
      )}

      {error ? <p style={styles.warn}><AlertCircle size={14} /> {error}</p> : null}
      {success ? <p style={styles.ok}><Check size={14} /> {success}</p> : null}

      <button type="button" onClick={save} disabled={saving} style={styles.primary}>
        {saving ? 'Saving…' : 'Save delivery settings'}
      </button>
      <p style={styles.lead}>
        Add packed weight in{' '}
        <Link href="/dashboard/seller/products" style={styles.link}>Products</Link>
        {' '}if you charge by weight.
      </p>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 720, margin: '0 auto', padding: '24px 16px 48px', color: '#111827' },
  title: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 24, margin: '0 0 8px' },
  lead: { color: '#4b5563', marginBottom: 16 },
  switchRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 },
  hint: { display: 'block', color: '#6b7280', fontSize: 13, fontWeight: 400, marginTop: 4 },
  section: { fontWeight: 700, margin: '8px 0' },
  modes: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  modeOn: { background: '#175E54', color: 'white', border: 0, borderRadius: 999, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' },
  modeOff: { background: 'white', color: '#111827', border: '1px solid #d1d5db', borderRadius: 999, padding: '10px 14px', cursor: 'pointer' },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600, fontSize: 14, marginBottom: 12 },
  input: { border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontWeight: 400 },
  preview: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, margin: '8px 0 16px' },
  previewRow: { display: 'flex', justifyContent: 'space-between', margin: '8px 0' },
  primary: { background: '#175E54', color: 'white', border: 0, borderRadius: 8, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' },
  ok: { color: '#047857', display: 'flex', gap: 6, alignItems: 'center' },
  info: { color: '#1d4ed8', marginBottom: 12 },
  warn: { color: '#b45309', display: 'flex', gap: 6, alignItems: 'center' },
  link: { color: '#175E54', fontWeight: 700 },
};
