'use client';

import { useEffect, useState } from 'react';
import { Printer, Bluetooth, Globe, Usb, CheckCircle2, AlertCircle, Wifi } from 'lucide-react';
import {
  isWebBluetoothSupported,
  loadPrinterPref,
  printEscposViaBluetooth,
  savePrinterPref,
} from '../../../lib/printers';

const PAPER_SIZES = ['58mm', '80mm', 'A4'];

export default function PrintersPage() {
  const [pref, setPref] = useState({ method: 'browser', paperSize: '80mm', bluetoothName: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [testingBridge, setTestingBridge] = useState(false);
  const [bridgeOnline, setBridgeOnline] = useState(null); // null = unknown, true/false
  const [webBluetoothOk, setWebBluetoothOk] = useState(false);

  useEffect(() => {
    setPref(loadPrinterPref());
    setWebBluetoothOk(isWebBluetoothSupported());
  }, []);

  const persist = (next) => {
    const saved = savePrinterPref({ ...pref, ...next });
    setPref(saved);
    setNotice('✓ Printer settings saved.');
    setError('');
  };

  // ── Test USB/LAN local bridge ─────────────────────────────────────────
  const testBridge = async () => {
    setTestingBridge(true);
    setError('');
    setNotice('');
    try {
      const health = await fetch('http://127.0.0.1:17890/', { method: 'GET' });
      if (!health.ok) throw new Error('offline');
      setBridgeOnline(true);
      persist({ method: 'bridge' });
      setNotice('✓ Local print bridge is running. Bills will print silently over USB / LAN.');
    } catch {
      setBridgeOnline(false);
      setError(
        'Local print bridge is not running on this computer. Start pos-print-bridge.py first, then click "Check bridge".'
      );
    } finally {
      setTestingBridge(false);
    }
  };

  // ── Connect Web Bluetooth (POSiFLOW PSF210 etc.) ──────────────────────
  const connectBluetooth = async () => {
    if (!webBluetoothOk) {
      setError(
        'Web Bluetooth is not supported in this browser. Please use Google Chrome (desktop) or Microsoft Edge, then reload this page.'
      );
      return;
    }
    setConnecting(true);
    setError('');
    setNotice('');
    try {
      // Send a tiny ESC/POS init byte to test connection
      const name = await printEscposViaBluetooth('Gwo='); // ESC @ (printer init)
      persist({ method: 'thermal', bluetoothName: name });
      setNotice(`✓ Connected to "${name}". Thermal bills will print directly to this printer.`);
    } catch (err) {
      setError(err.message || 'Could not connect to the Bluetooth printer.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <Printer size={24} color="#175E54" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#175E54' }}>Printers</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
            Connect a thermal, Bluetooth, USB, LAN, or browser printer for bills
          </p>
        </div>
      </div>

      {error && (
        <div style={alertStyle('#fef2f2', '#b91c1c', '#fee2e2')}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div style={alertStyle('#f0fdf4', '#15803d', '#bbf7d0')}>
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* ── Method selector ── */}
      <div style={cardStyle}>
        <p style={labelStyle}>How to print bills</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <MethodBtn
            icon={<Globe size={16} />}
            label="Browser print"
            sub="Works everywhere. Opens print dialog."
            active={pref.method === 'browser'}
            onClick={() => persist({ method: 'browser' })}
          />
          <MethodBtn
            icon={<Bluetooth size={16} />}
            label="Bluetooth thermal"
            sub="58mm / 80mm direct print (POSiFLOW, Xprinter, etc.)"
            active={pref.method === 'thermal'}
            onClick={() => persist({ method: 'thermal' })}
            badge={!webBluetoothOk ? 'Chrome only' : null}
          />
          <MethodBtn
            icon={<Usb size={16} />}
            label="USB / LAN bridge"
            sub="Requires local Python bridge on this PC."
            active={pref.method === 'bridge'}
            onClick={() => persist({ method: 'bridge' })}
            badge={bridgeOnline === true ? 'Online' : bridgeOnline === false ? 'Offline' : null}
            badgeColor={bridgeOnline === true ? '#15803d' : '#b91c1c'}
          />
        </div>
        <p style={{ marginTop: 12, fontSize: '0.8rem', color: '#64748b' }}>
          {pref.method === 'thermal' && 'Bills are sent as ESC/POS bytes directly to the paired Bluetooth printer. Set paper size to 58mm for the POSiFLOW PSF210.'}
          {pref.method === 'bridge' && 'Bills are sent to the local Python bridge (pos-print-bridge.py) running on this computer at http://127.0.0.1:17890.'}
          {pref.method === 'browser' && 'The bill opens as an HTML receipt in a new tab. Use your browser\'s print dialog to send to any printer (Bluetooth, Wi-Fi, USB, or PDF).'}
        </p>
      </div>

      {/* ── Paper size ── */}
      <div style={cardStyle}>
        <p style={labelStyle}>Paper size</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PAPER_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => persist({ paperSize: size })}
              style={pref.paperSize === size ? chipActive : chipGhost}
            >
              {size}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: '0.8rem', color: '#64748b' }}>
          POSiFLOW PSF210 is a <strong>58mm</strong> printer. Select 58mm for correct receipt width.
        </p>
      </div>

      {/* ── Bluetooth connect ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Bluetooth size={18} color="#175E54" />
          <p style={{ ...labelStyle, margin: 0 }}>Bluetooth thermal printer (POSiFLOW PSF210)</p>
        </div>
        {pref.bluetoothName ? (
          <div style={alertStyle('#f0fdf4', '#15803d', '#bbf7d0')}>
            <CheckCircle2 size={14} />
            <span>Connected: <strong>{pref.bluetoothName}</strong></span>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '6px 0 12px' }}>
            No Bluetooth printer connected yet.
          </p>
        )}

        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', marginBottom: 16, fontSize: '0.82rem', color: '#374151', lineHeight: 1.6 }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>📋 How to connect POSiFLOW PSF210:</strong>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            <li>Power on the printer and make sure Bluetooth is on.</li>
            <li>On your computer, go to <strong>Settings → Bluetooth</strong> and pair the printer (it will appear as <em>PSF210</em> or similar).</li>
            <li>Use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> (Web Bluetooth is required).</li>
            <li>Click <strong>"Connect Bluetooth printer"</strong> below, select your printer from the list, and click Pair.</li>
            <li>Set paper size to <strong>58mm</strong> above.</li>
            <li>Set print method to <strong>"Bluetooth thermal"</strong> above.</li>
          </ol>
        </div>

        {!webBluetoothOk && (
          <div style={alertStyle('#fffbeb', '#b45309', '#fde68a')}>
            <AlertCircle size={14} />
            <span>Web Bluetooth is not available in this browser. Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on desktop, then reload this page.</span>
          </div>
        )}

        <button
          type="button"
          onClick={connectBluetooth}
          disabled={connecting || !webBluetoothOk}
          style={{ ...btnPrimary, opacity: connecting || !webBluetoothOk ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Bluetooth size={16} />
          {connecting ? 'Connecting…' : pref.bluetoothName ? 'Change Bluetooth printer' : 'Connect Bluetooth printer'}
        </button>
      </div>

      {/* ── USB / LAN Bridge ── */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Wifi size={18} color="#175E54" />
          <p style={{ ...labelStyle, margin: 0 }}>USB / LAN bridge (for POS counter computers)</p>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 12px' }}>
          Run the local Python bridge on your billing computer for USB and LAN printers that don't support Web Bluetooth.
        </p>
        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', fontSize: '0.82rem', color: '#374151', marginBottom: 12 }}>
          <strong>Bridge status:</strong>{' '}
          {bridgeOnline === null ? 'Not checked yet.' : bridgeOnline ? '✅ Running' : '❌ Not running'}
        </div>
        <button
          type="button"
          onClick={testBridge}
          disabled={testingBridge}
          style={{ ...btnSecondary, display: 'flex', alignItems: 'center', gap: 8, opacity: testingBridge ? 0.6 : 1 }}
        >
          <Usb size={16} />
          {testingBridge ? 'Checking…' : 'Check USB / LAN bridge'}
        </button>
      </div>

      {/* ── Current settings summary ── */}
      <div style={{ ...cardStyle, background: '#f8fafc' }}>
        <p style={labelStyle}>Current settings</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: '0.875rem', color: '#374151' }}>
          <span style={{ color: '#64748b' }}>Print method</span>
          <strong>{pref.method === 'thermal' ? 'Bluetooth thermal' : pref.method === 'bridge' ? 'USB / LAN bridge' : 'Browser print dialog'}</strong>
          <span style={{ color: '#64748b' }}>Paper size</span>
          <strong>{pref.paperSize}</strong>
          {pref.bluetoothName && <>
            <span style={{ color: '#64748b' }}>Bluetooth printer</span>
            <strong>{pref.bluetoothName}</strong>
          </>}
        </div>
      </div>
    </div>
  );
}

function MethodBtn({ icon, label, sub, active, onClick, badge, badgeColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: '1 1 160px',
        padding: '12px 14px',
        borderRadius: 10,
        border: active ? '2px solid #175E54' : '1px solid #e5e7eb',
        background: active ? '#f0fdf4' : '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#175E54', fontWeight: 700, fontSize: '0.875rem' }}>
        {icon}{label}
        {badge && (
          <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 700, background: badgeColor || '#64748b', color: '#fff', borderRadius: 6, padding: '1px 6px' }}>
            {badge}
          </span>
        )}
      </div>
      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>{sub}</p>
      {active && <CheckCircle2 size={14} color="#175E54" style={{ position: 'absolute', top: 10, right: 10 }} />}
    </button>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const pageStyle = { maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 };
const headerStyle = { display: 'flex', alignItems: 'center', gap: 12 };
const cardStyle = { padding: 20, border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff' };
const labelStyle = { margin: '0 0 12px', fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' };
const btnPrimary = { padding: '10px 18px', borderRadius: 8, border: 'none', background: '#175E54', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const btnSecondary = { padding: '10px 18px', borderRadius: 8, border: '1px solid #175E54', background: '#fff', color: '#175E54', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const chipActive = { padding: '8px 16px', borderRadius: 8, border: '2px solid #175E54', background: '#175E54', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' };
const chipGhost = { padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' };
const alertStyle = (bg, text, border) => ({
  display: 'flex', alignItems: 'flex-start', gap: 8,
  background: bg, color: text, border: `1px solid ${border}`,
  borderRadius: 8, padding: '10px 14px', fontSize: '0.875rem', marginBottom: 12, lineHeight: 1.5,
});
