'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    <div style={styles.pageContainer}>
      <Header />
      
      {/* Hero Section */}
      <div style={styles.hero} data-animate id="hero">
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Star size={16} color="#f59e0b" />
            <span>Kerala's Most Trusted Online Marketplace</span>
          </div>
          <h1 style={styles.heroTitle}>
            Connecting Kerala's{' '}
            <span style={styles.heroHighlight}>Sellers & Buyers</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Kerala Sellers is a zero-commission marketplace that empowers local businesses 
            to sell online while providing buyers with authentic Kerala products from 
            trusted sellers across the state.
          </p>
          <div style={styles.heroCta}>
            <Link href="/register/seller" style={styles.primaryButton}>
              <Store size={18} />
              <span>Start Selling</span>
            </Link>
            <Link href="/" style={styles.secondaryButton}>
              <ShoppingBag size={18} />
              <span>Start Shopping</span>
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
              <span style={styles.statNumber}>50K+</span>
              <span style={styles.statLabel}>Happy Buyers</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>0%</span>
              <span style={styles.statLabel}>Commission</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Platform Overview */}
        <div style={styles.section} data-animate id="overview">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>A Complete Marketplace Solution</h2>
            <p style={styles.sectionSubtitle}>
              Designed for Kerala's unique business landscape
            </p>
          </div>
          <div style={styles.overviewGrid}>
            <div style={styles.overviewCard}>
              <div style={styles.overviewIcon}>
                <Store size={32} color="#3b82f6" />
              </div>
              <h3 style={styles.overviewTitle}>For Sellers</h3>
              <p style={styles.overviewText}>
                Create your own online store with a personalized link. Manage inventory, 
                track orders, and grow your business with zero commission fees.
              </p>
              <Link href="/register/seller" style={styles.overviewLink}>
                <span>Start Selling</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div style={styles.overviewCard}>
              <div style={styles.overviewIcon}>
                <ShoppingBag size={32} color="#10b981" />
              </div>
              <h3 style={styles.overviewTitle}>For Buyers</h3>
              <p style={styles.overviewText}>
                Discover authentic Kerala products from trusted local sellers. 
                Shop with confidence knowing every seller is verified.
              </p>
              <Link href="/" style={styles.overviewLink}>
                <span>Start Shopping</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Why Sellers Choose Us */}
        <div style={styles.section} data-animate id="seller-features">
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
              text="Keep 100% of your sales revenue. No hidden fees, no commission charges. Your profits belong to you."
              color="#10b981"
              delay="0ms"
            />
            <FeatureCard
              icon={<Globe size={28} />}
              title="Your Own Store Link"
              text="Get a professional shareable link (keralasellers.in/shop/yourname) to build your brand identity."
              color="#3b82f6"
              delay="150ms"
            />
            <FeatureCard
              icon={<TrendingUp size={28} />}
              title="Simple Management"
              text="Easy-to-use dashboard for inventory, orders, and customer management. No technical knowledge required."
              color="#8b5cf6"
              delay="300ms"
            />
          </div>
        </div>

        {/* Why Buyers Trust Us */}
        <div style={styles.section} data-animate id="buyer-features">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Why Buyers Trust Kerala Sellers</h2>
            <p style={styles.sectionSubtitle}>
              Shop with confidence from verified Kerala businesses
            </p>
          </div>
          <div style={styles.featuresGrid}>
            <FeatureCard
              icon={<UserCheck size={28} />}
              title="Verified Sellers"
              text="All sellers are verified with proper documentation and contact details for your safety."
              color="#ef4444"
              delay="0ms"
            />
            <FeatureCard
              icon={<MapPin size={28} />}
              title="Local Products"
              text="Authentic Kerala products from local artisans, home businesses, and established stores."
              color="#f59e0b"
              delay="150ms"
            />
            <FeatureCard
              icon={<Shield size={28} />}
              title="Secure Shopping"
              text="Safe payment options and reliable customer support for a worry-free shopping experience."
              color="#06b6d4"
              delay="300ms"
            />
          </div>
        </div>

        {/* How It Works for Sellers */}
        <div style={styles.section} data-animate id="seller-steps">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Get Started as a Seller</h2>
            <p style={styles.sectionSubtitle}>
              Launch your online store in less than 10 minutes
            </p>
          </div>
          <div style={styles.stepsContainer}>
            <div style={styles.stepsGrid}>
              <StepCard 
                number="1" 
                title="Register & Verify" 
                text="Create your seller account with OTP verification and business details."
                delay="0ms"
              />
              <div style={styles.stepConnector}></div>
              <StepCard 
                number="2" 
                title="Set Up Store" 
                text="Add your shop name, logo, banner, and business information to build your brand."
                delay="150ms"
              />
              <div style={styles.stepConnector}></div>
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
        <div style={styles.section} data-animate id="buyer-steps">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>How to Shop on Kerala Sellers</h2>
            <p style={styles.sectionSubtitle}>
              Simple and secure shopping experience
            </p>
          </div>
          <div style={styles.stepsContainer}>
            <div style={styles.stepsGrid}>
              <StepCard 
                number="1" 
                title="Browse & Discover" 
                text="Explore products from verified Kerala sellers or visit specific store pages."
                delay="0ms"
              />
              <div style={styles.stepConnector}></div>
              <StepCard 
                number="2" 
                title="Add to Cart" 
                text="Select products from multiple stores and manage your cart by seller."
                delay="150ms"
              />
              <div style={styles.stepConnector}></div>
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
        <div style={styles.section} data-animate id="audience">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Perfect For Every Kerala Business</h2>
          </div>
          <div style={styles.audienceCard}>
            <div style={styles.audienceIcon}>
              <Heart size={32} color="#ef4444" />
            </div>
            <p style={styles.audienceText}>
              Whether you're selling traditional Kerala spices, handmade crafts, fashion items, 
              jewelry, or any other products, our platform connects you directly with buyers 
              across Kerala and beyond. We bridge the gap between local businesses and customers 
              who value authenticity.
            </p>
            <div style={styles.businessTypes}>
              <span style={styles.businessType}>Spices & Food</span>
              <span style={styles.businessType}>Handicrafts</span>
              <span style={styles.businessType}>Fashion</span>
              <span style={styles.businessType}>Jewelry</span>
              <span style={styles.businessType}>Home Decor</span>
              <span style={styles.businessType}>Electronics</span>
              <span style={styles.businessType}>Books</span>
              <span style={styles.businessType}>Health & Beauty</span>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div style={styles.section} data-animate id="trust">
          <div style={styles.trustGrid}>
            <TrustCard
              icon={<Shield size={24} />}
              title="Secure Platform"
              text="Safe and secure for both buyers and sellers"
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
              title="Fast & Easy"
              text="Quick setup for sellers, easy shopping for buyers"
              color="#f59e0b"
            />
            <TrustCard
              icon={<MapPin size={24} />}
              title="Kerala Focus"
              text="Dedicated to supporting local Kerala businesses"
              color="#ef4444"
            />
          </div>
        </div>

        {/* Our Mission */}
        <div style={styles.section} data-animate id="mission">
          <div style={styles.missionCard}>
            <h2 style={styles.missionTitle}>Our Mission</h2>
            <p style={styles.missionText}>
              To empower Kerala's local businesses by providing them with a digital platform 
              to reach customers while maintaining their unique identity and keeping their 
              hard-earned profits. We believe in supporting the entrepreneurial spirit of 
              Kerala while connecting buyers with authentic, quality products from trusted sellers.
            </p>
            <div style={styles.missionValues}>
              <div style={styles.valueItem}>
                <CheckCircle size={20} color="#10b981" />
                <span>Zero Commission Policy</span>
              </div>
              <div style={styles.valueItem}>
                <CheckCircle size={20} color="#10b981" />
                <span>Supporting Local Businesses</span>
              </div>
              <div style={styles.valueItem}>
                <CheckCircle size={20} color="#10b981" />
                <span>Building Trust & Transparency</span>
              </div>
              <div style={styles.valueItem}>
                <CheckCircle size={20} color="#10b981" />
                <span>Promoting Kerala Culture</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={styles.ctaSection} data-animate id="cta">
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaTitle}>Join the Kerala Sellers Community</h2>
            <p style={styles.ctaText}>
              Whether you want to sell your products or discover authentic Kerala goods, 
              we're here to connect you with the right people.
            </p>
            <div style={styles.ctaButtons}>
              <Link href="/register/seller" style={styles.ctaPrimary}>
                <Store size={18} />
                <span>Become a Seller</span>
              </Link>
              <Link href="/" style={styles.ctaSecondary}>
                <ShoppingBag size={18} />
                <span>Start Shopping</span>
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
            grid-template-columns: repeat(2, 1fr) !important;
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
          
          .overview-grid {
            grid-template-columns: 1fr !important;
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

          .mission-values {
            grid-template-columns: 1fr !important;
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
    boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)'
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 32px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '1.05rem',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease'
  },
  heroStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '24px',
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
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  },
  overviewCard: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease'
  },
  overviewIcon: {
    marginBottom: '16px'
  },
  overviewTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  overviewText: {
    color: '#6b7280',
    lineHeight: '1.6',
    fontSize: '1rem',
    marginBottom: '20px'
  },
  overviewLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s'
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
    transition: 'all 0.3s ease'
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
    transition: 'all 0.3s ease'
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
  missionCard: {
    backgroundColor: '#f8fafc',
    padding: '48px',
    borderRadius: '20px',
    textAlign: 'center',
    border: '1px solid #e5e7eb'
  },
  missionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px'
  },
  missionText: {
    fontSize: '1.125rem',
    color: '#374151',
    lineHeight: '1.7',
    marginBottom: '32px',
    maxWidth: '800px',
    margin: '0 auto 32px'
  },
  missionValues: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  valueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#374151'
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
    transition: 'all 0.3s ease'
  },
  ctaSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 32px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease'
  }
};
