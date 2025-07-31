'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sellerName, setSellerName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
      return;
    }

    axios.get('http://localhost:8000/user/dashboard/', {
        headers: { Authorization: `Token ${token}` },
    })
    .then(response => {
        setSellerName(response.data.seller.name);
    })
    .catch(error => {
        console.error("Failed to fetch seller data for layout", error);
        localStorage.removeItem('accessToken');
        router.push('/login/seller');
    });

  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login/seller');
  };

  const navSections = [
    {
      title: 'SALES & E-COMMERCE',
      items: [
        { name: 'Billing (POS)', href: '/dashboard/seller/billing' },
        { name: 'Products', href: '/dashboard/seller/products' },
        { name: 'Orders', href: '/dashboard/seller/orders' },
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
          {sellerName && <p style={styles.welcomeMessage}>Welcome, {sellerName}</p>}
        </div>
        
        <nav style={styles.nav}>
          <NavItem href="/dashboard/seller" name="Overview" pathname={pathname} />
          {navSections.map(section => (
            <div key={section.title} style={{ marginTop: '1.5rem' }}>
              <h3 style={styles.sectionTitle}>{section.title}</h3>
              {section.items.map(item => (
                <NavItem key={item.name} href={item.href} name={item.name} pathname={pathname} />
              ))}
            </div>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto' }}>
            <h3 style={styles.sectionTitle}>ACCOUNT</h3>
            <NavItem href="/dashboard/seller/settings" name="Settings" pathname={pathname} />
            <NavItem href="/dashboard/seller/subscription" name="Subscription" pathname={pathname} />
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
      </div>
      <main style={styles.mainContent}>
        {children}
      </main>
      {/* ✅ This closing div was missing */}
    </div>
  );
}

function NavItem({ href, name, pathname }) {
    const isActive = href === '/dashboard/seller' ? pathname === href : pathname.startsWith(href);
    return (
        <Link href={href} style={{...styles.navLink, ...(isActive ? styles.activeLink : {})}}>
            {name}
        </Link>
    );
}

const styles = {
    sidebar: { width: '250px', background: '#f8f9fa', padding: '20px', borderRight: '1px solid #dee2e6', display: 'flex', flexDirection: 'column' },
    welcomeMessage: { margin: '5px 0 2rem', color: '#6c757d' },
    nav: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    sectionTitle: { fontSize: '0.8rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', padding: '0 15px' },
    navLink: { textDecoration: 'none', color: '#212529', padding: '10px 15px', borderRadius: '5px', display: 'block' },
    activeLink: { backgroundColor: '#e9ecef', fontWeight: 'bold' },
    logoutButton: { width: '100%', padding: '10px 15px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer', borderRadius: '5px', textAlign: 'left', marginTop: '0.5rem', fontSize: '1rem' },
    mainContent: { flex: 1, padding: '20px', backgroundColor: '#fff', overflowY: 'auto' },
};