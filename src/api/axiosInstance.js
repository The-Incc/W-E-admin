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
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
