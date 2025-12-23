import type { Aircraft } from './aircraftType';
import type { Seat, AvailableSeats } from './seatType';
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
export type CreateFlightRequest = {
  routeId: number;
  aircraftId: number;
  status: FlightStatus;
};

export type UpdateFlightRequest = {
  status: FlightStatus;
};

import type { ApiResponse, PageResponse } from './commonType';

export type FlightsPageResponse = PageResponse<Flight>;


