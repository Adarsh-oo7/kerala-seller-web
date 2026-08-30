const PREF_KEY = 'ks.printer.pref';

// ── Known thermal printer Bluetooth service UUIDs ──────────────────────────
// ESC/POS Bluetooth SPP / custom thermal services
const THERMAL_SERVICES = [
  // POSiFLOW / generic 58mm ESC/POS printers (SPP-like GATT service)
  '000018f0-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  // Generic ESC/POS over BLE
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  // Epson TM / mPOP
  'a62f4bf6-9bbb-11e3-a5e2-0800200c9a66',
  // Star Micronics
  '00001101-0000-1000-8000-00805f9b34fb',
];

export function normalizePaperSize(value) {
  const raw = String(value || '').toLowerCase();
  if (raw.includes('58')) return '58mm';
  if (raw.includes('a4')) return 'A4';
  return '80mm';
}

export function loadPrinterPref() {
  if (typeof window === 'undefined') return { method: 'browser', paperSize: '80mm' };
  try {
    const raw = JSON.parse(localStorage.getItem(PREF_KEY) || 'null');
    return {
      method: ['thermal', 'bridge', 'browser'].includes(raw?.method) ? raw.method : 'browser',
      paperSize: normalizePaperSize(raw?.paperSize),
      bluetoothName: raw?.bluetoothName || '',
      bluetoothDeviceId: raw?.bluetoothDeviceId || '',
    };
  } catch {
    return { method: 'browser', paperSize: '80mm' };
  }
}

export function savePrinterPref(pref) {
  const next = {
    method: pref.method || 'browser',
    paperSize: normalizePaperSize(pref.paperSize),
    bluetoothName: pref.bluetoothName || '',
    bluetoothDeviceId: pref.bluetoothDeviceId || '',
  };
  localStorage.setItem(PREF_KEY, JSON.stringify(next));
  return next;
}

// ── Local USB / LAN bridge ─────────────────────────────────────────────────
export async function printEscposViaBridge(escposBase64) {
  const health = await fetch('http://127.0.0.1:17890/', { method: 'GET' });
  if (!health.ok) throw new Error('Local print bridge is not running on this computer.');
  const printed = await fetch('http://127.0.0.1:17890/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ escpos_base64: escposBase64 }),
  });
  if (!printed.ok) throw new Error('The local print bridge could not send this bill.');
}

// ── Write ESC/POS bytes to a GATT characteristic in chunks ────────────────
async function writeChunked(characteristic, bytes, chunkSize = 512) {
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.slice(offset, offset + chunkSize);
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValue(chunk);
    }
  }
}

// ── Find the writable GATT characteristic on connected server ─────────────
async function findWritableCharacteristic(server) {
  const services = await server.getPrimaryServices();
  for (const service of services) {
    let chars;
    try {
      chars = await service.getCharacteristics();
    } catch {
      continue;
    }
    for (const c of chars) {
      if (c.properties.write || c.properties.writeWithoutResponse) {
        return c;
      }
    }
  }
  return null;
}

// ── Web Bluetooth print: request device, connect, send ESC/POS ────────────
export async function printEscposViaBluetooth(escposBase64) {
  if (!navigator.bluetooth?.requestDevice) {
    throw new Error(
      'Web Bluetooth is not available. Use Chrome (desktop) or Edge, or set up the local print bridge.'
    );
  }

  const bytes = Uint8Array.from(atob(escposBase64), (c) => c.charCodeAt(0));

  // Request device — show the browser's native Bluetooth picker
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: THERMAL_SERVICES,
  });

  let server;
  try {
    server = await device.gatt.connect();
  } catch {
    throw new Error(
      `Could not connect to "${device.name || 'printer'}". Make sure Bluetooth is on and the printer is powered and paired in your computer's Bluetooth settings.`
    );
  }

  const characteristic = await findWritableCharacteristic(server);
  if (!characteristic) {
    server.disconnect();
    throw new Error(
      `Connected to "${device.name || 'device'}" but it did not expose a writable print characteristic. Make sure the printer is paired via Bluetooth (not just discovered) and try again.`
    );
  }

  try {
    await writeChunked(characteristic, bytes);
  } finally {
    try { server.disconnect(); } catch { /* ignore */ }
  }

  return device.name || 'Bluetooth printer';
}

// ── Check if Web Bluetooth is available in this browser ───────────────────
export function isWebBluetoothSupported() {
  return typeof navigator !== 'undefined' && !!navigator.bluetooth?.requestDevice;
}
