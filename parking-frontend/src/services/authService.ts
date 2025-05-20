// src/services/authService.ts
import { axiosInstance } from './api';
import { User } from '../types'; // Import User type

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

export const login = async (credentials: LoginCredentials) => {
  const response = await axiosInstance.post('/users/login', credentials);
  return response.data;
};

export const register = async (userData: RegisterData) => {
  const response = await axiosInstance.post('/users/register', userData);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await axiosInstance.get('/users/profile');
  return response.data;
};

export const updateProfile = async (data: { name: string; email: string }): Promise<User> => {
  const response = await axiosInstance.put('/users/profile', data);
  return response.data;
};
