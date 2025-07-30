'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

const HISTORY_API_URL = 'http://localhost:8000/user/store/stock-history/';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setIsLoading(true);
    axios.get(HISTORY_API_URL, { headers: { Authorization: `Token ${token}` } })
      .then(response => {
        setHistory(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch history:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading history...</p>;

  return (
    <div>
      <h1>Stock History</h1>
      <p>A log of all recent inventory changes.</p>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Product</th>
            <th style={styles.th}>Action</th>
            <th style={styles.th}>Total Change</th>
            <th style={styles.th}>Online Change</th>
            {/* ✅ Changed Header */}
            <th style={styles.th}>Note / Reason</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? history.map(log => (
            <tr key={log.id}>
              <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
              <td style={styles.td}>{log.product}</td>
              <td style={styles.td}>{log.action}</td>
              <td style={{...styles.td, color: log.change_total >= 0 ? 'green' : 'red'}}>{log.change_total > 0 ? `+${log.change_total}` : log.change_total}</td>
              <td style={{...styles.td, color: log.change_online >= 0 ? 'green' : 'red'}}>{log.change_online > 0 ? `+${log.change_online}` : log.change_online}</td>
              {/* ✅ Changed Data Cell */}
              <td style={styles.td}>{log.note || '-'}</td>
            </tr>
          )) : (
            <tr><td colSpan="6" style={{...styles.td, textAlign: 'center', padding: '2rem'}}>No history found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem' },
    th: { borderBottom: '2px solid #dee2e6', padding: '12px', textAlign: 'left', backgroundColor: '#f8f9fa' },
    td: { borderBottom: '1px solid #dee2e6', padding: '12px', verticalAlign: 'middle' },
};