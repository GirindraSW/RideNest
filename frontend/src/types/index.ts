// src/types/index.ts

export type Role = "USER" | "PROVIDER" | "ADMIN";

export type VehicleCategory = "MOTOR" | "MOBIL" | "TRAVEL" | "BUS";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface Provider {
  id: string;
  userId: string;
  companyName: string;
  description?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  isVerified: boolean;
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  category: VehicleCategory;
  vehicleType: string;
  pricePerDay: number;
  minDuration: number;
  maxDuration?: number;
  withDriver: boolean;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface ServiceSchedule {
  id?: string;
  serviceId?: string;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

export interface ServiceBlockedDate {
  id: string;
  serviceId: string;
  date: string;
  note?: string;
  createdAt?: string;
}

export interface ScheduleResponse {
  schedule: ServiceSchedule;
  blockedDates: ServiceBlockedDate[];
  service: Service;
}

export interface AuthResponse {
  token: string;
  user: User;
}