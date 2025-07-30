'use client';

import { useState } from 'react';
import axios from 'axios';
import Header from '../../../components/common/Header';
import { Eye, EyeOff } from 'lucide-react';
import Footer from '../../../components/common/Footer';

export default function RegisterSeller() {
  const [step, setStep] = useState(1); // Step 1: Registration form, Step 2: OTP input
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    shopName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Step 1: Send OTP
  const initiateRegistration = async () => {
    if (!form.phone || !form.password || !form.confirmPassword) {
      return alert('Please fill all required fields');
    }

    if (form.password !== form.confirmPassword) {
      return alert('Passwords do not match');
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:8000/user/send-otp/', {
        phone: form.phone,
      });
      alert('✅ OTP sent to your phone');
      setStep(2);
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2: Complete Registration
  const completeRegistration = async () => {
    if (!form.otp) return alert('Please enter the OTP');

    try {
      setLoading(true);
      await axios.post('http://localhost:8000/user/register/', {
        name: form.name,
        shop_name: form.shopName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        otp: form.otp,
      });
      alert('✅ Registration successful! Redirecting to login...');
      setTimeout(() => (window.location.href = '/login/seller'), 1000);
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.error || 'Invalid OTP or registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="auth-container">
        <div className="auth-bg" />
        {/* <div className="auth-overlay" /> */}
        {/* <div className="auth-box"> */}
        <div className="auth-card">
          <h2 className="auth-title">Register</h2>

          {step === 1 && (
            <div className="auth-input-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
                className="auth-input"
              />
              <input
                type="text"
                name="shopName"
                placeholder="Shop Name"
                value={form.shopName}
                onChange={handleChange}
                className="auth-input"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="auth-input"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                className="auth-input"
              />
              {/* Password Field */}
              <div className="auth-input-icon-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
                <span className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>



              {/* Confirm Password Field */}
              <div className="auth-input-icon-wrapper">
  <input
    type={showConfirmPassword ? 'text' : 'password'}
    name="confirmPassword"
    placeholder="Confirm Password"
    value={form.confirmPassword}
    onChange={handleChange}
    required
    className="auth-input"
  />
  <span className="toggle-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </span>
</div>



              <button
                className="auth-button"
                disabled={loading}
                onClick={initiateRegistration}
              >
                {loading ? "Sending OTP..." : "Register"}
              </button>
              <p className="auth-footer-text">
                Have an account? <a href="/login/seller">Login</a>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="auth-input-group">
              <p className="otp-msg">
                ✅ OTP has been sent to <strong>{form.phone}</strong>. Please enter it below:
              </p>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={handleChange}
                className="auth-input"
              />
              <button
                className="auth-button"
                disabled={loading}
                onClick={completeRegistration}
              >
                {loading ? "Verifying..." : "Confirm & Finish"}
              </button>
            </div>
          )}
        </div>
        {/* </div> */}
      </div>
      <Footer />
    </div>
  );
}
