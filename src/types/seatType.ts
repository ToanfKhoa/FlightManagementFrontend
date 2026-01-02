// types/seat/seat.type.ts
export type SeatClass = 'BUSINESS' | 'FIRST_CLASS' | 'ECONOMY';
export type SeatStatus = 'available' | 'reserved' | 'booked';

export type Seat = {
  id: number;
  flightId: number;
  seatNumber: string;
  class: SeatClass;
  status: SeatStatus;
};

export type AvailableSeats = {
  economy: number;
  business: number;
  first: number;
};

export type CreateSeatRequest = {
  flightId: number;
  seatNumber: string;
  class: SeatClass;
};

export type UpdateSeatRequest = {
  status: SeatStatus;
};
