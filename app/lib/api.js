import axios from 'axios';

// Dynamic base URL determination
const getBaseUrl = () => {
  // 1. Check if we have an explicit environment variable
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // 2. Environment-based defaults
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  // 3. Production default (replace with your actual production URL)
  return 'https://api.keralasellers.in';
};

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') || localStorage.getItem('buyerAccessToken')
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Clear tokens on 401
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('buyerAccessToken');
        // Optionally redirect to login
        window.location.href = '/login/buyer';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Export base URL for components that need it
export const API_BASE_URL = getBaseUrl();

// Export specific API endpoints
export const API_ENDPOINTS = {
  // Products
  products: '/api/products',
  
  // User endpoints
  buyerProfile: '/api/buyer/profile',
  buyerLogin: '/user/buyer/login',
  sellerLogin: '/user/login',
  
  // Store endpoints
  stores: '/user/store/shops',
  storeDetail: (phone) => `/user/store/${phone}`,
  
  // Orders
  createOrder: '/user/orders/create-order',
  createPaymentOrder: '/user/orders/create-payment-order',
  verifyPayment: '/user/orders/verify-product-payment',
  
  // Password reset
  sendResetOTP: '/user/password-reset/send-otp',
  verifyResetOTP: '/user/password-reset/verify',
  sendBuyerResetOTP: '/user/buyer/password-reset/send-otp',
  verifyBuyerResetOTP: '/user/buyer/password-reset/verify',
};
