'use client';

import Link from 'next/link';
import {
  Store, CheckCircle, ArrowRight, Star, ArrowDown,
  CreditCard, Package, Award, Video, TrendingUp, Globe,
  Smartphone, Printer, Bell, Check, MessageCircle, Receipt,
  ShieldCheck, ShoppingBag, Sparkles, XCircle, Zap
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
            <Sparkles size={16} color="#f59e0b" />
            <span>All-In-One Solution • From ₹99/mo • 0% Commission</span>
          </div>

          <h1 className="hero-title">
            Your Own Online Store and{' '}
            <span className="hero-highlight">Business Management Platform</span>
          </h1>

          <p className="hero-subtitle" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a4845', marginBottom: '8px' }}>
            Your Own Online Store. All Your Business Tools. Starting at ₹99/Month.
          </p>

          <p className="hero-subtitle" style={{ marginTop: 0 }}>
            Create your own ecommerce store, manage products and inventory, handle billing, and connect with customers through one affordable platform built for small businesses in Kerala.
          </p>

          {/* 5 CORE PILLARS PILLS */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 10,
            margin: '20px 0 24px'
          }}>
            {[
              { icon: <ShoppingBag size={16} />, label: 'Online Store' },
              { icon: <Receipt size={16} />, label: 'Billing & POS' },
              { icon: <Package size={16} />, label: 'Inventory Management' },
              { icon: <Smartphone size={16} />, label: 'Mobile App' },
              { icon: <MessageCircle size={16} />, label: 'WhatsApp Sharing' },
            ].map((p, i) => (
              <span key={i} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                border: '1.5px solid #bbf7d0',
                borderRadius: 30,
                padding: '7px 15px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#1a4845',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}>
                <span style={{ color: '#10b981' }}>{p.icon}</span>
                {p.label}
              </span>
            ))}
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">₹99/mo</span>
              <span className="stat-label">Starting Plan</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0%</span>
              <span className="stat-label">Commission</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10min</span>
              <span className="stat-label">Setup Time</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">₹0</span>
              <span className="stat-label">Custom Site Cost</span>
            </div>
          </div>

          <div className="hero-cta">
            <Link href="/register/seller" className="primary-button">
              <Store className="storeicon" />
              <span>Start Your ₹99 Store Now</span>
            </Link>
            <Link href="/features" className="secondary-button">
              <span>View Plans &amp; Features</span>
            </Link>
          </div>
          <p style={{ marginTop: '14px', fontSize: '0.85rem', color: '#64748b' }}>
            Starter plan: ₹99/month, excluding applicable payment-gateway charges &amp; taxes • Up to 50 products • 0% platform commission • No technical skills required
          </p>

          {/* MOBILE APP QUICK HIGHLIGHT */}
          <div style={{
            marginTop: 22,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 16,
            padding: '14px 20px',
            display: 'inline-flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            border: '1px solid rgba(26, 72, 69, 0.15)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
            maxWidth: 720
          }}>
            <Smartphone size={20} color="#1a4845" />
            <span style={{ fontSize: '0.9rem', color: '#1a4845', fontWeight: 700 }}>
              Manage your store from your phone:
            </span>
            <span style={{ fontSize: '0.86rem', color: '#4b5563' }}>
              Add products, receive orders, update stock, and track payments using the Kerala Sellers mobile app.
            </span>
            <Link href="/mobile-app" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1a4845', textDecoration: 'underline' }}>
              Explore App →
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        {/* ── CORE CUSTOMER BENEFITS: WHAT WE PROVIDE & HOW IT SOLVES YOUR PROBLEMS ── */}
        <div className="section flow-step" data-animate id="customer-benefits" style={{ marginTop: '40px' }}>
          <div className="section-header">
            <span style={{
              display: 'inline-block',
              background: '#ecfdf5',
              color: '#065f46',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 10
            }}>
              Real Customer Benefits
            </span>
            <h2 className="section-title">Everything Your Business Needs in One Affordable Place</h2>
            <p className="section-subtitle" style={{ maxWidth: 760 }}>
              Not just another website builder. Kerala Sellers gives shop owners, makers, and social sellers a unified system to sell online, manage counter sales, and stay in control.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            marginTop: 32,
            textAlign: 'left'
          }}>
            {/* 1. Ecommerce Store */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 20,
              padding: '28px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ background: '#ecfdf5', color: '#059669', padding: 10, borderRadius: 14 }}>
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Pillar 1</span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a4845' }}>Get Your Own Ecommerce Store</h3>
                  </div>
                </div>
                <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                  Give your business its own branded storefront (<strong>keralasellers.in/shop/yourname</strong>). Customers browse your products, choose options, and place orders directly without waiting for DM replies.
                </p>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', borderLeft: '4px solid #10b981' }}>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#1e293b', fontWeight: 600 }}>
                    💡 How it solves your problem: Avoid paying ₹35,000–₹1,00,000 to web design agencies. Get a professional store live in 10 minutes from ₹99/mo.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/features/online-store-builder" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a4845', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Explore Store Builder <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* 2. Billing & POS */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 20,
              padding: '28px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ background: '#eff6ff', color: '#2563eb', padding: 10, borderRadius: 14 }}>
                    <Receipt size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>Pillar 2</span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a4845' }}>Affordable Billing &amp; POS</h3>
                  </div>
                </div>
                <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                  Manage walk-in counter sales with fast digital billing. Connect 58mm Bluetooth thermal printers to issue paper receipts in 2 seconds, with barcode scanning and cash/UPI tracking.
                </p>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', borderLeft: '4px solid #3b82f6' }}>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#1e293b', fontWeight: 600 }}>
                    💡 How it solves your problem: Replaces expensive ₹15,000/yr legacy billing desktop systems with simple mobile and cloud-based POS tools.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/features/pos-billing-software" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a4845', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Explore Billing &amp; POS <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* 3. Manage Business in One Place */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 20,
              padding: '28px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ background: '#fdf4ff', color: '#c026d3', padding: 10, borderRadius: 14 }}>
                    <Package size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#c026d3', textTransform: 'uppercase' }}>Pillar 3</span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a4845' }}>Manage Business in One Place</h3>
                  </div>
                </div>
                <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                  Unified inventory, online orders, and in-store sales in one dashboard. When an item is sold over the counter or online, stock auto-deducts everywhere in real time.
                </p>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', borderLeft: '4px solid #c026d3' }}>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#1e293b', fontWeight: 600 }}>
                    💡 How it solves your problem: Eliminates manual handwritten registers, Excel sheets, and embarrassing double-selling to customers.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/features/inventory-management" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a4845', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Explore Inventory Sync <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* 4. Mobile App Management */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 20,
              padding: '28px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ background: '#fffbeb', color: '#d97706', padding: 10, borderRadius: 14 }}>
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>Pillar 4</span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a4845' }}>Manage Store on Mobile</h3>
                  </div>
                </div>
                <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                  Take product photos from your phone camera, upload listings, adjust prices, get real-time order alerts, and track daily revenue on the go with the Kerala Sellers mobile app.
                </p>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', borderLeft: '4px solid #f59e0b' }}>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#1e293b', fontWeight: 600 }}>
                    💡 How it solves your problem: No computer or laptop required. You can operate your entire shop directly from your pocket.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/mobile-app" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a4845', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Explore Mobile App <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* 5. WhatsApp & Social Selling */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 20,
              padding: '28px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ background: '#f0fdf4', color: '#16a34a', padding: 10, borderRadius: 14 }}>
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>Pillar 5</span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1a4845' }}>Share Store on WhatsApp &amp; Bio</h3>
                  </div>
                </div>
                <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
                  Put your store link in your WhatsApp status, broadcast lists, and Instagram bio. Customers tap, browse your entire product catalogue, and pay online with instant Razorpay checkout.
                </p>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', borderLeft: '4px solid #22c55e' }}>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#1e293b', fontWeight: 600 }}>
                    💡 How it solves your problem: Stop typing "rate?", "size?", and sending manual UPI QR codes in 100 different DMs every single day.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/for/whatsapp-sellers" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a4845', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Explore WhatsApp Selling <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* 6. Zero Commission Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1a4845 0%, #133331 100%)',
              color: '#ffffff',
              borderRadius: 20,
              padding: '28px',
              boxShadow: '0 8px 24px rgba(26, 72, 69, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ background: 'rgba(255,255,255,0.15)', color: '#a3e635', padding: 10, borderRadius: 14 }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#a3e635', textTransform: 'uppercase' }}>Guarantee</span>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>0% Platform Commission</h3>
                  </div>
                </div>
                <p style={{ fontSize: '0.94rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: 16 }}>
                  Unlike food or marketplace aggregators that take 15% to 30% of your earnings, Kerala Sellers charges <strong>0% commission</strong> on your sales.
                </p>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', borderLeft: '4px solid #a3e635' }}>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#ffffff', fontWeight: 600 }}>
                    💡 Flat monthly subscription of ₹99. Every single rupee of customer profit goes straight into your bank account.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link href="/register/seller" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a3e635', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Start Free Registration <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROBLEM VS SOLUTION: THE OLD WAY VS THE KERALA SELLERS WAY ── */}
        <div className="section flow-step" data-animate id="comparison-section" style={{ marginTop: '60px' }}>
          <div className="section-header">
            <span style={{
              display: 'inline-block',
              background: '#fef3c7',
              color: '#b45309',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 10
            }}>
              Clear Comparison
            </span>
            <h2 className="section-title">The Old Way vs The Kerala Sellers Way</h2>
            <p className="section-subtitle">
              See why hundreds of Kerala retail shops, home bakers, and social sellers are making the switch.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            marginTop: 30
          }}>
            {/* Old Way */}
            <div style={{
              background: '#fff1f2',
              border: '2px solid #fecdd3',
              borderRadius: 20,
              padding: '28px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <XCircle size={26} color="#e11d48" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#9f1239' }}>The Old Way (Without Kerala Sellers)</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Spending ₹35,000–₹1,00,000 upfront on custom web agencies + hosting fees',
                  'Losing 15% to 30% of every sale to third-party delivery aggregators',
                  'Hours lost replying to "Price please?", "Available?", and "Size?" in messy WhatsApp DMs',
                  'Chasing customers for UPI payment screenshots and manual bank cross-checking',
                  'Handwritten registers and notebooks causing stock mix-ups and double-selling',
                  'Separate expensive POS software (₹15,000/yr) for the physical shop counter'
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.92rem', color: '#881337', lineHeight: 1.5 }}>
                    <span style={{ color: '#e11d48', fontWeight: 800, marginTop: 1 }}>✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kerala Sellers Way */}
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: 20,
              padding: '28px',
              textAlign: 'left',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <CheckCircle size={26} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>The Kerala Sellers Way (All-in-One)</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Starting at just ₹99/month. Zero upfront investment, no developer needed',
                  '0% marketplace commission — 100% of your earnings go straight to your bank account',
                  '1 branded store link in your bio and status: customers self-browse & order 24/7',
                  'Instant Razorpay UPI, card, and net banking checkout with automated verification',
                  'Unified real-time inventory: counter sales and online orders auto-sync live',
                  'Built-in mobile POS billing with 2-second thermal printing included from phone'
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.92rem', color: '#14532d', fontWeight: 600, lineHeight: 1.5 }}>
                    <span style={{ color: '#16a34a', fontWeight: 900, marginTop: 1 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── 3-STEP QUICK SETUP GUIDE & REGISTRATION URGENCY ── */}
        <div className="section flow-step" data-animate id="quick-store-guide" style={{ marginTop: '60px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #edf7f5 100%)',
            border: '2px solid #bbf7d0',
            borderRadius: 24,
            padding: '36px 30px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a4845', color: '#a3e635', padding: '6px 16px', borderRadius: 30, fontSize: '0.84rem', fontWeight: 800, marginBottom: 16 }}>
              <Zap size={16} /> 10-Minute Launch Guide
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#1a4845', margin: '0 0 10px 0' }}>
              Create Your Online Store in 3 Simple Steps
            </h2>
            <p style={{ fontSize: '1rem', color: '#475569', maxWidth: 640, margin: '0 auto 30px auto', lineHeight: 1.6 }}>
              No coding, no website developer, and no credit card required. Anyone in Kerala can set up their business today.
            </p>

            {/* Stepper Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 20,
              textAlign: 'left',
              marginBottom: 32
            }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '22px', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -14, left: 20,
                  background: '#1a4845', color: '#ffffff',
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.9rem'
                }}>1</div>
                <h3 style={{ margin: '10px 0 6px 0', fontSize: '1.1rem', fontWeight: 700, color: '#1a4845' }}>
                  Register with Mobile (60s)
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                  Enter your phone number and verify with instant OTP. Choose your shop URL (e.g. keralasellers.in/shop/yourbrand).
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '22px', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -14, left: 20,
                  background: '#1a4845', color: '#ffffff',
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.9rem'
                }}>2</div>
                <h3 style={{ margin: '10px 0 6px 0', fontSize: '1.1rem', fontWeight: 700, color: '#1a4845' }}>
                  Add Products from Phone
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                  Snap photos with your phone camera, set your prices, and add available stock quantities in 30 seconds.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '22px', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -14, left: 20,
                  background: '#1a4845', color: '#ffffff',
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.9rem'
                }}>3</div>
                <h3 style={{ margin: '10px 0 6px 0', fontSize: '1.1rem', fontWeight: 700, color: '#1a4845' }}>
                  Share Link &amp; Start Selling
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                  Share your store link on WhatsApp Status, Instagram bio, and Facebook. Accept orders with direct UPI payments!
                </p>
              </div>
            </div>

            {/* Registration Urgency CTA Box */}
            <div style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '24px',
              border: '2px solid #10b981',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              maxWidth: 580,
              margin: '0 auto'
            }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a4845' }}>
                Ready to take your business online today?
              </span>
              <Link
                href="/register/seller"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '16px 36px',
                  borderRadius: 14,
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                  transition: 'transform 0.2s',
                  width: '100%',
                  maxWidth: 380,
                  justifyContent: 'center'
                }}
              >
                <Store size={22} />
                <span>Register Now — Start at ₹99/mo</span>
                <ArrowRight size={20} />
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, fontSize: '0.82rem', color: '#64748b' }}>
                <span>✓ 10-Minute Setup</span>
                <span>✓ 0% Platform Commission</span>
                <span>✓ Direct UPI Settlements</span>
                <span>✓ Mobile App Included</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section flow-step" data-animate id="start-selling" style={{ marginTop: '50px' }}>
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
          <div className="cta-wrapper">
            <Link href="/sell-online-kerala" className="cta-primary">
              How to sell products online in Kerala
            </Link>
          </div>
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
                <h3 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Create Your Store</h3>
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
                <h3 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Setup Payment Gateway</h3>
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
                <h3 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Add Products &amp; Start Selling</h3>
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

        {/* MANAGE YOUR STORE FROM ANYWHERE (MOBILE APP FEATURE BLOCK) */}
        <div className="section flow-step" data-animate id="mobile-store-management">
          <div className="section-header">
            <div className="icon-wrapper">
              <Smartphone className="overviewicon" color="#83aa4a" size={40} />
            </div>
            <h2 className="section-title">Manage Your Store from Anywhere</h2>
            <p className="section-subtitle">
              Your complete store management system in your hand — run your online and offline business directly from your smartphone.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 18,
            marginTop: 28,
            textAlign: 'left'
          }}>
            {[
              { icon: <Package size={22} color="#1a4845" />, title: 'Add & Edit Products', text: 'Snap photos with your phone camera, set pricing, and add stock in 30 seconds.' },
              { icon: <CheckCircle size={22} color="#1a4845" />, title: 'Receive & Manage Orders', text: 'Get instant notifications when customers buy from your Instagram, WhatsApp, or website link.' },
              { icon: <TrendingUp size={22} color="#1a4845" />, title: 'Real-Time Stock Updates', text: 'Unified inventory updates automatically when an item is sold online or at the counter.' },
              { icon: <CreditCard size={22} color="#1a4845" />, title: 'Track Payments & Status', text: 'Monitor UPI, card payments, and COD settlements with live analytics.' },
              { icon: <Globe size={22} color="#1a4845" />, title: 'Share Store Link Instantly', text: '1-tap store link sharing to your Instagram bio, WhatsApp status, and direct messages.' },
              { icon: <Printer size={22} color="#1a4845" />, title: 'Mobile POS & Thermal Billing', text: 'Connect 58mm Bluetooth thermal printers for fast 2-second walk-in receipts.' },
              { icon: <Bell size={22} color="#1a4845" />, title: 'Instant Seller Notifications', text: 'Real-time order alerts pushed directly to your phone lock screen.' },
              { icon: <Award size={22} color="#1a4845" />, title: 'Customer Details & History', text: 'View buyer contact details, delivery addresses, and WhatsApp chats in one place.' },
            ].map((f, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '20px 22px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: '#f0fdf4', padding: 8, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {f.icon}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: '#1a4845' }}>{f.title}</h4>
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>{f.text}</p>
              </div>
            ))}
          </div>

          <div className="cta-wrapper" style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/mobile-app" className="cta-primary">
              <Smartphone size={20} />
              <span>Download the Mobile App</span>
            </Link>
            <Link href="/register/seller" className="cta-primary" style={{ background: '#1a4845', color: '#a3e635' }}>
              <Store size={20} />
              <span>Start Your Mobile Store (₹99/mo)</span>
            </Link>
          </div>
        </div>

        <div className="section" data-animate id="success">
          <div className="section-header">
            <h2 className="section-title">Join Kerala's Growing Community of Online Sellers</h2>
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

      {/* ── SEO: "Who is this for" internal links section ── */}
      <div className="container" style={{ paddingBottom: 48 }}>
        <div className="section" style={{ background: '#f0fdf4', borderRadius: 20, padding: '40px 32px', border: '1px solid #bbf7d0' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#1a4845', marginBottom: 8 }}>
            Solutions for your type of selling
          </p>
          <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)', fontWeight: 800, color: '#1a2b2a', marginBottom: 20 }}>
            Whatever You Sell, We Have a Solution
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { href: '/for/instagram-sellers', label: 'Instagram Sellers' },
              { href: '/for/whatsapp-sellers', label: 'WhatsApp Sellers' },
              { href: '/for/social-media-sellers', label: 'Social Media Sellers' },
              { href: '/for/home-businesses', label: 'Home Businesses' },
              { href: '/for/small-businesses', label: 'Small Businesses' },
              { href: '/solutions', label: 'All Solutions' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', border: '1px solid #bbf7d0', borderRadius: 12,
                padding: '12px 16px', textDecoration: 'none', color: '#1a4845',
                fontSize: '0.9rem', fontWeight: 600, transition: 'box-shadow 0.15s',
              }}>
                {item.label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[
              { href: '/features', label: 'All Features & Add-ons' },
              { href: '/features/online-store-builder', label: 'Store Builder' },
              { href: '/features/pos-billing-software', label: 'POS Billing Software' },
              { href: '/features/order-management', label: 'Order Management' },
              { href: '/features/inventory-management', label: 'Inventory Management' },
              { href: '/faq', label: 'FAQ' },
              { href: '/sell-online-kerala', label: 'Sell Online in Kerala' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'inline-block', padding: '7px 16px',
                background: '#ffffff', border: '1px solid #1a4845',
                borderRadius: 20, textDecoration: 'none',
                color: '#1a4845', fontSize: '0.85rem', fontWeight: 600,
              }}>
                {item.label}
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 28, fontSize: '1rem', color: '#374151', lineHeight: 1.65, fontStyle: 'italic', maxWidth: 640 }}>
            "Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, or a way to grow — Kerala Sellers is the solution."
          </p>
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
