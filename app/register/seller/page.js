'use client';

import { useState } from 'react';
import axios from 'axios';

export default function RegisterSeller() {
  const [step, setStep] = useState(1); // Step 1: Registration form, Step 2: OTP input
  const [loading, setLoading] = useState(false);
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
    <div style={{ padding: '2rem', maxWidth: 500, margin: '0 auto' }}>
      <h2>Seller Registration</h2>

      {step === 1 && (
        <>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          /><br /><br />

          <input
            type="text"
            name="shopName"
            placeholder="Shop Name"
            value={form.shopName}
            onChange={handleChange}
          /><br /><br />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          /><br /><br />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          /><br /><br />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          /><br /><br />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          /><br /><br />

          <button disabled={loading} onClick={initiateRegistration}>
            {loading ? 'Sending OTP...' : 'Register'}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p>✅ OTP has been sent to <strong>{form.phone}</strong>. Please enter it below:</p>
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={handleChange}
            required
          /><br /><br />

          <button disabled={loading} onClick={completeRegistration}>
            {loading ? 'Verifying...' : 'Confirm & Finish'}
          </button>
        </>
      )}
    </div>
  );
}
