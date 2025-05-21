// src/services/api.ts
import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from '../utils/auth';
import { BaseDocument, CreateParkingDTO } from '../types';

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

// User Authentication
export const login = async (email: string, password: string) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

// User Profile
export const getProfile = async () => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};

export const updateProfile = async (profileData: {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
}) => {
  const response = await axiosInstance.patch('/users/profile', profileData);
  return response.data;
};

// Car Entries
export const createCarEntry = async (data: { plateNo: string; parkingCode: string; entryTime: string }) => {
  try {
    console.log('Creating car entry with data:', data);
    const response = await axiosInstance.post('/entries', data);
    return response.data;
  } catch (error) {
    console.error('Error creating car entry:', error);
    throw error;
  }
};

export const completeCarEntry = async (entryId: string) => {
  const response = await axiosInstance.patch(`/entries/${entryId}/exit`);
  return response.data;
};

export const getActiveEntries = async () => {
  try {
    console.log('Making API call to get active entries...');
    const response = await axiosInstance.get('/entries/active');
    console.log('API Response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in getActiveEntries:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
    }
    throw error;
  }
};

export const getClientEntries = async () => {
  const response = await axiosInstance.get('/entries/my-entries');
  return response.data;
};

export const getEntriesByDateRange = async (startDate: string, endDate: string) => {
  const response = await axiosInstance.get('/entries/all', {
    params: { startDate, endDate }
  });
  return response.data;
};

// Parking Lots
export const createParkingLot = async (data: CreateParkingDTO) => {
  try {
    console.log('Creating parking lot with data:', data);
    const response = await axiosInstance.post('/parking', {
      ...data,
      available_spaces: data.total_spaces // Set available_spaces equal to total_spaces initially
    });
    return response.data;
  } catch (error) {
    console.error('Error creating parking lot:', error);
    throw error;
  }
};

export const getParkingLots = async () => {
  try {
    console.log('Making API call to get parking lots...');
    const response = await axiosInstance.get('/parking');
    console.log('API Response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in getParkingLots:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
    }
    throw error;
  }
};

export const getRecentBills = async () => {
  try {
    console.log('Making API call to get recent bills...');
    const response = await axiosInstance.get('/entries/outgoing', {
      params: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
        endDate: new Date().toISOString().split('T')[0]
      }
    });
    console.log('API Response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in getRecentBills:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
    }
    throw error;
  }
};
