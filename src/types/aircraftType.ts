export type AircraftStatus = 'active' | 'maintenance' | 'inactive';

export type Aircraft = {
  id: number;
  type: string;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  manufactureYear: number;
  serialNumber: string;
  seatCapacity: number;
  status: AircraftStatus;
};

export type CreateAircraftRequest = Omit<Aircraft, 'id'>;

export type AircraftSummary = {
  id: number;
  registrationNumber: string;
  model: string;
};

export type AircraftOption = {
  id: number;
  label: string; 
  disabled: boolean; 
};

export type AircraftUI = {
  id: number;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  seatCapacity: number;
  status: 'active' | 'maintenance' | 'inactive';
};

