import type { Aircraft } from './aircraftType';
import type { Seat } from './seatType';
import type { BaseEntity } from './commonType';

export type FlightStatus = 'OPEN' | 'FULL' | 'DEPARTED' | 'COMPLETED' | 'DELAYED' | 'CANCELED';

export type Route = BaseEntity & {
  origin: string;
  destination: string;
  external: boolean;
};

export const defaultPrices = {
  economy: 1500000,
  business: 2500000,
  first: 4000000
};

export type Flight = BaseEntity & {
  priceSeatClass?: FlightSeat[];
  flightSeats: FlightSeatResponse[];
  seatSummary: SeatSummary[];
  route: Route;
  aircraft: Aircraft;
  status: FlightStatus;
  departureTime: string; //Date time
  arrivalTime: string; //Date time
  departureTimeDisplay?: string; // Computed field for display
  arrivalTimeDisplay?: string; // Computed field for display
};

export type FlightSeat = {
  seatClass: string;
  price: number;
};

export type FlightSeatResponse = {
  id: number;
  seatClass: string;
  price: number;
  createdAt: string;
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'BLOCKED ';
};

export type SeatSummary = {
  seatClass: string;
  availableSeats: number;
};

export type CreateFlightRequest = {
  routeId: number;
  aircraftId: number;
  status: FlightStatus;
  priceSeatClass: FlightSeat[];
  departureTime: string;
  arrivalTime: string;
};

export type CreateRouteRequest = {
  origin: string;
  destination: string;
  external: boolean;
};

export type UpdateFlightRequest = {
  status: FlightStatus;
};

import type { ApiResponse, PageResponse } from './commonType';
import Employee from './employeeType';

export type FlightsPageResponse = PageResponse<Flight>;
export type FlightResponse = ApiResponse<Flight>;


