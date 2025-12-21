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

  version?: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export default Employee;
