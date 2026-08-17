import axios from 'axios';

import { getApiBaseUrl } from './api-config';
import {
  buyerStorefrontMessage,
  isPublishLocked,
  shouldShowRazorpayBanner,
} from './storefront-rules.cjs';

export { buyerStorefrontMessage, isPublishLocked, shouldShowRazorpayBanner };

export const STOREFRONT_STATUS_URL = `${getApiBaseUrl()}/user/seller/onboarding/status/`;
export const STOREFRONT_SETTINGS_URL = `${getApiBaseUrl()}/user/seller/onboarding/storefront/`;

export const BANNER_DISMISS_KEY = 'ks-storefront-banner-dismissed';

export function authHeaders() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken')
    || localStorage.getItem('access_token')
    || localStorage.getItem('buyerAccessToken');
  if (!token || token === 'null' || token === 'undefined') return null;
  return { Authorization: `Bearer ${token}` };
}

export async function fetchStorefrontStatus() {
  const headers = authHeaders();
  if (!headers) return null;
  const response = await axios.get(STOREFRONT_STATUS_URL, { headers, timeout: 12000 });
  return response.data;
}

export async function patchStorefrontSettings(payload) {
  const headers = authHeaders();
  if (!headers) {
    throw new Error('Not signed in');
  }
  const response = await axios.patch(STOREFRONT_SETTINGS_URL, payload, {
    headers,
    timeout: 12000,
  });
  return response.data;
}
