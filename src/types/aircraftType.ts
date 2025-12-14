export type AircraftStatus = 'active' | 'maintenance' | 'inactive';

export type Aircraft = {
  id: number;
  registration_number: string;
  manufacturer: string;
  model: string;
  manufacture_year: number;
  serial_number: string;
  seat_capacity: number;
  status: AircraftStatus;
};

export type CreateAircraftRequest = Omit<Aircraft, 'id'>;
