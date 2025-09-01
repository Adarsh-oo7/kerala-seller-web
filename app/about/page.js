'use client';

import React from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { Users, Target, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={styles.pageContainer}>
      <Header />
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1>About Kerala Sellers</h1>
          <p style={styles.subtitle}>Connecting communities, one local product at a time.</p>
        </div>

        <div style={styles.card}>
          <h2>Our Mission</h2>
          <p>Our mission is to empower local artisans, entrepreneurs, and sellers across Kerala by providing a robust, trustworthy, and easy-to-use platform. We aim to bring the rich diversity of Kerala's products to a wider audience, fostering economic growth and preserving local heritage.</p>
        </div>

        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <Users size={32} style={styles.icon} />
            <h3>For Our Sellers</h3>
            <p>We provide the tools, technology, and support to help local businesses thrive in the digital marketplace.</p>
          </div>
          <div style={styles.featureCard}>
            <Heart size={32} style={styles.icon} />
            <h3>For Our Buyers</h3>
            <p>Discover authentic, high-quality products from your local community and enjoy a secure and seamless shopping experience.</p>
          </div>
          <div style={styles.featureCard}>
            <Target size={32} style={styles.icon} />
            <h3>Our Vision</h3>
            <p>To be the leading platform for local e-commerce in Kerala, celebrated for our commitment to quality, community, and trust.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const styles = {
    pageContainer: { backgroundColor: '#f8fafc' },
    container: { maxWidth: '900px', margin: '0 auto', padding: '40px 20px' },
    hero: { textAlign: 'center', marginBottom: '40px' },
    subtitle: { fontSize: '1.2rem', color: '#64748b', marginTop: '10px' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '30px' },
    featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
    featureCard: { textAlign: 'center', padding: '20px' },
    icon: { color: '#3b82f6', marginBottom: '15px' },
};