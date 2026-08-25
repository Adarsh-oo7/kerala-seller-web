'use client';

import Link from 'next/link';
import '../../styles/AboutPage.css';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import {
  Store, CheckCircle, Star, CreditCard, Package, Award, Globe
} from 'lucide-react';
import SellerStartLinks from '../../components/common/SellerStartLinks';
import OfficialProfilesList from '../../components/common/OfficialProfilesList';
import { BRAND } from '../lib/brand';

export default function AboutPage() {
  return (
    <div className="page-container">
      <Header />

      <div className="hero" data-animate id="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Star className="staricon" color="#f59e0b" />
            <span>Built only for Kerala</span>
          </div>

          <h1 className="hero-title">
            About <span className="hero-highlight">Kerala Sellers</span>
          </h1>

          <p className="hero-subtitle">
            We help people who already sell on Instagram, WhatsApp, and Facebook get a proper store — and help local shops add billing and an online catalogue without paying marketplace commission.
          </p>

          <div className="hero-cta">
            <Link href="/register/seller" className="primary-button">
              <Store className="storeicon" />
              <span>Start Free Store Now</span>
            </Link>
            <Link href="/#what-is" className="secondary-button">
              <span>See how it works</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section" data-animate>
          <div className="section-header">
            <h2 className="section-title">Start as a seller</h2>
            <p className="section-subtitle">
              Register first. Then login and subscribe to a plan that matches how many products you sell.
            </p>
          </div>
          <SellerStartLinks />
        </div>

        <div className="section" data-animate>
          <div className="section-header">
            <h2 className="section-title">Official pages</h2>
            <p className="section-subtitle">
              Use these when customers ask if Kerala Sellers is real. Same accounts for support and updates.
            </p>
          </div>
          <OfficialProfilesList />
        </div>

        <div className="section" data-animate>
          <div className="section-header">
            <h2 className="section-title">Founders</h2>
            <p className="section-subtitle">
              Kerala team. Product of {BRAND.parent.name}, Trivandrum.
            </p>
          </div>
          <div className="trust-grid">
            {BRAND.founders.map((person) => (
              <div className="trust-card animate-fade-up" key={person.name}>
                <div className="testimonial-avatar">{person.name[0]}</div>
                <h4 className="trust-title">{person.name}</h4>
                <p className="trust-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
                  {person.role} · {person.focus}
                </p>
                <p className="trust-text" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
                  &ldquo;{person.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="section" data-animate>
          <div className="section-header">
            <h2 className="section-title">Who we built this for</h2>
            <p className="section-subtitle">
              Most sellers do not search for “e-commerce SaaS”. They search for a way to take orders without living in chat.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<CheckCircle className="overviewicon" />}
              title="Social media sellers first"
              text="Jewellery, clothes, bakery, homemade food, gifts. Share one link. Customers browse, cart, and pay. You manage orders in one list."
              color="#10b981"
              delay="0ms"
            />
            <FeatureCard
              icon={<Globe className="overviewicon" />}
              title="Sell across Kerala"
              text="Local delivery, Kerala customers, your own store name on keralasellers.in. Not a pan-India marketplace that takes a cut."
              color="#3b82f6"
              delay="150ms"
            />
            <FeatureCard
              icon={<Package className="overviewicon" />}
              title="Shops that need billing too"
              text="If you already have a counter, add GST billing and stock with the same store. Secondary to social selling — still part of the same platform."
              color="#8b5cf6"
              delay="300ms"
            />
          </div>
        </div>

        <div className="section" data-animate>
          <div className="section-header">
            <h2 className="section-title">What stays the same</h2>
            <p className="section-subtitle">
              0% commission. Your store link. Setup in about 10 minutes.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<Award className="overviewicon" />}
              title="You keep the sale"
              text="No marketplace commission on your orders."
              color="#10b981"
              delay="0ms"
            />
            <FeatureCard
              icon={<CreditCard className="overviewicon" />}
              title="Payments you control"
              text="Connect Razorpay and receive money in your account."
              color="#3b82f6"
              delay="150ms"
            />
            <FeatureCard
              icon={<Store className="overviewicon" />}
              title="One dashboard"
              text="Products, orders, and shop settings in the seller app and web dashboard."
              color="#f59e0b"
              delay="300ms"
            />
          </div>
        </div>

        <div className="cta-section" data-animate>
          <div className="cta-content">
            <Star size={56} color="#f59e0b" style={{ marginBottom: '24px' }} />
            <h2 className="cta-title">Want the full walkthrough?</h2>
            <p className="cta-text">
              Tutorials and store setup steps are on the home page. This page is who we are. Home is how you start.
            </p>
            <div className="cta-buttons">
              <Link href="/" className="cta-primary">
                <Store className="storeicon" />
                <span>Go to home</span>
              </Link>
              <Link href="/register/seller" className="cta-secondary">
                <span>Create your store</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, text, color, delay }) {
  return (
    <div className="feature-card animate-fade-up" style={{ animationDelay: delay }}>
      <div className="feature-icon" style={{ color: color }}>
        {icon}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-text">{text}</p>
    </div>
  );
}
