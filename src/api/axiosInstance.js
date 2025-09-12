/* eslint-disable */
import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:3000/api', // Your backend API URL
  baseURL: 'https://wealth-and-equity-glk4i.ondigitalocean.app/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Request with token:', config.url, 'Token:', token.substring(0, 20) + '...');
    } else {
      console.warn('No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized request. Token may be invalid or expired.');
      // Optionally redirect to login or clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
