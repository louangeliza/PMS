// src/services/vehicleService.ts
import { axiosInstance } from './api';
import { Vehicle, CreateVehicleDTO, PaginatedResponse } from '../types';

export const createVehicle = async (vehicle: CreateVehicleDTO): Promise<Vehicle> => {
  const response = await axiosInstance.post<Vehicle>('/vehicles', vehicle);
  return response.data;
};

export const getVehicles = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<PaginatedResponse<Vehicle>> => {
  const response = await axiosInstance.get<PaginatedResponse<Vehicle>>('/vehicles', {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search || '',
      status: params?.status || '',
    },
  });
  return response.data;
};

export const getVehicle = async (id: string): Promise<Vehicle> => {
  const response = await axiosInstance.get<Vehicle>(`/vehicles/${id}`);
  return response.data;
};

export const updateVehicle = async (id: string, vehicleData: Partial<CreateVehicleDTO>): Promise<Vehicle> => {
  const response = await axiosInstance.patch<Vehicle>(`/vehicles/${id}`, vehicleData);
  return response.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/vehicles/${id}`);
};

export const approveVehicle = async (id: string): Promise<Vehicle> => {
  const response = await axiosInstance.patch<Vehicle>(`/vehicles/${id}/approve`);
  return response.data;
};

export const rejectVehicle = async (id: string): Promise<Vehicle> => {
  const response = await axiosInstance.patch<Vehicle>(`/vehicles/${id}/reject`);
  return response.data;
};
