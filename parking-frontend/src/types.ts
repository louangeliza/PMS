// src/types.ts
export interface Vehicle {
  id: number;
  plate_number: string;
  vehicle_type: string;
  size: 'small' | 'medium' | 'large';
  attributes?: {
    color?: string;
  };
}

export interface Request {
  id: number;
  vehicle_id: number;
  vehicle: Vehicle; // Embedded vehicle info
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export type VehicleStatus = 'available' | 'pending' | 'rejected';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}