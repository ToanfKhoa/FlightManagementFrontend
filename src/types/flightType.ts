import type { Aircraft } from './aircraftType';
import type { Seat, AvailableSeats} from './seatType';
import type { Schedule } from './scheduleType';

export type FlightStatus = 'OPEN' | 'FULL' | 'DEPARTED' | 'COMPLETED' | 'DELAYED' | 'CANCELED';

export type BaseEntity = {
  id: number;
  version: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};

export type Route = BaseEntity & {
  origin: string;
  destination: string;
};


export type Flight = BaseEntity & {
  route: Route;
  aircraft: Aircraft;
  status: FlightStatus;
  schedule?: Schedule | null;
  date?: string; // ISO date derived from schedule.departureTime
  departureTime?: string; // formatted time "08:30"
  arrivalTime?: string; // formatted time "11:15"
  seats?: Seat[];
  availableSeats?: AvailableSeats;
};

export type ApiErrors = Record<string, string>;

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  errors?: ApiErrors;
  timestamp?: string; // ISO timestamp
};

export type CreateFlightRequest = {
  route_id: number;
  aircraft_id: number;
  status: FlightStatus;
};

export type UpdateFlightRequest = {
  status: FlightStatus;
};



