'use client';

import Link from 'next/link';
import SeoPageLayout from '../../../components/seo/SeoPageLayout';
import { BRAND } from '../../lib/brand';
import {
  Code2,
  Layers,
  Cpu,
  Server,
  Smartphone,
  Printer,
  ShieldCheck,
  Globe,
  Database,
  CreditCard,
  Sparkles,
  CheckCircle2,
  User,
  Building2,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export default function ProjectDevelopmentCaseStudyPage() {
  return (
    <SeoPageLayout
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Project Development' },
      ]}
    >
      {/* ── HERO SECTION ── */}
      <section className="seo-hero" aria-labelledby="dev-case-study-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Sparkles size={14} color="#a3e635" />
            <span>Project Case Study &amp; Technical Architecture</span>
          </div>

          <h1 className="seo-hero__h1" id="dev-case-study-h1">
            Engineering <em>Kerala Sellers</em>: Architecture &amp; Development
          </h1>

          <p className="seo-hero__sub">
            How Kerala Sellers was designed, architected, and built to give local merchants an affordable, zero-commission ecommerce and wireless POS thermal billing ecosystem.
          </p>

          <div className="seo-hero__pills">
            {['✓ Next.js 16 Web App', '✓ Python / Django REST API', '✓ Mobile POS Thermal Printing', '✓ 0% Commission SaaS'].map((pill) => (
              <span key={pill} className="seo-hero__pill">
                {pill}
              </span>
            ))}
          </div>

          <div className="seo-hero__cta">
            <Link href="#architecture" className="seo-btn-primary">
              <span>Explore Tech Stack</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="#attribution" className="seo-btn-secondary">
              <span>Developer Attribution</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── OFFICIAL ATTRIBUTION CALLOUT BAR ── */}
      <section style={{ maxWidth: '1100px', margin: '-24px auto 40px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            background: '#ffffff',
            border: '2px solid #83aa4a',
            borderRadius: '16px',
            padding: '24px 30px',
            boxShadow: '0 10px 30px rgba(26, 72, 69, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 500px' }}>
            <span
              style={{
                display: 'inline-block',
                background: '#FDFFF0',
                color: '#1a4845',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                marginBottom: '8px',
              }}
            >
              Official Project Attribution
            </span>
            <p
              style={{
                margin: 0,
                fontSize: '1.05rem',
                color: '#1a4845',
                lineHeight: 1.6,
                fontWeight: 600,
              }}
            >
              Kerala Sellers is developed and maintained by{' '}
              <a
                href={BRAND.parent.url}
                rel="noopener noreferrer"
                style={{
                  color: '#1a4845',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  fontWeight: 700,
                }}
              >
                {BRAND.parent.name}
              </a>
              , with development contributions from{' '}
              <a
                href={BRAND.developer.portfolio}
                rel="noopener noreferrer"
                style={{
                  color: '#1a4845',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  fontWeight: 700,
                }}
              >
                {BRAND.developer.name}
              </a>
              .
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href={BRAND.developer.portfolio}
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#1a4845',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <User size={15} />
              <span>Adarsh Portfolio</span>
            </a>
            <a
              href={BRAND.parent.url}
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#f8fafc',
                color: '#1a4845',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Building2 size={15} />
              <span>DPS Website</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: THE PROBLEM & MOTIVATION ── */}
      <section className="seo-section" aria-labelledby="problem-heading">
        <div className="seo-section__header">
          <p className="seo-section__eyebrow">Project Background &amp; Intent</p>
          <h2 className="seo-section__h2" id="problem-heading">
            Why Kerala Sellers Was Built
          </h2>
          <p className="seo-section__lead">
            Understanding the real operational and commercial bottlenecks faced by neighborhood shops and micro-entrepreneurs across Kerala.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '24px' }}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'inline-flex', padding: '10px', background: '#fee2e2', borderRadius: '12px', marginBottom: '16px' }}>
              <Building2 size={24} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#1a4845', margin: '0 0 10px', fontWeight: 700 }}>
              The Custom Website Barrier
            </h3>
            <p style={{ fontSize: '0.94rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Traditional web agencies charge between ₹35,000 and ₹1,00,000 to develop an ecommerce website. Small retailers, home bakers, and Instagram boutiques in Kerala cannot justify such high capital expenditure before proving customer traction.
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'inline-flex', padding: '10px', background: '#fef3c7', borderRadius: '12px', marginBottom: '16px' }}>
              <CreditCard size={24} color="#d97706" />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#1a4845', margin: '0 0 10px', fontWeight: 700 }}>
              Aggregator Commission Traps
            </h3>
            <p style={{ fontSize: '0.94rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Large ecommerce marketplaces and delivery aggregators levy 15% to 40% commission cuts per sale. For small merchants with single-digit retail margins, aggregator fees render online sales virtually unprofitable.
            </p>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'inline-flex', padding: '10px', background: '#dcfce7', borderRadius: '12px', marginBottom: '16px' }}>
              <Printer size={24} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#1a4845', margin: '0 0 10px', fontWeight: 700 }}>
              Disconnected Billing &amp; Stock
            </h3>
            <p style={{ fontSize: '0.94rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Local shops commonly maintain a manual counter billing machine or notebook, leaving online WhatsApp and Instagram orders disconnected. This causes stock mismatches, manual message chasing, and double-selling errors.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TECHNICAL ARCHITECTURE & TECH STACK ── */}
      <section className="seo-section seo-section--alt" id="architecture" aria-labelledby="arch-heading">
        <div className="seo-section__header">
          <p className="seo-section__eyebrow">Full-Stack Architecture</p>
          <h2 className="seo-section__h2" id="arch-heading">
            Technology Stack &amp; Implementation Details
          </h2>
          <p className="seo-section__lead">
            Kerala Sellers is built with modern, battle-tested technologies engineered for high performance, mobile reliability, and low latency.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', maxWidth: '1150px', margin: '0 auto' }}>
          {/* Frontend */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: '#e0f2fe', borderRadius: '12px' }}>
                <Globe size={24} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: '1.18rem', color: '#1a4845', margin: 0, fontWeight: 700 }}>
                Frontend Web Tier: Next.js
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.93rem', lineHeight: 1.7 }}>
              <li><strong>Framework:</strong> Next.js 16 (React, App Router, Turbopack)</li>
              <li><strong>Rendering:</strong> Hybrid SSR and client-side rendering for instant page transitions and maximum SEO discoverability</li>
              <li><strong>Styling:</strong> Customized CSS design tokens with optimized performance, zero layout shift (CLS), and fluid responsive typography</li>
              <li><strong>PWA:</strong> Mobile-first viewport optimization for seamless touch interactions on budget smartphones</li>
            </ul>
          </div>

          {/* Backend API */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: '#dcfce7', borderRadius: '12px' }}>
                <Server size={24} color="#16a34a" />
              </div>
              <h3 style={{ fontSize: '1.18rem', color: '#1a4845', margin: 0, fontWeight: 700 }}>
                Backend: Python / Django REST
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.93rem', lineHeight: 1.7 }}>
              <li><strong>Core API:</strong> Python-powered Django REST Framework (DRF) backend exposing secure REST endpoints</li>
              <li><strong>Multi-Tenancy:</strong> Partitioned merchant store environments with isolated vendor catalogs, pricing tiers, and inventory locks</li>
              <li><strong>Order Pipeline:</strong> Robust transaction state-machine tracking orders from checkout to delivery status</li>
              <li><strong>Security:</strong> Granular role-based access control protecting merchant financials and customer PII</li>
            </ul>
          </div>

          {/* Auth & Identity */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '12px' }}>
                <ShieldCheck size={24} color="#d97706" />
              </div>
              <h3 style={{ fontSize: '1.18rem', color: '#1a4845', margin: 0, fontWeight: 700 }}>
                Auth: Firebase Phone OTP
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.93rem', lineHeight: 1.7 }}>
              <li><strong>SMS Verification:</strong> Firebase Phone Authentication enabling passwordless login via mobile OTP</li>
              <li><strong>Frictionless Onboarding:</strong> Merchant onboarding completed in under 2 minutes using standard Indian phone numbers</li>
              <li><strong>Buyer Authentication:</strong> Secure customer verification during checkout to avoid spam and unverified COD orders</li>
            </ul>
          </div>

          {/* Payments */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '12px' }}>
                <CreditCard size={24} color="#0f172a" />
              </div>
              <h3 style={{ fontSize: '1.18rem', color: '#1a4845', margin: 0, fontWeight: 700 }}>
                Payments: Razorpay Integration
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.93rem', lineHeight: 1.7 }}>
              <li><strong>Multi-Channel Payouts:</strong> Direct UPI (Google Pay, PhonePe, Paytm), debit/credit cards, and Net Banking</li>
              <li><strong>Webhook Security:</strong> Asynchronous signature verification for instantaneous payment reconciliations</li>
              <li><strong>0% Platform Cuts:</strong> Direct settlement architecture where merchant proceeds go directly to bank accounts</li>
            </ul>
          </div>

          {/* POS Hardware & Printing */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: '#fae8ff', borderRadius: '12px' }}>
                <Printer size={24} color="#a21caf" />
              </div>
              <h3 style={{ fontSize: '1.18rem', color: '#1a4845', margin: 0, fontWeight: 700 }}>
                Mobile POS: Thermal Printing
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.93rem', lineHeight: 1.7 }}>
              <li><strong>Standard:</strong> ESC/POS binary command protocol generation</li>
              <li><strong>Connectivity:</strong> Web Bluetooth API &amp; Android intent pairing for 58mm &amp; 80mm wireless thermal printers</li>
              <li><strong>Speed:</strong> Instant 2-second physical receipt generation directly from mobile browser or app during counter sales</li>
            </ul>
          </div>

          {/* Real-time Inventory */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: '#dbeafe', borderRadius: '12px' }}>
                <Database size={24} color="#2563eb" />
              </div>
              <h3 style={{ fontSize: '1.18rem', color: '#1a4845', margin: 0, fontWeight: 700 }}>
                Synchronized Inventory Engine
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.93rem', lineHeight: 1.7 }}>
              <li><strong>Atomic Updates:</strong> Database transactions ensure counter sales immediately decrement online product counts</li>
              <li><strong>Variant Support:</strong> Independent inventory tracking across sizes, weights, and colour variants</li>
              <li><strong>Low-Stock Safeguards:</strong> Automated notifications prevent out-of-stock purchases</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: REAL APPLICATION SHOWCASE & SCREENSHOTS ── */}
      <section className="seo-section" aria-labelledby="showcase-heading">
        <div className="seo-section__header">
          <p className="seo-section__eyebrow">Product Showcase</p>
          <h2 className="seo-section__h2" id="showcase-heading">
            Kerala Sellers in Action
          </h2>
          <p className="seo-section__lead">
            Real interface components from the production Kerala Sellers platform.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', maxWidth: '1100px', margin: '0 auto' }}>
          {/* Showcase Item 1: Multi-tenant Storefront */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 6px 24px rgba(0,0,0,0.04)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
            }}
          >
            <div style={{ padding: '36px' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                }}
              >
                Multi-Tenant Storefront
              </span>
              <h3 style={{ fontSize: '1.4rem', color: '#1a4845', margin: '0 0 14px', fontWeight: 700 }}>
                Branded Merchant Catalogs &amp; Marketplace
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>
                Every enrolled merchant receives their own distinct URL slug (e.g. <code>keralasellers.in/shop/yourbrand</code>) complete with custom logo, banner, product filters, cart management, and checkout.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link
                  href="/shop"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#1a4845',
                    textDecoration: 'underline',
                  }}
                >
                  <span>Browse Active Shops</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div style={{ background: '#f8fafc', padding: '24px', textAlign: 'center' }}>
              <img
                src="/assets/images/Shoppagebanner.png"
                alt="Kerala Sellers Shop Directory and Marketplace Interface Banner"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                }}
                loading="lazy"
              />
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '8px 0 0' }}>
                Production UI: Kerala Sellers Shop Discovery &amp; Merchant Hub
              </p>
            </div>
          </div>

          {/* Showcase Item 2: Seller Onboarding & Social Selling */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 6px 24px rgba(0,0,0,0.04)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center',
            }}
          >
            <div style={{ background: '#f8fafc', padding: '24px', textAlign: 'center' }}>
              <img
                src="/assets/images/Banner/1.png"
                alt="Kerala Sellers 10-Minute Merchant Store Creation Workflow"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                }}
                loading="lazy"
              />
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '8px 0 0' }}>
                Production UI: Instant Seller Onboarding &amp; Store Setup
              </p>
            </div>
            <div style={{ padding: '36px' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: '#fef3c7',
                  color: '#b45309',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                }}
              >
                Zero Code Experience
              </span>
              <h3 style={{ fontSize: '1.4rem', color: '#1a4845', margin: '0 0 14px', fontWeight: 700 }}>
                10-Minute Instant Setup for Local Sellers
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>
                Rather than spending weeks configuring databases or DNS records, sellers enter their phone number, verify via OTP, set their shop name, upload products, and start accepting online orders within minutes.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link
                  href="/features/online-store-builder"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#1a4845',
                    textDecoration: 'underline',
                  }}
                >
                  <span>Store Builder Details</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: DEVELOPER & COMPANY ATTRIBUTION ── */}
      <section className="seo-section seo-section--alt" id="attribution" aria-labelledby="attr-heading">
        <div className="seo-section__header">
          <p className="seo-section__eyebrow">Project Ownership &amp; Contributors</p>
          <h2 className="seo-section__h2" id="attr-heading">
            Developer &amp; Organization Attribution
          </h2>
          <p className="seo-section__lead">
            Kerala Sellers is proudly engineered and sustained by dedicated digital product professionals.
          </p>
        </div>

        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Formal Attribution Statement Card */}
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #1a4845',
              borderRadius: '20px',
              padding: '36px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(26, 72, 69, 0.08)',
              marginBottom: '36px',
            }}
          >
            <p
              style={{
                fontSize: '1.25rem',
                color: '#1a4845',
                lineHeight: 1.7,
                margin: '0 0 16px',
                fontWeight: 600,
                fontFamily: "'Jost', sans-serif",
              }}
            >
              &ldquo;Kerala Sellers is developed and maintained by{' '}
              <a
                href={BRAND.parent.url}
                rel="noopener noreferrer"
                style={{
                  color: '#1a4845',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                }}
              >
                {BRAND.parent.name}
              </a>
              , with development contributions from{' '}
              <a
                href={BRAND.developer.portfolio}
                rel="noopener noreferrer"
                style={{
                  color: '#1a4845',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                }}
              >
                {BRAND.developer.name}
              </a>
              .&rdquo;
            </p>
            <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              This attribution reflects the project's genuine ownership and development history, representing full-stack software development, architectural design, ongoing maintenance, and operations.
            </p>
          </div>

          {/* Side by side profile cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Developer: Adarsh B S */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: '#1a4845',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                    }}
                  >
                    A
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1a4845', fontWeight: 700 }}>
                      <a
                        href={BRAND.developer.portfolio}
                        rel="noopener noreferrer"
                        style={{ color: '#1a4845', textDecoration: 'none' }}
                      >
                        {BRAND.developer.name}
                      </a>
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#83aa4a', fontWeight: 600 }}>
                      Founder &amp; Lead Developer
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Conceived Kerala Sellers to break down digital commerce barriers for Kerala retailers. Led the software architecture, full-stack Next.js and Python development, payment gateway integration, and thermal printer hardware connectivity.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
                  <div><strong>Focus:</strong> System Architecture, Core Engineering &amp; Growth</div>
                  <div><strong>Location:</strong> Kerala, India</div>
                </div>
              </div>

              <div>
                <a
                  href={BRAND.developer.portfolio}
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#1a4845',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  <span>Visit Developer Portfolio</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Company: Digital Product Solutions */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: '#83aa4a',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                    }}
                  >
                    DPS
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1a4845', fontWeight: 700 }}>
                      <a
                        href={BRAND.parent.url}
                        rel="noopener noreferrer"
                        style={{ color: '#1a4845', textDecoration: 'none' }}
                      >
                        {BRAND.parent.name}
                      </a>
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#1a4845', fontWeight: 600 }}>
                      Parent Organization &amp; Engineering Agency
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Digital Product Solutions is a digital product and software engineering company. It oversees Kerala Sellers' cloud infrastructure, long-term technical roadmap, security operations, and platform maintenance.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
                  <div><strong>Specialty:</strong> SaaS Architecture, Cloud Systems &amp; Web Platforms</div>
                  <div><strong>Website:</strong> digitalproductsolutions.in</div>
                </div>
              </div>

              <div>
                <a
                  href={BRAND.parent.url}
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#1a4845',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  <span>Visit Company Website</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: REAL-WORLD CORE PRINCIPLES ── */}
      <section className="seo-section" aria-labelledby="principles-heading">
        <div className="seo-section__header">
          <p className="seo-section__eyebrow">Engineering Philosophy</p>
          <h2 className="seo-section__h2" id="principles-heading">
            Guiding Development Principles
          </h2>
          <p className="seo-section__lead">
            The technical and ethical standards that guide every feature we release.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1050px', margin: '0 auto' }}>
          <div style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#1a4845', fontWeight: 700 }}>
              1. Zero-Commission by Design
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
              We believe a software platform should charge for software, not take a percentage of merchant hard work. Our ₹99/month subscription model preserves 100% of merchant sales revenue.
            </p>
          </div>

          <div style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#1a4845', fontWeight: 700 }}>
              2. Mobile-First Cellular Performance
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
              Engineered to load fast even on moderate 3G/4G connections across Tier 2 and Tier 3 towns in Kerala, avoiding heavy single-page application bundle bloat.
            </p>
          </div>

          <div style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', color: '#1a4845', fontWeight: 700 }}>
              3. Honest Technical Operations
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
              No exaggerated numbers, no fake client testimonials, and no artificial hype. We publish factual capabilities, transparent pricing, and genuine product walkthroughs.
            </p>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION SECTION ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1a4845 0%, #245b57 100%)',
          color: '#ffffff',
          padding: '60px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, margin: '0 0 16px', color: '#ffffff' }}>
            Experience Kerala Sellers Today
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#d1fae5', lineHeight: 1.6, margin: '0 0 28px' }}>
            Whether you are looking to browse verified Kerala products or launch your own online shop with mobile thermal billing, Kerala Sellers is ready.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/register/seller"
              style={{
                background: '#83aa4a',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.98rem',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(131, 170, 74, 0.4)',
              }}
            >
              Start Your Store (₹99/mo)
            </Link>
            <Link
              href="/products"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '14px 26px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.98rem',
                textDecoration: 'none',
              }}
            >
              Browse Products
            </Link>
            <Link
              href="/about"
              style={{
                background: 'transparent',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '14px 24px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.98rem',
                textDecoration: 'none',
              }}
            >
              About Company
            </Link>
          </div>
        </div>
      </section>
    </SeoPageLayout>
  );
}
