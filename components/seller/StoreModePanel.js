'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CreditCard, Store } from 'lucide-react';

import { fetchStorefrontStatus, patchStorefrontSettings, isPublishLocked } from '../../app/lib/storefront-status';

export default function StoreModePanel({ variant = 'settings' }) {
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchStorefrontStatus();
      setStatus(data);
    } catch (err) {
      setError('Could not load storefront status.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (payload, { next } = {}) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const data = await patchStorefrontSettings(payload);
      setStatus(data);
      setMessage(
        payload.store_mode === 'offline_only'
          ? 'Offline-only mode is on. Billing and stock stay available; online checkout is off.'
          : payload.store_mode === 'online'
            ? 'Online mode is on. Add Razorpay to keep the public shop live after the grace period.'
            : 'Storefront setting saved.'
      );
      if (next) router.push(next);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || data?.error || 'Could not update storefront settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!status) {
    return null;
  }

  const gated = !status.can_go_live;
  const offline = status.store_mode === 'offline_only';
  const publishLocked = isPublishLocked(status);

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>
        <Store size={18} />
        How do you sell?
      </h3>
      <p style={styles.help}>
        You can change this anytime. Skipping online payments does not block billing or stock.
        Switching back to online does not restart the 7-day Razorpay window.
      </p>

      <div style={styles.choices}>
        <button
          type="button"
          disabled={saving}
          onClick={() => update({ store_mode: 'online' })}
          style={{
            ...styles.choice,
            borderColor: !offline ? '#1a4845' : '#d1d5db',
            backgroundColor: !offline ? '#ecfdf5' : '#fff',
          }}
        >
          <CreditCard size={18} />
          <span>
            <strong>Online store</strong>
            <br />
            Public shop with checkout. Razorpay can be added now or during the grace period.
          </span>
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => update({ store_mode: 'offline_only' })}
          style={{
            ...styles.choice,
            borderColor: offline ? '#1a4845' : '#d1d5db',
            backgroundColor: offline ? '#ecfdf5' : '#fff',
          }}
        >
          <Store size={18} />
          <span>
            <strong>I run an offline / physical store</strong>
            <br />
            Skip Razorpay. The public page stays listed for search as an in-store
            shop, with a clear “no online checkout” mark.
          </span>
        </button>
      </div>

      {variant === 'payments' && !offline && (
        <button
          type="button"
          disabled={saving}
          onClick={() => router.push('/dashboard/seller')}
          style={styles.skip}
        >
          Skip for now — use the 7-day grace period
        </button>
      )}

      <label style={styles.publishRow} title={gated ? 'Add Razorpay or switch to offline-only to publish.' : undefined}>
        <input
          type="checkbox"
          checked={Boolean(status.is_storefront_published)}
          disabled={saving || publishLocked}
          onChange={(event) => update({ is_storefront_published: event.target.checked })}
        />
        Publish store on the public storefront
        {gated && (
          <span style={styles.hint}>
            {' '}— disabled until Razorpay is added or you choose offline-only
          </span>
        )}
      </label>

      {error && (
        <p style={styles.error}>
          <AlertCircle size={14} /> {error}
        </p>
      )}
      {message && <p style={styles.ok}>{message}</p>}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'rgb(62, 117, 114)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    color: '#fff',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 16,
    fontWeight: 700,
    color: 'rgb(255, 238, 175)',
    margin: '0 0 8px',
  },
  help: {
    fontSize: 13,
    lineHeight: 1.5,
    margin: '0 0 14px',
    color: '#e5e7eb',
  },
  choices: {
    display: 'grid',
    gap: 10,
  },
  choice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    textAlign: 'left',
    padding: 12,
    borderRadius: 10,
    border: '2px solid',
    cursor: 'pointer',
    color: '#111827',
    fontSize: 13,
    lineHeight: 1.4,
    minHeight: 44,
  },
  skip: {
    marginTop: 12,
    background: 'transparent',
    border: 'none',
    color: 'rgb(255, 238, 175)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    minHeight: 44,
  },
  publishRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    fontSize: 13,
    flexWrap: 'wrap',
  },
  hint: {
    color: 'rgb(255, 238, 175)',
    fontWeight: 500,
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#fecaca',
    marginTop: 10,
    fontSize: 13,
  },
  ok: {
    color: '#bbf7d0',
    marginTop: 10,
    fontSize: 13,
  },
};
