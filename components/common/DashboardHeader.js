'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';

export default function DashboardHeader({ sellerName }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login/seller');
  };

  return (
    <header style={styles.header}>
      <div>
        {/* You can add a search bar or other header elements here later */}
      </div>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e9ecef',
    marginBottom: '20px',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    color: '#495057',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '15px',
    color: '#6c757d',
  }
};