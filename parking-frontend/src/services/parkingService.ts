import { api } from './api';
import { 
  Parking, 
  ParkingEntry, 
  ParkingTicket, 
  ParkingBill,
  CreateParkingDTO,
  CreateParkingEntryDTO,
  PaginatedResponse 
} from '../types';

// Admin Services
export const createParking = async (data: CreateParkingDTO): Promise<Parking> => {
  const response = await api.post('/parkings', data);
  return response.data;
};

export const getParkings = async (): Promise<Parking[]> => {
  const response = await api.get('/parkings');
  return response.data;
};

export const getParking = async (code: string): Promise<Parking> => {
  const response = await api.get<Parking>(`/parking/${code}`);
  return response.data;
};

export const updateParking = async (code: string, parkingData: Partial<CreateParkingDTO>): Promise<Parking> => {
  const response = await api.patch<Parking>(`/parking/${code}`, parkingData);
  return response.data;
};

export const deleteParking = async (code: string): Promise<void> => {
  await api.delete(`/parking/${code}`);
};

// Entry Services
export const getActiveEntries = async (): Promise<ParkingEntry[]> => {
  const response = await api.get('/parking-entries/active');
  return response.data;
};

export const createParkingEntry = async (data: CreateParkingEntryDTO): Promise<ParkingEntry> => {
  const response = await api.post('/parking-entries', data);
  return response.data;
};

export const getParkingEntry = async (id: number): Promise<ParkingEntry> => {
  const response = await api.get(`/parking-entries/${id}`);
  return response.data;
};

export const completeParkingEntry = async (id: number): Promise<ParkingBill> => {
  const response = await api.post(`/parking-entries/${id}/complete`);
  return response.data;
};

export const getParkingEntries = async (params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'completed';
}): Promise<PaginatedResponse<ParkingEntry>> => {
  const response = await api.get<PaginatedResponse<ParkingEntry>>('/parking/entries', {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      startDate: params?.startDate,
      endDate: params?.endDate,
      status: params?.status,
    },
  });
  return response.data;
};

export const getParkingBills = async (params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedResponse<ParkingBill>> => {
  const response = await api.get<PaginatedResponse<ParkingBill>>('/parking/bills', {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      startDate: params?.startDate,
      endDate: params?.endDate,
    },
  });
  return response.data;
}; 