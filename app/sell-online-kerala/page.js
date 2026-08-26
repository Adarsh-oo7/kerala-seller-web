'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './SellOnlineKerala.css';
import {
  Store, CheckCircle, ArrowRight, Star, Shield, Zap, Globe, Package,
  TrendingUp, Users, Heart, MessageCircle, LayoutDashboard, Receipt, Bell,
  Share2, Lock, ChevronDown, ChevronUp, MapPin, Leaf, BadgeCheck, Smartphone
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
    emoji: "😩",
    problem: "Typing price and availability replies 50+ times a day in DMs",
    solution: "Customers see all products with prices, photos, and stock status. They add to cart themselves.",
  },
  {
    emoji: "😵",
    problem: "Orders scattered across WhatsApp, Instagram, and Facebook Messenger",
    solution: "One clean order dashboard. All orders in one place with customer details and payment status.",
  },
  {
    emoji: "💸",
    problem: "Paying 15–40% commission to Meesho, Amazon, or other marketplaces",
    solution: "0% commission forever. Pay only a small fixed monthly fee. Every rupee of profit is yours.",
  },
  {
    emoji: "😰",
    problem: "No professional store link to share — just a personal Instagram account",
    solution: "Your own branded store: keralasellers.in/shop/yourshopname — share it anywhere.",
  },
  {
    emoji: "🤯",
    problem: "Building a website costs ₹20,000–₹1,00,000 and takes months",
    solution: "Your online store is live in 10 minutes. No technical knowledge needed. No one-time setup cost.",
  },
  {
    emoji: "📦",
    problem: "Losing track of stock — overselling or forgetting to update availability",
    solution: "Stock management built in. Auto-update when products sell out. Never oversell again.",
  },
];

const features = [
  { icon: "🏪", title: "Your Own Branded Online Store", desc: "Get a personal store URL: keralasellers.in/shop/yourname. Professional, shareable, and 100% yours.", color: "#1a4845" },
  { icon: "📸", title: "Perfect for Instagram & WhatsApp Sellers", desc: "Put your store link in Instagram bio or WhatsApp status. Customers browse and order without DMs.", color: "#E1306C" },
  { icon: "💰", title: "0% Commission — Forever", desc: "We charge a small fixed monthly fee. Every rupee from sales goes directly into your bank account.", color: "#10b981" },
  { icon: "⚡", title: "Launch in 10 Minutes", desc: "Register with OTP, add shop details, upload products — your store is live. No coding. No waiting.", color: "#f59e0b" },
  { icon: "📦", title: "Product Catalogue & Stock Management", desc: "Upload product images, set prices, manage variants, track stock — all from your phone.", color: "#8b5cf6" },
  { icon: "📊", title: "One-Place Order Management Dashboard", desc: "All orders in one clean dashboard. See customer details, payment status, and delivery info at a glance.", color: "#3b82f6" },
  { icon: "🧾", title: "Billing for Offline Shops", desc: "Offline shop? Use the billing add-on to generate receipts. Bridge your physical store with online selling.", color: "#1a4845" },
  { icon: "📱", title: "Mobile-First Dashboard", desc: "Manage your entire business from your phone. Designed for Kerala sellers who work on mobile.", color: "#83aa4a" },
  { icon: "🌐", title: "Built for Kerala & Local Delivery", desc: "Set your delivery zones — district-level or all-Kerala. Built for local businesses, not pan-India logistics.", color: "#0ea5e9" },
  { icon: "🔗", title: "Share Anywhere — Instagram, WhatsApp, Facebook", desc: "Your store link works everywhere. Share on bio, status, stories, groups — customers click and order.", color: "#ec4899" },
  { icon: "🔒", title: "Secure Razorpay Payments", desc: "UPI, cards, net banking, wallets — all payment methods accepted. Money goes directly to your account.", color: "#f59e0b" },
  { icon: "🔔", title: "Instant Order Notifications", desc: "Get notified the moment a customer places an order. Never miss a sale again.", color: "#10b981" },
  { icon: "📈", title: "Business Analytics", desc: "See your top products, revenue trends, and sales performance. Make smarter business decisions.", color: "#6366f1" },
  { icon: "🤝", title: "Kerala-Focused Seller Community", desc: "Join 1000+ active Kerala sellers. Be part of a growing local business community.", color: "#1a4845" },
  { icon: "❤️", title: "Wishlist & Repeat Customers", desc: "Buyers can save products to wishlist and return to purchase. Build loyal customers effortlessly.", color: "#ef4444" },
];

const sellerTypes = [
  { emoji: "👗", label: "Clothes & Fashion" },
  { emoji: "💍", label: "Jewellery" },
  { emoji: "🎂", label: "Home Bakery" },
  { emoji: "🌶️", label: "Homemade Food & Pickles" },
  { emoji: "🧸", label: "Gifts & Handicrafts" },
  { emoji: "📱", label: "Electronics & Gadgets" },
  { emoji: "🌿", label: "Ayurvedic & Herbal" },
  { emoji: "🏠", label: "Home Decor" },
  { emoji: "📚", label: "Books & Stationery" },
  { emoji: "🧴", label: "Beauty & Skincare" },
  { emoji: "🐟", label: "Fish & Seafood" },
  { emoji: "🌾", label: "Farm & Organic Produce" },
];

const stats = [
  { number: "1000+", label: "Active Sellers", sub: "across Kerala" },
  { number: "0%", label: "Commission", sub: "forever, guaranteed" },
  { number: "10 min", label: "Setup Time", sub: "no coding needed" },
  { number: "14+", label: "Districts", sub: "covered across Kerala" },
];

const testimonials = [
  { initial: "R", name: "Ramesh Kumar", location: "Thiruvananthapuram", business: "Electronics Shop", text: "Zero commission helped me earn ₹2.5L+ monthly. I was paying huge fees on other platforms. Best decision for my electronics business!", rating: 5 },
  { initial: "P", name: "Priya Menon", location: "Kochi", business: "Handicrafts & Gifts", text: "Started my handicrafts store in just 10 minutes. Very easy platform. Now my Instagram DMs are only for customer feedback, not orders!", rating: 5 },
  { initial: "A", name: "Abdul Rehman", location: "Kozhikode", business: "Spices & Food", text: "My own store link boosted my spices brand. Customers trust me more now. I send the link and they order — no back-and-forth messages.", rating: 5 },
  { initial: "S", name: "Sreeja Nair", location: "Thrissur", business: "Home Bakery", text: "Running my cake business from home. Kerala Sellers gave me a professional online presence I could never afford to build myself.", rating: 5 },
];

export default function SellOnlineKeralaPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  return (
    <div className="sok-page" style={{ backgroundColor: "#FDFFF0", minHeight: "100vh" }}>
      <Header />
      <nav aria-label="Breadcrumb" className="sok-container" style={{ paddingTop: 16, fontSize: 14, color: '#64748b' }}>
        <Link href="/" style={{ color: '#1a4845', textDecoration: 'none' }}>Home</Link>
        <span>{' / '}</span>
        <span>Sell online in Kerala</span>
      </nav>

      {/* HERO */}
      <section className="sok-hero" aria-label="Hero section">
        <div className="sok-hero-bg-pattern" aria-hidden="true" />
        <div className="sok-container">
          <div className="sok-hero-badge">
            <span>🌿</span>
            <span>Kerala's #1 Online Store Platform for Local Sellers</span>
          </div>
          <h1 className="sok-hero-title">
            Sell Your Products Online in Kerala —<br />
            <span className="sok-highlight">Without Paying Commission</span>
          </h1>
          <p className="sok-hero-sub">
            Already selling on Instagram or WhatsApp? Get your own Kerala store link, let customers
            order themselves, and keep 100% of your sales. Setup takes 10 minutes. No coding. No website cost.
          </p>

          <div className="sok-hero-pills">
            <span className="sok-pill">✓ 0% Commission Forever</span>
            <span className="sok-pill">✓ Your Own Store Link</span>
            <span className="sok-pill">✓ Launch in 10 Minutes</span>
            <span className="sok-pill">✓ Built for Kerala</span>
          </div>

          <div className="sok-hero-cta">
            <Link href="/register/seller" className="sok-btn-primary" id="hero-start-selling-btn">
              🏪 Start Selling Online in Kerala — Free →
            </Link>
            <Link href="/shop" className="sok-btn-secondary" id="hero-browse-shops-btn">
              Browse Kerala Shops
            </Link>
          </div>

          <div className="sok-hero-stats">
            {stats.map((s, i) => (
              <div className="sok-stat" key={i}>
                <span className="sok-stat-num">{s.number}</span>
                <span className="sok-stat-label">{s.label}</span>
                <span className="sok-stat-sub">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM → SOLUTION */}
      <section className={`sok-section sok-problems${isVisible['problems'] ? ' sok-visible' : ''}`} id="problems" data-animate>
        <div className="sok-container">
          <div className="sok-section-header">
            <span className="sok-section-tag">The Problem We Solve</span>
            <h2 className="sok-section-title">Sound Familiar? These Are the Problems Kerala Sellers Face Every Day</h2>
            <p className="sok-section-sub">We built Kerala Sellers specifically to solve the pain points of Instagram and WhatsApp-based sellers in Kerala.</p>
          </div>
          <div className="sok-problems-grid">
            {problems.map((item, i) => (
              <div className="sok-problem-card" key={i}>
                <div className="sok-problem-top">
                  <span className="sok-problem-emoji">{item.emoji}</span>
                  <p className="sok-problem-text"><strong>Problem:</strong> {item.problem}</p>
                </div>
                <div className="sok-solution-bottom">
                  <span className="sok-solution-icon">✅</span>
                  <p className="sok-solution-text"><strong>Solution:</strong> {item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={`sok-section sok-how${isVisible['how'] ? ' sok-visible' : ''}`} id="how" data-animate>
        <div className="sok-container">
          <div className="sok-section-header">
            <span className="sok-section-tag">How It Works</span>
            <h2 className="sok-section-title">Start Selling Online in Kerala in 3 Simple Steps</h2>
            <p className="sok-section-sub">From zero to live online store in under 10 minutes — no developer needed.</p>
          </div>
          <div className="sok-steps">
            <div className="sok-step">
              <div className="sok-step-num">1</div>
              <div className="sok-step-icon-wrap">🏪</div>
              <h3 className="sok-step-title">Create Your Free Account</h3>
              <p className="sok-step-desc">Register with your mobile number (OTP verification). Add your shop name, logo, and business details. Takes under 2 minutes.</p>
              <Link href="/register/seller" className="sok-step-link" id="step1-register-btn">Register Now →</Link>
            </div>
            <div className="sok-step-arrow" aria-hidden="true">→</div>
            <div className="sok-step">
              <div className="sok-step-num">2</div>
              <div className="sok-step-icon-wrap">📦</div>
              <h3 className="sok-step-title">Add Your Products</h3>
              <p className="sok-step-desc">Upload product photos, set prices, add descriptions, manage stock. Works for any type of product — clothes, food, jewellery, crafts.</p>
            </div>
            <div className="sok-step-arrow" aria-hidden="true">→</div>
            <div className="sok-step">
              <div className="sok-step-num">3</div>
              <div className="sok-step-icon-wrap">🔗</div>
              <h3 className="sok-step-title">Share & Start Earning</h3>
              <p className="sok-step-desc">Share your store link on Instagram bio, WhatsApp status, Facebook groups. Customers browse, add to cart, pay — money comes to your account.</p>
            </div>
          </div>
          <div className="sok-how-cta">
            <Link href="/register/seller" className="sok-btn-primary" id="how-it-works-cta-btn">⚡ Create Your Online Store — Free</Link>
            <p className="sok-micro-text">No credit card • No coding • Free to start</p>
          </div>
        </div>
      </section>

      {/* ALL FEATURES */}
      <section className={`sok-section sok-features-section${isVisible['features'] ? ' sok-visible' : ''}`} id="features" data-animate>
        <div className="sok-container">
          <div className="sok-section-header">
            <span className="sok-section-tag">All Features</span>
            <h2 className="sok-section-title">Everything You Need to Sell Online in Kerala</h2>
            <p className="sok-section-sub">One platform that replaces your DMs, scattered notes, and expensive website — built specifically for Kerala sellers.</p>
          </div>
          <div className="sok-features-grid">
            {features.map((f, i) => (
              <div className="sok-feature-card" key={i} style={{ borderTopColor: f.color }}>
                <div className="sok-feature-emoji">{f.icon}</div>
                <h3 className="sok-feature-title" style={{ color: f.color }}>{f.title}</h3>
                <p className="sok-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="sok-features-cta">
            <Link href="/register/seller" className="sok-btn-primary" id="features-cta-btn">🏪 Get All These Features — Start Free →</Link>
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className={`sok-section sok-who${isVisible['who'] ? ' sok-visible' : ''}`} id="who" data-animate>
        <div className="sok-container">
          <div className="sok-section-header">
            <span className="sok-section-tag">Who Is It For</span>
            <h2 className="sok-section-title">Kerala Sellers Works for Every Type of Product</h2>
            <p className="sok-section-sub">Whether you sell clothes, food, jewellery, or anything in between — if you're in Kerala, this platform is built for you.</p>
          </div>
          <div className="sok-seller-types">
            {sellerTypes.map((s, i) => (
              <div className="sok-seller-type" key={i}>
                <span className="sok-seller-emoji">{s.emoji}</span>
                <span className="sok-seller-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="sok-who-banner">
            <p>📍 Serving sellers in <strong>Kochi, Thiruvananthapuram, Kozhikode, Thrissur, Kollam, Kannur, Palakkad, Malappuram, Alappuzha, Kottayam, Idukki, Wayanad, Kasaragod &amp; Pathanamthitta</strong> — all 14 districts of Kerala.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={`sok-section sok-testimonials${isVisible['testimonials'] ? ' sok-visible' : ''}`} id="testimonials" data-animate>
        <div className="sok-container">
          <div className="sok-section-header">
            <span className="sok-section-tag">Success Stories</span>
            <h2 className="sok-section-title">Join 1000+ Successful Kerala Sellers</h2>
            <p className="sok-section-sub">Real stories from real Kerala entrepreneurs</p>
          </div>
          <div className="sok-testimonials-grid">
            {testimonials.map((t, i) => (
              <div className="sok-testimonial-card" key={i}>
                <div className="sok-t-stars">{"⭐".repeat(t.rating)}</div>
                <p className="sok-t-text">"{t.text}"</p>
                <div className="sok-t-author">
                  <div className="sok-t-avatar">{t.initial}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span className="sok-t-meta">{t.location} · {t.business}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className={`sok-section sok-compare${isVisible['compare'] ? ' sok-visible' : ''}`} id="compare" data-animate>
        <div className="sok-container">
          <div className="sok-section-header">
            <span className="sok-section-tag">Why Kerala Sellers?</span>
            <h2 className="sok-section-title">Why Kerala Sellers Instead of Amazon, Meesho, or Building a Website?</h2>
          </div>
          <div className="sok-compare-table-wrap">
            <table className="sok-compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="sok-col-ks">Kerala Sellers ✓</th>
                  <th>Amazon / Meesho</th>
                  <th>Own Website</th>
                  <th>DMs Only</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Commission", "0% forever", "15–40%", "0%", "0%"],
                  ["Setup Cost", "Low monthly plan", "Free but high fees", "₹20K–1L", "Free"],
                  ["Setup Time", "10 minutes", "2–5 days", "1–3 months", "Instant"],
                  ["Kerala-Focused", "✓ Yes", "✗ Pan-India", "Depends", "Sort of"],
                  ["Order Management", "✓ Dashboard", "✓ Yes", "Need plugin", "✗ DMs"],
                  ["Your Own Brand", "✓ Store link", "✗ Their brand", "✓ Yes", "✗ No"],
                  ["Payment Gateway", "✓ Built-in", "✓ Yes", "Need setup", "✗ UPI only"],
                  ["Stock Tracking", "✓ Yes", "✓ Yes", "Need plugin", "✗ Manual"],
                  ["Technical Skills", "✗ Not needed", "✗ Not needed", "✓ Need dev", "✗ N/A"],
                  ["Customer Wishlist", "✓ Yes", "✓ Yes", "Need plugin", "✗ No"],
                ].map(([feature, ks, amzn, web, dm], i) => (
                  <tr key={i}>
                    <td className="sok-compare-feature">{feature}</td>
                    <td className="sok-col-ks sok-compare-good">{ks}</td>
                    <td>{amzn}</td>
                    <td>{web}</td>
                    <td>{dm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`sok-section sok-faq${isVisible['faq'] ? ' sok-visible' : ''}`} id="faq" data-animate>
        <div className="sok-container">
          <div className="sok-section-header">
            <span className="sok-section-tag">FAQ</span>
            <h2 className="sok-section-title">Frequently Asked Questions About Selling Online in Kerala</h2>
            <p className="sok-section-sub">Everything you need to know before starting your online store in Kerala</p>
          </div>
          <div className="sok-faq-list">
            {faqs.map((item, i) => (
              <div className={`sok-faq-item${openFaq === i ? ' sok-faq-open' : ''}`} key={i}>
                <button className="sok-faq-q" onClick={() => toggleFaq(i)} aria-expanded={openFaq === i} id={`faq-btn-${i}`}>
                  <span>{item.q}</span>
                  <span className="sok-faq-chevron">{openFaq === i ? '▲' : '▼'}</span>
                </button>
                {openFaq === i && <div className="sok-faq-a"><p>{item.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="sok-final-cta">
        <div className="sok-container">
          <div className="sok-cta-inner">
            <div className="sok-cta-star">⭐</div>
            <h2 className="sok-cta-title">Ready to Sell Your Products Online in Kerala?</h2>
            <p className="sok-cta-sub">
              Join 1000+ Kerala sellers who already have their own store. Stop typing prices in DMs — let your store do the work. Launch in 10 minutes, pay 0% commission.
            </p>
            <div className="sok-cta-btns">
              <Link href="/register/seller" className="sok-btn-primary sok-btn-large" id="final-cta-btn">
                🏪 Create Your Free Kerala Store Now →
              </Link>
              <Link href="/shop" className="sok-btn-ghost" id="final-browse-btn">
                See Live Kerala Shops
              </Link>
            </div>
            <p className="sok-cta-assurance">No credit card required • Free to start • 0% commission • Kerala-built platform</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
