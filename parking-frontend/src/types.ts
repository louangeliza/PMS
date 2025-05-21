// src/types.ts
export interface BaseDocument {
  id: string; // MongoDB ObjectId as string
  created_at: string;
  updated_at: string;
}

export interface Parking extends BaseDocument {
  code: string;
  name: string;
  total_spaces: number;
  available_spaces: number;
  location: string;
  charge_per_hour: number;
}

export interface ParkingEntry {
  id: number;
  plate_number: string;
  parking_code: string;
  entry_date_time: string;
  exit_date_time: string | null;
  charged_amount: number;
  status: 'active' | 'completed';
}

export interface ParkingBill {
  id: number;
  entry_id: string;
  ticket_number: string;
  entry_date_time: string;
  exit_date_time: string;
  plate_number: string;
  parking_name: string;
  duration_hours: number;
  total_amount: number;
}

export interface ParkingTicket extends BaseDocument {
  entry_id: string;
  ticket_number: string;
  entry_date_time: string;
  plate_number: string;
  parking_name: string;
}

export interface CreateParkingEntryDTO {
  parking_code: string;
  plate_number: string;
}

export interface CreateParkingDTO {
  code: string;
  name: string;
  total_spaces: number;
  location: string;
  charge_per_hour: number;
}

export type UserRole = 'admin' | 'client';
export type VehicleStatus = 'pending' | 'approved' | 'rejected';

export interface Vehicle extends BaseDocument {
  plate_number: string;
  model: string;
  color: string;
  owner_id: string;
  vehicle_type: string;
  size: 'small' | 'medium' | 'large';
  status: VehicleStatus;
  attributes?: {
    color?: string;
  };
}

export interface CreateVehicleDTO {
  plate_number: string;
  vehicle_type: string;
  size: 'small' | 'medium' | 'large';
  color?: string;
  model?: string;
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
  firstname: string;
  lastname:string;
  email: string;
  role: UserRole;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}