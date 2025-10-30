'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Menu } from 'lucide-react';
import '../../styles/DashboardSellerPage.css'

export default function DashboardHeader({ sellerName, onToggleSidebar }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    handleResize(); // run initially
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login/seller');
  };

  return (
    <header style={styles.header}>
      {/* ✅ Hamburger button (mobile only) */}
      {isMobile && (
        <button
          onClick={onToggleSidebar}
          style={styles.menuButton}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
      )}

      <div style={styles.spacer}></div>

      <div style={styles.userMenu}>
        <User size={18} style={{ marginRight: '8px' }} />
        <span>{sellerName || 'Seller'}</span>
        <button onClick={handleLogout} style={styles.logoutButton} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#175E54',
    borderBottom: '1px solid #e9ecef',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 15,
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '22px',
  },
  spacer: {
    flex: 1,
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    color: 'white',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '15px',
    color: 'white',
  },
};
