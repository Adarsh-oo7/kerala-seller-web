'use client';

import Link from 'next/link';
import {
  Store, CheckCircle, ArrowRight, Star, ArrowDown,
  CreditCard, Package, Award, Video, TrendingUp, Globe
} from 'lucide-react';
import SellerStartLinks from '../common/SellerStartLinks';
import BrandSocialIcons from '../common/BrandSocialIcons';
import { BRAND } from '../../app/lib/brand';

export default function SellerLanding() {

  return (
    <>
      <div className="hero" data-animate id="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Star className="staricon" color="#f59e0b" />
            <span>0% Commission Forever</span>
          </div>

          <h1 className="hero-title">
            Turn Your Instagram &amp; WhatsApp Business Into Your Own{' '}
            <span className="hero-highlight">Online Store</span>
          </h1>

          <p className="hero-subtitle">
            Already taking orders in DMs? Get a store link you can share, let customers pick products themselves, and sell across Kerala — without building an expensive website.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Active Sellers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0%</span>
              <span className="stat-label">Commission</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10min</span>
              <span className="stat-label">Setup Time</span>
            </div>
          </div>

          <div className="hero-cta">
            <Link href="/register/seller" className="primary-button">
              <Store className="storeicon" />
              <span>Start Free Store Now</span>
            </Link>
            <Link href="/products" className="secondary-button">
              <span>Browse products</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section flow-step" data-animate id="start-selling">
          <div className="section-header">
            <div className="icon-wrapper">
              <Store className="overviewicon" color="#83aa4a" size={40} />
            </div>
            <h2 className="section-title">Start selling in two steps</h2>
            <p className="section-subtitle">
              Register your shop, then choose a monthly plan. Same for Instagram, WhatsApp, and local shops.
            </p>
          </div>
          <SellerStartLinks />
          <p className="section-subtitle" style={{ marginTop: 28 }}>
            Official Kerala Sellers pages — follow, then share your store link there
          </p>
          <BrandSocialIcons />
          <p className="section-subtitle" style={{ marginTop: 16 }}>
            Parent company:{' '}
            <a href={BRAND.parent.url} target="_blank" rel="noopener noreferrer me">
              {BRAND.parent.name}
            </a>
            {' · '}
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          </p>
        </div>

        <div className="arrow-connector">
          <ArrowDown size={40} className="pulse-icon" />
        </div>

        <div className="section flow-step" data-animate id="social-sellers">
          <div className="section-header">
            <div className="icon-wrapper">
              <Store className="overviewicon" color="#83aa4a" size={40} />
            </div>
            <h2 className="section-title">Made for Kerala sellers who already sell online</h2>
            <p className="section-subtitle">
              Clothes, jewellery, bakery, homemade food, gifts — if customers message you “price?” and “available?”, this is for you.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<CheckCircle className="overviewicon" />}
              title="Instagram &amp; WhatsApp sellers"
              text="Put a Shop link in your bio. Customers see all products, add to cart, and order — you stop typing the same replies."
              color="#10b981"
              delay="0ms"
            />
            <FeatureCard
              icon={<Globe className="overviewicon" />}
              title="Sell in Kerala"
              text="Your own keralasellers.in store link. Share it anywhere. Built for local delivery and Kerala customers."
              color="#3b82f6"
              delay="150ms"
            />
            <FeatureCard
              icon={<TrendingUp className="overviewicon" />}
              title="Orders in one place"
              text="Catalogue, cart, and order list instead of scattered chats. Billing for shops is available when you need it."
              color="#8b5cf6"
              delay="300ms"
            />
          </div>
        </div>

        <div className="arrow-connector">
          <ArrowDown size={40} className="pulse-icon" />
        </div>

        <div className="section flow-step" data-animate id="what-is">
          <div className="section-header">
            <div className="icon-wrapper">
              <Video className="overviewicon" color="#83aa4a" size={40} />
            </div>
            <h2 className="section-title">What is Kerala Sellers?</h2>
            <p className="section-subtitle">
              Watch this 2-minute video to see how you get a store and start taking orders
            </p>
          </div>

          <div className="video-wrapper">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ggkqC6ALK_c"
              title="What is Kerala Sellers"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<CheckCircle className="overviewicon" />}
              title="0% Commission"
              text="Keep 100% of your profits. No hidden charges ever."
              color="#10b981"
              delay="0ms"
            />
            <FeatureCard
              icon={<Globe className="overviewicon" />}
              title="Your Own Store Link"
              text="Get keralasellers.in/shop/yourname for your brand"
              color="#3b82f6"
              delay="150ms"
            />
            <FeatureCard
              icon={<TrendingUp className="overviewicon" />}
              title="Easy Setup"
              text="No technical knowledge required. Launch in 10 minutes."
              color="#8b5cf6"
              delay="300ms"
            />
          </div>
        </div>

        <div className="arrow-connector">
          <ArrowDown size={40} className="pulse-icon" />
        </div>

        <div className="section flow-step" data-animate id="step1">
          <div className="step-header-wrapper">
            <div className="step-header">
              <div className="step-number">1</div>
              <div className="step-header-text">
                <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Create Your Store</h2>
                <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>Register and setup your online shop</p>
              </div>
            </div>
          </div>

          <div className="video-wrapper">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/GTeeLBSYkjw"
              title="How to Create Store"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="steps-container">
            <div className="step-card">
              <CheckCircle size={24} color="#10b981" />
              <div>
                <h4>Register with OTP</h4>
                <p>Quick mobile verification</p>
              </div>
            </div>
            <div className="step-card">
              <CheckCircle size={24} color="#10b981" />
              <div>
                <h4>Add Shop Details</h4>
                <p>Name, logo, banner &amp; business info</p>
              </div>
            </div>
            <div className="step-card">
              <CheckCircle size={24} color="#10b981" />
              <div>
                <h4>Get Store Link</h4>
                <p>Paste it on Instagram, WhatsApp status, and Facebook</p>
              </div>
            </div>
          </div>

          <div className="cta-wrapper">
            <Link href="/register/seller" className="cta-primary">
              <Store size={20} />
              <span>Create Your Store</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="arrow-connector">
          <ArrowDown size={40} className="pulse-icon" />
        </div>

        <div className="section flow-step" data-animate id="step2">
          <div className="step-header-wrapper">
            <div className="step-header">
              <div className="step-number">2</div>
              <div className="step-header-text">
                <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Setup Payment Gateway</h2>
                <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>Connect Razorpay to receive payments</p>
              </div>
            </div>
          </div>

          <div className="video-wrapper">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ETjJ4BHp06o"
              title="Setup Razorpay"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="steps-container">
            <div className="step-card">
              <CheckCircle size={24} color="#10b981" />
              <div>
                <h4>Create Razorpay Account</h4>
                <p>Free business account</p>
              </div>
            </div>
            <div className="step-card">
              <CheckCircle size={24} color="#10b981" />
              <div>
                <h4>Complete KYC</h4>
                <p>Verify your business documents</p>
              </div>
            </div>
            <div className="step-card">
              <CheckCircle size={24} color="#10b981" />
              <div>
                <h4>Get API Keys</h4>
                <p>Connect to Kerala Sellers</p>
              </div>
            </div>
            <div className="step-card">
              <CheckCircle size={24} color="#10b981" />
              <div>
                <h4>Test Payments</h4>
                <p>Verify everything works</p>
              </div>
            </div>
          </div>

          <div className="cta-wrapper">
            <a
              href="https://razorpay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary"
            >
              <CreditCard size={20} />
              <span>Create Razorpay Account</span>
              <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <div className="arrow-connector">
          <ArrowDown size={40} className="pulse-icon" />
        </div>

        <div className="section flow-step" data-animate id="step3">
          <div className="step-header-wrapper">
            <div className="step-header">
              <div className="step-number">3</div>
              <div className="step-header-text">
                <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Add Products &amp; Start Selling</h2>
                <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>List your products and grow your business</p>
              </div>
            </div>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<Package className="overviewicon" />}
              title="Add Products"
              text="Upload images, set prices, manage stock easily"
              color="#10b981"
              delay="0ms"
            />
            <FeatureCard
              icon={<Store className="overviewicon" />}
              title="Manage Store"
              text="Track orders, inventory from dashboard"
              color="#3b82f6"
              delay="150ms"
            />
            <FeatureCard
              icon={<Award className="overviewicon" />}
              title="Grow Business"
              text="Share your store link, get more customers"
              color="#f59e0b"
              delay="300ms"
            />
          </div>

          <div className="success-banner">
            <Award size={48} color="#f59e0b" />
            <div>
              <h3>You&apos;re Ready to Sell!</h3>
              <p>Launch your store and start receiving orders today</p>
            </div>
          </div>

          <div className="cta-wrapper">
            <Link href="/register/seller" className="cta-primary large">
              <Store size={24} />
              <span>Launch Your Store Now</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        <div className="section" data-animate id="success">
          <div className="section-header">
            <h2 className="section-title">Join 1000+ Successful Sellers</h2>
            <p className="section-subtitle">
              Real stories from Kerala entrepreneurs
            </p>
          </div>

          <div className="trust-grid">
            <TestimonialCard
              name="Ramesh Kumar"
              location="Thiruvananthapuram"
              text="Zero commission helped me earn ₹2.5L+ monthly. Best decision for my electronics business!"
            />
            <TestimonialCard
              name="Priya Menon"
              location="Kochi"
              text="Started my handicrafts store in just 10 minutes. Very easy platform to use."
            />
            <TestimonialCard
              name="Abdul Rehman"
              location="Kozhikode"
              text="My own store link boosted my spices brand. Customers trust me more now!"
            />
          </div>
        </div>

        <div className="cta-section" data-animate id="final-cta">
          <div className="cta-content">
            <Star size={56} color="#f59e0b" style={{ marginBottom: '24px' }} />
            <h2 className="cta-title">Ready to move off DMs?</h2>
            <p className="cta-text">
              Join Kerala sellers who already sell on Instagram and WhatsApp. Get your store from a simple monthly plan. Launch in 10 minutes.
            </p>
            <div className="cta-buttons">
              <Link href="/register/seller" className="cta-primary">
                <Store className="storeicon" />
                <span>Create Your Free Store</span>
              </Link>
        <Link href="/products" className="cta-secondary">
          <span>Browse products</span>
        </Link>
            </div>
            <p style={{ marginTop: '24px', fontSize: '0.95rem', color: '#64748b' }}>
              No credit card required • 100% free to start • Launch in 10 minutes
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pulse-icon {
          animation: pulse 2.5s ease-in-out infinite;
          color: #83aa4a;
        }

        .flow-step {
          animation: fadeInUp 1s ease-out;
          animation-fill-mode: both;
        }

        .icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .video-wrapper {
          width: 100%;
          max-width: 900px;
          margin: 30px auto;
          aspect-ratio: 16/9;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }

        .video-wrapper iframe {
          width: 100%;
          height: 100%;
        }

        .arrow-connector {
          display: flex;
          justify-content: center;
          margin: 60px 0;
        }

        .step-header-wrapper {
          display: flex;
          margin-bottom: 40px;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 24px;
          max-width: 700px;
          width: 100%;
        }

        .step-header-text {
          flex: 1;
        }

        .step-number {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #83aa4a 0%, #6a8f3a 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 900;
          box-shadow: 0 12px 32px rgba(131, 170, 74, 0.35);
          flex-shrink: 0;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin: 30px auto;
          max-width: 700px;
        }

        .step-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 24px;
          background: #f8fafc;
          border-radius: 14px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .step-card:hover {
          border-color: #83aa4a;
          transform: translateX(8px);
          box-shadow: 0 4px 16px rgba(131, 170, 74, 0.15);
        }

        .step-card h4 {
          margin: 0 0 5px 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
        }

        .step-card p {
          margin: 0;
          font-size: 0.95rem;
          color: #64748b;
        }

        .cta-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 30px;
        }

        .success-banner {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 36px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 20px;
          margin: 40px auto 30px auto;
          border: 2px solid #fbbf24;
          max-width: 700px;
        }

        .success-banner h3 {
          margin: 0 0 8px 0;
          font-size: 1.8rem;
          font-weight: 800;
          color: #1e293b;
        }

        .success-banner p {
          margin: 0;
          font-size: 1.1rem;
          color: #64748b;
        }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 36px;
          background: #83aa4a;
          color: white;
          border-radius: 14px;
          font-size: 1.15rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(131, 170, 74, 0.3);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(131, 170, 74, 0.4);
        }

        .cta-primary.large {
          padding: 22px 48px;
          font-size: 1.4rem;
        }

        .testimonial-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #83aa4a 0%, #6a8f3a 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 800;
          margin: 0 auto 20px auto;
          box-shadow: 0 6px 20px rgba(131, 170, 74, 0.3);
        }

        @media (max-width: 768px) {
          .step-header {
            flex-direction: column;
            text-align: center;
          }

          .step-header-text h2,
          .step-header-text p {
            text-align: center !important;
          }

          .success-banner {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </>
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

function TestimonialCard({ name, location, text }) {
  return (
    <div className="trust-card animate-fade-up">
      <div className="testimonial-avatar">{name[0]}</div>
      <h4 className="trust-title">{name}</h4>
      <p className="trust-text" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
        {location}
      </p>
      <p className="trust-text" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}
