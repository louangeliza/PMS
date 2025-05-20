// src/types.ts
export interface BaseDocument {
  id: string;  // MongoDB ObjectId as string
  created_at: string;
  updated_at: string;
}

export type VehicleStatus = 'available' | 'pending' | 'rejected';

export interface Vehicle extends BaseDocument {
  plate_number: string;
  model: string;
  color: string;
  owner_id: string;
  vehicle_type: string;
  size: 'small' | 'medium' | 'large';
  attributes?: {
    color?: string;
  };
}
// src/types.ts
export interface CreateVehicleDTO {
  plate_number: string;
  vehicle_type: string;
  size: 'small' | 'medium' | 'large';
  color?: string;
}

export interface Request extends BaseDocument {
  vehicle_id: string;
  vehicle: Vehicle;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected';
  special_requests?: string;
}

export interface User extends BaseDocument {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}
