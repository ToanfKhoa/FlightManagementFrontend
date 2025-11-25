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
export const mockPassengers: Passenger[] = [
  // Demo passenger for login/register test
  {
    id: "demo-passenger",
    passenger_code: "HKDEMO001",
    full_name: "Nguyễn Văn Passenger",
    date_of_birth: "1990-01-01",
    nationality: "Việt Nam",
    id_number: "0012345678",
    address: "Hanoi, Vietnam",
    phone: "0912345678",
    email: "passenger@example.com",
    tier: "economy",
  },
];

// Stores demo user accounts. Passwords are encoded using btoa for demo only.
export const mockUserAccounts: UserAccount[] = [
  {
    id: "Udemo-passenger",
    username: "demo-passenger",
    password_hash: btoa("password"), // demo password = "password"
    email: "passenger@example.com",
    phone: "0912345678",
    role: "passenger",
    passenger_id: "demo-passenger",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "Udemo-staff",
    username: "demo-staff",
    password_hash: btoa("password"),
    email: "staff@example.com",
    phone: "0912345679",
    role: "employee",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "Udemo-admin",
    username: "demo-admin",
    password_hash: btoa("password"),
    email: "admin@example.com",
    phone: "0912345680",
    role: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
