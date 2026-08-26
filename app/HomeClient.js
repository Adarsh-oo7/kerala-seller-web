'use client';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import SellerLanding from '../components/home/SellerLanding';
import '../styles/AboutPage.css';

export default function HomeClient() {
  return (
    <div style={{ backgroundColor: '#FDFFF0', minHeight: '100vh' }}>
      <Header />
      <div className="page-container" style={{ backgroundColor: '#FDFFF0' }}>
        <SellerLanding />
      </div>
      <Footer />
    </div>
  );
}
