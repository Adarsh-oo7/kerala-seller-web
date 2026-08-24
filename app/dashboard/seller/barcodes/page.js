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
import { requestError } from '../../../lib/requestError';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';
const PRODUCTS_URL = `${API_BASE_URL}/user/store/products/`;

export default function BarcodesPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(null);
  const [scanner, setScanner] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [unlockedId, setUnlockedId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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
      setSelected((current) => (current ? list.find((row) => row.id === current.id) || current : null));
    } catch (err) {
      setError(requestError(err, 'Could not load products. Check your internet and try again.'));
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

  const locked = savingId != null;

  const applySaved = (product, code) => {
    const next = { ...product, barcode: storedBarcode(String(product.barcode || code)) };
    setProducts((prev) => prev.map((row) => (row.id === next.id ? { ...row, ...next } : row)));
    setSelected(next);
    setDraft(null);
    setUnlockedId(null);
    setNotice(`Saved ${next.barcode} on ${next.name}. Locked until you unlock it.`);
    setError('');
  };

  const saveBarcode = async (product, code) => {
    const value = storedBarcode(code);
    if (!value) {
      setError('Enter or create a barcode before saving.');
      return;
    }
    const duplicate = findProductByCode(products, value);
    if (duplicate && duplicate.product.id !== product.id) {
      setError(`This barcode is already on ${duplicate.product.name}.`);
      return;
    }
    setSavingId(product.id);
    setError('');
    try {
      await axios.patch(`${PRODUCTS_URL}${product.id}/`, { barcode: value }, { headers: headers() });
      const confirmed = await axios.get(`${PRODUCTS_URL}${product.id}/`, { headers: headers() });
      const kept = storedBarcode(String(confirmed.data?.barcode || ''));
      if (!kept) {
        throw new Error('The server did not keep this barcode.');
      }
      applySaved({ ...product, ...confirmed.data, barcode: kept }, kept);
    } catch (err) {
      setError(requestError(err, 'The barcode was not saved. Check your internet and tap Save again.'));
    } finally {
      setSavingId(null);
    }
  };

  const startCreate = (product) => {
    if (locked) return;
    if (product.barcode && unlockedId !== product.id) {
      setError('Unlock this product first to change or replace the barcode.');
      return;
    }
    setSelected(product);
    setNotice('');
    setDraft({
      id: product.id,
      name: product.name,
      code: generateShopBarcode([...taken, product.sku, product.barcode]),
    });
  };

  const lookupRemote = async (code) => {
    const response = await axios.get(PRODUCTS_URL, {
      headers: headers(),
      params: { barcode: storedBarcode(code), page_size: 20 },
    });
    return findProductByCode(asList(response.data), code);
  };

  const onScan = async (code) => {
    const value = storedBarcode(code);
    setScanner(false);
    if (!value) return;
    const local = findProductByCode(products, value);
    if (local) {
      setSelected(local.product);
      setQuery(value);
      setDraft(null);
      setError('');
      return;
    }
    try {
      const remote = await lookupRemote(value);
      if (remote) {
        applySaved(remote.product, value);
        setQuery(value);
        return;
      }
    } catch (err) {
      setError(requestError(err, 'Could not check this barcode. Check your internet and try again.'));
      return;
    }
    setQuery(value);
    setError(`${value} is not saved on a shop product yet. Select a product, tap Create or Scan, then tap Save.`);
  };

  const draftProduct = draft ? products.find((row) => row.id === draft.id) : null;

  return (
    <div style={{ maxWidth: 880 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#175E54' }}>
        <ScanLine size={22} /> Barcodes
      </h1>
      <p style={{ color: '#64748b' }}>
        Create or scan a code, tap Save, then lock it. Unlock to change or remove. The till only finds saved codes.
      </p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      {notice ? <p style={{ color: '#175E54' }}>{notice}</p> : null}
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
        <button type="button" onClick={() => setScanner(true)} style={buttonStyle} disabled={locked}>
          <ScanLine size={16} /> Scan camera
        </button>
        <Link href="/dashboard/seller/products" style={{ ...buttonStyle, textDecoration: 'none' }}>Add product</Link>
      </div>

      {draft && draftProduct ? (
        <div style={cardStyle}>
          <strong>{draft.name}</strong>
          <p style={{ color: '#64748b', margin: '6px 0' }}>Not saved yet. Tap Save to attach this code.</p>
            <input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: storedBarcode(e.target.value) })}
              style={{ ...inputStyle, letterSpacing: 2, fontSize: 18, margin: '8px 0' }}
            />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              disabled={locked}
              onClick={() => saveBarcode(draftProduct, draft.code)}
              style={buttonStyle}
            >
              {savingId === draft.id ? 'Saving…' : 'Save'}
            </button>
            <button type="button" disabled={locked} onClick={() => setDraft(null)} style={ghostStyle}>Cancel</button>
          </div>
        </div>
      ) : null}

      {selected?.barcode && !draft ? (
        <div style={cardStyle}>
          <strong>{selected.name}</strong>
          <p style={{ color: '#64748b', margin: '6px 0' }}>
            {unlockedId === selected.id ? 'Unlocked. Change, scan a new code, or remove, then Save.' : 'Locked. Unlock to change or remove this code.'}
          </p>
          <p style={{ letterSpacing: 2, fontSize: 20, margin: '8px 0' }}>{selected.barcode}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {unlockedId === selected.id ? (
              <>
                <button type="button" disabled={locked} onClick={() => setUnlockedId(null)} style={ghostStyle}>Lock</button>
                <button type="button" disabled={locked} onClick={() => startCreate(selected)} style={buttonStyle}>New code</button>
                <button type="button" disabled={locked} onClick={() => { setSelected(selected); setScanner(true); }} style={ghostStyle}>Scan replace</button>
                <button
                  type="button"
                  disabled={locked}
                  onClick={async () => {
                    if (!window.confirm(`Remove ${selected.barcode} from ${selected.name}?`)) return;
                    setSavingId(selected.id);
                    try {
                      await axios.patch(`${PRODUCTS_URL}${selected.id}/`, { barcode: '' }, { headers: headers() });
                      applySaved({ ...selected, barcode: '' }, '');
                      setUnlockedId(selected.id);
                      setNotice('Barcode removed. Create or scan a new one, then Save.');
                    } catch (err) {
                      setError(requestError(err, 'Could not remove this barcode.'));
                    } finally {
                      setSavingId(null);
                    }
                  }}
                  style={ghostStyle}
                >
                  Remove
                </button>
              </>
            ) : (
              <button type="button" disabled={locked} onClick={() => setUnlockedId(selected.id)} style={buttonStyle}>Unlock</button>
            )}
          </div>
        </div>
      ) : null}

      {filtered.map((product) => (
        <div key={product.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <button type="button" onClick={() => { if (!locked) { setSelected(product); setDraft(null); } }} style={{ background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', flex: 1 }}>
            <strong>{product.name}</strong>
            <div style={{ color: '#64748b', fontSize: 13 }}>
              {product.barcode || 'No barcode yet'}
              {product.sku ? ` · SKU ${product.sku}` : ''}
            </div>
          </button>
          {product.barcode ? (
            unlockedId === product.id ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" disabled={locked} onClick={() => startCreate(product)} style={buttonStyle}>Change</button>
                <button type="button" disabled={locked} onClick={() => { setSelected(product); setUnlockedId(null); setDraft(null); }} style={ghostStyle}>Lock</button>
              </div>
            ) : (
              <button type="button" disabled={locked} onClick={() => { setSelected(product); setUnlockedId(product.id); setDraft(null); }} style={ghostStyle}>Unlock</button>
            )
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                disabled={locked}
                onClick={() => startCreate(product)}
                style={buttonStyle}
              >
                Create
              </button>
              <button
                type="button"
                disabled={locked}
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
        onScan={(code) => { void onScan(code); }}
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
