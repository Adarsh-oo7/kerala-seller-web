'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import "../../styles/ContactPage.css";
import { FaWhatsapp } from "react-icons/fa";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Whatsapp,
  CheckCircle,
  AlertCircle,
  Globe,
  Users,
  Award,
  Briefcase
} from 'lucide-react';

// ✅ Enhanced API configuration
const getApiBaseUrl = () => {
  const envUrl = 'https://api.keralasellers.in' || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  if (process.env.NODE_ENV === 'development') {
    return 'https://api.keralasellers.in';
  }
  return 'https://api.keralasellers.in';
};

const API_BASE_URL = 'https://api.keralasellers.in';

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
      color: '#22608bff',
      description: 'Mon-Sat 9AM-7PM IST',
    },
    {
      icon: FaWhatsapp,
      label: 'WhatsApp',
      value: 'Chat Now',
      href: 'https://wa.me/919400355185?text=Hi%2C%20I%20have%20a%20question%20about%20Kerala%20Sellers',
      color: '#16a34a',
      description: 'Instant support',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'keralasellers.in@gmail.com',
      href: 'mailto:keralasellers.in@gmail.com?subject=Kerala%20Sellers%20Inquiry',
      color: '#cf2325ff',
      description: 'We reply within 24hrs',
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
    <div className="pageContainer">
      <Header />

      {/* Enhanced Hero Section */}
      <div className="contacthero">
        <img
          src="/assets/images/T Shirts (7423 x 2810 px).png"
          alt="Promotional Banner"
          className="banner-image"
        />

        <div className="heroContent">

          <h1 className="heroTitle">Contact Us</h1>
          <p className="heroSubtitle">
            {currentStoreInfo.isInStore
              ? `Get support for your store experience • Store ID: ${currentStoreInfo.storeId}`
              : 'Get in touch with Kerala Sellers - Your Digital Business Partner'
            }
          </p>

          {/* ✅ Store context indicator */}
          {currentStoreInfo.isInStore && (
            <div className="storeIndicator">
              <Globe size={16} />
              <span>You're contacting us from a store context</span>
            </div>
          )}
        </div>
      </div>

      <div className="container">
        {/* Enhanced Quick Contact Section */}
        <div className="quickContactSection">
          {/* <h2 className="quickContactTitle">Get in Touch</h2>
          <p className="quickContactSubtitle">
            Choose the best way to reach us. We're here to help!
          </p> */}
          <div className="quickContactGrid">
            {contactItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('https') ? '_blank' : undefined}
                rel={item.href.startsWith('https') ? 'noopener noreferrer' : undefined}
                className="quickContactCard"
              >
                <div
                  className="quickContactIcon"
                >
                  {React.createElement(item.icon, { className: "ContactIcon", color: item.color })}

                </div>
                <div className="quickContactText">
                  <h3 className="quickContactLabel">{item.label}</h3>
                  <p className="quickContactValue">{item.value}</p>
                  <span className="quickContactDesc">{item.description}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Enhanced Company Info */}
        <div className="infoSection">
          <div className="infoCard">
            <h2 className="infoTitle">About Kerala Sellers</h2>
            <p className="infoText">
              Kerala Sellers is a comprehensive digital platform connecting local businesses
              with customers across Kerala. We also provide professional web development
              services through Digital Product Solutions.
            </p>
            <div className='cols'>
              {/* ✅ Service highlights */}
              <div className="serviceHighlights">
                <div className="serviceItem">
                  <Users size={18} color="#059669" />
                  <span>1000+ Active Sellers</span>
                </div>
                <div className="serviceItem">
                  <Award size={18} color="#059669" />
                  <span>Zero Commission Platform</span>
                </div>
                <div className="serviceItem">
                  <Briefcase size={18} color="#059669" />
                  <span>Professional Web Development</span>
                </div>
              </div>


              <div className="infoDetails">
                <div className="infoItem">
                  <MapPin size={18} color="#6b7280" />
                  <span>Korani, Attingal, Kerala 695104</span>
                </div>
                <div className="infoItem">
                  <Clock size={18} color="#6b7280" />
                  <span>Monday - Saturday: 9:00 AM - 7:00 PM IST</span>
                </div>
                <div className="infoItem">
                  <Globe size={18} color="#6b7280" />
                  <span>Serving businesses across Kerala</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mainContent">
          {/* Enhanced Contact Form */}
          <div className="formSection">
            <div className="formCard">
              {/* <div className="formHeader">
                <h2 className="formTitle">Send us a Message</h2>
                <p className="formSubtitle">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div> */}

              {/* ✅ Error display */}
              {error && (
                <div className="errorMessage">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="form" >
                <div className="formRow">
                  <div className="inputGroup">
                    {/* <label className="label">Name *</label> */}
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter your full name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="inputGroup">
                    {/* <label className="label">Phone no. *</label> */}
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="inputGroup">
                  {/* <label className="label">Email address *</label> */}
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="your@email.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="formRow">
                  <div className="inputGroup">
                    {/* <label className="label">I am *</label> */}
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="select"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="buyer">Buyer/Customer</option>
                      <option value="seller">Seller/Business Owner</option>
                      <option value="developer">Developer/Partner</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>

                  <div className="inputGroup">
                    {/* <label className="label">Subject *</label> */}
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="select"
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

                <div className="inputGroup">
                  {/* <label className="label">Your Message *</label> */}
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="5"
                    className="textarea"
                    placeholder="Tell us about your project, question, or how we can help..."
                    required
                    disabled={isSubmitting}
                  />
                  <div className="charCount">
                    {formData.message.length}/500 characters
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className={`submitButton ${isSubmitted ? 'submitSuccess' : ''} ${isSubmitting ? 'submitLoading' : ''}`}
                >
                  {isSubmitted ? (
                    <span className="buttonContent">
                      <CheckCircle size={20} />
                      Message Sent Successfully!
                    </span>
                  ) : isSubmitting ? (
                    <span className="buttonContent">
                      <div className="spinner"></div>
                      Sending Message...
                    </span>
                  ) : (
                    <span className="buttonContent">
                      <Send size={20} />
                      Send Message
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Enhanced Location Map */}
        <div className="mapSection">
          <h2 className="mapTitle">Visit Our Office</h2>
          <p className="mapSubtitle">
            Digital Product Solutions - Located in Korani, Attingal, Kerala
          </p>

          <div className="mapContainer">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15777.33158572186!2d76.8276182147833!3d8.65991899379684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05e6d2c4f8d9c7%3A0x8e8e6b3b2c6b4e0f!2sKorani%2C%20Kerala!5e0!3m2!1sen!2sin!4v1661781245123!5m2!1sen!2sin"
              width="100%"
              height="350"
              className="mapFrame"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Digital Product Solutions - Kerala Office Location"
            />
          </div>

          {/* ✅ Map info */}
          <div className="mapInfo">
            <p className="mapInfoText">
              📍 Our office is easily accessible from Attingal town center.
              Public transport and parking available nearby.
            </p>
          </div>
        </div>
      </div>

      <Footer />


    </div>
  );
}



