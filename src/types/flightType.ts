export type FlightStatus =
  | 'open'
  | 'full'
  | 'departed'
  | 'completed'
  | 'delayed'
  | 'canceled';

export type SeatClass = 'economy' | 'business' | 'first';

export type SeatStatus = 'available' | 'reserved' | 'booked';

export type Route = {
  id: number;
  origin: string;
  destination: string;
};

export type Aircraft = {
  id: number;
  registration_number: string;
  manufacturer: string;
  model: string;
  seat_capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
};

export type Flight = {
  id: number;
  route_id: number;
  aircraft_id: number;
  status: FlightStatus;
};

export type CreateFlightRequest = {
  route_id: number;
  aircraft_id: number;
};

export type UpdateFlightRequest = {
  status: FlightStatus;
};


