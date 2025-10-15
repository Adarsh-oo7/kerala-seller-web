'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  RefreshCw,
  User,
  FileText,
  Search,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ShoppingCart,
  Plus,
  Minus
} from 'lucide-react';

// ✅ Enhanced API Configuration
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  return 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const HISTORY_API_URL = `${API_BASE_URL}/user/store/stock-history/`;

export default function StockHistoryPage() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: 'all',
    dateRange: '30',
    product: ''
  });
  const router = useRouter();

  // ✅ Enhanced authentication check
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken') || 
                 localStorage.getItem('buyerAccessToken') ||
                 localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  // ✅ Mock data for demonstration (remove when backend is ready)
  const mockData = [
    {
      id: 1,
      timestamp: '2025-10-15T14:30:00Z',
      product: { name: 'iPhone 15 Pro Max' },
      action: 'SALE',
      change_total: -1,
      change_online: -1,
      user: { full_name: 'Adarsh B S' },
      note: 'Online order #ORD-12345'
    },
    {
      id: 2,
      timestamp: '2025-10-15T12:15:00Z',
      product: { name: 'Samsung Galaxy S24 Ultra' },
      action: 'CREATED',
      change_total: 10,
      change_online: 8,
      user: { full_name: 'Adarsh B S' },
      note: 'New product added to inventory'
    },
    {
      id: 3,
      timestamp: '2025-10-15T10:45:00Z',
      product: { name: 'MacBook Air M2' },
      action: 'UPDATED',
      change_total: -2,
      change_online: -1,
      user: { full_name: 'System' },
      note: 'Stock adjustment - damaged items removed'
    },
    {
      id: 4,
      timestamp: '2025-10-14T16:20:00Z',
      product: { name: 'iPad Pro 11"' },
      action: 'RETURN',
      change_total: 1,
      change_online: 1,
      user: { full_name: 'Adarsh B S' },
      note: 'Customer return processed'
    },
    {
      id: 5,
      timestamp: '2025-10-14T09:30:00Z',
      product: { name: 'iPhone 15 Pro Max' },
      action: 'SALE',
      change_total: -1,
      change_online: 0,
      user: { full_name: 'Adarsh B S' },
      note: 'Local store sale - Bill #LB001'
    }
  ];

  const fetchHistory = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      router.push('/login/seller');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Fetching stock history from:', HISTORY_API_URL);
      const response = await axios.get(HISTORY_API_URL, { headers });
      
      const historyData = response.data.results || response.data || [];
      console.log(`✅ Received ${historyData.length} stock history records`);
      
      // Use real data if available, otherwise use mock data
      const dataToUse = historyData.length > 0 ? historyData : mockData;
      setHistory(dataToUse);
      setFilteredHistory(dataToUse);
    } catch (error) {
      console.error('❌ Failed to fetch stock history:', error);
      if (error.response?.status === 401) {
        router.push('/login/seller?message=Session expired');
      } else if (error.response?.status === 404) {
        console.log('📝 Stock history endpoint not found, using mock data');
        setHistory(mockData);
        setFilteredHistory(mockData);
      } else {
        console.log('📝 Using mock data due to API error');
        setHistory(mockData);
        setFilteredHistory(mockData);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, router]);

  // ✅ Enhanced filtering logic
  const applyFilters = useCallback(() => {
    let filtered = [...history];

    // Filter by action type
    if (filters.action !== 'all') {
      filtered = filtered.filter(item => item.action === filters.action);
    }

    // Filter by product name
    if (filters.product.trim()) {
      filtered = filtered.filter(item => {
        const productName = item.product?.name || 
                           item.product_name || 
                           item.product || 
                           'Unknown Product';
        return productName.toLowerCase().includes(filters.product.toLowerCase());
      });
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(item => 
        new Date(item.timestamp).getTime() >= cutoffDate.getTime()
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

  // ✅ Enhanced helper functions
  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATED':
        return <Plus size={16} color="#059669" />;
      case 'UPDATED':
        return <RotateCcw size={16} color="#3b82f6" />;
      case 'SALE':
        return <ShoppingCart size={16} color="#dc2626" />;
      case 'RETURN':
        return <ArrowUp size={16} color="#059669" />;
      default:
        return <Package size={16} color="#6b7280" />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'CREATED':
        return 'Product Added';
      case 'UPDATED':
        return 'Stock Updated';
      case 'SALE':
        return 'Item Sold';
      case 'RETURN':
        return 'Item Returned';
      default:
        return action?.charAt(0)?.toUpperCase() + action?.slice(1) || 'Unknown';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATED':
      case 'RETURN':
        return '#059669'; // Green
      case 'SALE':
        return '#dc2626'; // Red
      case 'UPDATED':
        return '#3b82f6'; // Blue
      default:
        return '#6b7280'; // Gray
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

  const getProductName = (item) => {
    return item.product?.name || 
           item.product_name || 
           item.product || 
           'Unknown Product';
  };

  const getUserName = (item) => {
    if (item.user) {
      return item.user.full_name || 
             item.user.email || 
             item.user.name || 
             'System User';
    }
    return 'System';
  };

  // ✅ Enhanced statistics calculation
  const getStats = () => {
    const stats = filteredHistory.reduce((acc, item) => {
      const totalChange = item.change_total || 0;
      const onlineChange = item.change_online || 0;
      
      acc.totalMovement += Math.abs(totalChange);
      acc.onlineMovement += Math.abs(onlineChange);
      
      if (totalChange > 0) {
        acc.stockIncreases++;
        acc.totalAdded += totalChange;
      } else if (totalChange < 0) {
        acc.stockDecreases++;
        acc.totalSold += Math.abs(totalChange);
      }
      
      acc.actionCounts[item.action] = (acc.actionCounts[item.action] || 0) + 1;
      
      return acc;
    }, {
      totalMovement: 0,
      onlineMovement: 0,
      stockIncreases: 0,
      stockDecreases: 0,
      totalAdded: 0,
      totalSold: 0,
      actionCounts: {}
    });
    
    return stats;
  };

  const stats = getStats();

  // ✅ Enhanced export function
  const exportHistory = () => {
    if (filteredHistory.length === 0) {
      alert('No history records to export');
      return;
    }

    const csvContent = [
      ['Date & Time', 'Product', 'Action', 'Total Change', 'Online Change', 'User', 'Note'],
      ...filteredHistory.map(item => [
        formatDate(item.timestamp),
        getProductName(item),
        getActionLabel(item.action),
        item.change_total || 0,
        item.change_online || 0,
        getUserName(item),
        item.note || '-'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kerala-sellers-stock-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your stock history...</p>
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
      {/* ✅ Enhanced Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>
            <History size={28} />
            Stock Movement History
          </h1>
          <p style={styles.pageSubtitle}>
            Track all inventory changes and stock movements for your Kerala store
          </p>
        </div>
        <div style={styles.headerActions}>
          <button 
            onClick={exportHistory} 
            style={styles.exportButton} 
            disabled={filteredHistory.length === 0}
            title="Export to CSV"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button onClick={fetchHistory} style={styles.refreshButton} title="Refresh data">
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* ✅ Enhanced Statistics Cards */}
      {filteredHistory.length > 0 && (
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: '#ecfdf5'}}>
              <TrendingUp size={20} color="#059669" />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalAdded}</div>
              <div style={styles.statLabel}>Items Added</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: '#fef2f2'}}>
              <TrendingDown size={20} color="#dc2626" />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalSold}</div>
              <div style={styles.statLabel}>Items Sold</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: '#eff6ff'}}>
              <Package size={20} color="#3b82f6" />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalMovement}</div>
              <div style={styles.statLabel}>Total Movement</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: '#f3e8ff'}}>
              <FileText size={20} color="#8b5cf6" />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{filteredHistory.length}</div>
              <div style={styles.statLabel}>History Records</div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Enhanced Filters Section */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersHeader}>
          <h3 style={styles.filtersTitle}>
            <Filter size={18} />
            Filter History
          </h3>
          <div style={styles.activeFilters}>
            {filters.action !== 'all' && (
              <span style={styles.activeFilter}>
                Action: {getActionLabel(filters.action)}
                <button 
                  onClick={() => setFilters({...filters, action: 'all'})}
                  style={styles.filterRemove}
                >
                  ×
                </button>
              </span>
            )}
            {filters.product && (
              <span style={styles.activeFilter}>
                Product: {filters.product}
                <button 
                  onClick={() => setFilters({...filters, product: ''})}
                  style={styles.filterRemove}
                >
                  ×
                </button>
              </span>
            )}
            {filters.dateRange !== '30' && (
              <span style={styles.activeFilter}>
                Date: {filters.dateRange === 'all' ? 'All time' : `Last ${filters.dateRange} days`}
                <button 
                  onClick={() => setFilters({...filters, dateRange: '30'})}
                  style={styles.filterRemove}
                >
                  ×
                </button>
              </span>
            )}
          </div>
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
              <option value="CREATED">Product Added</option>
              <option value="UPDATED">Stock Updated</option>
              <option value="SALE">Item Sold</option>
              <option value="RETURN">Item Returned</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              style={styles.filterSelect}
            >
              <option value="1">Today</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Search Product</label>
            <div style={styles.searchContainer}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by product name..."
                value={filters.product}
                onChange={(e) => setFilters({...filters, product: e.target.value})}
                style={styles.searchInput}
              />
              {filters.product && (
                <button 
                  onClick={() => setFilters({...filters, product: ''})}
                  style={styles.searchClear}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Enhanced History Table */}
      <div style={styles.tableContainer}>
        {filteredHistory.length > 0 ? (
          <>
            <div style={styles.tableHeader}>
              <h3 style={styles.tableTitle}>
                Stock Movement Records ({filteredHistory.length})
              </h3>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>
                      <Calendar size={16} />
                      Date & Time
                    </th>
                    <th style={styles.th}>
                      <Package size={16} />
                      Product
                    </th>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>Total Stock</th>
                    <th style={styles.th}>Online Stock</th>
                    <th style={styles.th}>
                      <User size={16} />
                      User
                    </th>
                    <th style={styles.th}>
                      <FileText size={16} />
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((log, index) => (
                    <tr key={log.id || index} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.dateCell}>
                          <div style={styles.datePrimary}>
                            {new Date(log.timestamp).toLocaleDateString('en-IN')}
                          </div>
                          <div style={styles.dateSecondary}>
                            {new Date(log.timestamp).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.productCell}>
                          <Package size={16} color="#6b7280" />
                          <span style={styles.productName}>{getProductName(log)}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{
                          ...styles.actionCell,
                          color: getActionColor(log.action)
                        }}>
                          {getActionIcon(log.action)}
                          <span style={styles.actionLabel}>{getActionLabel(log.action)}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{
                          ...styles.changeCell,
                          color: (log.change_total || 0) >= 0 ? '#059669' : '#dc2626'
                        }}>
                          <strong>
                            {(log.change_total || 0) > 0 ? '+' : ''}{log.change_total || 0}
                          </strong>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{
                          ...styles.changeCell,
                          color: (log.change_online || 0) >= 0 ? '#059669' : '#dc2626'
                        }}>
                          <strong>
                            {(log.change_online || 0) > 0 ? '+' : ''}{log.change_online || 0}
                          </strong>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.userCell}>
                          <User size={14} color="#6b7280" />
                          <span>{getUserName(log)}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.noteCell}>
                          {log.note ? (
                            <span>{log.note}</span>
                          ) : (
                            <span style={styles.noNote}>No additional notes</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <History size={64} color="#d1d5db" />
            <h3>No stock history found</h3>
            <p>
              {filters.action !== 'all' || filters.product || filters.dateRange !== '30'
                ? 'No records match your current filters. Try adjusting the filters above.'
                : 'No stock movements have been recorded yet. Stock changes will appear here when you update inventory levels.'
              }
            </p>
            {(filters.action !== 'all' || filters.product || filters.dateRange !== '30') && (
              <button
                onClick={() => setFilters({ action: 'all', dateRange: '30', product: '' })}
                style={styles.clearFiltersButton}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ✅ CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ✅ Enhanced and properly aligned styles
const styles = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    animation: 'fadeIn 0.6s ease-out'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px',
    color: '#6b7280'
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
    minHeight: '60vh',
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
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  
  // Header
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
    margin: 0,
    lineHeight: '1.5'
  },
  
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },

  // Statistics
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },

  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.2s'
  },

  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  statContent: {
    display: 'flex',
    flexDirection: 'column'
  },

  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: '1.2'
  },

  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  // Filters
  filtersContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  filtersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
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

  activeFilters: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },

  activeFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500'
  },

  filterRemove: {
    background: 'none',
    border: 'none',
    color: '#1e40af',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '0 2px',
    marginLeft: '2px'
  },
  
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
    marginBottom: '8px'
  },
  
  filterSelect: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white',
    transition: 'border-color 0.2s'
  },

  searchContainer: {
    position: 'relative'
  },

  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280'
  },

  searchInput: {
    padding: '12px 16px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s'
  },

  searchClear: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  
  // Table
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },

  tableHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f8fafc'
  },

  tableTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },

  tableWrapper: {
    overflowX: 'auto'
  },
  
  table: { 
    width: '100%', 
    borderCollapse: 'collapse'
  },
  
  thead: {
    backgroundColor: '#f8fafc'
  },
  
  th: { 
    padding: '16px 20px',
    textAlign: 'left', 
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap'
  },
  
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s'
  },
  
  td: { 
    padding: '16px 20px',
    fontSize: '14px',
    verticalAlign: 'middle'
  },
  
  // Table cell styles
  dateCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  
  datePrimary: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937'
  },

  dateSecondary: {
    fontSize: '12px',
    color: '#6b7280'
  },
  
  productCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  productName: {
    fontWeight: '500',
    color: '#1f2937'
  },
  
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500'
  },

  actionLabel: {
    fontSize: '14px'
  },
  
  changeCell: {
    fontWeight: '600',
    fontSize: '15px',
    textAlign: 'center'
  },

  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6b7280'
  },
  
  noteCell: {
    maxWidth: '250px',
    wordBreak: 'break-word',
    fontSize: '13px',
    color: '#374151'
  },
  
  noNote: {
    color: '#9ca3af',
    fontStyle: 'italic'
  },
  
  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '20px',
    color: '#6b7280',
    textAlign: 'center',
    padding: '60px 40px'
  },
  
  clearFiltersButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '16px',
    transition: 'all 0.2s'
  }
};
