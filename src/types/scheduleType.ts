export type Schedule = {
  id: number;
  flightId: number;
  departureTime: string; // ISO datetime
  arrivalTime?: string; // ISO datetime
  durationMinutes?: number;
  origin?: string;
  destination?: string;
};