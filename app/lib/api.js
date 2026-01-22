// import axios from 'axios';

// // ✅ PERFECT dynamic base URL - WORKS EVERYWHERE
// const getBaseUrl = () => {
//   // 1. Check env vars first
//   const envUrl = 'https://api.keralasellers.in' || 
//                  process.env.NEXT_PUBLIC_API_URL ||
//                  process.env.REACT_APP_API_BASE_URL;
  
//   if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
//     return envUrl.trim();
//   }
  
//   // 2. ✅ FIXED: Smart hostname detection (like your login page)
//   if (typeof window !== 'undefined') {
//     const hostname = window.location.hostname;
//     if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '127.0.0.1') {
//       console.log('🌐 Local dev: Using localhost:8000');
//       return 'https://api.keralasellers.in';
//     }
//     console.log('📦 Production: Using api.keralasellers.in');
//     return 'https://api.keralasellers.in';
//   }
  
//   // 3. Server-side fallback
//   return 'https://api.keralasellers.in';
// };

// // ✅ Pre-configured axios with interceptors
// const api = axios.create({
//   baseURL: 'https://api.keralasellers.in',
//   timeout: 15000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: false,
// });

// // ✅ Request interceptor - auto token
// api.interceptors.request.use(
//   (config) => {
//     const token = typeof window !== 'undefined' 
//       ? localStorage.getItem('access_token') || 
//         localStorage.getItem('buyerAccessToken') ||
//         localStorage.getItem('accessToken')
//       : null;
    
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
    
//     if (process.env.NODE_ENV === 'development') {
//       console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
//         baseURL: config.baseURL,
//         timestamp: new Date().toISOString()
//       });
//     }
    
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ✅ Response interceptor - smart redirects
// api.interceptors.response.use(
//   (response) => {
//     if (process.env.NODE_ENV === 'development') {
//       console.log(`✅ API Response: ${response.status} ${response.config.url}`);
//     }
//     return response;
//   },
//   (error) => {
//     console.error('❌ API Error:', {
//       url: error.config?.url,
//       status: error.response?.status,
//       message: error.response?.data?.error || error.message
//     });
    
//     // 401 → Smart redirect
//     if (error.response?.status === 401 && typeof window !== 'undefined') {
//       ['access_token', 'buyerAccessToken', 'accessToken', 'userInfo'].forEach(key => {
//         localStorage.removeItem(key);
//         sessionStorage.removeItem(key);
//       });
      
//       const path = window.location.pathname;
//       if (path.match(/\/store\/([^\/]+)/)) {
//         window.location.href = `/login/seller`;
//       } else if (path.includes('/seller') || path.includes('/dashboard')) {
//         window.location.href = '/login/seller';
//       } else {
//         window.location.href = '/login/buyer';
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// // ✅ Export everything
// export const API_BASE_URL = 'https://api.keralasellers.in';
// export default api;
// export const API_ENDPOINTS = {
//   // AUTH
//   sellerLogin: '/user/login',
//   buyerLogin: '/user/buyer/login',
  
//   // STORES  
//   storeProfile: '/user/store/profile',
//   stores: '/user/store/shops',
  
//   // ORDERS
//   orders: '/user/orders',
//   orderDetail: (id) => `/user/orders/${id}`,
  
//   // DASHBOARD
//   dashboard: '/user/dashboard',
//   analytics: '/user/analytics',
  
//   // UPLOADS
//   uploadImage: '/api/upload/image'
// };

// export const apiUtils = {
//   getMediaUrl: (path) => {
//     if (!path) return null;
//     if (path.startsWith('http')) return path;
//     return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
//   },
  
//   getAuthHeaders: () => {
//     const token = typeof window !== 'undefined' 
//       ? localStorage.getItem('access_token') || localStorage.getItem('accessToken')
//       : null;
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   }
// };

// // ✅ Log config
// if (process.env.NODE_ENV === 'development') {
//   console.log('🌐 API Config:', { baseURL: 'https://api.keralasellers.in' });
// }

import axios from 'axios';

// ✅ ONE LINE - Environment-aware base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? 'https://api.keralasellers.in' : 'http://localhost:8000/api');

// ✅ Pre-configured axios with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// ✅ Request interceptor - auto token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') || 
        localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('accessToken')
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        timestamp: new Date().toISOString()
      });
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor - smart redirects
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    
    // 401 → Smart redirect
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      ['access_token', 'buyerAccessToken', 'accessToken', 'userInfo'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      const path = window.location.pathname;
      if (path.match(/\/store\/([^\/]+)/)) {
        window.location.href = `/login/seller`;
      } else if (path.includes('/seller') || path.includes('/dashboard')) {
        window.location.href = '/login/seller';
      } else {
        window.location.href = '/login/buyer';
      }
    }
    
    return Promise.reject(error);
  }
);

// ✅ Export everything
export { API_BASE_URL };
export default api;
export const API_ENDPOINTS = {
  // AUTH
  sellerLogin: '/user/login',
  buyerLogin: '/user/buyer/login',
  
  // STORES  
  storeProfile: '/user/store/profile',
  stores: '/user/store/shops',
  
  // ORDERS
  orders: '/user/orders',
  orderDetail: (id) => `/user/orders/${id}`,
  
  // DASHBOARD
  dashboard: '/user/dashboard',
  analytics: '/user/analytics',
  
  // UPLOADS
  uploadImage: '/api/upload/image'
};

export const apiUtils = {
  getMediaUrl: (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  },
  
  getAuthHeaders: () => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') || localStorage.getItem('accessToken')
      : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

// ✅ Log config
console.log('🌐 API Config:', { baseURL: API_BASE_URL });
