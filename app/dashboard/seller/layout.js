'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DashboardHeader from '../../../components/common/DashboardHeader';

const PROFILE_API_URL = 'http://localhost:8000/user/store/profile/';
const DASHBOARD_API_URL = 'http://localhost:8000/user/dashboard/';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sellerName, setSellerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // State for notification counts
  const [notificationCounts, setNotificationCounts] = useState({
    orders: 0,
    notifications: 0
  });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return null;
    }
    return { Authorization: `Token ${token}` };
  }, [router]);

  useEffect(() => {
    const headers = getAuthHeaders();
    if (!headers) return;

    // Fetch both profile and dashboard data at the same time
    Promise.all([
        axios.get(PROFILE_API_URL, { headers }),
        axios.get(DASHBOARD_API_URL, { headers })
    ]).then(([profileRes, dashRes]) => {
        setSellerName(profileRes.data.name || 'Seller');
        
        // Set notification counts from dashboard data
        if (dashRes.data.analytics) {
            setNotificationCounts({
                orders: dashRes.data.analytics.new_orders_count || 0,
                notifications: dashRes.data.analytics.unread_notifications_count || 0,
            });
        }

        // Enforce profile completion
        const isComplete = profileRes.data.is_profile_complete;
        if (!isComplete && pathname !== '/dashboard/seller/settings') {
            router.push('/dashboard/seller/settings');
        } else {
            setIsLoading(false);
        }
    }).catch(error => {
        console.error("Authentication failed, removing token.", error);
        // This is the crucial fix for the infinite loop
        localStorage.removeItem('accessToken');
        router.push('/login/seller');
    });

  }, [pathname, router, getAuthHeaders]);

  if (isLoading) {
    return <p style={{textAlign: 'center', marginTop: '50px'}}>Verifying your profile...</p>;
  }

  const navSections = [
    {
      title: 'SALES & E-COMMERCE',
      items: [
        { name: 'Products', href: '/dashboard/seller/products' },
        { name: 'Orders', href: '/dashboard/seller/orders', count: notificationCounts.orders },
        { name: 'Notifications', href: '/dashboard/seller/notifications', count: notificationCounts.notifications },
      ]
    },
    {
      title: 'INVENTORY',
      items: [
        { name: 'Stock', href: '/dashboard/seller/stock' },
        { name: 'History', href: '/dashboard/seller/history' },
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={styles.sidebar}>
        <div>
          <h2 style={{ margin: 0 }}>Seller Panel</h2>
          <p style={styles.welcomeMessage}>Welcome, {sellerName}</p>
        </div>
        <nav style={styles.nav}>
          <NavItem href="/dashboard/seller" name="Overview" pathname={pathname} />
          <NavItem href="/dashboard/seller/billing" name="Local Billing" pathname={pathname} />
          {navSections.map(section => (
            <div key={section.title} style={{ marginTop: '1.5rem' }}>
              <h3 style={styles.sectionTitle}>{section.title}</h3>
              {section.items.map(item => (
                <NavItem key={item.name} href={item.href} name={item.name} pathname={pathname} count={item.count} />
              ))}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <h3 style={styles.sectionTitle}>ACCOUNT</h3>
          <NavItem href="/dashboard/seller/settings" name="Settings" pathname={pathname} />
          <NavItem href="/dashboard/seller/subscription" name="Subscription" pathname={pathname} />
        </div>
      </div>
      <div style={styles.mainContentWrapper}>
        <DashboardHeader sellerName={sellerName} />
        <main style={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}

// Updated NavItem to display an indicator
function NavItem({ href, name, pathname, count = 0 }) {
    const isActive = href === '/dashboard/seller' ? pathname === href : pathname.startsWith(href);
    return (
        <Link href={href} style={{...styles.navLink, ...(isActive ? styles.activeLink : {})}}>
            <span>{name}</span>
            {count > 0 && <span style={styles.indicator}>{count}</span>}
        </Link>
    );
}

const styles = {
    sidebar: { width: '250px', background: '#f8f9fa', padding: '20px', borderRight: '1px solid #dee2e6', display: 'flex', flexDirection: 'column' },
    welcomeMessage: { margin: '5px 0 2rem', color: '#6c757d' },
    nav: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    sectionTitle: { fontSize: '0.8rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', padding: '0 15px' },
    navLink: { textDecoration: 'none', color: '#212529', padding: '10px 15px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    activeLink: { backgroundColor: '#e9ecef', fontWeight: 'bold' },
    indicator: { backgroundColor: '#dc3545', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    mainContentWrapper: { flex: 1, display: 'flex', flexDirection: 'column' },
    mainContent: { flex: 1, padding: '20px', backgroundColor: '#fff', overflowY: 'auto' },
};