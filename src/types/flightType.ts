import type { Aircraft } from './aircraftType';
import type { Seat, AvailableSeats } from './seatType';
import type { Schedule } from './scheduleType';
import type { BaseEntity } from './commonType';

export type FlightStatus = 'OPEN' | 'FULL' | 'DEPARTED' | 'COMPLETED' | 'DELAYED' | 'CANCELED';

export type Route = BaseEntity & {
  origin: string;
  destination: string;
};

export const defaultPrices = {
  economy: 1500000,
  business: 2500000,
  first: 4000000
};

export type Flight = BaseEntity & {
  route: Route;
  aircraft: Aircraft;
  status: FlightStatus;
  schedule: Schedule;
  date?: string; // ISO date derived from schedule.departureTime
  departureTime?: string; // formatted time "HH:mm"
  arrivalTime?: string; // formatted time "HH:mm"
  seats?: Seat[];
  availableSeats?: AvailableSeats;
  prices?: typeof defaultPrices;
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


