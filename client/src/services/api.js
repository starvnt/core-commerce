import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('starvnt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Auto-logout on 401
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/signup')) {
        localStorage.removeItem('starvnt_token');
        localStorage.removeItem('starvnt_user');
        // Don't hard-redirect if on landing pages; the App will handle it
        window.dispatchEvent(new Event('starvnt:auth-changed'));
      }
    }
    const message =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      'Request failed';
    return Promise.reject(new Error(message));
  },
);

export default api;
