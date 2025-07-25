'use client';

import { useState } from 'react';
import axios from 'axios';

export default function RegisterSeller() {
  const [step, setStep] = useState(1); // Step 1: fill form, Step 2: enter OTP
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

  const initiateRegistration = async () => {
    if (form.password !== form.confirmPassword) {
      return alert('Passwords do not match');
    }

    try {
      const res = await axios.post('http://localhost:8000/user/send-otp/', {
        phone: form.phone,
      });
      alert('OTP sent to your phone');
      setStep(2); // Move to OTP step
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP');
    }
  };

  const completeRegistration = async () => {
    try {
      await axios.post('http://localhost:8000/user/register/', {
        name: form.name,
        shop_name: form.shopName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        otp: form.otp,
      });
      alert('Registration successful!');
      // Optionally redirect or clear form here
    } catch (err) {
      console.error(err);
      alert('Invalid OTP or registration failed');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 500 }}>
      <h2>Seller Registration</h2>

      {/* Step 1: Form details */}
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
            required
          /><br /><br />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
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

          <button onClick={initiateRegistration}>Register</button>
        </>
      )}

      {/* Step 2: OTP input */}
      {step === 2 && (
        <>
          <p>OTP has been sent to your phone number.</p>
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={form.otp}
            onChange={handleChange}
            required
          /><br /><br />
          <button onClick={completeRegistration}>Confirm & Finish</button>
        </>
      )}
    </div>
  );
}
