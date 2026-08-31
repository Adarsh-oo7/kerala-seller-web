'use client';

import React from 'react';
import Link from 'next/link';
import SeoPageLayout from '../../components/seo/SeoPageLayout';
import FaqAccordion from '../../components/seo/FaqAccordion';
import DemoVideoSection from '../../components/seo/DemoVideoSection';
import ProblemSolutionSection from '../../components/seo/ProblemSolutionSection';
import HowItWorksSteps from '../../components/seo/HowItWorksSteps';
import TrustStatsBar from '../../components/seo/TrustStatsBar';
import TestimonialsGrid from '../../components/seo/TestimonialsGrid';
import {
  Store, CheckCircle2, ArrowRight, ShieldCheck, Zap, Globe, Package,
  TrendingUp, Users, Heart, MessageCircle, LayoutDashboard, Receipt, Bell,
  Share2, Lock, MapPin, Leaf, Smartphone, Sparkles, DollarSign
} from 'lucide-react';

const faqs = [
  {
    q: "How do I sell my products online in Kerala?",
    a: "Register on Kerala Sellers for free, add your shop name and logo, upload your products with photos and prices, then share your unique store link (keralasellers.in/shop/yourname) on Instagram, WhatsApp, Facebook, or anywhere. Your customers can browse and order directly — no DMs needed.",
  },
  {
    q: "Can I sell only in Kerala? I don't want pan-India shipping.",
    a: "Yes! Kerala Sellers is built specifically for Kerala-focused sellers. You control your delivery zones — you can set local district-level delivery or all-Kerala. Most sellers on our platform do Kerala-only delivery.",
  },
  {
    q: "I already sell on Instagram and WhatsApp. Why do I need this?",
    a: "Right now you're typing the same price replies hundreds of times. With Kerala Sellers, customers visit your store link, add to cart themselves, and place orders. You get an organised order list instead of scattered DMs. Zero commission, so all income stays yours.",
  },
  {
    q: "Is there any commission on sales?",
    a: "0% commission — forever. You pay only a small fixed monthly subscription for your store. Every rupee from sales goes directly to you via Razorpay into your bank account.",
  },
  {
    q: "How much does it cost to start an online store in Kerala?",
    a: "Creating an account is free. After setup, you choose a monthly subscription plan based on how many products you sell. Plans start at very affordable rates — much cheaper than building your own website or paying Amazon/Flipkart commissions.",
  },
  {
    q: "I run a home bakery / sell homemade food. Can I use this?",
    a: "Absolutely. Many of our sellers run home bakeries, homemade pickle businesses, handcraft shops, and jewellery pages. You set your products, prices, and availability. Customers order online and you deliver locally.",
  },
  {
    q: "Do I need technical knowledge to set up my online store?",
    a: "No coding or technical skills needed. Setup takes about 10 minutes: register with your phone number, fill in shop details, add product photos and prices, and your store is live. We have tutorial videos for every step.",
  },
  {
    q: "What payment methods can my customers use?",
    a: "Customers can pay via UPI, credit/debit cards, net banking, and wallets — all powered by Razorpay. Payments go directly into your Razorpay account and then to your bank.",
  },
  {
    q: "Can I manage orders and stock from my phone?",
    a: "Yes. Your seller dashboard works on mobile. You can view new orders, update stock levels, mark orders as delivered, and manage your product listings — all from your smartphone.",
  },
  {
    q: "Is Kerala Sellers different from Amazon or Flipkart?",
    a: "Very different. On Amazon/Flipkart you compete with thousands of sellers and pay 15-40% commission. On Kerala Sellers you have your own branded store, 0% commission, and you sell to your existing Kerala audience. It's your store — not a marketplace.",
  },
];

const problems = [
  {
    problem: "Typing price and availability replies 50+ times a day in DMs",
    solution: "Customers see all products with prices, photos, and stock status. They add to cart themselves.",
  },
  {
    problem: "Orders scattered across WhatsApp, Instagram, and Facebook Messenger",
    solution: "One clean order dashboard. All orders in one place with customer details and payment status.",
  },
  {
    problem: "Paying 15–40% commission to Meesho, Amazon, or other marketplaces",
    solution: "0% commission forever. Pay only a small fixed monthly fee. Every rupee of profit is yours.",
  },
  {
    problem: "No professional store link to share — just a personal Instagram account",
    solution: "Your own branded store link (keralasellers.in/shop/yourshopname) or custom subdomain — share anywhere.",
  },
  {
    problem: "Building a website costs ₹20,000–₹1,00,000 and takes months",
    solution: "Your online store is live in 10 minutes. No technical knowledge needed. No one-time setup cost.",
  },
  {
    problem: "Losing track of stock — overselling or forgetting to update availability",
    solution: "Stock management built in. Auto-update when products sell out. Never oversell again.",
  },
];

const features = [
  { icon: <Store size={24} color="#1a4845" />, title: "Your Own Branded Online Store", desc: "Get a personal store URL: keralasellers.in/shop/yourname. Professional, shareable, and 100% yours." },
  { icon: <MessageCircle size={24} color="#1a4845" />, title: "Perfect for Instagram & WhatsApp Sellers", desc: "Put your store link in Instagram bio or WhatsApp status. Customers browse and order without DMs." },
  { icon: <DollarSign size={24} color="#1a4845" />, title: "0% Commission — Forever", desc: "We charge a small fixed monthly fee. Every rupee from sales goes directly into your bank account." },
  { icon: <Zap size={24} color="#1a4845" />, title: "Launch in 10 Minutes", desc: "Register with OTP, add shop details, upload products — your store is live. No coding. No waiting." },
  { icon: <Package size={24} color="#1a4845" />, title: "Product Catalogue & Stock Sync", desc: "Upload product images, set prices, manage variants, track stock — all from your phone." },
  { icon: <LayoutDashboard size={24} color="#1a4845" />, title: "Order Management Dashboard", desc: "All orders in one clean dashboard. See customer details, payment status, and delivery info at a glance." },
  { icon: <Receipt size={24} color="#1a4845" />, title: "Billing for Offline Shops", desc: "Offline shop? Use the billing add-on to generate receipts. Bridge your physical store with online selling." },
  { icon: <Smartphone size={24} color="#1a4845" />, title: "Mobile-First Dashboard", desc: "Manage your entire business from your phone. Designed for Kerala sellers who work on mobile." },
  { icon: <Globe size={24} color="#1a4845" />, title: "Built for Kerala & Local Delivery", desc: "Set your delivery zones — district-level or all-Kerala. Built for local businesses, not pan-India logistics." },
  { icon: <Share2 size={24} color="#1a4845" />, title: "Share Anywhere — Social Media", desc: "Your store link works everywhere. Share on bio, status, stories, groups — customers click and order." },
];

export default function SellOnlineKeralaPage() {
  return (
    <SeoPageLayout breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sell Online in Kerala' }]}>
      
      {/* HERO */}
      <section className="seo-hero" aria-labelledby="sok-h1">
        <div className="seo-hero__inner">
          <div className="seo-hero__badge">
            <Sparkles size={14} color="#a3e635" />
            <span>Built for Sellers &amp; Small Businesses in Kerala</span>
          </div>

          <h1 className="seo-hero__h1" id="sok-h1">
            Sell Products Online in Kerala <em>Without the Complexity</em>
          </h1>

          <p className="seo-hero__sub">
            Create your own online store, accept orders, manage stock, and grow your business — all from your phone with 0% commission.
            <br /><em style={{ fontStyle: 'normal', opacity: 0.85, fontSize: '0.9em' }}>നിങ്ങൾക്ക് സ്വന്തമായി ഒരു ഓൺലൈൻ കട — 10 മിനിറ്റിൽ തുടങ്ങാം.</em>
          </p>

          <div className="seo-hero__pills">
            <span className="seo-hero__pill">✓ 0% Commission</span>
            <span className="seo-hero__pill">✓ 10-Minute Setup</span>
            <span className="seo-hero__pill">✓ Mobile-First App</span>
            <span className="seo-hero__pill">✓ WhatsApp &amp; Instagram Ready</span>
          </div>

          <div className="seo-hero__cta">
            <Link href="/register/seller" className="seo-btn-primary" id="sok-hero-cta">
              <Store size={18} />
              <span>Create Your Online Store Free →</span>
            </Link>
            <Link href="#how-it-works" className="seo-btn-secondary">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STATS BAR */}
      <TrustStatsBar
        stats={[
          { n: '1000+', l: 'Active Kerala Sellers' },
          { n: '0%', l: 'Commission Cut' },
          { n: '10 min', l: 'Store Setup' },
          { n: '100%', l: 'Mobile Ready' },
        ]}
      />

      {/* DEMO VIDEO SECTION */}
      <DemoVideoSection
        title="See How to Start Selling Online in Kerala"
        subtitle="Watch how easily a Kerala seller can launch a store, share links on WhatsApp/Instagram, and manage orders."
        videoTitle="How to Start Selling Online in Kerala"
        youtubeId="ggkqC6ALK_c"
      />

      {/* PROBLEMS → SOLUTIONS */}
      <ProblemSolutionSection
        title="Why Kerala Sellers Are Moving Away From DM Chaos"
        subtitle="Typing replies 50 times a day? Losing orders in WhatsApp chats? Here is how KeralaSellers solves it."
        items={problems}
      />

      {/* HOW IT WORKS */}
      <div id="how-it-works">
        <HowItWorksSteps
          title="From Zero to Live Online Store in 10 Minutes"
          subtitle="Everything is designed for non-technical sellers in Kerala."
        />
      </div>

      {/* FEATURES GRID */}
      <section className="seo-section">
        <div className="seo-section__header">
          <p className="seo-section__eyebrow">COMPLETE PLATFORM</p>
          <h2 className="seo-section__h2">Everything Included in Your KeralaSellers Store</h2>
          <p className="seo-section__lead">
            Start small, sell anywhere, and add features as your business grows.
          </p>
        </div>

        <div className="seo-features-grid">
          {features.map((f, i) => (
            <div key={i} className="seo-feature-card">
              <div className="seo-feature-card__icon-box">
                {f.icon}
              </div>
              <div>
                <h3 className="seo-feature-card__title">{f.title}</h3>
                <p className="seo-feature-card__desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsGrid />

      {/* BRAND CLOSER / CTA */}
      <section className="seo-closer">
        <p className="seo-closer__quote">
          "Whatever a seller is searching for — a store, an order tool, a way to sell on WhatsApp, or a way to grow — KeralaSellers is the solution."
        </p>
        <Link href="/register/seller" className="seo-btn-primary" id="sok-bottom-cta" style={{ background: '#a3e635', color: '#1a4845' }}>
          <Store size={18} />
          <span>Create Your Free Online Store →</span>
        </Link>
      </section>

      {/* INTERNAL LINKS BOX */}
      <section className="seo-section" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="seo-links-box">
          <p className="seo-links-box__title">Solutions &amp; Business Guides</p>
          <ul className="seo-links-box__list">
            <li><Link href="/for/instagram-sellers">Instagram Sellers</Link></li>
            <li><Link href="/for/whatsapp-sellers">WhatsApp Sellers</Link></li>
            <li><Link href="/for/home-businesses">Home Businesses</Link></li>
            <li><Link href="/for/small-businesses">Small Businesses</Link></li>
            <li><Link href="/features">All Features &amp; Add-ons</Link></li>
            <li><Link href="/features/online-store-builder">Store Builder</Link></li>
            <li><Link href="/features/pos-billing-software">POS Billing Software</Link></li>
            <li><Link href="/features/order-management">Order Management</Link></li>
            <li><Link href="/features/inventory-management">Inventory Management</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="seo-faq">
        <h2 className="seo-faq__h2">Frequently Asked Questions</h2>
        <FaqAccordion faqs={faqs} />
      </section>

    </SeoPageLayout>
  );
}
