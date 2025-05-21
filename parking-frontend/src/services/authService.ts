// src/services/authService.ts
import { axiosInstance } from './api';
import { User } from '../types'; // Import User type
import axios, { AxiosError } from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstname: string;
  lastname:string;
  email: string;
  password: string;
  role?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

// Update your login function in authService.ts
export const login = async (credentials: { email: string; password: string }) => {
  const response = await axiosInstance.post('/users/login', credentials);
  
  // Debug: Log the full response
  console.log('Backend response:', response.data);
  
  return response.data; // Ensure this matches what your backend sends
};

export const register = async (userData: RegisterData) => {
  try {
    const response = await axiosInstance.post('/users/register', userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error('Registration endpoint not found. Please check if the backend server is running.');
      }
      throw new Error(axiosError.message || 'Registration failed. Please try again.');
    }
    throw error;
  }
};

export const getProfile = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error('Profile endpoint not found. Please check if the backend server is running.');
      }
      throw new Error(axiosError.message || 'Failed to fetch profile. Please try again.');
    }
    throw error;
  }
};

export const updateProfile = async (data: { firstname: string;lastname:string; email: string }): Promise<User> => {
  try {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error('Profile update endpoint not found. Please check if the backend server is running.');
      }
      throw new Error(axiosError.message || 'Failed to update profile. Please try again.');
    }
    throw error;
  }
};
