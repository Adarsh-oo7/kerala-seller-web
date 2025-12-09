// lib/api/payments.js - Payment API Integration (JavaScript)
import axios from 'axios';

const API_BASE_URL = 'https://api.keralasellers.in' || ''https://api.keralasellers.in'';

export const paymentAPI = {
  // Bank Account Management
  checkBankStatus: async (token) => {
    return axios.get(`${API_BASE_URL}/api/payments/bank-account/status/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  addBankAccount: async (token, bankData) => {
    return axios.post(`${API_BASE_URL}/api/payments/bank-account/add/`, bankData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getBankAccount: async (token) => {
    return axios.get(`${API_BASE_URL}/api/payments/bank-account/get_account/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  updateBankAccount: async (token, bankData) => {
    return axios.put(`${API_BASE_URL}/api/payments/bank-account/update_account/`, bankData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Payout History
  getPayoutHistory: async (token) => {
    return axios.get(`${API_BASE_URL}/api/payments/payout/history/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Initiate Payout
  initiatePayout: async (token, payoutData) => {
    return axios.post(`${API_BASE_URL}/api/payments/payout/initiate/`, payoutData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

