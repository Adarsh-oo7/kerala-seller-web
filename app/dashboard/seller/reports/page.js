'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [advanced, setAdvanced] = useState(null);
  const [profit, setProfit] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const response = await axios.get(`${API_BASE_URL}/user/orders/reports/summary/`, { headers });
      setData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Reports are not available on the current plan.');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/user/orders/reports/advanced/`, { headers });
      setAdvanced(response.data);
    } catch (_err) {
      setAdvanced(null);
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/user/orders/reports/profit/`, { headers });
      setProfit(response.data);
    } catch (_err) {
      setProfit(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div style={{ padding: 24 }}><h1>Reports</h1><p>{error}</p></div>;
  if (!data) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <h1>Reports</h1>
      <p>Today bills ₹{data.today.bill_sales} ({data.today.bills}) · online ₹{data.today.online_sales} ({data.today.online_orders})</p>
      <p>This month bill sales ₹{data.month.bill_sales} · pending orders {data.pending_orders}</p>
      <p>Active products {data.product_count}</p>
      <h2>Low stock</h2>
      {(data.low_stock || []).length === 0 ? <p>None.</p> : (
        <ul>{data.low_stock.map((row) => <li key={row.id}>{row.name}: {row.total_stock} (alert {row.threshold})</li>)}</ul>
      )}
      {advanced ? (
        <>
          <h2>Best sellers</h2>
          {(advanced.bestsellers || []).length === 0 ? <p>No sales in this window.</p> : (
            <ul>
              {advanced.bestsellers.map((row) => (
                <li key={`${row.product_id}-${row.name}`}>{row.name}: {row.qty} sold · ₹{row.sales}</li>
              ))}
            </ul>
          )}
        </>
      ) : <p style={{ color: '#64748b' }}>Advanced reports are locked on the current plan.</p>}
      {profit ? (
        <>
          <h2>Estimated profit</h2>
          <p>Revenue ₹{profit.revenue} − cost ₹{profit.estimated_cogs} − expenses ₹{profit.expenses} = ₹{profit.estimated_profit}</p>
          {profit.lines_without_cost_price ? <p>{profit.lines_without_cost_price} lines had no cost price and were skipped in COGS.</p> : null}
        </>
      ) : <p style={{ color: '#64748b' }}>Profit reports are locked on the current plan.</p>}
    </div>
  );
}
