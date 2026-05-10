'use client';
import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, AlertCircle, Check, Wallet } from 'lucide-react';
import axios from 'axios';
import '../styles/DashboardPayments.css'

// const API_BASE_URL = 'https://api.keralasellers.in' || 'https://api.keralasellers.in';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in/api';


export default function RazorpaySetupModal({ isOpen, onClose, onSuccess, editMode }) {
  const [formData, setFormData] = useState({
    key_id: '',
    key_secret: '',
    webhook_secret: '',
  });
  const [showSecrets, setShowSecrets] = useState({
    key_secret: false,
    webhook_secret: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); // For initial fetch only
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch saved keys if editMode
  useEffect(() => {
    const fetchKeys = async () => {
      if (isOpen && editMode) {
        setFetching(true);
        setError('');
        try {
          const token = localStorage.getItem('accessToken');
          // Backend should hide secret if necessary
          const res = await axios.get(
            `${API_BASE_URL}/api/payments/account/razorpay_keys/`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          if (res?.data) {
            setFormData({
              key_id: res.data.key_id || '',
              key_secret: '', // never SHOW saved secret in plain text
              webhook_secret: res.data.webhook_secret || '',
            });
          }
        } catch (err) {
          setError('Failed to load saved keys');
        } finally {
          setFetching(false);
        }
      } else if (!isOpen) {
        setFormData({ key_id: '', key_secret: '', webhook_secret: '' });
      }
    };
    fetchKeys();
  }, [isOpen, editMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.key_id.trim() || !formData.key_secret.trim()) {
      setError('❌ Key ID and Secret are required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/account/connect_razorpay/`,
        {
          key_id: formData.key_id.trim(),
          key_secret: formData.key_secret.trim(),
          webhook_secret: formData.webhook_secret.trim() || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 201 || response.status === 200) {
        setSuccess('✅ Razorpay connected successfully!');
        setTimeout(() => {
          setFormData({ key_id: '', key_secret: '', webhook_secret: '' });
          onSuccess?.();
          onClose?.();
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        '❌ Connection failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div className='dashboardpaymentmodalwidth' style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <h2 style={s.title}>
            <Wallet size={18} style={{ marginRight: 5 }} /> {editMode ? 'Update' : 'Connect'} Razorpay
          </h2>
          <button onClick={onClose} style={s.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={s.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={s.successBox}>
            <Check size={16} />
            <span>{success}</span>
          </div>
        )}
        {fetching ? (
          <div style={{ padding: 16 }}>Loading saved keys...</div>
        ) : (
          <>
            <div style={s.infoBox}>
              <AlertCircle size={14} />
              <div>
                <p style={s.infoBold}>How to get your Razorpay credentials:</p>
                <ol style={s.infoList}>
                  <li>Go to <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" style={s.link}>Razorpay Dashboard</a></li>
                  <li>Navigate to Settings → API Keys</li>
                  <li>Copy your Key ID and Secret</li>
                  <li>Paste them below</li>
                </ol>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={s.form} autoComplete="off">
              <div style={s.formGroup}>
                <label style={s.label}>Razorpay Key ID *</label>
                <input
                  type="text"
                  name="key_id"
                  value={formData.key_id}
                  onChange={handleInputChange}
                  placeholder="rzp_test_XXXXXXXXXXXXX"
                  style={s.input}
                  required
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  disabled={loading || fetching}
                />
                <p style={s.hint}>Start with "rzp_test_" for test mode or "rzp_live_" for live</p>
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Razorpay Key Secret *</label>
                <div style={s.passwordContainer}>
                  <input
                    type={showSecrets.key_secret ? 'text' : 'password'}
                    name="key_secret"
                    value={formData.key_secret}
                    onChange={handleInputChange}
                    placeholder={editMode ? "•••••••••••••••••••• (re-enter to update)" : "••••••••••••••••••••"}
                    style={s.input}
                    required
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    disabled={loading || fetching}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(p => ({ ...p, key_secret: !p.key_secret }))}
                    style={s.toggleBtn}
                  >
                    {showSecrets.key_secret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {editMode && (
                  <p style={s.hint}>Saving a new secret will overwrite the existing one. For security, the current key secret is never shown.</p>
                )}
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Webhook Secret (Optional)</label>
                <div style={s.passwordContainer}>
                  <input
                    type={showSecrets.webhook_secret ? 'text' : 'password'}
                    name="webhook_secret"
                    value={formData.webhook_secret}
                    onChange={handleInputChange}
                    placeholder="Your webhook secret (if set)"
                    style={s.input}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    disabled={loading || fetching}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets(p => ({ ...p, webhook_secret: !p.webhook_secret }))}
                    style={s.toggleBtn}
                  >
                    {showSecrets.webhook_secret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={s.buttonGroup}>
                <button
                  className='dashboardpaymentmodalbtn'
                  type="button"
                  onClick={onClose}
                  style={s.cancelBtn}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className='dashboardpaymentmodalbtn'
                  type="submit"
                  style={s.connectBtn}
                  disabled={loading}
                >
                  {loading ? '⏳ Verifying...' : editMode ? 'Update Keys' : 'Connect Razorpay'}
                </button>
              </div>
            </form>

            <div style={s.securityBox}>
              <p style={s.securityTitle}>🔐 Your credentials are encrypted</p>
              <p style={s.securityText}>
                Your Razorpay keys are encrypted and securely stored. Never share them with anyone.
              </p>
            </div>
          </>
        )}

        <style jsx>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

// (Keep style object as is)


const s = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', animation: 'slideIn 0.3s ease-out' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #f3f4f6' },
  title: { fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: 0, alignItems: 'center', display: 'flex' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', backgroundColor: '#fef2f2', border: '2px solid #ef4444', borderRadius: '8px', color: '#991b1b', marginBottom: '16px', fontSize: '13px', fontWeight: 600 },
  successBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '8px', color: '#065f46', marginBottom: '16px', fontSize: '13px', fontWeight: 600 },
  infoBox: { display: 'flex', gap: '12px', padding: '12px', backgroundColor: 'rgb(255 249 219)', border: '2px solid #bfdbfe', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#1e40af' },
  infoBold: { fontSize: '13px', fontWeight: 700, margin: '0 0 8px 0', color: '#1e40af' },
  infoList: { margin: 0, paddingLeft: '20px', fontSize: '12px', lineHeight: '1.6' },
  link: { color: '#3b82f6', fontWeight: 600, textDecoration: 'none' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
  input: { padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  passwordContainer: { position: 'relative' },
  toggleBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' },
  hint: { fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' },
  buttonGroup: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  cancelBtn: { padding: '12px', backgroundColor: '#ee4343ff', color: '#ffffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  connectBtn: { padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  securityBox: { padding: '12px', backgroundColor: '#f0fdf4', border: '2px solid #dcfce7', borderRadius: '8px' },
  securityTitle: { fontSize: '12px', fontWeight: 700, color: '#166534', margin: '0 0 4px 0' },
  securityText: { fontSize: '12px', color: '#4b5563', margin: 0, lineHeight: '1.4' },
};
