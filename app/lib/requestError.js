export function isLikelyNetworkError(err) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  if (!err) return false;
  if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') return true;
  const message = String(err.message || '').toLowerCase();
  if (message.includes('network') || message.includes('timeout') || message.includes('failed to fetch')) {
    return true;
  }
  const data = err.response?.data;
  if (typeof data === 'string') {
    const start = data.trim().slice(0, 32).toLowerCase();
    if (start.startsWith('<!doctype') || start.startsWith('<html')) return true;
  }
  return false;
}

export function requestError(err, fallback) {
  if (isLikelyNetworkError(err)) {
    return 'Could not reach Kerala Sellers. Check your internet and try again.';
  }
  const data = err?.response?.data;
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
    if (typeof data.detail === 'string' && data.detail.trim()) return data.detail.trim();
    if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
    if (Array.isArray(data.phone) && data.phone[0]) return String(data.phone[0]);
    if (Array.isArray(data.password) && data.password[0]) return String(data.password[0]);
    const fieldParts = Object.entries(data)
      .filter(([, value]) => Array.isArray(value) || typeof value === 'string')
      .map(([key, value]) => {
        const text = Array.isArray(value) ? value.filter((item) => typeof item === 'string').join(' ') : String(value);
        if (!text.trim()) return '';
        if (['error', 'message', 'detail'].includes(key)) return text.trim();
        return `${key.replace(/_/g, ' ')}: ${text.trim()}`;
      })
      .filter(Boolean);
    if (fieldParts.length) return fieldParts.join(' ');
  }
  if (err?.response?.status === 401) return 'Wrong phone number or password.';
  if (err?.response?.status === 403) return 'This seller account is closed. Register a new shop or email keralasellers.in@gmail.com.';
  if (err?.response?.status === 404) return 'No seller shop exists for this phone. Register your shop first.';
  if (err?.response?.status === 429) return 'Too many attempts. Please wait 15 minutes and try again.';
  return fallback;
}
