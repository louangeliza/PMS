import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from '../utils/auth';
import { BaseDocument } from '../types';


// Safely get the API URL with fallback
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Transform MongoDB _id to id if present
    if (response.data && typeof response.data === 'object') {
      if (response.data._id) {
        response.data.id = response.data._id;
        delete response.data._id;
      }
      // Handle arrays of documents
      if (Array.isArray(response.data)) {
        response.data = response.data.map((item: BaseDocument & { _id?: string }) => {
          if (item._id) {
            item.id = item._id;
            delete item._id;
          }
          return item;
        });
      }
      // Handle paginated responses
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((item: BaseDocument & { _id?: string }) => {
          if (item._id) {
            item.id = item._id;
            delete item._id;
          }
          return item;
        });
      }
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    
    // Handle MongoDB-specific errors
    if (error.response?.data) {
      const errorData = error.response.data as any;
      if (errorData.code === 11000) {
        // Duplicate key error
        error.message = 'A record with this information already exists';
      } else if (errorData.name === 'ValidationError') {
        // Validation error
        error.message = Object.values(errorData.errors || {})
          .map((err: any) => err.message)
          .join(', ');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;