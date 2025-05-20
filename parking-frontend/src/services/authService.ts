// src/services/authService.ts
import { axiosInstance } from './api';
import { User } from '../types'; // Import User type
import axios, { AxiosError } from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error('Login endpoint not found. Please check if the backend server is running.');
      }
      if (axiosError.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(axiosError.message || 'Login failed. Please try again.');
    }
    throw error;
  }
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

export const updateProfile = async (data: { name: string; email: string }): Promise<User> => {
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
