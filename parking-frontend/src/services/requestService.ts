// src/services/requestService.ts
import { axiosInstance } from './api';
import { Request } from '../types';

interface PaginatedResponse {
  data: Request[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export const getRequests = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse> => {
  const response = await axiosInstance.get('/requests', {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
    },
  });
  return response.data;
};

export const createRequest = async (
  requestData: Omit<Request, 'id' | 'created_at' | 'updated_at' | 'vehicle'>,
): Promise<Request> => {
  const response = await axiosInstance.post('/requests', requestData);
  return response.data;
};

export const updateRequestStatus = async (
  id: string, // Changed from number to string to match BaseDocument.id
  status: 'approved' | 'rejected',
): Promise<Request> => {
  const response = await axiosInstance.patch(`/requests/${id}/status`, { status });
  return response.data;
};
