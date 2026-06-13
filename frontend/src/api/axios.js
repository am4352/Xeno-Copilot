import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('xeno_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Remove default application/json header for FormData to let browser set boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('xeno_token');
      localStorage.removeItem('xeno_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
