'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle } from 'lucide-react';

const NOTIFICATIONS_API = 'http://localhost:8000/api/notifications/';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { 'Authorization': `Token ${token}` };
  }, [router]);

  const fetchNotifications = useCallback(() => {
    const headers = getAuthHeaders();
    if (!headers) return;
    setIsLoading(true);
    axios.get(NOTIFICATIONS_API, { headers })
      .then(res => setNotifications(res.data.results || res.data))
      .catch(err => console.error("Failed to fetch notifications", err))
      .finally(() => setIsLoading(false));
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = (notificationId) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    axios.patch(`${NOTIFICATIONS_API}${notificationId}/mark-as-read/`, {}, { headers })
      .then(() => {
        // Update the state locally for an instant UI update
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      })
      .catch(err => alert("Could not mark as read. Please try again."));
  };

  if (isLoading) return <p>Loading notifications...</p>;

  return (
    <div>
      <h1 style={styles.title}>Notifications</h1>
      <div style={styles.notificationList}>
        {notifications.length === 0 ? (
          <p>You have no new notifications.</p>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} style={{...styles.card, ...(notification.is_read ? styles.readCard : {})}}>
              <div style={styles.icon}>
                <Bell size={24} />
              </div>
              <div style={styles.content}>
                <p>{notification.message}</p>
                <small>{new Date(notification.created_at).toLocaleString()}</small>
              </div>
              {!notification.is_read && (
                <button onClick={() => handleMarkAsRead(notification.id)} style={styles.button}>
                  <CheckCircle size={18} /> Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
    title: { marginBottom: '1.5rem' },
    notificationList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    card: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #dee2e6', borderRadius: '8px', backgroundColor: '#fff' },
    readCard: { backgroundColor: '#f8f9fa', opacity: 0.7 },
    icon: { color: '#0d6efd' },
    content: { flexGrow: 1 },
    button: { display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px solid #ccc', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' },
};