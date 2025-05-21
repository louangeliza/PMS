// src/services/parkingService.ts
import { axiosInstance } from './api';
import { Parking, ParkingEntry, ParkingBill, CreateParkingEntryDTO, CreateParkingDTO, PaginatedResponse } from '../types';

export const getActiveEntries = async (): Promise<ParkingEntry[]> => {
  const response = await axiosInstance.get('/entries/active');
  return response.data;
};

export const getParkingEntry = async (entryId: number): Promise<ParkingEntry> => {
  const response = await axiosInstance.get(`/entries/${entryId}`);
  return response.data;
};

export const completeParkingEntry = async (entryId: number): Promise<ParkingBill> => {
  const response = await axiosInstance.post(`/entries/${entryId}/complete`);
  return response.data;
};

export const getParkings = async (params?: { search?: string; limit?: number }): Promise<PaginatedResponse<Parking>> => {
  const response = await axiosInstance.get('/parking', { params });
  return response.data;
};

export const getParkingEntries = async (params?: { status?: 'active' | 'completed'; limit?: number }): Promise<ParkingEntry[]> => {
  const response = await axiosInstance.get('/entries', { params });
  return response.data;
};

export const getParkingBills = async (params?: { limit?: number }): Promise<ParkingBill[]> => {
  const response = await axiosInstance.get('/bills', { params });
  return response.data;
};

export const createParkingEntry = async (data: CreateParkingEntryDTO): Promise<void> => {
  await axiosInstance.post('/entries', data);
};

export const createParking = async (data: CreateParkingDTO): Promise<void> => {
  await axiosInstance.post('/parking', data);
};