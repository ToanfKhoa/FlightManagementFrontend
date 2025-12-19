
export type UserRole = 'PASSENGER' | 'STAFF' | 'ADMIN' | 'CREW' | 'PILOT';

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

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  errors: any | null;
  timestamp: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;   
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface AuthState {
  user: User | null;       
  isAuthenticated: boolean; 
  isLoading: boolean;      
  error: string | null;  
}

export interface PageResponse<T> {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  content: T[];
}

export type UsersPageResponse = PageResponse<User>;