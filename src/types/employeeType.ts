import { RegisterRequest } from "./authType"

export type EmployeePosition =
  | 'PILOT'
  | 'COPILOT'
  | 'ATTENDANT'
  | 'OPERATOR'
  | 'TICKETING'
  | 'OTHER';

export interface Employee {
  id: number;
  fullName: string;
  position: EmployeePosition;
  workExperience: string;
  totalFlightHours: number;
  maxFlightHoursPerMonth: number;
  assignments: string[];

  version?: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RegisterEmployee {
  accountRequest: RegisterRequest;
  fullName: string,
  position: EmployeePosition,
  workExperience: string,
  totalFlightHours: number;
}

export default Employee;
