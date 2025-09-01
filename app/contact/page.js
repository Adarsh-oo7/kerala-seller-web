'use client';

import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  const contactItems = [
    {
      icon: Phone,
      label: 'Call Us',
      value: '+91 94003 55185',
      href: 'tel:+919400355185',
      color: '#059669',
      description: 'Mon-Sat 9AM-7PM'
    },
    {
      icon: MessageSquare,
      label: 'WhatsApp',
      value: 'Chat Now',
      href: 'https://wa.me/919400355185',
      color: '#16a34a',
      description: 'Instant support'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'keralasellers.in@gmail.com',
      href: 'mailto:keralasellers.in@gmail.com',
      color: '#0369a1',
      description: 'We reply within 24hrs'
    }
  ];

  return (
    <div style={styles.pageContainer}>
      <Header />
      
      {/* Mobile-First Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Contact Us</h1>
          <p style={styles.heroSubtitle}>
            Get in touch with Digital Product Solutions - Your Web Development Partner
          </p>
        </div>
      </div>

      <div style={styles.container}>
        {/* Mobile-First Quick Contact Buttons */}
        <div style={styles.quickContactSection}>
          <h2 style={styles.quickContactTitle}>Get in Touch</h2>
          <div style={styles.quickContactGrid}>
            {contactItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('https') ? '_blank' : undefined}
                rel={item.href.startsWith('https') ? 'noopener noreferrer' : undefined}
                style={styles.quickContactCard}
              >
                <div style={{...styles.quickContactIcon, backgroundColor: `${item.color}20`}}>
                  <item.icon size={24} color={item.color} />
                </div>
                <div style={styles.quickContactText}>
                  <h3 style={styles.quickContactLabel}>{item.label}</h3>
                  <p style={styles.quickContactValue}>{item.value}</p>
                  <span style={styles.quickContactDesc}>{item.description}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact Form - Mobile Optimized */}
        <div style={styles.formSection}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Send us a Message</h2>
              <p style={styles.formSubtitle}>
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>
            
            <div style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Your Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  style={styles.textarea}
                  placeholder="Tell us about your project or how we can help..."
                  required
                />
              </div>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isSubmitted}
                style={{
                  ...styles.submitButton,
                  ...(isSubmitted ? styles.submitSuccess : {}),
                  ...(isSubmitting ? styles.submitLoading : {})
                }}
              >
                {isSubmitted ? (
                  <span style={styles.buttonContent}>
                    <CheckCircle size={20} />
                    Message Sent!
                  </span>
                ) : isSubmitting ? (
                  <span style={styles.buttonContent}>
                    <div style={styles.spinner}></div>
                    Sending...
                  </span>
                ) : (
                  <span style={styles.buttonContent}>
                    <Send size={20} />
                    Send Message
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Company Info Card */}
        <div style={styles.infoSection}>
          <div style={styles.infoCard}>
            <h2 style={styles.infoTitle}>About Digital Product Solutions</h2>
            <p style={styles.infoText}>
              We are Kerala Sellers - a comprehensive web development agency specializing in 
              creating digital solutions for local businesses across Kerala.
            </p>
            <div style={styles.infoDetails}>
              <div style={styles.infoItem}>
                <MapPin size={18} color="#6b7280" />
                <span>Korani, Attingal, Kerala 695104</span>
              </div>
              <div style={styles.infoItem}>
                <Clock size={18} color="#6b7280" />
                <span>Monday - Saturday: 9:00 AM - 7:00 PM (IST)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        <div style={styles.mapSection}>
          <h2 style={styles.mapTitle}>Visit Our Office</h2>
          <p style={styles.mapSubtitle}>Located in Korani, Attingal - Kerala</p>
          
          <div style={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15777.33158572186!2d76.8276182147833!3d8.65991899379684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05e6d2c4f8d9c7%3A0x8e8e6b3b2c6b4e0f!2sKorani%2C%20Kerala!5e0!3m2!1sen!2sin!4v1661781245123!5m2!1sen!2sin"
              width="100%"
              height="300"
              style={styles.mapFrame}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Digital Product Solutions - Kerala Office Location"
            />
          </div>
        </div>
      </div>
      
      <Footer />
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        /* Mobile-First Responsive Design */
        @media (min-width: 768px) {
          .quick-contact-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          .hero-title {
            font-size: 3rem !important;
          }
          
          .form-card {
            padding: 32px !important;
          }
          
          .container {
            padding: 32px 20px !important;
          }
        }
        
        @media (min-width: 1024px) {
          .hero-title {
            font-size: 3.5rem !important;
          }
          
          .main-content {
            display: grid !important;
            grid-template-columns: 2fr 1fr !important;
            gap: 32px !important;
            align-items: start !important;
          }
          
          .info-card {
            position: sticky !important;
            top: 20px !important;
          }
        }
        
        /* Touch-friendly hover effects for mobile */
        @media (hover: hover) and (pointer: fine) {
          .quick-contact-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15) !important;
          }
          
          .submit-button:hover {
            transform: translateY(-1px) !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb'
  },
  hero: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '40px 0 32px',
    textAlign: 'center'
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  },
  heroTitle: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '12px',
    lineHeight: '1.1'
  },
  heroSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.5'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px'
  },
  quickContactSection: {
    marginBottom: '32px'
  },
  quickContactTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px',
    textAlign: 'center'
  },
  quickContactGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px'
  },
  quickContactCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    minHeight: '80px'
  },
  quickContactIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  quickContactText: {
    flex: 1,
    minWidth: 0
  },
  quickContactLabel: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },
  quickContactValue: {
    fontSize: '1rem',
    color: '#374151',
    margin: '0 0 2px 0',
    fontWeight: '500'
  },
  quickContactDesc: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  formSection: {
    marginBottom: '32px'
  },
  formCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  formSubtitle: {
    fontSize: '0.95rem',
    color: '#6b7280',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '1rem',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    ':focus': {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
  },
  textarea: {
    width: '100%',
    padding: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '1rem',
    backgroundColor: '#ffffff',
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    ':focus': {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
  },
  submitButton: {
    width: '100%',
    padding: '18px 24px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '56px',
    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.7
    }
  },
  submitSuccess: {
    backgroundColor: '#10b981',
    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.25)'
  },
  submitLoading: {
    backgroundColor: '#6b7280'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  infoSection: {
    marginBottom: '32px'
  },
  infoCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  infoTitle: {
    fontSize: '1.375rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '12px'
  },
  infoText: {
    fontSize: '1rem',
    color: '#374151',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  infoDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95rem',
    color: '#374151'
  },
  mapSection: {
    marginBottom: '32px'
  },
  mapTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
    textAlign: 'center'
  },
  mapSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '20px'
  },
  mapContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  mapFrame: {
    border: 0,
    borderRadius: '12px',
    width: '100%'
  }
};