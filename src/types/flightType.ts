import type { Aircraft } from './aircraftType';
import type { Seat, AvailableSeats } from './seatType';
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
  departureTime: string; //Date time
  arrivalTime: string; //Date time
  seats?: Seat[];
  availableSeats?: AvailableSeats;
  prices?: typeof defaultPrices;
  date?: string; // Computed field for display
  departureTimeDisplay?: string; // Computed field for display
  arrivalTimeDisplay?: string; // Computed field for display
};

export type PriceSeatClassDto = {
  seatClass: string;
  price: number;
};

export type CreateFlightRequest = {
  routeId: number;
  aircraftId: number;
  status: FlightStatus;
  priceSeatClass: PriceSeatClassDto[];
  departureTime: string;
  arrivalTime: string;
};

export type UpdateFlightRequest = {
  status: FlightStatus;
};

import type { ApiResponse, PageResponse } from './commonType';

export type FlightsPageResponse = PageResponse<Flight>;
export type FlightResponse = ApiResponse<Flight>;


