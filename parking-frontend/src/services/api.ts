// src/services/api.ts
import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from '../utils/auth';
import { BaseDocument } from '../types';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      if (response.data._id) {
        response.data.id = response.data._id;
        delete response.data._id;
      }
      if (Array.isArray(response.data)) {
        response.data = response.data.map((item: BaseDocument & { _id?: string }) => {
          if (item._id) {
            item.id = item._id;
            delete item._id;
          }
          return item;
        });
      }
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
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    if (error.response?.data) {
      const errorData = error.response.data as any;
      if (errorData.code === 11000) {
        error.message = 'A record with this information already exists';
      } else if (errorData.name === 'ValidationError') {
        error.message = Object.values(errorData.errors || {})
          .map((err: any) => err.message)
          .join(', ');
      }
    }
    return Promise.reject(error);
  },
);
