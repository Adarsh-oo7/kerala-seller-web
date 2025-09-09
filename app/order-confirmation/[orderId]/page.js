'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { CheckCircle, Package } from 'lucide-react';

const ORDER_DETAIL_API_URL = 'http://localhost:8000/user/orders/';

export default function OrderConfirmationPage() {
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
        if (!headers || !orderId) return;

        axios.get(`${ORDER_DETAIL_API_URL}${orderId}/`, { headers })
            .then(res => setOrder(res.data))
            .catch(err => console.error("Failed to fetch order details", err))
            .finally(() => setIsLoading(false));
    }, [orderId, getAuthHeaders]);

    if (isLoading) return <p style={styles.message}>Confirming your order...</p>;
    if (!order) return <p style={styles.message}>Could not retrieve order details.</p>;

    return (
        <div>
            <Header />
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successIcon}>
                        <CheckCircle size={48} color="#10b981" />
                    </div>
                    <h1 style={styles.title}>Thank You for Your Order!</h1>
                    <p style={styles.subtitle}>Your order has been placed successfully and the seller has been notified.</p>
                    
                    <div style={styles.orderDetails}>
                        <p><strong>Order ID:</strong> #{order.id}</p>
                        <p><strong>Total Amount:</strong> ₹{order.total_amount}</p>
                        <p><strong>Status:</strong> {order.status}</p>
                    </div>

                    <div style={styles.buttonGroup}>
                        <Link href="/shop" style={styles.secondaryButton}>Continue Shopping</Link>
                        <Link href="/profile/orders" style={styles.primaryButton}>
                            <Package size={16} /> View My Orders
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

const styles = {
    message: { textAlign: 'center', marginTop: '50px' },
    container: { maxWidth: '600px', margin: '40px auto', padding: '20px' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    successIcon: { marginBottom: '20px' },
    title: { fontSize: '2rem', marginBottom: '10px' },
    subtitle: { color: '#64748b', marginBottom: '30px' },
    orderDetails: { borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '20px 0', marginBottom: '30px' },
    buttonGroup: { display: 'flex', justifyContent: 'center', gap: '15px' },
    primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#0d6efd', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' },
    secondaryButton: { padding: '12px 24px', backgroundColor: '#f1f5f9', color: '#1e293b', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' },
};