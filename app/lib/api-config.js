// ✅ Server + Client safe
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.keralasellers.in';

export const getApiUrl = (path) => {
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
