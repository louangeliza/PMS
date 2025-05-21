// src/services/parkingService.ts
import axios from 'axios';
import { Parking, ParkingEntry, ParkingBill, CreateParkingEntryDTO, CreateParkingDTO, PaginatedResponse } from '../types';

const API_URL = 'http://your-backend-api'; // Replace with your backend API URL

export const getActiveEntries = async (): Promise<ParkingEntry[]> => {
  const response = await axios.get(`${API_URL}/parking-entries?status=active`);
  return response.data;
};

export const getParkingEntry = async (entryId: number): Promise<ParkingEntry> => {
  const response = await axios.get(`${API_URL}/parking-entries/${entryId}`);
  return response.data;
};

export const completeParkingEntry = async (entryId: number): Promise<ParkingBill> => {
  const response = await axios.post(`${API_URL}/parking-entries/${entryId}/complete`);
  return response.data;
};

export const getParkings = async (params?: { search?: string; limit?: number }): Promise<PaginatedResponse<Parking>> => {
  const response = await axios.get(`${API_URL}/parkings`, { params });
  return response.data;
};

export const getParkingEntries = async (params?: { status?: 'active' | 'completed'; limit?: number }): Promise<ParkingEntry[]> => {
  const response = await axios.get(`${API_URL}/parking-entries`, { params });
  return response.data;
};

export const getParkingBills = async (params?: { limit?: number }): Promise<ParkingBill[]> => {
  const response = await axios.get(`${API_URL}/bills`, { params });
  return response.data;
};

export const createParkingEntry = async (data: CreateParkingEntryDTO): Promise<void> => {
  await axios.post(`${API_URL}/parking-entries`, data);
};

export const createParking = async (data: CreateParkingDTO): Promise<void> => {
  await axios.post(`${API_URL}/parkings`, data);
};