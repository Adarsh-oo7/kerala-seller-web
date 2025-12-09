// ✅ Server + Client safe
export const API_BASE_URL = 'https://api.keralasellers.in' || 'https://api.keralasellers.in';

export const getApiUrl = (path) => {
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
