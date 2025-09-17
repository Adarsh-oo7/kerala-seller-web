'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle,
  AlertCircle,
  Globe,
  Users,
  Award,
  Briefcase
} from 'lucide-react';

// ✅ Enhanced API configuration
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  return 'https://keralaseller-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'buyer' // buyer, seller, general
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [currentStoreInfo, setCurrentStoreInfo] = useState({ storeId: null, isInStore: false });

  // ✅ Get current store info from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
      setCurrentStoreInfo({
        storeId: storeMatch ? storeMatch[1] : null,
        isInStore: !!storeMatch
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  // ✅ Enhanced form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.phone.trim() && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setError('Please enter a valid 10-digit Indian phone number');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Please enter your message');
      return false;
    }
    if (formData.message.trim().length < 10) {
      setError('Please provide a more detailed message (at least 10 characters)');
      return false;
    }
    return true;
  };

  // ✅ Enhanced form submission with API integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // ✅ You can integrate with your backend API here
      const contactData = {
        ...formData,
        timestamp: new Date().toISOString(),
        source: currentStoreInfo.isInStore ? `store_${currentStoreInfo.storeId}` : 'main_site',
        user_agent: navigator.userAgent,
        page_url: window.location.href
      };
      
      console.log('📧 Contact form submission:', contactData);
      
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // You can uncomment this to make actual API call:
      /*
      const response = await fetch(`${API_BASE_URL}/api/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      */
      
      setIsSubmitted(true);
      
      // Reset form after success
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          userType: 'buyer'
        });
      }, 4000);
      
    } catch (error) {
      console.error('❌ Contact form error:', error);
      setError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Enhanced contact items with more options
  const contactItems = [
    {
      icon: Phone,
      label: 'Call Us',
      value: '+91 94003 55185',
      href: 'tel:+919400355185',
      color: '#059669',
      description: 'Mon-Sat 9AM-7PM IST',
      priority: 1
    },
    {
      icon: MessageSquare,
      label: 'WhatsApp',
      value: 'Chat Now',
      href: 'https://wa.me/919400355185?text=Hi%2C%20I%20have%20a%20question%20about%20Kerala%20Sellers',
      color: '#16a34a',
      description: 'Instant support',
      priority: 1
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'keralasellers.in@gmail.com',
      href: 'mailto:keralasellers.in@gmail.com?subject=Kerala%20Sellers%20Inquiry',
      color: '#0369a1',
      description: 'We reply within 24hrs',
      priority: 2
    }
  ];

  // ✅ Enhanced subject options
  const subjectOptions = [
    { value: '', label: 'Select a subject' },
    { value: 'seller_registration', label: 'Seller Registration Help' },
    { value: 'technical_support', label: 'Technical Support' },
    { value: 'order_inquiry', label: 'Order Related Query' },
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'business_partnership', label: 'Business Partnership' },
    { value: 'website_development', label: 'Website Development Services' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div style={styles.pageContainer}>
      <Header />
      
      {/* Enhanced Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Contact Us</h1>
          <p style={styles.heroSubtitle}>
            {currentStoreInfo.isInStore 
              ? `Get support for your store experience • Store ID: ${currentStoreInfo.storeId}`
              : 'Get in touch with Kerala Sellers - Your Digital Business Partner'
            }
          </p>
          
          {/* ✅ Store context indicator */}
          {currentStoreInfo.isInStore && (
            <div style={styles.storeIndicator}>
              <Globe size={16} />
              <span>You're contacting us from a store context</span>
            </div>
          )}
        </div>
      </div>

      <div style={styles.container}>
        {/* Enhanced Quick Contact Section */}
        <div style={styles.quickContactSection}>
          <h2 style={styles.quickContactTitle}>Get in Touch</h2>
          <p style={styles.quickContactSubtitle}>
            Choose the best way to reach us. We're here to help!
          </p>
          <div style={styles.quickContactGrid}>
            {contactItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('https') ? '_blank' : undefined}
                rel={item.href.startsWith('https') ? 'noopener noreferrer' : undefined}
                style={{
                  ...styles.quickContactCard,
                  ...(item.priority === 1 ? styles.priorityCard : {})
                }}
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

        <div style={styles.mainContent}>
          {/* Enhanced Contact Form */}
          <div style={styles.formSection}>
            <div style={styles.formCard}>
              <div style={styles.formHeader}>
                <h2 style={styles.formTitle}>Send us a Message</h2>
                <p style={styles.formSubtitle}>
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>
              
              {/* ✅ Error display */}
              {error && (
                <div style={styles.errorMessage}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Enter your full name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="your@email.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>I am a *</label>
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      style={styles.select}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="buyer">Buyer/Customer</option>
                      <option value="seller">Seller/Business Owner</option>
                      <option value="developer">Developer/Partner</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                  
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Subject *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      style={styles.select}
                      required
                      disabled={isSubmitting}
                    >
                      {subjectOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Your Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="5"
                    style={styles.textarea}
                    placeholder="Tell us about your project, question, or how we can help..."
                    required
                    disabled={isSubmitting}
                  />
                  <div style={styles.charCount}>
                    {formData.message.length}/500 characters
                  </div>
                </div>
                
                <button
                  type="submit"
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
                      Message Sent Successfully!
                    </span>
                  ) : isSubmitting ? (
                    <span style={styles.buttonContent}>
                      <div style={styles.spinner}></div>
                      Sending Message...
                    </span>
                  ) : (
                    <span style={styles.buttonContent}>
                      <Send size={20} />
                      Send Message
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Enhanced Company Info */}
          <div style={styles.infoSection}>
            <div style={styles.infoCard}>
              <h2 style={styles.infoTitle}>About Kerala Sellers</h2>
              <p style={styles.infoText}>
                Kerala Sellers is a comprehensive digital platform connecting local businesses 
                with customers across Kerala. We also provide professional web development 
                services through Digital Product Solutions.
              </p>
              
              {/* ✅ Service highlights */}
              <div style={styles.serviceHighlights}>
                <div style={styles.serviceItem}>
                  <Users size={18} color="#059669" />
                  <span>1000+ Active Sellers</span>
                </div>
                <div style={styles.serviceItem}>
                  <Award size={18} color="#059669" />
                  <span>Zero Commission Platform</span>
                </div>
                <div style={styles.serviceItem}>
                  <Briefcase size={18} color="#059669" />
                  <span>Professional Web Development</span>
                </div>
              </div>
              
              <div style={styles.infoDetails}>
                <div style={styles.infoItem}>
                  <MapPin size={18} color="#6b7280" />
                  <span>Korani, Attingal, Kerala 695104</span>
                </div>
                <div style={styles.infoItem}>
                  <Clock size={18} color="#6b7280" />
                  <span>Monday - Saturday: 9:00 AM - 7:00 PM IST</span>
                </div>
                <div style={styles.infoItem}>
                  <Globe size={18} color="#6b7280" />
                  <span>Serving businesses across Kerala</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Location Map */}
        <div style={styles.mapSection}>
          <h2 style={styles.mapTitle}>Visit Our Office</h2>
          <p style={styles.mapSubtitle}>
            Digital Product Solutions - Located in Korani, Attingal, Kerala
          </p>
          
          <div style={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15777.33158572186!2d76.8276182147833!3d8.65991899379684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05e6d2c4f8d9c7%3A0x8e8e6b3b2c6b4e0f!2sKorani%2C%20Kerala!5e0!3m2!1sen!2sin!4v1661781245123!5m2!1sen!2sin"
              width="100%"
              height="350"
              style={styles.mapFrame}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Digital Product Solutions - Kerala Office Location"
            />
          </div>
          
          {/* ✅ Map info */}
          <div style={styles.mapInfo}>
            <p style={styles.mapInfoText}>
              📍 Our office is easily accessible from Attingal town center. 
              Public transport and parking available nearby.
            </p>
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
        
        /* Enhanced responsive design */
        @media (max-width: 767px) {
          .form-row {
            flex-direction: column !important;
          }
          
          .main-content {
            display: block !important;
          }
          
          .hero-title {
            font-size: 2rem !important;
          }
          
          .quick-contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
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
          
          .main-content {
            display: grid !important;
            grid-template-columns: 2fr 1fr !important;
            gap: 32px !important;
            align-items: start !important;
          }
        }
        
        @media (min-width: 1024px) {
          .hero-title {
            font-size: 3.5rem !important;
          }
          
          .info-card {
            position: sticky !important;
            top: 20px !important;
          }
        }
        
        /* Touch-friendly hover effects */
        @media (hover: hover) and (pointer: fine) {
          .quick-contact-card:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15) !important;
          }
          
          .submit-button:hover:not(:disabled) {
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
    maxWidth: '600px',
    margin: '0 auto 16px',
    lineHeight: '1.5'
  },
  // ✅ Store context indicator
  storeIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#dbeafe',
    border: '1px solid #3b82f6',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#1e40af',
    fontWeight: '500'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px'
  },
  quickContactSection: {
    marginBottom: '32px',
    textAlign: 'center'
  },
  quickContactTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  quickContactSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '24px'
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
  // ✅ Priority card styling
  priorityCard: {
    border: '2px solid #10b981',
    backgroundColor: '#f0fdf4'
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
  // ✅ Main content layout
  mainContent: {
    display: 'block',
    marginBottom: '32px'
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
  // ✅ Error message styling
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#991b1b',
    fontSize: '0.9rem',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  // ✅ Form row for side-by-side inputs
  formRow: {
    display: 'flex',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
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
    outline: 'none'
  },
  // ✅ Select styling
  select: {
    width: '100%',
    padding: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '1rem',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'pointer'
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
    outline: 'none'
  },
  // ✅ Character count
  charCount: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '4px',
    textAlign: 'right'
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
    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.25)'
  },
  submitSuccess: {
    backgroundColor: '#10b981',
    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.25)'
  },
  submitLoading: {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed'
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
  // ✅ Service highlights
  serviceHighlights: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    border: '1px solid #bbf7d0'
  },
  serviceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.9rem',
    color: '#059669',
    fontWeight: '500'
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
  },
  // ✅ Map additional info
  mapInfo: {
    marginTop: '16px',
    textAlign: 'center'
  },
  mapInfoText: {
    fontSize: '0.9rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.4'
  }
};
