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

    // ✅ CORRECTED API URL for dashboard info
    axios.get('http://localhost:8000/user/dashboard/', {
        headers: { Authorization: `Token ${token}` },
    })
    .then(response => {
        setSellerName(response.data.seller.name);
    })
    .catch(error => {
        console.error("Failed to fetch seller data", error);
        localStorage.removeItem('accessToken');
        router.push('/login/seller');
    });

  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login/seller');
  };

  const navItems = [
    { name: 'Products', href: '/dashboard/seller/products' },
    // Add other links like Orders here later
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ width: '250px', background: '#f8f9fa', padding: '20px', borderRight: '1px solid #dee2e6' }}>
        <div style={{marginBottom: '2rem'}}>
            <h2 style={{ margin: 0 }}>Seller Panel</h2>
            {sellerName && <p style={{ margin: '5px 0 0', color: '#6c757d' }}>Welcome, {sellerName}</p>}
        </div>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {navItems.map((item) => (
              <li key={item.name} style={{ marginBottom: '1rem' }}>
                <Link href={item.href} style={{ textDecoration: 'none', color: pathname.startsWith(item.href) ? '#0d6efd' : '#212529' }}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <main style={{ flex: 1, padding: '20px', backgroundColor: '#fff' }}>
        {children}
      </main>
    </div>
  );
}