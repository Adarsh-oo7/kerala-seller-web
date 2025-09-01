'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { Users, Target, Heart, Store, TrendingUp, CheckCircle, BarChart, Gift, Zap, ArrowRight, Star, Shield, Clock } from 'lucide-react';

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
    <div style={styles.pageContainer}>
      <Header />
      
      {/* Hero Section */}
      <div style={styles.hero} data-animate id="hero">
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Star size={16} color="#f59e0b" />
            <span>Trusted by 1000+ Kerala Businesses</span>
          </div>
          <h1 style={styles.heroTitle}>
            Your Own Online Shop in Kerala,{' '}
            <span style={styles.heroHighlight}>Made Easy</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Kerala Sellers helps local businesses, home-based entrepreneurs, and artisans 
            create a professional online store in minutes. No commissions, no hidden fees. 
            Just your products, your brand, and your customers.
          </p>
          <div style={styles.heroCta}>
            <Link href="/register/seller" style={styles.primaryButton}>
              <span>Start Your Free Trial</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/login/seller" style={styles.secondaryButton}>
              Seller Login
            </Link>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>1000+</span>
              <span style={styles.statLabel}>Active Sellers</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>15K+</span>
              <span style={styles.statLabel}>Products Listed</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>0%</span>
              <span style={styles.statLabel}>Commission</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Why Join Us Section */}
        <div style={styles.section} data-animate id="features">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Why Sellers Love Kerala Sellers</h2>
            <p style={styles.sectionSubtitle}>
              Join thousands of successful sellers who've grown their business with us
            </p>
          </div>
          <div style={styles.featuresGrid}>
            <FeatureCard
              icon={<CheckCircle size={28} />}
              title="Zero Commission"
              text="You keep 100% of your sales revenue. We believe your profits belong to you."
              color="#10b981"
              delay="0ms"
            />
            <FeatureCard
              icon={<Store size={28} />}
              title="Your Own Store Link"
              text="Get a professional, shareable link (e.g., keralasellers.in/shop/your-name) to promote your brand."
              color="#3b82f6"
              delay="150ms"
            />
            <FeatureCard
              icon={<TrendingUp size={28} />}
              title="Simple Stock Management"
              text="Easily add products, track your total and online inventory, and manage everything from one dashboard."
              color="#8b5cf6"
              delay="300ms"
            />
          </div>
        </div>

        {/* How It Works Section */}
        <div style={styles.section} data-animate id="steps">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Get Started in 3 Simple Steps</h2>
            <p style={styles.sectionSubtitle}>
              Launch your online store in less than 10 minutes
            </p>
          </div>
          <div style={styles.stepsContainer}>
            <div style={styles.stepsGrid}>
              <StepCard 
                number="1" 
                title="Register Your Account" 
                text="Create your seller account in just a few minutes with our simple OTP verification."
                delay="0ms"
              />
              <div style={styles.stepConnector}></div>
              <StepCard 
                number="2" 
                title="Set Up Your Store" 
                text="Add your shop name, logo, banner, and business details to build your brand identity."
                delay="150ms"
              />
              <div style={styles.stepConnector}></div>
              <StepCard 
                number="3" 
                title="List & Share" 
                text="Add your products and start sharing your unique shop link with customers on WhatsApp, Instagram, and Facebook."
                delay="300ms"
              />
            </div>
          </div>
        </div>

        {/* Who It's For Section */}
        <div style={styles.section} data-animate id="audience">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Perfect For Every Local Business</h2>
          </div>
          <div style={styles.audienceCard}>
            <div style={styles.audienceIcon}>
              <Heart size={32} color="#ef4444" />
            </div>
            <p style={styles.audienceText}>
              Whether you sell fashion, jewellery, spices, food items, or handicrafts, 
              our platform is built for you. We provide the tools to manage your products, 
              track orders, and connect directly with buyers across Kerala, solving the 
              trust issues in peer-to-peer sales.
            </p>
            <div style={styles.businessTypes}>
              <span style={styles.businessType}>Fashion</span>
              <span style={styles.businessType}>Jewellery</span>
              <span style={styles.businessType}>Spices</span>
              <span style={styles.businessType}>Food Items</span>
              <span style={styles.businessType}>Handicrafts</span>
              <span style={styles.businessType}>Electronics</span>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div style={styles.section} data-animate id="trust">
          <div style={styles.trustGrid}>
            <TrustCard
              icon={<Shield size={24} />}
              title="Secure Payments"
              text="Safe and secure payment processing"
              color="#10b981"
            />
            <TrustCard
              icon={<Clock size={24} />}
              title="24/7 Support"
              text="Round-the-clock customer assistance"
              color="#3b82f6"
            />
            <TrustCard
              icon={<Zap size={24} />}
              title="Fast Setup"
              text="Get online in less than 10 minutes"
              color="#f59e0b"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div style={styles.ctaSection} data-animate id="cta">
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaTitle}>Ready to Start Selling Online?</h2>
            <p style={styles.ctaText}>
              Join thousands of successful sellers on Kerala's most trusted marketplace
            </p>
            <div style={styles.ctaButtons}>
              <Link href="/register/seller" style={styles.ctaPrimary}>
                <span>Start Free Trial</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/contact" style={styles.ctaSecondary}>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-fade-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fade-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        
        .animate-fade-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        /* Mobile-first responsive design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem !important;
            line-height: 1.2 !important;
          }
          
          .hero-stats {
            flex-direction: column !important;
            gap: 16px !important;
          }
          
          .hero-cta {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .features-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
          
          .step-connector {
            display: none !important;
          }
          
          .trust-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .cta-buttons {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .business-types {
            justify-content: center !important;
          }
        }
        
        @media (max-width: 480px) {
          .container {
            padding: 16px !important;
          }
          
          .hero {
            padding: 40px 0 !important;
          }
          
          .section {
            margin-bottom: 40px !important;
          }
          
          .feature-card, .step-card, .audience-card {
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Helper Components
function FeatureCard({ icon, title, text, color, delay }) {
  return (
    <div 
      style={{...styles.featureCard, animationDelay: delay}} 
      className="animate-fade-up"
    >
      <div style={{...styles.featureIcon, color: color}}>
        {icon}
      </div>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureText}>{text}</p>
    </div>
  );
}

function StepCard({ number, title, text, delay }) {
  return (
    <div 
      style={{...styles.stepCard, animationDelay: delay}} 
      className="animate-fade-up"
    >
      <div style={styles.stepNumber}>{number}</div>
      <h3 style={styles.stepTitle}>{title}</h3>
      <p style={styles.stepText}>{text}</p>
    </div>
  );
}

function TrustCard({ icon, title, text, color }) {
  return (
    <div style={styles.trustCard} className="animate-fade-up">
      <div style={{...styles.trustIcon, backgroundColor: `${color}15`}}>
        {React.cloneElement(icon, { color: color })}
      </div>
      <h4 style={styles.trustTitle}>{title}</h4>
      <p style={styles.trustText}>{text}</p>
    </div>
  );
}

const styles = {
  pageContainer: {
    backgroundColor: '#ffffff',
    minHeight: '100vh'
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    padding: '80px 0 60px',
    position: 'relative',
    overflow: 'hidden'
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '24px',
    backdropFilter: 'blur(10px)'
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    lineHeight: '1.1',
    marginBottom: '24px',
    background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  heroHighlight: {
    background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    lineHeight: '1.6',
    opacity: 0.9,
    maxWidth: '700px',
    margin: '0 auto 32px',
    fontWeight: '400'
  },
  heroCta: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '48px',
    flexWrap: 'wrap'
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 32px',
    backgroundColor: '#ffffff',
    color: '#4f46e5',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '1.05rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px 0 rgba(0, 0, 0, 0.15)'
    }
  },
  secondaryButton: {
    padding: '16px 32px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '1.05rem',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.5)'
    }
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '48px',
    marginTop: '32px'
  },
  statItem: {
    textAlign: 'center'
  },
  statNumber: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.8
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px'
  },
  section: {
    marginBottom: '80px'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '48px'
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px',
    lineHeight: '1.2'
  },
  sectionSubtitle: {
    fontSize: '1.125rem',
    color: '#6b7280',
    maxWidth: '600px',
    margin: '0 auto'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
    }
  },
  featureIcon: {
    marginBottom: '16px'
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  featureText: {
    color: '#6b7280',
    lineHeight: '1.6',
    fontSize: '0.95rem'
  },
  stepsContainer: {
    position: 'relative'
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr auto 1fr',
    gap: '24px',
    alignItems: 'center'
  },
  stepCard: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  },
  stepNumber: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontWeight: '700',
    fontSize: '1.25rem'
  },
  stepTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  stepText: {
    color: '#6b7280',
    lineHeight: '1.6',
    fontSize: '0.95rem'
  },
  stepConnector: {
    width: '2px',
    height: '40px',
    backgroundColor: '#e5e7eb',
    margin: '0 auto'
  },
  audienceCard: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  audienceIcon: {
    marginBottom: '24px'
  },
  audienceText: {
    fontSize: '1.125rem',
    color: '#374151',
    lineHeight: '1.7',
    marginBottom: '32px',
    maxWidth: '700px',
    margin: '0 auto 32px'
  },
  businessTypes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center'
  },
  businessType: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  trustGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  },
  trustCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  trustIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px'
  },
  trustTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px'
  },
  trustText: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  ctaSection: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    borderRadius: '20px',
    padding: '48px',
    textAlign: 'center',
    color: '#ffffff'
  },
  ctaContent: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '16px'
  },
  ctaText: {
    fontSize: '1.125rem',
    opacity: 0.9,
    marginBottom: '32px',
    lineHeight: '1.6'
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  ctaPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 32px',
    backgroundColor: '#ffffff',
    color: '#4f46e5',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px 0 rgba(0, 0, 0, 0.15)'
    }
  },
  ctaSecondary: {
    padding: '16px 32px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  }
};