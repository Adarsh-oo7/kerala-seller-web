'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import "../../styles/AboutPage.css";
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import {
  Users, Target, Heart, Store, TrendingUp, CheckCircle, BarChart, Gift, Zap, ArrowRight,
  Star, Shield, Clock, ShoppingBag, MapPin, UserCheck, Globe
} from 'lucide-react';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-container">
      <Header />

      {/* Hero Section */}
      <div className="hero" data-animate id="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Star className='staricon' color="#f59e0b" />
            <span>Kerala's Most Trusted Online Marketplace</span>
          </div>
          <h1 className="hero-title">
            Connecting Kerala's <span className="hero-highlight">Sellers & Buyers</span>
          </h1>
          <p className="hero-subtitle">
            Kerala Sellers is a zero-commission marketplace that empowers local businesses
            to sell online while providing buyers with authentic Kerala products from
            trusted sellers across the state.
          </p>
          <div className="hero-cta">
            <Link href="/register/seller" className="primary-button">
              <Store className='storeicon' />
              <span>Start Selling</span>
            </Link>
            <Link href="/" className="secondary-button">
              <ShoppingBag className='storeicon' />
              <span>Start Shopping</span>
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Active Sellers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">15K+</span>
              <span className="stat-label">Products Listed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Happy Buyers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0%</span>
              <span className="stat-label">Commission</span>
            </div>
          </div>
        </div>
      </div>


      <div className="container">
        {/* Platform Overview */}
        <div className="section" data-animate id="overview">
          <div className="section-header">
            <h2 className="section-title">A Complete Marketplace Solution</h2>
            <p className="section-subtitle">

              Designed for Kerala's unique business landscape
            </p>
          </div>
          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-icon">

                <Store className='overviewicon' color="#83aa4a" />
              </div>
              <h3 className="overview-title">For Sellers</h3>
              <p className="overview-text">

                Create your own online store with a personalized link. Manage inventory,
                track orders, and grow your business with zero commission fees.
              </p>
              <Link href="/register/seller" className="overview-link">
                <span>Start Selling</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="overview-card">
              <div className="overview-icon">

                <ShoppingBag className='overviewicon' color="#83aa4a" />
              </div>
              <h3 className="overview-title">For Buyers</h3>
              <p className="overview-text">

                Discover authentic Kerala products from trusted local sellers.
                Shop with confidence knowing every seller is verified.
              </p>
              <Link href="/" className="overview-link">
                <span>Start Shopping</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Why Sellers Choose Us */}
        <div className="section" data-animate id="seller-features">
          <div className="section-header">
            <h2 className="section-title">Why Sellers Love Kerala Sellers</h2>
            <p className="section-subtitle">

              Join thousands of successful sellers who've grown their business with us
            </p>
          </div>
          <div className="features-grid">
            <FeatureCard
              icon={<CheckCircle className='overviewicon' />}
              title="Zero Commission"
              text="Keep 100% of your sales revenue. No hidden fees, no commission charges. Your profits belong to you."
              color="#10b981"
              delay="0ms"
            />
            <FeatureCard
              icon={<Globe className='overviewicon' />}
              title="Your Own Store Link"
              text="Get a professional shareable link (keralasellers.in/shop/yourname) to build your brand identity."
              color="#3b82f6"
              delay="150ms"
            />
            <FeatureCard
              icon={<TrendingUp className='overviewicon' />}
              title="Simple Management"
              text="Easy-to-use dashboard for inventory, orders, and customer management. No technical knowledge required."
              color="#8b5cf6"
              delay="300ms"
            />
          </div>
        </div>

        {/* Why Buyers Trust Us */}
        <div className="section" data-animate id="buyer-features">
          <div className="section-header">
            <h2 className="section-title">Why Buyers Trust Kerala Sellers</h2>
            <p className="section-subtitle">

              Shop with confidence from verified Kerala businesses
            </p>
          </div>
          <div className="features-grid">
            <FeatureCard
              icon={<UserCheck className='overviewicon' />}
              title="Verified Sellers"
              text="All sellers are verified with proper documentation and contact details for your safety."
              color="#f59e0b"
              delay="0ms"
            />
            <FeatureCard
              icon={<MapPin className='overviewicon' />}
              title="Local Products"
              text="Authentic Kerala products from local artisans, home businesses, and established stores."
              color=" #ef4444"
              delay="150ms"
            />
            <FeatureCard
              icon={<Shield className='overviewicon' />}
              title="Secure Shopping"
              text="Safe payment options and reliable customer support for a worry-free shopping experience."
              color="#06b6d4"
              delay="300ms"
            />
          </div>
        </div>

        {/* How It Works for Sellers */}
        <div className="section" data-animate id="seller-steps">
          <div className="section-header">
            <h2 className="section-title">Get Started as a Seller</h2>
            <p className="section-subtitle">
              Launch your online store in less than 10 minutes
            </p>
          </div>
          <div className="steps-container">
            <div className="steps-grid">

              <StepCard
                number="1"
                title="Register & Verify"
                text="Create your seller account with OTP verification and business details."
                delay="0ms"
              />
              <div className="step-connector"></div>
              <StepCard
                number="2"
                title="Set Up Store"
                text="Add your shop name, logo, banner, and business information to build your brand."
                delay="150ms"
              />
              <div className="step-connector"></div>
              <StepCard
                number="3"
                title="List & Sell"
                text="Add products, manage inventory, and start receiving orders from Kerala buyers."
                delay="300ms"
              />
            </div>
          </div>
        </div>

        {/* How It Works for Buyers */}
        <div className="section" data-animate id="buyer-steps">
          <div className="section-header">
            <h2 className="section-title">How to Shop on Kerala Sellers</h2>
            <p className="section-subtitle">

              Simple and secure shopping experience
            </p>
          </div>
          <div className="steps-container">
            <div className="steps-grid">

              <StepCard
                number="1"
                title="Browse & Discover"
                text="Explore products from verified Kerala sellers or visit specific store pages."
                delay="0ms"
              />
              <div className="step-connector"></div>
              <StepCard
                number="2"
                title="Add to Cart"
                text="Select products from multiple stores and manage your cart by seller."
                delay="150ms"
              />
              <div className="step-connector"></div>
              <StepCard
                number="3"
                title="Order & Enjoy"
                text="Place your order with secure payment and receive authentic Kerala products."
                delay="300ms"
              />
            </div>
          </div>
        </div>

        {/* Who It's For Section */}
        <div className="section" data-animate id="audience">
          <div className="section-header">
            <h2 className="section-title">Perfect For Every Kerala Business</h2>
          </div>

          <div className="audience-card">
            <div className="audience-icon">
              <Heart size={32} color="rgb(255, 223, 104)" />
            </div>
            <p className="audience-text">
              Whether you're selling traditional Kerala spices, handmade crafts, fashion items,
              jewelry, or any other products, our platform connects you directly with buyers
              across Kerala and beyond. We bridge the gap between local businesses and customers
              who value authenticity.
            </p>

            <div className="business-types">
              <span className="business-type">Spices & Food</span>
              <span className="business-type">Handicrafts</span>
              <span className="business-type">Fashion</span>
              <span className="business-type">Jewelry</span>
              <span className="business-type">Home Decor</span>
              <span className="business-type">Electronics</span>
              <span className="business-type">Books</span>
              <span className="business-type">Health & Beauty</span>
            </div>

          </div>
        </div>

        {/* Trust Indicators */}
        <div className="section" data-animate id="trust">
          <div className="trust-grid">

            <TrustCard
              icon={<Shield className='overviewicon' />}
              title="Secure Platform"
              text="Safe and secure for both buyers and sellers"
              color="#10b981"
            />
            <TrustCard
              icon={<Clock className='overviewicon' />}
              title="24/7 Support"
              text="Round-the-clock customer assistance"
              color="#3b82f6"
            />
            <TrustCard
              icon={<Zap className='overviewicon' />}
              title="Fast & Easy"
              text="Quick setup for sellers, easy shopping for buyers"
              color="#f59e0b"
            />
            <TrustCard
              icon={<MapPin className='overviewicon' />}
              title="Kerala Focus"
              text="Dedicated to supporting local Kerala businesses"
              color="#ef4444"
            />
          </div>
        </div>

        {/* Our Mission */}
        <div className="section" data-animate id="mission">
          <div className="mission-card">
            <h2 className="mission-title">Our Mission</h2>
            <p className="mission-text">
              To empower Kerala's local businesses by providing them with a digital platform
              to reach customers while maintaining their unique identity and keeping their
              hard-earned profits. We believe in supporting the entrepreneurial spirit of
              Kerala while connecting buyers with authentic, quality products from trusted sellers.
            </p>
            <div className="mission-values">
              <div className="value-item">
                <CheckCircle className='staricon' color="#10b981" />
                <span className='hero-badge'>Zero Commission Policy</span>
              </div>
              <div className="value-item">
                <CheckCircle className='staricon' color="#10b981" />
                <span className='hero-badge'>Supporting Local Businesses</span>
              </div>
              <div className="value-item">
                <CheckCircle className='staricon' color="#10b981" />
                <span className='hero-badge'>Building Trust & Transparency</span>
              </div>
              <div className="value-item">
                <CheckCircle className='staricon' color="#10b981" />
                <span className='hero-badge'>Promoting Kerala Culture</span>
              </div>
            </div>
          </div>
        </div>


        {/* CTA Section */}
        <div className="cta-section" data-animate id="cta">
          <div className="cta-content">
            <h2 className="cta-title">Join the Kerala Sellers Community</h2>
            <p className="cta-text">
              Whether you want to sell your products or discover authentic Kerala goods,
              we're here to connect you with the right people.
            </p>
            <div className="cta-buttons">
              <Link href="/register/seller" className="cta-primary">
                <Store className='storeicon' />
                <span>Start Selling</span>
              </Link>
              <Link href="/" className="cta-secondary">
                <ShoppingBag className='storeicon' />
                <span>Start Shopping</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

      <Footer />


    </div>
  );
}

// Helper Components
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

function StepCard({ number, title, text, delay }) {
  return (
    <div className="step-card animate-fade-up" style={{ animationDelay: delay }}>
      <div className="step-number">{number}</div>
      <h3 className="step-title">{title}</h3>
      <p className="step-text">{text}</p>
    </div>

  );
}

function TrustCard({ icon, title, text, color }) {
  return (

    <div className="trust-card animate-fade-up">
      <div className={`trust-icon icon-bg-${color}`}>
        {React.cloneElement(icon, { color: color })}
      </div>
      <h4 className="trust-title">{title}</h4>
      <p className="trust-text">{text}</p>
    </div>

  );
}


