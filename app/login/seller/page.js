"use client"; // 👈 Add this at the top

import { useState } from 'react';
import axios from 'axios';

export default function LoginSeller() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  const sendOtp = async () => {
    try {
      const response = await axios.post('/api/seller/send-otp', { phone });
      setStep(2);
    } catch (error) {
      console.error(error);
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post('/api/seller/verify-otp', { phone, otp });
      alert("Login successful");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Seller Login</h2>
      {step === 1 ? (
        <div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
          <button onClick={sendOtp}>Send OTP</button>
        </div>
      ) : (
        <div>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
          <button onClick={verifyOtp}>Verify</button>
        </div>
      )}
    </div>
  );
}
