// ✅ Server + Client safe
// export const API_BASE_URL = 'https://api.keralasellers.in' || 'https://api.keralasellers.in';

// export const getApiUrl = (path) => {
//   return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
// };

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? 'https://api.keralasellers.in' : 'http://localhost:8000/api');

export const getApiUrl = (path) => {
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

console.log('🔧 API Utils:', API_BASE_URL);
