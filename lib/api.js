/**
 * lib/api.js — Centralized API configuration for Kerala Sellers Web
 *
 * USAGE:
 *   import { getApiBaseUrl, getAuthHeaders, API } from '@/lib/api';
 *
 *   const res = await fetch(API.products, { headers: getAuthHeaders() });
 *
 * All API calls in the app should use this file so the base URL
 * is changed in exactly ONE place.
 */

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------

export function getApiBaseUrl() {
  // Vercel / CI — set NEXT_PUBLIC_API_BASE_URL in the project dashboard
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  // Legacy env var name (keep for backward compat)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Safe default — always points to production
  return 'https://api.keralasellers.in';
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/**
 * Returns Authorization headers for the currently logged-in user.
 * Works for both seller (access_token) and buyer (buyerAccessToken).
 * Call this in every authenticated fetch.
 */
export function getAuthHeaders() {
  if (typeof window === 'undefined') return {}; // SSR safety

  // Standardised key names — prefer buyerAccessToken for buyers
  const token =
    localStorage.getItem('buyerAccessToken') ||
    localStorage.getItem('access_token');

  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function getSellerAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('access_token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Returns true if there is a buyer token in localStorage.
 */
export function isBuyerLoggedIn() {
  if (typeof window === 'undefined') return false;
  return !!(
    localStorage.getItem('buyerAccessToken') ||
    localStorage.getItem('access_token')
  );
}

// ---------------------------------------------------------------------------
// Endpoint map
// ─ All API routes in ONE place. Update here, works everywhere.
// ---------------------------------------------------------------------------

const BASE = getApiBaseUrl();

export const API = {
  // --- Auth ---
  sellerLogin:       `${BASE}/user/login/`,
  sellerRegister:    `${BASE}/user/register/`,
  buyerLogin:        `${BASE}/user/buyer/login/`,
  buyerRegister:     `${BASE}/user/buyer/register/`,
  buyerProfile:      `${BASE}/user/buyer/profile/`,
  sendOtp:           `${BASE}/user/send-otp/`,
  verifyOtp:         `${BASE}/user/verify-otp/`,
  googleAuth:        `${BASE}/user/google-auth/`,

  // --- Products ---
  products:          `${BASE}/api/products/`,
  product: (id)  => `${BASE}/api/products/${id}/`,
  categories:        `${BASE}/api/categories/`,

  // --- Shop ---
  shops:             `${BASE}/api/stores/`,
  shop: (phone) => `${BASE}/api/stores/${phone}/`,
  shopProducts: (phone) => `${BASE}/api/stores/${phone}/products/`,

  // --- Orders (CONSISTENT: always /user/orders/) ---
  createOrder:            `${BASE}/user/orders/create-order/`,
  verifyPaymentAndCreate: `${BASE}/user/orders/verify-payment-and-create-order/`,
  buyerOrders:            `${BASE}/user/orders/`,
  buyerOrder: (id)    => `${BASE}/user/orders/${id}/`,
  cancelOrder: (id)   => `${BASE}/user/orders/${id}/cancel/`,

  // --- Cart / Wishlist ---
  wishlistToggle:   `${BASE}/api/wishlist/toggle/`,
  wishlistCheck:    `${BASE}/api/wishlist/check/`,
  wishlist:         `${BASE}/api/wishlist/`,

  // --- Seller ---
  sellerDashboard:       `${BASE}/user/dashboard/`,
  sellerOrders:          `${BASE}/user/orders/seller-orders/`,
  sellerProducts:        `${BASE}/user/products/`,
  sellerProduct: (id) => `${BASE}/user/products/${id}/`,
  storeProfile:          `${BASE}/user/store/profile/`,

  // --- Payments ---
  razorpayConfig:    `${BASE}/api/payments/razorpay-config/`,
  gatewayStatus:     `${BASE}/api/payments/account/gateway_status/`,

  // --- Subscriptions ---
  subscriptionPlans:    `${BASE}/api/subscriptions/plans/`,
  currentSubscription:  `${BASE}/api/subscriptions/current/`,
  createSubOrder:       `${BASE}/api/subscriptions/create-order/`,
  verifySubPayment:     `${BASE}/api/subscriptions/verify-payment/`,
};

// ---------------------------------------------------------------------------
// Convenience fetch wrapper
// ---------------------------------------------------------------------------

/**
 * apiGet(url, options)
 * Wraps fetch with auth headers and JSON parsing.
 * Throws on non-OK responses.
 */
export async function apiGet(url, options = {}) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost(url, body, options = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...options.headers },
    body: JSON.stringify(body),
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export default API;
