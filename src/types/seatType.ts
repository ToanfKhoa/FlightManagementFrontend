// types/seat/seat.type.ts
export type SeatClass = 'economy' | 'business' | 'first';
export type SeatStatus = 'available' | 'reserved' | 'booked';

export type SeatEntity = {
  id: number;
  flight_id: number;
  seat_number: string;
  class: SeatClass;
  status: SeatStatus;
};

export type CreateSeatRequest = {
  flight_id: number;
  seat_number: string;
  class: SeatClass;
};

export type UpdateSeatRequest = {
  status: SeatStatus;
};
