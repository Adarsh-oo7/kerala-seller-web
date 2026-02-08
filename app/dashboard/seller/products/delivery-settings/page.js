'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Truck, DollarSign, Package, AlertCircle, CheckCircle,
  Eye, Save, RefreshCw, Info, Ban, Layers, Scale, Plus, Trash2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://api.keralasellers.in');

export default function DeliverySettingsPage() {
  // State management
  const [mode, setMode] = useState('slab');
  const [config, setConfig] = useState({
    enabled: false,
    fallback_flat_charge: null,
    cod_extra_charge: 0.00,
    free_delivery_above: 0.00,
  });
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('sellerAccessToken') || localStorage.getItem('accessToken');
      
      if (!token) {
        setError('⚠️ Not logged in. Please login to manage delivery settings.');
        setLoading(false);
        return;
      }

      const [configRes, slabsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/user/store/delivery-slabs/config/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/user/store/delivery-slabs/slabs/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setConfig(configRes.data);
      setSlabs(slabsRes.data);
      setMode(configRes.data.enabled ? 'slab' : 'legacy');
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch delivery data:', err);
      
      // ✅ Better error messages
      if (err.response?.status === 401) {
        setError('🔒 Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('⛔ You don\'t have permission to access delivery settings.');
      } else if (err.response?.status === 404) {
        setError('❌ Delivery settings endpoint not found. Contact support.');
      } else if (!err.response) {
        setError('🌐 Network error. Check your internet connection.');
      } else {
        setError(`⚠️ Failed to load settings: ${err.response?.data?.error || err.message}`);
      }
      setLoading(false);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' ? null : parseFloat(value))
    }));
    setError(''); // Clear errors on change
  };

  const addSlab = () => {
    const lastSlab = slabs[slabs.length - 1];
    const newMin = lastSlab ? (lastSlab.max_weight_kg || 5) : 0;
    
    setSlabs([...slabs, {
      id: `temp_${Date.now()}`,
      min_weight_kg: newMin,
      max_weight_kg: newMin + 1,
      pricing_type: 'FIXED',
      fixed_price: 50,
      price_per_kg: 0,
      base_fee: 0,
      is_new: true
    }]);
    setError(''); // Clear errors
  };

  const updateSlab = (index, field, value) => {
    const updated = [...slabs];
    updated[index] = { ...updated[index], [field]: value === '' ? null : parseFloat(value) || value };
    setSlabs(updated);
    setError(''); // Clear errors
  };

  const removeSlab = async (index) => {
    const slab = slabs[index];
    
    // If it's a new unsaved slab, just remove from UI
    if (slab.is_new || String(slab.id).startsWith('temp_')) {
      setSlabs(slabs.filter((_, i) => i !== index));
      return;
    }

    // ✅ Delete from server
    try {
      const token = localStorage.getItem('sellerAccessToken') || localStorage.getItem('accessToken');
      await axios.delete(`${API_BASE_URL}/user/store/delivery-slabs/${slab.id}/delete_slab/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSlabs(slabs.filter((_, i) => i !== index));
      setSuccess('✅ Slab deleted successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(`❌ Failed to delete slab: ${err.response?.data?.error || err.message}`);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('sellerAccessToken') || localStorage.getItem('accessToken');

      if (!token) {
        setError('🔒 Not logged in. Please login to save settings.');
        setSaving(false);
        return;
      }

      // ✅ Validation
      if (mode === 'slab' && slabs.length === 0) {
        setError('⚠️ Add at least one weight slab or switch to Legacy mode.');
        setSaving(false);
        return;
      }

      // Validate slab ranges
      for (let i = 0; i < slabs.length; i++) {
        const slab = slabs[i];
        if (slab.min_weight_kg < 0) {
          setError(`⚠️ Slab ${i + 1}: Minimum weight cannot be negative.`);
          setSaving(false);
          return;
        }
        if (slab.max_weight_kg !== null && slab.max_weight_kg <= slab.min_weight_kg) {
          setError(`⚠️ Slab ${i + 1}: Maximum weight must be greater than minimum.`);
          setSaving(false);
          return;
        }
        if (slab.pricing_type === 'FIXED' && slab.fixed_price <= 0) {
          setError(`⚠️ Slab ${i + 1}: Fixed price must be greater than 0.`);
          setSaving(false);
          return;
        }
        if (slab.pricing_type === 'PER_KG' && slab.price_per_kg <= 0) {
          setError(`⚠️ Slab ${i + 1}: Price per kg must be greater than 0.`);
          setSaving(false);
          return;
        }
      }

      // Save config
      await axios.post(`${API_BASE_URL}/user/store/delivery-slabs/update_config/`, {
        ...config,
        enabled: mode === 'slab'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Save/update slabs
      let createdCount = 0;
      let updatedCount = 0;

      for (const slab of slabs) {
        if (slab.is_new || String(slab.id).startsWith('temp_')) {
          await axios.post(`${API_BASE_URL}/user/store/delivery-slabs/create_slab/`, {
            min_weight_kg: slab.min_weight_kg,
            max_weight_kg: slab.max_weight_kg,
            pricing_type: slab.pricing_type,
            fixed_price: slab.pricing_type === 'FIXED' ? slab.fixed_price : 0,
            price_per_kg: slab.pricing_type === 'PER_KG' ? slab.price_per_kg : 0,
            base_fee: slab.pricing_type === 'PER_KG' ? slab.base_fee : 0
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          createdCount++;
        } else {
          await axios.patch(`${API_BASE_URL}/user/store/delivery-slabs/${slab.id}/update_slab/`, {
            min_weight_kg: slab.min_weight_kg,
            max_weight_kg: slab.max_weight_kg,
            pricing_type: slab.pricing_type,
            fixed_price: slab.pricing_type === 'FIXED' ? slab.fixed_price : 0,
            price_per_kg: slab.pricing_type === 'PER_KG' ? slab.price_per_kg : 0,
            base_fee: slab.pricing_type === 'PER_KG' ? slab.base_fee : 0
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          updatedCount++;
        }
      }

      setSuccess(`✅ Settings saved! ${createdCount > 0 ? `Created ${createdCount} slab(s). ` : ''}${updatedCount > 0 ? `Updated ${updatedCount} slab(s).` : ''}`);
      setTimeout(() => setSuccess(''), 5000);
      fetchAllData();
      
    } catch (err) {
      console.error('Save error:', err);
      
      // ✅ Better error messages
      if (err.response?.status === 401) {
        setError('🔒 Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('⛔ You don\'t have permission to save delivery settings.');
      } else if (err.response?.status === 400) {
        setError(`⚠️ Validation error: ${err.response?.data?.error || 'Check your input values.'}`);
      } else if (!err.response) {
        setError('🌐 Network error. Check your internet connection.');
      } else {
        setError(`❌ Failed to save: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const calculatePreview = async () => {
    try {
      setError('');
      const token = localStorage.getItem('sellerAccessToken') || localStorage.getItem('accessToken');
      
      if (!token) {
        setError('🔒 Please login to preview delivery charges.');
        return;
      }

      if (mode === 'slab' && slabs.length === 0) {
        setError('⚠️ No slabs configured. Add slabs or switch to Legacy mode.');
        return;
      }

      const scenarios = [
        { cart_total: 300, total_weight_kg: 0.5, is_cod: false, label: 'Small (₹300, 0.5kg)' },
        { cart_total: 300, total_weight_kg: 0.5, is_cod: true, label: 'Small + COD' },
        { cart_total: 1000, total_weight_kg: 2, is_cod: false, label: 'Medium (₹1000, 2kg)' },
        { cart_total: 1500, total_weight_kg: 6, is_cod: true, label: 'Heavy (₹1500, 6kg) + COD' }
      ];

      const results = await Promise.all(scenarios.map(async scenario => {
        try {
          const res = await axios.post(`${API_BASE_URL}/user/store/delivery-slabs/calculate/`, scenario, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return { ...scenario, ...res.data, error: null };
        } catch (err) {
          return { 
            ...scenario, 
            delivery_charge: 'N/A', 
            method: 'error',
            error: err.response?.data?.error || 'Calculation failed'
          };
        }
      }));

      setPreview(results);
      setShowPreview(true);
      
    } catch (err) {
      console.error('Preview error:', err);
      setError(`❌ Preview failed: ${err.message}. Make sure your settings are saved first.`);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={40} className="animate-spin" />
        <p>Loading delivery settings...</p>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Truck size={28} style={{ color: '#059669' }} />
          <div>
            <h1 style={styles.pageTitle}>Delivery Settings</h1>
            <p style={styles.pageSubtitle}>
              {mode === 'slab' ? 'Weight Slab Mode (Advanced)' : 'Legacy Mode'}
            </p>
          </div>
        </div>
        <button onClick={fetchAllData} style={styles.refreshBtn} title="Refresh settings">
          <RefreshCw size={16} />
        </button>
      </div>

      <div style={styles.contentGrid}>
        {/* Main Card */}
        <div style={styles.card}>
          {/* Mode Toggle */}
          <div style={styles.modeToggle}>
            <button 
              style={{
                ...styles.toggleBtn,
                backgroundColor: mode === 'slab' ? '#059669' : '#e5e7eb',
                color: mode === 'slab' ? 'white' : '#374151'
              }}
              onClick={() => { setMode('slab'); setError(''); }}
            >
              <Layers size={16} /> Weight Slabs
            </button>
            <button 
              style={{
                ...styles.toggleBtn,
                backgroundColor: mode === 'legacy' ? '#059669' : '#e5e7eb',
                color: mode === 'legacy' ? 'white' : '#374151'
              }}
              onClick={() => { setMode('legacy'); setError(''); }}
            >
              <DollarSign size={16} /> Legacy Mode
            </button>
          </div>

          {/* Slab Mode */}
          {mode === 'slab' && (
            <>
              <h2 style={styles.cardTitle}><Scale size={20} /> Slab Configuration</h2>
              
              {/* Global Settings */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Free Delivery Above
                  <span style={styles.labelHint}>(0 to disable)</span>
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputPrefix}>₹</span>
                  <input
                    type="number"
                    name="free_delivery_above"
                    value={config.free_delivery_above || ''}
                    onChange={handleConfigChange}
                    style={styles.input}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  COD Extra Charge
                  <span style={styles.labelHint}>(Added to all COD orders)</span>
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputPrefix}>₹</span>
                  <input
                    type="number"
                    name="cod_extra_charge"
                    value={config.cod_extra_charge || ''}
                    onChange={handleConfigChange}
                    style={styles.input}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Fallback Charge
                  <span style={styles.labelHint}>(When no slab matches)</span>
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputPrefix}>₹</span>
                  <input
                    type="number"
                    name="fallback_flat_charge"
                    value={config.fallback_flat_charge || ''}
                    onChange={handleConfigChange}
                    style={styles.input}
                    placeholder="Optional"
                    min="0"
                    step="0.01"
                  />
                </div>
                <small style={styles.helpText}>
                  ℹ️ Recommended: Set a fallback to handle edge cases
                </small>
              </div>

              {/* Slabs */}
              <div style={styles.slabsSection}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>Weight Slabs ({slabs.length})</h3>
                  <button onClick={addSlab} style={styles.addBtn}>
                    <Plus size={16} /> Add Slab
                  </button>
                </div>

                {slabs.length === 0 ? (
                  <div style={styles.emptyState}>
                    <Package size={48} style={{ opacity: 0.5 }} />
                    <p style={{ marginTop: '16px', fontSize: '14px' }}>
                      No slabs configured yet
                    </p>
                    <button onClick={addSlab} style={{...styles.addBtn, marginTop: '12px'}}>
                      <Plus size={16} /> Add Your First Slab
                    </button>
                  </div>
                ) : (
                  <div style={styles.slabsList}>
                    {slabs.map((slab, idx) => (
                      <div key={slab.id} style={styles.slabRow}>
                        <div style={styles.slabInputs}>
                          <input
                            type="number"
                            value={slab.min_weight_kg}
                            onChange={(e) => updateSlab(idx, 'min_weight_kg', e.target.value)}
                            style={styles.slabInput}
                            placeholder="Min kg"
                            min="0"
                            step="0.1"
                          />
                          <span>to</span>
                          <input
                            type="number"
                            value={slab.max_weight_kg || ''}
                            onChange={(e) => updateSlab(idx, 'max_weight_kg', e.target.value)}
                            style={styles.slabInput}
                            placeholder="Max (∞)"
                            min={slab.min_weight_kg}
                            step="0.1"
                          />
                        </div>

                        <select
                          value={slab.pricing_type}
                          onChange={(e) => updateSlab(idx, 'pricing_type', e.target.value)}
                          style={styles.select}
                        >
                          <option value="FIXED">Fixed ₹</option>
                          <option value="PER_KG">₹/kg</option>
                        </select>

                        {slab.pricing_type === 'FIXED' ? (
                          <input
                            type="number"
                            value={slab.fixed_price}
                            onChange={(e) => updateSlab(idx, 'fixed_price', e.target.value)}
                            style={styles.priceInput}
                            placeholder="Price"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <div style={styles.perKgInputs}>
                            <input
                              type="number"
                              value={slab.price_per_kg}
                              onChange={(e) => updateSlab(idx, 'price_per_kg', e.target.value)}
                              style={styles.priceInput}
                              placeholder="₹/kg"
                              min="0"
                              step="0.01"
                            />
                            <span>+</span>
                            <input
                              type="number"
                              value={slab.base_fee}
                              onChange={(e) => updateSlab(idx, 'base_fee', e.target.value)}
                              style={styles.priceInput}
                              placeholder="Base"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        )}

                        <button 
                          onClick={() => removeSlab(idx)} 
                          style={styles.deleteBtn}
                          title="Delete slab"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Legacy Mode */}
          {mode === 'legacy' && (
            <div style={styles.legacyInfo}>
              <Info size={48} style={{ opacity: 0.5 }} />
              <p style={{ marginTop: '16px' }}>
                Legacy mode uses old flat-rate delivery settings.
              </p>
              <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                Switch to Weight Slabs for advanced weight-based pricing.
              </p>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={styles.successBox}>
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Actions */}
          <div style={styles.buttonGroup}>
            <button onClick={calculatePreview} style={styles.buttonSecondary} disabled={saving}>
              <Eye size={16} /> Preview
            </button>
            <button 
              onClick={saveSettings} 
              disabled={saving} 
              style={{
                ...styles.buttonPrimary,
                opacity: saving ? 0.6 : 1,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> 
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> 
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebarContainer}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoCardTitle}><Info size={18} /> How It Works</h3>
            <ul style={styles.tipsList}>
              <li>Define weight ranges (0-0.5kg, 0.5-2kg, etc.)</li>
              <li>Set fixed price or per-kg pricing for each range</li>
              <li>System auto-selects correct slab based on order weight</li>
              <li>Falls back to legacy or zero if no match</li>
            </ul>
          </div>

          <div style={styles.tipsCard}>
            <h3 style={styles.tipsCardTitle}><Package size={18} /> Tips</h3>
            <ul style={styles.tipsList}>
              <li>Use open-ended slabs (leave max empty for ∞)</li>
              <li>Per-kg pricing for heavy items saves costs</li>
              <li>Always set a fallback for edge cases</li>
              <li>Test with preview before saving changes</li>
            </ul>
          </div>

          <div style={styles.warningCard}>
            <h3 style={styles.warningCardTitle}><Ban size={18} /> Important</h3>
            <ul style={styles.restrictionsList}>
              <li>Weight slabs must not overlap</li>
              <li>Min weight must be less than max weight</li>
              <li>Prices must be greater than zero</li>
              <li>Save settings before testing preview</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div style={styles.modalOverlay} onClick={() => setShowPreview(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delivery Charge Preview</h3>
              <button onClick={() => setShowPreview(false)} style={styles.modalClose}>×</button>
            </div>
            <div style={styles.previewTable}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Scenario</th>
                    <th style={styles.th}>Cart</th>
                    <th style={styles.th}>Weight</th>
                    <th style={styles.th}>COD</th>
                    <th style={styles.th}>Charge</th>
                    <th style={styles.th}>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((item, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={styles.td}>{item.label}</td>
                      <td style={styles.td}>₹{item.cart_total}</td>
                      <td style={styles.td}>{item.total_weight_kg}kg</td>
                      <td style={styles.td}>{item.is_cod ? '✓' : '-'}</td>
                      <td style={{
                        ...styles.td, 
                        fontWeight: '600', 
                        color: item.error ? '#dc2626' : '#059669'
                      }}>
                        {item.error ? (
                          <span title={item.error}>❌ Error</span>
                        ) : (
                          `₹${item.delivery_charge}`
                        )}
                      </td>
                      <td style={styles.td}>
                        {item.method === 'slab' && '📦 Slab'}
                        {item.method === 'slab-free' && '🎁 Free'}
                        {item.method === 'slab-fallback' && '⚠️ Fallback'}
                        {item.method === 'legacy' && '🔄 Legacy'}
                        {item.method === 'none' && '💸 None'}
                        {item.method === 'error' && '❌ Error'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={styles.previewNote}>
                <Info size={14} />
                <span>These are example calculations based on your current settings. Actual charges may vary based on product weights.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

// Styles
const styles = {
  pageContainer: { padding: '24px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f9fafb', minHeight: '100vh' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', color: '#6b7280' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  pageTitle: { fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: '#6b7280', margin: 0 },
  refreshBtn: { padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#f3f4f6', transition: 'background-color 0.2s' },
  contentGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
  modeToggle: { display: 'flex', gap: '12px', marginBottom: '24px' },
  toggleBtn: { flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' },
  labelHint: { fontSize: '12px', color: '#9ca3af', fontWeight: 'normal' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputPrefix: { position: 'absolute', left: '12px', color: '#6b7280', fontSize: '14px', fontWeight: '500' },
  input: { width: '100%', padding: '10px 12px 10px 28px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', transition: 'border-color 0.2s' },
  helpText: { display: 'block', fontSize: '12px', color: '#6b7280', marginTop: '6px' },
  slabsSection: { marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', margin: 0, color: '#374151' },
  addBtn: { padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', transition: 'background-color 0.2s' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  slabsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  slabRow: { display: 'flex', gap: '8px', alignItems: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' },
  slabInputs: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1 },
  slabInput: { width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' },
  select: { padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', backgroundColor: 'white' },
  priceInput: { width: '70px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' },
  perKgInputs: { display: 'flex', alignItems: 'center', gap: '6px' },
  deleteBtn: { padding: '8px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.2s' },
  legacyInfo: { textAlign: 'center', padding: '60px 20px', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginTop: '16px' },
  successBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#d1fae5', border: '1px solid #10b981', color: '#065f46', padding: '12px', borderRadius: '8px', fontSize: '14px', marginTop: '16px' },
  buttonGroup: { display: 'flex', gap: '12px', marginTop: '24px' },
  buttonPrimary: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' },
  buttonSecondary: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' },
  sidebarContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  infoCard: { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' },
  infoCardTitle: { fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  tipsCard: { backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px' },
  tipsCardTitle: { fontSize: '14px', fontWeight: '600', color: '#065f46', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  warningCard: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px' },
  warningCardTitle: { fontSize: '14px', fontWeight: '600', color: '#991b1b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  tipsList: { margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: 'inherit' },
  restrictionsList: { margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: '#991b1b' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' },
  modalTitle: { fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 },
  modalClose: { background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#6b7280', padding: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  previewTable: { padding: '24px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #e5e7eb', fontSize: '13px', fontWeight: '600', color: '#374151', backgroundColor: '#f9fafb' },
  tr: { borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px', fontSize: '13px', color: '#6b7280' },
  previewNote: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', fontSize: '12px', color: '#0369a1' },
};
