'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SellerDashboardOverview() {
  const [seller, setSeller] = useState(null);
  const [analytics, setAnalytics] = useState(null); // ✅ State for analytics
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        router.push('/login/seller');
        return;
    }

    axios.get('http://localhost:8000/user/dashboard/', {
        headers: { Authorization: `Token ${token}` },
    })
    .then((response) => {
        setSeller(response.data.seller);
        setAnalytics(response.data.analytics); // ✅ Set analytics data
    })
    .catch((error) => console.error('Error fetching dashboard data:', error))
    .finally(() => setIsLoading(false));
  }, [router]);
  
  // ✅ Function to copy the store link
  const copyStoreLink = () => {
    const storeUrl = `http://localhost:3000/shop/${seller.phone}`; // Assuming phone is the unique identifier
    navigator.clipboard.writeText(storeUrl).then(() => {
        alert('Store link copied to clipboard!');
    });
  };

  if (isLoading) return <p>Loading Dashboard...</p>;

  return (
    <div>
        <h1>Dashboard Overview</h1>
        
        {/* --- Analytics Section --- */}
        <div style={styles.statsContainer}>
            <StatCard title="Total Revenue" value={`₹${analytics?.total_revenue.toFixed(2)}`} />
            <StatCard title="Total Orders" value={analytics?.total_orders} />
            <StatCard title="Total Products" value={analytics?.total_products} />
        </div>

        {/* --- Store Link and Top Products Section --- */}
        <div style={styles.gridContainer}>
            <div style={styles.card}>
                <h3>Your Public Storefront</h3>
                <p>Share this link with your customers.</p>
                <div style={styles.linkBox}>
                    <span>{`http://localhost:3000/shop/${seller.phone}`}</span>
                    <button onClick={copyStoreLink} style={styles.copyButton}>Copy</button>
                </div>
            </div>
            <div style={styles.card}>
                <h3>Top Selling Products</h3>
                {analytics?.top_selling_products.length > 0 ? (
                    <ol style={{paddingLeft: '20px'}}>
                        {analytics.top_selling_products.map((item, index) => (
                            <li key={index}>{item.product__name} ({item.total_sold} sold)</li>
                        ))}
                    </ol>
                ) : <p>No sales data yet.</p>}
            </div>
        </div>
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
    statsContainer: { display: 'flex', gap: '20px', margin: '1.5rem 0' },
    statCard: { flex: 1, backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' },
    statTitle: { margin: 0, fontSize: '1rem', color: '#6c757d' },
    statValue: { margin: '5px 0 0', fontSize: '2rem', fontWeight: 'bold' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    card: { padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    linkBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
    copyButton: { padding: '5px 10px', border: '1px solid #ccc', cursor: 'pointer' },
};