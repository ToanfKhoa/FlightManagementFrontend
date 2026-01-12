

import type { ApiResponse, PageResponse } from './commonType';
import Employee from './employeeType';
import Passenger from './passengerType';

//export type UserRole = 'PASSENGER' | 'EMPLOYEE' | 'ADMIN';
export type UserRole = "passenger" | "staff" | "admin" | "crew";

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: string;

  version?: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
  employee: Employee
  passenger: Passenger
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type UsersPageResponse = PageResponse<User>;