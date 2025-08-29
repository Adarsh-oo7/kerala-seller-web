'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DASHBOARD_URL = 'http://localhost:8000/user/dashboard/';

// --- Sub-component for the "Setup Your Store" prompt ---
function SetupStorePrompt() {
    return (
        <div style={styles.setupCard}>
            <h3>Your store is not yet active!</h3>
            <p>Complete your store setup to start selling and make your shop visible to customers.</p>
            <Link href="/dashboard/seller/settings" style={styles.setupButton}>
                Setup Your Store Now
            </Link>
        </div>
    );
}


// --- Main Dashboard Page Component ---
export default function SellerDashboardOverview() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        router.push('/login/seller');
        return;
    }
    setIsLoading(true);
    axios.get(DASHBOARD_URL, { headers: { Authorization: `Token ${token}` } })
        .then(res => setDashboardData(res.data))
        .catch(err => console.error("Failed to fetch dashboard data", err))
        .finally(() => setIsLoading(false));
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const copyStoreLink = () => {
    const storeUrl = `http://localhost:3000/shop/${dashboardData.seller.phone}`;
    navigator.clipboard.writeText(storeUrl).then(() => {
        alert('Store link copied to clipboard!');
    });
  };

  if (isLoading) return <p>Loading Dashboard...</p>;
  if (!dashboardData) return <p>Could not load dashboard data.</p>;

  return (
    <div>
        <h1>Dashboard Overview</h1>
        <p>Welcome, {dashboardData.seller?.name || 'Seller'}</p>

        {/* ✅ This is the corrected conditional logic */}
        {dashboardData.has_store_profile ? (
            <>
                <div style={styles.statsContainer}>
                    <StatCard title="Total Revenue" value={`₹${(dashboardData.analytics?.total_revenue || 0).toFixed(2)}`} />
                    <StatCard title="Total Orders" value={dashboardData.analytics?.total_orders || 0} />
                    <StatCard title="Total Products" value={dashboardData.analytics?.total_products || 0} />
                </div>
                <div style={styles.gridContainer}>
                    <div style={styles.card}>
                        <h3>Your Public Storefront</h3>
                        <p>Share this link with your customers.</p>
                        <div style={styles.linkBox}>
                            <span>{`http://localhost:3000/shop/${dashboardData.seller.phone}`}</span>
                            <button onClick={copyStoreLink} style={styles.copyButton}>Copy</button>
                        </div>
                    </div>
                    <div style={styles.card}>
                        <h3>Top Selling Products</h3>
                        {dashboardData.analytics?.top_selling_products?.length > 0 ? (
                            <ol style={{paddingLeft: '20px'}}>
                            {dashboardData.analytics.top_selling_products.map((item, index) => (
                                <li key={index}>{item.product__name} ({item.total_sold} sold)</li>
                            ))}
                            </ol>
                        ) : <p>No sales data yet.</p>}
                    </div>
                </div>
            </>
        ) : (
            <SetupStorePrompt />
        )}
    </div>
  );
}

// Helper component for stat cards
function StatCard({ title, value }) {
    return (
        <div style={styles.statCard}>
            <h3 style={styles.statTitle}>{title}</h3>
            <p style={styles.statValue}>{value}</p>
        </div>
    );
}

const styles = {
    setupCard: { backgroundColor: '#fffbe6', border: '1px solid #facc15', borderRadius: '8px', padding: '20px', margin: '20px 0', textAlign: 'center' },
    setupButton: { display: 'inline-block', marginTop: '10px', padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' },
    statsContainer: { display: 'flex', gap: '20px', margin: '1.5rem 0' },
    statCard: { flex: 1, backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' },
    statTitle: { margin: 0, fontSize: '1rem', color: '#6c757d' },
    statValue: { margin: '5px 0 0', fontSize: '2rem', fontWeight: 'bold' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    card: { padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    linkBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '10px' },
    copyButton: { padding: '5px 10px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: '#f8f9fa' },
};