'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../../components/common/Header';
import Footer from '../../../../components/common/Footer';
import { ArrowLeft, MapPin, Truck, Package, Calendar } from 'lucide-react';

const ORDER_DETAIL_API_URL = 'http://localhost:8000/user/orders/';

export default function OrderDetailPage() {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { orderId } = useParams();
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
        if (!headers || !orderId) {
            setIsLoading(false);
            return;
        }

        axios.get(`${ORDER_DETAIL_API_URL}${orderId}/`, { headers })
            .then(res => setOrder(res.data))
            .catch(err => {
                console.error("Failed to fetch order details", err);
                // Redirect or show error if the order doesn't belong to the user
                if (err.response?.status === 404) {
                    setOrder(null);
                }
            })
            .finally(() => setIsLoading(false));
    }, [orderId, getAuthHeaders]);
    
    const getStatusStyle = (status) => {
        const baseStyle = { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' };
        const styles = {
            PENDING: { backgroundColor: '#fffbeb', color: '#b45309' },
            PROCESSING: { backgroundColor: '#eef2ff', color: '#4338ca' },
            SHIPPED: { backgroundColor: '#dcfce7', color: '#166534' },
            DELIVERED: { backgroundColor: '#dcfce7', color: '#166534' },
            CANCELLED: { backgroundColor: '#fee2e2', color: '#991b1b' },
        };
        return { ...baseStyle, ...(styles[status] || {}) };
    };

    if (isLoading) {
        return <p style={styles.message}>Loading order details...</p>;
    }
    
    if (!order) {
        return <p style={styles.message}>Order not found or you do not have permission to view it.</p>;
    }

    return (
        <div>
            <Header />
            <div style={styles.container}>
                <Link href="/profile/orders" style={styles.backLink}>
                    <ArrowLeft size={20}/> Back to All Orders
                </Link>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div>
                            <h1 style={{margin: 0}}>Order #{order.id}</h1>
                            <span style={styles.date}>Placed on: {new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <strong style={styles.total}>₹{order.total_amount}</strong>
                    </div>
                    <div style={styles.cardBody}>
                        <div style={styles.section}>
                            <h4><MapPin size={16}/> Shipping Address</h4>
                            <p>{order.customer_name}<br/>{order.shipping_address}<br/>{order.customer_phone}</p>
                        </div>
                        <div style={styles.section}>
                            <h4><Truck size={16}/> Tracking</h4>
                            <p><strong>Status:</strong> <span style={getStatusStyle(order.status)}>{order.status}</span></p>
                            {order.tracking_id && <p><strong>Tracking ID:</strong> {order.tracking_id} ({order.shipping_provider})</p>}
                        </div>
                        <div style={styles.section}>
                            <h4>Items in this order ({order.items.length})</h4>
                            {order.items.map(item => (
                                <div key={item.id} style={styles.item}>
                                    <img src={item.product?.main_image_url || 'https://placehold.co/80x80'} alt={item.product?.name} style={styles.itemImage}/>
                                    <div style={styles.itemDetails}>
                                        <p><strong>{item.product?.name}</strong></p>
                                        <p>{item.quantity} x ₹{item.price}</p>
                                    </div>
                                    <strong style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

const styles = {
    message: { textAlign: 'center', marginTop: '50px' },
    container: { maxWidth: '800px', margin: '40px auto', padding: '20px' },
    backLink: { textDecoration: 'none', color: '#0d6efd', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1rem' },
    card: { border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #eee' },
    date: { color: '#6c757d', fontSize: '0.9rem' },
    total: { fontSize: '1.5rem', fontWeight: 'bold' },
    cardBody: { paddingTop: '20px' },
    section: { marginBottom: '25px' },
    statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' },
    item: { display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' },
    itemImage: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' },
    itemDetails: { flexGrow: 1 },
    itemTotal: { fontWeight: 'bold' },
};