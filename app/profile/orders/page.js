'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { Package, ArrowLeft, Search, ShoppingBag } from 'lucide-react';

const ORDERS_API_URL = 'http://localhost:8000/user/orders/history/';

export default function BuyerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('buyerAccessToken');
        if (!token) {
            router.push('/login/buyer');
            return null;
        }
        return { 'Authorization': `Bearer ${token}` };
    }, [router]);

    useEffect(() => {
        const headers = getAuthHeaders();
        if (!headers) return;

        axios.get(ORDERS_API_URL, { headers })
            .then(res => {
                const orderData = res.data.results || res.data || [];
                setOrders(orderData);
                setFilteredOrders(orderData);
            })
            .catch(err => console.error("Failed to fetch order history", err))
            .finally(() => setIsLoading(false));
    }, [getAuthHeaders]);

    useEffect(() => {
        let filtered = orders;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status?.toLowerCase() === statusFilter.toLowerCase());
        }
        if (searchQuery) {
            filtered = filtered.filter(order =>
                order.id.toString().includes(searchQuery) ||
                order.items?.some(item => item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        setFilteredOrders(filtered);
    }, [orders, statusFilter, searchQuery]);
    
    const getStatusStyle = (status) => { /* ... (Your styling function is correct) ... */ };

    if (isLoading) return <p style={styles.message}>Loading your orders...</p>;

    return (
        <div>
            <Header />
            <div style={styles.container}>
                <div style={styles.header}>
                    <Link href="/profile" style={styles.backLink}><ArrowLeft size={20}/> Back to Profile</Link>
                    <h1 style={styles.title}>My Orders</h1>
                </div>

                <div style={styles.filtersSection}>
                    <div style={styles.searchBox}>
                        <Search size={18} />
                        <input type="text" placeholder="Search by Order ID or Product..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput}/>
                    </div>
                    <div style={styles.filterTabs}>
                        {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <button key={status} onClick={() => setStatusFilter(status)} style={{...styles.filterTab, ...(statusFilter === status ? styles.activeFilterTab : {})}}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div style={styles.emptyState}>
                        <ShoppingBag size={64} />
                        <h3>No orders found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div style={styles.orderList}>
                        {filteredOrders.map(order => (
                            <div key={order.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div>
                                        <h3 style={{margin: 0}}>Order #{order.id}</h3>
                                        <span style={styles.date}>Placed on: {new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <strong style={styles.total}>₹{order.total_amount}</strong>
                                </div>
                                <div style={styles.cardBody}>
                                    <p><strong>Status:</strong> <span style={{...styles.statusBadge, ...getStatusStyle(order.status)}}>{order.status}</span></p>
                                    <h4 style={styles.itemsHeader}>Items ({order.items.length}):</h4>
                                    <ul style={styles.itemList}>
                                        {order.items.slice(0, 2).map(item => <li key={item.id}>{item.quantity} x {item.product?.name || 'Item'}</li>)}
                                        {order.items.length > 2 && <li>...and {order.items.length - 2} more</li>}
                                    </ul>
                                </div>
                                <div style={styles.cardFooter}>
                                    <Link href={`/profile/orders/${order.id}`} style={styles.button}>View Details</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

const styles = {
    message: { textAlign: 'center', marginTop: '50px' },
    container: { maxWidth: '800px', margin: '40px auto', padding: '20px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' },
    backLink: { textDecoration: 'none', color: '#0d6efd', display: 'flex', alignItems: 'center', gap: '5px' },
    title: { textAlign: 'center', flexGrow: 1 },
    filtersSection: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    searchBox: { position: 'relative', marginBottom: '16px' },
    searchInput: { width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #ccc', borderRadius: '8px' },
    filterTabs: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    filterTab: { padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '20px', cursor: 'pointer' },
    activeFilterTab: { backgroundColor: '#3b82f6', color: 'white' },
    emptyState: { textAlign: 'center', padding: '40px' },
    orderList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { border: '1px solid #dee2e6', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #eee' },
    cardBody: { padding: '15px 20px' },
    cardFooter: { padding: '15px 20px', borderTop: '1px solid #eee', textAlign: 'right' },
    date: { color: '#6c757d', fontSize: '0.9rem' },
    total: { fontSize: '1.2rem', fontWeight: 'bold' },
    statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' },
    itemsHeader: { marginTop: '15px', marginBottom: '5px' },
    itemList: { paddingLeft: '20px', margin: 0 },
    button: { display: 'inline-block', padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', textDecoration: 'none', borderRadius: '5px' },
};