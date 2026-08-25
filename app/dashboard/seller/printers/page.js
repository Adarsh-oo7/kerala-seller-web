'use client';

import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import {
  loadPrinterPref,
  printEscposViaBluetooth,
  savePrinterPref,
} from '../../../lib/printers';

export default function PrintersPage() {
  const [pref, setPref] = useState({ method: 'browser', paperSize: '80mm' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { setPref(loadPrinterPref()); }, []);

  const persist = (next) => {
    setPref(savePrinterPref({ ...pref, ...next }));
    setNotice('Printer settings saved. New bills will use this.');
    setError('');
  };

  const testBridge = async () => {
    setError('');
    try {
      const health = await fetch('http://127.0.0.1:17890/');
      if (!health.ok) throw new Error('offline');
      persist({ method: 'bridge' });
      setNotice('Local print bridge is running. Thermal bills will print silently.');
    } catch {
      setError('Start pos-print-bridge.py on this computer for USB, LAN, and many Bluetooth printers. Browser print still works.');
    }
  };

  const connectBluetooth = async () => {
    setError('');
    try {
      const name = await printEscposViaBluetooth('Gwo=');
      persist({ method: 'thermal', bluetoothName: name });
      setNotice(`Connected ${name}. Thermal bills will use Web Bluetooth.`);
    } catch (err) {
      setError(err.message || 'Could not connect a Bluetooth printer.');
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#175E54' }}>
        <Printer size={22} /> Printers
      </h1>
      <p style={{ color: '#64748b' }}>
        Connect a thermal, Bluetooth, USB, LAN, or computer printer. The till uses the same shop receipt as the app.
      </p>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      {notice ? <p style={{ color: '#175E54' }}>{notice}</p> : null}

      <div style={cardStyle}>
        <strong>How to print bills</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button type="button" onClick={() => persist({ method: 'browser' })} style={pref.method === 'browser' ? buttonStyle : ghostStyle}>Browser print</button>
          <button type="button" onClick={() => persist({ method: 'bridge' })} style={pref.method === 'bridge' ? buttonStyle : ghostStyle}>Local USB / LAN bridge</button>
          <button type="button" onClick={() => persist({ method: 'thermal' })} style={pref.method === 'thermal' ? buttonStyle : ghostStyle}>Bluetooth thermal</button>
        </div>
      </div>

      <div style={cardStyle}>
        <strong>Paper size</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {['58mm', '80mm', 'A4'].map((size) => (
            <button key={size} type="button" onClick={() => persist({ paperSize: size })} style={pref.paperSize === size ? buttonStyle : ghostStyle}>{size}</button>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <strong>Connect</strong>
        <p style={{ color: '#64748b' }}>Current: {pref.method}{pref.bluetoothName ? ` · ${pref.bluetoothName}` : ''}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={testBridge} style={buttonStyle}>Check USB / LAN bridge</button>
          <button type="button" onClick={connectBluetooth} style={ghostStyle}>Connect Bluetooth</button>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
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
  marginBottom: 12,
  background: '#fff',
};
