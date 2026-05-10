'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import RazorpaySetupModal from '../../../../components/RazorpaySetupModal';
import "../../../../styles/DashboardPayments.css"

import {
  Check, AlertCircle, Clock, RefreshCw, Edit2, Calendar, Wallet, ReceiptText, Sparkles, Zap, CheckCircle2, ShieldCheck, Lock, TrendingUp, Radio, CreditCard
} from 'lucide-react';

// const API_BASE_URL = 'https://api.keralasellers.in' || 'https://api.keralasellers.in';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                     'https://api.keralasellers.in';


export default function PaymentsDashboard() {
  const [gatewayStatus, setGatewayStatus] = useState({
    razorpay: { connected: false, verified: false, status: 'pending' },
    cashfree: { connected: false, verified: false, status: 'pending' },
    primary_gateway: null,
    is_ready: false
  });
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [liveSettlements, setLiveSettlements] = useState([]);
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [viewMode, setViewMode] = useState('stored');
  const [activeTab, setActiveTab] = useState('settlements');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingLive, setFetchingLive] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
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

  // âœ… Fetch live transactions
  const fetchLiveTransactions = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setFetchingLive(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/payments/payouts/live_transactions/`,
        { headers }
      );

      setLiveTransactions(response.data.transactions || []);
      setSuccessMsg('âœ… Live transactions fetched from Razorpay!');
    } catch (error) {
      console.error('Failed to fetch live transactions:', error);
      setErrorMsg(error.response?.data?.error || 'Failed to fetch live transactions');
    } finally {
      setFetchingLive(false);
    }
  }, [getAuthHeaders]);

  // Fetch live settlements
  const fetchLiveSettlements = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setFetchingLive(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/payments/payouts/live_settlements/`,
        { headers }
      );

      setLiveSettlements(response.data.settlements || []);
      setSuccessMsg('âœ… Live settlements fetched from Razorpay!');
    } catch (error) {
      console.error('Failed to fetch live settlements:', error);
      setErrorMsg(error.response?.data?.error || 'Failed to fetch live settlements');
    } finally {
      setFetchingLive(false);
    }
  }, [getAuthHeaders]);

  const fetchPaymentData = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setRefreshing(true);

      const [statusRes, payoutRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/payments/account/gateway_status/`, { headers }).catch(error => {
          if (error.response?.status === 404) {
            return {
              data: {
                razorpay: { connected: false, verified: false, status: 'pending' },
                cashfree: { connected: false, verified: false, status: 'pending' },
                primary_gateway: null,
                is_ready: false
              }
            };
          }
          throw error;
        }),
        axios.get(`${API_BASE_URL}/api/payments/payouts/history/`, { headers }).catch(error => {
          if (error.response?.status === 404) {
            return { data: { payouts: [] } };
          }
          throw error;
        })
      ]);

      setGatewayStatus(statusRes.data);
      setPayoutHistory(payoutRes.data.payouts || []);
      setErrorMsg('');
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setErrorMsg('Failed to load payment data');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  // âœ… NEW: Auto-fetch live data when switching to live mode
  useEffect(() => {
    if (viewMode === 'live' && gatewayStatus.razorpay?.connected) {
      if (activeTab === 'settlements' && liveSettlements.length === 0) {
        fetchLiveSettlements();
      } else if (activeTab === 'transactions' && liveTransactions.length === 0) {
        fetchLiveTransactions();
      }
    }
  }, [viewMode, activeTab, gatewayStatus.razorpay?.connected, liveSettlements.length, liveTransactions.length, fetchLiveSettlements, fetchLiveTransactions]);

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
    setSuccessMsg(editMode ? 'âœ… Razorpay keys updated!' : 'âœ… Connected to Razorpay!');
    setEditMode(false);
    fetchPaymentData();
  }, [editMode, fetchPaymentData]);

  // âœ… Display data based on mode and tab
  const displayData = viewMode === 'live' 
    ? (activeTab === 'settlements' ? liveSettlements : liveTransactions)
    : payoutHistory;

  const payoutSummary = useMemo(() => {
    if (viewMode === 'live') {
      if (activeTab === 'settlements') {
        const settled = liveSettlements.filter(s => s.status === 'processed');
        const pending = liveSettlements.filter(s => s.status === 'pending');

        return {
          successCount: settled.length,
          successAmount: settled.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0),
          pendingCount: pending.length,
          pendingAmount: pending.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0),
          settledCount: settled.length,
          settledAmount: settled.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0),
          pendingSettlementCount: 0,
          pendingSettlementAmount: 0,
        };
      } else {
  const captured = liveTransactions.filter(t => t.status === 'captured');
  const authorized = liveTransactions.filter(t => t.status === 'authorized');

  return {
    successCount: captured.length,
    successAmount: captured.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0), // âœ… FIXED
    pendingCount: authorized.length,
    pendingAmount: authorized.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0), // âœ… FIXED
    settledCount: captured.length,
    settledAmount: captured.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0), // âœ… FIXED
    pendingSettlementCount: 0,
    pendingSettlementAmount: 0,
  };
}

    } else {
      const successful = payoutHistory.filter(p => p.status === 'success');
      const pending = payoutHistory.filter(p => p.status === 'pending');
      const settled = payoutHistory.filter(p => p.settlement_status === 'settled');
      const pendingSettlement = payoutHistory.filter(p => p.settlement_status === 'pending');

      return {
        successCount: successful.length,
        successAmount: successful.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        pendingCount: pending.length,
        pendingAmount: pending.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        settledCount: settled.length,
        settledAmount: settled.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        pendingSettlementCount: pendingSettlement.length,
        pendingSettlementAmount: pendingSettlement.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      };
    }
  }, [payoutHistory, liveSettlements, liveTransactions, viewMode, activeTab]);

  if (loading) {
    return (
      <div style={s.load}>
        <div style={s.spin}></div>
        <p>Loading payment data...</p>
      </div>
    );
  }

  return (
    <div className='dashboardpaymentpagecontainer' style={s.c}>
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
      <div className='dashboardpaymentheader' style={s.h}>
        <div>
          <h1 className="dashboardpaymenttitle" style={s.t}>
            <Wallet size={32} style={{ marginRight: 6 }} />
            Payment Gateways
          </h1>
          <p className='dashboardpaymentsubtitle' style={s.st}>
            Manage your payment methods & receive instant payouts
            {viewMode === 'live' && <span style={{ color: '#10b981', marginLeft: '8px', fontWeight: 600 }}>â€¢ Live from Razorpay</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {gatewayStatus.razorpay?.connected && (
            <button
              className='dashboardpaymentbarbtn'
              onClick={() => {
                if (viewMode === 'stored') {
                  setViewMode('live');
                  // âœ… Fetch data immediately when switching to live
                  if (activeTab === 'settlements') {
                    fetchLiveSettlements();
                  } else {
                    fetchLiveTransactions();
                  }
                } else {
                  setViewMode('stored');
                }
              }}
              disabled={fetchingLive}
              style={{ ...s.rb, backgroundColor: viewMode === 'live' ? '#10b981' : '#6366f1' }}
            >
              <Radio size={16} />
              {viewMode === 'live' ? 'Live Mode' : 'View Live'}
            </button>
          )}
          <button
            className='dashboardpaymentbarbtn'
            onClick={() => {
              if (viewMode === 'live') {
                activeTab === 'settlements' ? fetchLiveSettlements() : fetchLiveTransactions();
              } else {
                fetchPaymentData();
              }
            }}
            disabled={refreshing || fetchingLive}
            style={s.rb}
          >
            <RefreshCw
              className='dashboardpaymentrfrshicon'
              size={16}
              style={{ animation: (refreshing || fetchingLive) ? 'spin 1s linear infinite' : 'none' }}
            />
            {(refreshing || fetchingLive) ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={s.sa}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div style={s.ea}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Gateway Cards */}
      <div className='dashboardpaymentscardgrid' style={{ display: "grid", gap: "15px", gridTemplateColumns: "repeat(auto-fit, minmax(285px, 1fr))", marginBottom: "30px" }}>
        {/* Razorpay Card */}
        <div className="creditcard-wrapper">
          <div className="creditcard-card">
            <div className="creditcard-glow creditcard-glow-top"></div>
            <div className="creditcard-glow creditcard-glow-bottom"></div>
            <div className="creditcard-content">
              <div className="creditcard-header">
                <h2 className="creditcard-title">
                  <span className="creditcard-bold">Razorpay</span>
                </h2>
                {gatewayStatus.razorpay?.verified ? (
                  <div className="creditcard-status">
                    <span className="green-dot"></span>
                    Live
                  </div>
                ) : (
                  <div className="creditcard-svg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="#ffffffff">
                      <path d="m22.436 0l-11.91 7.773l-1.174 4.276l6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166L1.564 24h9.008l3.688-13.902Z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="creditcard-chip">
                <svg viewBox="0 0 100 100">
                  <rect x="18" y="18" width="64" height="64" rx="10" fill="gold" opacity="0.95" />
                  <rect x="30" y="30" width="40" height="40" rx="6" stroke="white" strokeWidth="2" fill="none" opacity="0.85" />
                  <line x1="50" y1="18" x2="50" y2="30" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="18" y1="50" x2="30" y2="50" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="70" y1="50" x2="82" y2="50" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="50" y1="70" x2="50" y2="82" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="30" y1="30" x2="24" y2="24" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="70" y1="30" x2="76" y2="24" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="30" y1="70" x2="24" y2="76" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="70" y1="70" x2="76" y2="76" stroke="white" strokeWidth="2" opacity="0.6" />
                </svg>
              </div>
              <div style={s.cardC}>
                <div className='dashboardpaymentinfo' style={s.info}>
                  <p className='dashboardpaymentstatusvalue' style={s.label}>Status</p>
                  <p className='dashboardpaymentstatusvalue' style={{ ...s.value, color: gatewayStatus.razorpay?.verified ? '#58f58c' : '#f59e0b' }}>
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
                  <button className='dashboardpaymentconnectbtn' onClick={handleRazorpayClick} style={s.connectBtn}>
                    ðŸ”— Connect Razorpay
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className='dashboardpaymentconnectbtn' onClick={handleEditRazorpay} style={{ ...s.connectBtn, backgroundColor: 'gold', flex: 1 }}>
                      <Edit2 className='dashboardpaymentconnectbtnediticon' size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Edit Keys
                    </button>
                    <button className='dashboardpaymentconnectbtn' disabled style={{ ...s.connectBtn, opacity: 0.5, cursor: 'not-allowed', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Check className='dashboardpaymentconnectbtnediticon' size={14} />
                      Connected
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cashfree Card */}
        <div className="creditcard-wrapper">
          <div className="creditcard-card">
            <div className="creditcard-glow creditcard-glow-top"></div>
            <div className="creditcard-glow creditcard-glow-bottom"></div>
            <div className="creditcard-content">
              <div className="creditcard-header">
                <h2 className="creditcard-title">
                  <span className="creditcard-bold">Cashfree</span>
                </h2>
                <div className="creditcard-svg">
                  <img src="https://cdn.brandfetch.io/idLecjUPYL/theme/light/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1700772646757" alt="icon" style={{ width: 25, height: 25 }} />
                </div>
              </div>
              <div className="creditcard-chip">
                <svg viewBox="0 0 100 100">
                  <rect x="18" y="18" width="64" height="64" rx="10" fill="gold" opacity="0.95" />
                  <rect x="30" y="30" width="40" height="40" rx="6" stroke="white" strokeWidth="2" fill="none" opacity="0.85" />
                  <line x1="50" y1="18" x2="50" y2="30" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="18" y1="50" x2="30" y2="50" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="70" y1="50" x2="82" y2="50" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="50" y1="70" x2="50" y2="82" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="30" y1="30" x2="24" y2="24" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="70" y1="30" x2="76" y2="24" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="30" y1="70" x2="24" y2="76" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="70" y1="70" x2="76" y2="76" stroke="white" strokeWidth="2" opacity="0.6" />
                </svg>
              </div>
              <div style={s.cardC}>
                <div className='dashboardpaymentinfo' style={s.info}>
                  <p className='dashboardpaymentstatusvalue' style={s.label}>Status</p>
                  <p className='dashboardpaymentstatusvalue' style={{ ...s.value, color: '#b4b6baff' }}>COMING SOON</p>
                </div>
                <button className='dashboardpaymentconnectbtn' disabled style={{ ...s.connectBtn, opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#b4b6baff' }}>
                  â³ Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Card */}
        <div className="creditcard-wrapper">
          <div className="creditcard-card">
            <div className="creditcard-glow creditcard-glow-top"></div>
            <div className="creditcard-glow creditcard-glow-bottom"></div>
            <div className="creditcard-content">
              <div className="creditcard-header">
                <h2 className="creditcard-title">
                  <span className="creditcard-bold">Stripe</span>
                </h2>
                <div className="creditcard-svg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409c0-.831.683-1.305 1.901-1.305c2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0C9.667 0 7.589.654 6.104 1.872C4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219c2.585.92 3.445 1.574 3.445 2.583c0 .98-.84 1.545-2.354 1.545c-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813c1.664-1.305 2.525-3.236 2.525-5.732c0-4.128-2.524-5.851-6.594-7.305h.003z" />
                  </svg>
                </div>
              </div>
              <div className="creditcard-chip">
                <svg viewBox="0 0 100 100">
                  <rect x="18" y="18" width="64" height="64" rx="10" fill="gold" opacity="0.95" />
                  <rect x="30" y="30" width="40" height="40" rx="6" stroke="white" strokeWidth="2" fill="none" opacity="0.85" />
                  <line x1="50" y1="18" x2="50" y2="30" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="18" y1="50" x2="30" y2="50" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="70" y1="50" x2="82" y2="50" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="50" y1="70" x2="50" y2="82" stroke="white" strokeWidth="2" opacity="0.7" />
                  <line x1="30" y1="30" x2="24" y2="24" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="70" y1="30" x2="76" y2="24" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="30" y1="70" x2="24" y2="76" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="70" y1="70" x2="76" y2="76" stroke="white" strokeWidth="2" opacity="0.6" />
                </svg>
              </div>
              <div style={s.cardC}>
                <div className='dashboardpaymentinfo' style={s.info}>
                  <p className='dashboardpaymentstatusvalue' style={s.label}>Status</p>
                  <p className='dashboardpaymentstatusvalue' style={{ ...s.value, color: '#b4b6baff' }}>COMING SOON</p>
                </div>
                <button className='dashboardpaymentconnectbtn' disabled style={{ ...s.connectBtn, opacity: 0.6, cursor: "not-allowed", backgroundColor: "#b4b6baff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Calendar className='dashboardpaymentconnectbtnediticon' size={14} />
                  Q1 2026
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {displayData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', padding: '0 24px 24px' }}>
          <div style={{ ...s.card, padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>âœ… SUCCESSFUL</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#10b981', margin: 0 }}>
              â‚¹{payoutSummary.successAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>
              {payoutSummary.successCount} {viewMode === 'live' ? (activeTab === 'transactions' ? 'payments' : 'settlements') : 'payouts'}
            </p>
          </div>
          <div style={{ ...s.card, padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>â³ PENDING</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b', margin: 0 }}>
              â‚¹{payoutSummary.pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>{payoutSummary.pendingCount} pending</p>
          </div>
          <div style={{ ...s.card, padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>ðŸ¦ SETTLED</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#3b82f6', margin: 0 }}>
              â‚¹{payoutSummary.settledAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>{payoutSummary.settledCount} settled</p>
          </div>
          {viewMode === 'stored' && (
            <div style={{ ...s.card, padding: '16px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>â° AWAITING</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>
                â‚¹{payoutSummary.pendingSettlementAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>{payoutSummary.pendingSettlementCount} pending</p>
            </div>
          )}
        </div>
      )}

      {/* âœ… TABS - Only show in live mode */}
      {viewMode === 'live' && (
        <div style={{ padding: '0 24px 16px', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setActiveTab('settlements');
              fetchLiveSettlements();
            }}
            style={{
              ...s.tabBtn,
              backgroundColor: activeTab === 'settlements' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'settlements' ? 'white' : '#6b7280',
            }}
          >
            <ReceiptText size={16} />
            Settlements
          </button>
          <button
            onClick={() => {
              setActiveTab('transactions');
              fetchLiveTransactions();
            }}
            style={{
              ...s.tabBtn,
              backgroundColor: activeTab === 'transactions' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'transactions' ? 'white' : '#6b7280',
            }}
          >
            <CreditCard size={16} />
            Transactions
          </button>
        </div>
      )}

      {/* âœ… TABLE */}
      <div style={{ ...s.card, margin: '0 5px 24px' }}>
        <h2 style={s.cardT}>
          {activeTab === 'transactions' && viewMode === 'live' ? <CreditCard size={18} style={{ marginRight: 6 }} /> : <ReceiptText size={18} style={{ marginRight: 6 }} />}
          {viewMode === 'live' 
            ? (activeTab === 'settlements' ? 'Live Razorpay Settlements' : 'Live Razorpay Transactions')
            : 'Payout History'}
        </h2>
        {displayData.length > 0 ? (
          <div style={s.tableContainer}>
            <div style={s.table}>
              {activeTab === 'transactions' && viewMode === 'live' ? (
                <>
                  <div style={s.tableHeader5}>
                    <div style={{ flex: 2 }}>Date</div>
                    <div style={{ flex: 2 }}>Amount</div>
                    <div style={{ flex: 2 }}>Method</div>
                    <div style={{ flex: 2 }}>Status</div>
                    <div style={{ flex: 3 }}>Details</div>
                  </div>
                  {liveTransactions.map((txn) => (
                    <div key={txn.id} style={s.tableRow5}>
                      <div style={{ flex: 2, fontSize: '13px' }}>
  {(() => {
    const createdAt = txn.created_at;
    if (!createdAt) return 'N/A';
    
    // If it's a number (Unix timestamp)
    if (typeof createdAt === 'number' && !isNaN(createdAt)) {
      return new Date(createdAt * 1000).toLocaleDateString('en-IN');
    }
    
    // If it's a string (ISO format)
    if (typeof createdAt === 'string') {
      const date = new Date(createdAt);
      return !isNaN(date.getTime()) ? date.toLocaleDateString('en-IN') : 'N/A';
    }
    
    return 'N/A';
  })()}
</div>

                      <div style={{ flex: 2, fontWeight: 700, color: '#10b981', fontSize: '14px' }}>
                        â‚¹{(parseFloat(txn.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ flex: 2, fontSize: '13px', textTransform: 'capitalize' }}>
                        {txn.method || 'N/A'}
                      </div>
                      <div style={{ flex: 2 }}>
                        <span style={{
                          ...s.statusBadge,
                          backgroundColor: txn.status === 'captured' ? '#d1fae5' : txn.status === 'failed' ? '#fee2e2' : '#fef3c7',
                          color: txn.status === 'captured' ? '#065f46' : txn.status === 'failed' ? '#991b1b' : '#92400e'
                        }}>
                          {txn.status === 'captured' ? 'âœ… Captured' : txn.status === 'failed' ? 'âŒ Failed' : 'â³ ' + txn.status}
                        </span>
                      </div>
                      <div style={{ flex: 3, fontSize: '12px' }}>
                        {txn.email && (
                          <div style={{ color: '#6b7280', marginBottom: '4px' }}>
                            {txn.email}
                          </div>
                        )}
                        {txn.order_id && (
                          <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                            Order: {txn.order_id}
                          </div>
                        )}
                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                          ID: {txn.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div style={s.tableHeader5}>
                    <div style={{ flex: 2 }}>Date</div>
                    <div style={{ flex: 2 }}>Amount</div>
                    <div style={{ flex: 2 }}>{viewMode === 'live' ? 'Fees' : 'Gateway'}</div>
                    <div style={{ flex: 2 }}>Status</div>
                    <div style={{ flex: 3 }}>Details</div>
                  </div>
                  {viewMode === 'live' ? (
                    liveSettlements.map((settlement) => (
                      <div key={settlement.id} style={s.tableRow5}>
  <div style={{ flex: 2, fontSize: '13px' }}>
  {(() => {
    const createdAt = settlement.created_at;
    if (!createdAt) return 'N/A';
    
    // If it's a number (Unix timestamp)
    if (typeof createdAt === 'number' && !isNaN(createdAt)) {
      return new Date(createdAt * 1000).toLocaleDateString('en-IN');
    }
    
    // If it's a string (ISO format)
    if (typeof createdAt === 'string') {
      const date = new Date(createdAt);
      return !isNaN(date.getTime()) ? date.toLocaleDateString('en-IN') : 'N/A';
    }
    
    return 'N/A';
  })()}
</div>


                        <div style={{ flex: 2, fontWeight: 700, color: '#10b981', fontSize: '14px' }}>
                          â‚¹{(parseFloat(settlement.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ flex: 2, fontSize: '13px', color: '#ef4444' }}>
  -â‚¹{parseFloat(settlement.fees || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
</div>

                        <div style={{ flex: 2 }}>
                          <span style={{
                            ...s.statusBadge,
                            backgroundColor: settlement.status === 'processed' ? '#d1fae5' : '#fef3c7',
                            color: settlement.status === 'processed' ? '#065f46' : '#92400e'
                          }}>
                            {settlement.status === 'processed' ? 'âœ… Settled' : 'â³ Pending'}
                          </span>
                        </div>
                        <div style={{ flex: 3, fontSize: '12px' }}>
                          {settlement.utr && (
                            <div style={{ color: '#10b981', marginBottom: '4px', fontWeight: 600 }}>
                              UTR: {settlement.utr}
                            </div>
                          )}
                          <div style={{ color: '#6b7280', fontSize: '10px' }}>
                            ID: {settlement.id}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    payoutHistory.map((payout) => (
                      <div key={payout.id} style={s.tableRow5}>
                        <div style={{ flex: 2, fontSize: '13px' }}>
                          {new Date(payout.created_at).toLocaleDateString()}
                        </div>
                        <div style={{ flex: 2, fontWeight: 700, color: '#10b981', fontSize: '14px' }}>
                          â‚¹{parseFloat(payout.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ flex: 2, fontSize: '13px' }}>
                          {payout.gateway_display || payout.gateway_used}
                        </div>
                        <div style={{ flex: 2 }}>
                          <span style={{
                            ...s.statusBadge,
                            backgroundColor: payout.status === 'success' ? '#d1fae5' : '#fef3c7',
                            color: payout.status === 'success' ? '#065f46' : '#92400e'
                          }}>
                            {payout.status_display || payout.status}
                          </span>
                        </div>
                        <div style={{ flex: 3, fontSize: '12px' }}>
                          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                            {payout.settlement_status_display || 'â³ Pending'}
                          </div>
                          {payout.expected_settlement_date_display && !payout.settlement_date && (
                            <div style={{ fontSize: '10px', color: '#6b7280' }}>
                              Expected: {new Date(payout.expected_settlement_date_display).toLocaleDateString()}
                            </div>
                          )}
                          {payout.settlement_date && (
                            <div style={{ fontSize: '10px', color: '#10b981' }}>
                              Settled: {new Date(payout.settlement_date).toLocaleDateString()}
                            </div>
                          )}
                          {payout.settlement_utr && (
                            <div style={{ fontSize: '10px', color: '#10b981' }}>
                              UTR: {payout.settlement_utr}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={s.emptyState}>
            <Clock size={40} color="#d1d5db" />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>
              No {activeTab === 'transactions' && viewMode === 'live' ? 'transactions' : viewMode === 'live' ? 'settlements' : 'payouts'} yet
            </p>
            <p style={s.emptyText}>
              Your {activeTab === 'transactions' && viewMode === 'live' ? 'transactions' : viewMode === 'live' ? 'settlements' : 'payouts'} will appear here once processed
            </p>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <main style={{ minHeight: "100vh", background: "#FDFFF0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "1200px" }}>
          <div style={{ borderRadius: "24px", border: "1px solid rgba(129, 140, 248, 0.6)", background: "#FDFFF0", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(to right, #4f46e5, #6366f1, #14b8a6)", padding: "clamp(24px, 8vw, 48px) clamp(16px, 5vw, 32px)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: "160px", height: "160px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", filter: "blur(50px)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "130px", height: "130px", background: "rgba(165,180,252,0.2)", borderRadius: "9999px", filter: "blur(40px)" }} />
              <div style={{ position: "relative", zIndex: 10, display: "flex", gap: "16px", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(6px)", borderRadius: "16px" }}>
                  <Sparkles style={{ width: "32px", height: "32px", color: "white" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <h1 style={{ fontSize: "clamp(20px, 6vw, 28px)", fontWeight: "700", color: "white", marginBottom: "4px" }}>
                    Payment Gateway Partners
                  </h1>
                  <p style={{ fontSize: "clamp(12px, 3vw, 14px)", color: "#e0e7ff" }}>
                    Multiple payment options with zero commissions and instant payouts
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: "clamp(20px, 5vw, 32px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px", borderBottom: "1px solid #e5e7eb", background: "#FDFFF0" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "48px", height: "48px", background: "#ccfbf1", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Zap style={{ width: "24px", height: "24px", color: "#0d9488" }} />
                </div>
                <p style={{ fontSize: "clamp(11px, 2vw, 12px)", fontWeight: "600", color: "#374151" }}>0% Commission</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "48px", height: "48px", background: "#e0ffe0ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Lock style={{ width: "24px", height: "24px", color: "#1f9034ff" }} />
                </div>
                <p style={{ fontSize: "clamp(11px, 2vw, 12px)", fontWeight: "600", color: "#374151" }}>Secure & Verified</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "48px", height: "48px", background: "#ffedd5", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <CheckCircle2 style={{ width: "24px", height: "24px", color: "#ea580c" }} />
                </div>
                <p style={{ fontSize: "clamp(11px, 2vw, 12px)", fontWeight: "600", color: "#374151" }}>Instant Payouts</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "48px", height: "48px", background: "#d5deffff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <ShieldCheck style={{ width: "24px", height: "24px", color: "#1b0ceaff" }} />
                </div>
                <p style={{ fontSize: "clamp(11px, 2vw, 12px)", fontWeight: "600", color: "#374151" }}>Advanced Protection</p>
              </div>
            </div>

            <div style={{ padding: "clamp(20px, 5vw, 32px)" }}>
              <h3 style={{ fontSize: "clamp(11px, 2vw, 12px)", fontWeight: "600", color: "#4b5563", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Available Gateways
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {[
                  { name: "Razorpay", badge: "Live Now", bg: "#ccfbf1", text: "#0d9488" },
                  { name: "Cashfree", badge: "Next Up", bg: "#fed7aa", text: "#c2410c" },
                  { name: "Stripe", badge: "Q1 2026", bg: "#e0e7ff", text: "#4338ca" },
                  { name: "PayPal", badge: "Soon", bg: "#f3f4f6", text: "#4b5563" },
                ].map((item) => (
                  <div
                    key={item.name}
                    style={{ padding: "20px", borderRadius: "16px", border: "1px solid #e5e7eb", background: "linear-gradient(to bottom right, #f9fafb, white)", cursor: "pointer", transition: "0.3s" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 10px 20px rgba(79,70,229,0.15)";
                      e.currentTarget.style.border = "1px solid #a5b4fc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.border = "1px solid #e5e7eb";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                      <span style={{ fontWeight: "600", color: "#111827", fontSize: "clamp(14px, 3vw, 16px)" }}>{item.name}</span>
                      <span style={{ fontSize: "clamp(11px, 2vw, 12px)", fontWeight: "600", padding: "6px 12px", borderRadius: "999px", background: item.bg, color: item.text, whiteSpace: "nowrap" }}>
                        {item.badge}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "4px", background: "#f3f4f6", borderRadius: "999px" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

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
  c: { minHeight: '100vh', backgroundColor: '#FDFFF0', padding: '0px 0px 0px 24px', maxWidth: '1400px' },
  load: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '20px' },
  spin: { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  h: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: '#FDFFF0' },
  t: { fontSize: '35px', fontWeight: 700, color: '#1f2937', margin: 0, alignItems: 'center', display: 'flex' },
  st: { color: '#6b7280', fontSize: '15px', marginTop: '4px' },
  rb: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: 'rgb(23, 94, 84)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  sa: { display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 24px 0', padding: '12px 14px', backgroundColor: '#ecfdf5', border: '2px solid #10b981', borderRadius: '8px', color: '#065f46', fontWeight: 600, fontSize: '13px' },
  ea: { display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 24px 0', padding: '12px 14px', backgroundColor: '#fef2f2', border: '2px solid #ef4444', borderRadius: '8px', color: '#991b1b', fontWeight: 600, fontSize: '13px' },
  card: { backgroundColor: '#FDFFF0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
  cardT: { fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0, display: 'flex' },
  cardC: { display: 'flex', flexDirection: 'column', gap: '10px' },
  info: { padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '15px', fontWeight: 600, color: '#b4b6baff', margin: 0, textTransform: 'uppercase' },
  value: { fontSize: '15px', fontWeight: 600, color: '#1f2937', margin: 0, textAlign: 'right' },
  connectBtn: { width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', minWidth: '600px' },
  tableHeader5: { display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 2fr 3fr', gap: '12px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', fontWeight: '600', fontSize: '13px', color: '#374151', marginBottom: '8px' },
  tableRow5: { display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 2fr 3fr', gap: '12px', padding: '12px', borderBottom: '1px solid #e5e7eb' },
  statusBadge: { display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '8px', color: '#6b7280' },
  emptyText: { fontSize: '13px', color: '#9ca3af', margin: 0 },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
};

