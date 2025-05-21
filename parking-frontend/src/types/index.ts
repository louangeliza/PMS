export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: 'admin' | 'client';
  created_at: string;
}

export interface ParkingLot {
  id: string;
  code: string;
  name: string;
  spaces: number;
  location: string;
  feePerHour: number;
  created_at: string;
}

export interface CarEntry {
  id: string;
  plateNo: string;
  parkingLotId: string;
  userId: string;
  entryTime: string;
  exitTime?: string;
  charge: number;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role?: 'admin' | 'client';
}

export interface ProfileUpdateData {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
}

export interface CreateCarEntryData {
  plateNo: string;
  parkingCode: string;
  entryTime: string;
}

export interface CreateParkingLotData {
  code: string;
  name: string;
  spaces: number;
  location: string;
  feePerHour: number;
} 