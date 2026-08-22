import axios from 'axios';

// In development, Vite proxies /api/* to http://localhost:5000 (see vite.config.js).
// In production, set VITE_API_URL to the deployed backend URL.
const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,  // send cookies for cookie-based auth as well
  headers: {
    'Content-Type': 'application/json',
  },
});

/* -------------------------------------------------------
   REQUEST INTERCEPTOR — attach JWT token
------------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dayflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------------------------------------
   RESPONSE INTERCEPTOR — handle 401
------------------------------------------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      localStorage.removeItem('dayflow_token');
      localStorage.removeItem('dayflow_user');
      window.dispatchEvent(new Event('dayflow:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
