// src/services/vehicleService.ts
import api from './api';
import { Vehicle } from '../types';

interface PaginatedResponse {
  data: Vehicle[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export const getVehicles = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse> => {
  const response = await api.get('/vehicles', {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search || '',
    },
  });
  return response.data;
};



export const createVehicle = async (vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};



export const deleteVehicle = async (id: number): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};
// src/services/vehicleService.ts
export const getVehicle = async (id: string): Promise<Vehicle> => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data; // Assuming your API returns the vehicle directly in data
};

export const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data; // Assuming your API returns the updated vehicle directly in data
};