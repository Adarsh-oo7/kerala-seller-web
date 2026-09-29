'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BRAND } from '../../app/lib/brand';

export default function GlobalWhatsAppButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('How do I start my online store?');

  // Do not show global platform support on individual seller storefronts or seller dashboard
  const isExcludedPath =
    pathname?.startsWith('/shop/') ||
    pathname?.startsWith('/product/') ||
    pathname?.startsWith('/dashboard/');

  useEffect(() => {
    // Set default prompt based on current route
    if (pathname?.includes('pos-billing') || pathname?.includes('billing')) {
      setSelectedTopic('I need details about POS & Shop Billing Software');
      setMessage('Hi Kerala Sellers team, I am interested in POS and Billing software for my shop.');
    } else if (pathname?.includes('mobile-app')) {
      setSelectedTopic('Tell me about the Kerala Sellers Mobile App');
      setMessage('Hi Kerala Sellers team, I want to know how the mobile management app works.');
    } else if (pathname?.includes('home-businesses') || pathname?.includes('whatsapp-sellers')) {
      setSelectedTopic('How to sell through WhatsApp and Instagram?');
      setMessage('Hi Kerala Sellers team, I want to sell through WhatsApp and Instagram without DM order confusion.');
    } else if (pathname?.startsWith('/ml')) {
      setSelectedTopic('ഓൺലൈൻ ഷോപ്പ് തുടങ്ങാൻ സഹായം വേണം');
      setMessage('നമസ്കാരം, Kerala Sellers വഴി ₹99/മാസം പ്ലാനിൽ സ്വന്തമായി ഓൺലൈൻ ഷോപ്പ് തുടങ്ങാൻ കൂടുതൽ വിവരങ്ങൾ അറിയണം.');
    } else {
      setSelectedTopic('How do I start my online store?');
      setMessage('Hi Kerala Sellers team, I want to create my own online store starting at ₹99/month.');
    }
  }, [pathname]);

  if (isExcludedPath) return null;

  const topics = [
    { id: 'store', label: '🛍️ Start Online Store (₹99/mo)', text: 'Hi Kerala Sellers team, I want to create my own online store starting at ₹99/month.' },
    { id: 'billing', label: '🧾 POS & Billing Software', text: 'Hi Kerala Sellers team, I am looking for billing & POS software for my retail shop.' },
    { id: 'whatsapp', label: '💬 WhatsApp Order Management', text: 'Hi Kerala Sellers team, how can I manage orders from WhatsApp and Instagram using a store link?' },
    { id: 'app', label: '📱 Mobile Seller App', text: 'Hi Kerala Sellers team, how do I manage my products and orders from the mobile app?' },
    { id: 'pricing', label: '💰 Plans & 0% Commission', text: 'Hi Kerala Sellers team, please explain your ₹99/mo starter plan and 0% commission policy.' },
  ];

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic.label);
    setMessage(topic.text);
  };

  const handleSendWhatsApp = () => {
    if (typeof window !== 'undefined' && window.ksTrack) {
      window.ksTrack('whatsapp_click', {
        topic: selectedTopic,
        page: pathname,
      });
    }

    const cleanPhone = BRAND.phoneTel.replace(/\D/g, '');
    const sendText = message.trim() || 'Hi Kerala Sellers, I am interested in starting an online store.';
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(sendText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div
        className="ks-wa-floating-container"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          fontFamily: 'inherit',
        }}
      >
        {/* Chat Drawer/Modal */}
        {isOpen && (
          <div
            className="ks-wa-modal"
            style={{
              width: '350px',
              maxWidth: 'calc(100vw - 32px)',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.22), 0 4px 12px rgba(37,211,102,0.15)',
              overflow: 'hidden',
              marginBottom: '14px',
              border: '1px solid rgba(22, 101, 52, 0.15)',
              animation: 'ksWaSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
                color: '#ffffff',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    position: 'relative',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-2.285-.595-1.904-.781-3.13-2.73-3.225-2.857-.095-.126-.764-1.016-.764-1.938 0-.921.482-1.373.653-1.562.171-.189.375-.236.5-.236.126 0 .252.002.361.008.117.006.273-.044.428.328.162.387.558 1.36.608 1.46.05.101.082.219.016.353-.066.134-.1.218-.198.334-.099.117-.208.261-.297.351-.099.1-.202.209-.087.406.115.197.513.847 1.1 1.37.757.674 1.394.882 1.593.981.199.099.316.082.433-.05.117-.134.5-.582.634-.781.134-.199.268-.166.452-.099.185.067 1.17.552 1.372.653.202.101.336.151.385.236.049.085.049.49-.095.895z" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2.05 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.635 0-3.155-.467-4.444-1.272l-.319-.199-2.956.775.789-2.882-.218-.347A8.17 8.17 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2s8.2 3.679 8.2 8.2-3.679 8.2-8.2 8.2z" />
                  </svg>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '11px',
                      height: '11px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '2px solid #ffffff',
                    }}
                  />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Kerala Sellers Support</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#a3e635' }}></span>
                    Online • Typically replies in 5 min
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: 'none',
                  color: '#ffffff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  padding: 0,
                }}
                aria-label="Close WhatsApp chat"
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div style={{ padding: '16px', background: '#f8fafc', flex: 1, overflowY: 'auto', maxHeight: '380px' }}>
              {/* Message Bubble */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '12px 14px',
                  borderRadius: '14px 14px 14px 2px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  marginBottom: '14px',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5 }}>
                  <strong>Namaskaram! 👋</strong>
                  <br />
                  Welcome to Kerala Sellers. Launch your own online store from <strong>₹99/month</strong> with <strong>0% commission</strong>.
                  <br />
                  How can our team help you today?
                </p>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                  Just now
                </span>
              </div>

              {/* Topic Quick Chips */}
              <p style={{ margin: '0 0 8px', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Select a quick question:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                {topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTopic(t)}
                    style={{
                      textAlign: 'left',
                      background: selectedTopic === t.label ? '#ecfdf5' : '#ffffff',
                      border: selectedTopic === t.label ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                      color: selectedTopic === t.label ? '#065f46' : '#334155',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: selectedTopic === t.label ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Message Preview Input */}
              <div style={{ marginBottom: '12px' }}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Type your message..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#ffffff',
                  }}
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleSendWhatsApp}
                style={{
                  width: '100%',
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
                  transition: 'background 0.2s',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-2.285-.595-1.904-.781-3.13-2.73-3.225-2.857-.095-.126-.764-1.016-.764-1.938 0-.921.482-1.373.653-1.562.171-.189.375-.236.5-.236.126 0 .252.002.361.008.117.006.273-.044.428.328.162.387.558 1.36.608 1.46.05.101.082.219.016.353-.066.134-.1.218-.198.334-.099.117-.208.261-.297.351-.099.1-.202.209-.087.406.115.197.513.847 1.1 1.37.757.674 1.394.882 1.593.981.199.099.316.082.433-.05.117-.134.5-.582.634-.781.134-.199.268-.166.452-.099.185.067 1.17.552 1.372.653.202.101.336.151.385.236.049.085.049.49-.095.895z" />
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2.05 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.635 0-3.155-.467-4.444-1.272l-.319-.199-2.956.775.789-2.882-.218-.347A8.17 8.17 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2s8.2 3.679 8.2 8.2-3.679 8.2-8.2 8.2z" />
                </svg>
                <span>Start WhatsApp Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Bubble Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Chat on WhatsApp with Kerala Sellers support"
          className="ks-wa-bubble-btn"
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#ffffff',
            boxShadow: '0 8px 25px rgba(37, 211, 102, 0.45)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.056-2.285-.595-1.904-.781-3.13-2.73-3.225-2.857-.095-.126-.764-1.016-.764-1.938 0-.921.482-1.373.653-1.562.171-.189.375-.236.5-.236.126 0 .252.002.361.008.117.006.273-.044.428.328.162.387.558 1.36.608 1.46.05.101.082.219.016.353-.066.134-.1.218-.198.334-.099.117-.208.261-.297.351-.099.1-.202.209-.087.406.115.197.513.847 1.1 1.37.757.674 1.394.882 1.593.981.199.099.316.082.433-.05.117-.134.5-.582.634-.781.134-.199.268-.166.452-.099.185.067 1.17.552 1.372.653.202.101.336.151.385.236.049.085.049.49-.095.895z" />
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2.05 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.635 0-3.155-.467-4.444-1.272l-.319-.199-2.956.775.789-2.882-.218-.347A8.17 8.17 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2s8.2 3.679 8.2 8.2-3.679 8.2-8.2 8.2z" />
            </svg>
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#a3e635',
                border: '1px solid #128C7E',
              }}
            />
          </div>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.2px' }}>
            {isOpen ? 'Close' : 'Chat on WhatsApp'}
          </span>
        </button>
      </div>

      <style jsx global>{`
        @keyframes ksWaSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .ks-wa-bubble-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37, 211, 102, 0.55);
        }
        @media (max-width: 768px) {
          .ks-wa-floating-container {
            bottom: 78px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
