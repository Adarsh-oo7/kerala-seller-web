'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ShopFooter from '../common/ShopFooter';
import SHeader from '../common/SHeader';
import { fetchPublicShop } from '../../app/lib/shop-public';
import { POLICY_FIELDS, policyBody } from '../../app/lib/storePolicies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

export default function ShopPolicyPage({ policyKey }) {
  const { shopSlug } = useParams();
  const searchParams = useSearchParams();
  const [store, setStore] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const meta = POLICY_FIELDS.find((item) => item.key === policyKey) || POLICY_FIELDS[0];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetchPublicShop(axios, API_BASE_URL, shopSlug, searchParams);
        if (cancelled) return;
        const data = response?.data?.store || response?.data;
        setStore(data || null);
        if (!data) setError('Shop not found.');
      } catch {
        if (!cancelled) setError('Could not load this shop policy.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shopSlug, searchParams]);

  const phone = searchParams?.get('id');
  const shopHref = phone ? `/shop/${shopSlug}?id=${phone}` : `/shop/${shopSlug}`;

  return (
    <div>
      <SHeader store={store} />
      <main style={styles.wrap}>
        <Link href={shopHref} style={styles.back}>← Back to shop</Link>
        <p style={styles.kicker}>{store?.name || 'Shop'} · seller policy</p>
        <h1 style={styles.title}>{meta.title}</h1>
        {loading ? <p>Loading…</p> : null}
        {error ? <p style={styles.warn}>{error}</p> : null}
        {store ? (
          <>
            <p style={styles.lead}>
              This shop is operated by the seller. Kerala Sellers provides the software only.
              If something goes wrong, contact this seller. Kerala Sellers may ask for clarification or remove the shop.
            </p>
            <article style={styles.body}>{policyBody(store, policyKey)}</article>
          </>
        ) : null}
      </main>
      <ShopFooter store={store} />
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: '28px 16px 64px', color: '#111827', minHeight: '60vh' },
  back: { color: '#175E54', fontWeight: 700, textDecoration: 'none' },
  kicker: { color: '#175E54', fontWeight: 700, margin: '16px 0 0' },
  title: { fontSize: 28, margin: '8px 0 12px' },
  lead: { color: '#4b5563', marginBottom: 24 },
  body: { whiteSpace: 'pre-wrap', lineHeight: 1.65, color: '#1f2937' },
  warn: { color: '#b45309' },
};
