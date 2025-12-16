import axios from "axios"

// API Configuration
// Get API URL from environment variable
let API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/";

// Validation: Prevent frontend from calling itself
const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
if (API_BASE_URL.includes(currentOrigin) && currentOrigin !== '') {
  console.error('❌ ERROR: VITE_API_URL is set to frontend URL!', API_BASE_URL);
  console.error('Please set VITE_API_URL to your backend API URL (e.g., https://your-backend.onrender.com)');
  // Fallback to localhost for development
  if (import.meta.env.DEV) {
    API_BASE_URL = "http://localhost:5001/";
    console.warn('⚠️ Using fallback localhost backend URL:', API_BASE_URL);
  }
}

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
  responseType: 'json',
  responseEncoding: 'utf8',
});

// Request interceptor - Add auth token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
export { API_BASE_URL };
