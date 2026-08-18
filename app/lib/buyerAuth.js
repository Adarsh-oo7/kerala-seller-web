function tokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Boolean(payload.exp && payload.exp * 1000 < Date.now() + 5000);
  } catch {
    return true;
  }
}

export function getBuyerAuthHeaders() {
  if (typeof window === 'undefined') return null;
  const buyerToken = localStorage.getItem('buyerAccessToken') || localStorage.getItem('buyerToken');
  if (buyerToken && !tokenExpired(buyerToken)) {
    return { Authorization: `Bearer ${buyerToken}` };
  }
  const sellerSession = localStorage.getItem('accessToken') || localStorage.getItem('sellerInfo');
  if (sellerSession) return null;
  const token = localStorage.getItem('access_token');
  if (token && !tokenExpired(token)) {
    return { Authorization: `Bearer ${token}` };
  }
  return null;
}

export function isBuyerLoggedIn() {
  return Boolean(getBuyerAuthHeaders());
}
