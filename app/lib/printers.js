const PREF_KEY = 'ks.printer.pref';

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
  };
  localStorage.setItem(PREF_KEY, JSON.stringify(next));
  return next;
}

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

export async function printEscposViaBluetooth(escposBase64) {
  if (!navigator.bluetooth?.requestDevice) {
    throw new Error('This browser cannot use Web Bluetooth. Use Chrome on desktop, or the local print bridge.');
  }
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '0000ff00-0000-1000-8000-00805f9b34fb'],
  });
  const server = await device.gatt.connect();
  const services = await server.getPrimaryServices();
  const bytes = Uint8Array.from(atob(escposBase64), (char) => char.charCodeAt(0));
  for (const service of services) {
    const chars = await service.getCharacteristics();
    for (const characteristic of chars) {
      if (characteristic.properties.write || characteristic.properties.writeWithoutResponse) {
        await characteristic.writeValue(bytes);
        return device.name || 'Bluetooth printer';
      }
    }
  }
  throw new Error('Connected, but this Bluetooth device did not accept print data. Try the local print bridge or browser print.');
}
