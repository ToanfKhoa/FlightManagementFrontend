
export type UserRole = 'PASSENGER' | 'STAFF' | 'ADMIN' | 'CREW' | 'PILOT';

export interface User {
  id: string | number;     
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;   
  avatarUrl?: string;
  dateOfBirth?: string;  
  membershipTier?: 'ECONOMY' | 'BUSINESS' | 'FIRST'; 
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface LoginResponse {
  token: string;           
  refreshToken?: string;    
  type?: string;          
  user: User;              
}

export interface AuthState {
  user: User | null;       
  isAuthenticated: boolean; 
  isLoading: boolean;      
  error: string | null;  
}