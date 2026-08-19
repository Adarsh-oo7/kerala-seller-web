'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ScanLine } from 'lucide-react';
import BarcodeScanner from '../../../../components/BarcodeScanner';
import {
  codesFromProduct,
  findProductByCode,
  generateShopBarcode,
  storedBarcode,
} from '../../../lib/barcode';
import { asList } from '../../../lib/storeAccess';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';
const PRODUCTS_URL = `${API_BASE_URL}/user/store/products/`;

export default function BarcodesPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [scanner, setScanner] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const headers = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await axios.get(PRODUCTS_URL, { headers: headers(), params: { page_size: 200 } });
      const list = asList(response.data);
      setProducts(list);
      setSelected((current) => current ? list.find((row) => row.id === current.id) || current : null);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load products.');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const taken = useMemo(() => products.flatMap((product) => codesFromProduct(product)), [products]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? products
      : products.filter((product) =>
          product.name?.toLowerCase().includes(q)
          || codesFromProduct(product).some((code) => code.includes(q)),
        );
    return [...list].sort((a, b) => Number(Boolean(a.barcode)) - Number(Boolean(b.barcode)));
  }, [products, query]);

  const saveBarcode = async (product, code) => {
    setSavingId(product.id);
    try {
      await axios.patch(`${PRODUCTS_URL}${product.id}/`, { barcode: storedBarcode(code) }, { headers: headers() });
      const next = { ...product, barcode: storedBarcode(code) };
      setProducts((prev) => prev.map((row) => (row.id === product.id ? next : row)));
      setSelected(next);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save barcode.');
    } finally {
      setSavingId(null);
    }
  };

  const onScan = (code) => {
    const match = findProductByCode(products, code);
    if (match) {
      setSelected(match.product);
      setQuery(code);
      setScanner(false);
      return;
    }
    if (selected) {
      saveBarcode(selected, code);
      setScanner(false);
      return;
    }
    setQuery(code);
    setError(`${code} is not on a shop product yet. Open Add product and save this packet barcode there.`);
    setScanner(false);
  };

  return (
    <div style={{ maxWidth: 880 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#175E54' }}>
        <ScanLine size={22} /> Barcodes
      </h1>
      <p style={{ color: '#64748b' }}>
        Create a shop sticker, or attach the barcode already printed on the packet. The till uses the same codes.
      </p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      {loading ? <p>Loading products…</p> : null}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) onScan(query.trim());
          }}
          placeholder="Name, SKU, or scan into this box"
          style={inputStyle}
        />
        <button type="button" onClick={() => setScanner(true)} style={buttonStyle}>
          <ScanLine size={16} /> Scan camera
        </button>
        <Link href="/dashboard/seller/products" style={{ ...buttonStyle, textDecoration: 'none' }}>Add product</Link>
      </div>

      {selected?.barcode ? (
        <div style={cardStyle}>
          <strong>{selected.name}</strong>
          <p style={{ letterSpacing: 2, fontSize: 20, margin: '8px 0' }}>{selected.barcode}</p>
        </div>
      ) : null}

      {filtered.map((product) => (
        <div key={product.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <button type="button" onClick={() => setSelected(product)} style={{ background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', flex: 1 }}>
            <strong>{product.name}</strong>
            <div style={{ color: '#64748b', fontSize: 13 }}>
              {product.barcode || 'No barcode yet'}
              {product.sku ? ` · SKU ${product.sku}` : ''}
            </div>
          </button>
          {product.barcode ? (
            <button type="button" onClick={() => setSelected(product)} style={ghostStyle}>Show</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                disabled={savingId != null}
                onClick={() => saveBarcode(product, generateShopBarcode([...taken, product.sku, product.barcode]))}
                style={buttonStyle}
              >
                {savingId === product.id ? 'Saving…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setSelected(product); setScanner(true); }}
                style={ghostStyle}
              >
                Scan
              </button>
            </div>
          )}
        </div>
      ))}

      <BarcodeScanner
        open={scanner}
        title="Scan packet barcode"
        onClose={() => setScanner(false)}
        onScan={onScan}
      />
    </div>
  );
}

const inputStyle = {
  flex: 1,
  minWidth: 220,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
};
const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 14px',
  borderRadius: 8,
  border: 'none',
  background: '#175E54',
  color: '#fff',
  cursor: 'pointer',
};
const ghostStyle = {
  ...buttonStyle,
  background: '#fff',
  color: '#175E54',
  border: '1px solid #175E54',
};
const cardStyle = {
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  marginBottom: 10,
  background: '#fff',
};
