import { Aircraft } from "./aircraftType";

// types/seat/seat.type.ts
export type SeatClass = 'BUSINESS' | 'FIRST_CLASS' | 'ECONOMY';
export type LayoutType =
  | "ECONOMY_3_3"
  | "BUSINESS_2_2"
  | "WIDE_2_4_2"
  | "SMALL_1_2";

export type Seat = {
  id: number;
  aircraft?: Aircraft;
  seatNumber: string;
  seatClass: SeatClass;
};

export type CreateSeatRequest = {
  aircraftId: number;
  seatNumber: string;
  seatClass: SeatClass;
};

export type UpdateSeatRequest = {
  aircraftId: number;
  seatNumber: string;
  seatClass: SeatClass;
};

export interface ClassSeatRequest {
  fromRow: number;
  toRow: number;
  layoutType: LayoutType;
  excludedRows: number[];
}

export type ClassSeatRequests = Record<SeatClass, ClassSeatRequest>;

export type CreateSeatsRequest = {
  aircraftId: number;
  classSeatRequests: ClassSeatRequests;
}
