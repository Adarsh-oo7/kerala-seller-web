'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login/seller');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login/seller');
  };

  // ✅ Add the "Overview" link
  const navItems = [
    { name: 'Overview', href: '/dashboard/seller' },
    { name: 'Products', href: '/dashboard/seller/products' },
    { name: 'Orders', href: '/dashboard/seller/orders' },
    { name: 'Settings', href: '/dashboard/seller/settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: '250px', background: '#f8f9fa', padding: '20px', borderRight: '1px solid #dee2e6' }}>
        <h2 style={{ marginBottom: '2rem' }}>Seller Panel</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {navItems.map((item) => {
              // Exact match for overview, startsWith for others
              const isActive = item.href === '/dashboard/seller' 
                ? pathname === item.href 
                : pathname.startsWith(item.href);

              return (
                <li key={item.name} style={{ marginBottom: '1rem' }}>
                  <Link href={item.href} style={{ 
                    textDecoration: 'none', 
                    color: isActive ? '#0d6efd' : '#212529',
                    fontWeight: isActive ? 'bold' : 'normal'
                  }}>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div style={{ position: 'absolute', bottom: '20px', width: '210px' }}>
            <button onClick={handleLogout} style={{ width: '100%', padding: '10px', border: 'none', backgroundColor: '#dc3545', color: '#fff', cursor: 'pointer', borderRadius: '5px' }}>
                Logout
            </button>
        </div>
      </div>
      <main style={{ flex: 1, padding: '20px', backgroundColor: '#fff' }}>
        {children}
      </main>
    </div>
  );
}