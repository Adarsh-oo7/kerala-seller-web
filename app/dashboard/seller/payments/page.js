// app/dashboard/seller/payments/page.js - ✅ COMPLETE & FIXED

'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import RazorpaySetupModal from '../../../../components/RazorpaySetupModal';
import { 
  CreditCard, Check, AlertCircle, Clock, DollarSign, 
  TrendingUp, Eye, EyeOff, Copy, ExternalLink, RefreshCw, Lock, Edit2, Trash2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function PaymentsDashboard() {
  const [gatewayStatus, setGatewayStatus] = useState({
    razorpay: { connected: false, verified: false, status: 'pending' },
    cashfree: { connected: false, verified: false, status: 'pending' },
    primary_gateway: null,
    is_ready: false
  });
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showAccount, setShowAccount] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { 
      router.push('/login/seller'); 
      return null; 
    }
    return { Authorization: `Bearer ${token}` };
  }, [router]);

  const fetchPaymentData = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setRefreshing(true);
      
      const [statusRes, payoutRes] = await Promise.all([
        axios.get(
          `${API_BASE_URL}/api/payments/account/gateway_status/`,
          { headers }
        ).catch(error => {
          // ✅ Handle 404 - return default status
          if (error.response?.status === 404) {
            console.log('Payment account not found, showing default state');
            return { data: {
              razorpay: { connected: false, verified: false, status: 'pending' },
              cashfree: { connected: false, verified: false, status: 'pending' },
              primary_gateway: null,
              is_ready: false
            }};
          }
          throw error;
        }),
        axios.get(
          `${API_BASE_URL}/api/payments/payouts/history/`,
          { headers }
        ).catch(error => {
          // ✅ Handle 404 - return empty payouts
          if (error.response?.status === 404) {
            console.log('No payout history found');
            return { data: { payouts: [] }};
          }
          throw error;
        })
      ]);

      setGatewayStatus(statusRes.data);
      setPayoutHistory(payoutRes.data.payouts || []);
      setErrorMsg('');
    } catch (error) {
      console.error('Error fetching payment data:', error);
      // ✅ Set default gateway status on error
      setGatewayStatus({
        razorpay: { connected: false, verified: false, status: 'pending' },
        cashfree: { connected: false, verified: false, status: 'pending' },
        primary_gateway: null,
        is_ready: false
      });
      setPayoutHistory([]);
      setErrorMsg('Failed to load payment data');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleRazorpayClick = useCallback(() => {
    setEditMode(false);
    setRazorpayModalOpen(true);
  }, []);

  const handleEditRazorpay = useCallback(() => {
    setEditMode(true);
    setRazorpayModalOpen(true);
  }, []);

  const handleRazorpaySuccess = useCallback(() => {
    setSuccessMsg(editMode ? '✅ Razorpay keys updated!' : '✅ Connected to Razorpay!');
    setEditMode(false);
    fetchPaymentData();
  }, [editMode, fetchPaymentData]);

  const connectCashfree = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      await axios.post(
        `${API_BASE_URL}/api/payments/account/connect_cashfree/`,
        {},
        { headers }
      );
      setSuccessMsg('✅ Connected to Cashfree!');
      fetchPaymentData();
    } catch (error) {
      setErrorMsg(`❌ ${error.response?.data?.error || 'Connection failed'}`);
    }
  }, [getAuthHeaders, fetchPaymentData]);

  const payoutSummary = useMemo(() => {
    const successful = payoutHistory.filter(p => p.status === 'success');
    const pending = payoutHistory.filter(p => p.status === 'pending');
    
    return {
      successCount: successful.length,
      successAmount: successful.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    };
  }, [payoutHistory]);

  if (loading) {
    return (
      <div style={s.load}>
        <div style={s.spin}></div>
        <p>Loading payment data...</p>
      </div>
    );
  }

  return (
    <div style={s.c}>
      <RazorpaySetupModal
        isOpen={razorpayModalOpen}
        onClose={() => {
          setRazorpayModalOpen(false);
          setEditMode(false);
        }}
        onSuccess={handleRazorpaySuccess}
        editMode={editMode}
      />

      {/* Header */}
      <div style={s.h}>
        <div>
          <h1 style={s.t}>💰 Payment Gateways</h1>
          <p style={s.st}>Manage your payment methods & receive instant payouts</p>
        </div>
        <button 
          onClick={fetchPaymentData} 
          disabled={refreshing} 
          style={s.rb}
          aria-label="Refresh payment data"
        >
          <RefreshCw 
            size={16} 
            style={{animation: refreshing ? 'spin 1s linear infinite' : 'none'}}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div style={s.sa} role="alert">
          <Check size={18}/>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div style={s.ea} role="alert">
          <AlertCircle size={18}/>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Gateway Status Grid - ✅ Always renders now */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px', padding:'24px'}}>
        
        {/* Razorpay Card - ACTIVE */}
        <div style={s.card}>
          <div style={s.cardH}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <CreditCard size={24} color="#3b82f6"/>
              <h2 style={s.cardT}>🔵 Razorpay</h2>
            </div>
            {gatewayStatus.razorpay?.verified && (
              <div style={{...s.badge, backgroundColor: '#10b981'}}>✅ Live</div>
            )}
          </div>

          <div style={s.cardC}>
            <div style={s.info}>
              <p style={s.label}>Status</p>
              <p style={{...s.value, color: gatewayStatus.razorpay?.verified ? '#10b981' : '#f59e0b'}}>
                {gatewayStatus.razorpay?.status?.toUpperCase() || 'PENDING'}
              </p>
            </div>

            {gatewayStatus.razorpay?.account_id && (
              <div style={s.info}>
                <p style={s.label}>Account ID</p>
                <p style={s.value}>{gatewayStatus.razorpay.account_id}</p>
              </div>
            )}

            {!gatewayStatus.razorpay?.connected ? (
              <button 
                onClick={handleRazorpayClick} 
                style={s.connectBtn}
                aria-label="Connect Razorpay"
              >
                🔗 Connect Razorpay
              </button>
            ) : (
              <div style={{display: 'flex', gap: '8px'}}>
                <button 
                  onClick={handleEditRazorpay}
                  style={{...s.connectBtn, backgroundColor: '#f59e0b', flex: 1}}
                  aria-label="Edit Razorpay keys"
                >
                  <Edit2 size={14} style={{display: 'inline', marginRight: '4px'}}/>
                  Edit Keys
                </button>
                <button 
                  disabled 
                  style={{...s.connectBtn, opacity: 0.5, cursor: 'not-allowed', flex: 1}}
                  aria-label="Razorpay connected"
                >
                  ✅ Connected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cashfree Card - COMING SOON */}
        <div style={{...s.card, opacity: 0.6, position: 'relative'}}>
          <div style={s.comingSoonBadge}>
            <Clock size={16}/>
            <span>Coming Soon</span>
          </div>

          <div style={s.cardH}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <CreditCard size={24} color="#10b981"/>
              <h2 style={s.cardT}>🟢 Cashfree</h2>
            </div>
          </div>

          <div style={s.cardC}>
            <div style={s.info}>
              <p style={s.label}>Status</p>
              <p style={{...s.value, color:'#9ca3af'}}>COMING SOON</p>
            </div>

            <p style={{fontSize:'12px', color:'#6b7280', margin:'0', lineHeight:'1.4'}}>
              💡 Cashfree payout integration is launching soon! Connect your bank account and get automatic weekly payouts.
            </p>

            <button 
              disabled 
              style={{...s.connectBtn, opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#d1d5db'}}
              aria-label="Cashfree coming soon"
            >
              ⏳ Coming Soon
            </button>
          </div>
        </div>

        {/* Stripe Card - COMING SOON */}
        <div style={{...s.card, opacity: 0.6, position: 'relative'}}>
          <div style={s.comingSoonBadge}>
            <Clock size={16}/>
            <span>Q1 2026</span>
          </div>

          <div style={s.cardH}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <CreditCard size={24} color="#6366f1"/>
              <h2 style={s.cardT}>🟣 Stripe</h2>
            </div>
          </div>

          <div style={s.cardC}>
            <div style={s.info}>
              <p style={s.label}>Status</p>
              <p style={{...s.value, color:'#9ca3af'}}>COMING Q1 2026</p>
            </div>

            <p style={{fontSize:'12px', color:'#6b7280', margin:'0', lineHeight:'1.4'}}>
              🌍 International payments & global payouts with Stripe. Coming in Q1 2026.
            </p>

            <button 
              disabled 
              style={{...s.connectBtn, opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#d1d5db'}}
              aria-label="Stripe coming soon"
            >
              📅 Q1 2026
            </button>
          </div>
        </div>
      </div>

      {/* Payout Summary */}
      {payoutHistory.length > 0 && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'16px', padding:'0 24px 24px'}}>
          <div style={{...s.card, padding:'16px'}}>
            <p style={{fontSize:'12px', color:'#6b7280', margin:'0 0 8px 0'}}>✅ SUCCESSFUL</p>
            <p style={{fontSize:'20px', fontWeight:700, color:'#10b981', margin:0}}>
              ₹{payoutSummary.successAmount.toLocaleString('en-IN', {maximumFractionDigits: 2})}
            </p>
            <p style={{fontSize:'11px', color:'#9ca3af', margin:'4px 0 0 0'}}>{payoutSummary.successCount} payouts</p>
          </div>
          <div style={{...s.card, padding:'16px'}}>
            <p style={{fontSize:'12px', color:'#6b7280', margin:'0 0 8px 0'}}>⏳ PENDING</p>
            <p style={{fontSize:'20px', fontWeight:700, color:'#f59e0b', margin:0}}>
              ₹{payoutSummary.pendingAmount.toLocaleString('en-IN', {maximumFractionDigits: 2})}
            </p>
            <p style={{fontSize:'11px', color:'#9ca3af', margin:'4px 0 0 0'}}>{payoutSummary.pendingCount} payouts</p>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div style={s.card}>
        <h2 style={s.cardT}>📊 Payout History</h2>
        
        {payoutHistory.length > 0 ? (
          <div style={s.tableContainer}>
            <div style={s.table}>
              <div style={s.tableHeader}>
                <div style={{flex: 2}}>Date</div>
                <div style={{flex: 2}}>Amount</div>
                <div style={{flex: 2}}>Gateway</div>
                <div style={{flex: 2}}>Status</div>
              </div>

              {payoutHistory.map((payout) => (
                <div key={payout.id} style={s.tableRow}>
                  <div style={{flex: 2, fontSize:'13px'}}>
                    {new Date(payout.created_at).toLocaleDateString()}
                  </div>
                  <div style={{flex: 2, fontWeight: 700, color: '#10b981', fontSize:'14px'}}>
                    ₹{parseFloat(payout.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </div>
                  <div style={{flex: 2, fontSize:'13px'}}>
                    {payout.gateway_display || payout.gateway_used}
                  </div>
                  <div style={{flex: 2}}>
                    <span style={{...s.statusBadge, 
                      backgroundColor: payout.status === 'success' ? '#d1fae5' : '#fef3c7',
                      color: payout.status === 'success' ? '#065f46' : '#92400e'
                    }}>
                      {payout.status_display || payout.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={s.emptyState}>
            <Clock size={40} color="#d1d5db"/>
            <p style={{fontSize:'16px', fontWeight:600, color:'#374151'}}>No payouts yet</p>
            <p style={s.emptyText}>Your payouts will appear here once processed</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div style={s.infoBox}>
        <Check size={20} color="#10b981"/>
        <div>
          <p style={s.infoBold}>💡 Multiple Payment Methods Coming Soon</p>
          <ul style={s.infoList}>
            <li>✅ <strong>Razorpay</strong> - Live now! Connect your Razorpay account</li>
            <li>⏳ <strong>Cashfree</strong> - Launching next (automatic bank payouts)</li>
            <li>📅 <strong>Stripe</strong> - Q1 2026 (international support)</li>
            <li>🔜 <strong>PayPal</strong> - Coming soon</li>
            <li>✅ 0% Commission - You keep 100% of all sales</li>
            <li>✅ Instant payouts - Get paid as soon as customers pay</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const s = {
  c: { minHeight: '100vh', backgroundColor: '#f9fafb', padding: '0' },
  load: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '20px' },
  spin: { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  h: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' },
  t: { fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 },
  st: { color: '#6b7280', fontSize: '13px', marginTop: '4px' },
  rb: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  sa: { display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 24px 0', padding: '12px 14px', backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '8px', color: '#065f46', fontWeight: 600, fontSize: '13px' },
  ea: { display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 24px 0', padding: '12px 14px', backgroundColor: '#fef2f2', border: '2px solid #ef4444', borderRadius: '8px', color: '#991b1b', fontWeight: 600, fontSize: '13px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  comingSoonBadge: { position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '20px', fontSize: '11px', fontWeight: 600, color: '#92400e' },
  cardH: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #f3f4f6' },
  cardT: { fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 },
  badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: 'white' },
  cardC: { display: 'flex', flexDirection: 'column', gap: '20px' },
  info: { padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' },
  label: { fontSize: '11px', fontWeight: 600, color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase' },
  value: { fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 },
  connectBtn: { width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', minWidth: '500px' },
  tableHeader: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontWeight: '600', fontSize: '13px', color: '#374151', marginBottom: '8px' },
  tableRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '12px', borderBottom: '1px solid #e5e7eb' },
  statusBadge: { display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '8px', color: '#6b7280' },
  emptyText: { fontSize: '13px', color: '#9ca3af', margin: 0 },
  infoBox: { display: 'flex', gap: '16px', padding: '24px', margin: '0 24px 24px', backgroundColor: '#ecfdf5', borderRadius: '12px', border: '2px solid #10b981', alignItems: 'flex-start' },
  infoBold: { fontSize: '14px', fontWeight: 700, color: '#065f46', margin: '0 0 8px 0' },
  infoList: { margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#065f46', lineHeight: '1.6' },
};
