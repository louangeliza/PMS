// src/services/vehicleService.ts
import { axiosInstance } from './api';
import { Vehicle, CreateVehicleDTO } from '../types';

interface PaginatedResponse {
  data: Vehicle[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export const createVehicle = async (vehicle: CreateVehicleDTO): Promise<Vehicle> => {
  const response = await axiosInstance.post<Vehicle>('/vehicles', vehicle);
  return response.data;
};

export const getVehicles = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse> => {
  const response = await axiosInstance.get<PaginatedResponse>('/vehicles', {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search || '',
    },
  });
  return response.data;
};

export const getVehicle = async (id: string): Promise<Vehicle> => {
  const response = await axiosInstance.get<Vehicle>(`/vehicles/${id}`);
  return response.data;
};

export const updateVehicle = async (id: string, vehicleData: Partial<CreateVehicleDTO>): Promise<Vehicle> => {
  const response = await axiosInstance.put<Vehicle>(`/vehicles/${id}`, vehicleData);
  return response.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/vehicles/${id}`);
};
