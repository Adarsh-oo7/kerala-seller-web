'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  History, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter,
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const HISTORY_API_URL = `${API_BASE_URL}/user/store/stock-history/`;

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: 'all',
    dateRange: '30',
    product: ''
  });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Token ${token}` } : null;
  }, []);

  const fetchHistory = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError('Please log in to view stock history');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Fetching history from:', HISTORY_API_URL);
      const response = await axios.get(HISTORY_API_URL, { headers });
      
      const historyData = response.data.results || response.data || [];
      console.log('History data received:', historyData);
      
      setHistory(historyData);
      setFilteredHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load stock history. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Apply filters to history
  const applyFilters = useCallback(() => {
    let filtered = [...history];

    // Filter by action type
    if (filters.action !== 'all') {
      filtered = filtered.filter(item => item.action === filters.action);
    }

    // Filter by product name
    if (filters.product.trim()) {
      filtered = filtered.filter(item => 
        item.product?.toLowerCase().includes(filters.product.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(item => 
        new Date(item.timestamp) >= cutoffDate
      );
    }

    setFilteredHistory(filtered);
  }, [history, filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'stock_in':
      case 'increase':
        return <TrendingUp size={16} color="#059669" />;
      case 'stock_out':
      case 'decrease':
        return <TrendingDown size={16} color="#dc2626" />;
      default:
        return <Package size={16} color="#6b7280" />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'stock_in':
        return 'Stock In';
      case 'stock_out':
        return 'Stock Out';
      case 'increase':
        return 'Increased';
      case 'decrease':
        return 'Decreased';
      case 'adjustment':
        return 'Adjustment';
      case 'sale':
        return 'Sale';
      case 'return':
        return 'Return';
      default:
        return action;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Product', 'Action', 'Total Change', 'Online Change', 'Note'],
      ...filteredHistory.map(item => [
        formatDate(item.timestamp),
        item.product,
        getActionLabel(item.action),
        item.change_total,
        item.change_online,
        item.note || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading stock history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchHistory} style={styles.retryButton}>
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>
            <History size={28} />
            Stock History
          </h1>
          <p style={styles.pageSubtitle}>
            Track all inventory changes and stock movements
          </p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={exportHistory} style={styles.exportButton}>
            <Download size={18} />
            Export CSV
          </button>
          <button onClick={fetchHistory} style={styles.refreshButton}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>
            <Filter size={18} />
            Filters
          </h3>
        </div>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Action Type</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
              style={styles.filterSelect}
            >
              <option value="all">All Actions</option>
              <option value="stock_in">Stock In</option>
              <option value="stock_out">Stock Out</option>
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
              <option value="adjustment">Adjustment</option>
              <option value="sale">Sale</option>
              <option value="return">Return</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              style={styles.filterSelect}
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Product Name</label>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.product}
              onChange={(e) => setFilters({...filters, product: e.target.value})}
              style={styles.filterInput}
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div style={styles.summaryContainer}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Total Records:</span>
          <span style={styles.summaryValue}>{filteredHistory.length}</span>
        </div>
        {filteredHistory.length !== history.length && (
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Filtered from:</span>
            <span style={styles.summaryValue}>{history.length} total records</span>
          </div>
        )}
      </div>

      {/* History Table */}
      <div style={styles.tableContainer}>
        {filteredHistory.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>
                  <Calendar size={16} />
                  Date & Time
                </th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>Total Change</th>
                <th style={styles.th}>Online Change</th>
                <th style={styles.th}>Note / Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(log => (
                <tr key={log.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.dateCell}>
                      <div style={styles.dateMain}>
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.productCell}>
                      <Package size={16} />
                      <span>{log.product}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionCell}>
                      {getActionIcon(log.action)}
                      <span>{getActionLabel(log.action)}</span>
                    </div>
                  </td>
                  <td style={{
                    ...styles.td, 
                    ...styles.changeCell,
                    color: log.change_total >= 0 ? '#059669' : '#dc2626'
                  }}>
                    <strong>
                      {log.change_total > 0 ? `+${log.change_total}` : log.change_total}
                    </strong>
                  </td>
                  <td style={{
                    ...styles.td,
                    ...styles.changeCell,
                    color: log.change_online >= 0 ? '#059669' : '#dc2626'
                  }}>
                    <strong>
                      {log.change_online > 0 ? `+${log.change_online}` : log.change_online}
                    </strong>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.noteCell}>
                      {log.note || <span style={styles.noNote}>No note</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>
            <History size={48} />
            <h3>No stock history found</h3>
            <p>
              {filters.action !== 'all' || filters.product || filters.dateRange !== '30'
                ? 'No records match your current filters. Try adjusting the filters above.'
                : 'No stock movements have been recorded yet.'
              }
            </p>
            {(filters.action !== 'all' || filters.product || filters.dateRange !== '30') && (
              <button
                onClick={() => setFilters({ action: 'all', dateRange: '30', product: '' })}
                style={styles.clearFiltersButton}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    animation: 'fadeIn 0.6s ease-out'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '20px'
  },
  
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '20px',
    textAlign: 'center',
    color: '#ef4444'
  },
  
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500'
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  pageSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0
  },
  
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  filtersContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  filtersHeader: {
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  
  filtersTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  
  filterGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  filterLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },
  
  filterSelect: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white'
  },
  
  filterInput: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  
  summaryContainer: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  summaryLabel: {
    fontSize: '14px',
    color: '#6b7280'
  },
  
  summaryValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937'
  },
  
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  table: { 
    width: '100%', 
    borderCollapse: 'collapse'
  },
  
  tableHeader: {
    backgroundColor: '#f8fafc'
  },
  
  th: { 
    padding: '16px 12px',
    textAlign: 'left', 
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s'
  },
  
  td: { 
    padding: '16px 12px',
    fontSize: '14px',
    verticalAlign: 'middle'
  },
  
  dateCell: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  dateMain: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937'
  },
  
  productCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
    color: '#1f2937'
  },
  
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  changeCell: {
    fontWeight: '600',
    fontSize: '15px'
  },
  
  noteCell: {
    maxWidth: '200px',
    wordBreak: 'break-word'
  },
  
  noNote: {
    color: '#9ca3af',
    fontStyle: 'italic'
  },
  
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    gap: '16px',
    color: '#6b7280',
    textAlign: 'center',
    padding: '40px'
  },
  
  clearFiltersButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '8px'
  }
};
