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

export interface PublicService extends Service {
  provider: {
    companyName: string;
    description?: string;
    address?: string;
    phone?: string;
    logoUrl?: string;
    isVerified: boolean;
  };
}

export interface BookingRange {
  startDate: string;
  endDate: string;
}

export interface ServiceDetailResponse {
  service: PublicService;
  schedule: ServiceSchedule;
  blockedDates: ServiceBlockedDate[];
  existingBookings: BookingRange[];
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "DONE";

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  service?: {
    title: string;
    vehicleType: string;
    category: VehicleCategory;
    pricePerDay: number;
    imageUrl?: string;
    provider?: { companyName: string; isVerified: boolean };
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}