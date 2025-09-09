'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  IndianRupee, 
  ShoppingCart, 
  Clock, 
  Filter,
  RefreshCw,
  Trash2,
  MoreVertical
} from 'lucide-react';

// ✅ Using environment variables for API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const NOTIFICATIONS_API = `${API_BASE_URL}/api/notifications/`;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { 'Authorization': `Token ${token}` };
  }, [router]);

  const fetchNotifications = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching notifications from:', NOTIFICATIONS_API);
      const response = await axios.get(NOTIFICATIONS_API, { headers });
      
      const notificationData = response.data.results || response.data || [];
      console.log('Notifications fetched:', notificationData);
      
      setNotifications(notificationData);
      setFilteredNotifications(notificationData);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      if (error.response?.status === 401) {
        router.push('/login/seller');
      } else {
        setError('Failed to load notifications. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, router]);

  // Apply filter whenever filter changes
  useEffect(() => {
    let filtered = [...notifications];
    
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.is_read);
        break;
      case 'read':
        filtered = filtered.filter(n => n.is_read);
        break;
      default:
        // 'all' - no filtering needed
        break;
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setIsProcessing(true);
    
    try {
      await axios.patch(`${NOTIFICATIONS_API}${notificationId}/mark-as-read/`, {}, { headers });
      
      // Update the state locally for instant UI update
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
      setError('Could not mark notification as read. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    const unreadNotifications = notifications.filter(n => !n.is_read);
    if (unreadNotifications.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(notification =>
          axios.patch(`${NOTIFICATIONS_API}${notification.id}/mark-as-read/`, {}, { headers })
        )
      );
      
      // Update all notifications as read
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      setError('Could not mark all notifications as read. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const getNotificationIcon = (message) => {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('order')) {
      return <ShoppingCart size={20} color="#3b82f6" />;
    } else if (lowercaseMessage.includes('payment') || lowercaseMessage.includes('payout')) {
      return <IndianRupee size={20} color="#059669" />;
    } else if (lowercaseMessage.includes('product') || lowercaseMessage.includes('stock')) {
      return <Package size={20} color="#8b5cf6" />;
    } else {
      return <Bell size={20} color="#6b7280" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = diff / (1000 * 60 * 60);
    const days = diff / (1000 * 60 * 60 * 24);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    } else if (days < 7) {
      return `${Math.floor(days)}d ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getUnreadCount = () => notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} />
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchNotifications} style={styles.retryButton}>
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
            <Bell size={28} />
            Notifications
            {getUnreadCount() > 0 && (
              <span style={styles.unreadBadge}>{getUnreadCount()}</span>
            )}
          </h1>
          <p style={styles.pageSubtitle}>
            Stay updated with your store activities and important updates
          </p>
        </div>
        <div style={styles.headerActions}>
          {getUnreadCount() > 0 && (
            <button 
              onClick={handleMarkAllAsRead} 
              style={styles.markAllButton}
              disabled={isProcessing}
            >
              <CheckCircle size={18} />
              Mark All Read
            </button>
          )}
          <button onClick={fetchNotifications} style={styles.refreshButton}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.filterTabs}>
          <button 
            onClick={() => setFilter('all')}
            style={{
              ...styles.filterTab,
              ...(filter === 'all' ? styles.activeFilterTab : {})
            }}
          >
            All ({notifications.length})
          </button>
          <button 
            onClick={() => setFilter('unread')}
            style={{
              ...styles.filterTab,
              ...(filter === 'unread' ? styles.activeFilterTab : {})
            }}
          >
            Unread ({getUnreadCount()})
          </button>
          <button 
            onClick={() => setFilter('read')}
            style={{
              ...styles.filterTab,
              ...(filter === 'read' ? styles.activeFilterTab : {})
            }}
          >
            Read ({notifications.length - getUnreadCount()})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={styles.notificationList}>
        {filteredNotifications.length === 0 ? (
          <div style={styles.emptyState}>
            <Bell size={48} />
            <h3>
              {filter === 'unread' 
                ? 'No unread notifications' 
                : filter === 'read' 
                ? 'No read notifications'
                : 'No notifications yet'}
            </h3>
            <p>
              {filter === 'unread' 
                ? 'All caught up! You have no new notifications.'
                : filter === 'read'
                ? 'No notifications have been read yet.'
                : 'New notifications will appear here when you receive them.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              style={{
                ...styles.notificationCard, 
                ...(notification.is_read ? styles.readCard : styles.unreadCard)
              }}
            >
              <div style={styles.notificationIcon}>
                {getNotificationIcon(notification.message)}
                {!notification.is_read && <div style={styles.unreadDot}></div>}
              </div>
              
              <div style={styles.notificationContent}>
                <p style={styles.notificationMessage}>
                  {notification.message}
                </p>
                <div style={styles.notificationMeta}>
                  <Clock size={12} />
                  <span>{formatTime(notification.created_at)}</span>
                </div>
              </div>
              
              <div style={styles.notificationActions}>
                {!notification.is_read && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)} 
                    style={styles.markReadButton}
                    disabled={isProcessing}
                    title="Mark as read"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
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
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1000px',
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
  
  unreadBadge: {
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '12px',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '20px',
    textAlign: 'center'
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
  
  markAllButton: {
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
  
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#991b1b',
    marginBottom: '20px'
  },
  
  filtersContainer: {
    marginBottom: '24px'
  },
  
  filterTabs: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '4px'
  },
  
  filterTab: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  
  activeFilterTab: {
    backgroundColor: 'white',
    color: '#1f2937',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  
  notificationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  
  notificationCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  
  unreadCard: {
    backgroundColor: '#fefce8',
    borderColor: '#facc15'
  },
  
  readCard: {
    opacity: 0.8
  },
  
  notificationIcon: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: '#f8fafc',
    borderRadius: '50%',
    flexShrink: 0
  },
  
  unreadDot: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    border: '2px solid white'
  },
  
  notificationContent: {
    flex: 1,
    minWidth: 0
  },
  
  notificationMessage: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1f2937',
    margin: '0 0 8px 0',
    lineHeight: '1.5'
  },
  
  notificationMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6b7280'
  },
  
  notificationActions: {
    display: 'flex',
    gap: '8px'
  },
  
  markReadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#059669',
    transition: 'all 0.2s'
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
  }
};
