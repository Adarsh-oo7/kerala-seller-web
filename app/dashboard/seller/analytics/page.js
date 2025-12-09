'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../../../../styles/DashboardAnalytics.css'

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Star
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const getApiBaseUrl = () => {
    // 1. Check explicit env vars first
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
        return envUrl.trim();
    }
    
    // 2. In browser, detect based on hostname (safer than NODE_ENV)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
        // Production domains
        return 'https://api.keralasellers.in';
    }
    
    // 3. Server-side fallback to production
    return 'https://api.keralasellers.in';
};

const API_BASE_URL = getApiBaseUrl();
const ORDERS_API_URL = `${API_BASE_URL}/user/orders/`;
const PRODUCTS_API_URL = `${API_BASE_URL}/api/products/`;

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      avgOrderValue: 0,
      revenueChange: 0,
      ordersChange: 0
    },
    orders: [],
    products: [],
    recentActivity: [],
    topProducts: [],
    salesTrend: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // Default to last 30 days
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Authentication headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  // ✅ Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError('Please log in to view analytics');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Fetch orders and products data
      const [ordersResponse, productsResponse] = await Promise.all([
        axios.get(ORDERS_API_URL, { headers }),
        axios.get(PRODUCTS_API_URL, { headers })
      ]);

      const orders = ordersResponse.data.results || ordersResponse.data || [];
      const products = productsResponse.data.results || productsResponse.data || [];

      console.log(`📊 Analytics data: ${orders.length} orders, ${products.length} products`);

      // Process analytics data
      const processedAnalytics = processAnalyticsData(orders, products, parseInt(dateRange));
      setAnalytics(processedAnalytics);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login/seller';
        }, 2000);
      } else {
        setError('Failed to load analytics. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, dateRange]);

  // ✅ Process raw data into analytics
  const processAnalyticsData = (orders, products, days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Filter orders by date range
    const filteredOrders = orders.filter(order =>
      new Date(order.created_at) >= cutoffDate && order.status === 'DELIVERED'
    );

    const previousCutoffDate = new Date();
    previousCutoffDate.setDate(previousCutoffDate.getDate() - (days * 2));

    const previousOrders = orders.filter(order =>
      new Date(order.created_at) >= previousCutoffDate &&
      new Date(order.created_at) < cutoffDate &&
      order.status === 'DELIVERED'
    );

    // Calculate overview metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const revenueChange = previousRevenue === 0 ? 100 : ((totalRevenue - previousRevenue) / previousRevenue) * 100;

    const totalOrders = filteredOrders.length;
    const previousOrdersCount = previousOrders.length;
    const ordersChange = previousOrdersCount === 0 ? 100 : ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate product performance
    const productSales = {};
    filteredOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productId = item.product?.id || item.product_id;
          const productName = item.product?.name || item.product_name || 'Unknown Product';
          const quantity = parseInt(item.quantity || 0);
          const revenue = parseFloat(item.price || 0) * quantity;

          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: productName,
              quantity: 0,
              revenue: 0,
              orders: 0
            };
          }
          productSales[productId].quantity += quantity;
          productSales[productId].revenue += revenue;
          productSales[productId].orders++;
        });
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Generate sales trend (daily for last 7 days, weekly for longer periods)
    const salesTrend = generateSalesTrend(filteredOrders, days);

    // Recent activity
    const recentActivity = orders
      .slice(0, 10)
      .map(order => ({
        type: 'order',
        title: `Order #${order.id}`,
        description: `₹${parseFloat(order.total_amount).toFixed(2)} - ${order.customer_name}`,
        time: order.created_at,
        status: order.status
      }));

    return {
      overview: {
        totalRevenue,
        totalOrders,
        totalProducts: products.length,
        avgOrderValue,
        revenueChange,
        ordersChange
      },
      orders: filteredOrders,
      products,
      recentActivity,
      topProducts,
      salesTrend
    };
  };

  // ✅ Generate sales trend data
  const generateSalesTrend = (orders, days) => {
    const trend = [];
    const now = new Date();

    if (days <= 7) {
      // Daily trend for last 7 days
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= date && orderDate < nextDay;
        });

        const revenue = dayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

        trend.push({
          date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          revenue,
          orders: dayOrders.length
        });
      }
    } else {
      // Weekly trend for longer periods
      const weeksToShow = Math.min(Math.ceil(days / 7), 8);

      for (let i = weeksToShow - 1; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - (now.getDay()));
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= weekStart && orderDate < weekEnd;
        });

        const revenue = weekOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

        trend.push({
          date: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
          revenue,
          orders: weekOrders.length
        });
      }
    }

    return trend;
  };

  // ✅ Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  // ✅ Export analytics
  const exportAnalytics = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Revenue', `₹${analytics.overview.totalRevenue.toFixed(2)}`],
      ['Total Orders', analytics.overview.totalOrders],
      ['Total Products', analytics.overview.totalProducts],
      ['Average Order Value', `₹${analytics.overview.avgOrderValue.toFixed(2)}`],
      ['Revenue Change', `${analytics.overview.revenueChange.toFixed(1)}%`],
      ['Orders Change', `${analytics.overview.ordersChange.toFixed(1)}%`],
      [],
      ['Top Products', ''],
      ['Product Name', 'Revenue', 'Quantity Sold', 'Orders'],
      ...analytics.topProducts.map(product => [
        product.name,
        `₹${product.revenue.toFixed(2)}`,
        product.quantity,
        product.orders
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchAnalytics} style={styles.retryButton}>
          <RefreshCw size={18} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className='dashboardanalyticspagecontainer' style={styles.pageContainer}>
      {/* Header */}
      <div className='dashboardanalyticspageheader' style={styles.header}>
        <div>
          <h1 className='dashboardanalyticstitle' style={styles.pageTitle}>
            <BarChart3 className='dashboardanalyticspackageicon' size={28} />
            Analytics Dashboard
          </h1>
          <p className='dashboardanalyticssubtitle' style={styles.pageSubtitle}>
            Track your store's performance and growth metrics
          </p>
        </div>
        <div style={styles.headerActions}>
          <select
            className='dashboardanalyticsdrpdwn'
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={styles.dateSelect}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <button className='dashboardanalyticsrefreshbtn' onClick={exportAnalytics} style={styles.exportButton}>
            <Download className='dashboardanalyticsbellicon' size={18} />
            Export
          </button>
          <button className='dashboardanalyticsrefreshbtn' onClick={handleRefresh} style={styles.refreshButton} disabled={refreshing}>
            <RefreshCw
              size={18}
              className={`dashboardanalyticsbellicon ${refreshing ? 'spin' : ''}`}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className='dashboardanalyticsoverviewgrid' style={styles.overviewGrid}>
        <div className='dashboardanalyticsoverviewcard' style={styles.overviewCard}>
          <div style={styles.cardHeader}>
            <div className='dashboardanalyticsoverviewcardtitle' style={styles.cardTitle}>Total Revenue</div>
            <DollarSign size={20} color="#059669" />
          </div>
          <div className='dashboardanalyticsoverviewcardvalue' style={styles.cardValue}>₹{analytics.overview.totalRevenue.toLocaleString('en-IN')}</div>
          <div className='dashboardanalyticsoverviewcardchange' style={styles.cardChange}>
            {analytics.overview.revenueChange >= 0 ? (
              <ArrowUpRight size={16} color="#059669" />
            ) : (
              <ArrowDownRight size={16} color="#dc2626" />
            )}
            <span style={{
              color: analytics.overview.revenueChange >= 0 ? '#059669' : '#dc2626'
            }}>
              {Math.abs(analytics.overview.revenueChange).toFixed(1)}% vs previous period
            </span>
          </div>
        </div>

        <div className='dashboardanalyticsoverviewcard' style={styles.overviewCard}>
          <div style={styles.cardHeader}>
            <div className='dashboardanalyticsoverviewcardtitle' style={styles.cardTitle}>Total Orders</div>
            <ShoppingCart size={20} color="#3b82f6" />
          </div>
          <div className='dashboardanalyticsoverviewcardvalue' style={styles.cardValue}>{analytics.overview.totalOrders.toLocaleString()}</div>
          <div className='dashboardanalyticsoverviewcardchange' style={styles.cardChange}>
            {analytics.overview.ordersChange >= 0 ? (
              <ArrowUpRight size={16} color="#059669" />
            ) : (
              <ArrowDownRight size={16} color="#dc2626" />
            )}
            <span style={{
              color: analytics.overview.ordersChange >= 0 ? '#059669' : '#dc2626'
            }}>
              {Math.abs(analytics.overview.ordersChange).toFixed(1)}% vs previous period
            </span>
          </div>
        </div>

        <div className='dashboardanalyticsoverviewcard' style={styles.overviewCard}>
          <div style={styles.cardHeader}>
            <div className='dashboardanalyticsoverviewcardtitle' style={styles.cardTitle}>Average Order Value</div>
            <Target size={20} color="#8b5cf6" />
          </div>
          <div className='dashboardanalyticsoverviewcardvalue' style={styles.cardValue}>₹{analytics.overview.avgOrderValue.toFixed(0)}</div>
          <div className='dashboardanalyticsoverviewcardchange' style={styles.cardChange}>
            <Clock size={16} color="#6b7280" />
            <span style={{ color: '#6b7280' }}>
              Per completed order
            </span>
          </div>
        </div>

        <div className='dashboardanalyticsoverviewcard' style={styles.overviewCard}>
          <div style={styles.cardHeader}>
            <div className='dashboardanalyticsoverviewcardtitle' style={styles.cardTitle}>Total Products</div>
            <Package size={20} color="#f59e0b" />
          </div>
          <div className='dashboardanalyticsoverviewcardvalue' style={styles.cardValue}>{analytics.overview.totalProducts}</div>
          <div className='dashboardanalyticsoverviewcardchange' style={styles.cardChange}>
            <Eye size={16} color="#6b7280" />
            <span style={{ color: '#6b7280' }}>
              Active in catalog
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className='dashboardanalyticschartgrid' style={styles.chartsGrid}>
        {/* Sales Trend Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 className='dashboardanalyticscharttitle' style={styles.chartTitle}>
              <TrendingUp size={20} color='#267918ff' />
              Sales Trend
            </h3>
          </div>
          <div style={styles.chartContent}>
            {analytics.salesTrend.length > 0 ? (
              <div style={styles.trendChart}>
                {analytics.salesTrend.map((point, index) => {
                  const maxRevenue = Math.max(...analytics.salesTrend.map(p => p.revenue));
                  const height = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;

                  return (
                    <div key={index} style={styles.trendBar}>
                      <div
                        style={{
                          ...styles.trendBarFill,
                          height: `${height}%`
                        }}
                        title={`₹${point.revenue.toFixed(0)} (${point.orders} orders)`}
                      />
                      <div style={styles.trendBarLabel}>{point.date}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={styles.emptyChart}>
                <BarChart3 size={48} />
                <p>No sales data for selected period</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 className='dashboardanalyticscharttitle' style={styles.chartTitle}>
              <Star size={20} color='#f5ee2dff' />
              Top Products
            </h3>
          </div>
          <div style={styles.chartContent}>
            {analytics.topProducts.length > 0 ? (
              <div style={styles.topProductsList}>
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} style={styles.topProductItem}>
                    <div style={styles.productRank}>#{index + 1}</div>
                    <div style={styles.productInfo}>
                      <div style={styles.productName}>{product.name}</div>
                      <div style={styles.productStats}>
                        {product.quantity} units • ₹{product.revenue.toFixed(0)}
                      </div>
                    </div>
                    <div style={styles.productRevenue}>
                      ₹{product.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyChart}>
                <Package size={48} />
                <p>No product sales data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.activityCard}>
        <div style={styles.activityHeader}>
          <h3 style={styles.activityTitle}>
            <Clock size={20} />
            Recent Activity
          </h3>
        </div>
        <div style={styles.activityContent}>
          {analytics.recentActivity.length > 0 ? (
            <div style={styles.activityList}>
              {analytics.recentActivity.slice(0, 8).map((activity, index) => (
                <div className="dashboardanalyticsactivity-item" key={index} style={styles.activityItem}>
                  <div style={styles.activityIcon}>
                    <ShoppingCart size={16} />
                  </div>
                  <div style={styles.activityDetails}>
                    <div className='dashboardanalyticsactivityitemtitle' style={styles.activityitemTitle}>{activity.title}</div>
                    <div className='dashboardanalyticsactivitydescription' style={styles.activityDescription}>{activity.description}</div>
                  </div>
                  <div className="dashboardanalyticsactivity-time" style={styles.activityTime}>
                    {new Date(activity.time).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className='dashboardanalyticsactivity-status' style={{
                    ...styles.activityStatus,
                    backgroundColor: activity.status === 'DELIVERED' ? '#d1fae5' :
                      activity.status === 'PENDING' ? '#fef3c7' : '#dfed201f',
                    color: activity.status === 'DELIVERED' ? '#065f46' :
                      activity.status === 'PENDING' ? '#bbb817ff' : '#b82323ff'
                  }}>
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyActivity}>
              <Clock size={48} />
              <p>No recent activity</p>
            </div>
          )}
        </div>
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

        .spin {
          animation: spin 1s linear infinite;
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
    color: 'rgb(23, 94, 84)',
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
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },

  dateSelect: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'rgb(255, 238, 175)'
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

  // Overview Cards
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },

  overviewCard: {
    backgroundColor: 'rgb(253, 255, 240)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(42, 108, 72, 0.3)',
    boxShadow: 'rgba(42, 108, 72, 0.3) 0px 4px 12px'
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  cardTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280'
  },

  cardValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },

  cardChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px'
  },

  // Charts Section
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },

  chartCard: {
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    border: '1px solid rgba(42, 108, 72, 0.3)',
    boxShadow: 'rgba(42, 108, 72, 0.3) 0px 4px 12px',
    overflow: 'hidden'
  },

  chartHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #f3f4f6'
  },

  chartTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },

  chartContent: {
    padding: '24px'
  },

  // Trend Chart
  trendChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    height: '200px',
    padding: '0 4px'
  },

  trendBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%'
  },

  trendBarFill: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '4px 4px 0 0',
    minHeight: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  trendBarLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
    textAlign: 'center'
  },

  // Top Products
  topProductsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  topProductItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#0c470912',
    borderRadius: '8px'
  },

  productRank: {
    width: '24px',
    height: '24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600'
  },

  productInfo: {
    flex: 1
  },

  productName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937'
  },

  productStats: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  },

  productRevenue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#059669'
  },

  // Empty States
  emptyChart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '12px',
    color: '#6b7280'
  },

  // Recent Activity
  activityCard: {
    backgroundColor: '#FDFFF0',
    borderRadius: '12px',
    border: '1px solid rgba(42, 108, 72, 0.3)',
    boxShadow: 'rgba(42, 108, 72, 0.3) 0px 4px 12px',
    overflow: 'hidden'
  },

  activityHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #f3f4f6'
  },

  activityTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },

  activityitemTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '17px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  activityDescription: {
    fontSize: '15px',
  },

  activityContent: {
    padding: '24px'
  },

  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#0c470912',
    borderRadius: '8px'
  },

  activityIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: 'rgb(23, 94, 84)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  activityDetails: {
    flex: 1
  },

  activityTime: {
    fontSize: '12px',
    color: '#6b7280'
  },

  activityStatus: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },

  emptyActivity: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '12px',
    color: '#6b7280'
  }
};
