// Data types matching the database schema

export interface Passenger {
  id: string;
  passenger_code: string;
  full_name: string;
  date_of_birth: string;
  nationality: string;
  id_number: string;
  address: string;
  phone: string;
  email: string;
  tier: "economy" | "business" | "first";
}

export interface UserAccount {
  id: string;
  username: string;
  password_hash: string;
  email: string;
  phone: string;
  role: "admin" | "employee" | "passenger";
  passenger_id?: string;
  employee_id?: string;
  created_at: string;
  updated_at: string;
}

// Mock storage for registered users
export const mockPassengers: Passenger[] = [];
export const mockUserAccounts: UserAccount[] = [];
