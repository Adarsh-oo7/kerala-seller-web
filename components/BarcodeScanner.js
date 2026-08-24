'use client';

import { useEffect, useRef, useState } from 'react';

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'qr_code', 'itf'];

export default function BarcodeScanner({ open, title = 'Scan barcode', continuous = false, onClose, onScan }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const lastAt = useRef(0);
  const [error, setError] = useState('');
  const [lastCode, setLastCode] = useState('');

  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  onScanRef.current = onScan;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setError('');
    setLastCode('');
    lastAt.current = 0;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser cannot open the camera. Plug in a USB scanner or type the code.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (!('BarcodeDetector' in window)) {
          setError('Camera is on. This browser cannot decode barcodes automatically — type the code, or use Chrome/Edge for live scan.');
          return;
        }
        const detector = new window.BarcodeDetector({ formats: FORMATS });
        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const value = String(codes[0]?.rawValue || '').trim();
            const now = Date.now();
            if (value && now - lastAt.current > 1600) {
              lastAt.current = now;
              setLastCode(value);
              onScanRef.current(value);
              if (!continuous) {
                onCloseRef.current();
                return;
              }
            }
          } catch (_err) {
            // Keep the camera up; a missed frame is not a failure.
          }
          timerRef.current = window.setTimeout(tick, 250);
        };
        tick();
      } catch (_err) {
        setError('Camera access was blocked. Allow the camera, or type / USB-scan the barcode.');
      }
    };

    start();
    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [open, continuous]);

  if (!open) return null;

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <div style={styles.card}>
        <div style={styles.head}>
          <strong>{title}</strong>
          <button type="button" onClick={onClose} style={styles.close}>Close</button>
        </div>
        <video ref={videoRef} style={styles.video} muted playsInline />
        {lastCode ? <p style={styles.meta}>Last scan {lastCode}</p> : null}
        <p style={styles.hint}>
          {continuous
            ? 'Scan a packet, then tap Add on the bill. Quantity changes with + / −, not by scanning again.'
            : 'Point the camera at the barcode, or type it if the camera cannot read it.'}
        </p>
        {error ? <p style={styles.error}>{error}</p> : null}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 80,
    padding: 16,
  },
  card: {
    width: 'min(560px, 100%)',
    background: '#111',
    color: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  head: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  close: {
    background: 'transparent',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  video: {
    width: '100%',
    minHeight: 240,
    background: '#000',
    borderRadius: 8,
    objectFit: 'cover',
  },
  meta: { margin: '8px 0 0', fontWeight: 600 },
  hint: { margin: '8px 0 0', color: '#d1d5db', fontSize: 13 },
  error: { margin: '8px 0 0', color: '#fca5a5', fontSize: 13 },
};
