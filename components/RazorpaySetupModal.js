// components/RazorpaySetupModal.js - ✅ COMPLETE WITH ADDRESS FIELDS
'use client';
import { useState, useCallback } from 'react';
import { X, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function RazorpaySetupModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    phone: '',
    business_type: 'individual',
    legal_business_name: '',
    first_name: '',
    last_name: '',
    // ✅ ADD ADDRESS FIELDS
    street: '',
    city: '',
    state: '',
    postal_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidPhone = (phone) => /^\d{10}$/.test(phone);

  const isFormValid = () => {
    return (
      isValidPhone(formData.phone) && 
      formData.legal_business_name.trim() !== '' &&
      formData.street.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.state.trim() !== '' &&
      formData.postal_code.trim() !== ''
    );
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else if (name === 'postal_code') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
      setError('Please fill all required fields correctly');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Session expired. Please login again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        `${API_BASE_URL}/api/payments/account/connect_razorpay/`,
        formData,
        { headers }
      );

      if (response.status === 201) {
        setFormData({
          phone: '',
          business_type: 'individual',
          legal_business_name: '',
          first_name: '',
          last_name: '',
          street: '',
          city: '',
          state: '',
          postal_code: ''
        });
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to connect';
      setError(errorMsg);
      console.error('Razorpay connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={s.header}>
          <h2 style={s.title}>🔵 Connect Razorpay</h2>
          <button 
            onClick={onClose} 
            style={s.closeBtn}
            aria-label="Close modal"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={s.error} role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>
          {/* Phone Number */}
          <div style={s.group}>
            <label style={s.label}>📱 Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
              maxLength="10"
              required
              disabled={loading}
              style={s.input}
              aria-label="Phone number"
            />
            <p style={s.helperText}>{formData.phone.length}/10 digits</p>
          </div>

          {/* Business Type */}
          <div style={s.group}>
            <label style={s.label}>🏢 Business Type *</label>
            <select
              name="business_type"
              value={formData.business_type}
              onChange={handleChange}
              required
              disabled={loading}
              style={s.select}
              aria-label="Business type"
            >
              <option value="individual">Individual (Recommended)</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="llp">LLP</option>
              <option value="pvt_ltd">Private Limited</option>
              <option value="ngo">NGO</option>
              <option value="trust">Trust</option>
              <option value="society">Society</option>
            </select>
          </div>

          {/* Legal Business Name */}
          <div style={s.group}>
            <label style={s.label}>🏪 Business Name *</label>
            <input
              type="text"
              name="legal_business_name"
              value={formData.legal_business_name}
              onChange={handleChange}
              placeholder="Your business or shop name"
              required
              disabled={loading}
              style={s.input}
              aria-label="Business name"
            />
            <p style={s.helperText}>{formData.legal_business_name.length}/50 characters</p>
          </div>

          {/* Name (Optional) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={s.group}>
              <label style={s.label}>👤 First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                disabled={loading}
                style={s.input}
                aria-label="First name"
              />
            </div>

            <div style={s.group}>
              <label style={s.label}>👤 Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                disabled={loading}
                style={s.input}
                aria-label="Last name"
              />
            </div>
          </div>

          {/* ✅ ADDRESS FIELDS */}
          {/* Street Address */}
          <div style={s.group}>
            <label style={s.label}>🏠 Street Address *</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="123 Main Street"
              required
              disabled={loading}
              style={s.input}
              aria-label="Street address"
            />
          </div>

          {/* City & State */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={s.group}>
              <label style={s.label}>🏙️ City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Mumbai"
                required
                disabled={loading}
                style={s.input}
                aria-label="City"
              />
            </div>

            <div style={s.group}>
              <label style={s.label}>📍 State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Maharashtra"
                required
                disabled={loading}
                style={s.input}
                aria-label="State"
              />
            </div>
          </div>

          {/* Postal Code */}
          <div style={s.group}>
            <label style={s.label}>📮 Postal Code *</label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="400001"
              maxLength="6"
              required
              disabled={loading}
              style={s.input}
              aria-label="Postal code"
            />
            <p style={s.helperText}>{formData.postal_code.length}/6 digits</p>
          </div>

          {/* Info Box */}
          <div style={s.infoBox}>
            <p style={s.infoBold}>✅ What happens next?</p>
            <ul style={s.infoList}>
              <li>Your account will be created on Razorpay</li>
              <li>You'll receive a verification email</li>
              <li>Complete your KYC if needed</li>
              <li>Start accepting payments!</li>
            </ul>
          </div>

          {/* Buttons */}
          <div style={s.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ 
                ...s.btn, 
                ...s.cancelBtn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              style={{ 
                ...s.btn, 
                ...s.submitBtn, 
                opacity: (loading || !isFormValid()) ? 0.7 : 1,
                cursor: (loading || !isFormValid()) ? 'not-allowed' : 'pointer'
              }}
              aria-label="Connect Razorpay"
            >
              {loading ? '⏳ Connecting...' : '🔗 Connect Razorpay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    animation: 'slideUp 0.3s ease-out'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '2px solid #f3f4f6',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white'
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1f2937',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    display: 'flex',
    transition: 'color 0.2s'
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '16px 24px 0',
    padding: '12px 14px',
    backgroundColor: '#fef2f2',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    color: '#991b1b',
    fontWeight: 600,
    fontSize: '13px'
  },
  form: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937'
  },
  input: {
    padding: '10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    outline: 'none'
  },
  select: {
    padding: '10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none'
  },
  helperText: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  },
  infoBox: {
    padding: '12px',
    backgroundColor: '#ecfdf5',
    border: '2px solid #10b981',
    borderRadius: '8px'
  },
  infoBold: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#065f46',
    margin: '0 0 8px 0'
  },
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '12px',
    color: '#065f46',
    lineHeight: '1.6'
  },
  buttonGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  btn: {
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
    color: '#374151'
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    color: 'white'
  }
};
