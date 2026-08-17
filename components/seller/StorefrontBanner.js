'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, CreditCard, Store, X } from 'lucide-react';

import {
  BANNER_DISMISS_KEY,
  fetchStorefrontStatus,
  shouldShowRazorpayBanner,
} from '../../app/lib/storefront-status';

export default function StorefrontBanner() {
  const [status, setStatus] = useState(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDismissed(sessionStorage.getItem(BANNER_DISMISS_KEY) === '1');
    }
    let cancelled = false;
    fetchStorefrontStatus()
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(BANNER_DISMISS_KEY, '1');
    }
    setDismissed(true);
  }, []);

  if (dismissed || !shouldShowRazorpayBanner(status)) {
    return null;
  }

  const expired = Boolean(status.grace_expired) || Number(status.days_remaining) <= 0;
  const days = Number(status.days_remaining) || 0;

  return (
    <div
      role="status"
      style={{
        ...styles.bar,
        backgroundColor: expired ? '#fef2f2' : '#fffbeb',
        borderColor: expired ? '#fecaca' : '#fde68a',
      }}
    >
      <div style={styles.iconWrap}>
        {expired ? <AlertCircle size={18} color="#b91c1c" /> : <Clock size={18} color="#b45309" />}
      </div>
      <div style={styles.copy}>
        {expired ? (
          <>
            <strong>Your public storefront is paused.</strong>
            {' '}Dashboard, billing, and stock still work. Add Razorpay or switch to offline-only
            in Settings to go live again.
          </>
        ) : (
          <>
            <strong>{days} day{days === 1 ? '' : 's'} left</strong>
            {' '}to add Razorpay so your shop stays live online. Billing and stock are already available.
          </>
        )}
      </div>
      <Link href="/dashboard/seller/payments" style={styles.cta}>
        <CreditCard size={14} />
        Set up Razorpay
      </Link>
      <Link href="/dashboard/seller/settings" style={styles.secondary}>
        <Store size={14} />
        Offline store
      </Link>
      <button type="button" onClick={dismiss} style={styles.close} aria-label="Dismiss reminder">
        <X size={16} />
      </button>
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    margin: '0 16px 12px',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid',
    fontSize: 13,
    color: '#1f2937',
    lineHeight: 1.4,
  },
  iconWrap: { display: 'flex', alignItems: 'center' },
  copy: { flex: 1, minWidth: 220 },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a4845',
    color: '#ffeeaf',
    padding: '8px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 13,
    minHeight: 36,
  },
  secondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#1a4845',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 13,
    minHeight: 36,
  },
  close: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 6,
    minWidth: 36,
    minHeight: 36,
    color: '#6b7280',
  },
};
