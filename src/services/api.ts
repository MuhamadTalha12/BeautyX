import axios from 'axios';

let apiURL = import.meta.env.VITE_API_URL || '/api';
if (apiURL !== '/api' && !apiURL.endsWith('/api')) {
  apiURL = `${apiURL.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: apiURL,
  withCredentials: true,
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired access tokens automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 (Unauthorized) and has not been retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;
      
      try {
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        if (res.data.success) {
          const newToken = res.data.token;
          localStorage.setItem('token', newToken);
          
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed/expired -> clear local session and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
