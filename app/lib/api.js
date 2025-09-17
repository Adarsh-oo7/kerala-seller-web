import axios from 'axios';

// ✅ Enhanced dynamic base URL determination with better fallbacks
const getBaseUrl = () => {
  // 1. Check multiple environment variable formats for flexibility
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
                 process.env.NEXT_PUBLIC_API_URL ||
                 process.env.REACT_APP_API_BASE_URL;
  
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    return envUrl.trim();
  }
  
  // 2. Environment-based defaults
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  
  // 3. Production default - using your current backend
  return 'https://keralaseller-backend.onrender.com';
};

// ✅ Enhanced axios instance with better configuration
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000, // Increased timeout for production
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials for CORS
  withCredentials: false,
});

// ✅ Enhanced request interceptor with better token handling
api.interceptors.request.use(
  (config) => {
    // Enhanced token detection - supports multiple token keys
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') || 
        localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('accessToken')
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        headers: config.headers,
        timestamp: new Date().toISOString()
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Enhanced response interceptor with comprehensive error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString()
    });
    
    // Handle common errors with store-aware redirects
    if (error.response?.status === 401) {
      // Clear all possible tokens on 401
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'access_token',
          'buyerAccessToken',
          'accessToken',
          'refresh_token',
          'userInfo',
          'user'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        
        // ✅ Store-aware redirect logic
        const currentPath = window.location.pathname;
        const storeMatch = currentPath.match(/\/store\/([^\/]+)/);
        
        if (storeMatch) {
          // Redirect to store-specific login
          window.location.href = `/store/${storeMatch[1]}/login`;
        } else if (currentPath.includes('/seller') || currentPath.includes('/dashboard')) {
          // Redirect to seller login
          window.location.href = '/login/seller';
        } else {
          // Default to buyer login
          window.location.href = '/login/buyer';
        }
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - check connection');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// ✅ Export base URL for components that need it
export const API_BASE_URL = getBaseUrl();

// ✅ Comprehensive API endpoints for your entire platform
export const API_ENDPOINTS = {
  // ===== PRODUCTS =====
  products: '/api/products',
  productDetail: (id) => `/api/products/${id}`,
  productsByStore: (storeId) => `/api/products?store=${storeId}`,
  
  // ===== USER AUTHENTICATION =====
  // Buyer endpoints
  buyerLogin: '/user/buyer/login',
  buyerRegister: '/user/buyer/register',
  buyerProfile: '/api/buyer/profile',
  buyerVerifyOTP: '/user/buyer/verify-otp',
  
  // Seller endpoints
  sellerLogin: '/user/login',
  sellerRegister: '/user/register',
  sellerProfile: '/user/profile',
  sellerVerifyOTP: '/user/verify-otp',
  
  // Google OAuth
  googleAuth: '/auth/google',
  
  // ===== STORES =====
  stores: '/user/store/shops',
  storeDetail: (phone) => `/user/store/${phone}`,
  storeProducts: (phone) => `/shop/${phone}`,
  createStore: '/user/store/create',
  updateStore: '/user/store/update',
  
  // ===== ORDERS =====
  createOrder: '/user/orders/create-order',
  ordersList: '/user/orders',
  orderDetail: (id) => `/user/orders/${id}`,
  ordersCount: '/api/buyer/orders/count',
  
  // Buyer specific orders
  buyerOrders: '/api/buyer/orders',
  buyerOrderHistory: '/api/buyer/orders/history',
  
  // ===== PAYMENTS =====
  createPaymentOrder: '/user/orders/create-payment-order',
  verifyPayment: '/user/orders/verify-payment',
  verifyProductPayment: '/user/orders/verify-product-payment',
  
  // ===== WISHLIST =====
  wishlist: '/api/wishlist',
  addToWishlist: '/api/wishlist/add',
  removeFromWishlist: '/api/wishlist/remove',
  
  // ===== CART =====
  cart: '/api/cart',
  addToCart: '/api/cart/add',
  updateCart: '/api/cart/update',
  removeFromCart: '/api/cart/remove',
  clearCart: '/api/cart/clear',
  
  // ===== PASSWORD RESET =====
  // Seller password reset
  sendResetOTP: '/user/password-reset/send-otp',
  verifyResetOTP: '/user/password-reset/verify',
  
  // Buyer password reset
  sendBuyerResetOTP: '/user/buyer/password-reset/send-otp',
  verifyBuyerResetOTP: '/user/buyer/password-reset/verify',
  
  // ===== VERIFICATION =====
  sendOTP: '/user/send-otp',
  verifyOTP: '/user/verify-otp',
  sendBuyerOTP: '/user/buyer/send-otp',
  verifyBuyerOTP: '/user/buyer/verify-otp',
  
  // ===== CONTACT & SUPPORT =====
  contact: '/api/contact',
  support: '/api/support',
  
  // ===== SEARCH =====
  search: '/api/search',
  searchProducts: '/api/products/search',
  searchStores: '/api/stores/search',
  
  // ===== CATEGORIES =====
  categories: '/api/categories',
  categoryProducts: (id) => `/api/categories/${id}/products`,
  
  // ===== REVIEWS =====
  reviews: (productId) => `/api/products/${productId}/reviews`,
  addReview: (productId) => `/api/products/${productId}/reviews`,
  
  // ===== NOTIFICATIONS =====
  notifications: '/api/notifications',
  markNotificationRead: (id) => `/api/notifications/${id}/read`,
  
  // ===== ANALYTICS (for sellers) =====
  sellerAnalytics: '/user/analytics',
  salesReport: '/user/analytics/sales',
  
  // ===== FILE UPLOADS =====
  uploadImage: '/api/upload/image',
  uploadFile: '/api/upload/file',
  
  // ===== SHIPPING =====
  shippingRates: '/api/shipping/rates',
  trackOrder: (orderId) => `/api/shipping/track/${orderId}`,
};

// ✅ Enhanced utility functions for common API operations
export const apiUtils = {
  // Get full URL for image/media files
  getMediaUrl: (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    if (path.startsWith('/media/') || path.startsWith('/static/')) {
      return `${API_BASE_URL}${path}`;
    }
    return path;
  },
  
  // Handle API errors consistently
  handleApiError: (error, fallbackMessage = 'An error occurred') => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    return error.message || fallbackMessage;
  },
  
  // Get auth headers manually if needed
  getAuthHeaders: () => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') || 
        localStorage.getItem('buyerAccessToken') ||
        localStorage.getItem('accessToken')
      : null;
    
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },
  
  // Store-aware URL builder
  buildStoreUrl: (endpoint, storeId = null) => {
    if (storeId) {
      return endpoint.replace(':storeId', storeId);
    }
    return endpoint;
  },
  
  // Format query parameters
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  }
};

// ✅ Enhanced API service functions for common operations
export const apiServices = {
  // Authentication services
  auth: {
    buyerLogin: (credentials) => api.post(API_ENDPOINTS.buyerLogin, credentials),
    sellerLogin: (credentials) => api.post(API_ENDPOINTS.sellerLogin, credentials),
    logout: () => {
      // Clear all auth data
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'access_token', 'buyerAccessToken', 'accessToken',
          'refresh_token', 'userInfo', 'user'
        ];
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
      }
    }
  },
  
  // Product services
  products: {
    getAll: (params = {}) => {
      const queryString = apiUtils.buildQueryString(params);
      return api.get(`${API_ENDPOINTS.products}${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => api.get(API_ENDPOINTS.productDetail(id)),
    getByStore: (storeId, params = {}) => {
      const queryString = apiUtils.buildQueryString({ ...params, store: storeId });
      return api.get(`${API_ENDPOINTS.products}?${queryString}`);
    }
  },
  
  // Store services
  stores: {
    getAll: () => api.get(API_ENDPOINTS.stores),
    getByPhone: (phone) => api.get(API_ENDPOINTS.storeDetail(phone)),
    getProducts: (phone) => api.get(API_ENDPOINTS.storeProducts(phone))
  },
  
  // Order services
  orders: {
    create: (orderData) => api.post(API_ENDPOINTS.createOrder, orderData),
    getAll: (params = {}) => {
      const queryString = apiUtils.buildQueryString(params);
      return api.get(`${API_ENDPOINTS.ordersList}${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => api.get(API_ENDPOINTS.orderDetail(id)),
    getCount: (params = {}) => {
      const queryString = apiUtils.buildQueryString(params);
      return api.get(`${API_ENDPOINTS.ordersCount}${queryString ? `?${queryString}` : ''}`);
    }
  },
  
  // Wishlist services
  wishlist: {
    get: (params = {}) => {
      const queryString = apiUtils.buildQueryString(params);
      return api.get(`${API_ENDPOINTS.wishlist}${queryString ? `?${queryString}` : ''}`);
    },
    add: (productId) => api.post(API_ENDPOINTS.addToWishlist, { product_id: productId }),
    remove: (productId) => api.delete(`${API_ENDPOINTS.removeFromWishlist}/${productId}`)
  }
};

// ✅ Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🌐 API Configuration:', {
    baseURL: API_BASE_URL,
    timeout: api.defaults.timeout,
    environment: process.env.NODE_ENV
  });
}
